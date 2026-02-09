# CLAUDE.md — AI Assistant Guide for Regimen-IQ

## Project Overview

Regimen-IQ is a Next.js web application for managing cancer treatment regimens. It helps patients and caregivers organize medications, supplements, and therapies, check drug interactions, screen food safety, conduct research, and generate appointment briefs for clinicians.

**Tech stack:** Next.js 15 (App Router) · React 19 · Appwrite (BaaS) · Tailwind CSS 4 · JavaScript (no TypeScript)

**Medical context:** All features are informational only — never generate text that could be interpreted as medical advice. Preserve existing medical disclaimers and "discuss with your healthcare team" messaging throughout the codebase.

## Quick Start

```bash
npm install          # Install dependencies
npm run dev          # Dev server at http://localhost:3000
npm run build        # Production build
npm run lint         # ESLint
npm run setup        # Automated Appwrite collection creation (requires API key in .env.local)
```

## Project Structure

```
src/
├── app/                          # Next.js App Router (file-based routing)
│   ├── page.js                   # Root — redirects to /dashboard or /login
│   ├── layout.js                 # Root layout (metadata, fonts, global CSS)
│   ├── app.css                   # Global styles + Tailwind imports
│   ├── login/page.js             # Login page
│   ├── register/page.js          # Registration page
│   └── dashboard/                # Protected routes
│       ├── layout.js             # Dashboard shell (nav, auth guard)
│       ├── page.js               # Dashboard home
│       ├── patients/             # Patient CRUD + regimen management
│       │   ├── page.js           # Patient list
│       │   ├── new/page.js       # Create patient
│       │   └── [id]/             # Patient detail + regimen
│       ├── appointments/         # Appointment briefs
│       ├── interactions/         # Drug interaction checker
│       ├── food-safety/          # Food safety screener
│       ├── research/             # Research notes workspace
│       └── search/               # Global search
├── components/                   # Reusable React components
│   ├── RegimenList.js            # Regimen item display
│   └── InteractionAlerts.js      # Interaction warning display
└── lib/                          # Business logic & services
    ├── appwrite.js               # Appwrite SDK client init (Client, Account, Databases)
    ├── auth.js                   # Auth functions (register, login, logout, getCurrentUser)
    ├── data.js                   # Centralized data access layer — ALL CRUD operations
    ├── interactions.js           # Drug interaction checking (local knowledge base)
    ├── foodScreener.js           # Food safety screening with fuzzy matching
    └── foodDatabase.js           # ~400 foods with safety data for cancer patients
scripts/
└── setup-appwrite.js             # Automated Appwrite collection/attribute setup
```

## Key Files

| File | Purpose |
|------|---------|
| `src/lib/appwrite.js` | Appwrite SDK initialization — exports `client`, `account`, `databases`, and constants (`DATABASE_ID`, `COLLECTIONS`) |
| `src/lib/auth.js` | Authentication: `registerUser()`, `loginUser()`, `logoutUser()`, `getCurrentUser()`, `isAuthenticated()` |
| `src/lib/data.js` | All CRUD operations for every collection. ~600 lines. Every function returns `{ success, data }` or `{ success, error }` |
| `src/lib/interactions.js` | `checkInteractions(userId, patientId)` — pairwise interaction checking across regimen items |
| `src/lib/foodScreener.js` | `screenFood(input)`, `screenMultipleFoods(input)` — fuzzy-matched food safety screening |
| `src/app/dashboard/layout.js` | Dashboard wrapper — sidebar navigation, auth guard, logout handler |

## Architecture Patterns

### No API Routes
There are no `/api` routes. The app calls Appwrite SDK directly from client components. All data operations live in `src/lib/data.js`.

### Client Components
Nearly all pages use the `"use client"` directive because they rely on hooks (`useState`, `useEffect`, `useRouter`). Always add `"use client"` at the top of any new page or component that uses React hooks or browser APIs.

### Data Access Layer
All database operations go through `src/lib/data.js`. Never call Appwrite SDK directly from page components — use or extend the functions in `data.js`.

Every data function follows this response contract:
```javascript
// Success
{ success: true, data: result }

// Failure
{ success: false, error: "Human-readable message" }
```

### Audit Logging
`logAction(userId, action, resource, resourceId, metadata)` in `data.js` is called after mutations. It is non-blocking (fire-and-forget with `.catch(() => {})`). Preserve this pattern for new mutations.

### JSON Serialization for Appwrite
Complex objects (careTeam arrays, sources arrays) are serialized to JSON strings before storing in Appwrite and parsed back on retrieval. Parse functions (`parsePatient`, `parseInteraction`, `parseResearchNote`) handle this with try-catch fallbacks. Follow this pattern for any new complex fields.

## Code Conventions

### Naming
- **Files:** camelCase for utilities (`foodScreener.js`), PascalCase for components (`RegimenList.js`), `page.js`/`layout.js` for routes
- **Variables/functions:** camelCase (`getPatients`, `handleSubmit`, `isLoading`)
- **React components:** PascalCase (`export default function PatientDetail()`)
- **Constants:** UPPER_SNAKE_CASE (`DATABASE_ID`, `COLLECTIONS`, `ABBREVIATIONS`)

### Imports
```javascript
// Use the @/ path alias (configured in jsconfig.json)
import { getCurrentUser } from "@/lib/auth";
import { getPatients, createPatient } from "@/lib/data";
import Link from "next/link";
import { useRouter } from "next/navigation";
```

### Component Pattern
```javascript
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";

export default function PageName() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    async function load() {
      const user = await getCurrentUser();
      if (!user) { router.push("/login"); return; }
      const result = await fetchData(user.$id);
      if (result.success) setData(result.data);
      setLoading(false);
    }
    load();
  }, []);

  if (loading) return <div>Loading...</div>;
  return (/* JSX */);
}
```

### Error Handling
```javascript
try {
  const result = await someDataOperation();
  if (!result.success) {
    setError(result.error);
    return;
  }
  // success path
} catch (error) {
  setError(error.message);
}
```

### Form Pattern
```javascript
const [formData, setFormData] = useState({ name: "", dosage: "" });

const handleChange = (e) => {
  const { name, value } = e.target;
  setFormData(prev => ({ ...prev, [name]: value }));
};

const handleSubmit = async (e) => {
  e.preventDefault();
  // validate, then call data.js function
};
```

## Routing

### Public Routes
| Path | File |
|------|------|
| `/` | `src/app/page.js` — redirects based on auth state |
| `/login` | `src/app/login/page.js` |
| `/register` | `src/app/register/page.js` |

### Protected Routes (under `/dashboard`)
| Path | Purpose |
|------|---------|
| `/dashboard` | Home with quickstart guide |
| `/dashboard/patients` | Patient list |
| `/dashboard/patients/new` | Create patient |
| `/dashboard/patients/[id]` | Patient detail + regimen |
| `/dashboard/patients/[id]/regimen/new` | Add regimen item |
| `/dashboard/interactions` | Drug interaction checker |
| `/dashboard/food-safety` | Food safety screener |
| `/dashboard/research` | Research notes |
| `/dashboard/appointments` | Appointment briefs |
| `/dashboard/appointments/new` | Create brief |
| `/dashboard/appointments/[id]` | Brief detail |
| `/dashboard/search` | Global search (`?q=query`) |

## Database Collections

Six Appwrite collections (IDs defined in `src/lib/appwrite.js` → `COLLECTIONS`):

| Collection | Key Fields |
|------------|-----------|
| `patients` | userId, name, relationship, diagnosis, diagnosisTags, careTeam (JSON), notes |
| `regimen_items` | userId, patientId, name, category, dosage, frequency, startDate, endDate, isActive |
| `interactions` | userId, patientId, itemIds[], severity (high/moderate/low), description, sources (JSON) |
| `research_notes` | userId, patientId, topic, tags[], content, importance, sources (JSON) |
| `appointment_briefs` | userId, patientId, appointmentDate, doctorName, title, generatedContent, customNotes |
| `audit_log` | userId, action, resource, resourceId, metadata (JSON), timestamp |

Full schema details: [SCHEMA.md](SCHEMA.md)

## Environment Variables

All client-accessible env vars use the `NEXT_PUBLIC_` prefix. Configure in `.env.local` (copy from `.env.example`):

```
NEXT_PUBLIC_APPWRITE_ENDPOINT=https://sfo.cloud.appwrite.io/v1
NEXT_PUBLIC_APPWRITE_PROJECT_ID=<your-project-id>
NEXT_PUBLIC_APPWRITE_DATABASE_ID=regimen-iq-db
```

For the setup script only (server-side, not committed):
```
APPWRITE_API_KEY=<your-api-key>
```

Never commit `.env.local` or API keys.

## Styling

- **Tailwind CSS 4** via PostCSS — configured in `postcss.config.mjs`
- **No CSS modules** — all styles are inline Tailwind classes
- **Prettier plugin** (`prettier-plugin-tailwindcss`) auto-sorts class order
- **Global styles** in `src/app/app.css` (custom backgrounds, print styles)
- **Print styles** exist for appointment brief pages — preserve `@media print` rules
- Use Tailwind arbitrary values when needed: `w-[40em]`, `text-[#56565C]`

## Linting & Formatting

- **ESLint 9** with `eslint-config-next` — run `npm run lint`
- **Prettier 3.6** with Tailwind plugin — sorts Tailwind classes automatically
- No test framework is currently configured

## Important Guidelines for AI Assistants

1. **Medical disclaimers** — Never remove or weaken medical disclaimers. Any new feature that displays health-related information must include appropriate "for informational purposes only" messaging.

2. **`"use client"` directive** — Required at the top of any file using React hooks, event handlers, or browser APIs. Forgetting this causes cryptic build errors.

3. **Data layer consistency** — All new CRUD operations should be added to `src/lib/data.js` following the existing `{ success, data|error }` pattern. Include `logAction()` calls for mutations.

4. **Appwrite SDK** — Import from `@/lib/appwrite` only. The SDK is client-side (browser). There are no server-side Appwrite calls in the app.

5. **JSON field serialization** — When adding complex fields to Appwrite documents, store them as `JSON.stringify()` strings and parse on retrieval with try-catch.

6. **No TypeScript** — This project uses plain JavaScript. Do not introduce `.ts` or `.tsx` files.

7. **User isolation** — All queries filter by `userId`. Never create queries that could return another user's data. Document-level permissions are enforced by Appwrite.

8. **Interaction system** — Currently uses a local knowledge base (`interactions.js`). The architecture anticipates external API integration (DrugBank, RxNorm, OpenFDA). See `TODO` comments in that file.

9. **Food database** — `foodDatabase.js` is a large (~2000 line) static dataset specifically for cancer radiation patients. Modifications should preserve the existing data structure.

10. **localStorage usage** — Used for non-sensitive UI state (quickstart dismissal, unknown food tracking). Never store auth tokens or sensitive data in localStorage.

## Related Documentation

- [README.md](README.md) — Project overview and getting started
- [SCHEMA.md](SCHEMA.md) — Full database schema with all attributes
- [SETUP.md](SETUP.md) — Manual Appwrite setup instructions
- [DEPLOYMENT.md](DEPLOYMENT.md) — Deployment guide
- [PLATFORM-SETUP.md](PLATFORM-SETUP.md) — Appwrite platform configuration
- [FOOD-SAFETY-DESIGN.md](FOOD-SAFETY-DESIGN.md) — Food screening feature design
