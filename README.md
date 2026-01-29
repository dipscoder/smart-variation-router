# Smart Variation Router

A/B testing platform with embeddable scripts for consistent variation assignment. Marketing teams can create projects, get an embed script, and paste it into their websites to automatically assign visitors to variations (A, B, C, or D) with consistent, reproducible logic.

## Quick Start

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Open http://localhost:3000
```

## Tech Stack

- **Framework:** Next.js 16 (App Router)
- **Language:** TypeScript
- **Storage:** SQLite (better-sqlite3)
- **Styling:** Tailwind CSS v4

## Project Structure

```
smart-variation-router/
├── app/                    # Next.js App Router
│   ├── api/               # API routes
│   │   ├── projects/      # Project CRUD endpoints
│   │   ├── s/             # Script serving endpoint
│   │   └── track/         # Visitor tracking endpoint
│   ├── projects/          # Project management pages
│   └── page.tsx           # Dashboard home
├── lib/                    # Core logic
│   ├── db.ts              # SQLite database setup
│   ├── types.ts           # TypeScript interfaces
│   ├── variation.ts       # Variation assignment logic
│   └── script-generator.ts # Embed script generation
├── components/             # React components
├── __tests__/             # Jest test files
└── data/                   # SQLite database directory
```

## Approach

### Problem Statement

A/B testing requires showing different content variations to different visitors while ensuring:

1. **Consistency:** Same visitor always sees the same variation
2. **Reproducibility:** Assignment can be explained without randomness
3. **Safety:** The embed script must never break client websites

### Variation Assignment

We use deterministic hashing (djb2 algorithm) to assign variations:

```typescript
function hashString(str: string): number {
  let hash = 5381;
  for (let i = 0; i < str.length; i++) {
    hash = (hash * 33) ^ str.charCodeAt(i);
  }
  return hash >>> 0;
}

function assignVariation(
  visitorId: string,
  projectId: string,
): "A" | "B" | "C" | "D" {
  const combined = `${visitorId}:${projectId}`;
  const hash = hashString(combined);
  const variations = ["A", "B", "C", "D"];
  return variations[hash % 4];
}
```

This ensures:

- Same input always produces same output
- Roughly even distribution across variations
- No server-side state needed for assignment

### Storage Strategy

SQLite was chosen for:

- **Simplicity:** No external database setup required
- **Performance:** Excellent for read-heavy workloads
- **Portability:** Single file, easy to backup/restore
- **Production-ready:** Can handle significant traffic

## Script Injection Strategy

### How It Works

The embed script uses an IIFE (Immediately Invoked Function Expression) with:

1. **Namespace isolation:** Uses `window.__OPTIMELEON__` to avoid global conflicts
2. **Visitor ID persistence:** localStorage with cookie fallback
3. **Graceful degradation:** Silent failures that never break host sites
4. **Image beacon tracking:** Works even with strict CSP

### Research Findings

Studied patterns from:

- **Segment analytics.js:** Namespace isolation, queue-based loading
- **Google Optimize:** Anti-flicker snippets, CSS-based variations
- **Intercom:** Dynamic script injection, version management

### CSP Considerations

- Scripts served from our domain must be whitelisted by client's CSP
- Tracking uses Image beacons (usually allowed)
- No inline `eval()` or dynamic script creation

## Running Tests

```bash
# Run all tests
npm test

# Watch mode
npm run test:watch

# With coverage
npm run test:coverage
```

## API Endpoints

| Method | Endpoint                    | Description           |
| ------ | --------------------------- | --------------------- |
| POST   | `/api/projects`             | Create new project    |
| GET    | `/api/projects`             | List all projects     |
| GET    | `/api/projects/[id]`        | Get project details   |
| GET    | `/api/projects/[id]/script` | Get embed script HTML |
| GET    | `/api/s/[id]`               | Serve JavaScript file |
| GET    | `/api/track`                | Tracking beacon       |

## What Works vs. What Doesn't

### Complete ✅

- Project CRUD operations
- Deterministic variation assignment
- Embed script generation and serving
- Visitor tracking
- Dashboard UI

### Limitations

- No authentication (could add GitHub OAuth)
- No real-time WebSocket updates
- Basic analytics (no statistical significance)

## Production Considerations

### Scaling

- Add Redis for caching script outputs
- Move to PostgreSQL for horizontal scaling
- CDN for script delivery

### Security

- Validate domain ownership before script activation
- Rate limiting on tracking endpoint
- XSS prevention in script generation

### Monitoring

- Track script load success rates
- Alert on variation distribution anomalies
- Monitor API latency

---

Built for the Optimeleon Full Stack Challenge
