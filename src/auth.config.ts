import type { NextAuthConfig } from "next-auth";

const PUBLIC_ROUTES = ["/login", "/signup"];

/**
 * Edge-safe half of the Auth.js config. Middleware imports only this file so
 * that Prisma and bcrypt (Node-only) never get pulled into the edge bundle.
 */
export const authConfig = {
  pages: {
    signIn: "/login",
  },
  session: { strategy: "jwt" },
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = Boolean(auth?.user);
      const isPublic = PUBLIC_ROUTES.some((r) => nextUrl.pathname.startsWith(r));

      if (isPublic) {
        // Already signed in? Skip the login screen.
        if (isLoggedIn) return Response.redirect(new URL("/", nextUrl));
        return true;
      }
      return isLoggedIn; // false → Auth.js redirects to pages.signIn
    },
    jwt({ token, user }) {
      if (user) token.id = user.id;
      return token;
    },
    session({ session, token }) {
      if (token.id) session.user.id = token.id as string;
      return session;
    },
  },
  providers: [], // filled in by src/auth.ts
} satisfies NextAuthConfig;
