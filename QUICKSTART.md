# RegimenIQ - Quick Start Guide

Welcome to RegimenIQ! This guide will get you up and running in minutes.

## Prerequisites

Before starting, ensure you have:
- ✅ Node.js 18+ installed
- ✅ An Appwrite Cloud account (free at [cloud.appwrite.io](https://cloud.appwrite.io))
- ✅ Git installed (for cloning)

## 5-Minute Setup

### Step 1: Verify Local Setup (1 minute)

The code is already set up! Check that everything is in place:

```bash
# You should be in /workspaces/Regimen-IQ
pwd

# Install dependencies (if not already done)
npm install
```

### Step 2: Configure Appwrite Backend (3 minutes)

You need to create the Appwrite database and collections. Follow the **detailed guide** in [SETUP.md](SETUP.md).

**Quick Summary:**
1. Log in to [cloud.appwrite.io](https://cloud.appwrite.io)
2. Create a new project
3. Create database: `regimen-iq-db`
4. Create 6 collections (see SETUP.md for attributes)
5. Copy your Project ID

### Step 3: Update Environment Variables (30 seconds)

Edit `.env.local` and replace `regimen-iq` with your actual Appwrite Project ID:

```bash
# Edit .env.local
nano .env.local

# Replace this line:
# NEXT_PUBLIC_APPWRITE_PROJECT_ID=regimen-iq
# With your actual project ID from Appwrite Console
```

Save and exit.

### Step 4: Start the Application (30 seconds)

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## First Time User Flow

### 1. Register Account
- Click "Register" on the homepage
- Create an account with email and password
- You'll be automatically logged in and redirected to the dashboard

### 2. Create Your First Patient Profile
- Click "Add Patient" from the dashboard
- Fill in basic information:
  - Name
  - Relationship (self, spouse, parent, etc.)
  - Diagnosis (optional)
  - Care team contacts (optional)
- Click "Create Patient"

### 3. Add Regimen Items
- From the patient detail page, click "Add Regimen Item"
- Add medications, supplements, or therapies:
  - Item name (e.g., "Pembrolizumab")
  - Category (medication, supplement, therapy, other)
  - Dosage and frequency
  - Prescriber/source
  - Notes
- Click "Add Item"

### 4. Check for Interactions
- Navigate to "Interactions" in the top menu
- The system will automatically check all active regimen items
- Review any flagged interactions
- Note: These are informational only - discuss with your healthcare team

### 5. Save Research Notes
- Navigate to "Research" in the top menu
- Click "New Note"
- Add research topics, findings, and sources
- Tag for easy organization

### 6. Generate Appointment Brief
- Navigate to "Appointments" in the top menu
- Select a patient
- Click "Generate New Brief"
- Add appointment date and custom notes
- Click "Generate Brief"
- View or print the comprehensive summary

## Project Structure

```
RegimenIQ/
├── src/
│   ├── app/              # Next.js pages
│   │   ├── dashboard/   # Protected app pages
│   │   ├── login/       # Authentication
│   │   └── register/
│   ├── lib/             # Core business logic
│   │   ├── appwrite.js  # Backend connection
│   │   ├── auth.js      # Authentication
│   │   ├── data.js      # Data access (CRUD)
│   │   └── interactions.js  # Interaction checking
│   └── components/      # Reusable UI components
├── SCHEMA.md           # Database design
├── SETUP.md            # Appwrite setup guide
├── IMPLEMENTATION.md   # Technical details
└── README.md          # Full documentation
```

## Key Features at a Glance

### 🏥 Patient Management
- Multiple patient profiles
- Diagnosis tracking
- Care team contacts

### 💊 Regimen Tracking
- Medications, supplements, therapies
- Dosage & frequency tracking
- Active/inactive status

### ⚠️ Interaction Checking
- Automatic detection
- Severity levels (high, moderate, low)
- Educational warnings with sources

### 📚 Research Workspace
- Save treatment research
- Organize by tags
- Link to sources

### 📋 Appointment Briefs
- 1-2 page summaries
- Print-friendly format
- Includes regimen + interactions + research

## Troubleshooting

### "Collection not found"
- Ensure all 6 collections are created in Appwrite
- Collection IDs must match exactly (case-sensitive)
- See [SETUP.md](SETUP.md) for details

### "Unauthorized" errors
- Verify your Project ID in `.env.local`
- Ensure document-level permissions are enabled
- Check that "Create documents" is enabled for "All Users"

### Page not loading
- Ensure `npm run dev` is running
- Check for console errors in browser DevTools
- Verify `.env.local` has all required variables

### Interaction checking not working
- Ensure at least 2 active regimen items exist
- The local knowledge base has limited interactions
- See `src/lib/interactions.js` for current coverage

## Important Reminders

### ⚠️ Medical Disclaimer
This application is for **informational purposes only**. It does not constitute medical advice. Always consult qualified healthcare professionals regarding treatment decisions.

### 🔒 Privacy
- Store minimal personal health information
- Never share your login credentials
- Review data regularly

### 💾 Data Backup
- Appwrite Cloud handles backups automatically
- Consider exporting important data periodically
- Keep appointment briefs printed or saved

## Next Steps

1. **Explore Features** - Try all sections (Patients, Interactions, Research, Appointments)
2. **Customize** - Add your actual patient data and regimen
3. **Print a Brief** - Generate and review an appointment brief
4. **Read Full Docs** - See [README.md](README.md) for complete feature documentation
5. **Review Setup** - Follow [SETUP.md](SETUP.md) for Appwrite backend configuration

## Support & Resources

- **Documentation:** [README.md](README.md), [SCHEMA.md](SCHEMA.md), [SETUP.md](SETUP.md)
- **Appwrite Docs:** https://appwrite.io/docs
- **Issues:** Create a GitHub issue for bugs or questions

## Development

### Run Development Server
```bash
npm run dev
```

### Build for Production
```bash
npm run build
npm start
```

### Run Linter
```bash
npm run lint
```

## What's Included Out of the Box

✅ Complete authentication system  
✅ Patient profile management  
✅ Regimen tracking with categories  
✅ Interaction checking (local knowledge base)  
✅ Research note workspace  
✅ Appointment brief generator  
✅ Print-friendly views  
✅ Mobile-responsive design  
✅ Medical disclaimers throughout  
✅ Audit trail for critical actions  
✅ Comprehensive documentation  

## Future Enhancements

The codebase is designed for easy integration with:
- External medical databases (DrugBank, RxNorm, OpenFDA)
- PDF export functionality
- Email notifications
- Symptom tracking
- Lab result management
- FHIR/EHR integration

See `TODO` comments in the code for integration points.

---

**Ready to start?** Follow Steps 1-4 above and you'll be managing treatment regimens in minutes!

**Questions?** Review [README.md](README.md) or [SETUP.md](SETUP.md) for detailed information.
