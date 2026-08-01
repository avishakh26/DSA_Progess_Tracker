/**
 * Seeds a demo account with a realistic five-month history so the dashboard,
 * heatmap and statistics pages have something to render on a fresh clone.
 *
 *   npm run db:seed
 *   login: demo@dsajourney.dev / demo1234
 */
import "dotenv/config";
import bcrypt from "bcryptjs";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import { PrismaClient } from "../src/generated/prisma";
import { MONTHLY_GOALS, RATING_NODES, TOPICS } from "../src/lib/roadmap-data";

const prisma = new PrismaClient({
  adapter: new PrismaBetterSqlite3({
    url: process.env.DATABASE_URL ?? "file:./prisma/dev.db",
  }),
});

const DEMO_EMAIL = "demo@dsajourney.dev";
const DEMO_PASSWORD = "demo1234";

const PLATFORMS = [
  "CODEFORCES",
  "CODEFORCES",
  "CODEFORCES",
  "LEETCODE",
  "LEETCODE",
  "CODECHEF",
  "ATCODER",
  "GFG",
] as const;

const DIFFICULTIES = ["EASY", "EASY", "MEDIUM", "MEDIUM", "MEDIUM", "HARD"] as const;

/** Deterministic PRNG so re-seeding produces the same demo data. */
function makeRng(seed: number) {
  let s = seed;
  return () => {
    s = (s * 1664525 + 1013904223) % 4294967296;
    return s / 4294967296;
  };
}
const rng = makeRng(20260801);

const pick = <T,>(arr: readonly T[]) => arr[Math.floor(rng() * arr.length)];

function startOfUtcDay(d: Date) {
  return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()));
}

async function main() {
  console.log("→ Resetting demo account…");
  await prisma.user.deleteMany({ where: { email: DEMO_EMAIL } });

  const user = await prisma.user.create({
    data: {
      email: DEMO_EMAIL,
      name: "Demo Coder",
      passwordHash: await bcrypt.hash(DEMO_PASSWORD, 10),
      dailyGoal: 3,
      handleCf: "demo_coder",
      handleLc: "demo_coder",
    },
  });

  console.log("→ Provisioning curriculum…");
  await prisma.topic.createMany({
    data: TOPICS.map((t, index) => ({
      userId: user.id,
      slug: t.slug,
      title: t.title,
      phase: t.phase,
      description: t.description,
      resources: t.resources,
      order: index,
    })),
  });
  await prisma.monthlyGoal.createMany({
    data: MONTHLY_GOALS.map((g) => ({
      userId: user.id,
      month: g.month,
      title: g.title,
      focus: g.focus,
      description: g.description,
      target: g.target,
    })),
  });
  await prisma.ratingNode.createMany({
    data: RATING_NODES.map((n, index) => ({
      userId: user.id,
      rating: n.rating,
      title: n.title,
      focus: n.focus,
      skills: n.skills,
      order: index,
    })),
  });

  const topics = await prisma.topic.findMany({
    where: { userId: user.id },
    orderBy: { order: "asc" },
  });

  // Phases 1–5 finished, 6–8 in progress, the rest untouched.
  console.log("→ Marking progress…");
  for (const topic of topics) {
    if (topic.phase <= 5) {
      await prisma.topic.update({
        where: { id: topic.id },
        data: {
          status: "DONE",
          progress: 100,
          favorite: rng() < 0.15,
          notes:
            topic.slug === "binary-search"
              ? "## Binary search invariant\n\nKeep `lo` always **feasible** and `hi` always **infeasible** (or vice versa) and the loop cannot go wrong.\n\n```cpp\nint lo = 0, hi = n;\nwhile (lo < hi) {\n    int mid = lo + (hi - lo) / 2;\n    if (ok(mid)) hi = mid; else lo = mid + 1;\n}\n// lo == first index where ok() is true\n```\n\n- [x] Wrote it from memory without off-by-one\n- [x] Solved 40 problems\n- [ ] Revisit ternary search"
              : null,
        },
      });
    } else if (topic.phase <= 8) {
      const roll = rng();
      await prisma.topic.update({
        where: { id: topic.id },
        data: {
          status: roll < 0.55 ? "DONE" : roll < 0.85 ? "PENDING" : "SKIP",
          progress: roll < 0.55 ? 100 : Math.floor(rng() * 70),
          favorite: rng() < 0.2,
        },
      });
    }
  }

  console.log("→ Generating solved problems…");
  const eligible = topics.filter((t) => t.phase <= 8);
  const dayCounts = new Map<number, number>();
  const today = startOfUtcDay(new Date());

  const problems: {
    userId: string;
    topicId: string;
    title: string;
    platform: string;
    problemLink: string;
    solutionLink: string | null;
    difficulty: string;
    solvedDate: Date;
    status: string;
    tags: string;
    notes: string | null;
    favorite: boolean;
  }[] = [];

  // ~150 days of history, denser in recent weeks, with realistic rest days.
  for (let daysAgo = 150; daysAgo >= 0; daysAgo--) {
    const recencyBoost = daysAgo < 30 ? 0.3 : 0;
    if (rng() < 0.28 - recencyBoost) continue; // rest day

    const count = 1 + Math.floor(rng() * (daysAgo < 30 ? 5 : 4));
    const date = new Date(today.getTime() - daysAgo * 86_400_000);

    for (let i = 0; i < count; i++) {
      const topic = eligible[Math.floor(rng() * eligible.length)];
      const platform = pick(PLATFORMS);
      const difficulty = pick(DIFFICULTIES);
      const roll = rng();
      const status = roll < 0.82 ? "SOLVED" : roll < 0.93 ? "REVISION" : "ATTEMPTED";
      const idx = problems.length + 1;

      problems.push({
        userId: user.id,
        topicId: topic.id,
        title: `${topic.title.split(" ")[0]} Practice ${idx}`,
        platform,
        problemLink:
          platform === "CODEFORCES"
            ? `https://codeforces.com/problemset/problem/${1500 + (idx % 400)}/${
                "ABCDE"[idx % 5]
              }`
            : `https://leetcode.com/problems/practice-${idx}/`,
        solutionLink:
          rng() < 0.4 ? `https://github.com/demo_coder/cp/blob/main/p${idx}.cpp` : null,
        difficulty,
        solvedDate: new Date(date.getTime() + i * 3_600_000),
        status,
        tags: [topic.slug.split("-")[0], difficulty.toLowerCase(), "practice"]
          .slice(0, 1 + Math.floor(rng() * 3))
          .join(","),
        notes:
          status === "REVISION"
            ? "Got it after a hint — redo this one cold in a week."
            : null,
        favorite: rng() < 0.08,
      });
    }

    dayCounts.set(daysAgo, count);
  }

  await prisma.problem.createMany({ data: problems });

  console.log("→ Building activity heatmap…");
  await prisma.activity.createMany({
    data: [...dayCounts.entries()].map(([daysAgo, count]) => ({
      userId: user.id,
      date: new Date(today.getTime() - daysAgo * 86_400_000),
      count,
    })),
  });

  console.log("→ Setting monthly goal progress…");
  const goalProgress = [100, 100, 92, 68, 25, 0];
  for (let m = 1; m <= 6; m++) {
    await prisma.monthlyGoal.update({
      where: { userId_month: { userId: user.id, month: m } },
      data: { progress: goalProgress[m - 1], completed: goalProgress[m - 1] >= 100 },
    });
  }

  console.log("→ Setting rating roadmap progress…");
  for (const rating of [800, 900, 1000, 1100, 1200]) {
    await prisma.ratingNode.update({
      where: { userId_rating: { userId: user.id, rating } },
      data: { completed: true },
    });
  }

  console.log("→ Adding standalone notes…");
  await prisma.note.createMany({
    data: [
      {
        userId: user.id,
        title: "Contest checklist",
        pinned: true,
        content:
          "## Before submitting\n\n- [ ] Read the constraints **again**\n- [ ] `long long` where it can overflow\n- [ ] Reset globals between test cases\n- [ ] Check n = 1 and n = 0\n- [ ] Print with `'\\n'`, not `endl`",
      },
      {
        userId: user.id,
        title: "Complexity budget",
        content:
          "Roughly 10^8 simple operations per second.\n\n| n | Acceptable |\n|---|---|\n| 10^18 | O(log n) |\n| 10^6 | O(n log n) |\n| 10^5 | O(n √n) |\n| 5000 | O(n²) |\n| 500 | O(n³) |\n| 20 | O(2^n) |",
      },
      {
        userId: user.id,
        title: "Mistakes I keep repeating",
        content:
          "1. Forgetting to clear the adjacency list between test cases.\n2. `int` overflow in prefix sums.\n3. Off-by-one in `upper_bound` when I want the last element ≤ x.",
      },
    ],
  });

  const total = await prisma.problem.count({ where: { userId: user.id } });
  console.log(`\n✓ Seeded demo account with ${total} problems.`);
  console.log(`  login: ${DEMO_EMAIL} / ${DEMO_PASSWORD}\n`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
