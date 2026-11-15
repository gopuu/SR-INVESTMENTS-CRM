# SOP 01: New Client Setup & Tenant Onboarding

**Document ID:** `SOP-CRM-SAAS-01`  
**Version:** `v2.5 (Production Live)`  
**Audience:** CRM Founder / Platform SuperAdmin  
**Format:** Markdown Companion (Full Word document: [`01_SOP_New_Client_Setup.docx`](./01_SOP_New_Client_Setup.docx))

---

## 1. Purpose & Operational Scope
This Standard Operating Procedure defines the exact workflow to provision a new client organization in the SR Investments Multi-Tenant SaaS platform. Each client receives:
- A dedicated Google Drive folder for investor KYC and financial files.
- A dedicated Google Sheet cloned from `_CRM_DATABASE_TEMPLATE`.
- An active subscription record in `Tenant_Licensing`.
- An initial client administrator user.

---

## 2. Prerequisites
1. SuperAdmin access (logged in as `USER1` or user with `IsSuperAdmin = TRUE`).
2. Google Drive Owner/Editor permissions on `My Drive > SRInvestmentsCRM`.
3. Client details: Legal Company Name, ARN Number, EUIN, Support Email, Phone, Address.
4. Agreed commercial license tier and tenure (Starter, Professional, or Enterprise).

---

## 3. Step-by-Step Procedure

### Step 1: Create Dedicated Client Folder in Google Drive
1. In Google Drive, open `My Drive > SRInvestmentsCRM > org`.
2. Create a folder named after the client (e.g., `ABC_Investments`).
3. Open the folder and copy its **Folder ID** from the URL:
   ```
   https://drive.google.com/drive/folders/1IxulBQJTKrxYAyYMUhz5bllvaMZUYvy
   ```
   Copy: `1IxulBQJTKrxYAyYMUhz5bllvaMZUYvy` &larr; **`DriveRootFolderId`**

### Step 2: Clone Database Template for the Client
1. In `My Drive > SRInvestmentsCRM`, right-click `_CRM_DATABASE_TEMPLATE`.
2. Click **Make a copy**.
3. Move the copy into `org/ABC_Investments/` and rename it to `ABC_Investments_CRM_DB`.
4. Open the sheet and copy its **Spreadsheet ID** from the URL:
   ```
   https://docs.google.com/spreadsheets/d/1Bll7386rIJD2CIl1VX--0Okcn-jxXOpII0OHh9FSKSM/edit
   ```
   Copy: `1Bll7386rIJD2CIl1VX--0Okcn-jxXOpII0OHh9FSKSM` &larr; **`SpreadsheetId`**

### Step 3: Register Tenant in CRM
1. In CRM sidebar, click **Tenant Master (SaaS)**.
2. Click **`+ Onboard New Client`**.
3. Fill in the form:
   - **Organization Name:** `ABC Investments Pvt Ltd`
   - **Tenant ID:** Leave blank for auto-generation (e.g., `TEN002`) or provide custom.
   - **ARN Number:** `ARN-192841`
   - **Dedicated Spreadsheet ID:** Paste ID from Step 2.
   - **Drive Root Folder ID:** Paste ID from Step 1.
   - **Support Email & Contact Phone**
   - **Initial License Type:** Starter / Professional / Enterprise
   - **Subscription Period:** 12 Months
   - **Amount:** Commercial fee (e.g., ₹60,000)
4. Click **Onboard Client**.

### Step 4: Map Client Administrator
1. In `Central_SaaS_Master_DB` &rarr; `User_Master`, verify or add the client administrator's primary email and mobile number.
2. In `Tenant_User_Mapping`, add:
   - `MappingId`: `MAP_001`
   - `UserId`: `<AdminUserId or Email>`
   - `TenantId`: `TEN002`
   - `Role`: `Admin`
   - `Status`: `Active`
   - Audit columns (`IsDeleted`: `FALSE`, `Created_By`, `Created_At`).

---

## 4. Verification Checklist
- [ ] `Tenant_Master` row populated with all IDs and `IsDeleted = FALSE`.
- [ ] `Tenant_Licensing` row created with active license dates.
- [ ] Client Admin can log in and view only their workspace.
- [ ] Documents uploaded by client stay isolated in client's Drive folder.

