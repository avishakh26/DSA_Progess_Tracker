import NextAuth from "next-auth";
import { authConfig } from "@/auth.config";

// Next 16 renamed the `middleware` convention to `proxy`. Only the edge-safe
// half of the Auth.js config is imported here — see src/auth.config.ts.
export default NextAuth(authConfig).auth;

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|.*\\.png$).*)"],
};
