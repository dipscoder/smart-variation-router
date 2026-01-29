/**
 * Core TypeScript interfaces for Smart Variation Router
 */

export interface Project {
  id: string;
  name: string;
  domain: string;
  description: string | null;
  createdAt: string;
  updatedAt: string;
  isActive: boolean;
}

export interface VisitorEvent {
  id: string;
  projectId: string;
  visitorId: string;
  variation: Variation;
  timestamp: string;
  userAgent: string | null;
  referrer: string | null;
}

export type Variation = "A" | "B" | "C" | "D";

export interface CreateProjectInput {
  name: string;
  domain: string;
  description?: string;
}

export interface ProjectWithStats extends Project {
  stats?: {
    totalVisitors: number;
    variations: Record<Variation, number>;
  };
}
