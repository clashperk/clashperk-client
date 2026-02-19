/* eslint-disable @next/next/no-page-custom-font */
"use client";

import {
  AlertTriangle,
  Fingerprint,
  Home,
  LogOut,
  RefreshCw,
} from "lucide-react";
import { signOut } from "next-auth/react";

const styles = {
  body: {
    fontFamily:
      "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    background: "#0a0a0a",
    color: "#fafafa",
    minHeight: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
    margin: 0,
    padding: 0,
  },
  container: {
    position: "relative" as const,
    zIndex: 1,
    display: "flex",
    flexDirection: "column" as const,
    alignItems: "center",
    gap: 28,
    maxWidth: 480,
    width: "100%",
    padding: "40px 32px",
  },
  iconWrapper: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    width: 64,
    height: 64,
    borderRadius: 16,
    background: "rgba(239,68,68,0.1)",
    border: "1px solid rgba(239,68,68,0.15)",
  },
  textGroup: {
    textAlign: "center" as const,
    display: "flex",
    flexDirection: "column" as const,
    gap: 10,
  },
  heading: {
    fontSize: 22,
    fontWeight: 700,
    letterSpacing: "-0.02em",
    color: "#fafafa",
    lineHeight: 1.3,
    margin: 0,
  },
  description: {
    fontSize: 14,
    color: "#a1a1aa",
    lineHeight: 1.6,
    maxWidth: 360,
    margin: "0 auto",
  },
  errorMessage: {
    width: "100%",
    padding: "12px 16px",
    background: "rgba(255,255,255,0.03)",
    border: "1px solid rgba(255,255,255,0.06)",
    borderRadius: 10,
    fontSize: 13,
    color: "#d4d4d8",
    lineHeight: 1.5,
    fontFamily: "'SF Mono', 'Fira Code', 'Fira Mono', monospace",
    wordBreak: "break-word" as const,
    textAlign: "left" as const,
    boxSizing: "border-box" as const,
  },
  errorDigest: {
    display: "inline-flex",
    alignItems: "center",
    gap: 6,
    padding: "6px 14px",
    background: "rgba(239,68,68,0.06)",
    border: "1px solid rgba(239,68,68,0.12)",
    borderRadius: 8,
    fontSize: 12,
    color: "#f87171",
    fontFamily: "'SF Mono', 'Fira Code', 'Fira Mono', monospace",
    wordBreak: "break-all" as const,
  },
  buttonGroup: {
    display: "flex",
    gap: 10,
    width: "100%",
  },
  btn: {
    flex: 1,
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    padding: "12px 20px",
    borderRadius: 12,
    fontSize: 14,
    fontWeight: 600,
    fontFamily: "inherit",
    cursor: "pointer",
    transition: "all 0.2s cubic-bezier(0.22, 1, 0.36, 1)",
    border: "none",
    outline: "none",
    textDecoration: "none",
  },
  btnPrimary: {
    background: "linear-gradient(135deg, #6366f1, #818cf8)",
    color: "#fff",
    boxShadow: "0 1px 2px rgba(0,0,0,0.2), 0 0 0 1px rgba(99,102,241,0.2)",
  },
  btnLogout: {
    background: "rgba(239,68,68,0.08)",
    color: "#f87171",
    border: "1px solid rgba(239,68,68,0.15)",
  },
  btnGhost: {
    width: "100%",
    background: "rgba(255,255,255,0.04)",
    color: "#a1a1aa",
    border: "1px solid rgba(255,255,255,0.08)",
  },
  divider: {
    display: "flex",
    alignItems: "center",
    gap: 12,
    width: "100%",
    color: "#52525b",
    fontSize: 12,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    background: "rgba(255,255,255,0.06)",
  },
} as const;

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => unknown;
}) {
  const handleLogout = () => {
    signOut({ callbackUrl: "/login" });
  };

  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>Something went wrong — ClashPerk</title>
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap"
        />
      </head>
      <body style={styles.body}>
        <div style={styles.container}>
          <div style={styles.iconWrapper}>
            <AlertTriangle size={28} color="#f87171" />
          </div>

          <div style={styles.textGroup}>
            <h2 style={styles.heading}>Something went wrong</h2>
            <p style={styles.description}>
              An unexpected error occurred while processing your request. You
              can try again or sign out to start fresh.
            </p>
          </div>

          {error.message && (
            <div style={styles.errorMessage}>{error.message}</div>
          )}

          {error.digest && (
            <div style={styles.errorDigest}>
              <Fingerprint size={14} />
              {error.digest}
            </div>
          )}

          <div style={styles.buttonGroup}>
            <button
              style={{ ...styles.btn, ...styles.btnPrimary }}
              onClick={() => reset()}
            >
              <RefreshCw size={16} />
              Try Again
            </button>
            <button
              style={{ ...styles.btn, ...styles.btnLogout }}
              onClick={handleLogout}
            >
              <LogOut size={16} />
              Sign Out
            </button>
          </div>

          <div style={styles.divider}>
            <div style={styles.dividerLine} />
            or
            <div style={styles.dividerLine} />
          </div>

          <a href="/login" style={{ ...styles.btn, ...styles.btnGhost }}>
            <Home size={16} />
            Back to Login
          </a>
        </div>
      </body>
    </html>
  );
}
