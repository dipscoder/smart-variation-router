import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Link from "next/link";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Smart Variation Router | A/B Testing Platform",
  description:
    "Create and manage A/B tests with embeddable scripts for consistent variation assignment",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {/* Navigation Header */}
        <header
          style={{
            position: "sticky",
            top: 0,
            zIndex: 50,
            background: "white",
            borderBottom: "1px solid var(--border)",
          }}
        >
          <div
            style={{
              maxWidth: "1200px",
              margin: "0 auto",
              padding: "0 1.5rem",
              height: "56px",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            {/* Logo */}
            <Link
              href="/"
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.625rem",
                textDecoration: "none",
                color: "var(--foreground)",
              }}
            >
              <div
                style={{
                  width: "32px",
                  height: "32px",
                  background: "#fc7544",
                  borderRadius: "8px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "white",
                  fontWeight: 700,
                  fontSize: "1rem",
                }}
              >
                O
              </div>
              <span
                style={{ fontWeight: 600, fontSize: "1rem", color: "#111827" }}
              >
                Optimeleon
              </span>
            </Link>

            {/* Navigation */}
            <nav
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.25rem",
              }}
            >
              <Link
                href="/"
                className="btn btn-ghost"
                style={{ fontSize: "0.875rem" }}
              >
                Dashboard
              </Link>
              <Link
                href="/projects"
                className="btn btn-ghost"
                style={{ fontSize: "0.875rem" }}
              >
                Projects
              </Link>
              <Link
                href="/projects/new"
                className="btn btn-primary"
                style={{ fontSize: "0.875rem", marginLeft: "0.5rem" }}
              >
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M12 5v14M5 12h14" />
                </svg>
                New Project
              </Link>
            </nav>
          </div>
        </header>

        {/* Main Content */}
        <main
          style={{
            maxWidth: "1200px",
            margin: "0 auto",
            padding: "2rem 1.5rem 3rem",
            minHeight: "calc(100vh - 56px)",
          }}
        >
          {children}
        </main>

        {/* Footer */}
        <footer
          style={{
            background: "white",
            borderTop: "1px solid var(--border)",
            padding: "1rem",
            textAlign: "center",
            color: "var(--muted-foreground)",
            fontSize: "0.8125rem",
          }}
        >
          Built for Optimeleon Full Stack Challenge
        </footer>
      </body>
    </html>
  );
}
