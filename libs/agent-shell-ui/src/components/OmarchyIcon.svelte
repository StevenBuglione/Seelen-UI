<script lang="ts">
  import type { OmarchyIconName } from "./omarchy-icon-types.ts";
  import LuAppWindow from "../assets/icons/lucide/LuAppWindow.svg?raw";
  import LuArrowRight from "../assets/icons/lucide/LuArrowRight.svg?raw";
  import LuBatteryFull from "../assets/icons/lucide/LuBatteryFull.svg?raw";
  import LuBell from "../assets/icons/lucide/LuBell.svg?raw";
  import LuBluetooth from "../assets/icons/lucide/LuBluetooth.svg?raw";
  import LuCalendarDays from "../assets/icons/lucide/LuCalendarDays.svg?raw";
  import LuCheck from "../assets/icons/lucide/LuCheck.svg?raw";
  import LuChevronRight from "../assets/icons/lucide/LuChevronRight.svg?raw";
  import LuCircleUserRound from "../assets/icons/lucide/LuCircleUserRound.svg?raw";
  import LuCloudSun from "../assets/icons/lucide/LuCloudSun.svg?raw";
  import LuCode from "../assets/icons/lucide/LuCode.svg?raw";
  import LuCommand from "../assets/icons/lucide/LuCommand.svg?raw";
  import LuCpu from "../assets/icons/lucide/LuCpu.svg?raw";
  import LuFolder from "../assets/icons/lucide/LuFolder.svg?raw";
  import LuGauge from "../assets/icons/lucide/LuGauge.svg?raw";
  import LuGlobe from "../assets/icons/lucide/LuGlobe.svg?raw";
  import LuGrid3X3 from "../assets/icons/lucide/LuGrid3X3.svg?raw";
  import LuHardDrive from "../assets/icons/lucide/LuHardDrive.svg?raw";
  import LuHeadphones from "../assets/icons/lucide/LuHeadphones.svg?raw";
  import LuKeyboard from "../assets/icons/lucide/LuKeyboard.svg?raw";
  import LuLaptop from "../assets/icons/lucide/LuLaptop.svg?raw";
  import LuLayoutGrid from "../assets/icons/lucide/LuLayoutGrid.svg?raw";
  import LuMaximize2 from "../assets/icons/lucide/LuMaximize2.svg?raw";
  import LuMemoryStick from "../assets/icons/lucide/LuMemoryStick.svg?raw";
  import LuMenu from "../assets/icons/lucide/LuMenu.svg?raw";
  import LuMinus from "../assets/icons/lucide/LuMinus.svg?raw";
  import LuMonitor from "../assets/icons/lucide/LuMonitor.svg?raw";
  import LuMoon from "../assets/icons/lucide/LuMoon.svg?raw";
  import LuMusic2 from "../assets/icons/lucide/LuMusic2.svg?raw";
  import LuNetwork from "../assets/icons/lucide/LuNetwork.svg?raw";
  import LuPaintbrush from "../assets/icons/lucide/LuPaintbrush.svg?raw";
  import LuPanelRight from "../assets/icons/lucide/LuPanelRight.svg?raw";
  import LuPanelTop from "../assets/icons/lucide/LuPanelTop.svg?raw";
  import LuPower from "../assets/icons/lucide/LuPower.svg?raw";
  import LuRotateCcw from "../assets/icons/lucide/LuRotateCcw.svg?raw";
  import LuSearch from "../assets/icons/lucide/LuSearch.svg?raw";
  import LuSettings2 from "../assets/icons/lucide/LuSettings2.svg?raw";
  import LuShield from "../assets/icons/lucide/LuShield.svg?raw";
  import LuSun from "../assets/icons/lucide/LuSun.svg?raw";
  import LuTerminal from "../assets/icons/lucide/LuTerminal.svg?raw";
  import LuVolume2 from "../assets/icons/lucide/LuVolume2.svg?raw";
  import LuWifi from "../assets/icons/lucide/LuWifi.svg?raw";
  import LuX from "../assets/icons/lucide/LuX.svg?raw";

  const icons = {
    appWindow: LuAppWindow,
    arrowRight: LuArrowRight,
    battery: LuBatteryFull,
    bell: LuBell,
    bluetooth: LuBluetooth,
    calendar: LuCalendarDays,
    check: LuCheck,
    chevronRight: LuChevronRight,
    cloudSun: LuCloudSun,
    code: LuCode,
    command: LuCommand,
    cpu: LuCpu,
    folder: LuFolder,
    gauge: LuGauge,
    globe: LuGlobe,
    grid: LuGrid3X3,
    hardDrive: LuHardDrive,
    headphones: LuHeadphones,
    keyboard: LuKeyboard,
    laptop: LuLaptop,
    layout: LuLayoutGrid,
    maximize: LuMaximize2,
    memory: LuMemoryStick,
    menu: LuMenu,
    minimize: LuMinus,
    monitor: LuMonitor,
    moon: LuMoon,
    music: LuMusic2,
    network: LuNetwork,
    paintbrush: LuPaintbrush,
    panelRight: LuPanelRight,
    panelTop: LuPanelTop,
    power: LuPower,
    reset: LuRotateCcw,
    search: LuSearch,
    settings: LuSettings2,
    shield: LuShield,
    sun: LuSun,
    terminal: LuTerminal,
    user: LuCircleUserRound,
    volume: LuVolume2,
    wifi: LuWifi,
    close: LuX,
  } as const satisfies Record<OmarchyIconName, string>;

  interface Props {
    name: OmarchyIconName;
    size?: number;
    label?: string;
  }

  let { name, size = 16, label }: Props = $props();
</script>

<span
  class="omarchy-icon"
  style={`--icon-size:${size}px`}
  aria-hidden={label ? undefined : "true"}
  aria-label={label}
>{@html icons[name]}</span>

<style>
  .omarchy-icon {
    display: inline-grid;
    width: var(--icon-size);
    height: var(--icon-size);
    flex: 0 0 auto;
    place-items: center;
    line-height: 0;
  }

  .omarchy-icon :global(svg) {
    display: block;
    width: 100%;
    height: 100%;
    stroke-width: 1.8;
  }
</style>
