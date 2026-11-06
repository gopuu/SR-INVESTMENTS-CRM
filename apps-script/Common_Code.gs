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
    CAMPAIGNS: "EmailCampaigns",
    TASKS: "Tasks",
    TASK_CONFIG: "TaskStepConfig",
    TODOS: "PersonalToDos",
    NOTIFICATIONS: "Notifications"
  }
};

// Database Schema Definitions
const CRM_SCHEMAS = {
  USERS: [
    "UserId", "Name", "Email", "Password", "Role", "Status", "CreatedAt", "LastLogin",
    "IsDeleted", "Created_By", "Created_At", "Updated_By", "Updated_At", "Deleted_By", "Deleted_At"
  ],
  CUSTOMERS: [
    "CustomerId", "CustomerCode", "FullName", "Email", "Mobile", "PanNumber",
    "AadhaarLast4", "KycStatus", "InvestorCategory", "DateOfBirth", "NomineeName",
    "NomineeRelation", "BankName", "AccountNumber", "IfscCode", "City", "State",
    "RiskProfile", "Notes",
    "IsDeleted", "Created_By", "Created_At", "Updated_By", "Updated_At", "Deleted_By", "Deleted_At"
  ],
  EMPLOYEES: [
    "EmployeeId", "EmployeeCode", "FullName", "Email", "GoogleEmails", "Mobile",
    "Department", "Designation", "Role", "Password", "JoiningDate", "Status",
    "Address", "City", "State", "PhotoUrl", "DriveFileId",
    "IsDeleted", "Created_By", "Created_At", "Updated_By", "Updated_At", "Deleted_By", "Deleted_At"
  ],
  SETTINGS: [
    "Key", "Value", "Description",
    "IsDeleted", "Created_By", "Created_At", "Updated_By", "Updated_At", "Deleted_By", "Deleted_At"
  ],
  RIGHTS: [
    "Role", "Module", "CanView", "CanCreate", "CanEdit", "CanDelete",
    "IsDeleted", "Created_By", "Created_At", "Updated_By", "Updated_At", "Deleted_By", "Deleted_At"
  ],
  AUDIT: [
    "LogId", "Timestamp", "UserEmail", "Action", "Module", "RecordId", "Details"
  ],
  APP_TRACKER: [
    "Date", "Status", "Module", "Task", "Description / Updates"
  ],
  EMPLOYEE_EMAILS: [
    "Email", "Name", "Department", "Designation", "Status"
  ],
  CAMPAIGNS: [
    "CampaignId", "Timestamp", "Target", "RecipientCount", "Subject", "SenderEmail", "Status", "EstimatedCost",
    "IsDeleted", "Created_By", "Created_At", "Updated_By", "Updated_At", "Deleted_By", "Deleted_At"
  ],
  TASKS: [
    "TaskId", "Title", "Description", "StepIndex", "StepName", "Priority", "AssigneeEmail", "AssigneeName",
    "ReporterEmail", "ReporterName", "DueDate", "Tags", "CommentsJson", "HistoryJson",
    "IsDeleted", "Created_By", "Created_At", "Updated_By", "Updated_At", "Deleted_By", "Deleted_At"
  ],
  TASK_CONFIG: [
    "StepIndex", "StepName", "Updated_By", "Updated_At"
  ],
  TODOS: [
    "TodoId", "UserEmail", "Title", "Notes", "Priority", "DueDate", "IsCompleted", "Category",
    "IsDeleted", "Created_By", "Created_At", "Updated_By", "Updated_At", "Deleted_By", "Deleted_At"
  ],
  NOTIFICATIONS: [
    "NotifId", "Timestamp", "ActorEmail", "ActorName", "ActorRole", "IsSuperUser", "TargetAudience",
    "Action", "Module", "RecordId", "Title", "Message", "TargetRoute", "ReadByEmails"
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
 * Log action to AuditLogs sheet with full CRUD trail
 */
function logAudit_(userEmail, action, moduleOrDetails, recordId, details) {
  try {
    let mod = "General";
    let recId = "";
    let det = "";

    if (details !== undefined) {
      mod = moduleOrDetails || "General";
      recId = recordId || "";
      det = details || "";
    } else if (recordId !== undefined) {
      mod = moduleOrDetails || "General";
      det = recordId || "";
    } else {
      det = moduleOrDetails || "";
    }

    const sheet = getOrCreateSheet_(CRM_CONFIG.SHEETS.AUDIT, CRM_SCHEMAS.AUDIT);
    sheet.appendRow([
      createId_("LOG"),
      new Date().toISOString(),
      userEmail || "System",
      action || "INFO",
      mod,
      recId,
      det
    ]);
  } catch (e) {
    Logger.log("Audit log failed: " + e.message);
  }
}

/**
 * Returns latest audit logs for SEBI compliance review
 */
function getAuditLogs_(filters) {
  const sheet = getOrCreateSheet_(CRM_CONFIG.SHEETS.AUDIT, CRM_SCHEMAS.AUDIT);
  let rows = getSheetRowsAsObjects_(sheet, CRM_SCHEMAS.AUDIT);
  
  if (filters && filters.module) {
    rows = rows.filter(r => r.Module === filters.module);
  }
  if (filters && filters.search) {
    const q = String(filters.search).toLowerCase();
    rows = rows.filter(r => 
      (r.Action && r.Action.toLowerCase().includes(q)) ||
      (r.UserEmail && r.UserEmail.toLowerCase().includes(q)) ||
      (r.RecordId && r.RecordId.toLowerCase().includes(q)) ||
      (r.Details && r.Details.toLowerCase().includes(q))
    );
  }
  
  return rows.reverse();
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

  // Ensure Roles Rights includes BulkMail, DriveBackup, Tasks, and ToDos
  const rightsSheet = getOrCreateSheet_(CRM_CONFIG.SHEETS.RIGHTS, CRM_SCHEMAS.RIGHTS);
  if (rightsSheet.getLastRow() <= 1) {
    const defaultRights = [
      ["Admin", "Dashboard", true, true, true, true],
      ["Admin", "Customers", true, true, true, true],
      ["Admin", "Staff", true, true, true, true],
      ["Admin", "Tasks", true, true, true, true],
      ["Admin", "ToDo", true, true, true, true],
      ["Admin", "BulkMail", true, true, true, true],
      ["Admin", "Settings", true, true, true, true],
      ["Admin", "DriveBackup", true, true, true, true],
      ["Relationship Manager", "Dashboard", true, false, false, false],
      ["Relationship Manager", "Customers", true, true, true, false],
      ["Relationship Manager", "Staff", true, false, false, false],
      ["Relationship Manager", "Tasks", true, true, true, false],
      ["Relationship Manager", "ToDo", true, true, true, true],
      ["Relationship Manager", "BulkMail", true, true, true, false],
      ["Relationship Manager", "Settings", false, false, false, false],
      ["Relationship Manager", "DriveBackup", false, false, false, false],
      ["Backoffice Staff", "Dashboard", true, false, false, false],
      ["Backoffice Staff", "Customers", true, true, true, false],
      ["Backoffice Staff", "Staff", false, false, false, false],
      ["Backoffice Staff", "Tasks", true, true, true, false],
      ["Backoffice Staff", "ToDo", true, true, true, true],
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

/**
 * ==========================================
 * TASK TRACKER (JIRA-STYLE KANBAN) BACKEND
 * ==========================================
 */

const DEFAULT_TASK_STEPS = [
  { index: 1, name: "Step 1: NEW" },
  { index: 2, name: "Step 2: IN PROGRESS" },
  { index: 3, name: "Step 3: REVIEW / PENDING" },
  { index: 4, name: "Step 4: VERIFICATION" },
  { index: 5, name: "Step 5: COMPLETED" }
];

function getTaskStepConfig_() {
  const sheet = getOrCreateSheet_(CRM_CONFIG.SHEETS.TASK_CONFIG, CRM_SCHEMAS.TASK_CONFIG);
  const rows = getSheetRowsAsObjects_(sheet, CRM_SCHEMAS.TASK_CONFIG);
  if (!rows || rows.length < 5) {
    return DEFAULT_TASK_STEPS;
  }
  return rows.map(r => ({
    index: Number(r.StepIndex),
    name: String(r.StepName || `Step ${r.StepIndex}`)
  }));
}

function saveTaskStepConfig_(steps, userEmail) {
  if (!steps || !steps.length) return { success: false };
  const sheet = getOrCreateSheet_(CRM_CONFIG.SHEETS.TASK_CONFIG, CRM_SCHEMAS.TASK_CONFIG);
  sheet.clearContents();
  sheet.getRange(1, 1, 1, CRM_SCHEMAS.TASK_CONFIG.length).setValues([CRM_SCHEMAS.TASK_CONFIG]);
  sheet.getRange(1, 1, 1, CRM_SCHEMAS.TASK_CONFIG.length)
    .setFontWeight("bold")
    .setBackground("#1e40af")
    .setFontColor("#ffffff");

  const now = new Date().toISOString();
  const values = steps.map((s, idx) => [idx + 1, s.name || `Step ${idx + 1}`, userEmail || "admin", now]);
  sheet.getRange(2, 1, values.length, CRM_SCHEMAS.TASK_CONFIG.length).setValues(values);
  logAudit_(userEmail || "admin", "UPDATE", "TaskTracker", "CONFIG", "Updated JIRA 5-step status workflow names");
  return { success: true, steps: steps };
}

function getTasks_(filter) {
  filter = filter || {};
  const sheet = getOrCreateSheet_(CRM_CONFIG.SHEETS.TASKS, CRM_SCHEMAS.TASKS);
  let rows = getSheetRowsAsObjects_(sheet, CRM_SCHEMAS.TASKS);

  if (!filter.includeDeleted) {
    rows = rows.filter(r => !r.IsDeleted || r.IsDeleted === "false" || r.IsDeleted === false);
  }

  if (filter.assignee) {
    const q = filter.assignee.toLowerCase();
    rows = rows.filter(r => (r.AssigneeEmail && r.AssigneeEmail.toLowerCase() === q) || (r.AssigneeName && r.AssigneeName.toLowerCase().includes(q)));
  }

  return rows;
}

function saveTask_(payload) {
  const sheet = getOrCreateSheet_(CRM_CONFIG.SHEETS.TASKS, CRM_SCHEMAS.TASKS);
  const now = new Date().toISOString();
  const userEmail = payload.userEmail || payload.ReporterEmail || "admin@srinvestments.com";
  const id = payload.TaskId || ("TSK-" + Math.floor(100 + Math.random() * 900));

  let rowIndex = findRowIndexById_(sheet, id);
  let commentsJson = typeof payload.CommentsJson === "string" ? payload.CommentsJson : JSON.stringify(payload.Comments || []);
  let historyJson = typeof payload.HistoryJson === "string" ? payload.HistoryJson : JSON.stringify(payload.History || [
    { timestamp: now, author: payload.ReporterName || userEmail, action: "Task created" }
  ]);

  if (rowIndex > 0) {
    // Update
    const rowValues = [
      id,
      payload.Title || "",
      payload.Description || "",
      payload.StepIndex || 1,
      payload.StepName || "Step 1: NEW",
      payload.Priority || "Medium",
      payload.AssigneeEmail || "",
      payload.AssigneeName || "",
      payload.ReporterEmail || userEmail,
      payload.ReporterName || "",
      payload.DueDate || "",
      payload.Tags || "",
      commentsJson,
      historyJson,
      payload.IsDeleted ? true : false,
      payload.Created_By || userEmail,
      payload.Created_At || now,
      userEmail,
      now,
      payload.Deleted_By || "",
      payload.Deleted_At || ""
    ];
    sheet.getRange(rowIndex, 1, 1, CRM_SCHEMAS.TASKS.length).setValues([rowValues]);
    logAudit_(userEmail, "UPDATE", "TaskTracker", id, `Updated task: ${payload.Title} (${id})`);
  } else {
    // Create
    const rowValues = [
      id,
      payload.Title || "",
      payload.Description || "",
      payload.StepIndex || 1,
      payload.StepName || "Step 1: NEW",
      payload.Priority || "Medium",
      payload.AssigneeEmail || "",
      payload.AssigneeName || "",
      payload.ReporterEmail || userEmail,
      payload.ReporterName || "",
      payload.DueDate || "",
      payload.Tags || "",
      commentsJson,
      historyJson,
      false,
      userEmail,
      now,
      userEmail,
      now,
      "",
      ""
    ];
    sheet.appendRow(rowValues);
    logAudit_(userEmail, "CREATE", "TaskTracker", id, `Created task: ${payload.Title} (${id})`);
  }

  return { success: true, taskId: id, message: "Task saved successfully." };
}

function updateTaskStatus_(payload) {
  const sheet = getOrCreateSheet_(CRM_CONFIG.SHEETS.TASKS, CRM_SCHEMAS.TASKS);
  const id = payload.taskId || payload.TaskId;
  const newStepIndex = Number(payload.stepIndex || payload.StepIndex);
  const newStepName = payload.stepName || payload.StepName;
  const userEmail = payload.userEmail || "admin@srinvestments.com";
  const userName = payload.userName || userEmail;
  const now = new Date().toISOString();

  const rowIndex = findRowIndexById_(sheet, id);
  if (rowIndex <= 0) throw new Error("Task not found: " + id);

  const currentValues = sheet.getRange(rowIndex, 1, 1, CRM_SCHEMAS.TASKS.length).getValues()[0];
  const oldStepName = currentValues[4];

  // Update step columns and trail
  let history = [];
  try {
    history = JSON.parse(currentValues[13] || "[]");
  } catch(e) { history = []; }

  history.push({
    timestamp: now,
    author: userName,
    action: `Moved from "${oldStepName}" to "${newStepName}"`
  });

  currentValues[3] = newStepIndex;
  currentValues[4] = newStepName;
  currentValues[13] = JSON.stringify(history);
  currentValues[17] = userEmail; // Updated_By
  currentValues[18] = now;       // Updated_At

  sheet.getRange(rowIndex, 1, 1, CRM_SCHEMAS.TASKS.length).setValues([currentValues]);
  logAudit_(userEmail, "STATUS_CHANGE", "TaskTracker", id, `Moved task ${id} from ${oldStepName} to ${newStepName}`);
  return { success: true, taskId: id, stepIndex: newStepIndex, stepName: newStepName };
}

function deleteTask_(payload) {
  const sheet = getOrCreateSheet_(CRM_CONFIG.SHEETS.TASKS, CRM_SCHEMAS.TASKS);
  const id = payload.taskId || payload.TaskId;
  const userEmail = payload.userEmail || "admin@srinvestments.com";
  const rowIndex = findRowIndexById_(sheet, id);
  if (rowIndex <= 0) throw new Error("Task not found: " + id);

  const now = new Date().toISOString();
  sheet.getRange(rowIndex, 15).setValue(true);      // IsDeleted
  sheet.getRange(rowIndex, 19).setValue(userEmail); // Deleted_By
  sheet.getRange(rowIndex, 20).setValue(now);       // Deleted_At

  logAudit_(userEmail, "SOFT_DELETE", "TaskTracker", id, `Soft-deleted task: ${id}`);
  return { success: true, message: "Task soft-deleted." };
}

/**
 * ==========================================
 * PERSONAL TODO LIST BACKEND
 * ==========================================
 */
function getToDos_(payload) {
  payload = payload || {};
  const userEmail = (payload.userEmail || "").trim().toLowerCase();
  const sheet = getOrCreateSheet_(CRM_CONFIG.SHEETS.TODOS, CRM_SCHEMAS.TODOS);
  let rows = getSheetRowsAsObjects_(sheet, CRM_SCHEMAS.TODOS);

  if (!payload.includeDeleted) {
    rows = rows.filter(r => !r.IsDeleted || r.IsDeleted === "false" || r.IsDeleted === false);
  }

  if (userEmail) {
    rows = rows.filter(r => String(r.UserEmail || "").trim().toLowerCase() === userEmail);
  }

  return rows;
}

function saveToDo_(payload) {
  const sheet = getOrCreateSheet_(CRM_CONFIG.SHEETS.TODOS, CRM_SCHEMAS.TODOS);
  const id = payload.TodoId || ("TODO_" + Date.now());
  const now = new Date().toISOString();
  const userEmail = payload.userEmail || payload.UserEmail || "admin@srinvestments.com";

  let rowIndex = findRowIndexById_(sheet, id);
  if (rowIndex > 0) {
    const rowValues = [
      id,
      userEmail,
      payload.Title || "",
      payload.Notes || "",
      payload.Priority || "Medium",
      payload.DueDate || "",
      payload.IsCompleted ? true : false,
      payload.Category || "General",
      payload.IsDeleted ? true : false,
      payload.Created_By || userEmail,
      payload.Created_At || now,
      userEmail,
      now,
      payload.Deleted_By || "",
      payload.Deleted_At || ""
    ];
    sheet.getRange(rowIndex, 1, 1, CRM_SCHEMAS.TODOS.length).setValues([rowValues]);
  } else {
    const rowValues = [
      id,
      userEmail,
      payload.Title || "",
      payload.Notes || "",
      payload.Priority || "Medium",
      payload.DueDate || "",
      false,
      payload.Category || "General",
      false,
      userEmail,
      now,
      userEmail,
      now,
      "",
      ""
    ];
    sheet.appendRow(rowValues);
  }

  return { success: true, todoId: id };
}

function deleteToDo_(payload) {
  const sheet = getOrCreateSheet_(CRM_CONFIG.SHEETS.TODOS, CRM_SCHEMAS.TODOS);
  const id = payload.todoId || payload.TodoId;
  const userEmail = payload.userEmail || "admin@srinvestments.com";
  const rowIndex = findRowIndexById_(sheet, id);
  if (rowIndex <= 0) return { success: true };

  const now = new Date().toISOString();
  sheet.getRange(rowIndex, 9).setValue(true);       // IsDeleted
  sheet.getRange(rowIndex, 13).setValue(userEmail); // Deleted_By
  sheet.getRange(rowIndex, 14).setValue(now);       // Deleted_At

  return { success: true };
}

/**
 * ==========================================
 * REALTIME NOTIFICATIONS BACKEND
 * ==========================================
 */
function getNotifications_(payload) {
  payload = payload || {};
  const userEmail = (payload.userEmail || "").trim().toLowerCase();
  const isSuperUser = Boolean(payload.isSuperUser);
  const role = payload.role || "Staff";
  const isAdmin = isSuperUser || role.toLowerCase() === "admin";

  const sheet = getOrCreateSheet_(CRM_CONFIG.SHEETS.NOTIFICATIONS, CRM_SCHEMAS.NOTIFICATIONS);
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
  const sheet = getOrCreateSheet_(CRM_CONFIG.SHEETS.NOTIFICATIONS, CRM_SCHEMAS.NOTIFICATIONS);
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
