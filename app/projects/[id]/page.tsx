"use client";

import { useEffect, useState, use } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface ProjectStats {
  totalVisitors: number;
  variations: {
    A: number;
    B: number;
    C: number;
    D: number;
  };
}

interface Project {
  id: string;
  name: string;
  domain: string;
  description: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  embedScript: string;
  stats: ProjectStats;
}

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function ProjectDetailPage({ params }: PageProps) {
  const { id } = use(params);
  const router = useRouter();

  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useEffect(() => {
    fetchProject();
  }, [id]);

  async function fetchProject() {
    try {
      const res = await fetch(`/api/projects/${id}`);
      if (!res.ok) {
        if (res.status === 404) throw new Error("Project not found");
        throw new Error("Failed to fetch project");
      }
      const data = await res.json();
      setProject(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  }

  async function copyToClipboard() {
    if (!project) return;
    try {
      await navigator.clipboard.writeText(project.embedScript);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  }

  async function handleDelete() {
    if (!project) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/projects/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete project");
      router.push("/projects");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete");
      setDeleting(false);
      setShowDeleteConfirm(false);
    }
  }

  async function toggleActive() {
    if (!project) return;
    try {
      const res = await fetch(`/api/projects/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !project.isActive }),
      });
      if (!res.ok) throw new Error("Failed to update project");
      const updated = await res.json();
      setProject({ ...project, isActive: updated.isActive });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update");
    }
  }

  if (loading) {
    return (
      <div
        className="animate-fadeIn"
        style={{ maxWidth: "900px", margin: "0 auto" }}
      >
        <div style={{ marginBottom: "1.5rem" }}>
          <div
            className="animate-pulse"
            style={{
              height: "0.875rem",
              width: "80px",
              background: "var(--muted)",
              borderRadius: "0.25rem",
              marginBottom: "0.75rem",
            }}
          />
          <div
            className="animate-pulse"
            style={{
              height: "1.5rem",
              width: "250px",
              background: "var(--muted)",
              borderRadius: "0.25rem",
            }}
          />
        </div>
        <div className="card" style={{ padding: "1.5rem" }}>
          <div
            className="animate-pulse"
            style={{
              height: "160px",
              background: "var(--muted)",
              borderRadius: "0.5rem",
            }}
          />
        </div>
      </div>
    );
  }

  if (error || !project) {
    return (
      <div
        className="animate-fadeIn"
        style={{
          maxWidth: "480px",
          margin: "0 auto",
          textAlign: "center",
          padding: "2rem",
        }}
      >
        <div
          style={{
            width: "48px",
            height: "48px",
            margin: "0 auto 1rem",
            background: "var(--destructive-light)",
            borderRadius: "12px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="var(--destructive)"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="12" cy="12" r="10" />
            <path d="M15 9l-6 6M9 9l6 6" />
          </svg>
        </div>
        <h2
          style={{
            fontSize: "1.125rem",
            fontWeight: 600,
            marginBottom: "0.375rem",
            color: "#111827",
          }}
        >
          {error || "Project not found"}
        </h2>
        <p
          style={{
            color: "var(--muted-foreground)",
            marginBottom: "1.25rem",
            fontSize: "0.875rem",
          }}
        >
          The project doesn&apos;t exist or has been deleted.
        </p>
        <Link href="/projects" className="btn btn-primary">
          Back to Projects
        </Link>
      </div>
    );
  }

  const totalVisitors = project.stats.totalVisitors;
  const maxVariation = Math.max(...Object.values(project.stats.variations), 1);

  return (
    <div
      className="animate-fadeIn"
      style={{ maxWidth: "900px", margin: "0 auto" }}
    >
      {/* Header */}
      <div style={{ marginBottom: "1.5rem" }}>
        <Link
          href="/projects"
          className="btn btn-ghost"
          style={{
            marginBottom: "0.75rem",
            marginLeft: "-0.75rem",
            fontSize: "0.8125rem",
          }}
        >
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M19 12H5M12 19l-7-7 7-7" />
          </svg>
          Back
        </Link>

        <div
          style={{
            display: "flex",
            alignItems: "flex-start",
            justifyContent: "space-between",
            gap: "1rem",
            flexWrap: "wrap",
          }}
        >
          <div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.625rem",
                marginBottom: "0.25rem",
              }}
            >
              <h1
                style={{
                  fontSize: "1.5rem",
                  fontWeight: 700,
                  color: "#111827",
                }}
              >
                {project.name}
              </h1>
              <span
                className={`badge ${project.isActive ? "badge-success" : ""}`}
              >
                {project.isActive ? "Active" : "Inactive"}
              </span>
            </div>
            <p
              style={{ color: "var(--muted-foreground)", fontSize: "0.875rem" }}
            >
              {project.domain}
              {project.description && <> • {project.description}</>}
            </p>
          </div>

          <div style={{ display: "flex", gap: "0.375rem" }}>
            <button
              onClick={toggleActive}
              className="btn btn-secondary"
              style={{ fontSize: "0.8125rem" }}
            >
              {project.isActive ? "Pause" : "Activate"}
            </button>
            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="btn btn-ghost"
              style={{ color: "var(--destructive)", fontSize: "0.8125rem" }}
            >
              Delete
            </button>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(5, 1fr)",
          gap: "0.75rem",
          marginBottom: "1.5rem",
        }}
      >
        <div className="card" style={{ padding: "1rem" }}>
          <div
            style={{
              fontSize: "0.6875rem",
              color: "var(--muted-foreground)",
              marginBottom: "0.25rem",
              textTransform: "uppercase",
              letterSpacing: "0.025em",
            }}
          >
            Total
          </div>
          <div
            style={{ fontSize: "1.5rem", fontWeight: 700, color: "#111827" }}
          >
            {totalVisitors.toLocaleString()}
          </div>
        </div>
        {(["A", "B", "C", "D"] as const).map((v) => (
          <div key={v} className="card" style={{ padding: "1rem" }}>
            <div
              style={{
                fontSize: "0.6875rem",
                color: "var(--muted-foreground)",
                marginBottom: "0.25rem",
                textTransform: "uppercase",
                letterSpacing: "0.025em",
              }}
            >
              Var {v}
            </div>
            <div
              style={{
                display: "flex",
                alignItems: "baseline",
                gap: "0.375rem",
              }}
            >
              <span
                className={`variation-${v.toLowerCase()}`}
                style={{ fontSize: "1.5rem", fontWeight: 700 }}
              >
                {project.stats.variations[v]}
              </span>
              <span
                style={{
                  fontSize: "0.75rem",
                  color: "var(--muted-foreground)",
                }}
              >
                (
                {totalVisitors > 0
                  ? Math.round(
                      (project.stats.variations[v] / totalVisitors) * 100,
                    )
                  : 0}
                %)
              </span>
            </div>
            <div
              style={{
                marginTop: "0.5rem",
                height: "3px",
                background: "var(--muted)",
                borderRadius: "2px",
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  height: "100%",
                  width: `${(project.stats.variations[v] / maxVariation) * 100}%`,
                  background:
                    v === "A"
                      ? "#6366f1"
                      : v === "B"
                        ? "#10b981"
                        : v === "C"
                          ? "#f59e0b"
                          : "#ef4444",
                  transition: "width 0.3s ease",
                }}
              />
            </div>
          </div>
        ))}
      </div>

      {/* Embed Script */}
      <div className="card" style={{ marginBottom: "1.5rem" }}>
        <div
          className="card-header"
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div>
            <h2
              style={{
                fontSize: "1rem",
                fontWeight: 600,
                color: "#111827",
                marginBottom: "0.125rem",
              }}
            >
              Embed Script
            </h2>
            <p
              style={{ fontSize: "0.75rem", color: "var(--muted-foreground)" }}
            >
              Add this to your website
            </p>
          </div>
          <button
            onClick={copyToClipboard}
            className="btn btn-primary"
            style={{ fontSize: "0.8125rem" }}
          >
            {copied ? (
              <>
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <polyline points="20 6 9 17 4 12" />
                </svg>
                Copied!
              </>
            ) : (
              <>
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                  <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                </svg>
                Copy
              </>
            )}
          </button>
        </div>
        <div className="card-content">
          <div className="code-block">
            <code>{project.embedScript}</code>
          </div>
        </div>
      </div>

      {/* Usage */}
      <div className="card">
        <div className="card-header">
          <h2 style={{ fontSize: "1rem", fontWeight: 600, color: "#111827" }}>
            Usage
          </h2>
        </div>
        <div
          className="card-content"
          style={{ fontSize: "0.875rem", lineHeight: 1.6 }}
        >
          <p style={{ color: "var(--muted-foreground)", marginBottom: "1rem" }}>
            Use CSS selectors to style variations:
          </p>
          <div className="code-block" style={{ marginBottom: "1rem" }}>
            <code>{`[data-optim-variation="A"] .hero { background: blue; }
[data-optim-variation="B"] .hero { background: green; }`}</code>
          </div>
          <p style={{ color: "var(--muted-foreground)", marginBottom: "1rem" }}>
            Or show/hide elements:
          </p>
          <div className="code-block">
            <code>{`<div data-optim-show="A">Only for Variation A</div>
<div data-optim-show="B,C">For B and C</div>`}</code>
          </div>
        </div>
      </div>

      {/* Delete Modal */}
      {showDeleteConfirm && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0, 0, 0, 0.4)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 100,
            padding: "1rem",
          }}
          onClick={() => setShowDeleteConfirm(false)}
        >
          <div
            className="card animate-fadeIn"
            style={{ maxWidth: "360px", width: "100%" }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="card-content" style={{ textAlign: "center" }}>
              <div
                style={{
                  width: "40px",
                  height: "40px",
                  margin: "0 auto 0.875rem",
                  background: "var(--destructive-light)",
                  borderRadius: "10px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="var(--destructive)"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                </svg>
              </div>
              <h3
                style={{
                  fontSize: "1rem",
                  fontWeight: 600,
                  marginBottom: "0.375rem",
                  color: "#111827",
                }}
              >
                Delete Project?
              </h3>
              <p
                style={{
                  color: "var(--muted-foreground)",
                  marginBottom: "1.25rem",
                  fontSize: "0.8125rem",
                }}
              >
                This will permanently delete &quot;{project.name}&quot; and all
                data.
              </p>
              <div
                style={{
                  display: "flex",
                  gap: "0.5rem",
                  justifyContent: "center",
                }}
              >
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="btn btn-secondary"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDelete}
                  className="btn btn-destructive"
                  disabled={deleting}
                >
                  {deleting ? "Deleting..." : "Delete"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
