/**
 * Script Serving Endpoint
 * GET /api/s/[id] - Serve the embed script as JavaScript
 */

import { NextRequest, NextResponse } from "next/server";
import { getDatabase } from "@/lib/db";
import { generateEmbedScript } from "@/lib/script-generator";

interface RouteParams {
  params: Promise<{ id: string }>;
}

/**
 * GET /api/s/[id]
 * Serve the embed script as a JavaScript file
 */
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const db = getDatabase();

    // Verify project exists and is active
    const project = db
      .prepare(
        `
      SELECT id, is_active
      FROM projects
      WHERE id = ?
    `,
      )
      .get(id) as { id: string; is_active: number } | undefined;

    if (!project) {
      // Return empty script with error comment for debugging
      const errorScript = `/* Optimeleon: Project not found */`;
      return new NextResponse(errorScript, {
        status: 200, // Return 200 to avoid breaking client site
        headers: {
          "Content-Type": "application/javascript",
          "Cache-Control": "no-cache, no-store, must-revalidate",
        },
      });
    }

    if (project.is_active !== 1) {
      // Return empty script for inactive projects
      const inactiveScript = `/* Optimeleon: Project is inactive */`;
      return new NextResponse(inactiveScript, {
        status: 200,
        headers: {
          "Content-Type": "application/javascript",
          "Cache-Control": "no-cache, no-store, must-revalidate",
        },
      });
    }

    // Generate the embed script
    const apiEndpoint =
      process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    const script = generateEmbedScript(project.id, apiEndpoint);

    return new NextResponse(script, {
      status: 200,
      headers: {
        "Content-Type": "application/javascript",
        "Cache-Control": "public, max-age=300", // Cache for 5 minutes
        "Access-Control-Allow-Origin": "*", // Allow cross-origin requests
      },
    });
  } catch (error) {
    console.error("Error serving script:", error);

    // Return empty script with error - never break client site
    const errorScript = `/* Optimeleon: Internal error */`;
    return new NextResponse(errorScript, {
      status: 200,
      headers: {
        "Content-Type": "application/javascript",
        "Cache-Control": "no-cache",
      },
    });
  }
}
