$ErrorActionPreference = 'Stop'

Add-Type -TypeDefinition @'
using System;
using System.Runtime.InteropServices;

public static class AgentOsHarnessWindowAudit {
  [StructLayout(LayoutKind.Sequential)]
  public struct RECT { public int Left, Top, Right, Bottom; }

  [DllImport("user32.dll", CharSet = CharSet.Unicode)]
  public static extern IntPtr FindWindow(string className, string windowName);

  [DllImport("user32.dll")]
  public static extern bool IsWindowVisible(IntPtr window);

  [DllImport("user32.dll")]
  public static extern bool GetWindowRect(IntPtr window, out RECT rectangle);
}
'@

function Get-TreeFingerprint([string] $Path) {
  if (-not (Test-Path -LiteralPath $Path)) {
    return 'ABSENT'
  }

  $rows = @(
    Get-ChildItem -LiteralPath $Path -Force -Recurse -File -ErrorAction Stop |
      Sort-Object FullName |
      ForEach-Object {
        "$($_.FullName.Substring($Path.Length))|$($_.Length)|$($_.LastWriteTimeUtc.Ticks)"
      }
  )
  $bytes = [Text.Encoding]::UTF8.GetBytes(($rows -join "`n"))
  $sha256 = [Security.Cryptography.SHA256]::Create()
  try {
    $hash = $sha256.ComputeHash($bytes)
    return ([BitConverter]::ToString($hash)).Replace('-', '')
  }
  finally {
    $sha256.Dispose()
  }
}

function Get-HostSafetySnapshot {
  $taskbar = [AgentOsHarnessWindowAudit]::FindWindow('Shell_TrayWnd', $null)
  $rectangle = New-Object AgentOsHarnessWindowAudit+RECT
  $null = [AgentOsHarnessWindowAudit]::GetWindowRect($taskbar, [ref] $rectangle)

  $taskRows = @(
    Get-ScheduledTask -TaskPath '\Seelen\' -ErrorAction SilentlyContinue |
      Sort-Object TaskName |
      ForEach-Object {
        $xml = Export-ScheduledTask -TaskName $_.TaskName -TaskPath $_.TaskPath
        "$($_.TaskPath)$($_.TaskName)|$($_.State)|$xml"
      }
  )
  $runKey = Get-ItemProperty `
    -LiteralPath 'HKCU:\Software\Microsoft\Windows\CurrentVersion\Run' `
    -ErrorAction SilentlyContinue
  $runRows = @(
    $runKey.PSObject.Properties |
      Where-Object { $_.Name -match 'seelen|agent.?os' } |
      Sort-Object Name |
      ForEach-Object { "$($_.Name)=$($_.Value)" }
  )

  return [ordered] @{
    taskbar = "$taskbar|$([AgentOsHarnessWindowAudit]::IsWindowVisible($taskbar))|$($rectangle.Left),$($rectangle.Top),$($rectangle.Right),$($rectangle.Bottom)"
    processes = @(
      Get-Process -ErrorAction SilentlyContinue |
        Where-Object { $_.ProcessName -match '^(seelen-ui|slu-service)$' } |
        Sort-Object ProcessName, Id |
        ForEach-Object { "$($_.ProcessName)|$($_.Id)" }
    )
    services = @(
      Get-Service -ErrorAction SilentlyContinue |
        Where-Object { $_.Name -match 'seelen|agent.?os' -or $_.DisplayName -match 'seelen|agent.?os' } |
        Sort-Object Name |
        ForEach-Object { "$($_.Name)|$($_.Status)|$($_.StartType)" }
    )
    tasks = $taskRows
    run_keys = $runRows
    pipes = @(
      Get-ChildItem -LiteralPath '\\.\pipe\' -ErrorAction Stop |
        Where-Object { $_.Name -match 'seelen|agent-os' } |
        Sort-Object Name |
        ForEach-Object Name
    )
    production_roaming = Get-TreeFingerprint (Join-Path $env:APPDATA 'com.seelen.seelen-ui')
    production_local = Get-TreeFingerprint (Join-Path $env:LOCALAPPDATA 'com.seelen.seelen-ui')
    production_temp = Get-TreeFingerprint (Join-Path $env:TEMP 'com.seelen.seelen-ui')
  }
}

$before = Get-HostSafetySnapshot
$strictPreference = $ErrorActionPreference
$ErrorActionPreference = 'Continue'
$output = @(& npm run harness:smoke --silent 2>&1 | ForEach-Object { "$_" })
$runExitCode = $LASTEXITCODE
$ErrorActionPreference = $strictPreference
$after = Get-HostSafetySnapshot

$beforeJson = $before | ConvertTo-Json -Depth 8 -Compress
$afterJson = $after | ConvertTo-Json -Depth 8 -Compress
if ($runExitCode -ne 0) {
  throw "Harness smoke exited $runExitCode.`n$($output -join [Environment]::NewLine)"
}
if ($beforeJson -ne $afterJson) {
  throw "Harness changed protected host state.`nBefore: $beforeJson`nAfter: $afterJson"
}

$ready = @($output | Where-Object { $_ -like 'AGENT_OS_HARNESS_READY*' })
if (
  $ready.Count -ne 1 -or
  $ready[0] -notmatch 'title="Agent OS Shell Harness"' -or
  $ready[0] -notmatch 'visible=true' -or
  $ready[0] -notmatch 'identifier=com.agent-os.shell-harness' -or
  $ready[0] -notmatch 'guarded_effects=12'
) {
  throw "Harness readiness proof was missing or incomplete.`n$($output -join [Environment]::NewLine)"
}

[pscustomobject] @{
  result = 'pass'
  exit_code = $runExitCode
  ready = $ready[0]
  protected_host_state = $after
} | ConvertTo-Json -Depth 8
