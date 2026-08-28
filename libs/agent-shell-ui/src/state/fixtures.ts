import { presentRuntimeState } from "../presentation/runtime-presentation.ts";
import type {
  FixtureName,
  FixtureScenario,
  FixtureState,
  MonitorId,
  PresentationIntent,
  RuntimePhase,
} from "./types.ts";
import { fixtureNames } from "./types.ts";

interface FixtureDefinition extends
  Partial<
    Omit<
      FixtureState,
      "fixture" | "phase" | "heading" | "message" | "presentation" | "status"
    >
  > {
  phase: RuntimePhase;
  heading: string;
  message: string;
  status?: string;
  presentation: PresentationIntent;
}

const definitions: Record<FixtureName, FixtureDefinition> = {
  idle: {
    phase: "ready",
    heading: "Ready",
    message: "Agent OS is available.",
    presentation: "rest",
  },
  hovered: {
    phase: "ready",
    heading: "Ready",
    message: "Ask Agent OS",
    status: "Pointer hover",
    presentation: "rest",
  },
  "text-composer-open": {
    phase: "ready",
    heading: "What should we work on?",
    message: "Composer ready",
    composerOpen: true,
    presentation: "transient",
  },
  listening: {
    phase: "listening",
    heading: "Listening",
    message: "Microphone is active",
    presentation: "transient",
  },
  "user-speaking": {
    phase: "user-speaking",
    heading: "Listening",
    message: "Voice activity detected",
    transcript: "Arrange these windows for focused work.",
    presentation: "transient",
  },
  thinking: {
    phase: "thinking",
    heading: "Thinking",
    message: "Considering the safest next step",
    presentation: "transient",
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
    presentation: "transient",
  },
  "acting-single-step": {
    phase: "acting",
    heading: "Working",
    message: "Opening the requested artifact",
    progress: 0.64,
    presentation: "transient",
  },
  "acting-multi-step": {
    phase: "acting",
    heading: "Working through 3 steps",
    message: "Step 2 of 3: compare revisions",
    progress: 0.5,
    steps: ["Read inputs", "Compare revisions", "Prepare summary"],
    presentation: "artifact",
  },
  "waiting-for-approval": {
    phase: "waiting-for-approval",
    heading: "Approval required",
    message: "This action changes local files.",
    approval: {
      action: "Apply the reviewed patch",
      target: "libs/agent-shell-ui/src/surfaces",
      data: "Two reviewed local source files will change.",
      reason: "The patch is required to complete the requested UI update.",
      risk: "medium",
    },
    presentation: "decision",
  },
  "approval-denied": {
    phase: "ready",
    heading: "Action not approved",
    message: "No changes were made.",
    approval: {
      action: "Apply the reviewed patch",
      target: "libs/agent-shell-ui/src/surfaces",
      data: "No data left the machine and no files changed.",
      reason: "The request was denied by the user.",
      risk: "medium",
      denied: true,
    },
    presentation: "completion",
  },
  interrupted: {
    phase: "interrupted",
    heading: "Stopped",
    message: "The current action was interrupted.",
    presentation: "transient",
  },
  offline: {
    phase: "offline",
    heading: "Offline",
    message: "Agent OS cannot reach the runtime.",
    presentation: "transient",
  },
  reconnecting: {
    phase: "reconnecting",
    heading: "Reconnecting",
    message: "Restoring the local session…",
    presentation: "transient",
  },
  "error-recoverable": {
    phase: "error",
    heading: "Couldn’t finish that step",
    message: "Retry is available and no state was changed.",
    status: "Recoverable error",
    presentation: "decision",
  },
  "error-fatal": {
    phase: "error",
    heading: "Agent OS needs attention",
    message: "Diagnostics are available. Windows remains unchanged.",
    status: "Fatal error",
    presentation: "artifact",
  },
  "result-summary": {
    phase: "completed",
    heading: "Finished",
    message: "Three files were reviewed; no changes were required.",
    completion: { undoLabel: "Show report" },
    presentation: "completion",
  },
  "image-generating": {
    phase: "acting",
    heading: "Generating image",
    message: "Rendering concept 1 of 1",
    progress: 0.72,
    artifact: { kind: "image", label: "Generated image preview" },
    presentation: "artifact",
  },
  "image-complete": {
    phase: "completed",
    heading: "Image ready",
    message: "The generated image is ready to review.",
    artifact: { kind: "image", label: "Completed image preview" },
    presentation: "artifact",
  },
  "image-editing": {
    phase: "acting",
    heading: "Editing image",
    message: "Applying the requested background change",
    progress: 0.38,
    artifact: { kind: "image", label: "Image edit preview" },
    presentation: "artifact",
  },
  "mcp-app-loading": {
    phase: "acting",
    heading: "Opening tool",
    message: "Loading the restricted app view…",
    artifact: { kind: "mcp-app", label: "Restricted app loading" },
    presentation: "artifact",
  },
  "mcp-app-ready": {
    phase: "ready",
    heading: "Tool ready",
    message: "The restricted app view is available.",
    artifact: { kind: "mcp-app", label: "Restricted app ready" },
    presentation: "artifact",
  },
  "workspace-composer": {
    phase: "ready",
    heading: "Create a workspace",
    message: "Describe the files and tools this workspace needs.",
    artifact: { kind: "workspace", label: "Workspace composer fixture" },
    presentation: "artifact",
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
    presentation: "artifact",
  },
  "sidecar-context": {
    phase: "ready",
    heading: "Current context",
    message: "Context is available on demand.",
    context: {
      application: "Visual Studio Code",
      title: "ShellExperience.svelte",
      details: [
        "Workspace: agent-os-shell",
        "Language: Svelte",
        "Privacy: local metadata only",
      ],
    },
    presentation: "context",
  },
  "light-theme": {
    phase: "ready",
    heading: "Light appearance",
    message: "Agent surfaces inherit the light shell palette.",
    status: "Light theme enabled",
    presentation: "transient",
  },
  "dark-theme": {
    phase: "ready",
    heading: "Dark appearance",
    message: "Agent surfaces inherit the dark shell palette.",
    status: "Dark theme enabled",
    presentation: "transient",
  },
  "reduced-motion": {
    phase: "thinking",
    heading: "Reduced motion",
    message: "State changes use opacity only.",
    status: "Reduced motion enabled",
    presentation: "transient",
  },
  "high-contrast": {
    phase: "ready",
    heading: "High contrast",
    message: "Controls and status remain distinct without color alone.",
    status: "High contrast enabled",
    presentation: "decision",
  },
};

export function isFixtureName(value: string): value is FixtureName {
  return fixtureNames.some((name) => name === value);
}

export function createFixtureScenario(
  name: FixtureName,
  activeMonitor: MonitorId = "monitor:1",
): FixtureScenario {
  const definition = definitions[name];
  const { status, ...definitionState } = definition;
  const state: FixtureState = {
    fixture: name,
    status: status ?? definition.phase,
    ...definitionState,
  };
  return {
    state,
    plan: presentRuntimeState(
      state,
      fixtureNames.indexOf(name) + 1,
      activeMonitor,
    ),
  };
}

export const fixtureCatalog: readonly FixtureScenario[] = fixtureNames.map(
  (name) => createFixtureScenario(name),
);
