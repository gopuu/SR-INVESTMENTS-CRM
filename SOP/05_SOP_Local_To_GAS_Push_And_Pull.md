# SR Investments SaaS CRM — SOP 05: Local to Google Apps Script (GAS) Sync
**Document Code:** `SOP-GAS-005`  
**Standard:** Developer Operations & Automated Continuous Integration  
**Target Project:** `Central_SaaS_SR_CRM_Backend`  
**Active GAS Script ID:** `1KcIl2YiyEa6JI68Dw5SUsmA-qRYS-P6_upTd4GL-Yij1plzfeAIYJn39`  
**Apps Script URL:** [https://script.google.com/u/1/home/projects/1KcIl2YiyEa6JI68Dw5SUsmA-qRYS-P6_upTd4GL-Yij1plzfeAIYJn39/edit](https://script.google.com/u/1/home/projects/1KcIl2YiyEa6JI68Dw5SUsmA-qRYS-P6_upTd4GL-Yij1plzfeAIYJn39/edit)

---

## 1. Purpose & Overview

This Standard Operating Procedure (SOP) defines the automated procedure for syncing local code in the `apps-script/` directory directly into Google Apps Script without manual copy-pasting.

Using Google's official `@google/clasp` (Command Line Apps Script Projects) engine:
- Code changes in local files (`Code.gs`, `Common_Code.gs`, `Customer_Code.gs`, `Employee_Code.gs`, `Login_Code.gs`, `appsscript.json`) are uploaded directly to the cloud in under 2 seconds.
- Bi-directional sync allows pulling any emergency edits made in the cloud editor down to your local repository.

---

## 2. Prerequisites & Architecture

```
Local Repository (VS Code)                   Google Cloud Apps Script Engine
┌───────────────────────────────┐            ┌────────────────────────────────────────┐
│ apps-script/                  │            │ Central_SaaS_SR_CRM_Backend            │
│   ├── Code.gs                 │   clasp    │ (Script ID: 1KcIl2YiyEa6...feAIYJn39)   │
│   ├── Common_Code.gs          ├──push────> │                                        │
│   ├── Customer_Code.gs        │            │   ├── Code.gs                          │
│   ├── Employee_Code.gs        │<──pull────┤   ├── Common_Code.gs                   │
│   ├── Login_Code.gs           │            │   ├── Customer_Code.gs                 │
│   └── appsscript.json         │            │   ├── Employee_Code.gs                 │
│ .clasp.json (Script ID config)│            │   └── Login_Code.gs                    │
└───────────────────────────────┘            └────────────────────────────────────────┘
```

### Configuration Files in Workspace Root:
1. **`.clasp.json`**:
   ```json
   {
     "scriptId": "1KcIl2YiyEa6JI68Dw5SUsmA-qRYS-P6_upTd4GL-Yij1plzfeAIYJn39",
     "rootDir": "./apps-script"
   }
   ```
2. **`.claspignore`**:
   Excludes all non-Apps-Script project files (React, Vite, node_modules) and ensures only `.gs`, `.html`, and `appsscript.json` are synced.

---

## 3. Step-by-Step Operating Instructions

### Step 1: One-Time Google Account Permission (30 Seconds)
Google security requires API access to be turned on once per Google account:

1. Open your browser to:  
   👉 **[https://script.google.com/home/usersettings](https://script.google.com/home/usersettings)**
2. Scroll to **Google Apps Script API**.
3. Toggle the switch to **ON**.
   *(If already ON, you may proceed directly to Step 2).*

---

### Step 2: One-Time Terminal Authentication (`login:gas`)

In your project root terminal (`G:\CODE\SR-Investments-Website\sr-investments-crm-v1\sr-investments-crm`), run:

```bash
npm run login:gas
```
*(Alternative direct command: `npx clasp login`)*

**Execution flow:**
1. A Google sign-in window opens in your default browser.
2. Select your Google account (`kgopal8306@gmail.com`).
3. Click **Allow** to authorize clasp to manage your Apps Script projects.
4. The terminal displays:
   ```
   Logging in with local server...
   Logged in! You may now close this browser window.
   ```
5. Credentials are saved locally in your secure home profile at `~/.clasprc.json`.

---

### Step 3: Pushing Local Code to Google Apps Script (`push:gas`)

Whenever you make or review code changes in `apps-script/`:

```bash
npm run push:gas
```
*(Alternative direct command: `npx clasp push` or `npx clasp push --force`)*

**What happens:**
1. Clasp reads `.clasp.json` and connects to project `1KcIl2YiyEa6JI68Dw5SUsmA-qRYS-P6_upTd4GL-Yij1plzfeAIYJn39`.
2. All 5 `.gs` files, `Bridge.html`, and `appsscript.json` are packaged and uploaded.
3. Terminal output:
   ```
   └─ apps-script/appsscript.json
   └─ apps-script/Bridge.html
   └─ apps-script/Code.gs
   └─ apps-script/Common_Code.gs
   └─ apps-script/Customer_Code.gs
   └─ apps-script/Employee_Code.gs
   └─ apps-script/Login_Code.gs
   Pushed 7 files.
   ```
4. Code is immediately live in your Google Apps Script project editor.

---

### Step 4: Post-Push Deployment — Do You Need a New Version?

**Short Answer:**
- **YES**, if your React frontend is calling the live production Web App URL (`.../exec`), Google Apps Script serves the code locked to the **Deployment Version**. Pushing code updates the **Editor (`@HEAD`)**, but the Web App URL runs the **Deployed Version**.
- **Crucial Rule:** Always update your **existing deployment** with **"New version"**. This updates the live code while keeping your **Web App URL exactly the same**, meaning you do **NOT** need to change any frontend settings or URLs!

#### Option A: Quick 3-Click Update in Browser (Recommended)
1. In the Apps Script web editor, click **Deploy** (top-right blue button) ➔ **Manage deployments**.
2. Click the **✏️ Edit (pencil icon)** on your active deployment (`SR-CRM v1`).
3. Under **Version**, click the dropdown and select **"New version"**.
4. Click the blue **Deploy** button.
5. Your live Web App URL instantly executes the new code without changing its URL!

#### Option B: Automated Deploy via CLI
You can also create or update deployments directly from the terminal:
```bash
npm run deploy:gas
```
*(or `npx clasp deploy --description "Update v..."`)*

To list your current active deployment IDs:
```bash
npm run deployments:gas
```

---

### Step 5: Pulling Remote Cloud Code to Local (`pull:gas`)

If you or another team member ever make edits directly inside the Google Apps Script web editor, pull those changes down to your local workspace to prevent overwriting:

```bash
npm run pull:gas
```
*(Alternative direct command: `npx clasp pull`)*

**What happens:**
- Downloads all latest `.gs` files from the Google cloud project into `apps-script/`.
- Updates your local files while preserving Git history.

---

### Step 6: Quick Utility Commands

| Command | Action | Description |
| :--- | :--- | :--- |
| `npm run push:gas` | **Upload Code** | Pushes all local `.gs` files to Google Apps Script |
| `npm run deploy:gas` | **Create Deployment** | Creates a new version deployment via CLI |
| `npm run deployments:gas` | **List Deployments** | Displays all active Web App deployment IDs |
| `npm run pull:gas` | **Download Code** | Pulls remote cloud files to local workspace |
| `npm run login:gas` | **Re-Authenticate** | Re-logs into Google account if token expires |
| `npx clasp status` | **Diff Status** | Lists all local files that differ from remote |
| `npx clasp open` | **Open in Browser** | Opens the Apps Script web editor in default browser |

---

## 4. Troubleshooting & Best Practices

| Symptom / Error | Root Cause | Immediate Fix |
| :--- | :--- | :--- |
| `User has not enabled the Apps Script API` | Google Apps Script API toggle is OFF | Open [https://script.google.com/home/usersettings](https://script.google.com/home/usersettings) and toggle it to **ON**. |
| `Could not find file .clasprc.json` | Not yet logged in | Run `npm run login:gas` in terminal and authorize. |
| `Push failed: Manifest file mismatch` | `appsscript.json` corrupted or missing | Ensure `apps-script/appsscript.json` exists with valid OAuth scopes (`spreadsheets`, `drive`). |
| Remote changes overwritten | Pushed without pulling cloud edits | Run `npm run pull:gas` before making edits if edits were done in the browser. |

---

## 5. Summary Checklist

- [x] `.clasp.json` configured with active Script ID `1KcIl2YiyEa6JI68Dw5SUsmA-qRYS-P6_upTd4GL-Yij1plzfeAIYJn39`.
- [x] `.claspignore` placed in root directory.
- [x] `push:gas`, `pull:gas`, and `login:gas` scripts registered in `package.json`.
- [ ] Run `npm run login:gas` once in terminal.
- [ ] Run `npm run push:gas` to deploy local code to cloud.

