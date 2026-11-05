/**
 * SR INVESTMENTS CRM - Employee / Staff Module
 * Manages advisors, distributors, staff records & Drive photo uploads.
 * Includes automatic deletion of previous photos from Drive upon update/deletion.
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
      (e.Department && e.Department.toLowerCase().includes(q)) ||
      (e.Designation && e.Designation.toLowerCase().includes(q))
    );
  }

  return rows;
}

function saveEmployee_(data) {
  if (!data.FullName || !data.FullName.trim()) throw new Error("Staff Member Name is required.");
  if (!data.EmployeeCode || !data.EmployeeCode.trim()) throw new Error("Employee Code is required.");

  const sheet = getOrCreateSheet_(CRM_CONFIG.SHEETS.EMPLOYEES, CRM_SCHEMAS.EMPLOYEES);
  const now = new Date().toISOString();
  const id = cleanStr_(data.EmployeeId) || createId_("EMP");
  const code = cleanStr_(data.EmployeeCode);

  const rows = getSheetRowsAsObjects_(sheet, CRM_SCHEMAS.EMPLOYEES);
  
  // Duplicate employee code check
  const dup = rows.find(r => r.EmployeeCode.toLowerCase() === code.toLowerCase() && r.EmployeeId !== id);
  if (dup) throw new Error("Employee Code already exists: " + code);

  const existingIndex = rows.findIndex(r => r.EmployeeId === id);
  const existingRecord = existingIndex >= 0 ? rows[existingIndex] : null;

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
      oldFileId // Deletes previous file from Google Drive!
    );
    photoUrl = uploadRes.viewUrl;
    driveFileId = uploadRes.fileId;
  }

  const rowValues = [
    id,
    code,
    cleanStr_(data.FullName),
    cleanStr_(data.Email),
    cleanStr_(data.Mobile),
    cleanStr_(data.Department || "Wealth Management"),
    cleanStr_(data.Designation || "Relationship Manager"),
    cleanStr_(data.Role || "Staff"),
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
    message: "Staff member saved successfully." 
  };
}

function deleteEmployee_(employeeId) {
  if (!employeeId) throw new Error("EmployeeId is required.");
  const sheet = getOrCreateSheet_(CRM_CONFIG.SHEETS.EMPLOYEES, CRM_SCHEMAS.EMPLOYEES);
  const rows = getSheetRowsAsObjects_(sheet, CRM_SCHEMAS.EMPLOYEES);
  const index = rows.findIndex(r => r.EmployeeId === employeeId);
  if (index === -1) throw new Error("Staff member not found.");

  const record = rows[index];
  // Delete photo file from Drive if present
  if (record.DriveFileId) {
    deleteDriveFileSafely_(record.DriveFileId);
  }

  sheet.deleteRow(index + 2);
  logAudit_("SYSTEM", "DELETE_EMPLOYEE", "Deleted staff: " + record.EmployeeCode);
  return { success: true, message: "Staff member removed successfully." };
}

