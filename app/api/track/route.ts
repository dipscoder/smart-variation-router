/**
 * Tracking Beacon Endpoint
 * GET /api/track - Record visitor variation assignments
 *
 * Uses GET with query params because:
 * 1. Image beacons can only use GET
 * 2. Works with strict CSP policies
 * 3. Fire-and-forget pattern
 */

import { NextRequest, NextResponse } from "next/server";
import { getDatabase } from "@/lib/db";
import { nanoid } from "nanoid";
import { isValidVariation } from "@/lib/variation";

// 1x1 transparent GIF pixel
const PIXEL = Buffer.from(
  "R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7",
  "base64",
);

/**
 * GET /api/track
 * Record a visitor variation assignment
 *
 * Query params:
 * - v: visitor ID
 * - p: project ID
 * - var: variation (A, B, C, or D)
 * - t: timestamp (for cache busting)
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    const visitorId = searchParams.get("v");
    const projectId = searchParams.get("p");
    const variation = searchParams.get("var");

    // Validate required params
    if (!visitorId || !projectId || !variation) {
      // Return pixel anyway - don't break client
      return new NextResponse(PIXEL, {
        status: 200,
        headers: {
          "Content-Type": "image/gif",
          "Cache-Control": "no-cache, no-store, must-revalidate",
        },
      });
    }

    // Validate variation
    if (!isValidVariation(variation)) {
      return new NextResponse(PIXEL, {
        status: 200,
        headers: {
          "Content-Type": "image/gif",
          "Cache-Control": "no-cache, no-store, must-revalidate",
        },
      });
    }

    const db = getDatabase();

    // Verify project exists
    const project = db
      .prepare("SELECT id FROM projects WHERE id = ?")
      .get(projectId);
    if (!project) {
      return new NextResponse(PIXEL, {
        status: 200,
        headers: {
          "Content-Type": "image/gif",
          "Cache-Control": "no-cache, no-store, must-revalidate",
        },
      });
    }

    // Get user agent and referrer from headers
    const userAgent = request.headers.get("user-agent") || null;
    const referrer = request.headers.get("referer") || null;

    // Insert visitor event
    const stmt = db.prepare(`
      INSERT INTO visitor_events (id, project_id, visitor_id, variation, timestamp, user_agent, referrer)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);

    stmt.run(
      `evt_${nanoid(12)}`,
      projectId,
      visitorId,
      variation,
      new Date().toISOString(),
      userAgent,
      referrer,
    );

    // Return 1x1 transparent pixel
    return new NextResponse(PIXEL, {
      status: 200,
      headers: {
        "Content-Type": "image/gif",
        "Cache-Control": "no-cache, no-store, must-revalidate",
        "Access-Control-Allow-Origin": "*",
      },
    });
  } catch (error) {
    console.error("Error tracking event:", error);

    // Always return pixel - never break client
    return new NextResponse(PIXEL, {
      status: 200,
      headers: {
        "Content-Type": "image/gif",
        "Cache-Control": "no-cache",
      },
    });
  }
}
