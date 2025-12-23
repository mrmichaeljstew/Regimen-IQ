# RegimenIQ

A Next.js application for managing cancer and life-threatening illness treatment regimens. RegimenIQ helps patients and caregivers organize medications, supplements, therapies, track potential interactions, conduct research, and generate clinician-friendly appointment briefs.

## ⚠️ Medical Disclaimer

**This application is for informational and organizational purposes only. It does not constitute medical advice, diagnosis, or treatment. Always consult qualified healthcare professionals before making any decisions regarding medical treatment. RegimenIQ does not replace professional medical advice or the patient-physician relationship.**

## Features

### 1. Patient Management
- Create and manage multiple patient profiles (self or dependents)
- Track diagnosis, care team contacts, and notes
- Organize patients by relationship and diagnosis tags

### 2. Regimen Tracking
- Add medications, supplements, therapies, and other treatments
- Track dosage, frequency, prescriber, and dates
- Mark items as active or inactive
- Categorize by type with visual indicators

### 3. Interaction Checking
- Automatic detection of potential drug/supplement interactions
- Severity-based flagging (high, moderate, low)
- Source citations for all interactions
- Educational disclaimers and guidance on discussing with healthcare team
- **Note:** Currently uses local knowledge base; designed for future external API integration

### 4. Research Workspace
- Save and organize treatment-related research
- Tag notes by topic for easy search
- Link to authoritative sources
- Associate research with specific patients

### 5. Appointment Briefs
- Generate comprehensive 1-2 page summaries for healthcare appointments
- Includes current regimen, flagged interactions, research questions
- Print-friendly format
- Customizable notes section

### 6. Security & Privacy
- User authentication via Appwrite (email/password)
- Document-level permissions ensure user isolation
- Minimal PHI collection (no SSN, full DOB, or addresses)
- Audit trail foundation for tracking actions

## Technology Stack

- **Frontend:** Next.js 15 (App Router), React 19
- **Backend:** Appwrite Cloud (Database, Authentication)
- **Styling:** Tailwind CSS v4
- **Language:** JavaScript (not TypeScript)

## Getting Started

### Prerequisites

- Node.js 18+ installed
- Appwrite Cloud account (free tier available)

### 1. Clone and Install

```bash
git clone https://github.com/mrmichaeljstew/Regimen-IQ.git
cd Regimen-IQ
npm install
```

### 2. Setup Appwrite Backend

**Option A: Automated Setup (Recommended)**

1. Create an Appwrite Cloud account at [cloud.appwrite.io](https://cloud.appwrite.io)
2. Create a new project and database (`regimen-iq-db`)
3. Create an API key with database/collection permissions
4. Add credentials to `.env.local` (see step 3 below)
5. Run the setup script:

```bash
npm run setup
```

This automatically creates all 6 collections with attributes, indexes, and permissions.

**Option B: Manual Setup**

Follow the detailed instructions in [SETUP.md](SETUP.md) to create collections manually through the Appwrite Console.

### 3. Configure Environment

Copy `.env.example` to `.env.local` and add your Appwrite credentials:

```bash
cp .env.example .env.local
```

Edit `.env.local`:
```
NEXT_PUBLIC_APPWRITE_ENDPOINT=https://sfo.cloud.appwrite.io/v1
NEXT_PUBLIC_APPWRITE_PROJECT_ID=your-project-id
NEXT_PUBLIC_APPWRITE_DATABASE_ID=regimen-iq-db
```

### 4. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### 5. Create an Account

Navigate to the register page and create your first user account.

## Project Structure

```
src/
├── app/                          # Next.js App Router pages
│   ├── dashboard/               # Protected dashboard pages
│   │   ├── patients/           # Patient management
│   │   ├── interactions/       # Interaction checking
│   │   ├── research/           # Research workspace
│   │   └── appointments/       # Appointment briefs
│   ├── login/                  # Login page
│   ├── register/               # Registration page
│   ├── layout.js               # Root layout
│   └── page.js                 # Home/redirect page
├── lib/                         # Core business logic
│   ├── appwrite.js             # Appwrite client setup
│   ├── auth.js                 # Authentication utilities
│   ├── data.js                 # Data access layer (CRUD)
│   └── interactions.js         # Interaction checking service
└── components/                  # Reusable React components
    ├── RegimenList.js          # Regimen item display
    └── InteractionAlerts.js    # Interaction warnings
```

## Database Schema

See [SCHEMA.md](SCHEMA.md) for complete database structure including:
- **patients** - Patient profiles
- **regimen_items** - Medications, supplements, therapies
- **interactions** - Flagged interactions
- **research_notes** - Saved research
- **appointment_briefs** - Generated summaries
- **audit_log** - Action tracking

## Key Design Decisions

### 1. Interaction Checking Architecture

The interaction checking system is built with an abstraction layer in `src/lib/interactions.js`. Currently uses a local knowledge base but is designed to integrate with external APIs:

**Planned External APIs:**
- DrugBank API (https://www.drugbank.com/)
- RxNorm (https://rxnav.nlm.nih.gov/)
- OpenFDA (https://open.fda.gov/)
- Memorial Sloan Kettering About Herbs

See `TODO` comments in `src/lib/interactions.js` for integration points.

### 2. No Definitive Medical Claims

All interaction warnings are presented as:
- Informational only
- Requiring discussion with healthcare team
- Source-linked for transparency
- Timestamped for context

### 3. Modular Architecture

- **UI Layer:** React components (client-side)
- **Data Access:** `src/lib/data.js` (CRUD operations)
- **Business Logic:** Domain-specific services (interactions, briefs)
- **Backend:** Appwrite handles auth, database, permissions

### 4. Privacy-First

- Minimal PHI collection
- User-isolated data via document-level permissions
- No cross-user data access
- Audit trail for compliance

## Roadmap

### Short-term
- [ ] PDF export for appointment briefs
- [ ] Enhanced search and filtering
- [ ] Email reminders for medications
- [ ] Mobile-responsive optimizations

### Medium-term
- [ ] External medical database API integration
- [ ] AI-powered research summarization
- [ ] Symptom tracking
- [ ] Lab result tracking

### Long-term
- [ ] FHIR integration for EHR compatibility
- [ ] Multi-language support
- [ ] Caregiver collaboration features
- [ ] Medication adherence tracking

## Development

### Available Scripts

```bash
npm run dev       # Start development server
npm run build     # Production build
npm run start     # Start production server
npm run lint      # Run ESLint
```

### Code Style

- JavaScript (not TypeScript)
- Tailwind CSS for styling
- Client components with `"use client"` directive
- Server components where appropriate (future optimization)

## Contributing

This is a personal project, but feedback and suggestions are welcome via issues.

## License

See [LICENSE](LICENSE) file.

## Support

For questions or issues:
- Create a GitHub issue
- Review [SCHEMA.md](SCHEMA.md) for database structure
- Check Appwrite documentation for backend questions

## Acknowledgments

- Built with [Next.js](https://nextjs.org/)
- Backend powered by [Appwrite](https://appwrite.io/)
- Styled with [Tailwind CSS](https://tailwindcss.com/)

---

**Remember:** This tool is designed to facilitate communication with your healthcare team, not replace it. Always verify medical information with qualified professionals.
