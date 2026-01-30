"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function NewProjectPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    name: "",
    domain: "",
    description: "",
  });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to create project");
      }

      const project = await res.json();
      router.push(`/projects/${project.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
      setLoading(false);
    }
  }

  return (
    <div
      className="animate-fadeIn"
      style={{ maxWidth: "560px", margin: "0 auto" }}
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
        <h1
          style={{
            fontSize: "1.5rem",
            fontWeight: 700,
            color: "#111827",
            marginBottom: "0.375rem",
          }}
        >
          Create New Project
        </h1>
        <p style={{ color: "var(--muted-foreground)", fontSize: "0.875rem" }}>
          Set up an A/B test and get an embed script for your website.
        </p>
      </div>

      {/* Form */}
      <div className="card">
        <form onSubmit={handleSubmit}>
          <div
            className="card-content"
            style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}
          >
            {/* Project Name */}
            <div>
              <label htmlFor="name" className="label">
                Project Name{" "}
                <span style={{ color: "var(--destructive)" }}>*</span>
              </label>
              <input
                id="name"
                type="text"
                className="input"
                placeholder="e.g., Homepage Hero Test"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                required
              />
            </div>

            {/* Domain */}
            <div>
              <label htmlFor="domain" className="label">
                Target Domain{" "}
                <span style={{ color: "var(--destructive)" }}>*</span>
              </label>
              <input
                id="domain"
                type="text"
                className="input"
                placeholder="e.g., example.com"
                value={formData.domain}
                onChange={(e) =>
                  setFormData({ ...formData, domain: e.target.value })
                }
                required
              />
            </div>

            {/* Description */}
            <div>
              <label htmlFor="description" className="label">
                Description{" "}
                <span
                  style={{ color: "var(--muted-foreground)", fontWeight: 400 }}
                >
                  (optional)
                </span>
              </label>
              <textarea
                id="description"
                className="input"
                placeholder="What are you testing?"
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                rows={3}
                style={{ resize: "vertical", minHeight: "72px" }}
              />
            </div>

            {/* Error Message */}
            {error && (
              <div
                style={{
                  padding: "0.625rem 0.875rem",
                  background: "var(--destructive-light)",
                  border: "1px solid rgba(239, 68, 68, 0.2)",
                  borderRadius: "0.375rem",
                  color: "var(--destructive)",
                  fontSize: "0.8125rem",
                }}
              >
                {error}
              </div>
            )}
          </div>

          {/* Actions */}
          <div
            style={{
              padding: "1rem 1.25rem",
              borderTop: "1px solid var(--border)",
              display: "flex",
              justifyContent: "flex-end",
              gap: "0.5rem",
            }}
          >
            <Link href="/projects" className="btn btn-secondary">
              Cancel
            </Link>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading || !formData.name || !formData.domain}
            >
              {loading ? "Creating..." : "Create Project"}
            </button>
          </div>
        </form>
      </div>

      {/* Info Card */}
      <div
        className="card"
        style={{
          marginTop: "1rem",
          padding: "1rem",
          background: "var(--surface)",
        }}
      >
        <div style={{ display: "flex", gap: "0.75rem" }}>
          <div style={{ flexShrink: 0, marginTop: "0.125rem" }}>
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#fc7544"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="12" cy="12" r="10" />
              <path d="M12 16v-4M12 8h.01" />
            </svg>
          </div>
          <p
            style={{
              fontSize: "0.8125rem",
              color: "var(--muted-foreground)",
              lineHeight: 1.5,
            }}
          >
            After creating, you&apos;ll get an embed script. Visitors will be
            assigned to variations A, B, C, or D consistently.
          </p>
        </div>
      </div>
    </div>
  );
}
