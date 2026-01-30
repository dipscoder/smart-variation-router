/**
 * Projects API Routes
 * POST /api/projects - Create a new project
 * GET /api/projects - List all projects with stats
 */

import { NextRequest, NextResponse } from "next/server";
import { getDatabase } from "@/lib/db";
import { nanoid } from "nanoid";
import { generateEmbedCode } from "@/lib/script-generator";
import type { Project, ProjectWithStats, Variation } from "@/lib/types";

// Generate project ID with prefix
function generateProjectId(): string {
  return `proj_${nanoid(12)}`;
}

/**
 * POST /api/projects
 * Create a new project
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, domain, description } = body;

    // Validation
    if (!name || typeof name !== "string" || name.trim().length === 0) {
      return NextResponse.json({ error: "Name is required" }, { status: 400 });
    }

    if (!domain || typeof domain !== "string" || domain.trim().length === 0) {
      return NextResponse.json(
        { error: "Domain is required" },
        { status: 400 },
      );
    }

    const db = getDatabase();
    const id = generateProjectId();
    const now = new Date().toISOString();

    // Insert the project
    const stmt = db.prepare(`
      INSERT INTO projects (id, name, domain, description, is_active, created_at, updated_at)
      VALUES (?, ?, ?, ?, 1, ?, ?)
    `);

    stmt.run(
      id,
      name.trim(),
      domain.trim(),
      description?.trim() || null,
      now,
      now,
    );

    // Get the API endpoint for embed code
    const apiEndpoint =
      process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    const embedScript = generateEmbedCode(id, apiEndpoint);

    const project: Project = {
      id,
      name: name.trim(),
      domain: domain.trim(),
      description: description?.trim() || null,
      isActive: true,
      createdAt: now,
      updatedAt: now,
    };

    return NextResponse.json({ ...project, embedScript }, { status: 201 });
  } catch (error) {
    console.error("Error creating project:", error);
    return NextResponse.json(
      { error: "Failed to create project" },
      { status: 500 },
    );
  }
}

/**
 * GET /api/projects
 * List all projects with optional stats
 */
export async function GET() {
  try {
    const db = getDatabase();

    // Get all projects
    const projects = db
      .prepare(
        `
      SELECT id, name, domain, description, is_active, created_at, updated_at
      FROM projects
      ORDER BY created_at DESC
    `,
      )
      .all() as Array<{
      id: string;
      name: string;
      domain: string;
      description: string | null;
      is_active: number;
      created_at: string;
      updated_at: string;
    }>;

    // Get stats for each project
    const projectsWithStats: ProjectWithStats[] = projects.map((p) => {
      // Get variation counts
      const stats = db
        .prepare(
          `
        SELECT variation, COUNT(*) as count
        FROM visitor_events
        WHERE project_id = ?
        GROUP BY variation
      `,
        )
        .all(p.id) as Array<{ variation: string; count: number }>;

      const variationCounts: Record<Variation, number> = {
        A: 0,
        B: 0,
        C: 0,
        D: 0,
      };
      let totalVisitors = 0;

      stats.forEach((s) => {
        if (s.variation in variationCounts) {
          variationCounts[s.variation as Variation] = s.count;
          totalVisitors += s.count;
        }
      });

      return {
        id: p.id,
        name: p.name,
        domain: p.domain,
        description: p.description,
        isActive: p.is_active === 1,
        createdAt: p.created_at,
        updatedAt: p.updated_at,
        stats: {
          totalVisitors,
          variations: variationCounts,
        },
      };
    });

    return NextResponse.json({ projects: projectsWithStats });
  } catch (error) {
    console.error("Error listing projects:", error);
    return NextResponse.json(
      { error: "Failed to list projects" },
      { status: 500 },
    );
  }
}
