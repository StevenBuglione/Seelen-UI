import type { FixtureName, FixtureScenario, FixtureState, RuntimePhase, SurfaceKind } from "./types.ts";
import { fixtureNames } from "./types.ts";

interface FixtureDefinition extends
  Partial<
    Omit<FixtureState, "fixture" | "phase" | "heading" | "message" | "status">
  > {
  phase: RuntimePhase;
  heading: string;
  message: string;
  status?: string;
  surfaces: readonly SurfaceKind[];
}

const definitions: Record<FixtureName, FixtureDefinition> = {
  idle: {
    phase: "ready",
    heading: "Ready",
    message: "Agent OS is available.",
    surfaces: ["orb"],
  },
  hovered: {
    phase: "ready",
    heading: "Ready",
    message: "Ask Agent OS",
    status: "Pointer hover",
    surfaces: ["orb"],
  },
  "text-composer-open": {
    phase: "ready",
    heading: "What should we work on?",
    message: "Composer ready",
    surfaces: ["orb", "capsule"],
  },
  listening: {
    phase: "listening",
    heading: "Listening",
    message: "Microphone is active",
    surfaces: ["orb", "capsule"],
  },
  "user-speaking": {
    phase: "user-speaking",
    heading: "Listening",
    message: "Voice activity detected",
    transcript: "Arrange these windows for focused work.",
    surfaces: ["orb", "capsule"],
  },
  thinking: {
    phase: "thinking",
    heading: "Thinking",
    message: "Considering the safest next step",
    surfaces: ["orb", "capsule"],
  },
  planning: {
    phase: "planning",
    heading: "Planning",
    message: "Preparing a concise action plan",
    steps: [
      "Inspect current workspace",
      "Propose layout",
      "Wait for confirmation",
    ],
    surfaces: ["orb", "capsule"],
  },
  "acting-single-step": {
    phase: "acting",
    heading: "Working",
    message: "Opening the requested artifact",
    progress: 0.64,
    surfaces: ["orb", "capsule"],
  },
  "acting-multi-step": {
    phase: "acting",
    heading: "Working through 3 steps",
    message: "Step 2 of 3: compare revisions",
    progress: 0.5,
    steps: ["Read inputs", "Compare revisions", "Prepare summary"],
    surfaces: ["orb", "capsule", "stage"],
  },
  "waiting-for-approval": {
    phase: "waiting-for-approval",
    heading: "Approval required",
    message: "This action changes a local file.",
    approval: { action: "Apply the reviewed patch", risk: "medium" },
    surfaces: ["orb", "sheet"],
  },
  "approval-denied": {
    phase: "ready",
    heading: "Action not approved",
    message: "No changes were made.",
    approval: {
      action: "Apply the reviewed patch",
      risk: "medium",
      denied: true,
    },
    surfaces: ["orb", "toast"],
  },
  interrupted: {
    phase: "interrupted",
    heading: "Stopped",
    message: "The current action was interrupted.",
    surfaces: ["orb", "capsule"],
  },
  offline: {
    phase: "offline",
    heading: "Offline",
    message: "Agent OS cannot reach the runtime.",
    surfaces: ["orb", "capsule"],
  },
  reconnecting: {
    phase: "reconnecting",
    heading: "Reconnecting",
    message: "Restoring the local session…",
    surfaces: ["orb", "capsule"],
  },
  "error-recoverable": {
    phase: "error",
    heading: "Couldn’t finish that step",
    message: "Retry is available and no state was changed.",
    status: "Recoverable error",
    surfaces: ["orb", "sheet"],
  },
  "error-fatal": {
    phase: "error",
    heading: "Agent OS needs attention",
    message: "Diagnostics are available. Windows remains unchanged.",
    status: "Fatal error",
    surfaces: ["orb", "stage"],
  },
  "result-summary": {
    phase: "completed",
    heading: "Finished",
    message: "Three files were reviewed; no changes were required.",
    surfaces: ["orb", "toast"],
  },
  "image-generating": {
    phase: "acting",
    heading: "Generating image",
    message: "Rendering concept 1 of 1",
    progress: 0.72,
    artifact: { kind: "image", label: "Generated image preview" },
    surfaces: ["orb", "stage"],
  },
  "image-complete": {
    phase: "completed",
    heading: "Image ready",
    message: "The generated image is ready to review.",
    artifact: { kind: "image", label: "Completed image preview" },
    surfaces: ["orb", "stage"],
  },
  "image-editing": {
    phase: "acting",
    heading: "Editing image",
    message: "Applying the requested background change",
    progress: 0.38,
    artifact: { kind: "image", label: "Image edit preview" },
    surfaces: ["orb", "stage"],
  },
  "mcp-app-loading": {
    phase: "acting",
    heading: "Opening tool",
    message: "Loading the restricted app view…",
    artifact: { kind: "mcp-app", label: "Restricted app loading" },
    surfaces: ["orb", "stage"],
  },
  "mcp-app-ready": {
    phase: "ready",
    heading: "Tool ready",
    message: "The restricted app view is available.",
    artifact: { kind: "mcp-app", label: "Restricted app ready" },
    surfaces: ["orb", "stage"],
  },
  "workspace-composer": {
    phase: "ready",
    heading: "Create a workspace",
    message: "Describe the files and tools this workspace needs.",
    artifact: { kind: "workspace", label: "Workspace composer fixture" },
    surfaces: ["orb", "stage"],
  },
  "multi-agent-progress": {
    phase: "acting",
    heading: "Coordinating work",
    message: "2 of 3 work items complete",
    progress: 0.67,
    agents: [
      { name: "Research", status: "Complete" },
      { name: "Implementation", status: "Complete" },
      { name: "Verification", status: "Running" },
    ],
    surfaces: ["orb", "stage"],
  },
  "reduced-motion": {
    phase: "thinking",
    heading: "Reduced motion",
    message: "State changes use opacity only.",
    status: "Reduced motion enabled",
    surfaces: ["orb", "capsule"],
  },
  "high-contrast": {
    phase: "ready",
    heading: "High contrast",
    message: "Controls and status remain distinct without color alone.",
    status: "High contrast enabled",
    surfaces: ["orb", "sheet"],
  },
};

export function isFixtureName(value: string): value is FixtureName {
  return fixtureNames.some((name) => name === value);
}

export function createFixtureScenario(name: FixtureName): FixtureScenario {
  const definition = definitions[name];
  const { surfaces, ...state } = definition;
  return {
    state: {
      fixture: name,
      status: state.status ?? state.phase,
      ...state,
    },
    plan: {
      revision: fixtureNames.indexOf(name) + 1,
      activeMonitor: "monitor:1",
      surfaces: surfaces.map((kind, index) => ({
        id: `${name}:${kind}:${index + 1}`,
        kind,
        purpose: index === 0 ? "primary status" : "fixture detail",
        modal: kind === "sheet",
      })),
    },
  };
}

export const fixtureCatalog: readonly FixtureScenario[] = fixtureNames.map(
  createFixtureScenario,
);
