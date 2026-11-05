/**
 * SR INVESTMENTS CRM - Common Code & Database Infrastructure (Blue Family Edition)
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
    AUDIT: "AuditLogs",
    CAMPAIGNS: "EmailCampaigns"
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
    "EmployeeId", "EmployeeCode", "FullName", "Email", "GoogleEmails", "Mobile",
    "Department", "Designation", "Role", "Password", "JoiningDate", "Status",
    "Address", "City", "State", "PhotoUrl", "DriveFileId", "CreatedAt", "UpdatedAt"
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
  ],
  CAMPAIGNS: [
    "CampaignId", "Timestamp", "Target", "RecipientCount", "Subject", "SenderEmail", "Status", "EstimatedCost"
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
      .setBackground("#1e40af") // Royal Blue
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
 * Upload file to Drive and delete old file if updating
 */
function uploadDriveFile_(folderName, fileName, mimeType, base64Data, oldFileId) {
  if (!base64Data) throw new Error("Base64 file data required.");

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
 * Safely trash an old file from Drive
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
 * Generate full ZIP backup of Google Drive folder and files
 */
function backupDriveFilesToZip_() {
  const root = getDriveRootFolder_();
  const blobs = [];

  // Helper to collect files recursively
  function collectBlobs(folder, pathPrefix) {
    const files = folder.getFiles();
    while (files.hasNext()) {
      const file = files.next();
      const blob = file.getBlob().setName(pathPrefix + "/" + file.getName());
      blobs.push(blob);
    }
    const subfolders = folder.getFolders();
    while (subfolders.hasNext()) {
      const sub = subfolders.next();
      collectBlobs(sub, pathPrefix + "/" + sub.getName());
    }
  }

  collectBlobs(root, "SRInvestmentsCRM");

  // Also include Database JSON snapshot
  const ss = getSpreadsheet_();
  const dbSnapshot = {
    exportedAt: new Date().toISOString(),
    firm: "SR INVESTMENTS",
    customers: getSheetRowsAsObjects_(getOrCreateSheet_(CRM_CONFIG.SHEETS.CUSTOMERS, CRM_SCHEMAS.CUSTOMERS), CRM_SCHEMAS.CUSTOMERS),
    employees: getSheetRowsAsObjects_(getOrCreateSheet_(CRM_CONFIG.SHEETS.EMPLOYEES, CRM_SCHEMAS.EMPLOYEES), CRM_SCHEMAS.EMPLOYEES)
  };
  blobs.push(Utilities.newBlob(JSON.stringify(dbSnapshot, null, 2), "application/json", "Database_Snapshot.json"));

  const dateStr = Utilities.formatDate(new Date(), "Asia/Kolkata", "yyyyMMdd_HHmmss");
  const zipFileName = "SR_Investments_Drive_Backup_" + dateStr + ".zip";
  const zipBlob = Utilities.zip(blobs, zipFileName);

  // Save to Drive or return base64
  const backupFolder = getDriveSubfolder_("TestBulkMailAttachments");
  const zipFile = backupFolder.createFile(zipBlob);
  zipFile.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);

  return {
    success: true,
    fileName: zipFileName,
    downloadUrl: zipFile.getDownloadUrl() || ("https://drive.google.com/uc?export=download&id=" + zipFile.getId())
  };
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

function jsonResponse_(data) {
  return ContentService.createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}

/**
 * CRM Setup
 */
function setupCRM() {
  const ss = getSpreadsheet_();

  Object.keys(CRM_CONFIG.SHEETS).forEach(key => {
    const sheetName = CRM_CONFIG.SHEETS[key];
    const schema = CRM_SCHEMAS[key];
    getOrCreateSheet_(sheetName, schema);
  });

  // Ensure Roles Rights includes BulkMail and DriveBackup
  const rightsSheet = getOrCreateSheet_(CRM_CONFIG.SHEETS.RIGHTS, CRM_SCHEMAS.RIGHTS);
  if (rightsSheet.getLastRow() <= 1) {
    const defaultRights = [
      ["Admin", "Dashboard", true, true, true, true],
      ["Admin", "Customers", true, true, true, true],
      ["Admin", "Staff", true, true, true, true],
      ["Admin", "BulkMail", true, true, true, true],
      ["Admin", "Settings", true, true, true, true],
      ["Admin", "DriveBackup", true, true, true, true],
      ["Relationship Manager", "Dashboard", true, false, false, false],
      ["Relationship Manager", "Customers", true, true, true, false],
      ["Relationship Manager", "Staff", true, false, false, false],
      ["Relationship Manager", "BulkMail", true, true, true, false],
      ["Relationship Manager", "Settings", false, false, false, false],
      ["Relationship Manager", "DriveBackup", false, false, false, false],
      ["Backoffice Staff", "Dashboard", true, false, false, false],
      ["Backoffice Staff", "Customers", true, true, true, false],
      ["Backoffice Staff", "Staff", false, false, false, false],
      ["Backoffice Staff", "BulkMail", true, true, true, false],
      ["Backoffice Staff", "Settings", false, false, false, false],
      ["Backoffice Staff", "DriveBackup", false, false, false, false]
    ];
    rightsSheet.getRange(2, 1, defaultRights.length, 6).setValues(defaultRights);
  }

  // Ensure Drive folders exist
  getDriveSubfolder_(CRM_CONFIG.SUBFOLDERS.CUSTOMERS);
  getDriveSubfolder_(CRM_CONFIG.SUBFOLDERS.EMPLOYEES);
  getDriveSubfolder_(CRM_CONFIG.SUBFOLDERS.ATTACHMENTS);

  Logger.log("SR INVESTMENTS CRM verified successfully.");
  return { success: true, message: "CRM sheets & Drive folders verified successfully!" };
}
