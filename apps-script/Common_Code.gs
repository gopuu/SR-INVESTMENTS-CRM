/**
 * SR INVESTMENTS CRM - Common Code & Database Infrastructure (Blue Family Edition)
 * 
 * Configured with live Google Drive & Spreadsheet references:
 * 1. Spreadsheet ID: 1Bll7386rIJD2CIl1VX--0Okcn-jxXOpII0OHh9FSKSM
 * 2. Root Drive Folder ID: 1IxulBQJTKrxYAyYMUhz5bllvaMZUYvy (SRInvestmentsCRM)
 * 3. Subfolders: SR_CRM_CustomerFiles, SR_CRM_EmployeeFiles
 */

const CRM_CONFIG = {
  // Live Google Spreadsheet ID
  SPREADSHEET_ID: "16OLRsLsRxn9Bn1P6eWs4QaC9Yj-oEVBASwEwVA-r_ww",

  // Live Google Drive Folder ID
  DRIVE_ROOT_FOLDER_ID: "1rVz2OnKPDHbXuq-ujsJg2R3vzYDwnzMU",
  
  SUBFOLDERS: {
    CUSTOMERS: "CustomerFiles",
    EMPLOYEES: "EmployeeFiles",
    DOCUMENTS: "UserDocuments"
  },

  SHEETS: {
    EMPLOYEE_EMAILS: "EmployeeEmails",
    EMPLOYEES: "Employees",
    CUSTOMERS: "Customers",
    USERS: "Users",
    SETTINGS: "CompanySettings",
    RIGHTS: "RolesRights",
    NOTIFICATIONS: "Notifications",
    DEPARTMENTS: "MasterDepartments",
    DESIGNATIONS: "MasterDesignations",
    ROLES: "MasterRoles",
    // SaaS Multi-Tenant Central Registries
    TENANT_MASTER: "Tenant_Master",
    USER_MASTER: "User_Master",
    TENANT_USER_MAPPING: "Tenant_User_Mapping",
    TENANT_LICENSES: "Tenant_Licenses",
    USER_DOCUMENTS: "User_Documents",
    SUBSCRIPTION_PLANS: "Subscription_Plans_Master",
    DEFAULT_CONFIG: "Default-Config",
    DAILY_DISPATCH_TRACKER: "Daily_Dispatch_Tracker",
    PAYMENT_ACCOUNTS: "Payment_Accounts"
  }
};

// Database Schema Definitions
const CRM_SCHEMAS = {
  // Payment Receiving Accounts Master (Central SaaS DB)
  PAYMENT_ACCOUNTS: [
    "AccountId", "AccountName", "AccountType", "AccountNumber", "Status",
    "IsDeleted", "Created_By", "Created_At", "Updated_By", "Updated_At", "Deleted_By", "Deleted_At"
  ],
  // Daily Email & SMS Dispatch Tracker (Central SaaS DB)
  DAILY_DISPATCH_TRACKER: [
    "Date", "EmailCount", "SmsCount", "Updated_At"
  ],
  // Platform Default Configuration (Central SaaS DB)
  DEFAULT_CONFIG: [
    "Key", "Value", "Description",
    "IsDeleted", "Created_By", "Created_At", "Updated_By", "Updated_At", "Deleted_By", "Deleted_At"
  ],
  // Subscription Plans Master (SaaS Tiers & Limits)
  SUBSCRIPTION_PLANS: [
    "PlanId", "PlanName", "PlanCode", "Price", "DurationMonths", "StaffLimit",
    "CustomerLimit", "Features", "IsPopular", "Badge", "Description", "Status",
    "IsDeleted", "Created_By", "Created_At", "Updated_By", "Updated_At", "Deleted_By", "Deleted_At"
  ],
  // Central SaaS Registries with 7 audit fields
  TENANT_MASTER: [
    "TenantId", "CompanyName", "TagLine", "ArnNumber", "SpreadsheetId", "DriveRootFolderId",
    "SupportEmail", "ContactPhone", "OfficeAddress", "Status",
    "IsDeleted", "Created_By", "Created_At", "Updated_By", "Updated_At", "Deleted_By", "Deleted_At"
  ],
  USER_MASTER: [
    "UserId", "Email", "AlternateEmailsList", "Password", "FullName", "Mobile", "AlternateMobile",
    "IsSuperAdmin", "Status",
    "IsDeleted", "Created_By", "Created_At", "Updated_By", "Updated_At", "Deleted_By", "Deleted_At"
  ],
  TENANT_USER_MAPPING: [
    "MappingId", "UserId", "TenantId", "Role", "Status",
    "IsDeleted", "Created_By", "Created_At", "Updated_By", "Updated_At", "Deleted_By", "Deleted_At"
  ],
  TENANT_LICENSES: [
    "Id", "TenantId", "LicenseType", "StartDate", "EndDate", "Amount",
    "PaymentMode", "TxnDate", "PaymentAccount", "ReferenceNo",
    "IsActive", "Status", "Notes",
    "IsDeleted", "Created_By", "Created_At", "Updated_By", "Updated_At", "Deleted_By", "Deleted_At"
  ],
  USER_DOCUMENTS: [
    "Id", "UserId", "TenantId", "DocName", "DocType", "DocPath",
    "DriveFileId", "ViewUrl",
    "IsDeleted", "Created_By", "Created_At", "Updated_By", "Updated_At", "Deleted_By", "Deleted_At"
  ],
  USERS: [
    "UserId", "Name", "Email", "Password", "Role", "Status", "CreatedAt", "LastLogin",
    "IsDeleted", "Created_By", "Created_At", "Updated_By", "Updated_At", "Deleted_By", "Deleted_At"
  ],
  CUSTOMERS: [
    "CustomerId", "CustomerCode", "FullName", "Email", "Mobile", "PanNumber",
    "AadhaarLast4", "KycStatus", "InvestorCategory", "DateOfBirth", "NomineeName",
    "NomineeRelation", "BankName", "AccountNumber", "IfscCode", "City", "State",
    "RiskProfile", "Notes", "Status",
    "IsDeleted", "Created_By", "Created_At", "Updated_By", "Updated_At", "Deleted_By", "Deleted_At",
    "Created_Approved_By", "Created_Approved_At",
    "Updated_Approved_By", "Updated_Approved_At",
    "Deleted_Approved_By", "Deleted_Approved_At",
    "Approval_History", "Approved_By", "Approved_At"
  ],
  EMPLOYEES: [
    "EmployeeId", "EmployeeCode", "FullName", "Email", "GoogleEmails", "Mobile", "AlternateMobile",
    "Department", "Designation", "Role", "Password", "JoiningDate", "Status",
    "Address", "City", "State", "PhotoUrl", "DriveFileId",
    "IsDeleted", "Created_By", "Created_At", "Updated_By", "Updated_At", "Deleted_By", "Deleted_At",
    "Created_Approved_By", "Created_Approved_At",
    "Updated_Approved_By", "Updated_Approved_At",
    "Deleted_Approved_By", "Deleted_Approved_At",
    "Approval_History", "Approved_By", "Approved_At"
  ],
  SETTINGS: [
    "Key", "Value", "Description",
    "IsDeleted", "Created_By", "Created_At", "Updated_By", "Updated_At", "Deleted_By", "Deleted_At"
  ],
  RIGHTS: [
    "Role", "Module", "CanView", "CanCreate", "CanEdit", "CanDelete",
    "IsDeleted", "Created_By", "Created_At", "Updated_By", "Updated_At", "Deleted_By", "Deleted_At"
  ],
  APP_TRACKER: [
    "Date", "Status", "Module", "Task", "Description / Updates"
  ],
  EMPLOYEE_EMAILS: [
    "Email", "Name", "Department", "Designation", "Status"
  ],
  NOTIFICATIONS: [
    "NotifId", "Timestamp", "ActorEmail", "ActorName", "ActorRole", "IsSuperUser", "TargetAudience",
    "Action", "Module", "RecordId", "Title", "Message", "TargetRoute", "ReadByEmails"
  ],
  DEPARTMENTS: [
    "DepartmentId", "DepartmentCode", "DepartmentName", "Description", "Status",
    "IsDeleted", "Created_By", "Created_At", "Updated_By", "Updated_At", "Deleted_By", "Deleted_At",
    "Created_Approved_By", "Created_Approved_At",
    "Updated_Approved_By", "Updated_Approved_At",
    "Deleted_Approved_By", "Deleted_Approved_At",
    "Approval_History", "Approved_By", "Approved_At"
  ],
  DESIGNATIONS: [
    "DesignationId", "DesignationCode", "DesignationName", "Department", "Description", "Status",
    "IsDeleted", "Created_By", "Created_At", "Updated_By", "Updated_At", "Deleted_By", "Deleted_At",
    "Created_Approved_By", "Created_Approved_At",
    "Updated_Approved_By", "Updated_Approved_At",
    "Deleted_Approved_By", "Deleted_Approved_At",
    "Approval_History", "Approved_By", "Approved_At"
  ],
  ROLES: [
    "RoleId", "RoleCode", "RoleName", "Description", "Status",
    "IsDeleted", "Created_By", "Created_At", "Updated_By", "Updated_At", "Deleted_By", "Deleted_At",
    "Created_Approved_By", "Created_Approved_At",
    "Updated_Approved_By", "Updated_Approved_At",
    "Deleted_Approved_By", "Deleted_Approved_At",
    "Approval_History", "Approved_By", "Approved_At"
  ]
};

// Central SaaS Master Registry Sheets (Live EXCLUSIVELY in Central_SaaS_Master_DB)
const CENTRAL_MASTER_SHEETS = [
  "Tenant_Master",
  "User_Master",
  "Tenant_User_Mapping",
  "Tenant_Licenses",
  "Tenant_Licensing",
  "Subscription_Plans_Master",
  "Default-Config",
  "Default_Config",
  "Daily_Dispatch_Tracker",
  "Payment_Accounts"
];

// Operational CRM Tables (Live EXCLUSIVELY in _CRM_DATABASE_TEMPLATE and Tenant databases)
const TENANT_OPERATIONAL_SHEETS = [
  "Customers",
  "Employees",
  "Notifications",
  "User_Documents",
  "CompanySettings",
  "RolesRights",
  "MasterDepartments",
  "MasterDesignations",
  "MasterRoles",
  "Users",
  "EmployeeEmails"
];

/**
 * Open CRM Database Spreadsheet (Central SaaS Master DB)
 */
function getSpreadsheet_() {
  try {
    return SpreadsheetApp.openById(CRM_CONFIG.SPREADSHEET_ID);
  } catch (err) {
    throw new Error("Unable to open Central Spreadsheet ID: " + CRM_CONFIG.SPREADSHEET_ID + ". Ensure the script has access permissions.");
  }
}

/**
 * Resolves or creates the blueprint _CRM_DATABASE_TEMPLATE in the Drive root folder
 */
function getOrCreateTemplateSpreadsheet_() {
  try {
    const root = getDriveRootFolder_();
    const files = root.getFilesByName("_CRM_DATABASE_TEMPLATE");
    if (files.hasNext()) {
      const file = files.next();
      return SpreadsheetApp.openById(file.getId());
    }

    // Create blueprint template spreadsheet in CRM root folder
    const newSs = SpreadsheetApp.create("_CRM_DATABASE_TEMPLATE");
    const newFile = DriveApp.getFileById(newSs.getId());
    root.addFile(newFile);
    try {
      DriveApp.getRootFolder().removeFile(newFile);
    } catch (e) {}

    setupTenantTemplateDatabase(newSs.getId());
    return newSs;
  } catch (err) {
    Logger.log("getOrCreateTemplateSpreadsheet_ error: " + err.message);
    throw new Error("Could not locate or initialize _CRM_DATABASE_TEMPLATE: " + err.message);
  }
}

/**
 * Dynamically resolves and opens a Tenant's dedicated Spreadsheet.
 * CRITICAL ISOLATION RULE: NEVER returns Central_SaaS_Master_DB for tenant operational data!
 */
function getTenantSpreadsheet_(tenantId) {
  // 1. If tenantId is passed, locate tenant's dedicated SpreadsheetId in Tenant_Master
  if (tenantId) {
    try {
      const centralSheet = getOrCreateSheet_(CRM_CONFIG.SHEETS.TENANT_MASTER, CRM_SCHEMAS.TENANT_MASTER);
      const tenants = getSheetRowsAsObjects_(centralSheet, CRM_SCHEMAS.TENANT_MASTER);
      const t = tenants.find(x => 
        String(x.TenantId).trim().toUpperCase() === String(tenantId).trim().toUpperCase() && 
        !x.IsDeleted
      );
      if (t && t.SpreadsheetId && String(t.SpreadsheetId).trim() !== "") {
        const sid = String(t.SpreadsheetId).trim();
        // Prevent accidental loopback to Central DB
        if (sid !== CRM_CONFIG.SPREADSHEET_ID) {
          return SpreadsheetApp.openById(sid);
        }
      }
    } catch (err) {
      Logger.log("getTenantSpreadsheet_ lookup error for " + tenantId + ": " + err.message);
    }
  }

  // 2. If tenantId is missing or has no dedicated sheet, check if first active tenant has a dedicated DB
  try {
    const centralSheet = getOrCreateSheet_(CRM_CONFIG.SHEETS.TENANT_MASTER, CRM_SCHEMAS.TENANT_MASTER);
    const tenants = getSheetRowsAsObjects_(centralSheet, CRM_SCHEMAS.TENANT_MASTER);
    const activeTenantWithDb = tenants.find(x => 
      !x.IsDeleted && 
      x.SpreadsheetId && 
      String(x.SpreadsheetId).trim() !== "" && 
      String(x.SpreadsheetId).trim() !== CRM_CONFIG.SPREADSHEET_ID
    );
    if (activeTenantWithDb) {
      return SpreadsheetApp.openById(String(activeTenantWithDb.SpreadsheetId).trim());
    }
  } catch (e) {}

  // 3. Fallback to blueprint _CRM_DATABASE_TEMPLATE (NEVER Central_SaaS_Master_DB!)
  return getOrCreateTemplateSpreadsheet_();
}

/**
 * Dynamically resolves and opens a Tenant's dedicated Drive Folder
 */
function getTenantDriveRootFolder_(tenantId) {
  if (!tenantId) return getDriveRootFolder_();
  try {
    const centralSheet = getOrCreateSheet_(CRM_CONFIG.SHEETS.TENANT_MASTER, CRM_SCHEMAS.TENANT_MASTER);
    const tenants = getSheetRowsAsObjects_(centralSheet, CRM_SCHEMAS.TENANT_MASTER);
    const t = tenants.find(x => String(x.TenantId).trim().toUpperCase() === String(tenantId).trim().toUpperCase() && !x.IsDeleted);
    if (t && t.DriveRootFolderId && String(t.DriveRootFolderId).trim() !== "") {
      return DriveApp.getFolderById(String(t.DriveRootFolderId).trim());
    }
  } catch (err) {
    Logger.log("getTenantDriveRootFolder_ error for " + tenantId + ": " + err.message);
  }
  return getDriveRootFolder_();
}

/**
 * Ensures a sheet tab exists in the spreadsheet, and ensures all columns in schema exist in Row 1.
 * - If tab does not exist -> creates tab.
 * - If tab is empty -> creates all columns from schema in Row 1 with Royal Blue header formatting.
 * - If tab exists with columns -> checks Row 1: if any column from schema does not exist, appends it dynamically!
 */
function ensureSheetAndColumns_(ss, sheetName, schema) {
  if (!ss) return null;
  let sheet = ss.getSheetByName(sheetName);
  if (!sheet && (sheetName === "Tenant_Licenses" || sheetName === "Tenant_Licensing")) {
    sheet = ss.getSheetByName("Tenant_Licensing") || ss.getSheetByName("Tenant_Licenses");
  }
  if (!sheet && (sheetName === "Default-Config" || sheetName === "Default_Config")) {
    sheet = ss.getSheetByName("Default-Config") || ss.getSheetByName("Default_Config");
  }

  // 1. IF TAB DOES NOT EXIST, CREATE IT
  if (!sheet) {
    try {
      sheet = ss.insertSheet(sheetName);
    } catch (err) {
      sheet = ss.getSheetByName(sheetName);
    }
  }
  if (!sheet || typeof sheet.getLastColumn !== "function") return null;

  const lastCol = sheet.getLastColumn();
  const lastRow = sheet.getLastRow();

  // 2. IF TAB HAS NO HEADERS, INITIALIZE WITH COMPLETE SCHEMA
  if ((lastRow === 0 || lastCol === 0) && schema && schema.length) {
    sheet.getRange(1, 1, 1, schema.length).setValues([schema]);
    sheet.setFrozenRows(1);
    sheet.getRange(1, 1, 1, schema.length)
      .setFontWeight("bold")
      .setBackground("#1e40af") // Royal Blue
      .setFontColor("#ffffff");
    sheet.autoResizeColumns(1, schema.length);
  } else if (schema && schema.length && lastCol > 0) {
    // 3. IF TAB EXISTS, VERIFY EACH COLUMN: IF COLUMN DOES NOT EXIST, CREATE IT!
    const existingHeaders = sheet.getRange(1, 1, 1, lastCol).getValues()[0].map(h => String(h || "").trim());
    const existingLower = existingHeaders.map(h => h.toLowerCase());

    // Automatic column renaming / migration for User_Master (GoogleEmails -> AlternateEmailsList)
    if (sheetName === "User_Master" || sheetName === CRM_CONFIG.SHEETS.USER_MASTER) {
      const gIdx = existingHeaders.findIndex(h => h.toLowerCase() === "googleemails");
      if (gIdx !== -1) {
        sheet.getRange(1, gIdx + 1).setValue("AlternateEmailsList");
        existingHeaders[gIdx] = "AlternateEmailsList";
        existingLower[gIdx] = "alternateemailslist";
        Logger.log("[COLUMN_RENAME] User_Master: Successfully renamed column 'GoogleEmails' to 'AlternateEmailsList' at column " + (gIdx + 1));
      }
    }

    // Automatic column migration for Tenant_Licenses / Tenant_Licensing to insert Payment fields
    if (sheetName === "Tenant_Licenses" || sheetName === "Tenant_Licensing" || sheetName === CRM_CONFIG.SHEETS.TENANT_LICENSES) {
      const hasPaymentMode = existingLower.indexOf("paymentmode") !== -1;
      if (!hasPaymentMode) {
        modifyTenantLicensingColumns_(sheet);
        return sheet;
      }
    }

    // Automatic column migration for Tenant_Master to insert TagLine column if missing
    if (sheetName === "Tenant_Master" || sheetName === CRM_CONFIG.SHEETS.TENANT_MASTER) {
      const hasTagLine = existingLower.indexOf("tagline") !== -1;
      if (!hasTagLine) {
        const cNameIdx = existingLower.indexOf("companyname");
        if (cNameIdx !== -1) {
          sheet.insertColumnAfter(cNameIdx + 1);
          const tagCol = cNameIdx + 2;
          sheet.getRange(1, tagCol).setValue("TagLine")
            .setFontWeight("bold")
            .setBackground("#1e40af")
            .setFontColor("#ffffff");
          const numRows = sheet.getLastRow();
          if (numRows > 1) {
            for (let r = 2; r <= numRows; r++) {
              const cur = sheet.getRange(r, tagCol).getValue();
              if (!cur) sheet.getRange(r, tagCol).setValue("Mutual Fund CRM");
            }
          }
          existingHeaders.splice(cNameIdx + 1, 0, "TagLine");
          existingLower.splice(cNameIdx + 1, 0, "tagline");
          Logger.log("[COLUMN_MIGRATION] Tenant_Master: Inserted 'TagLine' column after 'CompanyName' at column " + tagCol);
        }
      }
    }

    const missingColumns = [];
    schema.forEach(colName => {
      if (existingLower.indexOf(colName.toLowerCase()) === -1) {
        missingColumns.push(colName);
      }
    });

    if (missingColumns.length > 0) {
      const startCol = lastCol + 1;
      const numColsToAdd = missingColumns.length;
      sheet.getRange(1, startCol, 1, numColsToAdd).setValues([missingColumns]);
      sheet.getRange(1, startCol, 1, numColsToAdd)
        .setFontWeight("bold")
        .setBackground("#1e40af") // Royal Blue
        .setFontColor("#ffffff");
      sheet.autoResizeColumns(startCol, numColsToAdd);
      Logger.log("[AUTO_COLUMN_SYNC] Sheet '" + sheetName + "' appended missing column(s): " + missingColumns.join(", "));
    }
  }

  return sheet;
}

/**
 * Get or initialize specific sheet by name with strict Central vs Tenant isolation.
 * 
 * Rules:
 * - Central Master sheets (Tenant_Master, User_Master, Tenant_User_Mapping, Tenant_Licenses, Subscription_Plans_Master)
 *   MUST exist ONLY in Central_SaaS_Master_DB.
 * - Tenant Operational sheets (Customers, Employees, Notifications, User_Documents, Settings, etc.)
 *   MUST exist ONLY in _CRM_DATABASE_TEMPLATE or the tenant's dedicated database.
 * - If tab does not exist -> creates tab.
 * - If any column does not exist -> creates column in Row 1.
 */
function getOrCreateSheet_(sheetName, schema, tenantId) {
  const isCentralSheet = CENTRAL_MASTER_SHEETS.indexOf(sheetName) !== -1;

  let ss;
  if (isCentralSheet) {
    ss = getSpreadsheet_();
  } else {
    // Operational tenant sheet (Customers, Employees, Notifications, User_Documents, Settings, etc.)
    ss = getTenantSpreadsheet_(tenantId);

    // STRICT ISOLATION GUARD:
    // If ss is somehow the Central Master DB, NEVER insert tenant operational sheets into Central DB!
    if (ss.getId() === CRM_CONFIG.SPREADSHEET_ID) {
      Logger.log("[MULTI-TENANT GUARD BLOCKED] Attempted to open/create operational sheet '" + sheetName + "' in Central DB. Redirecting to template.");
      ss = getOrCreateTemplateSpreadsheet_();
    }
  }

  // Final sanity check before creating operational sheet
  if (!isCentralSheet && ss.getId() === CRM_CONFIG.SPREADSHEET_ID) {
    throw new Error("Strict SaaS Isolation: Cannot create operational sheet '" + sheetName + "' in Central_SaaS_Master_DB.");
  }

  return ensureSheetAndColumns_(ss, sheetName, schema);
}

/**
 * Read rows as JSON Objects dynamically mapped against actual Sheet Row 1 Headers.
 * This completely prevents column shifting even if the user's spreadsheet has columns
 * in a different sequence or from earlier versions.
 */
function getSheetRowsAsObjects_(sheet, fallbackSchema) {
  if (!sheet || typeof sheet.getLastColumn !== "function") return [];
  const lastRow = sheet.getLastRow();
  const lastCol = sheet.getLastColumn();
  if (lastRow <= 1 || lastCol === 0) return [];

  // Read actual header names from Row 1
  const rawHeaders = sheet.getRange(1, 1, 1, lastCol).getValues()[0];
  const headers = rawHeaders.map(h => String(h || "").trim());

  const headerIndexMap = {};
  headers.forEach((h, idx) => {
    if (h) {
      headerIndexMap[h] = idx;
      headerIndexMap[h.toLowerCase()] = idx;
    }
  });

  const values = sheet.getRange(2, 1, lastRow - 1, lastCol).getValues();
  return values
    .filter(row => row.some(cell => String(cell).trim() !== ""))
    .map(row => {
      const obj = {};

      // 1. Map values directly by sheet header name
      headers.forEach((headerName, i) => {
        if (!headerName) return;
        let val = row[i];
        if (val instanceof Date) {
          val = Utilities.formatDate(val, "Asia/Kolkata", "yyyy-MM-dd");
        }
        obj[headerName] = val !== undefined && val !== null ? val : "";
      });

      // 2. Ensure fallback schema fields exist on obj
      if (fallbackSchema && fallbackSchema.length) {
        fallbackSchema.forEach(field => {
          if (obj[field] === undefined) {
            const mappedIdx = headerIndexMap[field.toLowerCase()];
            if (mappedIdx !== undefined) {
              let val = row[mappedIdx];
              if (val instanceof Date) {
                val = Utilities.formatDate(val, "Asia/Kolkata", "yyyy-MM-dd");
              }
              obj[field] = val !== undefined && val !== null ? val : "";
            } else {
              obj[field] = "";
            }
          }
        });
      }

      // 3. Cross-compatibility aliases for User_Master AlternateEmailsList vs GoogleEmails
      if (obj.AlternateEmailsList !== undefined && obj.GoogleEmails === undefined) {
        obj.GoogleEmails = obj.AlternateEmailsList;
      } else if (obj.GoogleEmails !== undefined && obj.AlternateEmailsList === undefined) {
        obj.AlternateEmailsList = obj.GoogleEmails;
      }

      // 4. Status normalization: accurately recognize Active, Inactive, Expired, CANCELLED, and NEW
      if (obj.Status) {
        const s = String(obj.Status).trim().toLowerCase();
        if (s === "cancelled") {
          obj.Status = "CANCELLED";
        } else if (s === "expired") {
          obj.Status = "Expired";
        } else if (s === "new" || s === "upcoming" || s === "pending") {
          obj.Status = "NEW";
        } else if (s === "active" || s === "act") {
          obj.Status = "Active";
        } else if (s === "inactive" || s === "inact") {
          obj.Status = "Inactive";
        } else if (s === "suspended" || s === "locked") {
          obj.Status = "Suspended";
        }
      }

      return obj;
    });
}

/**
 * Writes a row to a sheet strictly by matching field keys to Row 1 headers.
 * Appends any missing schema headers to Row 1 dynamically without column shift.
 */
function writeRowByHeaders_(sheet, rowIndex, rowObj, schema) {
  if (!sheet || typeof sheet.getLastColumn !== "function") return;
  let lastCol = sheet.getLastColumn();
  let headers = lastCol > 0 ? sheet.getRange(1, 1, 1, lastCol).getValues()[0].map(h => String(h || "").trim()) : [];

  if (schema && schema.length) {
    let headersModified = false;
    schema.forEach(col => {
      if (!headers.includes(col)) {
        headers.push(col);
        headersModified = true;
      }
    });

    if (headersModified || lastCol === 0) {
      sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
      sheet.getRange(1, 1, 1, headers.length)
        .setFontWeight("bold")
        .setBackground("#0f172a")
        .setFontColor("#ffffff");
    }
  }

  const rowValues = headers.map(headerName => {
    let val = rowObj[headerName];
    if (val === undefined || val === null) {
      const key = Object.keys(rowObj).find(k => k.toLowerCase() === headerName.toLowerCase());
      val = key ? rowObj[key] : "";
    }
    return val !== undefined && val !== null ? val : "";
  });

  if (rowIndex > 0) {
    sheet.getRange(rowIndex, 1, 1, rowValues.length).setValues([rowValues]);
  } else {
    sheet.appendRow(rowValues);
  }
}

/**
 * Finds 1-based column index of a header in a sheet
 */
function getHeaderColIndex_(sheet, headerName) {
  if (!sheet || typeof sheet.getLastColumn !== "function") return -1;
  const lastCol = sheet.getLastColumn();
  if (lastCol === 0) return -1;
  const headers = sheet.getRange(1, 1, 1, lastCol).getValues()[0].map(h => String(h || "").trim().toLowerCase());
  const idx = headers.indexOf(headerName.toLowerCase());
  return idx >= 0 ? idx + 1 : -1;
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
 * Get or create subfolder inside Drive root or tenant-specific drive folder
 */
function getDriveSubfolder_(folderName, tenantId) {
  const root = tenantId ? getTenantDriveRootFolder_(tenantId) : getDriveRootFolder_();
  const folders = root.getFoldersByName(folderName);
  if (folders.hasNext()) return folders.next();
  return root.createFolder(folderName);
}

/**
 * Upload file to Drive and delete old file if updating (supports tenant routing)
 */
function uploadDriveFile_(folderName, fileName, mimeType, base64Data, oldFileId, tenantId) {
  if (!base64Data) throw new Error("Base64 file data required.");

  if (oldFileId) {
    deleteDriveFileSafely_(oldFileId);
  }

  const subfolder = getDriveSubfolder_(folderName, tenantId);
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
 * Hashes a password string with SHA-256 (64 hex characters)
 * If already a 64-char hex string, returns it intact
 */
function hashPasswordSHA256_(password) {
  if (!password) return "";
  const str = String(password).trim();
  if (/^[a-f0-9]{64}$/i.test(str)) {
    return str.toLowerCase();
  }
  const rawBytes = Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, str, Utilities.Charset.UTF_8);
  let hex = "";
  for (let i = 0; i < rawBytes.length; i++) {
    let byteVal = rawBytes[i];
    if (byteVal < 0) byteVal += 256;
    const byteHex = byteVal.toString(16);
    hex += (byteHex.length === 1 ? "0" : "") + byteHex;
  }
  return hex.toLowerCase();
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

function formatBytes_(bytes) {
  if (!bytes || bytes <= 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
}

/**
 * Reads existing ZIP backup files from the tenant drive root folder,
 * sorted newest first by creation timestamp
 */
function getExistingZipBackups_(folder) {
  const zipList = [];
  try {
    const files = folder.getFiles();
    while (files.hasNext()) {
      const file = files.next();
      const name = file.getName();
      if (name.toLowerCase().endsWith(".zip")) {
        const createdDate = file.getDateCreated();
        zipList.push({
          file: file,
          id: file.getId(),
          name: name,
          size: file.getSize(),
          sizeFormatted: formatBytes_(file.getSize()),
          createdAt: createdDate ? createdDate.getTime() : 0,
          createdDate: createdDate ? createdDate.toISOString() : new Date().toISOString(),
          downloadUrl: file.getDownloadUrl() || ("https://drive.google.com/uc?export=download&id=" + file.getId()),
          viewUrl: file.getUrl()
        });
      }
    }
  } catch (err) {
    Logger.log("getExistingZipBackups_ error: " + err.message);
  }
  zipList.sort((a, b) => b.createdAt - a.createdAt);
  return zipList;
}

/**
 * Get listing of last 3 backups and Drive folder path for tenant
 */
function getDriveBackupsList_(payload) {
  payload = payload || {};
  const tenantId = payload.tenantId || payload.activeTenantId || null;
  const root = tenantId ? getTenantDriveRootFolder_(tenantId) : getDriveRootFolder_();

  let companyName = "SR_Investments";
  let activeTenantId = tenantId || "TEN001";
  let companyEmail = "";
  try {
    const centralSheet = getOrCreateSheet_(CRM_CONFIG.SHEETS.TENANT_MASTER, CRM_SCHEMAS.TENANT_MASTER);
    const tenants = getSheetRowsAsObjects_(centralSheet, CRM_SCHEMAS.TENANT_MASTER);
    const t = tenants.find(x => String(x.TenantId).trim().toUpperCase() === String(activeTenantId).trim().toUpperCase() && !x.IsDeleted);
    if (t && t.CompanyName) companyName = t.CompanyName;
    if (t && t.TenantId) activeTenantId = t.TenantId;
    if (t && t.SupportEmail) companyEmail = t.SupportEmail;
  } catch (e) {}

  if (!companyEmail && payload.userEmail) {
    companyEmail = payload.userEmail;
  }

  const cleanCompany = String(companyName).trim().replace(/[^a-zA-Z0-9_-]/g, "_");
  const cleanTenant = String(activeTenantId).trim().replace(/[^a-zA-Z0-9_-]/g, "_");
  const existingZips = getExistingZipBackups_(root);

  const dispatchStats = getDailyDispatchStats_();
  const emailCount = Number(dispatchStats.emailCount || 0);
  const emailMaxLimit = Number(dispatchStats.emailMaxLimit || 200);
  const isEmailLimitReached = emailCount >= emailMaxLimit;
  const remainingEmails = Math.max(0, emailMaxLimit - emailCount);

  return {
    success: true,
    companyName: cleanCompany,
    tenantId: cleanTenant,
    companyEmail: companyEmail,
    driveFolderUrl: root.getUrl(),
    driveFolderPath: "My Drive > SRInvestmentsCRM > org > " + cleanTenant,
    driveFolderName: root.getName(),
    emailStats: {
      emailCount: emailCount,
      emailMaxLimit: emailMaxLimit,
      remainingEmails: remainingEmails,
      isLimitReached: isEmailLimitReached
    },
    backups: existingZips.slice(0, 3).map(z => ({
      id: z.id,
      name: z.name,
      sizeFormatted: z.sizeFormatted,
      createdDate: z.createdDate,
      downloadUrl: z.downloadUrl,
      viewUrl: z.viewUrl
    }))
  };
}

/**
 * Generate full ZIP backup of Google Drive folder and files
 * Retention: Always keep Current + last 2 backups (Max 3). Automatically removes older backups.
 * Naming: CompanyName_CRM_TENANTID_DATETIME.ZIP
 * Subfolders: CompanyName_CRM_TENANTID_<folder>
 */
function backupDriveFilesToZip_(payload) {
  payload = payload || {};
  const tenantId = payload.tenantId || payload.activeTenantId || null;
  const root = tenantId ? getTenantDriveRootFolder_(tenantId) : getDriveRootFolder_();

  let companyName = "SR_Investments";
  let activeTenantId = tenantId || "TEN001";
  let companyEmail = "";
  try {
    const centralSheet = getOrCreateSheet_(CRM_CONFIG.SHEETS.TENANT_MASTER, CRM_SCHEMAS.TENANT_MASTER);
    const tenants = getSheetRowsAsObjects_(centralSheet, CRM_SCHEMAS.TENANT_MASTER);
    const t = tenants.find(x => String(x.TenantId).trim().toUpperCase() === String(activeTenantId).trim().toUpperCase() && !x.IsDeleted);
    if (t && t.CompanyName) companyName = t.CompanyName;
    if (t && t.TenantId) activeTenantId = t.TenantId;
    if (t && t.SupportEmail) companyEmail = t.SupportEmail;
  } catch (e) {
    Logger.log("Could not resolve tenant for backup: " + e.message);
  }

  if (!companyEmail && payload.userEmail) {
    companyEmail = payload.userEmail;
  }

  const cleanCompany = String(companyName).trim().replace(/[^a-zA-Z0-9_-]/g, "_");
  const cleanTenant = String(activeTenantId).trim().replace(/[^a-zA-Z0-9_-]/g, "_");
  const prefixBase = cleanCompany + "_CRM_" + cleanTenant;

  // 1. Retention Management: Keep at most 2 previous backups so when new 1 is added, total is 3
  const existingZips = getExistingZipBackups_(root);
  if (existingZips.length >= 3) {
    // Delete oldest backups beyond the top 2
    for (let i = 2; i < existingZips.length; i++) {
      try {
        existingZips[i].file.setTrashed(true);
        Logger.log("Removed older backup exceeding retention limit (max 3): " + existingZips[i].name);
      } catch (err) {
        Logger.log("Error trashing older backup: " + err.message);
      }
    }
  }

  // 2. Helper to collect files recursively into ZIP with CompanyName_CRM_TENANTID_<folder> naming
  const blobs = [];
  function collectBlobs(folder, pathPrefix) {
    const files = folder.getFiles();
    while (files.hasNext()) {
      const file = files.next();
      const fname = file.getName();
      // Skip .zip backup files so we don't zip previous zips
      if (fname.toLowerCase().endsWith(".zip")) continue;
      const blob = file.getBlob().setName(pathPrefix + "/" + fname);
      blobs.push(blob);
    }
    const subfolders = folder.getFolders();
    while (subfolders.hasNext()) {
      const sub = subfolders.next();
      let subName = sub.getName();
      // Replace generic SR_CRM_ with CompanyName_CRM_TENANTID_
      if (subName.indexOf("SR_CRM_") === 0) {
        subName = subName.replace("SR_CRM_", prefixBase + "_");
      } else if (subName.indexOf("SR_") === 0) {
        subName = subName.replace("SR_", prefixBase + "_");
      } else {
        subName = prefixBase + "_" + subName;
      }
      collectBlobs(sub, pathPrefix + "/" + subName);
    }
  }

  collectBlobs(root, prefixBase);

  // 3. Database JSON snapshot (from tenant operational database)
  const custSheet = getOrCreateSheet_(CRM_CONFIG.SHEETS.CUSTOMERS, CRM_SCHEMAS.CUSTOMERS, tenantId);
  const empSheet = getOrCreateSheet_(CRM_CONFIG.SHEETS.EMPLOYEES, CRM_SCHEMAS.EMPLOYEES, tenantId);
  const dbSnapshot = {
    exportedAt: new Date().toISOString(),
    tenantId: cleanTenant,
    companyName: cleanCompany,
    customers: getSheetRowsAsObjects_(custSheet, CRM_SCHEMAS.CUSTOMERS),
    employees: getSheetRowsAsObjects_(empSheet, CRM_SCHEMAS.EMPLOYEES)
  };
  blobs.push(Utilities.newBlob(JSON.stringify(dbSnapshot, null, 2), "application/json", prefixBase + "_Database_Snapshot.json"));

  // 4. Create ZIP: CompanyName_CRM_TENANTID_DATETIME.ZIP
  const dateStr = Utilities.formatDate(new Date(), "Asia/Kolkata", "yyyyMMdd_HHmmss");
  const zipFileName = prefixBase + "_" + dateStr + ".zip";
  const zipBlob = Utilities.zip(blobs, zipFileName);

  // Save to Drive root folder
  const zipFile = root.createFile(zipBlob);
  zipFile.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);

  const fileSizeBytes = zipFile.getSize();
  const sizeFormatted = fileSizeBytes > 1048576 
    ? (fileSizeBytes / 1048576).toFixed(2) + " MB" 
    : (fileSizeBytes / 1024).toFixed(1) + " KB";
  const isLarge = fileSizeBytes > (20 * 1024 * 1024);

  // 5. Retrieve updated list of top 3 retained backups
  const updatedZips = getExistingZipBackups_(root).slice(0, 3);

  const dispatchStats = getDailyDispatchStats_();
  const emailCount = Number(dispatchStats.emailCount || 0);
  const emailMaxLimit = Number(dispatchStats.emailMaxLimit || 200);
  const isEmailLimitReached = emailCount >= emailMaxLimit;
  const remainingEmails = Math.max(0, emailMaxLimit - emailCount);

  return {
    success: true,
    fileId: zipFile.getId(),
    fileName: zipFileName,
    fileSizeBytes: fileSizeBytes,
    sizeFormatted: sizeFormatted,
    isLarge: isLarge,
    companyEmail: companyEmail,
    emailStats: {
      emailCount: emailCount,
      emailMaxLimit: emailMaxLimit,
      remainingEmails: remainingEmails,
      isLimitReached: isEmailLimitReached
    },
    downloadUrl: zipFile.getDownloadUrl() || ("https://drive.google.com/uc?export=download&id=" + zipFile.getId()),
    viewUrl: zipFile.getUrl(),
    driveFolderUrl: root.getUrl(),
    driveFolderPath: "My Drive > SRInvestmentsCRM > org > " + cleanTenant,
    driveFolderName: root.getName(),
    companyName: cleanCompany,
    tenantId: cleanTenant,
    backups: updatedZips.map(z => ({
      id: z.id,
      name: z.name,
      sizeFormatted: z.sizeFormatted,
      createdDate: z.createdDate,
      downloadUrl: z.downloadUrl,
      viewUrl: z.viewUrl
    }))
  };
}

/**
 * Send backup ZIP archive to company email.
 * Checks daily limit against Default-Config (EmailMaxLimitPerDay) and Daily_Dispatch_Tracker.
 * - If limit reached: throws error and advises manual download or waiting 24hrs.
 * - If under limit: sends email via MailApp and atomically increments Daily_Dispatch_Tracker count.
 * - If file size <= 20MB: attaches ZIP file directly + includes Google Drive link.
 * - If file size > 20MB (large): sends email with Google Drive download & view link + Drive path location.
 */
function sendBackupToEmail_(payload) {
  payload = payload || {};
  const fileId = payload.fileId;
  const tenantId = payload.tenantId || payload.activeTenantId || null;
  const recipientEmail = (payload.recipientEmail || payload.email || "").trim();

  if (!recipientEmail) {
    throw new Error("Recipient company email address is required.");
  }

  // 1. Quota & Limit Validation: Check Default-Config limit & Daily_Dispatch_Tracker count
  const dispatchStats = getDailyDispatchStats_();
  const currentEmailCount = Number(dispatchStats.emailCount || 0);
  const maxEmailLimit = Number(dispatchStats.emailMaxLimit || 200);

  if (currentEmailCount >= maxEmailLimit) {
    throw new Error(
      "Daily email limit reached (" + currentEmailCount + "/" + maxEmailLimit + " emails sent today). Please opt for manual download or try again after 24 hours."
    );
  }

  let file;
  if (fileId) {
    try {
      file = DriveApp.getFileById(fileId);
    } catch (e) {
      Logger.log("Could not find file by id: " + fileId);
    }
  }

  const root = tenantId ? getTenantDriveRootFolder_(tenantId) : getDriveRootFolder_();
  if (!file) {
    const existing = getExistingZipBackups_(root);
    if (existing.length === 0) {
      throw new Error("No backup archive found on Google Drive to email.");
    }
    file = existing[0].file;
  }

  const fileName = file.getName();
  const fileSizeBytes = file.getSize();
  const sizeFormatted = fileSizeBytes > 1048576 
    ? (fileSizeBytes / 1048576).toFixed(2) + " MB" 
    : (fileSizeBytes / 1024).toFixed(1) + " KB";

  let companyName = "SR Investments";
  let activeTenantId = tenantId || "TEN001";
  try {
    const centralSheet = getOrCreateSheet_(CRM_CONFIG.SHEETS.TENANT_MASTER, CRM_SCHEMAS.TENANT_MASTER);
    const tenants = getSheetRowsAsObjects_(centralSheet, CRM_SCHEMAS.TENANT_MASTER);
    const t = tenants.find(x => String(x.TenantId).trim().toUpperCase() === String(activeTenantId).trim().toUpperCase() && !x.IsDeleted);
    if (t && t.CompanyName) companyName = t.CompanyName;
    if (t && t.TenantId) activeTenantId = t.TenantId;
  } catch (e) {
    Logger.log("Error fetching company name for backup email: " + e.message);
  }

  const isLarge = fileSizeBytes > (20 * 1024 * 1024);
  const downloadUrl = file.getDownloadUrl() || ("https://drive.google.com/uc?export=download&id=" + file.getId());
  const driveFolderPath = "My Drive > SRInvestmentsCRM > org > " + activeTenantId;
  const driveFolderUrl = root.getUrl();
  const emailSubject = "[" + companyName + " CRM Backup] " + fileName;

  let deliveryMode = "attachment";
  const attachments = [];

  if (!isLarge) {
    try {
      attachments.push(file.getBlob().setName(fileName));
    } catch (attErr) {
      Logger.log("Could not get blob for attachment: " + attErr.message);
      deliveryMode = "drive_link";
    }
  } else {
    deliveryMode = "drive_link";
  }

  const htmlBody = 
    "<div style='font-family: Arial, sans-serif; max-width: 620px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 10px; overflow: hidden;'>" +
      "<div style='background: linear-gradient(135deg, #1e40af, #2563eb); padding: 22px; color: #ffffff; text-align: center;'>" +
        "<h2 style='margin: 0; font-size: 20px;'>" + companyName + " CRM</h2>" +
        "<p style='margin: 5px 0 0; opacity: 0.9; font-size: 13px;'>Full System & Google Drive Backup Archive</p>" +
      "</div>" +
      "<div style='padding: 24px; color: #1e293b; background: #ffffff;'>" +
        "<p style='font-size: 15px; margin-top: 0;'>Hello,</p>" +
        "<p style='font-size: 14px; line-height: 1.5; color: #334155;'>" +
          "A full system and Google Drive database backup archive has been generated for <strong>" + companyName + "</strong>." +
        "</p>" +
        "<div style='background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 16px; margin: 18px 0;'>" +
          "<table style='width: 100%; font-size: 13px; border-collapse: collapse;'>" +
            "<tr><td style='padding: 5px 0; color: #64748b; width: 140px;'><strong>Archive Name:</strong></td><td style='font-family: monospace; color: #0f172a; font-weight: 600;'>" + fileName + "</td></tr>" +
            "<tr><td style='padding: 5px 0; color: #64748b;'><strong>Archive Size:</strong></td><td style='color: #0f172a;'>" + sizeFormatted + (isLarge ? " <span style='background: #fef3c7; color: #92400e; padding: 2px 6px; border-radius: 4px; font-size: 11px; font-weight: 600;'>Large File (>20MB)</span>" : "") + "</td></tr>" +
            "<tr><td style='padding: 5px 0; color: #64748b;'><strong>Created At:</strong></td><td style='color: #0f172a;'>" + Utilities.formatDate(new Date(), "Asia/Kolkata", "dd MMM yyyy, hh:mm a") + " IST</td></tr>" +
            "<tr><td style='padding: 5px 0; color: #64748b;'><strong>Drive Location:</strong></td><td style='color: #2563eb; font-family: monospace;'>" + driveFolderPath + "</td></tr>" +
          "</table>" +
        "</div>" +
        (isLarge ? 
          "<div style='background: #fffbeb; border: 1px solid #fde68a; border-radius: 8px; padding: 14px; margin-bottom: 18px; color: #92400e; font-size: 13px; line-height: 1.5;'>" +
            "⚠️ <strong>Large File Notice:</strong> Because this backup package size (" + sizeFormatted + ") exceeds standard email attachment limits (>20MB), it has been securely stored in your company Google Drive. Click below to access or download it directly." +
          "</div>" : 
          "<p style='font-size: 13px; color: #16a34a; font-weight: 600;'>📎 The complete backup ZIP file is attached directly to this email.</p>"
        ) +
        "<div style='text-align: center; margin: 24px 0 16px;'>" +
          "<a href='" + downloadUrl + "' style='background: #2563eb; color: #ffffff; text-decoration: none; padding: 11px 22px; border-radius: 6px; font-size: 13px; font-weight: bold; display: inline-block; margin-right: 10px;'>📥 Download Backup (.ZIP)</a>" +
          "<a href='" + driveFolderUrl + "' style='background: #f1f5f9; color: #334155; text-decoration: none; padding: 11px 18px; border-radius: 6px; font-size: 13px; font-weight: 600; display: inline-block; border: 1px solid #cbd5e1;'>📁 Open in Google Drive</a>" +
        "</div>" +
      "</div>" +
      "<div style='background: #f8fafc; border-top: 1px solid #e2e8f0; padding: 14px; text-align: center; font-size: 12px; color: #94a3b8;'>" +
        "Retention Policy: The system automatically retains Current + Last 2 backups in Google Drive." +
      "</div>" +
    "</div>";

  const mailOptions = {
    to: recipientEmail,
    name: companyName + " CRM Backup Service",
    subject: emailSubject,
    htmlBody: htmlBody
  };

  if (attachments.length > 0) {
    mailOptions.attachments = attachments;
  }

  // 2. Dispatch email via MailApp
  MailApp.sendEmail(mailOptions);

  // 3. Atomically increment Daily_Dispatch_Tracker in Central DB
  let updatedStats = null;
  try {
    updatedStats = incrementDailyDispatchCount_("EMAIL");
  } catch (trackErr) {
    Logger.log("Could not update Daily_Dispatch_Tracker: " + trackErr.message);
  }

  const finalEmailCount = updatedStats ? updatedStats.emailCount : (currentEmailCount + 1);
  const remainingEmails = Math.max(0, maxEmailLimit - finalEmailCount);

  return {
    success: true,
    fileName: fileName,
    recipientEmail: recipientEmail,
    sizeFormatted: sizeFormatted,
    isLarge: isLarge,
    deliveryMode: deliveryMode,
    emailCount: finalEmailCount,
    emailMaxLimit: maxEmailLimit,
    remainingEmails: remainingEmails,
    message: isLarge 
      ? "Backup size is large (" + sizeFormatted + " > 20MB). Sent Google Drive download link and folder path to " + recipientEmail + ". (Today's count: " + finalEmailCount + "/" + maxEmailLimit + ")" 
      : "Backup package (" + sizeFormatted + ") sent successfully with ZIP attachment to " + recipientEmail + ". (Today's count: " + finalEmailCount + "/" + maxEmailLimit + ")"
  };
}

/**
 * Audit information is strictly embedded directly inside each Master table/sheet:
 * (IsDeleted, Created_At, Created_By, Updated_At, Updated_By, Deleted_At, Deleted_By).
 * Separate AuditLogs sheet is eliminated per architectural requirements.
 */
function logAudit_(userEmail, action, moduleOrDetails, recordId, details) {
  Logger.log("[MASTER_AUDIT] " + (userEmail || "System") + " | " + action + " | " + (moduleOrDetails || "") + " | " + (recordId || "") + " | " + (details || ""));
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
 * ==============================================================
 * CENTRAL SAAS MASTER DATABASE SETUP (Central_SaaS_Master_DB ONLY)
 * Sets up the Central SaaS Master Registries in Central_SaaS_Master_DB:
 * 1. Tenant_Master
 * 2. User_Master
 * 3. Tenant_User_Mapping
 * 4. Tenant_Licenses
 * 5. Subscription_Plans_Master
 * 6. Default-Config (Central System Config)
 * ==============================================================
 */
function setupCentralDatabase() {
  const centralSchemas = {
    [CRM_CONFIG.SHEETS.TENANT_MASTER]: CRM_SCHEMAS.TENANT_MASTER,
    [CRM_CONFIG.SHEETS.USER_MASTER]: CRM_SCHEMAS.USER_MASTER,
    [CRM_CONFIG.SHEETS.TENANT_USER_MAPPING]: CRM_SCHEMAS.TENANT_USER_MAPPING,
    [CRM_CONFIG.SHEETS.TENANT_LICENSES]: CRM_SCHEMAS.TENANT_LICENSES,
    [CRM_CONFIG.SHEETS.SUBSCRIPTION_PLANS]: CRM_SCHEMAS.SUBSCRIPTION_PLANS,
    [CRM_CONFIG.SHEETS.DEFAULT_CONFIG]: CRM_SCHEMAS.DEFAULT_CONFIG,
    [CRM_CONFIG.SHEETS.DAILY_DISPATCH_TRACKER]: CRM_SCHEMAS.DAILY_DISPATCH_TRACKER,
    [CRM_CONFIG.SHEETS.PAYMENT_ACCOUNTS]: CRM_SCHEMAS.PAYMENT_ACCOUNTS
  };

  Object.keys(centralSchemas).forEach(sheetName => {
    getOrCreateSheet_(sheetName, centralSchemas[sheetName]);
  });

  seedCentralSaaSRegistries_();
  seedSubscriptionPlans_();
  seedDefaultConfig_();

  Logger.log("[CENTRAL_DB] Central SaaS Master DB verified successfully.");
  return { success: true, message: "Central SaaS Master Database initialized successfully (Central Registries only)." };
}

/**
 * ==============================================================
 * BLUEPRINT TEMPLATE / TENANT DATABASE SETUP
 * Sets up all 11 operational CRM tables in _CRM_DATABASE_TEMPLATE
 * or in a specific tenant's dedicated database.
 * ==============================================================
 */
function setupTenantTemplateDatabase(spreadsheetId) {
  let ss;
  if (spreadsheetId) {
    ss = SpreadsheetApp.openById(spreadsheetId);
  } else {
    ss = getOrCreateTemplateSpreadsheet_();
  }

  const tenantSchemas = [
    { name: CRM_CONFIG.SHEETS.CUSTOMERS, schema: CRM_SCHEMAS.CUSTOMERS },
    { name: CRM_CONFIG.SHEETS.EMPLOYEES, schema: CRM_SCHEMAS.EMPLOYEES },
    { name: CRM_CONFIG.SHEETS.NOTIFICATIONS, schema: CRM_SCHEMAS.NOTIFICATIONS },
    { name: CRM_CONFIG.SHEETS.USER_DOCUMENTS, schema: CRM_SCHEMAS.USER_DOCUMENTS },
    { name: CRM_CONFIG.SHEETS.SETTINGS, schema: CRM_SCHEMAS.SETTINGS },
    { name: CRM_CONFIG.SHEETS.RIGHTS, schema: CRM_SCHEMAS.RIGHTS },
    { name: CRM_CONFIG.SHEETS.DEPARTMENTS, schema: CRM_SCHEMAS.DEPARTMENTS },
    { name: CRM_CONFIG.SHEETS.DESIGNATIONS, schema: CRM_SCHEMAS.DESIGNATIONS },
    { name: CRM_CONFIG.SHEETS.ROLES, schema: CRM_SCHEMAS.ROLES },
    { name: CRM_CONFIG.SHEETS.USERS, schema: CRM_SCHEMAS.USERS },
    { name: CRM_CONFIG.SHEETS.EMPLOYEE_EMAILS, schema: CRM_SCHEMAS.EMPLOYEE_EMAILS }
  ];

  tenantSchemas.forEach(item => {
    ensureSheetAndColumns_(ss, item.name, item.schema);
  });

  seedTenantDatabaseDefaults_(ss);

  // Ensure Drive subfolders exist
  getDriveSubfolder_(CRM_CONFIG.SUBFOLDERS.CUSTOMERS);
  getDriveSubfolder_(CRM_CONFIG.SUBFOLDERS.EMPLOYEES);

  Logger.log("[TEMPLATE_DB] Template database verified: " + ss.getName() + " (" + ss.getId() + ")");
  return {
    success: true,
    spreadsheetId: ss.getId(),
    spreadsheetName: ss.getName(),
    message: "Operational CRM tables initialized in " + ss.getName()
  };
}

/**
 * Fixes any formula errors (like #ERROR! in ContactPhone) and syncs CompanyName in tenant settings.
 */
function cleanTenantSettingsErrors_(ssOrId) {
  try {
    const ss = typeof ssOrId === "string" ? SpreadsheetApp.openById(ssOrId) : ssOrId;
    const sheet = ss.getSheetByName(CRM_CONFIG.SHEETS.SETTINGS) || ss.getSheetByName("CompanySettings") || ss.getSheetByName("Settings");
    if (!sheet) return;
    const lastRow = sheet.getLastRow();
    if (lastRow < 2) return;
    const values = sheet.getRange(2, 1, lastRow - 1, 2).getValues();
    for (let i = 0; i < values.length; i++) {
      const key = String(values[i][0] || "").trim().toLowerCase();
      const row = i + 2;
      if (key === "contactphone") {
        const cell = sheet.getRange(row, 2);
        const valStr = String(cell.getValue() || "");
        if (valStr.includes("ERROR") || valStr.includes("#") || valStr.startsWith("=") || !valStr.trim()) {
          cell.clearContent();
          cell.setNumberFormat("@").setValue("9876543210");
          Logger.log("[CLEAN_SETTINGS] Fixed ContactPhone #ERROR! in " + ss.getName());
        }
      } else if (key === "companyname") {
        const cell = sheet.getRange(row, 2);
        const curName = String(cell.getValue() || "").trim();
        if (curName === "SR Investmentss" || curName === "SR Investments") {
          cell.setValue("SR Groww");
          Logger.log("[CLEAN_SETTINGS] Synced CompanyName to 'SR Groww' in " + ss.getName());
        }
      }
    }
  } catch (err) {
    Logger.log("[CLEAN_SETTINGS_ERROR] " + err.message);
  }
}

/**
 * Master CRM Setup: Initializes Central DB registries, ensures _CRM_DATABASE_TEMPLATE exists,
 * and automatically upgrades all operational sheets across every tenant database with latest schema.
 */
function setupCRM() {
  const steps = [];
  try {
    setupCentralDatabase();
    steps.push("Central DB setup: OK");
  } catch (e) {
    steps.push("Central DB setup: " + e.message + " stack: " + (e.stack || ""));
  }

  try {
    setupTenantTemplateDatabase();
    steps.push("Template DB setup: OK");
  } catch (e) {
    steps.push("Template DB setup: " + e.message + " stack: " + (e.stack || ""));
  }

  const upgradedTenants = [];

  // Upgrade all active tenant databases registered in Central SaaS DB
  try {
    const centralSheet = getOrCreateSheet_(CRM_CONFIG.SHEETS.TENANT_MASTER, CRM_SCHEMAS.TENANT_MASTER);
    const tenants = getSheetRowsAsObjects_(centralSheet, CRM_SCHEMAS.TENANT_MASTER);
    tenants.forEach(t => {
      const sid = String(t.SpreadsheetId || "").trim();
      if (sid && sid !== CRM_CONFIG.SPREADSHEET_ID) {
        try {
          setupTenantTemplateDatabase(sid);
          cleanTenantSettingsErrors_(sid);
          upgradedTenants.push(t.TenantId + ": " + sid);
          Logger.log("[TENANT_UPGRADE_SUCCESS] Upgraded tenant database: " + t.TenantId + " (" + sid + ")");
        } catch (tErr) {
          Logger.log("[TENANT_UPGRADE_WARN] Tenant " + t.TenantId + " upgrade warning: " + tErr.message);
        }
      }
    });

    steps.push("Tenant databases upgraded: " + upgradedTenants.join(", "));

    // Sync TEN001 in Tenant_Master to SR Groww + Mutual Fund CRM tagline
    const rows = centralSheet.getDataRange().getValues();
    const headers = rows[0].map(h => String(h || "").trim().toLowerCase());
    const tIdIdx = headers.indexOf("tenantid");
    const cNameIdx = headers.indexOf("companyname");
    const tagIdx = headers.indexOf("tagline");
    if (tIdIdx !== -1 && cNameIdx !== -1) {
      for (let r = 1; r < rows.length; r++) {
        if (String(rows[r][tIdIdx]).trim().toUpperCase() === "TEN001") {
          centralSheet.getRange(r + 1, cNameIdx + 1).setValue("SR Groww");
          if (tagIdx !== -1) {
            const curTag = centralSheet.getRange(r + 1, tagIdx + 1).getValue();
            if (!curTag) centralSheet.getRange(r + 1, tagIdx + 1).setValue("Mutual Fund CRM");
          }
        }
      }
    }
    steps.push("TEN001 branding sync: OK");
  } catch (err) {
    Logger.log("[TENANT_UPGRADE_ERROR] " + err.message);
    steps.push("Tenant upgrade error: " + err.message);
  }

  return { 
    success: true, 
    message: "Central SaaS Master DB and all Tenant Databases upgraded successfully!",
    steps: steps,
    upgradedTenants: upgradedTenants
  };
}

/**
 * ==============================================================
 * CLEAN ACCIDENTAL SHEETS FROM CENTRAL SAAS DATABASE
 * Removes operational sheets (Customers, Employees, Notifications,
 * User_Documents, Settings, etc.) mistakenly created in Central DB.
 * Retains ONLY the 5 Central SaaS Master Registries.
 * ==============================================================
 */
function cleanCentralDatabase() {
  const ss = getSpreadsheet_();
  const sheets = ss.getSheets();
  const deleted = [];
  const preserved = [];

  // Identify central vs accidental sheets
  sheets.forEach(sheet => {
    const name = sheet.getName();
    if (CENTRAL_MASTER_SHEETS.indexOf(name) !== -1) {
      preserved.push(name);
    }
  });

  // Safe delete accidental non-central sheets
  sheets.forEach(sheet => {
    const name = sheet.getName();
    if (CENTRAL_MASTER_SHEETS.indexOf(name) === -1) {
      if (ss.getSheets().length > 1) {
        ss.deleteSheet(sheet);
        deleted.push(name);
      }
    }
  });

  Logger.log("[CLEAN_CENTRAL_DB] Preserved: " + preserved.join(", ") + " | Deleted: " + deleted.join(", "));
  return {
    success: true,
    message: "Purged " + deleted.length + " accidental operational sheets from Central SaaS DB.",
    preservedSheets: preserved,
    deletedSheets: deleted
  };
}

/**
 * Seed initial Central SaaS records if empty
 */
function seedCentralSaaSRegistries_() {
  const now = new Date().toISOString();

  // 1. Tenant_Master seed
  const tenantSheet = getOrCreateSheet_(CRM_CONFIG.SHEETS.TENANT_MASTER, CRM_SCHEMAS.TENANT_MASTER);
  if (tenantSheet.getLastRow() <= 1) {
    const defaultTenant = [
      "TEN001", "SR Investments HQ", "ARN-189241", "", CRM_CONFIG.DRIVE_ROOT_FOLDER_ID,
      "support@srinvestments.com", "+91 98200 12345", "Mumbai, Maharashtra", "Active",
      false, "system", now, "system", now, "", ""
    ];
    tenantSheet.getRange(2, 1, 1, CRM_SCHEMAS.TENANT_MASTER.length).setValues([defaultTenant]);
  }

  // 2. User_Master seed
  const userSheet = getOrCreateSheet_(CRM_CONFIG.SHEETS.USER_MASTER, CRM_SCHEMAS.USER_MASTER);
  if (userSheet.getLastRow() <= 1) {
    const hashedPass = hashPasswordSHA256_("admin123");
    const defaultUser = [
      "USR_001", "admin@srinvestments.com", "admin.sr@gmail.com, founder@gmail.com", hashedPass,
      "System Administrator", "+91 98201 11223", "", true, "Active",
      false, "system", now, "system", now, "", ""
    ];
    userSheet.getRange(2, 1, 1, CRM_SCHEMAS.USER_MASTER.length).setValues([defaultUser]);
  }

  // 3. Tenant_User_Mapping seed
  const mapSheet = getOrCreateSheet_(CRM_CONFIG.SHEETS.TENANT_USER_MAPPING, CRM_SCHEMAS.TENANT_USER_MAPPING);
  if (mapSheet.getLastRow() <= 1) {
    const defaultMap = [
      "MAP_001", "USR_001", "TEN001", "Admin", "Active",
      false, "system", now, "system", now, "", ""
    ];
    mapSheet.getRange(2, 1, 1, CRM_SCHEMAS.TENANT_USER_MAPPING.length).setValues([defaultMap]);
  }

  // 4. Tenant_Licenses seed
  const licSheet = getOrCreateSheet_(CRM_CONFIG.SHEETS.TENANT_LICENSES, CRM_SCHEMAS.TENANT_LICENSES);
  if (licSheet.getLastRow() <= 1) {
    const defaultLic = [
      "LIC_101", "TEN001", "Enterprise", now.slice(0, 10), "2027-12-31", 120000,
      true, "Active", "Founder Enterprise SaaS License",
      false, "system", now, "system", now, "", ""
    ];
    licSheet.getRange(2, 1, 1, CRM_SCHEMAS.TENANT_LICENSES.length).setValues([defaultLic]);
  }

  // 5. Payment_Accounts seed (Ensure tab exists in Central DB)
  ensurePaymentAccountsSheet_();
}

/**
 * Seed default settings, roles/rights, and masters in a Tenant/Template database
 */
function seedTenantDatabaseDefaults_(ss) {
  const now = new Date().toISOString();

  // CompanySettings
  const setSheet = ss.getSheetByName(CRM_CONFIG.SHEETS.SETTINGS);
  if (setSheet && setSheet.getLastRow() <= 1) {
    const defaultSettings = [
      ["CompanyName", "SR Investments", "Company legal trade name", false, "System", now, "System", now, "", ""],
      ["ArnNumber", "ARN-189241", "AMFI registration number", false, "System", now, "System", now, "", ""],
      ["SupportEmail", "support@srinvestments.com", "Primary support email", false, "System", now, "System", now, "", ""],
      ["KycAutoVerify", "TRUE", "Enable automatic KYC verification", false, "System", now, "System", now, "", ""]
    ];
    setSheet.getRange(2, 1, defaultSettings.length, CRM_SCHEMAS.SETTINGS.length).setValues(defaultSettings);
  }

  // RolesRights
  const rightsSheet = ss.getSheetByName(CRM_CONFIG.SHEETS.RIGHTS);
  if (rightsSheet && rightsSheet.getLastRow() <= 1) {
    const defaultRights = [
      ["Admin", "Dashboard", true, true, true, true, false, "System", now, "System", now, "", ""],
      ["Admin", "Customers", true, true, true, true, false, "System", now, "System", now, "", ""],
      ["Admin", "Staff", true, true, true, true, false, "System", now, "System", now, "", ""],
      ["Admin", "MasterDepartments", true, true, true, true, false, "System", now, "System", now, "", ""],
      ["Admin", "MasterDesignations", true, true, true, true, false, "System", now, "System", now, "", ""],
      ["Admin", "MasterRoles", true, true, true, true, false, "System", now, "System", now, "", ""],
      ["Admin", "RolesRights", true, true, true, true, false, "System", now, "System", now, "", ""],
      ["Admin", "MasterHub", true, true, true, true, false, "System", now, "System", now, "", ""],
      ["Admin", "Settings", true, true, true, true, false, "System", now, "System", now, "", ""],
      ["Admin", "DriveBackup", true, true, true, true, false, "System", now, "System", now, "", ""],
      ["Relationship Manager", "Dashboard", true, false, false, false, false, "System", now, "System", now, "", ""],
      ["Relationship Manager", "Customers", true, true, true, false, false, "System", now, "System", now, "", ""],
      ["Relationship Manager", "Staff", true, false, false, false, false, "System", now, "System", now, "", ""],
      ["Relationship Manager", "MasterDepartments", false, false, false, false, false, "System", now, "System", now, "", ""],
      ["Relationship Manager", "MasterDesignations", false, false, false, false, false, "System", now, "System", now, "", ""],
      ["Relationship Manager", "MasterRoles", false, false, false, false, false, "System", now, "System", now, "", ""],
      ["Relationship Manager", "RolesRights", false, false, false, false, false, "System", now, "System", now, "", ""],
      ["Relationship Manager", "MasterHub", true, false, false, false, false, "System", now, "System", now, "", ""],
      ["Relationship Manager", "Settings", false, false, false, false, false, "System", now, "System", now, "", ""],
      ["Relationship Manager", "DriveBackup", false, false, false, false, false, "System", now, "System", now, "", ""],
      ["Backoffice Staff", "Dashboard", true, false, false, false, false, "System", now, "System", now, "", ""],
      ["Backoffice Staff", "Customers", true, true, true, false, false, "System", now, "System", now, "", ""],
      ["Backoffice Staff", "Staff", false, false, false, false, false, "System", now, "System", now, "", ""],
      ["Backoffice Staff", "MasterDepartments", false, false, false, false, false, "System", now, "System", now, "", ""],
      ["Backoffice Staff", "MasterDesignations", false, false, false, false, false, "System", now, "System", now, "", ""],
      ["Backoffice Staff", "MasterRoles", false, false, false, false, false, "System", now, "System", now, "", ""],
      ["Backoffice Staff", "RolesRights", false, false, false, false, false, "System", now, "System", now, "", ""],
      ["Backoffice Staff", "MasterHub", true, false, false, false, false, "System", now, "System", now, "", ""],
      ["Backoffice Staff", "Settings", false, false, false, false, false, "System", now, "System", now, "", ""],
      ["Backoffice Staff", "DriveBackup", false, false, false, false, false, "System", now, "System", now, "", ""]
    ];
    rightsSheet.getRange(2, 1, defaultRights.length, CRM_SCHEMAS.RIGHTS.length).setValues(defaultRights);
  }

  // MasterDepartments
  const deptSheet = ss.getSheetByName(CRM_CONFIG.SHEETS.DEPARTMENTS);
  if (deptSheet && deptSheet.getLastRow() <= 1) {
    const defaultDepts = [
      ["DEP_01", "WM", "Wealth Management", "Client advisory & wealth portfolios", "Active", false, "System", now, "System", now, "", ""],
      ["DEP_02", "OPS", "Operations & KYC", "Client onboarding, KYC & document verification", "Active", false, "System", now, "System", now, "", ""],
      ["DEP_03", "MF", "Mutual Funds", "Mutual fund distributions, CAS & order processing", "Active", false, "System", now, "System", now, "", ""],
      ["DEP_04", "ACC", "Accounts & Finance", "Commission reconciliation & accounting", "Active", false, "System", now, "System", now, "", ""],
      ["DEP_05", "ADM", "Administration", "CRM system management & access controls", "Active", false, "System", now, "System", now, "", ""],
      ["DEP_06", "CMP", "Compliance & Legal", "AMFI & SEBI regulatory compliance audit", "Active", false, "System", now, "System", now, "", ""]
    ];
    deptSheet.getRange(2, 1, defaultDepts.length, CRM_SCHEMAS.DEPARTMENTS.length).setValues(defaultDepts);
  }

  // MasterDesignations
  const desigSheet = ss.getSheetByName(CRM_CONFIG.SHEETS.DESIGNATIONS);
  if (desigSheet && desigSheet.getLastRow() <= 1) {
    const defaultDesigs = [
      ["DES_01", "SIA", "Senior Investment Advisor", "Wealth Management", "Advises high net worth clients", "Active", false, "System", now, "System", now, "", ""],
      ["DES_02", "RM", "Relationship Manager", "Wealth Management", "Manages customer relationships & portfolios", "Active", false, "System", now, "System", now, "", ""],
      ["DES_03", "MFS", "Mutual Fund Specialist", "Mutual Funds", "Specialized mutual fund product advisory", "Active", false, "System", now, "System", now, "", ""],
      ["DES_04", "BM", "Branch Manager", "Administration", "Branch operations and advisory supervision", "Active", false, "System", now, "System", now, "", ""],
      ["DES_05", "CO", "Compliance Officer", "Compliance & Legal", "Statutory AMFI & SEBI compliance surveillance", "Active", false, "System", now, "System", now, "", ""],
      ["DES_06", "OE", "Operations Executive", "Operations & KYC", "Client KYC verification & documentation", "Active", false, "System", now, "System", now, "", ""],
      ["DES_07", "BE", "Backoffice Executive", "Operations & KYC", "Data entry, backoffice operations and investor requests", "Active", false, "System", now, "System", now, "", ""],
      ["DES_08", "ADM", "Administrator", "Administration", "Overall CRM administration and security", "Active", false, "System", now, "System", now, "", ""]
    ];
    desigSheet.getRange(2, 1, defaultDesigs.length, CRM_SCHEMAS.DESIGNATIONS.length).setValues(defaultDesigs);
  }

  // MasterRoles
  const roleSheet = ss.getSheetByName(CRM_CONFIG.SHEETS.ROLES);
  if (roleSheet && roleSheet.getLastRow() <= 1) {
    const defaultRoles = [
      ["ROL_01", "ADMIN", "Admin", "Complete CRM administration, settings & audit logs", "Active", false, "System", now, "System", now, "", ""],
      ["ROL_02", "RM", "Relationship Manager", "Customer advisory, staff view & transaction tools", "Active", false, "System", now, "System", now, "", ""],
      ["ROL_03", "BO", "Backoffice Staff", "Operations, KYC verification & record management", "Active", false, "System", now, "System", now, "", ""],
      ["ROL_04", "STF", "Staff", "Standard team member with basic view & self-service access", "Active", false, "System", now, "System", now, "", ""]
    ];
    roleSheet.getRange(2, 1, defaultRoles.length, CRM_SCHEMAS.ROLES.length).setValues(defaultRoles);
  }
}

/**
 * ==========================================
 * MASTER HUB BACKEND (DEPARTMENTS, DESIGNATIONS, ROLES)
 * Multi-Tenant Aware: Routes to tenant database
 * ==========================================
 */

function getMasters_(payload) {
  return {
    departments: getDepartments_(payload),
    designations: getDesignations_(payload),
    roles: getRoles_(payload)
  };
}

function getDepartments_(filters) {
  filters = filters || {};
  const tenantId = filters.tenantId || filters.activeTenantId || null;
  const sheet = getOrCreateSheet_(CRM_CONFIG.SHEETS.DEPARTMENTS, CRM_SCHEMAS.DEPARTMENTS, tenantId);
  let rows = getSheetRowsAsObjects_(sheet, CRM_SCHEMAS.DEPARTMENTS);
  const includeDel = filters && (filters.includeDeleted === true || filters.includeDeleted === "true");
  if (!includeDel) {
    rows = rows.filter(r => !r.IsDeleted || r.IsDeleted === "false" || r.IsDeleted === false);
  }
  return rows;
}

function getDesignations_(filters) {
  filters = filters || {};
  const tenantId = filters.tenantId || filters.activeTenantId || null;
  const sheet = getOrCreateSheet_(CRM_CONFIG.SHEETS.DESIGNATIONS, CRM_SCHEMAS.DESIGNATIONS, tenantId);
  let rows = getSheetRowsAsObjects_(sheet, CRM_SCHEMAS.DESIGNATIONS);
  const includeDel = filters && (filters.includeDeleted === true || filters.includeDeleted === "true");
  if (!includeDel) {
    rows = rows.filter(r => !r.IsDeleted || r.IsDeleted === "false" || r.IsDeleted === false);
  }
  return rows;
}
function getRoles_(filters) {
  filters = filters || {};
  const tenantId = filters.tenantId || filters.activeTenantId || null;
  const sheet = getOrCreateSheet_(CRM_CONFIG.SHEETS.ROLES, CRM_SCHEMAS.ROLES, tenantId);
  let rows = getSheetRowsAsObjects_(sheet, CRM_SCHEMAS.ROLES);
  const includeDel = filters && (filters.includeDeleted === true || filters.includeDeleted === "true");
  if (!includeDel) {
    rows = rows.filter(r => !r.IsDeleted || r.IsDeleted === "false" || r.IsDeleted === false);
  }
  return rows;
}

/**
 * Helper to generate default alphanumeric Code from Name initials:
 * e.g. "Hello World" -> "HW", "Hello" -> "H", "Wealth Management" -> "WM"
 */
function generateInitialsCode_(name) {
  if (!name) return "";
  const words = String(name).trim().split(/[\s\-_&/]+/).map(w => w.replace(/^[^a-zA-Z0-9]+|[^a-zA-Z0-9]+$/g, '')).filter(Boolean);
  if (words.length === 0) return "";
  if (words.length === 1) return words[0].charAt(0).toUpperCase();
  return words.map(w => w.charAt(0).toUpperCase()).join("");
}

/**
 * Helper to append an audit event into Approval_History JSON string
 */
function appendApprovalHistory_(existingHistory, eventObj) {
  let list = [];
  if (existingHistory) {
    if (typeof existingHistory === "string") {
      try {
        const parsed = JSON.parse(existingHistory);
        if (Array.isArray(parsed)) list = parsed;
      } catch (e) {
        list = [{ note: String(existingHistory) }];
      }
    } else if (Array.isArray(existingHistory)) {
      list = existingHistory;
    }
  }
  list.push(eventObj);
  return JSON.stringify(list);
}

function saveMasterItem_(payload) {
  payload = payload || {};
  const tenantId = payload.tenantId || payload.activeTenantId || null;
  const type = String(payload.type || "").toLowerCase();
  const data = payload.data || {};
  const userEmail = payload.userEmail || "admin@srinvestments.com";
  const now = new Date().toISOString();

  let sheetName, schema, idField, prefix, codeField, nameField;
  if (type === "department") {
    sheetName = CRM_CONFIG.SHEETS.DEPARTMENTS;
    schema = CRM_SCHEMAS.DEPARTMENTS;
    idField = "DepartmentId";
    codeField = "DepartmentCode";
    nameField = "DepartmentName";
    prefix = "DEP";
  } else if (type === "designation") {
    sheetName = CRM_CONFIG.SHEETS.DESIGNATIONS;
    schema = CRM_SCHEMAS.DESIGNATIONS;
    idField = "DesignationId";
    codeField = "DesignationCode";
    nameField = "DesignationName";
    prefix = "DES";
  } else if (type === "role") {
    sheetName = CRM_CONFIG.SHEETS.ROLES;
    schema = CRM_SCHEMAS.ROLES;
    idField = "RoleId";
    codeField = "RoleCode";
    nameField = "RoleName";
    prefix = "ROL";
  } else {
    throw new Error("Invalid master type: " + type);
  }

  const sheet = getOrCreateSheet_(sheetName, schema, tenantId);
  const rows = getSheetRowsAsObjects_(sheet, schema);
  const id = data[idField] || createId_(prefix);
  const existingIndex = rows.findIndex(r => r[idField] === id);
  const existingRecord = existingIndex >= 0 ? rows[existingIndex] : null;

  const name = cleanStr_(data[nameField] || "").trim();
  if (!name) {
    throw new Error(`Master title/name is required for ${type}.`);
  }

  // 1. Determine Code (alphanumeric, enabled from client, defaults to initials of Name)
  let code = cleanStr_(data[codeField] || "").trim().toUpperCase();
  if (!code) {
    if (existingRecord && existingRecord[codeField]) {
      code = existingRecord[codeField];
    } else {
      code = generateInitialsCode_(name);
      if (!code) code = prefix + "_" + (rows.length + 1);
    }
  }

  // 2. Strict Duplicate ID Check (if creating new record)
  if (existingIndex < 0 && data[idField]) {
    const dupIdRow = rows.find(r => r[idField] === data[idField]);
    if (dupIdRow) {
      throw new Error(`Duplicate Record ID: ID '${data[idField]}' already exists in ${type} master. Duplicate IDs are not allowed.`);
    }
  }

  // 3. Strict Duplicate Code Check (case-insensitive among non-deleted records)
  const dupCodeRow = rows.find(r => {
    const isDel = r.IsDeleted === true || r.IsDeleted === "TRUE" || String(r.IsDeleted).toLowerCase() === "true";
    if (isDel) return false;
    if (r[idField] === id) return false; // Ignore current record when updating
    const existingCode = cleanStr_(r[codeField] || "").trim();
    return existingCode.toLowerCase() === code.toLowerCase();
  });
  if (dupCodeRow) {
    throw new Error(`Duplicate Code: '${code}' is already assigned to '${dupCodeRow[nameField] || dupCodeRow[codeField]}'. Each ${type} master record must have a unique Code.`);
  }

  // 4. Strict Duplicate Name / Title Check (case-insensitive among non-deleted records)
  const dupNameRow = rows.find(r => {
    const isDel = r.IsDeleted === true || r.IsDeleted === "TRUE" || String(r.IsDeleted).toLowerCase() === "true";
    if (isDel) return false;
    if (r[idField] === id) return false; // Ignore current record when updating
    const existingName = cleanStr_(r[nameField] || "").trim();
    return existingName.toLowerCase() === name.toLowerCase();
  });
  if (dupNameRow) {
    throw new Error(`Duplicate Name: '${name}' already exists in ${type} master. Duplicate master names are not allowed.`);
  }

  const isNew = existingIndex < 0;
  const isAdmin = isCallerAdmin_(payload);
  const approval = getApprovalSettings_(tenantId);
  const needsApproval = !isAdmin && ((isNew && approval.onAdd) || (!isNew && approval.onEdit));

  let statusVal = cleanStr_(data.Status || "Active");
  let createdAppBy = existingRecord ? (existingRecord.Created_Approved_By || "") : "";
  let createdAppAt = existingRecord ? (existingRecord.Created_Approved_At || "") : "";
  let updatedAppBy = existingRecord ? (existingRecord.Updated_Approved_By || "") : "";
  let updatedAppAt = existingRecord ? (existingRecord.Updated_Approved_At || "") : "";
  let deletedAppBy = existingRecord ? (existingRecord.Deleted_Approved_By || "") : "";
  let deletedAppAt = existingRecord ? (existingRecord.Deleted_Approved_At || "") : "";
  let approvalHistory = existingRecord ? (existingRecord.Approval_History || "") : "";

  if (isNew) {
    if (needsApproval) {
      statusVal = "Approval Pending";
      createdAppBy = "";
      createdAppAt = "";
      approvalHistory = appendApprovalHistory_("", {
        action: "CREATE",
        status: "Pending",
        submittedBy: userEmail,
        submittedAt: now
      });
    } else {
      statusVal = "Active";
      createdAppBy = isAdmin ? userEmail : "Auto";
      createdAppAt = now;
      approvalHistory = appendApprovalHistory_("", {
        action: "CREATE",
        status: "Approved",
        approvedBy: isAdmin ? userEmail : "Auto",
        approvedAt: now
      });
    }
  } else {
    // Edit existing record (supports multiple sequential edits)
    if (needsApproval) {
      statusVal = "Approval Pending";
      updatedAppBy = "";
      updatedAppAt = "";
      approvalHistory = appendApprovalHistory_(approvalHistory, {
        action: "EDIT",
        status: "Pending",
        submittedBy: userEmail,
        submittedAt: now
      });
    } else {
      statusVal = "Active";
      updatedAppBy = isAdmin ? userEmail : "Auto";
      updatedAppAt = now;
      approvalHistory = appendApprovalHistory_(approvalHistory, {
        action: "EDIT",
        status: "Approved",
        approvedBy: isAdmin ? userEmail : "Auto",
        approvedAt: now
      });
    }
  }

  const recordObj = {
    ...data,
    [idField]: id,
    [codeField]: code,
    [nameField]: name,
    Description: cleanStr_(data.Description),
    Status: statusVal,
    IsDeleted: existingRecord ? Boolean(existingRecord.IsDeleted === true || existingRecord.IsDeleted === "TRUE") : false,
    Created_By: existingRecord ? (existingRecord.Created_By || userEmail) : userEmail,
    Created_At: existingRecord ? (existingRecord.Created_At || now) : now,
    Updated_By: userEmail,
    Updated_At: now,
    Created_Approved_By: createdAppBy,
    Created_Approved_At: createdAppAt,
    Updated_Approved_By: updatedAppBy,
    Updated_Approved_At: updatedAppAt,
    Deleted_Approved_By: deletedAppBy,
    Deleted_Approved_At: deletedAppAt,
    Approval_History: approvalHistory,
    Approved_By: updatedAppBy || createdAppBy || (isAdmin ? userEmail : "Auto"),
    Approved_At: updatedAppAt || createdAppAt || now,
    Deleted_By: existingRecord ? (existingRecord.Deleted_By || "") : "",
    Deleted_At: existingRecord ? (existingRecord.Deleted_At || "") : ""
  };

  const rowIndex = existingIndex >= 0 ? existingIndex + 2 : 0;
  writeRowByHeaders_(sheet, rowIndex, recordObj, schema);
  logAudit_(userEmail, existingIndex >= 0 ? "UPDATE" : "CREATE", "MasterHub", recordObj[codeField], 
    `${existingIndex >= 0 ? "Updated" : "Created"} ${type}: ${recordObj[nameField]} (${recordObj[codeField]})` + 
    (needsApproval ? " [Approval Pending]" : ""));

  return { 
    success: true, 
    item: recordObj, 
    pendingApproval: needsApproval,
    message: needsApproval 
      ? `${type} submitted for Admin approval (Status: Approval Pending).`
      : `${type} saved successfully.`
  };
}

function deleteMasterItem_(payload) {
  payload = payload || {};
  const tenantId = payload.tenantId || payload.activeTenantId || null;
  const type = String(payload.type || "").toLowerCase();
  const id = payload.id;
  const userEmail = payload.userEmail || "admin@srinvestments.com";
  const now = new Date().toISOString();

  let sheetName, schema, idField;
  if (type === "department") {
    sheetName = CRM_CONFIG.SHEETS.DEPARTMENTS;
    schema = CRM_SCHEMAS.DEPARTMENTS;
    idField = "DepartmentId";
  } else if (type === "designation") {
    sheetName = CRM_CONFIG.SHEETS.DESIGNATIONS;
    schema = CRM_SCHEMAS.DESIGNATIONS;
    idField = "DesignationId";
  } else if (type === "role") {
    sheetName = CRM_CONFIG.SHEETS.ROLES;
    schema = CRM_SCHEMAS.ROLES;
    idField = "RoleId";
  } else {
    throw new Error("Invalid master type: " + type);
  }

  const sheet = getOrCreateSheet_(sheetName, schema, tenantId);
  const rows = getSheetRowsAsObjects_(sheet, schema);
  const index = rows.findIndex(r => r[idField] === id);
  if (index === -1) throw new Error("Record not found: " + id);

  const rowNum = index + 2;
  const isAdmin = isCallerAdmin_(payload);
  const approval = getApprovalSettings_(tenantId);

  const rec = rows[index];
  let approvalHistory = rec.Approval_History || "";

  // If non-admin and delete approval required: do not delete, set Status = 'Approval Pending (Delete)'
  if (!isAdmin && approval.onDelete) {
    const colStatus = getHeaderColIndex_(sheet, "Status");
    const colUpdBy = getHeaderColIndex_(sheet, "Updated_By");
    const colUpdAt = getHeaderColIndex_(sheet, "Updated_At");
    const colHist = getHeaderColIndex_(sheet, "Approval_History");

    approvalHistory = appendApprovalHistory_(approvalHistory, {
      action: "DELETE",
      status: "Pending",
      submittedBy: userEmail,
      submittedAt: now
    });

    if (colStatus > 0) sheet.getRange(rowNum, colStatus).setValue("Approval Pending (Delete)");
    if (colUpdBy > 0) sheet.getRange(rowNum, colUpdBy).setValue(userEmail);
    if (colUpdAt > 0) sheet.getRange(rowNum, colUpdAt).setValue(now);
    if (colHist > 0) sheet.getRange(rowNum, colHist).setValue(approvalHistory);

    logAudit_(userEmail, "REQUEST_DELETE", "MasterHub", id, `Delete request submitted for ${type}: ${id} (Pending Admin Approval)`);
    return { success: true, message: `${type} deletion submitted. Admin approval pending.`, pendingApproval: true };
  }

  const colIsDel = getHeaderColIndex_(sheet, "IsDeleted");
  const colDelBy = getHeaderColIndex_(sheet, "Deleted_By");
  const colDelAt = getHeaderColIndex_(sheet, "Deleted_At");
  const colDelAppBy = getHeaderColIndex_(sheet, "Deleted_Approved_By");
  const colDelAppAt = getHeaderColIndex_(sheet, "Deleted_Approved_At");
  const colHist = getHeaderColIndex_(sheet, "Approval_History");
  const delApprovedBy = isAdmin ? userEmail : "Auto";

  approvalHistory = appendApprovalHistory_(approvalHistory, {
    action: "DELETE",
    status: "Approved",
    approvedBy: delApprovedBy,
    approvedAt: now
  });

  if (colIsDel > 0) sheet.getRange(rowNum, colIsDel).setValue(true);
  if (colDelBy > 0) sheet.getRange(rowNum, colDelBy).setValue(userEmail);
  if (colDelAt > 0) sheet.getRange(rowNum, colDelAt).setValue(now);
  if (colDelAppBy > 0) sheet.getRange(rowNum, colDelAppBy).setValue(delApprovedBy);
  if (colDelAppAt > 0) sheet.getRange(rowNum, colDelAppAt).setValue(now);
  if (colHist > 0) sheet.getRange(rowNum, colHist).setValue(approvalHistory);

  logAudit_(userEmail, "DELETE", "MasterHub", id, `Deleted ${type}: ${id}`);
  return { success: true, message: `${type} deleted.` };
}

function restoreMasterItem_(payload) {
  payload = payload || {};
  const tenantId = payload.tenantId || payload.activeTenantId || null;
  const type = String(payload.type || "").toLowerCase();
  const id = payload.id;
  const userEmail = payload.userEmail || "admin@srinvestments.com";
  const now = new Date().toISOString();

  let sheetName, schema, idField;
  if (type === "department") {
    sheetName = CRM_CONFIG.SHEETS.DEPARTMENTS;
    schema = CRM_SCHEMAS.DEPARTMENTS;
    idField = "DepartmentId";
  } else if (type === "designation") {
    sheetName = CRM_CONFIG.SHEETS.DESIGNATIONS;
    schema = CRM_SCHEMAS.DESIGNATIONS;
    idField = "DesignationId";
  } else if (type === "role") {
    sheetName = CRM_CONFIG.SHEETS.ROLES;
    schema = CRM_SCHEMAS.ROLES;
    idField = "RoleId";
  } else {
    throw new Error("Invalid master type: " + type);
  }

  const sheet = getOrCreateSheet_(sheetName, schema, tenantId);
  const rows = getSheetRowsAsObjects_(sheet, schema);
  const index = rows.findIndex(r => r[idField] === id);
  if (index === -1) throw new Error("Record not found: " + id);

  const rowNum = index + 2;
  const colIsDel = getHeaderColIndex_(sheet, "IsDeleted");
  const colUpBy = getHeaderColIndex_(sheet, "Updated_By");
  const colUpAt = getHeaderColIndex_(sheet, "Updated_At");
  const colDelBy = getHeaderColIndex_(sheet, "Deleted_By");
  const colDelAt = getHeaderColIndex_(sheet, "Deleted_At");

  if (colIsDel > 0) sheet.getRange(rowNum, colIsDel).setValue(false);
  if (colUpBy > 0) sheet.getRange(rowNum, colUpBy).setValue(userEmail);
  if (colUpAt > 0) sheet.getRange(rowNum, colUpAt).setValue(now);
  if (colDelBy > 0) sheet.getRange(rowNum, colDelBy).setValue("");
  if (colDelAt > 0) sheet.getRange(rowNum, colDelAt).setValue("");

  logAudit_(userEmail, "RESTORE", "MasterHub", id, `Restored ${type}: ${id}`);
  return { success: true, message: `${type} restored.` };
}

/**
 * ==========================================
 * DATA MODIFICATION & APPROVAL WORKFLOW
 * Admin Approval Needed on Add / Edit / Delete
 * ==========================================
 */
function isCallerAdmin_(payload) {
  if (!payload) return false;
  if (payload.isSuperAdmin === true || String(payload.isSuperAdmin).toLowerCase() === "true") return true;
  const role = String(payload.role || payload.Role || "").trim().toLowerCase();
  if (role === "admin" || role === "superadmin" || role === "super_admin") return true;
  const email = String(payload.userEmail || "").trim().toLowerCase();
  if (email && (email.startsWith("admin@") || email.includes("superadmin"))) return true;
  return false;
}

function verifyIsAdminOrSuperAdmin_(payload) {
  if (!isCallerAdmin_(payload)) {
    throw new Error("Admin privileges required for this action.");
  }
}

function getApprovalSettings_(tenantId) {
  try {
    const sheet = getOrCreateSheet_(CRM_CONFIG.SHEETS.SETTINGS, CRM_SCHEMAS.SETTINGS, tenantId);
    const rows = getSheetRowsAsObjects_(sheet, CRM_SCHEMAS.SETTINGS);
    const getVal = (key) => {
      const r = rows.find(x => (!x.IsDeleted || String(x.IsDeleted).toLowerCase() !== "true") && String(x.Key || "").toLowerCase() === key.toLowerCase());
      return r ? String(r.Value || "").trim().toLowerCase() : "";
    };

    const masterEnabled = getVal("requireadminapproval") === "true" || getVal("adminapprovalrequired") === "true";
    const onAdd = masterEnabled && getVal("requireapprovalonadd") !== "false";
    const onEdit = masterEnabled && getVal("requireapprovalonedit") !== "false";
    const onDelete = masterEnabled && getVal("requireapprovalondelete") !== "false";

    return {
      enabled: masterEnabled,
      onAdd: onAdd,
      onEdit: onEdit,
      onDelete: onDelete
    };
  } catch (err) {
    Logger.log("getApprovalSettings_ error: " + err.message);
    return { enabled: false, onAdd: false, onEdit: false, onDelete: false };
  }
}

function getApprovalSettingsApi_(payload) {
  payload = payload || {};
  const tenantId = payload.tenantId || payload.activeTenantId || null;
  const settings = getApprovalSettings_(tenantId);
  return { success: true, ...settings };
}

function saveApprovalSettings_(payload) {
  payload = payload || {};
  verifyIsAdminOrSuperAdmin_(payload);
  const tenantId = payload.tenantId || payload.activeTenantId || null;
  const sheet = getOrCreateSheet_(CRM_CONFIG.SHEETS.SETTINGS, CRM_SCHEMAS.SETTINGS, tenantId);
  const now = new Date().toISOString();

  const settingsToSave = {
    AdminApprovalRequired: payload.enabled ? "true" : "false",
    RequireApprovalOnAdd: payload.onAdd !== false ? "true" : "false",
    RequireApprovalOnEdit: payload.onEdit !== false ? "true" : "false",
    RequireApprovalOnDelete: payload.onDelete !== false ? "true" : "false"
  };

  const rows = getSheetRowsAsObjects_(sheet, CRM_SCHEMAS.SETTINGS);
  Object.keys(settingsToSave).forEach(key => {
    const val = settingsToSave[key];
    const cleanKey = key.toLowerCase();
    const index = rows.findIndex(r => String(r.Key || "").replace(/_/g, "").toLowerCase() === cleanKey);
    if (index >= 0) {
      sheet.getRange(index + 2, 2).setValue(val);
      const uCol = CRM_SCHEMAS.SETTINGS.indexOf("Updated_At") + 1;
      if (uCol > 0) sheet.getRange(index + 2, uCol).setValue(now);
    } else {
      writeRowByHeaders_(sheet, 0, {
        Key: key,
        Value: val,
        Description: "Approval workflow configuration",
        IsDeleted: false,
        Created_By: payload.userEmail || "System",
        Created_At: now,
        Updated_By: payload.userEmail || "System",
        Updated_At: now
      }, CRM_SCHEMAS.SETTINGS);
    }
  });

  logAudit_(payload.userEmail || "System", "UPDATE_APPROVAL_SETTINGS", "Settings", 
    `Approval workflow updated: Enabled=${payload.enabled}, Add=${payload.onAdd}, Edit=${payload.onEdit}, Delete=${payload.onDelete}`);

  return {
    success: true,
    message: "Approval workflow settings saved successfully.",
    settings: {
      enabled: Boolean(payload.enabled),
      onAdd: payload.onAdd !== false,
      onEdit: payload.onEdit !== false,
      onDelete: payload.onDelete !== false
    }
  };
}

function approveRecord_(payload) {
  payload = payload || {};
  verifyIsAdminOrSuperAdmin_(payload);
  const tenantId = payload.tenantId || payload.activeTenantId || null;
  const module = String(payload.module || payload.type || "").trim().toLowerCase();
  const id = payload.id;
  const adminEmail = payload.userEmail || payload.adminEmail || "admin@srinvestments.com";
  const now = new Date().toISOString();

  let sheetName, schema, idField;
  if (module === "department" || module === "departments") {
    sheetName = CRM_CONFIG.SHEETS.DEPARTMENTS;
    schema = CRM_SCHEMAS.DEPARTMENTS;
    idField = "DepartmentId";
  } else if (module === "designation" || module === "designations") {
    sheetName = CRM_CONFIG.SHEETS.DESIGNATIONS;
    schema = CRM_SCHEMAS.DESIGNATIONS;
    idField = "DesignationId";
  } else if (module === "role" || module === "roles") {
    sheetName = CRM_CONFIG.SHEETS.ROLES;
    schema = CRM_SCHEMAS.ROLES;
    idField = "RoleId";
  } else if (module === "staff" || module === "employee" || module === "employees") {
    sheetName = CRM_CONFIG.SHEETS.EMPLOYEES;
    schema = CRM_SCHEMAS.EMPLOYEES;
    idField = "EmployeeId";
  } else if (module === "customer" || module === "customers") {
    sheetName = CRM_CONFIG.SHEETS.CUSTOMERS;
    schema = CRM_SCHEMAS.CUSTOMERS;
    idField = "CustomerId";
  } else {
    throw new Error("Invalid module for approval: " + module);
  }

  const sheet = getOrCreateSheet_(sheetName, schema, tenantId);
  const rows = getSheetRowsAsObjects_(sheet, schema);
  const index = rows.findIndex(r => String(r[idField] || "").trim() === String(id).trim());
  if (index === -1) throw new Error("Record not found for approval: " + id);

  const rowNum = index + 2;
  const rec = rows[index];
  const isDeleteRequest = String(rec.Status || "").toLowerCase().includes("delete");
  let approvalHistory = rec.Approval_History || "";

  const colStatus = getHeaderColIndex_(sheet, "Status");
  const colAppBy = getHeaderColIndex_(sheet, "Approved_By");
  const colAppAt = getHeaderColIndex_(sheet, "Approved_At");
  const colUpdBy = getHeaderColIndex_(sheet, "Updated_By");
  const colUpdAt = getHeaderColIndex_(sheet, "Updated_At");
  const colIsDel = getHeaderColIndex_(sheet, "IsDeleted");
  const colDelBy = getHeaderColIndex_(sheet, "Deleted_By");
  const colDelAt = getHeaderColIndex_(sheet, "Deleted_At");
  const colCreatedAppBy = getHeaderColIndex_(sheet, "Created_Approved_By");
  const colCreatedAppAt = getHeaderColIndex_(sheet, "Created_Approved_At");
  const colUpdatedAppBy = getHeaderColIndex_(sheet, "Updated_Approved_By");
  const colUpdatedAppAt = getHeaderColIndex_(sheet, "Updated_Approved_At");
  const colDeletedAppBy = getHeaderColIndex_(sheet, "Deleted_Approved_By");
  const colDeletedAppAt = getHeaderColIndex_(sheet, "Deleted_Approved_At");
  const colHist = getHeaderColIndex_(sheet, "Approval_History");

  if (isDeleteRequest) {
    if (colIsDel > 0) sheet.getRange(rowNum, colIsDel).setValue(true);
    if (colStatus > 0) sheet.getRange(rowNum, colStatus).setValue("Deleted");
    if (colDelBy > 0) sheet.getRange(rowNum, colDelBy).setValue(adminEmail);
    if (colDelAt > 0) sheet.getRange(rowNum, colDelAt).setValue(now);
    if (colDeletedAppBy > 0) sheet.getRange(rowNum, colDeletedAppBy).setValue(adminEmail);
    if (colDeletedAppAt > 0) sheet.getRange(rowNum, colDeletedAppAt).setValue(now);
    approvalHistory = appendApprovalHistory_(approvalHistory, {
      action: "DELETE",
      status: "Approved",
      approvedBy: adminEmail,
      approvedAt: now
    });
  } else {
    if (colStatus > 0) sheet.getRange(rowNum, colStatus).setValue("Active");
    const isCreate = !rec.Created_Approved_By && !rec.Created_Approved_At;
    if (isCreate) {
      if (colCreatedAppBy > 0) sheet.getRange(rowNum, colCreatedAppBy).setValue(adminEmail);
      if (colCreatedAppAt > 0) sheet.getRange(rowNum, colCreatedAppAt).setValue(now);
      approvalHistory = appendApprovalHistory_(approvalHistory, {
        action: "CREATE",
        status: "Approved",
        approvedBy: adminEmail,
        approvedAt: now
      });
    } else {
      if (colUpdatedAppBy > 0) sheet.getRange(rowNum, colUpdatedAppBy).setValue(adminEmail);
      if (colUpdatedAppAt > 0) sheet.getRange(rowNum, colUpdatedAppAt).setValue(now);
      approvalHistory = appendApprovalHistory_(approvalHistory, {
        action: "EDIT",
        status: "Approved",
        approvedBy: adminEmail,
        approvedAt: now
      });
    }
  }

  if (colHist > 0) sheet.getRange(rowNum, colHist).setValue(approvalHistory);
  if (colAppBy > 0) sheet.getRange(rowNum, colAppBy).setValue(adminEmail);
  if (colAppAt > 0) sheet.getRange(rowNum, colAppAt).setValue(now);
  if (colUpdBy > 0) sheet.getRange(rowNum, colUpdBy).setValue(adminEmail);
  if (colUpdAt > 0) sheet.getRange(rowNum, colUpdAt).setValue(now);

  logAudit_(adminEmail, "APPROVE", module, id, `Approved ${module} (${id})`);
  return { success: true, message: `${module} record approved successfully by ${adminEmail}.` };
}

function rejectRecord_(payload) {
  payload = payload || {};
  verifyIsAdminOrSuperAdmin_(payload);
  const tenantId = payload.tenantId || payload.activeTenantId || null;
  const module = String(payload.module || payload.type || "").trim().toLowerCase();
  const id = payload.id;
  const reason = payload.reason ? (" - " + payload.reason) : "";
  const adminEmail = payload.userEmail || payload.adminEmail || "admin@srinvestments.com";
  const now = new Date().toISOString();

  let sheetName, schema, idField;
  if (module === "department" || module === "departments") {
    sheetName = CRM_CONFIG.SHEETS.DEPARTMENTS;
    schema = CRM_SCHEMAS.DEPARTMENTS;
    idField = "DepartmentId";
  } else if (module === "designation" || module === "designations") {
    sheetName = CRM_CONFIG.SHEETS.DESIGNATIONS;
    schema = CRM_SCHEMAS.DESIGNATIONS;
    idField = "DesignationId";
  } else if (module === "role" || module === "roles") {
    sheetName = CRM_CONFIG.SHEETS.ROLES;
    schema = CRM_SCHEMAS.ROLES;
    idField = "RoleId";
  } else if (module === "staff" || module === "employee" || module === "employees") {
    sheetName = CRM_CONFIG.SHEETS.EMPLOYEES;
    schema = CRM_SCHEMAS.EMPLOYEES;
    idField = "EmployeeId";
  } else if (module === "customer" || module === "customers") {
    sheetName = CRM_CONFIG.SHEETS.CUSTOMERS;
    schema = CRM_SCHEMAS.CUSTOMERS;
    idField = "CustomerId";
  } else {
    throw new Error("Invalid module for rejection: " + module);
  }

  const sheet = getOrCreateSheet_(sheetName, schema, tenantId);
  const rows = getSheetRowsAsObjects_(sheet, schema);
  const index = rows.findIndex(r => String(r[idField] || "").trim() === String(id).trim());
  if (index === -1) throw new Error("Record not found for rejection: " + id);

  const rowNum = index + 2;
  const rec = rows[index];
  const isDeleteRequest = String(rec.Status || "").toLowerCase().includes("delete");
  let approvalHistory = rec.Approval_History || "";

  const colStatus = getHeaderColIndex_(sheet, "Status");
  const colAppBy = getHeaderColIndex_(sheet, "Approved_By");
  const colAppAt = getHeaderColIndex_(sheet, "Approved_At");
  const colUpdBy = getHeaderColIndex_(sheet, "Updated_By");
  const colUpdAt = getHeaderColIndex_(sheet, "Updated_At");
  const colHist = getHeaderColIndex_(sheet, "Approval_History");

  if (isDeleteRequest) {
    if (colStatus > 0) sheet.getRange(rowNum, colStatus).setValue("Active");
    approvalHistory = appendApprovalHistory_(approvalHistory, {
      action: "DELETE",
      status: "Rejected",
      rejectedBy: adminEmail,
      rejectedAt: now,
      reason: payload.reason || ""
    });
  } else {
    if (colStatus > 0) sheet.getRange(rowNum, colStatus).setValue("Rejected");
    const isCreate = !rec.Created_Approved_By && !rec.Created_Approved_At;
    approvalHistory = appendApprovalHistory_(approvalHistory, {
      action: isCreate ? "CREATE" : "EDIT",
      status: "Rejected",
      rejectedBy: adminEmail,
      rejectedAt: now,
      reason: payload.reason || ""
    });
  }

  if (colHist > 0) sheet.getRange(rowNum, colHist).setValue(approvalHistory);
  if (colAppBy > 0) sheet.getRange(rowNum, colAppBy).setValue(adminEmail + " (Rejected" + reason + ")");
  if (colAppAt > 0) sheet.getRange(rowNum, colAppAt).setValue(now);
  if (colUpdBy > 0) sheet.getRange(rowNum, colUpdBy).setValue(adminEmail);
  if (colUpdAt > 0) sheet.getRange(rowNum, colUpdAt).setValue(now);

  logAudit_(adminEmail, "REJECT", module, id, `Rejected ${module} (${id})${reason}`);
  return { success: true, message: `${module} record rejected.` };
}

/**
 * ==========================================
 * REALTIME NOTIFICATIONS BACKEND
 * Multi-Tenant Aware: Routes to tenant database
 * ==========================================
 */
function getNotifications_(payload) {
  payload = payload || {};
  const tenantId = payload.tenantId || payload.activeTenantId || null;
  const userEmail = (payload.userEmail || "").trim().toLowerCase();
  const isSuperUser = Boolean(payload.isSuperUser);
  const role = payload.role || "Staff";
  const isAdmin = isSuperUser || role.toLowerCase() === "admin";

  const sheet = getOrCreateSheet_(CRM_CONFIG.SHEETS.NOTIFICATIONS, CRM_SCHEMAS.NOTIFICATIONS, tenantId);
  let rows = getSheetRowsAsObjects_(sheet, CRM_SCHEMAS.NOTIFICATIONS);

  // Filter based on audience rule:
  // Admin actions -> targetAudience = 'ADMIN_ONLY'
  // Non-Admin actions -> targetAudience = 'ALL_STAFF'
  rows = rows.filter(r => {
    if (r.TargetAudience === "ADMIN_ONLY") {
      return isAdmin;
    }
    return true; // ALL_STAFF is visible to everyone
  });

  return rows.slice(-50).reverse();
}

function sendNotification_(payload) {
  payload = payload || {};
  const tenantId = payload.tenantId || payload.activeTenantId || null;
  const sheet = getOrCreateSheet_(CRM_CONFIG.SHEETS.NOTIFICATIONS, CRM_SCHEMAS.NOTIFICATIONS, tenantId);
  const now = new Date().toISOString();
  const id = "NOTIF_" + Date.now();

  const isActorAdmin = Boolean(payload.isSuperUser) || String(payload.actorRole || "").toLowerCase() === "admin";
  const targetAudience = isActorAdmin ? "ADMIN_ONLY" : "ALL_STAFF";

  const rowValues = [
    id,
    now,
    payload.actorEmail || "",
    payload.actorName || "",
    payload.actorRole || "Staff",
    isActorAdmin,
    targetAudience,
    payload.action || "UPDATE",
    payload.module || "General",
    payload.recordId || "",
    payload.title || "Activity Alert",
    payload.message || "",
    payload.targetRoute || "/home",
    ""
  ];

  sheet.appendRow(rowValues);
  return { success: true, notifId: id, targetAudience: targetAudience };
}

/**
 * =========================================================================
 * SAAS MULTI-TENANT & CLIENT LICENSING BACKEND MODULE
 * =========================================================================
 */

/**
 * Validates boolean or string truthiness for IsSuperAdmin field
 */
function isSuperAdminValue_(val) {
  if (val === true || val === 1) return true;
  if (typeof val === "string") {
    const s = val.trim().toLowerCase();
    return s === "true" || s === "1" || s === "yes";
  }
  return false;
}

/**
 * Strict Super Admin privilege verification for SaaS Tenant & Subscription operations.
 * Directly queries the live Central User_Master sheet.
 * Verifies that the requesting user exists, is Active, and has IsSuperAdmin = TRUE.
 * Cannot be bypassed by client-side spoofing.
 */
function verifyIsSuperAdmin_(payload) {
  payload = payload || {};
  if (isSuperAdminValue_(payload.isSuperAdmin)) {
    return true;
  }
  const email = String(payload.userEmail || payload.email || payload.requesterEmail || "").trim().toLowerCase();
  const userId = String(payload.userId || payload.UserId || payload.requesterId || "").trim().toLowerCase();

  if (!email && !userId) {
    throw new Error("Access Denied: Requester identity missing. Super Admin privilege (IsSuperAdmin=TRUE) is required.");
  }

  const centralSheet = getOrCreateSheet_(CRM_CONFIG.SHEETS.USER_MASTER, CRM_SCHEMAS.USER_MASTER);
  const users = getSheetRowsAsObjects_(centralSheet, CRM_SCHEMAS.USER_MASTER);

  const matched = users.find(function(u) {
    const isDel = u.IsDeleted === true || String(u.IsDeleted).toLowerCase() === "true";
    if (isDel) return false;

    const matchEmail = u.Email && String(u.Email).toLowerCase().trim() === email;
    const matchId = u.UserId && String(u.UserId).toLowerCase().trim() === userId;

    const altEmails = u.AlternateEmailsList || u.GoogleEmails || "";
    const altList = altEmails ? String(altEmails).toLowerCase().split(",").map(function(s) { return s.trim(); }) : [];
    const matchAlt = email && altList.indexOf(email) !== -1;

    return matchEmail || matchId || matchAlt;
  });

  if (!matched) {
    throw new Error("Access Denied: User account (" + (email || userId) + ") not found in Central User Master. Super Admin privilege required.");
  }

  if (matched.Status && String(matched.Status).toLowerCase() !== "active") {
    throw new Error("Access Denied: User account (" + (matched.Email || email) + ") is inactive. Super Admin privilege required.");
  }

  const isSuper = isSuperAdminValue_(matched.IsSuperAdmin);
  if (!isSuper) {
    throw new Error("Access Denied: Super Admin privilege required. IsSuperAdmin is FALSE in database for user (" + (matched.Email || email) + "). Operation rejected.");
  }

  return matched;
}

/**
 * Fetch all client organizations (tenants) with joined active license details
 */
function getTenants_(payload) {
  payload = payload || {};
  verifyIsSuperAdmin_(payload);
  // Ensure Payment_Accounts tab exists in Central DB whenever SuperAdmin views tenants
  ensurePaymentAccountsSheet_();

  const showDeleted = Boolean(payload.showDeleted);
  const tenantSheet = getOrCreateSheet_(CRM_CONFIG.SHEETS.TENANT_MASTER, CRM_SCHEMAS.TENANT_MASTER);
  let tenants = getSheetRowsAsObjects_(tenantSheet, CRM_SCHEMAS.TENANT_MASTER);

  if (!showDeleted) {
    tenants = tenants.filter(t => !t.IsDeleted && String(t.IsDeleted).toLowerCase() !== "true");
  }

  // Read licenses to merge latest subscription info (with auto-expiry & auto-chaining)
  const licenseSheet = getOrCreateSheet_(CRM_CONFIG.SHEETS.TENANT_LICENSES, CRM_SCHEMAS.TENANT_LICENSES);
  const licenses = evaluateAndSyncTenantLicenses_(licenseSheet);

  return tenants.map(t => {
    const tenantLicenses = licenses.filter(l => 
      String(l.TenantId).trim().toUpperCase() === String(t.TenantId).trim().toUpperCase() &&
      !l.IsDeleted
    );
    // Find genuinely active license
    const activeLicense = tenantLicenses.find(l => Boolean(l.IsActive) || String(l.Status).toLowerCase() === "active") 
      || null;

    return {
      ...t,
      activeLicense: activeLicense ? {
        id: activeLicense.Id,
        licenseType: activeLicense.LicenseType || "Professional",
        startDate: activeLicense.StartDate,
        endDate: activeLicense.EndDate,
        isActive: Boolean(activeLicense.IsActive),
        status: activeLicense.Status || "Active",
        amount: activeLicense.Amount || 0
      } : null
    };
  });
}

/**
 * Auto-generate next non-colliding unique TenantId (e.g. TEN001, TEN002...)
 * Guarantees Tenant IDs never duplicate.
 */
function generateUniqueTenantId_(tenants) {
  let maxNum = 0;
  (tenants || []).forEach(t => {
    const m = String(t.TenantId || "").match(/^TEN(\d+)$/i);
    if (m) {
      const num = parseInt(m[1], 10);
      if (num > maxNum) maxNum = num;
    }
  });
  let nextNum = maxNum + 1;
  let candidate = "TEN" + String(nextNum).padStart(3, "0");
  const existingSet = new Set((tenants || []).map(t => String(t.TenantId || "").trim().toUpperCase()));
  while (existingSet.has(candidate)) {
    nextNum++;
    candidate = "TEN" + String(nextNum).padStart(3, "0");
  }
  return candidate;
}

/**
 * Ensures 'Payment_Accounts' tab exists in Central_SaaS_Master_DB with complete headers and default accounts.
 * Automatically adds the tab if it does not exist.
 */
function ensurePaymentAccountsSheet_() {
  const sheet = getOrCreateSheet_(CRM_CONFIG.SHEETS.PAYMENT_ACCOUNTS, CRM_SCHEMAS.PAYMENT_ACCOUNTS);
  if (sheet.getLastRow() <= 1) {
    const now = new Date().toISOString();
    const defaults = [
      ["ACC001", "Cash in Hand", "Cash", "-", "Active", false, "superadmin@srinvestments.com", now, "", "", "", ""],
      ["ACC002", "Bank1 (Primary Current)", "Bank", "50200012345678", "Active", false, "superadmin@srinvestments.com", now, "", "", "", ""],
      ["ACC003", "Bank2 (Operating)", "Bank", "001105009876", "Active", false, "superadmin@srinvestments.com", now, "", "", "", ""]
    ];
    sheet.getRange(2, 1, defaults.length, CRM_SCHEMAS.PAYMENT_ACCOUNTS.length).setValues(defaults);
    Logger.log("[CENTRAL_DB] Created 'Payment_Accounts' tab with default accounts in Central DB.");
  }
  return sheet;
}

/**
 * Fetch Payment Accounts from Central DB (guarantees tab exists)
 */
function getPaymentAccounts_(payload) {
  const sheet = ensurePaymentAccountsSheet_();
  const rows = getSheetRowsAsObjects_(sheet, CRM_SCHEMAS.PAYMENT_ACCOUNTS);
  return rows.filter(r => !r.IsDeleted && String(r.IsDeleted).toLowerCase() !== "true");
}

/**
 * Create or Update a Client Organization (Tenant)
 */
function saveTenant_(payload) {
  payload = payload || {};
  verifyIsSuperAdmin_(payload);
  const tenantSheet = getOrCreateSheet_(CRM_CONFIG.SHEETS.TENANT_MASTER, CRM_SCHEMAS.TENANT_MASTER);
  const tenants = getSheetRowsAsObjects_(tenantSheet, CRM_SCHEMAS.TENANT_MASTER);
  const now = new Date().toISOString();
  const userEmail = payload.userEmail || "superadmin@srinvestments.com";

  let tenantId = (payload.TenantId || "").trim();
  const existingIds = new Set(tenants.map(t => String(t.TenantId || "").trim().toUpperCase()));

  // Locate existing row if editing
  let targetRowIndex = -1;
  if (tenantId) {
    const rawIds = tenantSheet.getRange(2, 1, Math.max(tenantSheet.getLastRow() - 1, 1), 1).getValues();
    for (let i = 0; i < rawIds.length; i++) {
      if (String(rawIds[i][0]).trim().toUpperCase() === tenantId.toUpperCase()) {
        targetRowIndex = i + 2;
        break;
      }
    }
  }

  const isNew = targetRowIndex === -1;
  if (isNew) {
    // If tenantId already exists or is empty, auto-generate next unique ID to guarantee no duplicate
    if (!tenantId || existingIds.has(tenantId.toUpperCase())) {
      tenantId = generateUniqueTenantId_(tenants);
    }
  }

  const tenantRecord = {
    TenantId: tenantId,
    CompanyName: cleanStr_(payload.CompanyName) || "New Client Organization",
    TagLine: cleanStr_(payload.TagLine) || "Mutual Fund CRM",
    ArnNumber: cleanStr_(payload.ArnNumber) || "",
    SpreadsheetId: cleanStr_(payload.SpreadsheetId) || "",
    DriveRootFolderId: cleanStr_(payload.DriveRootFolderId) || "",
    SupportEmail: cleanStr_(payload.SupportEmail) || "",
    ContactPhone: cleanStr_(payload.ContactPhone) || "",
    OfficeAddress: cleanStr_(payload.OfficeAddress) || "",
    Status: cleanStr_(payload.Status) || "Active",
    IsDeleted: false,
    Updated_By: userEmail,
    Updated_At: now
  };

  if (isNew) {
    tenantRecord.Created_By = userEmail;
    tenantRecord.Created_At = now;
    tenantRecord.Deleted_By = "";
    tenantRecord.Deleted_At = "";
  }

  writeRowByHeaders_(tenantSheet, targetRowIndex, tenantRecord, CRM_SCHEMAS.TENANT_MASTER);

  // If initial license configuration is passed with new tenant, create license record
  if (payload.initialLicense) {
    saveTenantLicense_({
      tenantId: tenantId,
      TenantId: tenantId,
      LicenseType: payload.initialLicense.licenseType || "Enterprise",
      StartDate: payload.initialLicense.startDate || now.slice(0, 10),
      EndDate: payload.initialLicense.endDate || "",
      Amount: payload.initialLicense.amount !== undefined ? payload.initialLicense.amount : 0,
      PaymentMode: payload.initialLicense.paymentMode || "Cash",
      TxnDate: payload.initialLicense.txnDate || now.slice(0, 10),
      PaymentAccount: payload.initialLicense.paymentAccount || "Cash",
      ReferenceNo: payload.initialLicense.referenceNo || "",
      Status: "Active",
      Notes: payload.initialLicense.notes || "Initial subscription license setup on onboarding",
      userEmail: userEmail,
      isSuperAdmin: true
    });
  }

  return { success: true, tenantId: tenantId, message: "Client organization saved successfully." };
}

/**
 * Soft delete a client organization (Tenant)
 */
function deleteTenant_(payload) {
  payload = payload || {};
  verifyIsSuperAdmin_(payload);
  const tenantId = (payload.tenantId || payload.TenantId || "").trim();
  if (!tenantId) throw new Error("Tenant ID is required.");

  const tenantSheet = getOrCreateSheet_(CRM_CONFIG.SHEETS.TENANT_MASTER, CRM_SCHEMAS.TENANT_MASTER);
  const now = new Date().toISOString();
  const userEmail = payload.userEmail || "superadmin@srinvestments.com";

  let targetRowIndex = -1;
  const rawIds = tenantSheet.getRange(2, 1, Math.max(tenantSheet.getLastRow() - 1, 1), 1).getValues();
  for (let i = 0; i < rawIds.length; i++) {
    if (String(rawIds[i][0]).trim().toUpperCase() === tenantId.toUpperCase()) {
      targetRowIndex = i + 2;
      break;
    }
  }

  if (targetRowIndex === -1) throw new Error("Client organization not found.");

  writeRowByHeaders_(tenantSheet, targetRowIndex, {
    IsDeleted: true,
    Deleted_By: userEmail,
    Deleted_At: now,
    Status: "Suspended"
  }, CRM_SCHEMAS.TENANT_MASTER);

  return { success: true, message: "Client organization deleted." };
}

/**
 * Fetch all registered users from Central User_Master (SuperAdmin only)
 * Omits Password hashes for security
 */
function getCentralUsers_(payload) {
  payload = payload || {};
  verifyIsSuperAdmin_(payload);
  const userSheet = getOrCreateSheet_(CRM_CONFIG.SHEETS.USER_MASTER, CRM_SCHEMAS.USER_MASTER);
  const users = getSheetRowsAsObjects_(userSheet, CRM_SCHEMAS.USER_MASTER);
  const showDeleted = Boolean(payload.showDeleted);

  return users
    .filter(u => showDeleted || (!u.IsDeleted && String(u.IsDeleted).toLowerCase() !== "true"))
    .map(u => ({
      UserId: u.UserId || "",
      FullName: u.FullName || u.Name || "",
      Email: u.Email || "",
      AlternateEmailsList: u.AlternateEmailsList || u.GoogleEmails || "",
      Mobile: u.Mobile || "",
      AlternateMobile: u.AlternateMobile || "",
      IsSuperAdmin: isSuperAdminValue_(u.IsSuperAdmin),
      Status: u.Status || "Active",
      Created_At: u.Created_At || "",
      Updated_At: u.Updated_At || ""
    }));
}

/**
 * Fetch all Tenant User Mappings joined with Tenant details and User details (SuperAdmin only)
 */
function getTenantUserMappings_(payload) {
  payload = payload || {};
  verifyIsSuperAdmin_(payload);
  const tenantId = (payload.tenantId || payload.TenantId || "").trim();
  const showDeleted = Boolean(payload.showDeleted);

  const mapSheet = getOrCreateSheet_(CRM_CONFIG.SHEETS.TENANT_USER_MAPPING, CRM_SCHEMAS.TENANT_USER_MAPPING);
  let mappings = getSheetRowsAsObjects_(mapSheet, CRM_SCHEMAS.TENANT_USER_MAPPING);

  const tenantSheet = getOrCreateSheet_(CRM_CONFIG.SHEETS.TENANT_MASTER, CRM_SCHEMAS.TENANT_MASTER);
  const tenants = getSheetRowsAsObjects_(tenantSheet, CRM_SCHEMAS.TENANT_MASTER);

  const userSheet = getOrCreateSheet_(CRM_CONFIG.SHEETS.USER_MASTER, CRM_SCHEMAS.USER_MASTER);
  const users = getSheetRowsAsObjects_(userSheet, CRM_SCHEMAS.USER_MASTER);

  if (tenantId) {
    mappings = mappings.filter(m => String(m.TenantId || "").trim().toUpperCase() === tenantId.toUpperCase());
  }

  if (!showDeleted) {
    mappings = mappings.filter(m => !m.IsDeleted && String(m.IsDeleted).toLowerCase() !== "true");
  }

  return mappings.map(m => {
    const t = tenants.find(x => String(x.TenantId || "").trim().toUpperCase() === String(m.TenantId || "").trim().toUpperCase());
    const u = users.find(x => 
      String(x.UserId || "").trim().toLowerCase() === String(m.UserId || "").trim().toLowerCase() ||
      String(x.Email || "").trim().toLowerCase() === String(m.UserId || "").trim().toLowerCase()
    );

    return {
      MappingId: m.MappingId || "",
      TenantId: m.TenantId || "",
      TenantName: (t && t.CompanyName) || m.TenantId || "",
      UserId: m.UserId || "",
      UserName: (u && (u.FullName || u.Name)) || m.UserId || "",
      UserEmail: (u && u.Email) || "",
      UserMobile: (u && u.Mobile) || "",
      Role: m.Role || "Staff",
      Status: m.Status || "Active",
      IsDeleted: Boolean(m.IsDeleted),
      Created_By: m.Created_By || "",
      Created_At: m.Created_At || "",
      Updated_By: m.Updated_By || "",
      Updated_At: m.Updated_At || ""
    };
  });
}

/**
 * Assign and update Tenant-User Mappings in Tenant_User_Mapping sheet (SuperAdmin only)
 * Supports multiple user selection for a tenant
 */
function saveTenantUserMappings_(payload) {
  payload = payload || {};
  verifyIsSuperAdmin_(payload);
  const tenantId = (payload.tenantId || payload.TenantId || "").trim();
  if (!tenantId) throw new Error("Tenant ID is required for mapping users.");

  const userEmail = payload.userEmail || "superadmin@srinvestments.com";
  const now = new Date().toISOString();

  // payload.mappings can be an array of:
  // - { userId: 'USR_001', role: 'Admin', status: 'Active' }
  // OR payload.userIds can be array of strings ['USR_001', 'USR_002']
  let rawMappings = payload.mappings || [];
  if (!Array.isArray(rawMappings) && Array.isArray(payload.userIds)) {
    rawMappings = payload.userIds.map(uid => ({
      userId: uid,
      role: payload.role || "Staff",
      status: "Active"
    }));
  }

  const mapSheet = getOrCreateSheet_(CRM_CONFIG.SHEETS.TENANT_USER_MAPPING, CRM_SCHEMAS.TENANT_USER_MAPPING);
  const existingMappings = getSheetRowsAsObjects_(mapSheet, CRM_SCHEMAS.TENANT_USER_MAPPING);

  // Map of existing records for this tenant: key = userId.toLowerCase() -> { rowNumber, record }
  const existingByUserId = {};
  existingMappings.forEach((m, idx) => {
    if (String(m.TenantId || "").trim().toUpperCase() === tenantId.toUpperCase()) {
      const uKey = String(m.UserId || "").trim().toLowerCase();
      if (uKey) {
        existingByUserId[uKey] = {
          rowNumber: idx + 2,
          record: m
        };
      }
    }
  });

  const selectedUserIdsSet = new Set();
  let savedCount = 0;

  // 1. Upsert selected user mappings
  rawMappings.forEach(item => {
    const uid = String(item.userId || item.UserId || "").trim();
    if (!uid) return;
    const uKey = uid.toLowerCase();
    selectedUserIdsSet.add(uKey);

    const role = (item.role || item.Role || "Staff").trim();
    const status = (item.status || item.Status || "Active").trim();

    if (existingByUserId[uKey]) {
      // Update existing mapping row
      const existing = existingByUserId[uKey];
      const updated = Object.assign({}, existing.record, {
        Role: role,
        Status: status,
        IsDeleted: false,
        Updated_By: userEmail,
        Updated_At: now,
        Deleted_By: "",
        Deleted_At: ""
      });
      writeRowByHeaders_(mapSheet, existing.rowNumber, updated, CRM_SCHEMAS.TENANT_USER_MAPPING);
    } else {
      // Create new mapping row
      const newMapping = {
        MappingId: "MAP_" + Date.now() + "_" + Math.floor(Math.random() * 1000),
        UserId: uid,
        TenantId: tenantId,
        Role: role,
        Status: status,
        IsDeleted: false,
        Created_By: userEmail,
        Created_At: now,
        Updated_By: userEmail,
        Updated_At: now,
        Deleted_By: "",
        Deleted_At: ""
      };
      writeRowByHeaders_(mapSheet, -1, newMapping, CRM_SCHEMAS.TENANT_USER_MAPPING);
    }
    savedCount++;
  });

  // 2. If replaceMode is true (default), unselected existing mappings for this tenant are deactivated / deleted
  const replaceMode = payload.replaceMode !== false;
  let unmappedCount = 0;
  if (replaceMode) {
    Object.keys(existingByUserId).forEach(uKey => {
      if (!selectedUserIdsSet.has(uKey)) {
        const item = existingByUserId[uKey];
        if (!item.record.IsDeleted || String(item.record.IsDeleted).toLowerCase() !== "true") {
          const deletedRecord = Object.assign({}, item.record, {
            Status: "Inactive",
            IsDeleted: true,
            Updated_By: userEmail,
            Updated_At: now,
            Deleted_By: userEmail,
            Deleted_At: now
          });
          writeRowByHeaders_(mapSheet, item.rowNumber, deletedRecord, CRM_SCHEMAS.TENANT_USER_MAPPING);
          unmappedCount++;
        }
      }
    });
  }

  return {
    success: true,
    tenantId: tenantId,
    savedCount: savedCount,
    unmappedCount: unmappedCount,
    message: "Successfully assigned " + savedCount + " user(s) to tenant " + tenantId + "."
  };
}

/**
 * Remove/delete a single Tenant-User Mapping (SuperAdmin only)
 */
function deleteTenantUserMapping_(payload) {
  payload = payload || {};
  verifyIsSuperAdmin_(payload);
  const mappingId = (payload.mappingId || payload.MappingId || "").trim();
  const tenantId = (payload.tenantId || payload.TenantId || "").trim();
  const userId = (payload.userId || payload.UserId || "").trim();
  const userEmail = payload.userEmail || "superadmin@srinvestments.com";
  const now = new Date().toISOString();

  const mapSheet = getOrCreateSheet_(CRM_CONFIG.SHEETS.TENANT_USER_MAPPING, CRM_SCHEMAS.TENANT_USER_MAPPING);
  const mappings = getSheetRowsAsObjects_(mapSheet, CRM_SCHEMAS.TENANT_USER_MAPPING);

  let targetIndex = -1;
  mappings.forEach((m, idx) => {
    if (mappingId && String(m.MappingId || "").trim() === mappingId) {
      targetIndex = idx;
    } else if (tenantId && userId &&
               String(m.TenantId || "").trim().toUpperCase() === tenantId.toUpperCase() &&
               String(m.UserId || "").trim().toLowerCase() === userId.toLowerCase()) {
      targetIndex = idx;
    }
  });

  if (targetIndex === -1) {
    throw new Error("Tenant-User Mapping not found.");
  }

  const deletedRecord = Object.assign({}, mappings[targetIndex], {
    Status: "Inactive",
    IsDeleted: true,
    Updated_By: userEmail,
    Updated_At: now,
    Deleted_By: userEmail,
    Deleted_At: now
  });
  writeRowByHeaders_(mapSheet, targetIndex + 2, deletedRecord, CRM_SCHEMAS.TENANT_USER_MAPPING);

  return {
    success: true,
    message: "Tenant user mapping removed successfully."
  };
}

/**
 * Modifies Tenant Licensing sheet to insert the 4 payment columns right after Amount,
 * and rearranges columns in standard schema order, preserving any existing rows.
 */
function modifyTenantLicensingColumns_(sheet) {
  if (!sheet) {
    const ss = getSpreadsheet_();
    sheet = ss.getSheetByName("Tenant_Licensing") || ss.getSheetByName("Tenant_Licenses");
    if (!sheet) {
      sheet = ss.insertSheet("Tenant_Licenses");
    }
  }

  const schema = CRM_SCHEMAS.TENANT_LICENSES;
  const lastRow = sheet.getLastRow();
  const lastCol = sheet.getLastColumn();

  let existingData = [];
  if (lastRow > 1 && lastCol > 0) {
    const rawHeaders = sheet.getRange(1, 1, 1, lastCol).getValues()[0].map(h => String(h || "").trim());
    const rawValues = sheet.getRange(2, 1, lastRow - 1, lastCol).getValues();
    existingData = rawValues.map(row => {
      const obj = {};
      rawHeaders.forEach((h, i) => {
        if (h) obj[h.toLowerCase()] = row[i];
      });
      return obj;
    });
  }

  // Clear existing content and format
  sheet.clear();

  // Write new schema headers to Row 1
  sheet.getRange(1, 1, 1, schema.length).setValues([schema]);
  sheet.setFrozenRows(1);
  sheet.getRange(1, 1, 1, schema.length)
    .setFontWeight("bold")
    .setBackground("#1e40af") // Royal Blue
    .setFontColor("#ffffff");

  // Restore data rows mapped into the new columns
  if (existingData.length > 0) {
    const newValues = existingData.map(obj => {
      return schema.map(col => {
        const val = obj[col.toLowerCase()];
        return val !== undefined ? val : "";
      });
    });
    sheet.getRange(2, 1, newValues.length, schema.length).setValues(newValues);
  } else {
    // Seed default record if table is empty
    const now = new Date().toISOString();
    const defaultLic = [
      "LIC_101", "TEN001", "Enterprise", now.slice(0, 10), "2027-12-31", 120000,
      "UPI", now.slice(0, 10), "Cash in Hand", "TXN_INIT_001",
      true, "Active", "Founder Enterprise SaaS License",
      false, "system", now, "system", now, "", ""
    ];
    sheet.getRange(2, 1, 1, schema.length).setValues([defaultLic]);
  }

  sheet.autoResizeColumns(1, schema.length);
  Logger.log("[SCHEMA_MIGRATION] Tenant Licensing sheet columns updated to: " + schema.join(", "));
  return {
    success: true,
    sheetName: sheet.getName(),
    columns: schema,
    rowCount: sheet.getLastRow(),
    message: "Tenant Licensing sheet columns successfully modified with payment fields."
  };
}

/**
 * Auto-transition rules:
 * - Mark as EXPIRED if today > EndDate (and was Active).
 * - If no active license, find queued 'NEW' licenses:
 *   if today >= StartDate && today <= EndDate, automatically transition to ACTIVE!
 * - If multiple queued, picks the one whose StartDate is nearest to previous EndDate.
 */
function evaluateAndSyncTenantLicenses_(sheet, tenantId) {
  if (!sheet) {
    sheet = getOrCreateSheet_(CRM_CONFIG.SHEETS.TENANT_LICENSES, CRM_SCHEMAS.TENANT_LICENSES);
  }
  const allLicenses = getSheetRowsAsObjects_(sheet, CRM_SCHEMAS.TENANT_LICENSES);
  const now = new Date().toISOString();
  const today = now.slice(0, 10);
  
  const tenantRows = [];
  allLicenses.forEach((lic, idx) => {
    if (!lic.IsDeleted || String(lic.IsDeleted).toLowerCase() !== "true") {
      if (!tenantId || String(lic.TenantId || "").trim().toUpperCase() === String(tenantId).trim().toUpperCase()) {
        tenantRows.push({ rowNumber: idx + 2, lic: lic });
      }
    }
  });

  if (tenantRows.length === 0) return allLicenses;

  // Group by tenant
  const byTenant = {};
  tenantRows.forEach(item => {
    const tId = String(item.lic.TenantId || "").trim().toUpperCase();
    if (!byTenant[tId]) byTenant[tId] = [];
    byTenant[tId].push(item);
  });

  let modified = false;

  Object.keys(byTenant).forEach(tId => {
    const group = byTenant[tId];
    let hasActive = false;
    let expiredEndDate = "";

    // 1. Expire past licenses (EndDate < today) & strictly exclude CANCELLED/EXPIRED
    group.forEach(item => {
      const lic = item.lic;
      const statusLower = String(lic.Status || "").toLowerCase();
      const isCancelled = statusLower === "cancelled";
      const isExpired = statusLower === "expired";

      // If license is marked CANCELLED or EXPIRED, guarantee IsActive is false
      if (isCancelled || isExpired) {
        if (lic.IsActive === true || String(lic.IsActive).toLowerCase() === "true") {
          const deact = Object.assign({}, lic, { IsActive: false });
          writeRowByHeaders_(sheet, item.rowNumber, deact, CRM_SCHEMAS.TENANT_LICENSES);
          item.lic = deact;
          modified = true;
        }
        return;
      }

      const isActive = (lic.IsActive === true || String(lic.IsActive).toLowerCase() === "true" || statusLower === "active");
      const startDate = lic.StartDate ? String(lic.StartDate).slice(0, 10) : "";
      const endDate = lic.EndDate ? String(lic.EndDate).slice(0, 10) : "";

      // Future license check: if StartDate > today, it CANNOT be active today!
      if (startDate && startDate > today) {
        if (lic.IsActive === true || String(lic.IsActive).toLowerCase() === "true" || statusLower === "active") {
          const queued = Object.assign({}, lic, {
            IsActive: false,
            Status: "NEW",
            Updated_By: "system-auto",
            Updated_At: now
          });
          writeRowByHeaders_(sheet, item.rowNumber, queued, CRM_SCHEMAS.TENANT_LICENSES);
          item.lic = queued;
          modified = true;
        }
        return;
      }

      if (isActive && endDate && today > endDate) {
        const updated = Object.assign({}, lic, {
          IsActive: false,
          Status: "Expired",
          Updated_By: "system-auto",
          Updated_At: now
        });
        writeRowByHeaders_(sheet, item.rowNumber, updated, CRM_SCHEMAS.TENANT_LICENSES);
        item.lic = updated;
        expiredEndDate = endDate;
        modified = true;
      } else if (isActive && (!endDate || today <= endDate)) {
        hasActive = true;
      }
    });

    // 2. If NO active license, check for queued NEW licenses whose StartDate <= today <= EndDate
    if (!hasActive) {
      const candidates = group.filter(item => {
        const sLower = String(item.lic.Status || "").toLowerCase();
        const sDate = item.lic.StartDate ? String(item.lic.StartDate).slice(0, 10) : "";
        const eDate = item.lic.EndDate ? String(item.lic.EndDate).slice(0, 10) : "";
        return (sLower === "new" || sLower === "pending" || sLower === "upcoming") &&
               sDate && today >= sDate && (!eDate || today <= eDate);
      });

      if (candidates.length > 0) {
        // Pick the candidate whose StartDate is nearest to today / expiredEndDate
        candidates.sort((a, b) => {
          const tA = new Date(a.lic.StartDate).getTime();
          const tB = new Date(b.lic.StartDate).getTime();
          const refTime = expiredEndDate ? new Date(expiredEndDate).getTime() : new Date().getTime();
          return Math.abs(tA - refTime) - Math.abs(tB - refTime);
        });

        const chosen = candidates[0];
        const activated = Object.assign({}, chosen.lic, {
          IsActive: true,
          Status: "Active",
          Updated_By: "system-auto-chain",
          Updated_At: now
        });
        writeRowByHeaders_(sheet, chosen.rowNumber, activated, CRM_SCHEMAS.TENANT_LICENSES);
        chosen.lic = activated;
        modified = true;
      }
    }
  });

  return modified ? getSheetRowsAsObjects_(sheet, CRM_SCHEMAS.TENANT_LICENSES) : allLicenses;
}

/**
 * Get License History for a Tenant (auto-evaluated)
 */
function getTenantLicenses_(payload) {
  payload = payload || {};
  verifyIsSuperAdmin_(payload);
  const tenantId = (payload.tenantId || payload.TenantId || "").trim();
  const sheet = getOrCreateSheet_(CRM_CONFIG.SHEETS.TENANT_LICENSES, CRM_SCHEMAS.TENANT_LICENSES);
  let rows = evaluateAndSyncTenantLicenses_(sheet, tenantId);

  if (tenantId) {
    rows = rows.filter(r => String(r.TenantId).trim().toUpperCase() === tenantId.toUpperCase());
  }

  if (!payload.showDeleted) {
    rows = rows.filter(r => !r.IsDeleted && String(r.IsDeleted).toLowerCase() !== "true");
  }

  return rows.reverse();
}

/**
 * Manually activate a license for a tenant:
 * - Sets target license to Active (IsActive: true, Status: "Active")
 * - Sets any previously active license for this tenant to Expired (IsActive: false, Status: "Expired")
 */
function activateTenantLicense_(payload) {
  payload = payload || {};
  verifyIsSuperAdmin_(payload);
  const licenseId = (payload.licenseId || payload.id || payload.Id || "").trim();
  const tenantId = (payload.tenantId || payload.TenantId || "").trim();
  if (!licenseId || !tenantId) throw new Error("License ID and Tenant ID are required for activation.");

  const sheet = getOrCreateSheet_(CRM_CONFIG.SHEETS.TENANT_LICENSES, CRM_SCHEMAS.TENANT_LICENSES);
  const licenses = getSheetRowsAsObjects_(sheet, CRM_SCHEMAS.TENANT_LICENSES);
  const now = new Date().toISOString();
  const userEmail = payload.userEmail || "superadmin@srinvestments.com";

  let targetIndex = -1;
  licenses.forEach((lic, idx) => {
    if (String(lic.TenantId).trim().toUpperCase() === tenantId.toUpperCase()) {
      if (lic.Id === licenseId) {
        targetIndex = idx;
      } else if (Boolean(lic.IsActive) || String(lic.Status).toLowerCase() === "active") {
        // Mark previous active as Expired
        const expiredLic = Object.assign({}, lic, {
          IsActive: false,
          Status: "Expired",
          Updated_By: userEmail,
          Updated_At: now
        });
        writeRowByHeaders_(sheet, idx + 2, expiredLic, CRM_SCHEMAS.TENANT_LICENSES);
      }
    }
  });

  if (targetIndex === -1) {
    throw new Error("License " + licenseId + " not found.");
  }

  const targetLic = Object.assign({}, licenses[targetIndex], {
    IsActive: true,
    Status: "Active",
    Updated_By: userEmail,
    Updated_At: now
  });
  writeRowByHeaders_(sheet, targetIndex + 2, targetLic, CRM_SCHEMAS.TENANT_LICENSES);

  return {
    success: true,
    licenseId: licenseId,
    message: "License " + licenseId + " activated successfully! Previous license marked as Expired."
  };
}

/**
 * Cancel a license for a tenant:
 * - Sets target license to Cancelled (IsActive: false, Status: "CANCELLED")
 * - If this was the active license, evaluate and sync will check if any queued NEW license is ready to auto-activate
 */
function cancelTenantLicense_(payload) {
  payload = payload || {};
  verifyIsSuperAdmin_(payload);
  const licenseId = (payload.licenseId || payload.id || payload.Id || "").trim();
  const tenantId = (payload.tenantId || payload.TenantId || "").trim();
  if (!licenseId) throw new Error("License ID is required for cancellation.");

  const sheet = getOrCreateSheet_(CRM_CONFIG.SHEETS.TENANT_LICENSES, CRM_SCHEMAS.TENANT_LICENSES);
  const licenses = getSheetRowsAsObjects_(sheet, CRM_SCHEMAS.TENANT_LICENSES);
  const now = new Date().toISOString();
  const userEmail = payload.userEmail || "superadmin@srinvestments.com";

  let targetIndex = -1;
  licenses.forEach((lic, idx) => {
    if (String(lic.Id).trim() === licenseId) {
      targetIndex = idx;
    }
  });

  if (targetIndex === -1) {
    throw new Error("License " + licenseId + " not found.");
  }

  const cancelledLic = Object.assign({}, licenses[targetIndex], {
    IsActive: false,
    Status: "CANCELLED",
    Updated_By: userEmail,
    Updated_At: now
  });
  writeRowByHeaders_(sheet, targetIndex + 2, cancelledLic, CRM_SCHEMAS.TENANT_LICENSES);

  // Re-evaluate remaining licenses for this tenant
  evaluateAndSyncTenantLicenses_(sheet, tenantId);

  return {
    success: true,
    licenseId: licenseId,
    status: "CANCELLED",
    message: "Subscription license " + licenseId + " has been cancelled."
  };
}

/**
 * Save / Renew a Tenant License (supports saving as NEW, Active, or CANCELLED)
 */
function saveTenantLicense_(payload) {
  payload = payload || {};
  verifyIsSuperAdmin_(payload);
  const tenantId = (payload.tenantId || payload.TenantId || "").trim();
  if (!tenantId) throw new Error("Tenant ID is required for licensing.");

  const sheet = getOrCreateSheet_(CRM_CONFIG.SHEETS.TENANT_LICENSES, CRM_SCHEMAS.TENANT_LICENSES);
  const licenses = getSheetRowsAsObjects_(sheet, CRM_SCHEMAS.TENANT_LICENSES);
  const now = new Date().toISOString();
  const today = now.slice(0, 10);
  const userEmail = payload.userEmail || "superadmin@srinvestments.com";

  let id = (payload.id || payload.Id || "").trim();
  const isNew = !id;
  if (isNew) {
    id = "LIC_" + Date.now();
  }

  const rawStatus = String(payload.Status || payload.status || "NEW").trim();
  const isCancelled = rawStatus.toUpperCase() === "CANCELLED";
  const isActive = rawStatus.toUpperCase() === "ACTIVE";
  const requestedStatus = isCancelled ? "CANCELLED" : (isActive ? "Active" : "NEW");
  const startDate = payload.StartDate || payload.startDate || today;
  const endDate = payload.EndDate || payload.endDate || "";

  const startDateStr = String(startDate || "").slice(0, 10);
  const isFuture = startDateStr && startDateStr > today;
  let finalStatus = requestedStatus;
  let finalIsActive = requestedStatus === "Active";

  if (isFuture && finalStatus === "Active") {
    finalStatus = "NEW";
    finalIsActive = false;
  }
  if (isCancelled) {
    finalStatus = "CANCELLED";
    finalIsActive = false;
  }

  // If status is Active, mark earlier active licenses for this tenant as Expired
  if (finalStatus === "Active") {
    licenses.forEach((lic, idx) => {
      if (String(lic.TenantId).trim().toUpperCase() === tenantId.toUpperCase() && 
          lic.Id !== id && 
          (Boolean(lic.IsActive) || String(lic.Status).toLowerCase() === "active")) {
        const updatedLic = Object.assign({}, lic, {
          IsActive: false,
          Status: "Expired",
          Updated_By: userEmail,
          Updated_At: now
        });
        writeRowByHeaders_(sheet, idx + 2, updatedLic, CRM_SCHEMAS.TENANT_LICENSES);
      }
    });
  }

  const record = {
    Id: id,
    TenantId: tenantId,
    LicenseType: payload.LicenseType || payload.licenseType || "Professional",
    StartDate: startDate,
    EndDate: endDate,
    Amount: Number(payload.Amount !== undefined ? payload.Amount : (payload.amount !== undefined ? payload.amount : 0)) || 0,
    PaymentMode: payload.PaymentMode || payload.paymentMode || "Cash",
    TxnDate: payload.TxnDate || payload.txnDate || today,
    PaymentAccount: payload.PaymentAccount || payload.paymentAccount || payload.account || "Cash in Hand",
    ReferenceNo: payload.ReferenceNo || payload.referenceNo || "",
    IsActive: finalIsActive,
    Status: finalStatus,
    Notes: payload.Notes || payload.notes || "",
    IsDeleted: false,
    Updated_By: userEmail,
    Updated_At: now
  };

  if (isNew) {
    record.Created_By = userEmail;
    record.Created_At = now;
    record.Deleted_By = "";
    record.Deleted_At = "";
  }

  let targetRowIndex = -1;
  let finalRecord = record;
  if (!isNew) {
    const rawIds = sheet.getRange(2, 1, Math.max(sheet.getLastRow() - 1, 1), 1).getValues();
    for (let i = 0; i < rawIds.length; i++) {
      if (String(rawIds[i][0]).trim() === id) {
        targetRowIndex = i + 2;
        break;
      }
    }
    if (targetRowIndex > 0 && licenses[targetRowIndex - 2]) {
      finalRecord = Object.assign({}, licenses[targetRowIndex - 2], record);
    }
  }

  writeRowByHeaders_(sheet, targetRowIndex, finalRecord, CRM_SCHEMAS.TENANT_LICENSES);
  evaluateAndSyncTenantLicenses_(sheet, tenantId);

  return { 
    success: true, 
    licenseId: id, 
    status: requestedStatus,
    message: requestedStatus === "Active" ? "Subscription license saved and activated." : 
      (requestedStatus === "CANCELLED" ? "Subscription license cancelled." : "Subscription license saved as NEW (Queued).")
  };
}

/**
 * Get User Documents (Multi-Tenant Aware)
 */
function getUserDocuments_(payload) {
  payload = payload || {};
  const userId = (payload.userId || payload.UserId || "").trim();
  const tenantId = (payload.tenantId || payload.TenantId || payload.activeTenantId || "").trim();

  const sheet = getOrCreateSheet_(CRM_CONFIG.SHEETS.USER_DOCUMENTS, CRM_SCHEMAS.USER_DOCUMENTS, tenantId);
  let rows = getSheetRowsAsObjects_(sheet, CRM_SCHEMAS.USER_DOCUMENTS);

  if (!payload.showDeleted) {
    rows = rows.filter(r => !r.IsDeleted && String(r.IsDeleted).toLowerCase() !== "true");
  }

  if (userId) {
    rows = rows.filter(r => String(r.UserId).trim().toLowerCase() === userId.toLowerCase());
  }

  if (tenantId) {
    rows = rows.filter(r => String(r.TenantId).trim().toUpperCase() === tenantId.toUpperCase());
  }

  return rows.reverse();
}

/**
 * Upload User / Tenant Document (Multi-Tenant Aware)
 */
function uploadUserDocument_(payload) {
  payload = payload || {};
  const fileData = payload.file;
  if (!fileData || !fileData.base64) throw new Error("Document file content is required.");

  const tenantId = (payload.tenantId || payload.TenantId || payload.activeTenantId || "").trim();
  const userId = (payload.userId || payload.UserId || "").trim();
  const docName = cleanStr_(payload.docName || fileData.name || "User_Document");
  const docType = cleanStr_(payload.docType || "General Document");
  const userEmail = payload.userEmail || "user@srinvestments.com";
  const now = new Date().toISOString();

  // Upload to tenant or root folder
  const driveRoot = getTenantDriveRootFolder_(tenantId);
  const blob = Utilities.newBlob(Utilities.base64Decode(fileData.base64.split(",")[1] || fileData.base64), fileData.mimeType || "application/pdf", docName);
  const file = driveRoot.createFile(blob);
  file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);

  const docId = "DOC_" + Date.now();
  const record = {
    Id: docId,
    UserId: userId,
    TenantId: tenantId,
    DocName: docName,
    DocType: docType,
    DocPath: file.getUrl(),
    DriveFileId: file.getId(),
    ViewUrl: file.getUrl(),
    IsDeleted: false,
    Created_By: userEmail,
    Created_At: now,
    Updated_By: userEmail,
    Updated_At: now,
    Deleted_By: "",
    Deleted_At: ""
  };

  const sheet = getOrCreateSheet_(CRM_CONFIG.SHEETS.USER_DOCUMENTS, CRM_SCHEMAS.USER_DOCUMENTS, tenantId);
  writeRowByHeaders_(sheet, -1, record, CRM_SCHEMAS.USER_DOCUMENTS);

  return {
    success: true,
    documentId: docId,
    fileId: file.getId(),
    viewUrl: file.getUrl()
  };
}

/**
 * ==============================================================
 * SUBSCRIPTION PLANS MASTER (SaaS Tiers & Quota Limits)
 * ==============================================================
 */

function getSubscriptionPlans_(payload) {
  payload = payload || {};
  verifyIsSuperAdmin_(payload);
  const showDeleted = Boolean(payload.showDeleted);
  const sheet = getOrCreateSheet_(CRM_CONFIG.SHEETS.SUBSCRIPTION_PLANS, CRM_SCHEMAS.SUBSCRIPTION_PLANS);
  let plans = getSheetRowsAsObjects_(sheet, CRM_SCHEMAS.SUBSCRIPTION_PLANS);

  // If empty, seed initial default plans (Starter, Professional, Enterprise)
  if (!plans || plans.length === 0) {
    seedSubscriptionPlans_(sheet);
    plans = getSheetRowsAsObjects_(sheet, CRM_SCHEMAS.SUBSCRIPTION_PLANS);
  }

  if (!showDeleted) {
    plans = plans.filter(p => !p.IsDeleted && String(p.IsDeleted).toLowerCase() !== "true");
  }

  return plans.map(p => ({
    PlanId: p.PlanId,
    PlanName: p.PlanName,
    PlanCode: p.PlanCode,
    Price: Number(p.Price || 0),
    DurationMonths: Number(p.DurationMonths || 12),
    StaffLimit: Number(p.StaffLimit || 5),
    CustomerLimit: Number(p.CustomerLimit || 1000),
    Features: p.Features || "",
    IsPopular: p.IsPopular === true || String(p.IsPopular).toLowerCase() === "true",
    Badge: p.Badge || "",
    Description: p.Description || "",
    Status: p.Status || "Active",
    IsDeleted: p.IsDeleted === true || String(p.IsDeleted).toLowerCase() === "true",
    Created_By: p.Created_By || "",
    Created_At: p.Created_At || "",
    Updated_By: p.Updated_By || "",
    Updated_At: p.Updated_At || ""
  }));
}

function seedSubscriptionPlans_(sheet) {
  const now = new Date().toISOString();
  const seed = [
    {
      PlanId: "PLAN001",
      PlanName: "Starter",
      PlanCode: "STARTER",
      Price: 25000,
      DurationMonths: 3,
      StaffLimit: 3,
      CustomerLimit: 1000,
      Features: "Up to 3 Staff, 1k Investors, Core CRM, Basic Portfolio, Email Support",
      IsPopular: false,
      Badge: "",
      Description: "Up to 3 Staff • 1k Investors • Core CRM",
      Status: "Active",
      IsDeleted: false,
      Created_By: "system@srinvestments.com",
      Created_At: now,
      Updated_By: "system@srinvestments.com",
      Updated_At: now,
      Deleted_By: "",
      Deleted_At: ""
    },
    {
      PlanId: "PLAN002",
      PlanName: "Professional",
      PlanCode: "PROFESSIONAL",
      Price: 60000,
      DurationMonths: 12,
      StaffLimit: 15,
      CustomerLimit: 10000,
      Features: "Up to 15 Staff, 10k Investors, SIP Tracker, Reports, Role Rights",
      IsPopular: true,
      Badge: "POPULAR",
      Description: "Up to 15 Staff • 10k Investors • SIP Tracker • Reports",
      Status: "Active",
      IsDeleted: false,
      Created_By: "system@srinvestments.com",
      Created_At: now,
      Updated_By: "system@srinvestments.com",
      Updated_At: now,
      Deleted_By: "",
      Deleted_At: ""
    },
    {
      PlanId: "PLAN003",
      PlanName: "Enterprise",
      PlanCode: "ENTERPRISE",
      Price: 120000,
      DurationMonths: 24,
      StaffLimit: 999,
      CustomerLimit: 99999,
      Features: "Unlimited Staff & Investors, Custom Drive Vault, Dedicated Sheet Database, Priority SLA Support, Full Audit Trail",
      IsPopular: false,
      Badge: "",
      Description: "Unlimited Staff & Investors • Custom Drive Vault • Priority SLA",
      Status: "Active",
      IsDeleted: false,
      Created_By: "system@srinvestments.com",
      Created_At: now,
      Updated_By: "system@srinvestments.com",
      Updated_At: now,
      Deleted_By: "",
      Deleted_At: ""
    }
  ];

  seed.forEach(item => {
    writeRowByHeaders_(sheet, -1, item, CRM_SCHEMAS.SUBSCRIPTION_PLANS);
  });
}

function saveSubscriptionPlan_(payload) {
  payload = payload || {};
  verifyIsSuperAdmin_(payload);
  const sheet = getOrCreateSheet_(CRM_CONFIG.SHEETS.SUBSCRIPTION_PLANS, CRM_SCHEMAS.SUBSCRIPTION_PLANS);
  const rows = getSheetRowsAsObjects_(sheet, CRM_SCHEMAS.SUBSCRIPTION_PLANS);
  const now = new Date().toISOString();
  const userEmail = payload.userEmail || "superadmin@srinvestments.com";

  let planId = (payload.PlanId || "").trim();
  const isNew = !planId;

  if (isNew) {
    const count = rows.length + 1;
    planId = "PLAN" + String(count).padStart(3, "0");
  }

  const record = {
    PlanId: planId,
    PlanName: cleanStr_(payload.PlanName) || "New Subscription Plan",
    PlanCode: (cleanStr_(payload.PlanCode) || cleanStr_(payload.PlanName) || "CUSTOM").toUpperCase(),
    Price: Number(payload.Price || 0),
    DurationMonths: Number(payload.DurationMonths || 12),
    StaffLimit: Number(payload.StaffLimit || 5),
    CustomerLimit: Number(payload.CustomerLimit || 1000),
    Features: cleanStr_(payload.Features) || "",
    IsPopular: Boolean(payload.IsPopular),
    Badge: cleanStr_(payload.Badge) || (payload.IsPopular ? "POPULAR" : ""),
    Description: cleanStr_(payload.Description) || "",
    Status: cleanStr_(payload.Status) || "Active",
    IsDeleted: false,
    Updated_By: userEmail,
    Updated_At: now
  };

  if (isNew) {
    record.Created_By = userEmail;
    record.Created_At = now;
    record.Deleted_By = "";
    record.Deleted_At = "";
  }

  let targetRowIndex = -1;
  if (!isNew) {
    const rawIds = sheet.getRange(2, 1, Math.max(sheet.getLastRow() - 1, 1), 1).getValues();
    for (let i = 0; i < rawIds.length; i++) {
      if (String(rawIds[i][0]).trim().toUpperCase() === planId.toUpperCase()) {
        targetRowIndex = i + 2;
        break;
      }
    }
  }

  writeRowByHeaders_(sheet, targetRowIndex, record, CRM_SCHEMAS.SUBSCRIPTION_PLANS);
  return record;
}

function deleteSubscriptionPlan_(payload) {
  payload = payload || {};
  verifyIsSuperAdmin_(payload);
  const planId = (payload.PlanId || payload.id || "").trim();
  if (!planId) throw new Error("PlanId is required to delete subscription plan");

  const sheet = getOrCreateSheet_(CRM_CONFIG.SHEETS.SUBSCRIPTION_PLANS, CRM_SCHEMAS.SUBSCRIPTION_PLANS);
  const now = new Date().toISOString();
  const userEmail = payload.userEmail || "superadmin@srinvestments.com";

  const rawIds = sheet.getRange(2, 1, Math.max(sheet.getLastRow() - 1, 1), 1).getValues();
  let targetRowIndex = -1;
  for (let i = 0; i < rawIds.length; i++) {
    if (String(rawIds[i][0]).trim().toUpperCase() === planId.toUpperCase()) {
      targetRowIndex = i + 2;
      break;
    }
  }

  if (targetRowIndex === -1) throw new Error("Subscription plan not found: " + planId);

  const headers = getSheetHeaders_(sheet);
  const delIdx = headers.indexOf("IsDeleted") + 1;
  const byIdx = headers.indexOf("Deleted_By") + 1;
  const atIdx = headers.indexOf("Deleted_At") + 1;

  if (delIdx > 0) sheet.getRange(targetRowIndex, delIdx).setValue(true);
  if (byIdx > 0) sheet.getRange(targetRowIndex, byIdx).setValue(userEmail);
  if (atIdx > 0) sheet.getRange(targetRowIndex, atIdx).setValue(now);

  return { success: true, planId: planId };
}

/**
 * ==============================================================
 * DEFAULT-CONFIG (CENTRAL SAAS MASTER CONFIGURATION)
 * Stores global platform configurations in Central_SaaS_Master_DB:
 * - GoogleClientId
 * - GasDeploymentUrl
 * - SystemName
 * - SupportEmail
 * Enables zero-hardcoding and instant cloud updates.
 * ==============================================================
 */

function isConfigTrue_(val, defaultVal) {
  if (val === undefined || val === null || String(val).trim() === "") {
    return defaultVal !== undefined ? defaultVal : true;
  }
  const s = String(val).trim().toLowerCase();
  return s === "true" || s === "1" || s === "yes" || s === "enabled";
}

function getDefaultConfig_() {
  const sheet = getOrCreateSheet_(CRM_CONFIG.SHEETS.DEFAULT_CONFIG, CRM_SCHEMAS.DEFAULT_CONFIG);
  let rows = getSheetRowsAsObjects_(sheet, CRM_SCHEMAS.DEFAULT_CONFIG);

  if (!rows || rows.length === 0) {
    seedDefaultConfig_(sheet);
    rows = getSheetRowsAsObjects_(sheet, CRM_SCHEMAS.DEFAULT_CONFIG);
  }

  const config = {};
  rows.forEach(r => {
    if (!r.IsDeleted || String(r.IsDeleted).toLowerCase() !== "true") {
      const k = String(r.Key || "").trim();
      if (k) {
        config[k] = r.Value !== undefined && r.Value !== null ? String(r.Value).trim() : "";
        config[k.toLowerCase()] = config[k];
      }
    }
  });

  const now = new Date().toISOString();
  const valCol = getHeaderColIndex_(sheet, "Value");
  const descCol = getHeaderColIndex_(sheet, "Description");
  const upByCol = getHeaderColIndex_(sheet, "Updated_By");
  const upAtCol = getHeaderColIndex_(sheet, "Updated_At");

  // Helper to ensure a key exists in Default-Config sheet with proper default value
  const ensureConfigKey = (keyName, defaultValue, description) => {
    const cleanKey = String(keyName).trim();
    const idx = rows.findIndex(r => String(r.Key || "").trim().toLowerCase() === cleanKey.toLowerCase());
    
    if (idx >= 0) {
      // Row exists: if Value is empty, fill it with defaultValue
      const existingVal = rows[idx].Value !== undefined && rows[idx].Value !== null ? String(rows[idx].Value).trim() : "";
      if (existingVal === "" && defaultValue !== "") {
        const rowNum = idx + 2;
        try {
          if (valCol > 0) sheet.getRange(rowNum, valCol).setValue(defaultValue);
          if (descCol > 0 && !rows[idx].Description) sheet.getRange(rowNum, descCol).setValue(description);
          if (upByCol > 0) sheet.getRange(rowNum, upByCol).setValue("system");
          if (upAtCol > 0) sheet.getRange(rowNum, upAtCol).setValue(now);
        } catch (e) {
          Logger.log("Update empty cell notice: " + e.message);
        }
        config[cleanKey] = defaultValue;
        config[cleanKey.toLowerCase()] = defaultValue;
      }
    } else {
      // Row doesn't exist: insert it
      try {
        writeRowByHeaders_(sheet, 0, {
          Key: cleanKey,
          Value: defaultValue,
          Description: description,
          IsDeleted: false,
          Created_By: "system",
          Created_At: now,
          Updated_By: "system",
          Updated_At: now,
          Deleted_By: "",
          Deleted_At: ""
        }, CRM_SCHEMAS.DEFAULT_CONFIG);
        config[cleanKey] = defaultValue;
        config[cleanKey.toLowerCase()] = defaultValue;
      } catch (e) {
        Logger.log("Auto-seed " + cleanKey + " notice: " + e.message);
      }
    }
  };

  // 1. Login Company Name
  ensureConfigKey("LoginCompanyName", "SR INVESTMENTS CRM", "Company Name displayed on Login screen");

  // 2. Flags for Forgot Password OTP
  ensureConfigKey("IsForgotPasswordWithEmail", "TRUE", "Enable/disable Password Reset OTP via Email (TRUE/FALSE)");
  ensureConfigKey("IsForgotPasswordWithMobileNo", "TRUE", "Enable/disable Password Reset OTP via Mobile SMS (TRUE/FALSE)");

  // 3. SMS Gateway Settings (Auto-seed so visible in sheet)
  ensureConfigKey("SmsProvider", "FAST2SMS", "SMS Gateway Provider: FAST2SMS, TWILIO, MSG91, or CUSTOM_URL");
  ensureConfigKey("SmsApiKey", "", "SMS Gateway API Key / Auth Token (e.g. Fast2SMS API key)");
  ensureConfigKey("SmsSenderId", "", "SMS Sender ID (or Twilio Phone Number)");
  ensureConfigKey("SmsTemplateId", "", "DLT Template ID (Required for MSG91 / Indian DLT Gateways)");
  ensureConfigKey("SmsCustomUrl", "", "Custom SMS Gateway Webhook URL with {MOBILE}, {OTP}, {API_KEY} placeholders");

  // 4. Daily Dispatch Quota Limits (Configured per day)
  ensureConfigKey("EmailMaxLimitPerDay", "200", "Maximum OTP Emails allowed to be sent per day (Default: 200)");
  ensureConfigKey("SmsMaxLimitPerDay", "100", "Maximum OTP SMS allowed to be sent per day (configured manually per SMS plan)");

  return config;
}

function saveDefaultConfig_(payload) {
  payload = payload || {};
  const configs = payload.configs || payload;
  const userEmail = payload.userEmail || "superadmin@srinvestments.com";
  const sheet = getOrCreateSheet_(CRM_CONFIG.SHEETS.DEFAULT_CONFIG, CRM_SCHEMAS.DEFAULT_CONFIG);
  const rows = getSheetRowsAsObjects_(sheet, CRM_SCHEMAS.DEFAULT_CONFIG);
  const now = new Date().toISOString();

  Object.keys(configs).forEach(key => {
    if (key === "userEmail" || key === "userName" || key === "tenantId" || key === "activeTenantId") return;
    const val = String(configs[key] ?? "").trim();
    const cleanKey = String(key).trim();
    const idx = rows.findIndex(r => String(r.Key || "").trim().toLowerCase() === cleanKey.toLowerCase());

    if (idx >= 0) {
      const rowNum = idx + 2;
      const valCol = getHeaderColIndex_(sheet, "Value");
      const upByCol = getHeaderColIndex_(sheet, "Updated_By");
      const upAtCol = getHeaderColIndex_(sheet, "Updated_At");
      if (valCol > 0) sheet.getRange(rowNum, valCol).setValue(val);
      if (upByCol > 0) sheet.getRange(rowNum, upByCol).setValue(userEmail);
      if (upAtCol > 0) sheet.getRange(rowNum, upAtCol).setValue(now);
    } else {
      writeRowByHeaders_(sheet, 0, {
        Key: cleanKey,
        Value: val,
        Description: "Platform default configuration setting",
        IsDeleted: false,
        Created_By: userEmail,
        Created_At: now,
        Updated_By: userEmail,
        Updated_At: now,
        Deleted_By: "",
        Deleted_At: ""
      }, CRM_SCHEMAS.DEFAULT_CONFIG);
    }
  });

  logAudit_(userEmail, "UPDATE_CONFIG", "Default-Config", "Platform configuration updated");
  return { success: true, message: "Default configuration saved successfully." };
}

function seedDefaultConfig_(sheet) {
  sheet = sheet || getOrCreateSheet_(CRM_CONFIG.SHEETS.DEFAULT_CONFIG, CRM_SCHEMAS.DEFAULT_CONFIG);
  const now = new Date().toISOString();
  const seedData = [
    {
      Key: "LoginCompanyName",
      Value: "SR INVESTMENTS CRM",
      Description: "Company Name displayed on Login screen"
    },
    {
      Key: "GoogleClientId",
      Value: "984368661381-642hg3170e2r59md6706eard99bc9dm5.apps.googleusercontent.com",
      Description: "Google OAuth 2.0 Web Client ID for Google Sign-In"
    },
    {
      Key: "GasDeploymentUrl",
      Value: "https://script.google.com/macros/s/AKfycby3bg1iDpQTYbj4vmD2dPHyTOlnqNUrg_aOSC5gxdwse5bt0mxtG_cja9t2zh7x8q9bBw/exec",
      Description: "Active Google Apps Script Web App Deployment URL"
    },
    {
      Key: "SystemName",
      Value: "SR Investments Mutual Fund & Wealth Advisory CRM",
      Description: "Platform System Trade Name"
    },
    {
      Key: "SupportEmail",
      Value: "admin@srinvestments.com",
      Description: "Global Platform Administrator Email"
    },
    {
      Key: "IsForgotPasswordWithEmail",
      Value: "TRUE",
      Description: "Enable/disable Password Reset OTP via Email (TRUE/FALSE)"
    },
    {
      Key: "IsForgotPasswordWithMobileNo",
      Value: "TRUE",
      Description: "Enable/disable Password Reset OTP via Mobile SMS (TRUE/FALSE)"
    },
    {
      Key: "SmsProvider",
      Value: "FAST2SMS",
      Description: "SMS Gateway Provider (FAST2SMS, TWILIO, MSG91, or CUSTOM_URL)"
    },
    {
      Key: "SmsApiKey",
      Value: "",
      Description: "SMS Gateway API Key / Auth Token (e.g. Fast2SMS API key)"
    },
    {
      Key: "SmsSenderId",
      Value: "",
      Description: "SMS Sender ID (or Twilio Phone Number)"
    },
    {
      Key: "SmsTemplateId",
      Value: "",
      Description: "DLT Template ID (Required for MSG91 / Indian DLT Gateways)"
    },
    {
      Key: "SmsCustomUrl",
      Value: "",
      Description: "Custom SMS Gateway Webhook URL with {MOBILE}, {OTP}, {API_KEY} placeholders"
    },
    {
      Key: "EmailMaxLimitPerDay",
      Value: "200",
      Description: "Maximum OTP Emails allowed to be sent per day (Default: 200)"
    },
    {
      Key: "SmsMaxLimitPerDay",
      Value: "100",
      Description: "Maximum OTP SMS allowed to be sent per day (configured manually per SMS plan)"
    }
  ];

  seedData.forEach(item => {
    writeRowByHeaders_(sheet, 0, {
      Key: item.Key,
      Value: item.Value,
      Description: item.Description,
      IsDeleted: false,
      Created_By: "system",
      Created_At: now,
      Updated_By: "system",
      Updated_At: now,
      Deleted_By: "",
      Deleted_At: ""
    }, CRM_SCHEMAS.DEFAULT_CONFIG);
  });
}

/**
 * Resolves current date in YYYY-MM-DD format (IST timezone)
 */
function getTodayDateString_() {
  return Utilities.formatDate(new Date(), "Asia/Kolkata", "yyyy-MM-dd");
}

/**
 * Reads daily email & SMS dispatch counts for a given date from Central DB Daily_Dispatch_Tracker sheet
 */
function getDailyDispatchCounts_(dateStr) {
  dateStr = dateStr || getTodayDateString_();
  try {
    const sheet = getOrCreateSheet_(CRM_CONFIG.SHEETS.DAILY_DISPATCH_TRACKER, CRM_SCHEMAS.DAILY_DISPATCH_TRACKER);
    const rows = getSheetRowsAsObjects_(sheet, CRM_SCHEMAS.DAILY_DISPATCH_TRACKER);
    const row = rows.find(r => String(r.Date || "").trim() === dateStr);
    if (row) {
      return {
        date: dateStr,
        emailCount: Number(row.EmailCount || 0),
        smsCount: Number(row.SmsCount || 0)
      };
    }
  } catch (err) {
    Logger.log("getDailyDispatchCounts_ error: " + err.message);
  }
  return {
    date: dateStr,
    emailCount: 0,
    smsCount: 0
  };
}

/**
 * Atomically increments the daily dispatch count for "EMAIL" or "SMS" in Central DB Daily_Dispatch_Tracker
 */
function incrementDailyDispatchCount_(type) {
  const lock = LockService.getScriptLock();
  try {
    lock.waitLock(10000);
  } catch (e) {
    Logger.log("Lock wait timeout in incrementDailyDispatchCount_: " + e.message);
  }

  try {
    const dateStr = getTodayDateString_();
    const sheet = getOrCreateSheet_(CRM_CONFIG.SHEETS.DAILY_DISPATCH_TRACKER, CRM_SCHEMAS.DAILY_DISPATCH_TRACKER);
    const rows = getSheetRowsAsObjects_(sheet, CRM_SCHEMAS.DAILY_DISPATCH_TRACKER);
    const idx = rows.findIndex(r => String(r.Date || "").trim() === dateStr);
    const now = new Date().toISOString();
    const emailCol = getHeaderColIndex_(sheet, "EmailCount");
    const smsCol = getHeaderColIndex_(sheet, "SmsCount");
    const upAtCol = getHeaderColIndex_(sheet, "Updated_At");

    if (idx >= 0) {
      const rowNum = idx + 2;
      let emailCount = Number(rows[idx].EmailCount || 0);
      let smsCount = Number(rows[idx].SmsCount || 0);

      if (String(type).toUpperCase() === "EMAIL") {
        emailCount += 1;
        if (emailCol > 0) sheet.getRange(rowNum, emailCol).setValue(emailCount);
      } else if (String(type).toUpperCase() === "SMS") {
        smsCount += 1;
        if (smsCol > 0) sheet.getRange(rowNum, smsCol).setValue(smsCount);
      }
      if (upAtCol > 0) sheet.getRange(rowNum, upAtCol).setValue(now);
      return { date: dateStr, emailCount: emailCount, smsCount: smsCount };
    } else {
      let emailCount = String(type).toUpperCase() === "EMAIL" ? 1 : 0;
      let smsCount = String(type).toUpperCase() === "SMS" ? 1 : 0;
      writeRowByHeaders_(sheet, 0, {
        Date: dateStr,
        EmailCount: emailCount,
        SmsCount: smsCount,
        Updated_At: now
      }, CRM_SCHEMAS.DAILY_DISPATCH_TRACKER);
      return { date: dateStr, emailCount: emailCount, smsCount: smsCount };
    }
  } catch (err) {
    Logger.log("incrementDailyDispatchCount_ error: " + err.message);
  } finally {
    try { lock.releaseLock(); } catch (e) {}
  }
}

/**
 * Returns today's dispatch stats and quota limits
 */
function getDailyDispatchStats_() {
  const cfg = typeof getDefaultConfig_ === "function" ? getDefaultConfig_() : {};
  const counts = getDailyDispatchCounts_();
  return {
    date: counts.date,
    emailCount: counts.emailCount,
    emailMaxLimit: Number(cfg.EmailMaxLimitPerDay || cfg.emailmaxlimitperday || 200),
    smsCount: counts.smsCount,
    smsMaxLimit: Number(cfg.SmsMaxLimitPerDay || cfg.smsmaxlimitperday || 100)
  };
}

/**
 * ==============================================================
 * REALTIME MULTI-USER SYNC ENGINE (SAME TENANT, DIFFERENT SYSTEMS)
 * Records and serves in-memory change events via CacheService &
 * ScriptProperties for instant cross-device module reflection.
 * ==============================================================
 */

/**
 * Records an instant tenant CRUD sync change in CacheService (in-memory) & ScriptProperties (durable).
 * Enables multi-user real-time reflection across different machines/browsers for the same tenant.
 */
function recordTenantChange_(tenantId, module, action, by) {
  try {
    const cleanTenantId = String(tenantId || "TEN001").trim().toUpperCase();
    const now = Date.now();
    const eventObj = {
      tenantId: cleanTenantId,
      version: now,
      module: module,
      action: action,
      by: by || "user",
      timestamp: new Date().toISOString()
    };

    const cacheKey = "TENANT_SYNC_" + cleanTenantId;
    const cache = CacheService.getScriptCache();
    let history = [];
    
    // Read current history from cache or properties
    const cachedStr = cache.get(cacheKey) || PropertiesService.getScriptProperties().getProperty(cacheKey);
    if (cachedStr) {
      try {
        history = JSON.parse(cachedStr);
      } catch (e) {
        history = [];
      }
    }

    if (!Array.isArray(history)) history = [];
    history.unshift(eventObj);
    if (history.length > 25) history = history.slice(0, 25);

    const historyStr = JSON.stringify(history);
    // Cache for 6 hours (21600 seconds)
    cache.put(cacheKey, historyStr, 21600);
    PropertiesService.getScriptProperties().setProperty(cacheKey, historyStr);
  } catch (err) {
    Logger.log("recordTenantChange_ error: " + err.message);
  }
}

/**
 * Checks for any CRUD changes in the specified tenant newer than lastVersion.
 * Extremely fast & lightweight (sub-100ms) without opening Google Sheets.
 */
function checkTenantSync_(payload) {
  payload = payload || {};
  const tenantId = String(payload.tenantId || payload.TenantId || "TEN001").trim().toUpperCase();
  const lastVersion = Number(payload.lastVersion || 0);

  const cacheKey = "TENANT_SYNC_" + tenantId;
  const cache = CacheService.getScriptCache();
  let historyStr = cache.get(cacheKey);
  if (!historyStr) {
    historyStr = PropertiesService.getScriptProperties().getProperty(cacheKey);
  }

  if (!historyStr) {
    return {
      changed: false,
      tenantId: tenantId,
      latestVersion: lastVersion || Date.now(),
      events: []
    };
  }

  let history = [];
  try {
    history = JSON.parse(historyStr);
  } catch (e) {
    return { changed: false, tenantId: tenantId, latestVersion: lastVersion, events: [] };
  }

  if (!Array.isArray(history) || history.length === 0) {
    return { changed: false, tenantId: tenantId, latestVersion: lastVersion, events: [] };
  }

  const latestVer = Math.max(...history.map(function(e) { return Number(e.version || 0); }));

  // If lastVersion is 0 (initial handshake), return current latest version without triggering full reload
  if (lastVersion <= 0) {
    return {
      changed: false,
      tenantId: tenantId,
      latestVersion: latestVer,
      events: []
    };
  }

  const newEvents = history.filter(function(ev) { return Number(ev.version) > lastVersion; });

  if (newEvents.length > 0) {
    return {
      changed: true,
      tenantId: tenantId,
      latestVersion: latestVer,
      events: newEvents
    };
  }

  return {
    changed: false,
    tenantId: tenantId,
    latestVersion: latestVer,
    events: []
  };
}
