"use client";

import { useEffect } from "react";

/**
 * Last-resort boundary. Catches errors thrown by the root layout itself
 * (fonts, ThemeProvider, Toaster), which the segment-level error.tsx cannot
 * reach. It must render its own <html>/<body> and cannot rely on globals.css.
 */
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Global error boundary caught:", error);
  }, [error]);

  return (
    <html lang="en">
      <body
        style={{
          margin: 0,
          minHeight: "100dvh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "2rem",
          background: "#0f172a",
          color: "#e2e8f0",
          fontFamily: "ui-sans-serif, system-ui, sans-serif",
        }}
      >
        <div style={{ maxWidth: "40rem", width: "100%" }}>
          <h1 style={{ fontSize: "1.125rem", margin: "0 0 0.5rem" }}>
            The app failed to render
          </h1>
          <p style={{ color: "#94a3b8", fontSize: "0.875rem", margin: "0 0 1rem" }}>
            This error came from the root layout.
          </p>
          <pre
            style={{
              maxHeight: "16rem",
              overflow: "auto",
              background: "#131c31",
              border: "1px solid rgba(148,163,184,0.14)",
              borderRadius: "0.5rem",
              padding: "0.75rem",
              fontSize: "0.75rem",
              whiteSpace: "pre-wrap",
            }}
          >
            {error.message || "Unknown error"}
            {error.digest ? `\n\ndigest: ${error.digest}` : ""}
            {error.stack ? `\n\n${error.stack}` : ""}
          </pre>
          <button
            type="button"
            onClick={reset}
            style={{
              marginTop: "1.25rem",
              padding: "0.5rem 0.875rem",
              fontSize: "0.875rem",
              borderRadius: "0.5rem",
              border: "none",
              background: "#3b82f6",
              color: "#fff",
              cursor: "pointer",
            }}
          >
            Try again
          </button>
        </div>
      </body>
    </html>
  );
}
