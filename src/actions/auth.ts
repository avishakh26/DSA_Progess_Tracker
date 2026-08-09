"use server";

import { signOut } from "@/auth";

export async function signOutAction() {
  // redirect: false — see login/actions.ts for why we avoid Next's
  // redirect-after-action self-fetch. The caller navigates client-side.
  await signOut({ redirect: false });
}
