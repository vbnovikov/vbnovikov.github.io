const recoveryStorageKey = "portfolio:refresh-recovered-at";
const recoveryCooldownMs = 8_000;

const moduleLoadFailurePatterns = [
  /ChunkLoadError/i,
  /Failed to fetch dynamically imported module/i,
  /Importing a module script failed/i,
  /Loading chunk \d+ failed/i,
  /error loading dynamically imported module/i,
];

export function getErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }

  if (typeof error === "string") {
    return error;
  }

  if (error && typeof error === "object" && "message" in error) {
    return String((error as { message: unknown }).message);
  }

  return String(error ?? "");
}

export function isStaleModuleError(error: unknown): boolean {
  const message = getErrorMessage(error);

  return moduleLoadFailurePatterns.some((pattern) => pattern.test(message));
}

export function refreshOnceForStaleModule(error: unknown): boolean {
  if (typeof window === "undefined" || !isStaleModuleError(error)) {
    return false;
  }

  const now = Date.now();

  try {
    const lastRefresh = Number(window.sessionStorage.getItem(recoveryStorageKey) ?? 0);

    if (now - lastRefresh < recoveryCooldownMs) {
      return false;
    }

    window.sessionStorage.setItem(recoveryStorageKey, String(now));
  } catch {
    return false;
  }

  window.location.reload();
  return true;
}

export function installRefreshRecovery() {
  if (typeof window === "undefined") {
    return;
  }

  window.addEventListener("vite:preloadError", (event) => {
    event.preventDefault();
    refreshOnceForStaleModule("Failed to fetch dynamically imported module");
  });

  window.addEventListener("unhandledrejection", (event) => {
    if (refreshOnceForStaleModule(event.reason)) {
      event.preventDefault();
    }
  });

  window.addEventListener("error", (event) => {
    refreshOnceForStaleModule(event.error ?? event.message);
  });
}
