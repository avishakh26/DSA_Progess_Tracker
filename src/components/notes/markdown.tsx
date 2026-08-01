"use client";

import dynamic from "next/dynamic";

export const Markdown = dynamic(
  () => import("./markdown-renderer").then((mod) => mod.MarkdownRenderer),
  { ssr: false }
);
