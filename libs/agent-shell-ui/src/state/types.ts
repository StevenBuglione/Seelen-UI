export const fixtureNames = [
  "idle",
  "hovered",
  "text-composer-open",
  "listening",
  "user-speaking",
  "thinking",
  "planning",
  "acting-single-step",
  "acting-multi-step",
  "waiting-for-approval",
  "approval-denied",
  "interrupted",
  "offline",
  "reconnecting",
  "error-recoverable",
  "error-fatal",
  "result-summary",
  "image-generating",
  "image-complete",
  "image-editing",
  "mcp-app-loading",
  "mcp-app-ready",
  "workspace-composer",
  "multi-agent-progress",
  "sidecar-context",
  "light-theme",
  "dark-theme",
  "reduced-motion",
  "high-contrast",
] as const;

export type FixtureName = (typeof fixtureNames)[number];

export type RuntimePhase =
  | "ready"
  | "listening"
  | "user-speaking"
  | "thinking"
  | "planning"
  | "acting"
  | "waiting-for-approval"
  | "interrupted"
  | "offline"
  | "reconnecting"
  | "error"
  | "completed";

export type SurfaceKind =
  | "orb"
  | "capsule"
  | "sheet"
  | "stage"
  | "toast"
  | "sidecar";
export type StudioTheme = "light" | "dark" | "high-contrast";
export type MotionMode = "normal" | "reduced";
export type MonitorId = "monitor:1" | "monitor:2";
export type PresentationIntent =
  | "rest"
  | "transient"
  | "decision"
  | "artifact"
  | "context"
  | "completion";

export interface FixtureState {
  fixture: FixtureName;
  phase: RuntimePhase;
  heading: string;
  message: string;
  status: string;
  presentation: PresentationIntent;
  composerOpen?: boolean;
  transcript?: string;
  progress?: number;
  steps?: readonly string[];
  approval?: {
    action: string;
    target: string;
    data: string;
    reason: string;
    risk: "low" | "medium" | "high";
    allowForWorkflow?: boolean;
    denied?: boolean;
  };
  artifact?: {
    kind: "image" | "document" | "workspace" | "mcp-app";
    label: string;
  };
  agents?: readonly { name: string; status: string }[];
  context?: {
    application: string;
    title: string;
    details: readonly string[];
  };
  completion?: {
    undoLabel?: string;
  };
  runtime?: {
    threadId?: string;
    turnId?: string;
    itemId?: string;
    acceptsInput: boolean;
    canInterrupt: boolean;
    recoverable: boolean;
  };
}

export interface PlannedSurface {
  id: string;
  kind: SurfaceKind;
  purpose: string;
  modal: boolean;
  dismissible: boolean;
}

export interface SurfacePlan {
  revision: number;
  activeMonitor: MonitorId;
  surfaces: readonly PlannedSurface[];
}

export interface FixtureScenario {
  state: FixtureState;
  plan: SurfacePlan;
}

export interface FixtureSnapshot extends FixtureScenario {
  clockMs: number;
  deterministicId: string;
  randomValue: number;
  networkLatencyMs: number;
}

export type InjectionKind =
  | "user-speech"
  | "agent-transcript"
  | "plan"
  | "command"
  | "image-generation"
  | "mcp-tool"
  | "approval"
  | "error"
  | "cancellation"
  | "reconnection"
  | "multi-agent";

export interface StudioInjection {
  kind: InjectionKind;
  text?: string;
}

export interface TraceEnvelope {
  seq: number;
  monotonicMs: number;
  source: "app-server" | "runtime" | "shell" | "policy" | "automation";
  type: string;
  correlationId: string;
  payload: Record<string, unknown>;
}
