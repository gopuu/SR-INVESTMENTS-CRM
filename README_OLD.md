# SR Investments CRM

A lightweight CRM using:

- GitHub Pages — frontend
- Google Apps Script — backend/bridge
- One Google Spreadsheet — database
- Google Drive — file storage foundation

## Current V1

Pages:
- Dashboard — employee count
- Employee Master — Add / Edit / Delete / Search

Database:
- `EmployeeMaster` sheet

Employee columns:
- EmployeeId
- EmployeeCode
- FirstName
- LastName
- Mobile
- Email
- Department
- Designation
- JoiningDate
- Status
- Address
- City
- State
- Pincode
- CreatedAt
- UpdatedAt

## Important architecture note

The GitHub Pages frontend does NOT directly `fetch()` the Apps Script JSON response.

Apps Script ContentService responses are redirected and do not provide a normal configurable CORS header. The project therefore uses:

GitHub Pages
→ hidden Apps Script HTML-service iframe
→ `postMessage`
→ `google.script.run`
→ Google Sheets / Drive

Google documents `google.script.run` as the supported client/server communication mechanism for HTML-service pages.

## Setup

### 1. Create Google Spreadsheet

Create one spreadsheet, for example:

`SR Investments CRM DB`

Copy the spreadsheet ID from:

`https://docs.google.com/spreadsheets/d/SPREADSHEET_ID/edit`

Put it in:

`apps-script/Code.gs`

Replace:

`PASTE_GOOGLE_SPREADSHEET_ID_HERE`

### 2. Create Apps Script project

Go to Apps Script and create a standalone project.

Add these files:

- `Code.gs`
- `Bridge.html`
- `appsscript.json`

Copy the supplied contents.

If Apps Script asks to replace the manifest, allow it.

### 3. Run setupCRM once

In Apps Script editor:

1. Select `setupCRM`
2. Run
3. Grant Google permissions
4. Confirm that `EmployeeMaster` was created
5. Confirm that `SR Investments CRM` Drive folder was created

### 4. Deploy Web App

Deploy → New deployment → Web app.

Recommended for this bridge architecture:

- Execute as: Me
- Who has access: Anyone

Copy the `/exec` URL.

### 5. Configure GitHub Pages

Open:

`github-pages/js/config.js`

Set:

```js
const CRM_CONFIG = {
  GAS_WEB_APP_URL: "YOUR_EXEC_URL"
};
```

Example:

```js
const CRM_CONFIG = {
  GAS_WEB_APP_URL: "https://script.google.com/macros/s/XXXXXXXX/exec"
};
```

Do NOT put this URL into OAuth "Authorized JavaScript origins". This project does not require an OAuth client ID for V1.

### 6. Publish GitHub Pages

Put the contents of `github-pages/` into your repository.

Recommended:

```text
/
├── index.html
├── css/
│   └── app.css
└── js/
    ├── config.js
    ├── api.js
    └── app.js
```

Enable GitHub Pages from repository settings.

### 7. Test

Open your GitHub Pages URL.

The top-right badge should change from:

`Connecting...`

to:

`Connected`

Then open Employee Master.

Try:

- Add
- Edit
- Delete
- Search
- Dashboard count

## Security warning

The V1 bridge deployment is deliberately simple and is NOT a complete multi-user authentication system.

Because the Apps Script Web App is accessible to anyone, do not put sensitive personal/financial/customer data into it until application authentication and authorization are implemented.

For a production CRM, add:

- Google identity authentication
- Users table
- Roles table
- Rights table
- server-side authorization checks
- audit log
- CSRF/message-origin validation
- rate limiting / abuse controls
- Drive file access controls

Do not rely on hiding buttons in GitHub Pages as authorization.

## Future database sheets

The same spreadsheet can later contain:

- EmployeeMaster
- Users
- Roles
- Rights
- Customers
- CustomerDocuments
- AuditLogs
- Settings

## Future Drive structure

The backend already creates:

`SR Investments CRM`

Future structure can be:

```text
SR Investments CRM/
├── Employees/
│   └── EMP0001/
├── Customers/
│   └── CUST0001/
└── General/
```

## Why this design

GitHub Pages is only static hosting. Google Apps Script owns the database operations.

This keeps the frontend independent from the storage layer, so the frontend can later be moved to another host without rewriting the Google Sheet logic.

For larger datasets or a commercial SaaS, migrate the repository layer to PostgreSQL/Supabase/SQL Server rather than trying to make Google Sheets behave like a relational database.
