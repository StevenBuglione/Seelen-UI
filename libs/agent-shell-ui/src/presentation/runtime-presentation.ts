import type { FixtureState, MonitorId, PresentationIntent, SurfaceKind, SurfacePlan } from "../state/types.ts";

const detailSurface: Record<Exclude<PresentationIntent, "rest">, SurfaceKind> = {
  transient: "capsule",
  decision: "sheet",
  artifact: "stage",
  context: "sidecar",
  completion: "toast",
};

const purposeByKind: Record<SurfaceKind, string> = {
  orb: "persistent top-bar status and invocation",
  capsule: "compact activity and transcript",
  sheet: "blocking decision or short recovery",
  stage: "sustained artifact review",
  sidecar: "requested application context",
  toast: "brief completion or undo",
};

export function detailSurfaceForIntent(
  intent: PresentationIntent,
): SurfaceKind | undefined {
  return intent === "rest" ? undefined : detailSurface[intent];
}

export function presentRuntimeState(
  state: FixtureState,
  revision: number,
  activeMonitor: MonitorId = "monitor:1",
): SurfacePlan {
  const kinds: SurfaceKind[] = ["orb"];
  const detail = detailSurfaceForIntent(state.presentation);
  if (detail) kinds.push(detail);

  return {
    revision,
    activeMonitor,
    surfaces: kinds.map((kind, index) => ({
      id: `${state.fixture}:${kind}:${index + 1}`,
      kind,
      purpose: purposeByKind[kind],
      modal: kind === "sheet",
      dismissible: kind !== "orb" && kind !== "capsule",
    })),
  };
}

export function moveSurfacePlan(
  plan: SurfacePlan,
  activeMonitor: MonitorId,
): SurfacePlan {
  return {
    ...plan,
    revision: plan.revision + 1,
    activeMonitor,
  };
}
