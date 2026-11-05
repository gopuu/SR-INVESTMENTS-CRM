/**
 * SR Investments CRM - Google Apps Script backend/bridge.
 *
 * IMPORTANT:
 * 1. Set CONFIG.SPREADSHEET_ID.
 * 2. Deploy this script as a Web App.
 * 3. Execute as: Me.
 * 4. Access: Anyone (or your preferred access setting).
 *
 * The GitHub Pages frontend does NOT call doGet()/doPost() as a JSON API.
 * Instead, it embeds this HTML-service page and uses postMessage -> google.script.run.
 */

const CONFIG = {
  SPREADSHEET_ID: "PASTE_GOOGLE_SPREADSHEET_ID_HERE",
  EMPLOYEE_SHEET: "EmployeeMaster",
  DRIVE_ROOT_FOLDER_NAME: "SR Investments CRM"
};

const EMPLOYEE_HEADERS = [
  "EmployeeId",
  "EmployeeCode",
  "FirstName",
  "LastName",
  "Mobile",
  "Email",
  "Department",
  "Designation",
  "JoiningDate",
  "Status",
  "Address",
  "City",
  "State",
  "Pincode",
  "CreatedAt",
  "UpdatedAt"
];

function doGet(e) {
  // Bridge mode is the only UI served by Apps Script.
  // The visible CRM remains on GitHub Pages.
  return HtmlService.createHtmlOutputFromFile("Bridge")
    .setTitle("CRM Bridge")
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}

/**
 * Called by Bridge.html through google.script.run.
 */
function bridgeRequest(action, payload) {
  payload = payload || {};

  switch (action) {
    case "dashboard":
      return getDashboard_();

    case "employee_list":
      return {
        rows: getEmployees_()
      };

    case "employee_save":
      return saveEmployee_(payload);

    case "employee_delete":
      return deleteEmployee_(payload.EmployeeId);

    case "health":
      return { ok: true, timestamp: new Date().toISOString() };

    default:
      throw new Error("Unknown action: " + action);
  }
}

function getDashboard_() {
  return {
    employeeCount: getEmployees_().length
  };
}

function getEmployees_() {
  const sheet = getOrCreateEmployeeSheet_();
  const lastRow = sheet.getLastRow();

  if (lastRow <= 1) return [];

  const values = sheet.getRange(2, 1, lastRow - 1, EMPLOYEE_HEADERS.length).getDisplayValues();

  return values
    .filter(row => row.some(v => String(v).trim() !== ""))
    .map(rowToObject_);
}

function saveEmployee_(data) {
  validateEmployee_(data);

  const sheet = getOrCreateEmployeeSheet_();
  const now = new Date();

  const id = String(data.EmployeeId || "").trim() || createId_("EMP");
  const lastRow = sheet.getLastRow();

  let targetRow = -1;
  let createdAt = now;

  if (data.EmployeeId && lastRow > 1) {
    const ids = sheet.getRange(2, 1, lastRow - 1, 1).getDisplayValues().flat();
    const index = ids.findIndex(v => String(v) === id);
    if (index >= 0) {
      targetRow = index + 2;
      const existing = sheet.getRange(targetRow, 1, 1, EMPLOYEE_HEADERS.length).getValues()[0];
      createdAt = existing[14] || now;
    }
  }

  // Prevent duplicate employee code.
  const duplicate = findByEmployeeCode_(sheet, data.EmployeeCode, id);
  if (duplicate) {
    throw new Error("Employee Code already exists: " + data.EmployeeCode);
  }

  const row = [
    id,
    clean_(data.EmployeeCode),
    clean_(data.FirstName),
    clean_(data.LastName),
    clean_(data.Mobile),
    clean_(data.Email),
    clean_(data.Department),
    clean_(data.Designation),
    clean_(data.JoiningDate),
    clean_(data.Status || "Active"),
    clean_(data.Address),
    clean_(data.City),
    clean_(data.State),
    clean_(data.Pincode),
    createdAt,
    now
  ];

  if (targetRow > 0) {
    sheet.getRange(targetRow, 1, 1, row.length).setValues([row]);
  } else {
    sheet.appendRow(row);
  }

  return {
    success: true,
    EmployeeId: id
  };
}

function deleteEmployee_(employeeId) {
  employeeId = String(employeeId || "").trim();
  if (!employeeId) throw new Error("EmployeeId is required.");

  const sheet = getOrCreateEmployeeSheet_();
  const lastRow = sheet.getLastRow();
  if (lastRow <= 1) throw new Error("Employee not found.");

  const ids = sheet.getRange(2, 1, lastRow - 1, 1).getDisplayValues().flat();
  const index = ids.findIndex(v => String(v) === employeeId);

  if (index < 0) throw new Error("Employee not found.");

  sheet.deleteRow(index + 2);
  return { success: true };
}

function validateEmployee_(data) {
  if (!String(data.EmployeeCode || "").trim()) {
    throw new Error("Employee Code is required.");
  }
  if (!String(data.FirstName || "").trim()) {
    throw new Error("First Name is required.");
  }

  if (String(data.Email || "").trim()) {
    const email = String(data.Email).trim();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      throw new Error("Invalid email address.");
    }
  }
}

function getOrCreateEmployeeSheet_() {
  const ss = SpreadsheetApp.openById(CONFIG.SPREADSHEET_ID);
  let sheet = ss.getSheetByName(CONFIG.EMPLOYEE_SHEET);

  if (!sheet) {
    sheet = ss.insertSheet(CONFIG.EMPLOYEE_SHEET);
    sheet.getRange(1, 1, 1, EMPLOYEE_HEADERS.length).setValues([EMPLOYEE_HEADERS]);
    sheet.setFrozenRows(1);
    sheet.getRange(1, 1, 1, EMPLOYEE_HEADERS.length)
      .setFontWeight("bold")
      .setBackground("#315efb")
      .setFontColor("#ffffff");
    sheet.autoResizeColumns(1, EMPLOYEE_HEADERS.length);
  }

  return sheet;
}

function rowToObject_(row) {
  const obj = {};
  EMPLOYEE_HEADERS.forEach((header, i) => {
    obj[header] = row[i] ?? "";
  });
  return obj;
}

function findByEmployeeCode_(sheet, employeeCode, currentId) {
  const lastRow = sheet.getLastRow();
  if (lastRow <= 1) return false;

  const rows = sheet.getRange(2, 1, lastRow - 1, 2).getDisplayValues();
  const code = String(employeeCode).trim().toLowerCase();

  return rows.some(row =>
    String(row[1]).trim().toLowerCase() === code &&
    String(row[0]) !== String(currentId || "")
  );
}

function createId_(prefix) {
  return prefix + Utilities.formatDate(
    new Date(),
    Session.getScriptTimeZone() || "Asia/Kolkata",
    "yyyyMMddHHmmss"
  ) + Math.floor(Math.random() * 1000);
}

function clean_(value) {
  return String(value ?? "").trim();
}

/**
 * Creates/returns the Drive folder root for future document uploads.
 * Upload functionality is intentionally separated from V1 CRUD.
 */
function getDriveRootFolder_() {
  const folders = DriveApp.getFoldersByName(CONFIG.DRIVE_ROOT_FOLDER_NAME);
  if (folders.hasNext()) return folders.next();
  return DriveApp.createFolder(CONFIG.DRIVE_ROOT_FOLDER_NAME);
}

/**
 * Run once manually from Apps Script editor after setting SPREADSHEET_ID.
 * It initializes the database sheet and Drive root.
 */
function setupCRM() {
  getOrCreateEmployeeSheet_();
  getDriveRootFolder_();
  Logger.log("CRM setup complete.");
}
