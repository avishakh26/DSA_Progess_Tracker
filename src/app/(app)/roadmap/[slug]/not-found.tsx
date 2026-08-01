import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export default function TopicNotFound() {
  return (
    <Card className="mx-auto max-w-md p-10 text-center">
      <h1 className="text-lg font-semibold text-slate-100">Topic not found</h1>
      <p className="mt-1 text-sm text-[var(--muted)]">
        That topic doesn&apos;t exist in your roadmap.
      </p>
      <Button asChild variant="secondary" className="mt-4">
        <Link href="/roadmap">Back to the roadmap</Link>
      </Button>
    </Card>
  );
}
