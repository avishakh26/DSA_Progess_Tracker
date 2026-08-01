import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Toaster } from "sonner";
import "./globals.css";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

export const metadata: Metadata = {
  title: "DSA Journey — Track your competitive programming progress",
  description:
    "A premium tracker for Data Structures, Algorithms and Competitive Programming: 14 phases, unlimited problems, notes, streaks and statistics.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable} h-full`}>
      <body className="min-h-full antialiased">
        {children}
        <Toaster
          theme="dark"
          position="bottom-right"
          toastOptions={{
            style: {
              background: "rgba(30, 41, 59, 0.9)",
              backdropFilter: "blur(12px)",
              border: "1px solid rgba(148, 163, 184, 0.16)",
              color: "#e2e8f0",
            },
          }}
        />
      </body>
    </html>
  );
}
