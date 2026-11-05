/**
 * SR INVESTMENTS CRM - Common Code & Database Infrastructure
 * 
 * Configured with live Google Drive & Spreadsheet references:
 * 1. Spreadsheet ID: 1Bll7386rIJD2CIl1VX--0Okcn-jxXOpII0OHh9FSKSM
 * 2. Root Drive Folder ID: 1IxulBQJTKrxYAyYMUhz5bllvaMZUYvy (SRInvestmentsCRM)
 * 3. Subfolders: SR_CRM_CustomerFiles, SR_CRM_EmployeeFiles, TestBulkMailAttachments
 */

const CRM_CONFIG = {
  // Live Google Spreadsheet ID
  SPREADSHEET_ID: "1Bll7386rIJD2CIl1VX--0Okcn-jxXOpII0OHh9FSKSM",

  // Live Google Drive Folder ID
  DRIVE_ROOT_FOLDER_ID: "1IxulBQJTKrxYAyYMUhz5bllvaMZUYvy",
  
  SUBFOLDERS: {
    CUSTOMERS: "SR_CRM_CustomerFiles",
    EMPLOYEES: "SR_CRM_EmployeeFiles",
    ATTACHMENTS: "TestBulkMailAttachments"
  },

  SHEETS: {
    APP_TRACKER: "AppTracker",
    EMPLOYEE_EMAILS: "EmployeeEmails",
    EMPLOYEES: "Employees",
    CUSTOMERS: "Customers",
    USERS: "Users",
    SETTINGS: "CompanySettings",
    RIGHTS: "RolesRights",
    AUDIT: "AuditLogs"
  }
};

// Database Schema Definitions
const CRM_SCHEMAS = {
  USERS: [
    "UserId", "Name", "Email", "Password", "Role", "Status", "CreatedAt", "LastLogin"
  ],
  CUSTOMERS: [
    "CustomerId", "CustomerCode", "FullName", "Email", "Mobile", "PanNumber",
    "AadhaarLast4", "KycStatus", "InvestorCategory", "DateOfBirth", "NomineeName",
    "NomineeRelation", "BankName", "AccountNumber", "IfscCode", "City", "State",
    "RiskProfile", "Notes", "CreatedAt", "UpdatedAt"
  ],
  EMPLOYEES: [
    "EmployeeId", "EmployeeCode", "FullName", "Email", "Mobile", "Department",
    "Designation", "Role", "JoiningDate", "Status", "Address", "City", "State",
    "PhotoUrl", "DriveFileId", "CreatedAt", "UpdatedAt"
  ],
  SETTINGS: [
    "Key", "Value", "Description", "UpdatedAt"
  ],
  RIGHTS: [
    "Role", "Module", "CanView", "CanCreate", "CanEdit", "CanDelete"
  ],
  AUDIT: [
    "LogId", "Timestamp", "UserEmail", "Action", "Details"
  ],
  APP_TRACKER: [
    "Date", "Status", "Module", "Task", "Description / Updates"
  ],
  EMPLOYEE_EMAILS: [
    "Email", "Name", "Department", "Designation", "Status"
  ]
};

/**
 * Open CRM Database Spreadsheet
 */
function getSpreadsheet_() {
  try {
    return SpreadsheetApp.openById(CRM_CONFIG.SPREADSHEET_ID);
  } catch (err) {
    throw new Error("Unable to open Spreadsheet ID: " + CRM_CONFIG.SPREADSHEET_ID + ". Ensure the script has access permissions.");
  }
}

/**
 * Get or initialize specific sheet by name
 */
function getOrCreateSheet_(sheetName, schema) {
  const ss = getSpreadsheet_();
  let sheet = ss.getSheetByName(sheetName);

  if (!sheet) {
    sheet = ss.insertSheet(sheetName);
  }

  if (sheet.getLastRow() === 0 && schema && schema.length) {
    sheet.getRange(1, 1, 1, schema.length).setValues([schema]);
    sheet.setFrozenRows(1);
    sheet.getRange(1, 1, 1, schema.length)
      .setFontWeight("bold")
      .setBackground("#0f172a")
      .setFontColor("#ffffff");
    sheet.autoResizeColumns(1, schema.length);
  }

  return sheet;
}

/**
 * Read rows as JSON Objects based on schema
 */
function getSheetRowsAsObjects_(sheet, schema) {
  const lastRow = sheet.getLastRow();
  if (lastRow <= 1) return [];

  const values = sheet.getRange(2, 1, lastRow - 1, schema.length).getValues();
  return values
    .filter(row => row.some(cell => String(cell).trim() !== ""))
    .map(row => {
      const obj = {};
      schema.forEach((col, i) => {
        let val = row[i];
        if (val instanceof Date) {
          val = Utilities.formatDate(val, "Asia/Kolkata", "yyyy-MM-dd");
        }
        obj[col] = val !== undefined && val !== null ? val : "";
      });
      return obj;
    });
}

/**
 * Google Drive Root Folder
 */
function getDriveRootFolder_() {
  try {
    return DriveApp.getFolderById(CRM_CONFIG.DRIVE_ROOT_FOLDER_ID);
  } catch (e) {
    // Fallback to name search if ID is inaccessible
    const folders = DriveApp.getFoldersByName("SRInvestmentsCRM");
    if (folders.hasNext()) return folders.next();
    return DriveApp.createFolder("SRInvestmentsCRM");
  }
}

/**
 * Get or create subfolder inside Drive root
 */
function getDriveSubfolder_(folderName) {
  const root = getDriveRootFolder_();
  const folders = root.getFoldersByName(folderName);
  if (folders.hasNext()) return folders.next();
  return root.createFolder(folderName);
}

/**
 * Upload file to Drive and optionally delete old file
 */
function uploadDriveFile_(folderName, fileName, mimeType, base64Data, oldFileId) {
  if (!base64Data) throw new Error("Base64 file data required.");

  // Delete previous file from Drive if updating
  if (oldFileId) {
    deleteDriveFileSafely_(oldFileId);
  }

  const subfolder = getDriveSubfolder_(folderName);
  const cleanBase64 = base64Data.includes(",") ? base64Data.split(",")[1] : base64Data;
  const decodedBytes = Utilities.base64Decode(cleanBase64);
  const blob = Utilities.newBlob(decodedBytes, mimeType || "application/octet-stream", fileName || "file");

  const file = subfolder.createFile(blob);
  file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);

  return {
    fileId: file.getId(),
    fileName: file.getName(),
    viewUrl: "https://drive.google.com/uc?export=view&id=" + file.getId(),
    thumbnailUrl: "https://drive.google.com/thumbnail?id=" + file.getId() + "&sz=w400"
  };
}

/**
 * Delete a file safely from Drive without crashing if not found
 */
function deleteDriveFileSafely_(fileId) {
  if (!fileId) return;
  try {
    const file = DriveApp.getFileById(fileId);
    file.setTrashed(true);
  } catch (err) {
    Logger.log("Could not trash old file " + fileId + ": " + err.message);
  }
}

/**
 * Log action to AuditLogs sheet
 */
function logAudit_(userEmail, action, details) {
  try {
    const sheet = getOrCreateSheet_(CRM_CONFIG.SHEETS.AUDIT, CRM_SCHEMAS.AUDIT);
    sheet.appendRow([
      createId_("LOG"),
      new Date().toISOString(),
      userEmail || "System",
      action,
      details || ""
    ]);
  } catch (e) {
    Logger.log("Audit log failed: " + e.message);
  }
}

function createId_(prefix) {
  return prefix + "_" + Utilities.formatDate(new Date(), "Asia/Kolkata", "yyyyMMddHHmmss") + "_" + Math.floor(Math.random() * 1000);
}

function cleanStr_(val) {
  return val === null || val === undefined ? "" : String(val).trim();
}

/**
 * Return JSON Response with CORS headers for Web App
 */
function jsonResponse_(data) {
  return ContentService.createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}

/**
 * CRM Setup & Verification
 * Verifies all sheets and folders exist in the user's live Google environment.
 */
function setupCRM() {
  const ss = getSpreadsheet_();

  // Initialize all sheets without overwriting existing rows
  Object.keys(CRM_CONFIG.SHEETS).forEach(key => {
    const sheetName = CRM_CONFIG.SHEETS[key];
    const schema = CRM_SCHEMAS[key];
    getOrCreateSheet_(sheetName, schema);
  });

  // Ensure Admin user exists in Users sheet
  const userSheet = getOrCreateSheet_(CRM_CONFIG.SHEETS.USERS, CRM_SCHEMAS.USERS);
  if (userSheet.getLastRow() <= 1) {
    userSheet.appendRow([
      "USR_001",
      "System Administrator",
      "admin@srinvestments.com",
      "admin123",
      "Admin",
      "Active",
      new Date().toISOString(),
      ""
    ]);
  }

  // Ensure Company Settings exists
  const settingsSheet = getOrCreateSheet_(CRM_CONFIG.SHEETS.SETTINGS, CRM_SCHEMAS.SETTINGS);
  if (settingsSheet.getLastRow() <= 1) {
    const defaults = [
      ["COMPANY_NAME", "SR INVESTMENTS", "Mutual Fund Distributor Firm Name", new Date().toISOString()],
      ["ARN_NUMBER", "ARN-189241", "AMFI Registration Number", new Date().toISOString()],
      ["EUIN_NUMBER", "E345678", "Employee Unique Identification Number", new Date().toISOString()],
      ["GSTIN", "27AAACR1234F1Z5", "Goods & Services Tax Identification Number", new Date().toISOString()],
      ["SUPPORT_EMAIL", "support@srinvestments.com", "Official Support Email", new Date().toISOString()],
      ["CONTACT_PHONE", "+91 98765 43210", "Customer Helpdesk Phone", new Date().toISOString()],
      ["OFFICE_ADDRESS", "101, Fortune Hub, Financial District, Bandra-Kurla Complex, Mumbai 400051", "Office Address", new Date().toISOString()]
    ];
    settingsSheet.getRange(2, 1, defaults.length, 4).setValues(defaults);
  }

  // Ensure Roles Rights exists
  const rightsSheet = getOrCreateSheet_(CRM_CONFIG.SHEETS.RIGHTS, CRM_SCHEMAS.RIGHTS);
  if (rightsSheet.getLastRow() <= 1) {
    const defaultRights = [
      ["Admin", "Dashboard", true, true, true, true],
      ["Admin", "Customers", true, true, true, true],
      ["Admin", "Staff", true, true, true, true],
      ["Admin", "Settings", true, true, true, true],
      ["Relationship Manager", "Dashboard", true, false, false, false],
      ["Relationship Manager", "Customers", true, true, true, false],
      ["Relationship Manager", "Staff", true, false, false, false],
      ["Relationship Manager", "Settings", false, false, false, false],
      ["Backoffice Staff", "Dashboard", true, false, false, false],
      ["Backoffice Staff", "Customers", true, true, true, false],
      ["Backoffice Staff", "Staff", false, false, false, false],
      ["Backoffice Staff", "Settings", false, false, false, false]
    ];
    rightsSheet.getRange(2, 1, defaultRights.length, 6).setValues(defaultRights);
  }

  // Verify Drive subfolders
  getDriveSubfolder_(CRM_CONFIG.SUBFOLDERS.CUSTOMERS);
  getDriveSubfolder_(CRM_CONFIG.SUBFOLDERS.EMPLOYEES);
  getDriveSubfolder_(CRM_CONFIG.SUBFOLDERS.ATTACHMENTS);

  Logger.log("SR INVESTMENTS CRM live Google setup verified successfully.");
  return { success: true, message: "CRM sheets & Drive folders verified successfully!" };
}

