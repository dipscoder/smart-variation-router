# Smart Variation Router - Design Document

## Overview

This document outlines the architectural decisions and tradeoffs made in building the Smart Variation Router, an A/B testing platform with embeddable scripts.

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                     SAAS DASHBOARD (Next.js)                    │
│  - Create/manage A/B testing projects                           │
│  - Generate unique embed scripts per project                    │
│  - View visitor analytics and variation distribution            │
└─────────────────────────────────────────────────────────────────┘
                              │
                              │ API Routes (Next.js App Router)
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                        API LAYER                                 │
│  POST /api/projects      → Create project                        │
│  GET  /api/projects      → List projects                         │
│  GET  /api/projects/[id] → Get project + stats                   │
│  GET  /api/s/[id]        → Serve JavaScript embed script         │
│  GET  /api/track         → Record visitor variation assignment   │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                     STORAGE (SQLite)                             │
│  - projects: id, name, domain, description, timestamps           │
│  - visitor_events: id, project_id, visitor_id, variation, ts     │
└─────────────────────────────────────────────────────────────────┘

                    ═══════════════════════════════
                         CLIENT WEBSITE SIDE
                    ═══════════════════════════════

┌─────────────────────────────────────────────────────────────────┐
│              CLIENT WEBSITE (e.g., example.com)                 │
│                                                                 │
│  <script src="https://your-app.com/api/s/proj_abc123"></script> │
│                              │                                  │
│                              ▼                                  │
│  ┌───────────────────────────────────────────────────────────┐ │
│  │                    EMBED SCRIPT                           │ │
│  │  1. Get/create visitor ID (localStorage)                  │ │
│  │  2. Hash(visitorId + projectId) → deterministic number    │ │
│  │  3. number % 4 → Variation A/B/C/D                        │ │
│  │  4. Apply variation (URL param or DOM modification)       │ │
│  │  5. Track assignment (image beacon)                       │ │
│  └───────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
```

## Key Design Decisions

### 1. Deterministic Variation Assignment

**Decision:** Use djb2 hash algorithm for consistent visitor-to-variation mapping.

**Why:**

- Same visitor always gets same variation (critical for valid A/B tests)
- No server-side state needed for assignment logic
- Can be computed entirely client-side
- Hash distribution is statistically uniform

**Alternative considered:** Server-side assignment with database lookup

- Rejected due to latency and complexity

### 2. SQLite for Storage

**Decision:** Use better-sqlite3 for all data persistence.

**Why:**

- Zero configuration required
- Synchronous API simplifies code
- Excellent read performance for analytics queries
- Single file makes deployment simple

**When to reconsider:**

- Multiple server instances (need shared database)
- > 10,000 writes/second (need PostgreSQL or similar)

### 3. Image Beacon for Tracking

**Decision:** Use `new Image().src` for tracking instead of `fetch()`.

**Why:**

- Works with strict CSP policies that block fetch
- Fire-and-forget (no callback needed)
- Minimal code footprint
- Cannot be easily blocked by ad blockers targeting XHR

### 4. IIFE Script Isolation

**Decision:** Wrap all embed script code in an IIFE with namespaced globals.

**Why:**

- Prevents variable conflicts with host page
- Multiple instances can coexist (multiple projects on same page)
- No global pollution

```javascript
(function () {
  var OPTIM = (window.__OPTIMELEON__ = window.__OPTIMELEON__ || {});
  // All code uses OPTIM namespace
})();
```

### 5. Visitor ID in localStorage

**Decision:** Store visitor ID in localStorage, not cookies.

**Why:**

- Simpler API
- No size limitations
- Not sent with every HTTP request
- GDPR-friendlier (no cookie consent popups needed for functional cookies)

**Fallback:** Generate session-based ID if localStorage unavailable

## Data Models

### Project

```typescript
interface Project {
  id: string; // nanoid, e.g., "proj_V1StGXR8_Z5jdHi"
  name: string; // Human-readable name
  domain: string; // Target domain for validation
  description: string; // Optional description
  is_active: boolean; // Enable/disable flag
  created_at: string; // ISO timestamp
  updated_at: string; // ISO timestamp
}
```

### VisitorEvent

```typescript
interface VisitorEvent {
  id: string; // nanoid
  project_id: string; // Foreign key to project
  visitor_id: string; // Client-generated visitor ID
  variation: string; // 'A' | 'B' | 'C' | 'D'
  timestamp: string; // ISO timestamp
  user_agent: string; // Browser UA string
  referrer: string; // HTTP referer
}
```

## API Design

### RESTful Conventions

- Use plural nouns for resources (`/projects` not `/project`)
- Return created resources on POST
- Use HTTP status codes semantically (201 Created, 404 Not Found)
- Include timestamps in ISO 8601 format

### Embed Script Endpoint

`GET /api/s/[projectId]`

Returns raw JavaScript with `Content-Type: application/javascript`.

The script is dynamically generated with:

- Project ID baked in
- API endpoint URL configured
- All logic self-contained

## Security Considerations

### XSS Prevention

- No user input is interpolated into script code without sanitization
- Project IDs are validated (alphanumeric + underscore only)
- Domain names are validated before storage

### Rate Limiting

The tracking endpoint should be rate-limited:

- By IP: 100 requests/minute
- By project: 10,000 requests/minute

(Not implemented in MVP)

### Domain Validation

Future improvement: Only execute script on whitelisted domains:

```javascript
if (!location.hostname.includes(config.domain)) return;
```

## Performance Considerations

### Script Size

Target: < 2KB minified
Current: ~1.5KB

### Tracking Latency

- Image beacon is non-blocking
- No impact on page load time

### Database Queries

- Projects list: O(n) but cached in memory
- Visitor stats: Aggregation with indexes on (project_id, variation)

## Testing Strategy

### Unit Tests

- Variation assignment determinism
- Hash distribution uniformity
- ID generation uniqueness

### Integration Tests

- API endpoint responses
- Database operations
- Script generation

### Manual Testing

- Embed script on real HTML page
- Verify variation persistence across refreshes
- Test in multiple browsers

## Future Improvements

1. **Authentication:** GitHub OAuth for dashboard access
2. **Real-time Stats:** WebSocket updates for live visitor counts
3. **Statistical Significance:** Calculate confidence levels for variations
4. **Visual Editor:** WYSIWYG variation content editing
5. **CDN Distribution:** Serve scripts from edge locations

---

_This design document reflects the MVP implementation. Production deployment would require additional considerations for scaling, monitoring, and security._
