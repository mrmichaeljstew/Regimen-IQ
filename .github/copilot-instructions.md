# RegimenIQ - Copilot Instructions

## Project Overview
Next.js 15 starter app with Appwrite backend integration. Single-page application demonstrating Appwrite connection testing via client ping functionality with real-time logging UI.

## Architecture

### Core Structure
- **Framework**: Next.js 15 (App Router) with React 19
- **Backend**: Appwrite Cloud (project: `regimen-iq`, endpoint: `https://sfo.cloud.appwrite.io/v1`)
- **Styling**: Tailwind CSS v4 with custom checker-pattern background
- **Icons**: `@appwrite.io/pink-icons` package

### Key Files
- [src/lib/appwrite.js](../src/lib/appwrite.js): Centralized Appwrite client configuration (Client, Account, Databases exports)
- [src/app/page.js](../src/app/page.js): Main demo page with connection testing and log viewer
- [src/app/layout.js](../src/app/layout.js): Root layout with Google Fonts (Inter, Poppins, Fira Code)

## Development Workflow

### Setup & Run
```bash
npm install              # Install dependencies
npm run dev             # Start dev server (http://localhost:3000)
npm run build           # Production build
npm start               # Production server
npm run lint            # Run ESLint
```

### Environment Configuration
Create `.env.local` from `.env.example`. Environment variables must use `NEXT_PUBLIC_` prefix to be accessible client-side.

## Code Conventions

### Component Patterns
- **Client Components**: Use `"use client"` directive for all interactive components (required for hooks)
- **State Management**: React hooks (useState, useEffect, useCallback) - see [page.js](../src/app/page.js#L14-L16) for typical pattern
- **Dynamic Heights**: Ref-based height calculation with resize listeners for responsive UI elements ([page.js](../src/app/page.js#L18-L40))

### Styling Approach
- **Tailwind Classes**: Use arbitrary values `w-[40em]`, `text-[#56565C]` for precise design matching
- **Responsive**: Mobile-first with `lg:` breakpoint utilities
- **Animations**: CSS transitions with state-based opacity/visibility toggling
- **Custom CSS**: Global styles in [app.css](../src/app/app.css) for complex backgrounds (checker pattern) and summary marker hiding

### Error Handling
Always catch Appwrite exceptions specifically:
```javascript
try {
  const result = await client.ping();
} catch (err) {
  const status = err instanceof AppwriteException ? err.code : 500;
  const message = err instanceof AppwriteException ? err.message : "Something went wrong";
}
```

### Logging Pattern
Maintain consistent log object structure with `date`, `method`, `path`, `status`, `response` fields for UI display consistency.

## Integration Points

### Appwrite Setup
- Client initialization in [src/lib/appwrite.js](../src/lib/appwrite.js) uses hardcoded credentials (project ID: `regimen-iq`)
- Currently configured services: Client (ping), Account, Databases (not yet utilized)
- All API calls should import from `@/lib/appwrite` for consistency

### Asset Management
- Static SVGs in [src/static/](../src/static/) - imported directly as components via Next.js Image
- Public assets (favicon) in [public/](../public/)

## Formatting
Prettier configured with Tailwind plugin - sorts classes automatically. Run formatting before commits.
