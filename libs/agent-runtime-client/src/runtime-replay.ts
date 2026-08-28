import { isFixtureName } from "../../agent-shell-ui/src/state/fixtures.ts";
import type { FixtureSnapshot, TraceEnvelope as ShellTraceEnvelope } from "../../agent-shell-ui/src/state/types.ts";

import type {
  CompatibilityState,
  RuntimeStateSnapshot,
  SurfaceKind,
  TraceEnvelope,
  TraceSource,
} from "./generated/agent-contracts.ts";

const traceSources = new Set<TraceSource>([
  "app-server",
  "runtime",
  "shell",
  "policy",
  "automation",
]);
const surfaceKinds = new Set<SurfaceKind>([
  "orb",
  "capsule",
  "sheet",
  "stage",
  "toast",
  "sidecar",
]);
const runtimePhases = new Set([
  "ready",
  "listening",
  "user-speaking",
  "thinking",
  "planning",
  "acting",
  "waiting-for-approval",
  "interrupted",
  "offline",
  "reconnecting",
  "error",
  "completed",
]);
const presentationIntents = new Set([
  "rest",
  "transient",
  "decision",
  "artifact",
  "context",
  "completion",
]);

export interface RuntimeReplayFrame {
  envelope: TraceEnvelope;
  snapshot: FixtureSnapshot;
}

export interface RuntimeReplayResult {
  frames: readonly RuntimeReplayFrame[];
  finalSnapshot: FixtureSnapshot;
}

export function parseRuntimeTrace(text: string): TraceEnvelope[] {
  const envelopes = text
    .split(/\r?\n/u)
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line, index) => parseEnvelope(line, index + 1));
  for (let index = 1; index < envelopes.length; index += 1) {
    const previous = envelopes[index - 1]!;
    const current = envelopes[index]!;
    if (current.seq <= previous.seq) {
      throw new Error(
        "runtime trace sequence numbers must be strictly increasing",
      );
    }
    if (current.monotonicMs < previous.monotonicMs) {
      throw new Error(
        "runtime trace monotonic timestamps cannot move backwards",
      );
    }
  }
  return envelopes;
}

export function replayRuntimeTrace(text: string): RuntimeReplayResult {
  const frames = parseRuntimeTrace(text)
    .filter((envelope) => envelope.type === "runtime.state_snapshot")
    .map((envelope) => ({
      envelope,
      snapshot: toFixtureSnapshot(
        validateRuntimeStateSnapshot(envelope.payload),
        envelope,
      ),
    }));
  const finalSnapshot = frames.at(-1)?.snapshot;
  if (!finalSnapshot) {
    throw new Error("runtime trace contains no runtime.state_snapshot event");
  }
  return { frames, finalSnapshot };
}

export function validateRuntimeStateSnapshot(
  value: unknown,
): RuntimeStateSnapshot {
  const snapshot = object(value, "runtime snapshot");
  const revision = safeInteger(snapshot.revision, "runtime snapshot revision");
  const state = object(snapshot.state, "runtime state");
  const fixture = string(state.fixture, "runtime fixture");
  if (!isFixtureName(fixture)) {
    throw new Error(`runtime fixture is not sanctioned: ${fixture}`);
  }
  const phase = string(state.phase, "runtime phase");
  if (!runtimePhases.has(phase)) {
    throw new Error(`unsupported runtime phase: ${phase}`);
  }
  const presentation = string(state.presentation, "presentation intent");
  if (!presentationIntents.has(presentation)) {
    throw new Error(`unsupported presentation intent: ${presentation}`);
  }
  const progressBasisPoints = state.progressBasisPoints;
  if (
    progressBasisPoints !== null &&
    (!Number.isInteger(progressBasisPoints) ||
      Number(progressBasisPoints) < 0 || Number(progressBasisPoints) > 10_000)
  ) {
    throw new Error(
      "progressBasisPoints must be null or an integer from 0 through 10000",
    );
  }
  const steps = stringArray(state.steps, "runtime steps");
  const threadId = nullableString(state.threadId, "runtime thread ID");
  const turnId = nullableString(state.turnId, "runtime turn ID");
  const itemId = nullableString(state.itemId, "runtime item ID");
  const acceptsInput = optionalBoolean(
    state.acceptsInput,
    "acceptsInput",
    phase === "ready" || phase === "completed" || phase === "error",
  );
  const canInterrupt = optionalBoolean(
    state.canInterrupt,
    "canInterrupt",
    phase === "thinking" || phase === "planning" || phase === "acting" ||
      phase === "waiting-for-approval",
  );
  const recoverable = optionalBoolean(
    state.recoverable,
    "recoverable",
    phase !== "error",
  );
  const surfacePlan = object(snapshot.surfacePlan, "surface plan");
  const planRevision = safeInteger(
    surfacePlan.revision,
    "surface plan revision",
  );
  if (planRevision !== revision) {
    throw new Error("surface plan revision must match the state snapshot");
  }
  const activeMonitor = string(surfacePlan.activeMonitor, "active monitor");
  if (activeMonitor !== "monitor:1" && activeMonitor !== "monitor:2") {
    throw new Error("active monitor is not sanctioned");
  }
  if (
    !Array.isArray(surfacePlan.surfaces) || surfacePlan.surfaces.length < 1 ||
    surfacePlan.surfaces.length > 2
  ) {
    throw new Error(
      "surface plan must contain the Orb and at most one contextual surface",
    );
  }
  const surfaces = surfacePlan.surfaces.map((entry, index) => {
    const surface = object(entry, `surface ${index + 1}`);
    const kind = string(surface.kind, `surface ${index + 1} kind`);
    if (!surfaceKinds.has(kind as SurfaceKind)) {
      throw new Error(`unsupported surface kind: ${kind}`);
    }
    return {
      id: string(surface.id, `surface ${index + 1} id`),
      kind: kind as SurfaceKind,
      purpose: string(surface.purpose, `surface ${index + 1} purpose`),
      modal: boolean(surface.modal, `surface ${index + 1} modal`),
      dismissible: boolean(
        surface.dismissible,
        `surface ${index + 1} dismissible`,
      ),
    };
  });
  if (surfaces[0]?.kind !== "orb") {
    throw new Error("surface plan must begin with the persistent Orb");
  }

  const compatibility = validateCompatibility(snapshot.compatibility);
  const pendingApproval = snapshot.pendingApproval === undefined || snapshot.pendingApproval === null
    ? null
    : validateApproval(snapshot.pendingApproval);
  if ((phase === "waiting-for-approval") !== (pendingApproval !== null)) {
    throw new Error(
      "waiting-for-approval state must have exactly one pending approval",
    );
  }
  if (compatibility.status === "incompatible") {
    if (
      fixture !== "error-fatal" ||
      phase !== "error" ||
      presentation !== "artifact" ||
      surfaces[1]?.kind !== "stage" ||
      !string(state.message, "runtime message").includes(
        "Windows remains unchanged",
      )
    ) {
      throw new Error(
        "protocol incompatibility must render a fail-closed error stage",
      );
    }
  }

  return {
    revision,
    state: {
      fixture,
      phase: phase as RuntimeStateSnapshot["state"]["phase"],
      heading: string(state.heading, "runtime heading"),
      message: string(state.message, "runtime message"),
      status: string(state.status, "runtime status"),
      presentation: presentation as RuntimeStateSnapshot["state"]["presentation"],
      composerOpen: boolean(state.composerOpen, "composerOpen"),
      progressBasisPoints: progressBasisPoints === null ? null : Number(progressBasisPoints),
      steps,
      threadId,
      turnId,
      itemId,
      acceptsInput,
      canInterrupt,
      recoverable,
    },
    surfacePlan: { revision: planRevision, activeMonitor, surfaces },
    compatibility,
    pendingApproval,
  };
}

function toFixtureSnapshot(
  snapshot: RuntimeStateSnapshot,
  envelope: TraceEnvelope,
): FixtureSnapshot {
  return {
    state: {
      fixture: snapshot.state.fixture as FixtureSnapshot["state"]["fixture"],
      phase: snapshot.state.phase,
      heading: snapshot.state.heading,
      message: snapshot.state.message,
      status: snapshot.state.status,
      presentation: snapshot.state.presentation,
      composerOpen: snapshot.state.composerOpen || undefined,
      progress: snapshot.state.progressBasisPoints === null ? undefined : snapshot.state.progressBasisPoints / 10_000,
      steps: snapshot.state.steps.length > 0 ? snapshot.state.steps : undefined,
      approval: snapshot.pendingApproval
        ? {
          action: snapshot.pendingApproval.action,
          target: snapshot.pendingApproval.target,
          data: snapshot.pendingApproval.data,
          reason: snapshot.pendingApproval.reason,
          risk: snapshot.pendingApproval.risk === "R3"
            ? "high"
            : snapshot.pendingApproval.risk === "R2"
            ? "medium"
            : "low",
          allowForWorkflow: snapshot.pendingApproval.allowForWorkflow,
        }
        : undefined,
      artifact: snapshot.state.phase === "completed" &&
          snapshot.surfacePlan.surfaces.some((surface) => surface.kind === "stage")
        ? { kind: "document", label: "Codex response" }
        : undefined,
      completion: snapshot.state.phase === "completed" ? { undoLabel: "Show report" } : undefined,
      runtime: {
        threadId: snapshot.state.threadId ?? undefined,
        turnId: snapshot.state.turnId ?? undefined,
        itemId: snapshot.state.itemId ?? undefined,
        acceptsInput: snapshot.state.acceptsInput,
        canInterrupt: snapshot.state.canInterrupt,
        recoverable: snapshot.state.recoverable,
      },
    },
    plan: {
      revision: snapshot.surfacePlan.revision,
      activeMonitor: snapshot.surfacePlan.activeMonitor,
      surfaces: snapshot.surfacePlan.surfaces,
    },
    clockMs: envelope.monotonicMs,
    deterministicId: `runtime-${String(envelope.seq).padStart(4, "0")}`,
    randomValue: 0,
    networkLatencyMs: 0,
  };
}

function validateApproval(
  value: unknown,
): RuntimeStateSnapshot["pendingApproval"] {
  const approval = object(value, "pending approval");
  const risk = string(approval.risk, "approval risk");
  if (risk !== "R0" && risk !== "R1" && risk !== "R2" && risk !== "R3") {
    throw new Error(`unsupported approval risk: ${risk}`);
  }
  return {
    approvalId: string(approval.approvalId, "approval ID"),
    action: string(approval.action, "approval action"),
    target: string(approval.target, "approval target"),
    reason: string(approval.reason, "approval reason"),
    risk,
    data: string(approval.data, "approval data"),
    expiresAtMs: safeInteger(approval.expiresAtMs, "approval expiration"),
    allowForWorkflow: boolean(approval.allowForWorkflow, "allowForWorkflow"),
  };
}

function validateCompatibility(value: unknown): CompatibilityState {
  const compatibility = object(value, "compatibility state");
  const status = string(compatibility.status, "compatibility status");
  if (status === "compatible") {
    const negotiated = version(compatibility.negotiated, "negotiated protocol");
    return { status, negotiated };
  }
  if (status === "incompatible") {
    const code = string(compatibility.code, "compatibility code");
    if (
      code !== "incompatible-major" && code !== "authentication-failed" &&
      code !== "compatible"
    ) {
      throw new Error(`unsupported compatibility code: ${code}`);
    }
    return {
      status,
      code,
      offered: version(compatibility.offered, "offered protocol"),
      required: version(compatibility.required, "required protocol"),
      message: string(compatibility.message, "compatibility message"),
    };
  }
  throw new Error(`unsupported compatibility status: ${status}`);
}

function parseEnvelope(line: string, lineNumber: number): TraceEnvelope {
  let value: unknown;
  try {
    value = JSON.parse(line);
  } catch {
    throw new Error(`invalid runtime trace JSON at line ${lineNumber}`);
  }
  const envelope = object(value, `runtime trace line ${lineNumber}`);
  const source = string(
    envelope.source,
    `runtime trace source at line ${lineNumber}`,
  );
  if (!traceSources.has(source as TraceSource)) {
    throw new Error(`unsupported runtime trace source at line ${lineNumber}`);
  }
  return {
    seq: safeInteger(
      envelope.seq,
      `runtime trace sequence at line ${lineNumber}`,
    ),
    monotonicMs: safeInteger(
      envelope.monotonicMs,
      `runtime trace time at line ${lineNumber}`,
    ),
    source: source as TraceSource,
    type: string(envelope.type, `runtime trace type at line ${lineNumber}`),
    correlationId: string(
      envelope.correlationId,
      `runtime correlation ID at line ${lineNumber}`,
    ),
    payload: object(envelope.payload, `runtime payload at line ${lineNumber}`),
  };
}

function version(
  value: unknown,
  name: string,
): { major: number; minor: number } {
  const candidate = object(value, name);
  return {
    major: safeInteger(candidate.major, `${name} major`),
    minor: safeInteger(candidate.minor, `${name} minor`),
  };
}

function object(value: unknown, name: string): Record<string, unknown> {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    throw new Error(`${name} must be an object`);
  }
  return value as Record<string, unknown>;
}

function string(value: unknown, name: string): string {
  if (typeof value !== "string" || value.length === 0) {
    throw new Error(`${name} must be a non-empty string`);
  }
  return value;
}

function boolean(value: unknown, name: string): boolean {
  if (typeof value !== "boolean") throw new Error(`${name} must be a boolean`);
  return value;
}

function optionalBoolean(
  value: unknown,
  name: string,
  fallback: boolean,
): boolean {
  return value === undefined ? fallback : boolean(value, name);
}

function nullableString(value: unknown, name: string): string | null {
  if (value === undefined || value === null) return null;
  return string(value, name);
}

function safeInteger(value: unknown, name: string): number {
  if (!Number.isSafeInteger(value) || Number(value) < 0) {
    throw new Error(`${name} must be a non-negative safe integer`);
  }
  return Number(value);
}

function stringArray(value: unknown, name: string): string[] {
  if (!Array.isArray(value) || value.some((item) => typeof item !== "string")) {
    throw new Error(`${name} must be a string array`);
  }
  return value;
}

// Compile-time proof that the generated and shell trace envelopes retain the handoff fields.
const _traceCompatibility: Pick<
  ShellTraceEnvelope,
  "seq" | "monotonicMs" | "source" | "type" | "correlationId"
> = {} as TraceEnvelope;
void _traceCompatibility;
