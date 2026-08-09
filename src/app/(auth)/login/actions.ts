"use server";

import { AuthError } from "next-auth";
import { signIn } from "@/auth";

export type AuthFormState = { error?: string; success?: boolean } | undefined;

export async function loginAction(
  _prev: AuthFormState,
  formData: FormData,
): Promise<AuthFormState> {
  try {
    // redirect: false — letting signIn() redirect server-side triggers Next's
    // internal self-fetch to stream the destination page, which is flaky in
    // dev on this machine (ECONNRESET). The client navigates instead once it
    // sees `success: true`.
    await signIn("credentials", {
      email: formData.get("email"),
      password: formData.get("password"),
      redirect: false,
    });
  } catch (error) {
    if (error instanceof AuthError) {
      return { error: "Incorrect email or password." };
    }
    throw error;
  }
  return { success: true };
}
