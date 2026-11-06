/**
 * SR INVESTMENTS CRM - Employee / Staff Module (Blue Family Edition)
 * Features:
 * 1. Backend Auto-increment Employee Code (SR-EMP01, SR-EMP02...) - Non-editable from client
 * 2. Multi-Google ID support (GoogleEmails) for "Login with Google"
 * 3. Drive photo upload & safe deletion of old photo file
 * 4. SEBI Audit Compliance: Soft-delete always, Created_By/At, Updated_By/At, Deleted_By/At
 */

function getEmployees_(filters) {
  const sheet = getOrCreateSheet_(CRM_CONFIG.SHEETS.EMPLOYEES, CRM_SCHEMAS.EMPLOYEES);
  let rows = getSheetRowsAsObjects_(sheet, CRM_SCHEMAS.EMPLOYEES);

  // Soft-delete filter: Exclude deleted records unless explicitly requested
  const includeDeleted = filters && (filters.includeDeleted === true || filters.includeDeleted === "true");
  if (!includeDeleted) {
    rows = rows.filter(e => e.IsDeleted !== true && e.IsDeleted !== "TRUE" && e.IsDeleted !== "true");
  }

  if (filters && filters.search) {
    const q = String(filters.search).toLowerCase();
    rows = rows.filter(e =>
      (e.EmployeeCode && e.EmployeeCode.toLowerCase().includes(q)) ||
      (e.FullName && e.FullName.toLowerCase().includes(q)) ||
      (e.Email && e.Email.toLowerCase().includes(q)) ||
      (e.GoogleEmails && e.GoogleEmails.toLowerCase().includes(q)) ||
      (e.Department && e.Department.toLowerCase().includes(q)) ||
      (e.Designation && e.Designation.toLowerCase().includes(q))
    );
  }

  return rows;
}

function saveEmployee_(data) {
  if (!data.FullName || !data.FullName.trim()) throw new Error("Staff Member Name is required.");

  const sheet = getOrCreateSheet_(CRM_CONFIG.SHEETS.EMPLOYEES, CRM_SCHEMAS.EMPLOYEES);
  const now = new Date().toISOString();
  const userEmail = data.userEmail || "admin@srinvestments.com";
  const id = cleanStr_(data.EmployeeId) || createId_("EMP");
  const rows = getSheetRowsAsObjects_(sheet, CRM_SCHEMAS.EMPLOYEES);

  const existingIndex = rows.findIndex(r => r.EmployeeId === id);
  const existingRecord = existingIndex >= 0 ? rows[existingIndex] : null;

  // Backend Autoincrement: If new staff, generate next SR-EMP sequence (scans all rows including archived)
  let code = "";
  if (existingRecord) {
    code = existingRecord.EmployeeCode;
  } else {
    code = calculateNextEmployeeCode_(rows);
  }

  let photoUrl = cleanStr_(data.PhotoUrl);
  let driveFileId = cleanStr_(data.DriveFileId);

  // If a new photo file was uploaded
  if (data.photoBase64 && data.photoFileName) {
    const uploadRes = uploadDriveFile_(
      CRM_CONFIG.SUBFOLDERS.EMPLOYEES,
      code + "_" + data.photoFileName,
      data.photoMimeType || "image/jpeg",
      data.photoBase64,
      existingRecord ? existingRecord.DriveFileId : null // Automatically trashes previous photo
    );
    photoUrl = uploadRes.viewUrl;
    driveFileId = uploadRes.fileId;
  }

  // Audit Fields
  const isDeleted = existingRecord ? Boolean(existingRecord.IsDeleted === true || existingRecord.IsDeleted === "TRUE") : false;
  const createdBy = existingRecord ? (existingRecord.Created_By || userEmail) : userEmail;
  const createdAt = existingRecord ? (existingRecord.Created_At || existingRecord.CreatedAt || now) : now;
  const updatedBy = userEmail;
  const updatedAt = now;
  const deletedBy = existingRecord ? (existingRecord.Deleted_By || "") : "";
  const deletedAt = existingRecord ? (existingRecord.Deleted_At || "") : "";

  const rowValues = [
    id,
    code,
    cleanStr_(data.FullName),
    cleanStr_(data.Email),
    cleanStr_(data.GoogleEmails), // Multiple Google IDs
    cleanStr_(data.Mobile),
    cleanStr_(data.Department || "Wealth Management"),
    cleanStr_(data.Designation || "Relationship Manager"),
    cleanStr_(data.Role || "Staff"),
    cleanStr_(data.Password || "password123"),
    cleanStr_(data.JoiningDate),
    cleanStr_(data.Status || "Active"),
    cleanStr_(data.Address),
    cleanStr_(data.City),
    cleanStr_(data.State),
    photoUrl,
    driveFileId,
    isDeleted,
    createdBy,
    createdAt,
    updatedBy,
    updatedAt,
    deletedBy,
    deletedAt
  ];

  if (existingIndex >= 0) {
    sheet.getRange(existingIndex + 2, 1, 1, CRM_SCHEMAS.EMPLOYEES.length).setValues([rowValues]);
    logAudit_(userEmail, "UPDATE", "Staff", code, "Updated staff: " + code + " (" + data.FullName + ")");
  } else {
    sheet.appendRow(rowValues);
    logAudit_(userEmail, "CREATE", "Staff", code, "Created staff: " + code + " (" + data.FullName + ")");
  }

  return { 
    employeeId: id, 
    employeeCode: code, 
    photoUrl: photoUrl, 
    message: "Staff member " + code + " saved successfully." 
  };
}

/**
 * Soft-Delete Employee: Marks IsDeleted=true with Deleted_By and Deleted_At
 */
function deleteEmployee_(payload) {
  const employeeId = typeof payload === "object" ? payload.employeeId : payload;
  const userEmail = (typeof payload === "object" && payload.userEmail) ? payload.userEmail : "admin@srinvestments.com";
  if (!employeeId) throw new Error("EmployeeId is required.");

  const sheet = getOrCreateSheet_(CRM_CONFIG.SHEETS.EMPLOYEES, CRM_SCHEMAS.EMPLOYEES);
  const rows = getSheetRowsAsObjects_(sheet, CRM_SCHEMAS.EMPLOYEES);
  const index = rows.findIndex(r => r.EmployeeId === employeeId);
  if (index === -1) throw new Error("Staff member not found.");

  const rec = rows[index];
  const now = new Date().toISOString();
  const rowNum = index + 2;

  const colIsDeleted = CRM_SCHEMAS.EMPLOYEES.indexOf("IsDeleted") + 1;
  const colDeletedBy = CRM_SCHEMAS.EMPLOYEES.indexOf("Deleted_By") + 1;
  const colDeletedAt = CRM_SCHEMAS.EMPLOYEES.indexOf("Deleted_At") + 1;

  sheet.getRange(rowNum, colIsDeleted).setValue(true);
  sheet.getRange(rowNum, colDeletedBy).setValue(userEmail);
  sheet.getRange(rowNum, colDeletedAt).setValue(now);

  logAudit_(userEmail, "SOFT_DELETE", "Staff", rec.EmployeeCode || employeeId, 
    "Soft-deleted staff member: " + (rec.FullName || "") + " (" + (rec.EmployeeCode || employeeId) + ")");

  return { success: true, message: "Staff member soft-deleted successfully (retained in compliance audit archive)." };
}

/**
 * Restore Soft-Deleted Employee
 */
function restoreEmployee_(payload) {
  const employeeId = typeof payload === "object" ? payload.employeeId : payload;
  const userEmail = (typeof payload === "object" && payload.userEmail) ? payload.userEmail : "admin@srinvestments.com";
  if (!employeeId) throw new Error("EmployeeId is required.");

  const sheet = getOrCreateSheet_(CRM_CONFIG.SHEETS.EMPLOYEES, CRM_SCHEMAS.EMPLOYEES);
  const rows = getSheetRowsAsObjects_(sheet, CRM_SCHEMAS.EMPLOYEES);
  const index = rows.findIndex(r => r.EmployeeId === employeeId);
  if (index === -1) throw new Error("Staff member not found.");

  const rec = rows[index];
  const now = new Date().toISOString();
  const rowNum = index + 2;

  sheet.getRange(rowNum, CRM_SCHEMAS.EMPLOYEES.indexOf("IsDeleted") + 1).setValue(false);
  sheet.getRange(rowNum, CRM_SCHEMAS.EMPLOYEES.indexOf("Updated_By") + 1).setValue(userEmail);
  sheet.getRange(rowNum, CRM_SCHEMAS.EMPLOYEES.indexOf("Updated_At") + 1).setValue(now);
  sheet.getRange(rowNum, CRM_SCHEMAS.EMPLOYEES.indexOf("Deleted_By") + 1).setValue("");
  sheet.getRange(rowNum, CRM_SCHEMAS.EMPLOYEES.indexOf("Deleted_At") + 1).setValue("");

  logAudit_(userEmail, "RESTORE", "Staff", rec.EmployeeCode || employeeId, 
    "Restored staff member: " + (rec.FullName || "") + " (" + (rec.EmployeeCode || employeeId) + ")");

  return { success: true, message: "Staff member restored successfully." };
}

/**
 * Calculates next SR-EMP sequence number automatically from DB rows (scans all rows including archived)
 */
function calculateNextEmployeeCode_(rows) {
  let maxNum = 0;
  rows.forEach(r => {
    if (r.EmployeeCode && String(r.EmployeeCode).startsWith("SR-EMP")) {
      const numStr = String(r.EmployeeCode).replace("SR-EMP", "").trim();
      const num = parseInt(numStr, 10);
      if (!isNaN(num) && num > maxNum) {
        maxNum = num;
      }
    }
  });
  const nextNum = maxNum + 1;
  const padded = nextNum < 10 ? "0" + nextNum : String(nextNum);
  return "SR-EMP" + padded;
}
