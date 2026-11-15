# SR Investments SaaS CRM — Standard Operating Procedures (SOP) & Architecture Manual

This directory contains the complete technical specifications, Standard Operating Procedures (SOPs), diagrams, and Microsoft Word (`.docx`) manuals for operating the **SR Investments Centralized SaaS Mutual Fund & Advisory CRM**.

---

## Document Index & Formats

| Document | Primary Focus | Word Document (.docx) | Markdown Companion (.md) | High-Res Diagram |
| :--- | :--- | :--- | :--- | :--- |
| **01. New Client Setup** | Onboarding new tenant, isolating Drive & cloning database | [`01_SOP_New_Client_Setup.docx`](./01_SOP_New_Client_Setup.docx) | [`01_SOP_New_Client_Setup.md`](./01_SOP_New_Client_Setup.md) | — |
| **02. License Renewal** | Extending, upgrading & managing subscription licenses | [`02_SOP_License_Renewal.docx`](./02_SOP_License_Renewal.docx) | [`02_SOP_License_Renewal.md`](./02_SOP_License_Renewal.md) | — |
| **03. Architecture & Flow** | System topology, Google Apps Script Web App API, GIS | [`03_Project_Architecture_And_Flow.docx`](./03_Project_Architecture_And_Flow.docx) | [`03_Project_Architecture_And_Flow.md`](./03_Project_Architecture_And_Flow.md) | [`System_Architecture_Diagram.png`](./images/System_Architecture_Diagram.png) |
| **04. DFD & ER Diagrams** | Context Level 0, Level 1 Process, and Database ER Schema | [`04_DFD_And_ER_Diagrams.docx`](./04_DFD_And_ER_Diagrams.docx) | [`04_DFD_And_ER_Diagrams.md`](./04_DFD_And_ER_Diagrams.md) | [`DFD_Level_0`](./images/DFD_Level_0_Context_Diagram.png), [`DFD_Level_1`](./images/DFD_Level_1_Process_Flow.png), [`ER_Diagram`](./images/ER_Diagram_Multi_Tenant_SaaS.png) |
| **05. Local to GAS Push & Pull** | Automated code deployment via Google Clasp (No manual copy-paste) | [`05_SOP_Local_To_GAS_Push_And_Pull.docx`](./05_SOP_Local_To_GAS_Push_And_Pull.docx) | [`05_SOP_Local_To_GAS_Push_And_Pull.md`](./05_SOP_Local_To_GAS_Push_And_Pull.md) | — |

---

## High-Resolution Diagrams

All standalone diagram assets are available under `SOP/images/`:
- **System Architecture Diagram:** [`SOP/images/System_Architecture_Diagram.png`](./images/System_Architecture_Diagram.png)
- **DFD Level 0 (Context Diagram):** [`SOP/images/DFD_Level_0_Context_Diagram.png`](./images/DFD_Level_0_Context_Diagram.png)
- **DFD Level 1 (Process Decomposition):** [`SOP/images/DFD_Level_1_Process_Flow.png`](./images/DFD_Level_1_Process_Flow.png)
- **Entity-Relationship (ER) Schema:** [`SOP/images/ER_Diagram_Multi_Tenant_SaaS.png`](./images/ER_Diagram_Multi_Tenant_SaaS.png)

---

## Quick Reference Summary

### 1. New Client Onboarding in 3 Steps
1. **Google Drive:** Create `SRInvestmentsCRM/org/<ClientName>` folder (extract `DriveRootFolderId`).
2. **Template Clone:** Copy `_CRM_DATABASE_TEMPLATE` into client folder as `<ClientName>_CRM_DB` (extract `SpreadsheetId`).
3. **CRM Portal:** In **Tenant Master (SaaS)**, click `+ Onboard New Client`, fill details, and click **Onboard Client**.

### 2. License Renewal
1. In **Tenant Master (SaaS)**, find client row and click `Licenses` (card icon).
2. Review past subscription history.
3. Select renewal tier, dates, and amount, then click `Save & Activate Renewal`.

### 3. Dual-Database Model
- **Central SaaS Master DB (`Central_SaaS_Master_DB`):** Holds global `Tenant_Master`, `User_Master`, `Tenant_User_Mapping`, and `Tenant_Licensing`.
- **Tenant Isolated DBs (`org/<ClientName>/<ClientName>_CRM_DB`):** Holds client-specific `Customers`, `Employees`, and `Masters`.

### 4. Code Deployment to Google Apps Script
- **Deploy local code:** `npm run push:gas` (or `npx clasp push`)
- **Download cloud edits:** `npm run pull:gas` (or `npx clasp pull`)
- **One-time login:** `npm run login:gas` (or `npx clasp login`)


