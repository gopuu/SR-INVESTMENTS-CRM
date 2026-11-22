/**
 * SR INVESTMENTS CRM - Employee / Staff Module (Blue Family Edition)
 * Features:
 * 1. Backend Auto-increment Employee Code (SR-EMP01, SR-EMP02...) - Non-editable from client
 * 2. Multi-Google ID support (GoogleEmails) for "Login with Google"
 * 3. Drive photo upload & safe deletion of old photo file
 * 4. SEBI Audit Compliance: Soft-delete always, Created_By/At, Updated_By/At, Deleted_By/At
 */

function getEmployees_(filters) {
  const tenantId = filters ? (filters.tenantId || filters.activeTenantId) : null;
  const sheet = getOrCreateSheet_(CRM_CONFIG.SHEETS.EMPLOYEES, CRM_SCHEMAS.EMPLOYEES, tenantId);
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
      (e.Username && e.Username.toLowerCase().includes(q)) ||
      (e.Email && e.Email.toLowerCase().includes(q)) ||
      (e.AlternateEmails && e.AlternateEmails.toLowerCase().includes(q)) ||
      (e.GoogleEmails && e.GoogleEmails.toLowerCase().includes(q)) ||
      (e.Mobile && String(e.Mobile).toLowerCase().includes(q)) ||
      (e.AlternateMobile && String(e.AlternateMobile).toLowerCase().includes(q)) ||
      (e.Department && e.Department.toLowerCase().includes(q)) ||
      (e.Designation && e.Designation.toLowerCase().includes(q)) ||
      (e.AadharNo && String(e.AadharNo).toLowerCase().includes(q)) ||
      (e.EmergencyContact && String(e.EmergencyContact).toLowerCase().includes(q))
    );
  }

  return rows;
}

function saveEmployee_(data) {
  if (!data.FullName || !data.FullName.trim()) throw new Error("Staff Member Name is required.");
  if (!data.Email || !data.Email.trim()) throw new Error("Primary Email is compulsory (required for inner join & authentication).");
  if (!data.Mobile || !data.Mobile.trim()) throw new Error("Primary Mobile Number is compulsory.");

  const tenantId = data ? (data.tenantId || data.activeTenantId) : null;
  const sheet = getOrCreateSheet_(CRM_CONFIG.SHEETS.EMPLOYEES, CRM_SCHEMAS.EMPLOYEES, tenantId);
  const now = new Date().toISOString();
  const userEmail = data.userEmail || "admin@srinvestments.com";
  const id = cleanStr_(data.EmployeeId) || createId_("EMP");
  const rows = getSheetRowsAsObjects_(sheet, CRM_SCHEMAS.EMPLOYEES);

  const existingIndex = rows.findIndex(r => r.EmployeeId === id);
  const existingRecord = existingIndex >= 0 ? rows[existingIndex] : null;

  // 1. Gather all incoming emails (Primary + Google IDs / Alternate email list)
  const incomingEmails = [];
  const primaryEmailClean = cleanStr_(data.Email).toLowerCase();
  if (primaryEmailClean) incomingEmails.push(primaryEmailClean);
  const altEmailsVal = data.AlternateEmails || data.GoogleEmails;
  if (altEmailsVal) {
    cleanStr_(altEmailsVal).toLowerCase().split(",").forEach(s => {
      const em = s.trim();
      if (em && !incomingEmails.includes(em)) incomingEmails.push(em);
    });
  }

  // 2. Gather all incoming mobiles (Primary + Alternate Mobile numbers)
  const incomingMobiles = [];
  const primaryMobileClean = cleanStr_(data.Mobile).replace(/[\s\-\(\)\+]/g, "");
  if (primaryMobileClean) incomingMobiles.push(primaryMobileClean);
  if (data.AlternateMobile) {
    cleanStr_(data.AlternateMobile).split(",").forEach(s => {
      const mob = s.trim().replace(/[\s\-\(\)\+]/g, "");
      if (mob && !incomingMobiles.includes(mob)) incomingMobiles.push(mob);
    });
  }

  // 3. Strict Duplicate Validation against existing staff records (Primary & Alternate)
  rows.forEach((r, idx) => {
    if (r.EmployeeId === id || (existingIndex >= 0 && idx === existingIndex)) return;
    if (r.IsDeleted === true || r.IsDeleted === "TRUE" || r.IsDeleted === "true") return;

    // Check emails
    const existingRowEmails = [];
    if (r.Email) existingRowEmails.push(cleanStr_(r.Email).toLowerCase());
    const rowAltEmails = r.AlternateEmails || r.GoogleEmails;
    if (rowAltEmails) {
      cleanStr_(rowAltEmails).toLowerCase().split(",").forEach(s => {
        const em = s.trim();
        if (em && !existingRowEmails.includes(em)) existingRowEmails.push(em);
      });
    }

    incomingEmails.forEach(incEmail => {
      if (existingRowEmails.includes(incEmail)) {
        throw new Error("Email '" + incEmail + "' already exists for staff member: " + (r.FullName || r.EmployeeCode || r.EmployeeId) + " (" + (r.EmployeeCode || "") + ").");
      }
    });

    // Check mobiles
    const existingRowMobiles = [];
    if (r.Mobile) existingRowMobiles.push(cleanStr_(r.Mobile).replace(/[\s\-\(\)\+]/g, ""));
    if (r.AlternateMobile) {
      cleanStr_(r.AlternateMobile).split(",").forEach(s => {
        const mob = s.trim().replace(/[\s\-\(\)\+]/g, "");
        if (mob && !existingRowMobiles.includes(mob)) existingRowMobiles.push(mob);
      });
    }

    incomingMobiles.forEach(incMob => {
      if (existingRowMobiles.includes(incMob)) {
        throw new Error("Mobile number '" + incMob + "' already exists for staff member: " + (r.FullName || r.EmployeeCode || r.EmployeeId) + " (" + (r.EmployeeCode || "") + ").");
      }
    });
  });

  // Employee Code: Alphanumeric, defaults to initials of FullName if empty, unique
  let code = cleanStr_(data.EmployeeCode || "").trim().toUpperCase();
  if (!code) {
    if (existingRecord && existingRecord.EmployeeCode) {
      code = existingRecord.EmployeeCode;
    } else {
      code = generateInitialsCode_(data.FullName);
      if (!code) code = "EMP" + (rows.length + 1);
    }
  }

  // Strict Duplicate Employee Code check
  const dupCode = rows.find(r => {
    const isDel = r.IsDeleted === true || r.IsDeleted === "TRUE" || String(r.IsDeleted).toLowerCase() === "true";
    if (isDel) return false;
    if (String(r.EmployeeId || "").trim() === id) return false;
    return cleanStr_(r.EmployeeCode).toLowerCase() === code.toLowerCase();
  });
  if (dupCode) {
    throw new Error(`Duplicate Employee Code: '${code}' is already assigned to '${dupCode.FullName || dupCode.EmployeeCode}'. Employee Code must be unique.`);
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
      existingRecord ? existingRecord.DriveFileId : null, // Automatically trashes previous photo
      tenantId
    );
    photoUrl = uploadRes.viewUrl;
    driveFileId = uploadRes.fileId;
  }

  // Audit Fields
  const isNew = existingIndex < 0;
  const isAdmin = isCallerAdmin_(data);
  const approval = getApprovalSettings_(tenantId);
  const needsApproval = !isAdmin && ((isNew && approval.onAdd) || (!isNew && approval.onEdit));

  let status = cleanStr_(data.Status || "Active");
  let createdAppBy = existingRecord ? (existingRecord.Created_Approved_By || "") : "";
  let createdAppAt = existingRecord ? (existingRecord.Created_Approved_At || "") : "";
  let updatedAppBy = existingRecord ? (existingRecord.Updated_Approved_By || "") : "";
  let updatedAppAt = existingRecord ? (existingRecord.Updated_Approved_At || "") : "";
  let deletedAppBy = existingRecord ? (existingRecord.Deleted_Approved_By || "") : "";
  let deletedAppAt = existingRecord ? (existingRecord.Deleted_Approved_At || "") : "";
  let approvalHistory = existingRecord ? (existingRecord.Approval_History || "") : "";

  if (isNew) {
    if (needsApproval) {
      status = "Approval Pending";
      createdAppBy = "";
      createdAppAt = "";
      approvalHistory = appendApprovalHistory_("", {
        action: "CREATE",
        status: "Pending",
        submittedBy: userEmail,
        submittedAt: now
      });
    } else {
      status = "Active";
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
    // Sequential multiple edits supported
    if (needsApproval) {
      status = "Approval Pending";
      updatedAppBy = "";
      updatedAppAt = "";
      approvalHistory = appendApprovalHistory_(approvalHistory, {
        action: "EDIT",
        status: "Pending",
        submittedBy: userEmail,
        submittedAt: now
      });
    } else {
      status = "Active";
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

  const isDeleted = existingRecord ? Boolean(existingRecord.IsDeleted === true || existingRecord.IsDeleted === "TRUE") : false;
  const createdBy = existingRecord ? (existingRecord.Created_By || userEmail) : userEmail;
  const createdAt = existingRecord ? (existingRecord.Created_At || existingRecord.CreatedAt || now) : now;
  const updatedBy = userEmail;
  const updatedAt = now;
  const deletedBy = existingRecord ? (existingRecord.Deleted_By || "") : "";
  const deletedAt = existingRecord ? (existingRecord.Deleted_At || "") : "";

  const recordObj = {
    EmployeeId: id,
    EmployeeCode: code,
    FullName: cleanStr_(data.FullName),
    Username: cleanStr_(data.Username || code),
    Email: primaryEmailClean,
    AlternateEmails: cleanStr_(data.AlternateEmails || data.GoogleEmails),
    GoogleEmails: cleanStr_(data.AlternateEmails || data.GoogleEmails), // Cross-compat alias
    Mobile: cleanStr_(data.Mobile),
    AlternateMobile: cleanStr_(data.AlternateMobile),
    Department: cleanStr_(data.Department || "Wealth Management"),
    Designation: cleanStr_(data.Designation || "Relationship Manager"),
    Role: cleanStr_(data.Role || "Staff"),
    Password: hashPasswordSHA256_(cleanStr_(data.Password || "password123")),
    BirthDate: cleanStr_(data.BirthDate),
    JoiningDate: cleanStr_(data.JoiningDate),
    BloodGroup: cleanStr_(data.BloodGroup),
    EmergencyContact: cleanStr_(data.EmergencyContact),
    AadharNo: cleanStr_(data.AadharNo),
    Status: status,
    Address: cleanStr_(data.Address),
    City: cleanStr_(data.City),
    State: cleanStr_(data.State),
    PhotoUrl: photoUrl,
    DriveFileId: driveFileId,
    Documents: data.Documents || (existingRecord ? (existingRecord.Documents || "") : ""),
    IsDeleted: isDeleted,
    Created_By: createdBy,
    Created_At: createdAt,
    Updated_By: updatedBy,
    Updated_At: updatedAt,
    Created_Approved_By: createdAppBy,
    Created_Approved_At: createdAppAt,
    Updated_Approved_By: updatedAppBy,
    Updated_Approved_At: updatedAppAt,
    Deleted_Approved_By: deletedAppBy,
    Deleted_Approved_At: deletedAppAt,
    Approval_History: approvalHistory,
    Approved_By: updatedAppBy || createdAppBy || (isAdmin ? userEmail : "Auto"),
    Approved_At: updatedAppAt || createdAppAt || now,
    Deleted_By: deletedBy,
    Deleted_At: deletedAt
  };

  const rowIndex = existingIndex >= 0 ? existingIndex + 2 : 0;
  writeRowByHeaders_(sheet, rowIndex, recordObj, CRM_SCHEMAS.EMPLOYEES);

  // Automatic Dual Sync: Update Central User_Master & Tenant_User_Mapping seamlessly
  syncEmployeeToUserMaster_(recordObj, tenantId, userEmail);

  if (existingIndex >= 0) {
    logAudit_(userEmail, "UPDATE", "Staff", code, "Updated staff: " + code + " (" + data.FullName + ")" + (needsApproval ? " [Approval Pending]" : ""));
  } else {
    logAudit_(userEmail, "CREATE", "Staff", code, "Created staff: " + code + " (" + data.FullName + ")" + (needsApproval ? " [Approval Pending]" : ""));
  }

  return { 
    employeeId: id, 
    employeeCode: code, 
    photoUrl: photoUrl, 
    pendingApproval: needsApproval,
    message: needsApproval 
      ? "Staff member submitted for Admin approval (Status: Approval Pending)." 
      : "Staff member " + code + " saved successfully." 
  };
}

/**
 * Soft-Delete Employee: Marks IsDeleted=true with Deleted_By and Deleted_At
 */
function deleteEmployee_(payload) {
  const employeeId = typeof payload === "object" ? payload.employeeId : payload;
  const userEmail = (typeof payload === "object" && payload.userEmail) ? payload.userEmail : "admin@srinvestments.com";
  if (!employeeId) throw new Error("EmployeeId is required.");

  const tenantId = (payload && typeof payload === "object") ? (payload.tenantId || payload.activeTenantId) : null;
  const sheet = getOrCreateSheet_(CRM_CONFIG.SHEETS.EMPLOYEES, CRM_SCHEMAS.EMPLOYEES, tenantId);
  const rows = getSheetRowsAsObjects_(sheet, CRM_SCHEMAS.EMPLOYEES);
  const index = rows.findIndex(r => r.EmployeeId === employeeId);
  if (index === -1) throw new Error("Staff member not found.");

  const rec = rows[index];
  const now = new Date().toISOString();
  const rowNum = index + 2;

  const isAdmin = isCallerAdmin_(payload);
  const approval = getApprovalSettings_(tenantId);
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

    logAudit_(userEmail, "REQUEST_DELETE", "Staff", rec.EmployeeCode || employeeId, 
      "Delete request submitted for staff: " + (rec.FullName || "") + " (Pending Admin Approval)");
    return { success: true, message: "Staff deletion submitted. Admin approval pending.", pendingApproval: true };
  }

  const colIsDeleted = getHeaderColIndex_(sheet, "IsDeleted");
  const colDeletedBy = getHeaderColIndex_(sheet, "Deleted_By");
  const colDeletedAt = getHeaderColIndex_(sheet, "Deleted_At");
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

  if (colIsDeleted > 0) sheet.getRange(rowNum, colIsDeleted).setValue(true);
  if (colDeletedBy > 0) sheet.getRange(rowNum, colDeletedBy).setValue(userEmail);
  if (colDeletedAt > 0) sheet.getRange(rowNum, colDeletedAt).setValue(now);
  if (colDelAppBy > 0) sheet.getRange(rowNum, colDelAppBy).setValue(delApprovedBy);
  if (colDelAppAt > 0) sheet.getRange(rowNum, colDelAppAt).setValue(now);
  if (colHist > 0) sheet.getRange(rowNum, colHist).setValue(approvalHistory);

  // Sync deactivation to central Tenant_User_Mapping
  syncEmployeeDeleteToUserMapping_(rec.Email, tenantId, userEmail);

  logAudit_(userEmail, "DELETE", "Staff", rec.EmployeeCode || employeeId, 
    "Deleted staff member: " + (rec.FullName || "") + " (" + (rec.EmployeeCode || employeeId) + ")");

  return { success: true, message: "Staff member deleted successfully (retained in compliance audit archive)." };
}

/**
 * Restore Soft-Deleted Employee
 */
function restoreEmployee_(payload) {
  const employeeId = typeof payload === "object" ? payload.employeeId : payload;
  const userEmail = (typeof payload === "object" && payload.userEmail) ? payload.userEmail : "admin@srinvestments.com";
  if (!employeeId) throw new Error("EmployeeId is required.");

  const tenantId = (payload && typeof payload === "object") ? (payload.tenantId || payload.activeTenantId) : null;
  const sheet = getOrCreateSheet_(CRM_CONFIG.SHEETS.EMPLOYEES, CRM_SCHEMAS.EMPLOYEES, tenantId);
  const rows = getSheetRowsAsObjects_(sheet, CRM_SCHEMAS.EMPLOYEES);
  const index = rows.findIndex(r => r.EmployeeId === employeeId);
  if (index === -1) throw new Error("Staff member not found.");

  const rec = rows[index];
  const now = new Date().toISOString();
  const rowNum = index + 2;

  const colIsDeleted = getHeaderColIndex_(sheet, "IsDeleted");
  const colUpdatedBy = getHeaderColIndex_(sheet, "Updated_By");
  const colUpdatedAt = getHeaderColIndex_(sheet, "Updated_At");
  const colDeletedBy = getHeaderColIndex_(sheet, "Deleted_By");
  const colDeletedAt = getHeaderColIndex_(sheet, "Deleted_At");

  if (colIsDeleted > 0) sheet.getRange(rowNum, colIsDeleted).setValue(false);
  if (colUpdatedBy > 0) sheet.getRange(rowNum, colUpdatedBy).setValue(userEmail);
  if (colUpdatedAt > 0) sheet.getRange(rowNum, colUpdatedAt).setValue(now);
  if (colDeletedBy > 0) sheet.getRange(rowNum, colDeletedBy).setValue("");
  if (colDeletedAt > 0) sheet.getRange(rowNum, colDeletedAt).setValue("");

  logAudit_(userEmail, "RESTORE", "Staff", rec.EmployeeCode || employeeId, 
    "Restored staff member: " + (rec.FullName || "") + " (" + (rec.EmployeeCode || employeeId) + ")");

  return { success: true, message: "Staff member restored successfully." };
}

/**
 * Calculates next fallback sequence number automatically from DB rows
 */
function calculateNextEmployeeCode_(rows) {
  let maxNum = 0;
  (rows || []).forEach(r => {
    const raw = String(r.EmployeeCode || "").trim();
    const num = parseInt(raw, 10);
    if (!isNaN(num) && num > maxNum) {
      maxNum = num;
    } else {
      const match = raw.match(/\d+/g);
      if (match) {
        const last = parseInt(match[match.length - 1], 10);
        if (last > maxNum) maxNum = last;
      }
    }
  });
  const total = (rows || []).length;
  const nextNum = Math.max(maxNum, total) + 1;
  return String(nextNum);
}

/**
 * Dual-Sync: Keeps Central User_Master & Tenant_User_Mapping synchronized automatically
 * with tenant Employees table during CREATE/UPDATE
 */
function syncEmployeeToUserMaster_(employeeObj, tenantId, userEmail) {
  if (!employeeObj || !employeeObj.Email) return;
  try {
    const email = cleanStr_(employeeObj.Email).toLowerCase();
    const fullName = cleanStr_(employeeObj.FullName);
    const mobile = cleanStr_(employeeObj.Mobile);
    const alternateMobile = cleanStr_(employeeObj.AlternateMobile);
    const password = hashPasswordSHA256_(cleanStr_(employeeObj.Password || "password123"));
    const googleEmails = cleanStr_(employeeObj.AlternateEmails || employeeObj.GoogleEmails);
    const role = cleanStr_(employeeObj.Role || "Staff");
    const status = cleanStr_(employeeObj.Status || "Active");
    const now = new Date().toISOString();

    // 1. Sync Central User_Master (Identity & Credentials)
    const userSheet = getOrCreateSheet_(CRM_CONFIG.SHEETS.USER_MASTER, CRM_SCHEMAS.USER_MASTER);
    const userRows = getSheetRowsAsObjects_(userSheet, CRM_SCHEMAS.USER_MASTER);
    const userIndex = userRows.findIndex(u => u.Email && u.Email.toLowerCase() === email);

    let userId = "";
    if (userIndex >= 0) {
      userId = userRows[userIndex].UserId;
      const updatedUser = {
        FullName: fullName,
        Mobile: mobile,
        AlternateMobile: alternateMobile,
        GoogleEmails: googleEmails,
        Password: password,
        Status: status,
        Updated_By: userEmail,
        Updated_At: now
      };
      writeRowByHeaders_(userSheet, userIndex + 2, updatedUser, CRM_SCHEMAS.USER_MASTER);
    } else {
      userId = "USR_" + String(userRows.length + 1).padStart(3, '0');
      const newUser = {
        UserId: userId,
        Email: email,
        GoogleEmails: googleEmails,
        Password: password,
        FullName: fullName,
        Mobile: mobile,
        AlternateMobile: alternateMobile,
        IsSuperAdmin: false,
        Status: status,
        IsDeleted: false,
        Created_By: userEmail,
        Created_At: now,
        Updated_By: userEmail,
        Updated_At: now,
        Deleted_By: "",
        Deleted_At: ""
      };
      writeRowByHeaders_(userSheet, -1, newUser, CRM_SCHEMAS.USER_MASTER);
    }

    // 2. Sync Central Tenant_User_Mapping (Tenant Authorization)
    if (tenantId) {
      const mapSheet = getOrCreateSheet_(CRM_CONFIG.SHEETS.TENANT_USER_MAPPING, CRM_SCHEMAS.TENANT_USER_MAPPING);
      const mapRows = getSheetRowsAsObjects_(mapSheet, CRM_SCHEMAS.TENANT_USER_MAPPING);
      const cleanTid = String(tenantId).trim().toUpperCase();
      const mapIndex = mapRows.findIndex(m => 
        String(m.TenantId).trim().toUpperCase() === cleanTid &&
        (m.UserId === userId || (m.UserId && m.UserId.toLowerCase() === email))
      );

      if (mapIndex >= 0) {
        const updatedMap = {
          Role: role,
          Status: status,
          IsDeleted: employeeObj.IsDeleted === true,
          Updated_By: userEmail,
          Updated_At: now
        };
        writeRowByHeaders_(mapSheet, mapIndex + 2, updatedMap, CRM_SCHEMAS.TENANT_USER_MAPPING);
      } else {
        const newMap = {
          MappingId: "MAP_" + String(mapRows.length + 1).padStart(3, '0'),
          UserId: userId,
          TenantId: cleanTid,
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
        writeRowByHeaders_(mapSheet, -1, newMap, CRM_SCHEMAS.TENANT_USER_MAPPING);
      }
    }
  } catch (err) {
    Logger.log("syncEmployeeToUserMaster_ warning: " + err.message);
  }
}

/**
 * Dual-Sync: Deactivates access in Central Tenant_User_Mapping when soft-deleted in tenant Employees
 */
function syncEmployeeDeleteToUserMapping_(email, tenantId, userEmail) {
  if (!email || !tenantId) return;
  try {
    const mapSheet = getOrCreateSheet_(CRM_CONFIG.SHEETS.TENANT_USER_MAPPING, CRM_SCHEMAS.TENANT_USER_MAPPING);
    const mapRows = getSheetRowsAsObjects_(mapSheet, CRM_SCHEMAS.TENANT_USER_MAPPING);
    const cleanMail = String(email).trim().toLowerCase();
    const cleanTid = String(tenantId).trim().toUpperCase();
    const mapIndex = mapRows.findIndex(m =>
      String(m.TenantId).trim().toUpperCase() === cleanTid &&
      String(m.UserId).trim().toLowerCase() === cleanMail
    );
    if (mapIndex >= 0) {
      const now = new Date().toISOString();
      const rowNum = mapIndex + 2;
      const colStatus = getHeaderColIndex_(mapSheet, "Status");
      const colIsDeleted = getHeaderColIndex_(mapSheet, "IsDeleted");
      const colDeletedBy = getHeaderColIndex_(mapSheet, "Deleted_By");
      const colDeletedAt = getHeaderColIndex_(mapSheet, "Deleted_At");
      if (colStatus > 0) mapSheet.getRange(rowNum, colStatus).setValue("Inactive");
      if (colIsDeleted > 0) mapSheet.getRange(rowNum, colIsDeleted).setValue(true);
      if (colDeletedBy > 0) mapSheet.getRange(rowNum, colDeletedBy).setValue(userEmail);
      if (colDeletedAt > 0) mapSheet.getRange(rowNum, colDeletedAt).setValue(now);
    }
  } catch (err) {
    Logger.log("syncEmployeeDeleteToUserMapping_ warning: " + err.message);
  }
}
