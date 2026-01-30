"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

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
  stats?: ProjectStats;
}

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchProjects();
  }, []);

  async function fetchProjects() {
    try {
      const res = await fetch("/api/projects");
      if (!res.ok) throw new Error("Failed to fetch projects");
      const data = await res.json();
      setProjects(data.projects || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="animate-fadeIn">
      {/* Header */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: "1.5rem",
        }}
      >
        <div>
          <h1
            style={{
              fontSize: "1.5rem",
              fontWeight: 700,
              color: "#111827",
              marginBottom: "0.25rem",
            }}
          >
            Projects
          </h1>
          <p style={{ color: "var(--muted-foreground)", fontSize: "0.875rem" }}>
            Manage your A/B testing projects
          </p>
        </div>
        <Link href="/projects/new" className="btn btn-primary">
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
      </div>

      {loading ? (
        <div className="card">
          <div style={{ padding: "1.5rem", textAlign: "center" }}>
            <div
              className="animate-pulse"
              style={{
                height: "0.875rem",
                width: "200px",
                margin: "0 auto",
                background: "var(--muted)",
                borderRadius: "0.25rem",
              }}
            />
          </div>
        </div>
      ) : error ? (
        <div
          className="card"
          style={{
            padding: "1.5rem",
            textAlign: "center",
            color: "var(--destructive)",
          }}
        >
          <p>{error}</p>
          <button
            onClick={fetchProjects}
            className="btn btn-secondary"
            style={{ marginTop: "0.75rem" }}
          >
            Try Again
          </button>
        </div>
      ) : projects.length === 0 ? (
        <div
          className="card"
          style={{ padding: "2.5rem", textAlign: "center" }}
        >
          <div
            style={{
              width: "48px",
              height: "48px",
              margin: "0 auto 1rem",
              background: "var(--primary-light)",
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
              stroke="#fc7544"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <rect x="3" y="3" width="18" height="18" rx="2" />
              <path d="M12 8v8M8 12h8" />
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
            No projects yet
          </h3>
          <p
            style={{
              color: "var(--muted-foreground)",
              marginBottom: "1.25rem",
              fontSize: "0.875rem",
            }}
          >
            Create your first A/B testing project to get started.
          </p>
          <Link href="/projects/new" className="btn btn-primary">
            Create Your First Project
          </Link>
        </div>
      ) : (
        <div className="card" style={{ overflow: "hidden" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ borderBottom: "1px solid var(--border)" }}>
                <th
                  style={{
                    padding: "0.75rem 1rem",
                    textAlign: "left",
                    fontWeight: 500,
                    fontSize: "0.75rem",
                    color: "var(--muted-foreground)",
                    textTransform: "uppercase",
                    letterSpacing: "0.05em",
                  }}
                >
                  Project
                </th>
                <th
                  style={{
                    padding: "0.75rem 1rem",
                    textAlign: "left",
                    fontWeight: 500,
                    fontSize: "0.75rem",
                    color: "var(--muted-foreground)",
                    textTransform: "uppercase",
                    letterSpacing: "0.05em",
                  }}
                >
                  Status
                </th>
                <th
                  style={{
                    padding: "0.75rem 1rem",
                    textAlign: "center",
                    fontWeight: 500,
                    fontSize: "0.75rem",
                    color: "var(--muted-foreground)",
                    textTransform: "uppercase",
                    letterSpacing: "0.05em",
                  }}
                >
                  Visitors
                </th>
                <th
                  style={{
                    padding: "0.75rem 1rem",
                    textAlign: "center",
                    fontWeight: 500,
                    fontSize: "0.75rem",
                    color: "var(--muted-foreground)",
                    textTransform: "uppercase",
                    letterSpacing: "0.05em",
                  }}
                >
                  Variations
                </th>
                <th
                  style={{
                    padding: "0.75rem 1rem",
                    textAlign: "right",
                    fontWeight: 500,
                    fontSize: "0.75rem",
                    color: "var(--muted-foreground)",
                    textTransform: "uppercase",
                    letterSpacing: "0.05em",
                  }}
                >
                  Created
                </th>
              </tr>
            </thead>
            <tbody>
              {projects.map((project, index) => (
                <tr
                  key={project.id}
                  className="table-row"
                  style={{
                    borderBottom:
                      index < projects.length - 1
                        ? "1px solid var(--border)"
                        : "none",
                    transition: "background 0.1s",
                  }}
                >
                  <td style={{ padding: "0.75rem 1rem" }}>
                    <Link
                      href={`/projects/${project.id}`}
                      style={{ textDecoration: "none", color: "inherit" }}
                    >
                      <div
                        style={{
                          fontWeight: 500,
                          marginBottom: "0.125rem",
                          color: "#111827",
                          fontSize: "0.875rem",
                        }}
                      >
                        {project.name}
                      </div>
                      <div
                        style={{
                          fontSize: "0.75rem",
                          color: "var(--muted-foreground)",
                        }}
                      >
                        {project.domain}
                      </div>
                    </Link>
                  </td>
                  <td style={{ padding: "0.75rem 1rem" }}>
                    <span
                      className={`badge ${project.isActive ? "badge-success" : ""}`}
                    >
                      {project.isActive ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td
                    style={{
                      padding: "0.75rem 1rem",
                      textAlign: "center",
                      fontWeight: 600,
                      fontSize: "0.875rem",
                    }}
                  >
                    {(project.stats?.totalVisitors || 0).toLocaleString()}
                  </td>
                  <td style={{ padding: "0.75rem 1rem" }}>
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "center",
                        gap: "0.375rem",
                      }}
                    >
                      {(["A", "B", "C", "D"] as const).map((v) => (
                        <span
                          key={v}
                          className={`bg-variation-${v.toLowerCase()}`}
                          style={{
                            padding: "0.125rem 0.375rem",
                            borderRadius: "0.25rem",
                            fontSize: "0.6875rem",
                            fontWeight: 500,
                          }}
                        >
                          <span className={`variation-${v.toLowerCase()}`}>
                            {v}:{project.stats?.variations[v] || 0}
                          </span>
                        </span>
                      ))}
                    </div>
                  </td>
                  <td
                    style={{
                      padding: "0.75rem 1rem",
                      textAlign: "right",
                      fontSize: "0.8125rem",
                      color: "var(--muted-foreground)",
                    }}
                  >
                    {new Date(project.createdAt).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
