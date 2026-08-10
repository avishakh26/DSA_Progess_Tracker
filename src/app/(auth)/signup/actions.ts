"use server";

import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { provisionUser } from "@/lib/provision";
import type { AuthFormState } from "@/lib/auth-types";

export async function signupAction(
  _prev: AuthFormState,
  formData: FormData,
): Promise<AuthFormState> {
  const name = String(formData.get("name") ?? "").trim();
  const email = String(formData.get("email") ?? "")
    .trim()
    .toLowerCase();
  const password = String(formData.get("password") ?? "");

  if (!email.includes("@")) return { error: "Enter a valid email address." };
  if (password.length < 8)
    return { error: "Password must be at least 8 characters." };

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) return { error: "An account with that email already exists." };

  const user = await prisma.user.create({
    data: {
      email,
      name: name || email.split("@")[0],
      passwordHash: await bcrypt.hash(password, 10),
    },
  });

  // Copy the 14-phase curriculum, monthly goals and rating roadmap into the
  // new account so the app is populated on first load.
  await provisionUser(user.id);

  // Signing in happens client-side after this action resolves (see
  // signup/page.tsx) via next-auth/react's signIn(), not here — see the
  // comment in login/page.tsx for why Server Actions shouldn't drive it.
  return { success: true };
}
