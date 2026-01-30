/**
 * Single Project API Routes
 * GET /api/projects/[id] - Get project details
 * PUT /api/projects/[id] - Update project
 * DELETE /api/projects/[id] - Delete project
 */

import { NextRequest, NextResponse } from "next/server";
import { getDatabase } from "@/lib/db";
import { generateEmbedCode } from "@/lib/script-generator";
import type { Project, Variation } from "@/lib/types";

interface RouteParams {
  params: Promise<{ id: string }>;
}

/**
 * GET /api/projects/[id]
 * Get a single project with its embed script and stats
 */
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const db = getDatabase();

    const project = db
      .prepare(
        `
      SELECT id, name, domain, description, is_active, created_at, updated_at
      FROM projects
      WHERE id = ?
    `,
      )
      .get(id) as
      | {
          id: string;
          name: string;
          domain: string;
          description: string | null;
          is_active: number;
          created_at: string;
          updated_at: string;
        }
      | undefined;

    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    // Get variation stats
    const stats = db
      .prepare(
        `
      SELECT variation, COUNT(*) as count
      FROM visitor_events
      WHERE project_id = ?
      GROUP BY variation
    `,
      )
      .all(id) as Array<{ variation: string; count: number }>;

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

    const apiEndpoint =
      process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    const embedScript = generateEmbedCode(project.id, apiEndpoint);

    const result: Project & {
      embedScript: string;
      stats: { totalVisitors: number; variations: Record<Variation, number> };
    } = {
      id: project.id,
      name: project.name,
      domain: project.domain,
      description: project.description,
      isActive: project.is_active === 1,
      createdAt: project.created_at,
      updatedAt: project.updated_at,
      embedScript,
      stats: {
        totalVisitors,
        variations: variationCounts,
      },
    };

    return NextResponse.json(result);
  } catch (error) {
    console.error("Error getting project:", error);
    return NextResponse.json(
      { error: "Failed to get project" },
      { status: 500 },
    );
  }
}

/**
 * PUT /api/projects/[id]
 * Update a project
 */
export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { name, domain, description, isActive } = body;

    const db = getDatabase();

    // Check if project exists
    const existing = db.prepare("SELECT id FROM projects WHERE id = ?").get(id);
    if (!existing) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    const now = new Date().toISOString();

    // Build update query dynamically
    const updates: string[] = [];
    const values: (string | number)[] = [];

    if (name !== undefined) {
      updates.push("name = ?");
      values.push(name.trim());
    }
    if (domain !== undefined) {
      updates.push("domain = ?");
      values.push(domain.trim());
    }
    if (description !== undefined) {
      updates.push("description = ?");
      values.push(description?.trim() || null);
    }
    if (isActive !== undefined) {
      updates.push("is_active = ?");
      values.push(isActive ? 1 : 0);
    }

    if (updates.length === 0) {
      return NextResponse.json(
        { error: "No fields to update" },
        { status: 400 },
      );
    }

    updates.push("updated_at = ?");
    values.push(now);
    values.push(id);

    db.prepare(
      `
      UPDATE projects
      SET ${updates.join(", ")}
      WHERE id = ?
    `,
    ).run(...values);

    // Return updated project
    const updated = db
      .prepare(
        `
      SELECT id, name, domain, description, is_active, created_at, updated_at
      FROM projects
      WHERE id = ?
    `,
      )
      .get(id) as {
      id: string;
      name: string;
      domain: string;
      description: string | null;
      is_active: number;
      created_at: string;
      updated_at: string;
    };

    return NextResponse.json({
      id: updated.id,
      name: updated.name,
      domain: updated.domain,
      description: updated.description,
      isActive: updated.is_active === 1,
      createdAt: updated.created_at,
      updatedAt: updated.updated_at,
    });
  } catch (error) {
    console.error("Error updating project:", error);
    return NextResponse.json(
      { error: "Failed to update project" },
      { status: 500 },
    );
  }
}

/**
 * DELETE /api/projects/[id]
 * Delete a project and its visitor events
 */
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const db = getDatabase();

    // Check if project exists
    const existing = db.prepare("SELECT id FROM projects WHERE id = ?").get(id);
    if (!existing) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    // Delete visitor events first (foreign key)
    db.prepare("DELETE FROM visitor_events WHERE project_id = ?").run(id);

    // Delete project
    db.prepare("DELETE FROM projects WHERE id = ?").run(id);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting project:", error);
    return NextResponse.json(
      { error: "Failed to delete project" },
      { status: 500 },
    );
  }
}
