/**
 * Variation Assignment Logic
 * Deterministic hashing for consistent visitor-to-variation mapping
 */

import type { Variation } from "./types";

/**
 * djb2 hash function
 * A simple, fast, and well-distributed hash function
 * Same input always produces same output (deterministic)
 */
export function hashString(str: string): number {
  let hash = 5381;
  for (let i = 0; i < str.length; i++) {
    // hash * 33 + charCode (using XOR for better distribution)
    hash = (hash * 33) ^ str.charCodeAt(i);
  }
  // Convert to unsigned 32-bit integer
  return hash >>> 0;
}

/**
 * Assign a variation based on visitor ID and project ID
 * This is completely deterministic - same input always gives same output
 *
 * @param visitorId - Unique identifier for the visitor
 * @param projectId - Unique identifier for the project
 * @returns One of 'A', 'B', 'C', or 'D'
 */
export function assignVariation(
  visitorId: string,
  projectId: string,
): Variation {
  // Combine visitor and project IDs with a separator
  const combined = `${visitorId}:${projectId}`;

  // Hash the combined string
  const hash = hashString(combined);

  // Map to one of 4 variations
  const variations: Variation[] = ["A", "B", "C", "D"];
  return variations[hash % 4];
}

/**
 * Generate a unique visitor ID
 * Format: v_<timestamp_base36>_<random_string>
 *
 * Note: This is used on the client side (embed script)
 * The implementation here is for reference/testing
 */
export function generateVisitorId(): string {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substring(2, 11);
  return `v_${timestamp}_${random}`;
}

/**
 * Validate a variation value
 */
export function isValidVariation(value: string): value is Variation {
  return ["A", "B", "C", "D"].includes(value);
}
