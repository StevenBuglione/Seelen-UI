import assert from "node:assert/strict";
import { existsSync, readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import test from "node:test";

import { FixtureShellAdapter } from "../src/ports/shell-adapter.ts";
import { parseAosTrace } from "../src/replay/aostrace.ts";
import { DeterministicSource, FakeClock } from "../src/state/determinism.ts";
import { createFixtureScenario, fixtureCatalog } from "../src/state/fixtures.ts";
import { fixtureNames } from "../src/state/types.ts";

test("every required M02 fixture has a deterministic state and surface plan", () => {
  assert.equal(fixtureCatalog.length, 26);
  assert.deepEqual(
    fixtureCatalog.map((scenario) => scenario.state.fixture),
    fixtureNames,
  );
  for (const name of fixtureNames) {
    const scenario = createFixtureScenario(name);
    assert.equal(scenario.state.fixture, name);
    assert.ok(scenario.state.heading.length > 0);
    assert.ok(scenario.plan.surfaces.length > 0);
    assert.equal(scenario.plan.surfaces[0]?.kind, "orb");
  }
});

test("clock, identifiers, random values, and latency are deterministic", () => {
  const clock = new FakeClock(100);
  assert.equal(clock.advanceBy(50), 150);
  assert.throws(() => clock.advanceBy(-1), /non-negative/u);

  const first = new DeterministicSource(7);
  const second = new DeterministicSource(7);
  assert.equal(first.nextId(), "fixture-0001");
  assert.equal(first.nextRandom(), second.nextRandom());

  const one = new FixtureShellAdapter("idle").snapshot();
  const two = new FixtureShellAdapter("idle").snapshot();
  assert.deepEqual(one, two);
  assert.equal(one.networkLatencyMs, 42);
});

test("fixture adapter injects events and replays ordered aostrace envelopes", () => {
  const adapter = new FixtureShellAdapter();
  assert.equal(
    adapter.inject({ kind: "approval" }).state.fixture,
    "waiting-for-approval",
  );

  const envelopes = parseAosTrace(
    [
      '{"seq":1,"monotonicMs":0,"source":"runtime","type":"plan","correlationId":"test","payload":{"fixture":"planning"}}',
      '{"seq":2,"monotonicMs":900,"source":"shell","type":"result","correlationId":"test","payload":{"fixture":"result-summary"}}',
    ].join("\n"),
  );
  const before = adapter.snapshot().clockMs;
  const after = adapter.replay(envelopes);
  assert.equal(after.state.fixture, "result-summary");
  assert.equal(after.clockMs, before + 900);
  assert.throws(() => parseAosTrace('{"seq":1}'), /incomplete/u);
});

test("browser-only source trees contain no native bridge entry points", () => {
  const roots = [
    join("libs", "agent-shell-ui", "src"),
    join("tools", "shell-studio", "src"),
  ];
  const forbidden = [
    "@tauri-apps",
    "__TAURI__",
    "invoke(",
    "register_win_hook",
    "ServicePipe",
    "SelfPipe",
  ];
  for (const root of roots) {
    for (const file of sourceFiles(root)) {
      const source = readFileSync(file, "utf8");
      for (const token of forbidden) {
        assert.ok(
          !source.includes(token),
          `${file} contains forbidden native bridge token ${token}`,
        );
      }
    }
  }
});

test("Studio commands stay browser-only and snapshot updates stay explicit", () => {
  const packageJson = JSON.parse(readFileSync("package.json", "utf8")) as {
    scripts: Record<string, string>;
  };
  for (
    const command of [
      "studio",
      "studio:build",
      "studio:test",
      "studio:test:interactions",
      "studio:test:snapshots",
    ]
  ) {
    assert.doesNotMatch(
      packageJson.scripts[command] ?? "",
      /cargo|tauri|powershell|pwsh/iu,
    );
  }
  const updateCommands = Object.entries(packageJson.scripts).filter((
    [, command],
  ) => command.includes("--update-snapshots"));
  assert.deepEqual(updateCommands.map(([name]) => name), [
    "studio:update-snapshots",
  ]);

  const workflow = readFileSync(join(".github", "workflows", "ci.yml"), "utf8");
  assert.doesNotMatch(workflow, /studio:update-snapshots|--update-snapshots/u);
  const justfile = readFileSync("justfile", "utf8");
  assert.match(justfile, /studio:\r?\n\s+npm run studio(?:\r?\n|$)/u);
  assert.doesNotMatch(
    justfile.match(/studio:\s+\n[^\n]+/u)?.[0] ?? "",
    /cargo|tauri/iu,
  );
});

test("every fixture has a Windows visual baseline and an ARIA baseline", () => {
  const visualDirectory = join(
    "tools",
    "shell-studio",
    "tests",
    "visual",
    "fixtures.visual.spec.ts-snapshots",
  );
  const ariaDirectory = join(
    "tools",
    "shell-studio",
    "tests",
    "aria",
    "fixtures.aria.spec.ts-snapshots",
  );
  for (const fixture of fixtureNames) {
    assert.ok(
      existsSync(join(visualDirectory, `${fixture}-chromium-win32.png`)),
      `missing visual baseline for ${fixture}`,
    );
    assert.ok(
      existsSync(join(ariaDirectory, `${fixture}.aria.yml`)),
      `missing ARIA baseline for ${fixture}`,
    );
  }
});

function sourceFiles(directory: string): string[] {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) return sourceFiles(path);
    return /\.(svelte|ts)$/u.test(entry.name) ? [path] : [];
  });
}
