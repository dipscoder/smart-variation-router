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

export default function DashboardPage() {
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

  const totalVisitors = projects.reduce(
    (sum, p) => sum + (p.stats?.totalVisitors || 0),
    0,
  );
  const activeProjects = projects.filter((p) => p.isActive).length;

  return (
    <div className="animate-fadeIn">
      {/* Hero Section */}
      <div style={{ marginBottom: "2rem" }}>
        <h1
          style={{
            fontSize: "1.75rem",
            fontWeight: 700,
            color: "#111827",
            marginBottom: "0.375rem",
          }}
        >
          Dashboard
        </h1>
        <p style={{ color: "var(--muted-foreground)", fontSize: "0.9375rem" }}>
          Manage your A/B testing projects and track visitor variations.
        </p>
      </div>

      {/* Quick Stats */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
          gap: "1rem",
          marginBottom: "2rem",
        }}
      >
        <StatCard label="Total Projects" value={projects.length} />
        <StatCard label="Active Tests" value={activeProjects} />
        <StatCard label="Total Visitors" value={totalVisitors} />
      </div>

      {/* Projects Section */}
      <div
        style={{
          marginBottom: "1rem",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <h2 style={{ fontSize: "1rem", fontWeight: 600, color: "#111827" }}>
          Recent Projects
        </h2>
        <Link
          href="/projects/new"
          className="btn btn-primary"
          style={{ fontSize: "0.8125rem", padding: "0.375rem 0.875rem" }}
        >
          <svg
            width="12"
            height="12"
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
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
            gap: "1rem",
          }}
        >
          {[1, 2, 3].map((i) => (
            <div key={i} className="card" style={{ padding: "1.25rem" }}>
              <div
                style={{
                  height: "1rem",
                  width: "60%",
                  background: "var(--muted)",
                  borderRadius: "0.25rem",
                  marginBottom: "0.5rem",
                }}
                className="animate-pulse"
              />
              <div
                style={{
                  height: "0.75rem",
                  width: "40%",
                  background: "var(--muted)",
                  borderRadius: "0.25rem",
                  marginBottom: "1rem",
                }}
                className="animate-pulse"
              />
              <div
                style={{
                  height: "2.5rem",
                  background: "var(--muted)",
                  borderRadius: "0.25rem",
                }}
                className="animate-pulse"
              />
            </div>
          ))}
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
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
            gap: "1rem",
          }}
        >
          {projects.map((project) => (
            <ProjectCard key={project.id} project={project} />
          ))}
        </div>
      )}
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="card" style={{ padding: "1rem" }}>
      <div
        style={{
          fontSize: "0.75rem",
          color: "var(--muted-foreground)",
          marginBottom: "0.25rem",
          textTransform: "uppercase",
          letterSpacing: "0.025em",
        }}
      >
        {label}
      </div>
      <div style={{ fontSize: "1.5rem", fontWeight: 700, color: "#111827" }}>
        {value.toLocaleString()}
      </div>
    </div>
  );
}

function ProjectCard({ project }: { project: Project }) {
  const totalVisitors = project.stats?.totalVisitors || 0;

  return (
    <Link
      href={`/projects/${project.id}`}
      style={{ textDecoration: "none", color: "inherit" }}
    >
      <div
        className="card"
        style={{
          padding: "1.25rem",
          cursor: "pointer",
          transition: "border-color 0.15s",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "flex-start",
            justifyContent: "space-between",
            marginBottom: "0.5rem",
          }}
        >
          <div>
            <h3
              style={{
                fontSize: "0.9375rem",
                fontWeight: 600,
                marginBottom: "0.125rem",
                color: "#111827",
              }}
            >
              {project.name}
            </h3>
            <p
              style={{
                fontSize: "0.8125rem",
                color: "var(--muted-foreground)",
              }}
            >
              {project.domain}
            </p>
          </div>
          <span className={`badge ${project.isActive ? "badge-success" : ""}`}>
            {project.isActive ? "Active" : "Inactive"}
          </span>
        </div>

        <div className="stats-grid" style={{ marginTop: "1rem" }}>
          {(["A", "B", "C", "D"] as const).map((variation) => (
            <div key={variation} className="stat-item">
              <div
                className={`stat-value variation-${variation.toLowerCase()}`}
                style={{ fontSize: "1rem" }}
              >
                {project.stats?.variations[variation] || 0}
              </div>
              <div className="stat-label">{variation}</div>
            </div>
          ))}
        </div>

        <div
          style={{
            marginTop: "0.875rem",
            paddingTop: "0.875rem",
            borderTop: "1px solid var(--border)",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <span
            style={{ fontSize: "0.75rem", color: "var(--muted-foreground)" }}
          >
            {totalVisitors.toLocaleString()} visitors
          </span>
          <span
            style={{ fontSize: "0.75rem", color: "var(--muted-foreground)" }}
          >
            {new Date(project.createdAt).toLocaleDateString()}
          </span>
        </div>
      </div>
    </Link>
  );
}
