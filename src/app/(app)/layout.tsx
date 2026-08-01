import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { AppShell } from "@/components/layout/app-shell";
import { TooltipProvider } from "@/components/ui/tooltip";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) redirect("/login");

  const [user, revision, favTopics, favProblems] = await Promise.all([
    prisma.user.findUnique({
      where: { id: userId },
      select: { name: true, email: true },
    }),
    prisma.problem.count({ where: { userId, status: "REVISION" } }),
    prisma.topic.count({ where: { userId, favorite: true } }),
    prisma.problem.count({ where: { userId, favorite: true } }),
  ]);

  // The session cookie can outlive the row it points at (e.g. after a db reset).
  if (!user) redirect("/login");

  return (
    <TooltipProvider delayDuration={200}>
      <AppShell
        user={user}
        counts={{ revision, favorites: favTopics + favProblems }}
      >
        {children}
      </AppShell>
    </TooltipProvider>
  );
}
