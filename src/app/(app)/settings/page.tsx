import { Settings } from "lucide-react";
import { requireUserId } from "@/auth";
import { prisma } from "@/lib/prisma";
import { getDashboardStats } from "@/lib/queries";
import { PageHeader } from "@/components/layout/page-header";
import { SettingsForm, SettingsDangerZone, ThemeSettings } from "@/components/settings/settings-form";
import { ProgressPieChart } from "@/components/settings/progress-pie-chart";

export const metadata = { title: "Settings — DSA Journey" };

export default async function SettingsPage() {
  const userId = await requireUserId();

  const [user, stats] = await Promise.all([
    prisma.user.findUniqueOrThrow({
      where: { id: userId },
      select: {
        name: true,
        email: true,
        dailyGoal: true,
        handleCf: true,
        handleLc: true,
        image: true,
      },
    }),
    getDashboardStats(userId),
  ]);

  return (
    <div className="mx-auto max-w-5xl">
      <PageHeader
        icon={Settings}
        title="Settings"
        description="Your profile, daily target and competitive programming handles."
      />

      <div className="grid gap-6 lg:grid-cols-2">
        <SettingsForm
          profile={{
            name: user.name ?? "",
            email: user.email,
            dailyGoal: user.dailyGoal,
            handleCf: user.handleCf ?? "",
            handleLc: user.handleLc ?? "",
            image: user.image,
          }}
        />

        <div className="flex flex-col gap-6">
          <ThemeSettings />
          <ProgressPieChart stats={stats} />
          <SettingsDangerZone />
        </div>
      </div>
    </div>
  );
}
