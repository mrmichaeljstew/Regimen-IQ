# RegimenIQ Setup - Quick Reference Card

## 🚀 Fast Track Setup (10 minutes)

### 1. Prerequisites
```bash
# Install dependencies
npm install

# You need:
✅ Node.js 18+
✅ Appwrite Cloud account (free)
✅ Git (for cloning)
```

### 2. Create Appwrite Resources
1. Go to [cloud.appwrite.io](https://cloud.appwrite.io)
2. Create Project → Note **Project ID**
3. Create Database: `regimen-iq-db` → Note **Database ID**
4. Create API Key (Settings → API Keys):
   - Name: "Setup Script"
   - Scopes: `databases`, `collections`, `attributes`, `indexes` (all read & write)
   - Expiration: 1 day
   - Copy the key (you won't see it again!)

### 3. Configure Environment
```bash
# Create .env.local from template
cp .env.example .env.local

# Edit with your values:
NEXT_PUBLIC_APPWRITE_ENDPOINT=https://sfo.cloud.appwrite.io/v1
NEXT_PUBLIC_APPWRITE_PROJECT_ID=<your_project_id>
NEXT_PUBLIC_APPWRITE_DATABASE_ID=regimen-iq-db
APPWRITE_API_KEY=<your_api_key>
```

### 4. Run Automated Setup
```bash
npm run setup
```

**Expected:** 6/6 collections created, ~60 attributes, 12 indexes

### 5. Enable Authentication
1. Appwrite Console → Auth → Settings
2. Enable "Email/Password"

### 6. Security Cleanup
```bash
# 1. Delete API key from Appwrite Console (Settings → API Keys)
# 2. Remove from .env.local:
# Delete this line: APPWRITE_API_KEY=...
```

### 7. Start Application
```bash
npm run dev
# Open http://localhost:3000
```

---

## 📋 Collections Created

| Collection | Attributes | Indexes | Purpose |
|-----------|-----------|---------|---------|
| `patients` | 9 | 1 | Patient profiles |
| `regimen_items` | 13 | 3 | Medications/supplements |
| `interactions` | 10 | 2 | Drug interactions |
| `research_notes` | 9 | 2 | Research documentation |
| `appointment_briefs` | 11 | 2 | Appointment summaries |
| `audit_log` | 7 | 2 | Activity tracking |

**Total:** 59 attributes, 12 indexes

---

## 🔑 API Key Required Scopes

When creating API key in Appwrite Console, select:

- ✅ `databases.read`
- ✅ `databases.write`
- ✅ `collections.read`
- ✅ `collections.write`
- ✅ `attributes.read`
- ✅ `attributes.write`
- ✅ `indexes.read`
- ✅ `indexes.write`

**Note:** Delete this key after setup is complete!

---

## 🐛 Quick Troubleshooting

| Error | Solution |
|-------|----------|
| `.env.local not found` | Run: `cp .env.example .env.local` |
| `Missing environment variables` | Check all 4 variables in `.env.local` |
| `Database not found` | Create `regimen-iq-db` in Appwrite Console first |
| `Invalid API key` | Check key is correct, not expired |
| `Permission denied` | API key needs all 8 scopes (see above) |
| `Collection already exists (409)` | Normal! Script skips existing items |

**Full troubleshooting:** See `scripts/TROUBLESHOOTING.md`

---

## 📚 Documentation Quick Links

| Document | Purpose |
|----------|---------|
| [README.md](../README.md) | Project overview |
| [QUICKSTART.md](../QUICKSTART.md) | 5-minute getting started |
| [SETUP.md](../SETUP.md) | Detailed setup guide |
| [SCHEMA.md](../SCHEMA.md) | Database schema |
| [scripts/README.md](README.md) | Script documentation |
| [scripts/TROUBLESHOOTING.md](TROUBLESHOOTING.md) | Common issues & fixes |

---

## 💻 NPM Scripts

```bash
npm run dev      # Start development server (port 3000)
npm run build    # Build for production
npm start        # Run production build
npm run lint     # Check code quality
npm run setup    # Run Appwrite setup script ⭐
```

---

## ✅ Success Checklist

After setup completes:

- [ ] All 6 collections visible in Appwrite Console
- [ ] Each collection has attributes (7-13 per collection)
- [ ] Indexes created (1-3 per collection)
- [ ] Email/Password auth enabled
- [ ] API key deleted from Appwrite Console
- [ ] `APPWRITE_API_KEY` removed from `.env.local`
- [ ] `npm run dev` starts without errors
- [ ] Can register new account at http://localhost:3000
- [ ] Can create patient profile
- [ ] Can add regimen items

---

## 🔒 Security Reminders

⚠️ **Important:**
- API key is only for setup - delete after!
- Never commit `.env.local` to git (already in `.gitignore`)
- Use different API keys for dev/staging/prod
- Set API key expiration dates
- Review document-level permissions in Appwrite Console

---

## 🆘 Need Help?

1. **Check docs:** See links above
2. **Check logs:** Look at script output for errors
3. **Check Console:** Verify in Appwrite web interface
4. **GitHub Issues:** https://github.com/mrmichaeljstew/Regimen-IQ/issues

---

## 📊 Script Output Example

```
🚀 RegimenIQ Appwrite Setup
================================

📋 Configuration:
   Endpoint: https://sfo.cloud.appwrite.io/v1
   Project:  your-project-id
   Database: regimen-iq-db
   ✅ Database verified

📦 Creating collection: Patients (patients)
   ✅ Collection created
   Creating attributes...
   ✅ userId (string)
   ✅ name (string)
   ✅ relationship (string)
   ... (7 more attributes)
   Creating indexes...
   ✅ Index: userId_idx on [userId]

... (5 more collections)

================================
📊 Setup Summary
================================
✅ Collections processed: 6/6

🎉 Setup complete!

📝 Next steps:
   1. Verify collections in Appwrite Console
   2. Review document-level permissions
   3. Enable Email/Password auth in Appwrite Console
   4. Run: npm run dev
```

---

## 🎯 Next Steps After Setup

1. **Verify Setup**
   - Check Appwrite Console → Databases → `regimen-iq-db`
   - Verify all 6 collections present with attributes

2. **Test Application**
   - Register new account
   - Create patient profile
   - Add regimen item
   - Check interaction
   - Save research note

3. **Deploy to Production** (when ready)
   - See [DEPLOYMENT.md](../DEPLOYMENT.md)
   - Use production Appwrite project
   - Run setup script again for prod database

---

**Print or bookmark this page for quick reference!**

Last updated: December 2024
