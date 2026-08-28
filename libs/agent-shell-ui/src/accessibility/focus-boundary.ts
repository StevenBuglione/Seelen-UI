const focusableSelector = [
  "button:not([disabled])",
  "input:not([disabled])",
  "select:not([disabled])",
  "textarea:not([disabled])",
  "[href]",
  '[tabindex]:not([tabindex="-1"])',
].join(",");

export function focusBoundary(element: HTMLElement): () => void {
  const focusSafeDefault = (): void => {
    const target = element.querySelector<HTMLElement>(
      '[data-safe-default="true"], button:not([disabled]), input:not([disabled])',
    );
    target?.focus({ preventScroll: true });
  };

  const handleKeydown = (event: KeyboardEvent): void => {
    if (event.key !== "Tab") return;
    const focusable = Array.from(
      element.querySelectorAll<HTMLElement>(focusableSelector),
    ).filter((candidate) => !candidate.hidden);
    if (focusable.length === 0) {
      event.preventDefault();
      return;
    }
    const first = focusable[0]!;
    const last = focusable.at(-1)!;
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  };

  queueMicrotask(focusSafeDefault);
  element.addEventListener("keydown", handleKeydown);
  return () => element.removeEventListener("keydown", handleKeydown);
}
