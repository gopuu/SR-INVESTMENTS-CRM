# SR INVESTMENTS — Mutual Fund CRM (v2.0)

demo: 
username:
admin@srinvestments.com

passwd: 
admin123

A modern, high-performance, responsive **Mutual Fund CRM** designed for **SR INVESTMENTS** (AMFI Registered Mutual Fund Distributor).

- **Frontend:** React 18 + Vite + Lucide Icons (Deployable directly to **GitHub Pages**)
- **Backend:** Google Apps Script (GAS) Web App + Google Drive + Google Sheets
- **Database:** Single Google Spreadsheet with structured relational sheets (`Users`, `Customers`, `Employees`, `CompanySettings`, `RolesRights`, `AuditLogs`)
- **Document & Photo Storage:** Google Drive (`SR Investments CRM Files / Employees / Customers / Documents`)
- **Dual Transport:** Direct HTTP JSON API (`doPost`) + `Bridge.html` (`postMessage` / `google.script.run`) fallback.

---

## 📋 CRM Modules

1. **Login & Session Management**
   - Secure email & password authentication.
   - Session persistence in local storage with role extraction.
   - Built-in "Fill Demo Admin Credentials" button for instant testing.
2. **Home (Dashboard)**
   - Metric cards: Total Mutual Fund Investors, KYC Compliant %, Active Staff, AMFI ARN Status (`ARN-189241`).
   - Mutual Fund Asset Breakdown (Equity, Hybrid, Debt, Liquid).
   - Investor Categories breakdown (Individual, NRI, HUF, Corporate).
   - Supported Key AMCs (HDFC MF, ICICI Pru, SBI MF, Axis MF, Nippon India, etc.).
   - Recent Investor Onboardings table.
   - Quick operation buttons.
3. **Customer Master (Mutual Fund Investors)**
   - Search by Name, PAN, Mobile, Customer Code.
   - Filter by KYC Status (`Compliant`, `Pending`, `Rejected`) and Investor Category.
   - Full Investor Onboarding / Edit Modal:
     - Basic Details: Name, Category, Date of Birth, PAN Card, Aadhaar Last 4 digits.
     - Contact & Address: Mobile, Email, City, State.
     - Banking Mandates: Bank Name, Account Number, IFSC Code (for SIP and redemptions).
     - Investor Profile: Risk appetite (`Conservative`, `Moderate`, `High`, `Aggressive`), Nominee details, KYC status, Notes.
   - Export Investor Database to CSV.
   - Delete confirmation.
4. **Staff Master (Employee Directory)**
   - Staff listing with profile photos, employee code, name, designation, department, contact info, status.
   - Add / Edit Staff Modal with:
     - Photo Upload: Converts image to base64 and uploads directly to Google Drive folder (`SR Investments CRM Files / Employees`).
     - Employee Code, Full Name, Email, Mobile, Department, Designation, System Role, Status, Joining Date, Residential Address.
   - Delete confirmation.
5. **Settings**
   - **Company Details:** Firm Name (`SR INVESTMENTS`), AMFI Registration (`ARN-189241`), Principal EUIN (`E345678`), GSTIN, Support Email, Helpdesk Phone, Registered Office Address.
   - **User Rights & Permissions (RBAC):** Role permissions matrix (`Admin`, `Relationship Manager`, `Backoffice Staff`, `Staff`) controlling `CanView`, `CanCreate`, `CanEdit`, `CanDelete` across modules.
   - **Backend Configuration:** Live Google Apps Script `/exec` URL configuration, live connectivity tester with ping timestamp, and toggle between **Local Demo Mode** and **Live Google Backend**.
6. **User Profile**
   - Logged-in administrator/staff profile details.
   - Update full name.
   - Change password with confirmation & length validation.
   - Real-time Active Permissions overview.
7. **Logout**
   - Clean session termination and redirect to login screen.

---

## 🚀 How to Run and Build Locally

### Prerequisites
- Node.js (v18 or higher, e.g. Node v24)
- npm (v9 or higher)

### Step 1: Clone or navigate to the repository
```bash
cd frontend
```

### Step 2: Install dependencies
```bash
npm install
```

### Step 3: Run the local development server
```bash
npm run dev
```
Open your browser at `http://localhost:3000`.

> **Note on Demo Mode:** The CRM comes pre-configured with a rich local demo database so you can test all features (login, customer creation, staff photo uploads, rights editing) immediately even before setting up Google Apps Script! Default login: `admin@srinvestments.com` / `admin123`.

### Step 4: Build for Production
```bash
npm run build
```
This compiles the application into `frontend/dist/`. The output contains static HTML, CSS, and JavaScript optimized with relative asset paths (`base: './'`), ready for GitHub Pages.

---

## ☁️ How to Set Up the Google Backend (GAS + Drive + Sheets)

### 1. Create a Google Spreadsheet
1. Go to [Google Sheets](https://sheets.new) and create a new blank spreadsheet.
2. Name it: `SR Investments CRM Database`.
3. Copy the **Spreadsheet ID** from the browser address bar:
   `https://docs.google.com/spreadsheets/d/`**`SPREADSHEET_ID`**`/edit`

### 2. Create the Google Apps Script Project
1. Go to [Google Apps Script](https://script.google.com) and click **New Project**.
2. Name the project `SR Investments CRM Backend`.
3. In the script editor, create/paste the following files from `apps-script/`:
   - **`Code.gs`**: Copy contents of `apps-script/Code.gs`.
     - In line 15, replace `"PASTE_GOOGLE_SPREADSHEET_ID_HERE"` with your actual Google Spreadsheet ID!
   - **`Bridge.html`**: Click the `+` next to Files → HTML → name it `Bridge` → paste contents of `apps-script/Bridge.html`.
   - **`appsscript.json`**: Go to *Project Settings* (gear icon) → check *"Show 'appsscript.json' manifest file in editor"* → return to Editor → open `appsscript.json` and replace with `apps-script/appsscript.json`.

### 3. Run `setupCRM()` Once
1. At the top toolbar of the Apps Script Editor, select `setupCRM` in the function dropdown.
2. Click **Run**.
3. Google will request permissions to access Spreadsheets and Drive. Click **Review permissions** → select your Google account → click **Advanced** → **Go to SR Investments CRM Backend (unsafe)** → **Allow**.
4. Check your Google Spreadsheet: It will now have pre-seeded sheets with headers and default values:
   - `Users` (includes initial `admin@srinvestments.com` account)
   - `Customers`
   - `Employees`
   - `CompanySettings` (pre-seeded with SR INVESTMENTS & AMFI ARN)
   - `RolesRights` (pre-seeded RBAC matrix)
   - `AuditLogs`
5. Check your Google Drive: It will now contain a root folder `SR Investments CRM Files` with subfolders `Employees/`, `Customers/`, and `Documents/`.

### 4. Deploy as a Web App
1. In the Apps Script Editor, click **Deploy** (top right) → **New deployment**.
2. Select type: **Web app** (gear icon).
3. Configuration:
   - **Description:** `SR Investments CRM v2`
   - **Execute as:** `Me (your email)`
   - **Who has access:** `Anyone`
4. Click **Deploy**.
5. Copy the **Web App URL** (ends with `/exec`).

---

## 🌐 How to Publish Frontend to GitHub Pages

### Method A: Automated GitHub Actions (Recommended)
This repository already includes an automated deployment workflow at `.github/workflows/deploy.yml`.

1. Push your repository to GitHub (`main` or `master` branch):
   ```bash
   git init
   git add .
   git commit -m "feat: complete SR Investments Mutual Fund CRM"
   git remote add origin https://github.com/YOUR_USERNAME/sr-investments-crm.git
   git branch -M main
   git push -u origin main
   ```
2. In your GitHub repository:
   - Go to **Settings** → **Pages**.
   - Under **Build and deployment** → **Source**, select **GitHub Actions**.
3. GitHub Actions will automatically run, build the Vite React app, and publish it to:
   `https://YOUR_USERNAME.github.io/sr-investments-crm/`

### Method B: Manual Deployment / `gh-pages` Branch
1. In `frontend/`:
   ```bash
   npm run build
   ```
2. Publish the generated `frontend/dist` directory to your `gh-pages` branch or configure GitHub Pages to serve from the branch of your choice.

---

## 🔗 Connecting Frontend to Live Google Apps Script

Once both your frontend (on GitHub Pages) and backend (on Google Apps Script) are deployed:

1. Open your published GitHub Pages URL (or local dev server).
2. Log in using `admin@srinvestments.com` / `admin123`.
3. In the left sidebar, click **Settings** → **Google Apps Script / Drive Connection** tab.
4. Select **Live Google Apps Script + Sheets + Drive Mode**.
5. Paste your copied Google Web App `/exec` URL.
6. Click **Save URL**, then click **Test Connection**.
7. Once verified, the status badge in the top right will show `Live Google Sheet Sync`!

---

## 📁 Repository Structure

```text
sr-investments-crm/
├── .github/
│   └── workflows/
│       └── deploy.yml              # Automated GitHub Pages CI/CD workflow
├── apps-script/
│   ├── Code.gs                     # Complete GAS backend (Auth, Customers, Employees, Drive, Settings)
│   ├── Bridge.html                 # Fallback iframe postMessage bridge
│   └── appsscript.json             # OAuth scopes & runtime manifest
├── frontend/
│   ├── index.html                  # HTML entry point
│   ├── vite.config.js              # Vite build configuration (base: './' for GitHub Pages)
│   ├── package.json                # React, Lucide Icons, Vite dependencies
│   └── src/
│       ├── main.jsx                # React root bootstrap
│       ├── App.jsx                 # App layout & module routing
│       ├── index.css               # Design system & responsive styles
│       ├── context/
│       │   └── AuthContext.jsx     # Authentication & RBAC permissions state
│       ├── services/
│       │   └── api.js              # Unified API client (Live fetch + Bridge + Demo store)
│       ├── components/
│       │   ├── Sidebar.jsx         # Sidebar navigation with connection indicator
│       │   ├── Header.jsx          # Topbar with status badge & refresh trigger
│       │   └── Modal.jsx           # Accessible modal dialog
│       └── pages/
│           ├── Login.jsx           # CRM sign-in with 1-click demo filler
│           ├── Home.jsx            # Mutual fund dashboard & asset breakdown
│           ├── Customers.jsx       # Customer Master (PAN, KYC, Bank Mandate, CSV export)
│           ├── Staff.jsx           # Employee Master (Drive photo upload, roles)
│           ├── Settings.jsx        # Company Details, User Rights matrix, GAS config
│           └── UserProfile.jsx     # Profile settings, password change, rights view
├── apps-script_OLD/                # Preserved V1 Apps Script files
├── github-pages_OLD/               # Preserved V1 GitHub Pages files
├── README_OLD.md                   # Preserved original README
└── README.md                       # This comprehensive documentation
```

---

## 🔒 Security & Best Practices

- **Role-Based Access Control:** Frontend checks `hasPermission(module, action)` and backend enforces server-side validation.
- **Drive Permission Control:** Employee and investor documents are stored in designated Drive subfolders with direct links.
- **Data Validation:** Client and server validate PAN format (`ABCDE1234F`), Aadhaar length, and duplicate employee codes.
- **AMFI Compliance:** Designed specifically for mutual fund distribution regulations, storing investor KYC status, investor category (Resident, NRI, HUF), and nominee details.

