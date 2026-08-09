import { unstable_isUnrecognizedActionError } from "next/navigation";

/**
 * Server Action calls go over the network like any fetch. In this project's
 * local dev setup that hop occasionally drops mid-flight — Next's dev server
 * shares the network handling with its (slow, webpack) compile step, so a
 * request can get reset while a route recompiles in the background — even
 * though the action usually completed server-side. Retrying masks that
 * transient drop instead of surfacing an uncaught "Failed to fetch".
 *
 * A dev-only recompile can also leave the *already-loaded* page holding a
 * reference to an action id the server no longer recognizes
 * (UnrecognizedActionError). Retrying with that same reference can never
 * succeed — only a full reload fetches a bundle with a current one — so we
 * reload immediately instead of burning through retries on a doomed call.
 */
export async function withRetry<T>(fn: () => Promise<T>, attempts = 3): Promise<T> {
  for (let attempt = 1; attempt <= attempts; attempt++) {
    try {
      return await fn();
    } catch (err) {
      if (unstable_isUnrecognizedActionError(err)) {
        window.location.reload();
        return new Promise<T>(() => {}); // reload is in flight; never resolve
      }
      if (attempt === attempts) throw err;
      await new Promise((resolve) => setTimeout(resolve, 300 * attempt));
    }
  }
  throw new Error("unreachable");
}
