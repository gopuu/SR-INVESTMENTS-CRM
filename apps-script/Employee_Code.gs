/**
 * SR INVESTMENTS CRM - Employee / Staff Module (Blue Family Edition)
 * Features:
 * 1. Backend Auto-increment Employee Code (SR-EMP01, SR-EMP02...) - Non-editable from client
 * 2. Multi-Google ID support (GoogleEmails) for "Login with Google"
 * 3. Drive photo upload & safe deletion of old photo file
 */

function getEmployees_(filters) {
  const sheet = getOrCreateSheet_(CRM_CONFIG.SHEETS.EMPLOYEES, CRM_SCHEMAS.EMPLOYEES);
  let rows = getSheetRowsAsObjects_(sheet, CRM_SCHEMAS.EMPLOYEES);

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
  const id = cleanStr_(data.EmployeeId) || createId_("EMP");
  const rows = getSheetRowsAsObjects_(sheet, CRM_SCHEMAS.EMPLOYEES);

  const existingIndex = rows.findIndex(r => r.EmployeeId === id);
  const existingRecord = existingIndex >= 0 ? rows[existingIndex] : null;

  // Backend Autoincrement: If new staff, generate next SR-EMP sequence
  let code = "";
  if (existingRecord) {
    code = existingRecord.EmployeeCode;
  } else {
    code = calculateNextEmployeeCode_(rows);
  }

  let photoUrl = cleanStr_(data.PhotoUrl);
  let driveFileId = cleanStr_(data.DriveFileId);

  // If a new photo file was uploaded
  if (data.image && data.image.base64) {
    const oldFileId = existingRecord ? existingRecord.DriveFileId : null;
    const uploadRes = uploadDriveFile_(
      CRM_CONFIG.SUBFOLDERS.EMPLOYEES,
      code + "_" + (data.image.name || "photo.jpg"),
      data.image.mimeType,
      data.image.base64,
      oldFileId // Deletes previous photo from Drive!
    );
    photoUrl = uploadRes.viewUrl;
    driveFileId = uploadRes.fileId;
  }

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
    existingRecord ? (existingRecord.CreatedAt || now) : now,
    now
  ];

  if (existingIndex >= 0) {
    sheet.getRange(existingIndex + 2, 1, 1, CRM_SCHEMAS.EMPLOYEES.length).setValues([rowValues]);
    logAudit_("SYSTEM", "UPDATE_EMPLOYEE", "Updated staff: " + code + " (" + data.FullName + ")");
  } else {
    sheet.appendRow(rowValues);
    logAudit_("SYSTEM", "CREATE_EMPLOYEE", "Created staff: " + code + " (" + data.FullName + ")");
  }

  return { 
    employeeId: id, 
    employeeCode: code, 
    photoUrl: photoUrl, 
    message: "Staff member " + code + " saved successfully." 
  };
}

function deleteEmployee_(employeeId) {
  if (!employeeId) throw new Error("EmployeeId is required.");
  const sheet = getOrCreateSheet_(CRM_CONFIG.SHEETS.EMPLOYEES, CRM_SCHEMAS.EMPLOYEES);
  const rows = getSheetRowsAsObjects_(sheet, CRM_SCHEMAS.EMPLOYEES);
  const index = rows.findIndex(r => r.EmployeeId === employeeId);
  if (index === -1) throw new Error("Staff member not found.");

  const record = rows[index];
  if (record.DriveFileId) {
    deleteDriveFileSafely_(record.DriveFileId);
  }

  sheet.deleteRow(index + 2);
  logAudit_("SYSTEM", "DELETE_EMPLOYEE", "Deleted staff: " + record.EmployeeCode);
  return { success: true, message: "Staff member removed successfully." };
}

/**
 * Calculates next SR-EMP sequence number automatically from DB rows
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
