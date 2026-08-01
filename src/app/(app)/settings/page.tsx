import { Settings } from "lucide-react";
import { requireUserId } from "@/auth";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/layout/page-header";
import { SettingsForm } from "@/components/settings/settings-form";

export const metadata = { title: "Settings — DSA Journey" };

export default async function SettingsPage() {
  const userId = await requireUserId();

  const user = await prisma.user.findUniqueOrThrow({
    where: { id: userId },
    select: {
      name: true,
      email: true,
      dailyGoal: true,
      handleCf: true,
      handleLc: true,
    },
  });

  return (
    <div>
      <PageHeader
        icon={Settings}
        title="Settings"
        description="Your profile, daily target and competitive programming handles."
      />

      <SettingsForm
        profile={{
          name: user.name ?? "",
          email: user.email,
          dailyGoal: user.dailyGoal,
          handleCf: user.handleCf ?? "",
          handleLc: user.handleLc ?? "",
        }}
      />
    </div>
  );
}
