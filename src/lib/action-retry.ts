/**
 * Server Action calls go over the network like any fetch. In this project's
 * local dev setup that hop occasionally drops mid-flight — Next's dev server
 * shares the network handling with its (slow, webpack) compile step, so a
 * request can get reset while a route recompiles in the background — even
 * though the action usually completed server-side. Retrying masks that
 * transient drop instead of surfacing an uncaught "Failed to fetch".
 */
export async function withRetry<T>(fn: () => Promise<T>, attempts = 3): Promise<T> {
  for (let attempt = 1; attempt <= attempts; attempt++) {
    try {
      return await fn();
    } catch (err) {
      if (attempt === attempts) throw err;
      await new Promise((resolve) => setTimeout(resolve, 300 * attempt));
    }
  }
  throw new Error("unreachable");
}
