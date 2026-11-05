/**
 * SR INVESTMENTS CRM - Authentication, Settings & Dashboard Module
 * Handles login, password updates, company settings, RBAC rights, and dashboard metrics.
 */

function loginUser_(email, password) {
  if (!email || !password) throw new Error("Email and password are required.");
  
  const cleanEmail = String(email).trim().toLowerCase();
  const sheet = getOrCreateSheet_(CRM_CONFIG.SHEETS.USERS, CRM_SCHEMAS.USERS);
  const rows = getSheetRowsAsObjects_(sheet, CRM_SCHEMAS.USERS);

  const user = rows.find(u => String(u.Email).trim().toLowerCase() === cleanEmail);
  if (!user) throw new Error("Invalid email or password.");
  if (user.Status !== "Active") throw new Error("Your account has been deactivated. Contact Administrator.");
  
  // Verify password
  if (String(user.Password) !== String(password).trim()) {
    throw new Error("Invalid email or password.");
  }

  // Update LastLogin timestamp
  const rowIndex = rows.findIndex(u => u.UserId === user.UserId) + 2;
  const colIndex = CRM_SCHEMAS.USERS.indexOf("LastLogin") + 1;
  sheet.getRange(rowIndex, colIndex).setValue(new Date().toISOString());

  logAudit_(user.Email, "LOGIN", "Successful login for " + user.Email);

  // Fetch rights for user's role
  const rights = getRolePermissions_(user.Role);

  return {
    user: {
      userId: user.UserId,
      name: user.Name,
      email: user.Email,
      role: user.Role,
      status: user.Status,
      lastLogin: new Date().toISOString()
    },
    rights: rights,
    token: "SR_" + Utilities.getUuid()
  };
}

function updateUserProfile_(payload) {
  const userId = cleanStr_(payload.userId);
  if (!userId) throw new Error("UserId is required.");

  const sheet = getOrCreateSheet_(CRM_CONFIG.SHEETS.USERS, CRM_SCHEMAS.USERS);
  const rows = getSheetRowsAsObjects_(sheet, CRM_SCHEMAS.USERS);
  const index = rows.findIndex(u => u.UserId === userId);
  if (index === -1) throw new Error("User record not found.");

  const rowNum = index + 2;
  if (payload.name) {
    sheet.getRange(rowNum, CRM_SCHEMAS.USERS.indexOf("Name") + 1).setValue(payload.name.trim());
  }

  return { success: true, message: "Profile updated successfully." };
}

function changeUserPassword_(payload) {
  const { userId, oldPassword, newPassword } = payload;
  if (!userId || !oldPassword || !newPassword) throw new Error("All password fields are required.");
  if (newPassword.length < 6) throw new Error("New password must be at least 6 characters.");

  const sheet = getOrCreateSheet_(CRM_CONFIG.SHEETS.USERS, CRM_SCHEMAS.USERS);
  const rows = getSheetRowsAsObjects_(sheet, CRM_SCHEMAS.USERS);
  const index = rows.findIndex(u => u.UserId === userId);
  if (index === -1) throw new Error("User not found.");

  const user = rows[index];
  if (String(user.Password) !== String(oldPassword).trim()) {
    throw new Error("Incorrect current password.");
  }

  const rowNum = index + 2;
  sheet.getRange(rowNum, CRM_SCHEMAS.USERS.indexOf("Password") + 1).setValue(String(newPassword).trim());
  logAudit_(user.Email, "PASSWORD_CHANGE", "Password updated for " + user.Email);

  return { success: true, message: "Password updated successfully." };
}

function getDashboardMetrics_() {
  const custSheet = getOrCreateSheet_(CRM_CONFIG.SHEETS.CUSTOMERS, CRM_SCHEMAS.CUSTOMERS);
  const empSheet = getOrCreateSheet_(CRM_CONFIG.SHEETS.EMPLOYEES, CRM_SCHEMAS.EMPLOYEES);

  const customers = getSheetRowsAsObjects_(custSheet, CRM_SCHEMAS.CUSTOMERS);
  const employees = getSheetRowsAsObjects_(empSheet, CRM_SCHEMAS.EMPLOYEES);

  const kycCounts = {
    Compliant: 0,
    Pending: 0,
    Rejected: 0
  };

  const categoryCounts = {
    Individual: 0,
    HUF: 0,
    Corporate: 0,
    NRI: 0
  };

  customers.forEach(c => {
    const k = c.KycStatus || "Pending";
    kycCounts[k] = (kycCounts[k] || 0) + 1;

    const cat = c.InvestorCategory || "Individual";
    categoryCounts[cat] = (categoryCounts[cat] || 0) + 1;
  });

  const activeEmployees = employees.filter(e => e.Status === "Active").length;

  return {
    totalCustomers: customers.length,
    activeEmployees: activeEmployees,
    totalEmployees: employees.length,
    kycCompliantCount: kycCounts.Compliant || 0,
    kycPendingCount: kycCounts.Pending || 0,
    kycBreakdown: kycCounts,
    categoryBreakdown: categoryCounts,
    recentCustomers: customers.slice(-5).reverse()
  };
}

function getCompanySettings_() {
  const sheet = getOrCreateSheet_(CRM_CONFIG.SHEETS.SETTINGS, CRM_SCHEMAS.SETTINGS);
  const rows = getSheetRowsAsObjects_(sheet, CRM_SCHEMAS.SETTINGS);
  const settingsObj = {};
  rows.forEach(r => {
    settingsObj[r.Key] = r.Value;
  });
  return settingsObj;
}

function saveCompanySettings_(settings) {
  const sheet = getOrCreateSheet_(CRM_CONFIG.SHEETS.SETTINGS, CRM_SCHEMAS.SETTINGS);
  const now = new Date().toISOString();
  const rows = getSheetRowsAsObjects_(sheet, CRM_SCHEMAS.SETTINGS);

  Object.keys(settings).forEach(key => {
    const val = String(settings[key] ?? "");
    const index = rows.findIndex(r => r.Key === key);
    if (index >= 0) {
      sheet.getRange(index + 2, 2).setValue(val);
      sheet.getRange(index + 2, 4).setValue(now);
    } else {
      sheet.appendRow([key, val, "Company setting", now]);
    }
  });

  logAudit_("SYSTEM", "UPDATE_SETTINGS", "Company settings updated");
  return { success: true, message: "Company settings updated successfully." };
}

function getRolesRights_() {
  const sheet = getOrCreateSheet_(CRM_CONFIG.SHEETS.RIGHTS, CRM_SCHEMAS.RIGHTS);
  return getSheetRowsAsObjects_(sheet, CRM_SCHEMAS.RIGHTS);
}

function saveRolesRights_(rightsArray) {
  if (!Array.isArray(rightsArray)) throw new Error("Invalid rights format.");
  const sheet = getOrCreateSheet_(CRM_CONFIG.SHEETS.RIGHTS, CRM_SCHEMAS.RIGHTS);
  sheet.clearContents();
  sheet.getRange(1, 1, 1, CRM_SCHEMAS.RIGHTS.length).setValues([CRM_SCHEMAS.RIGHTS]);

  const rows = rightsArray.map(r => [
    r.Role,
    r.Module,
    r.CanView === true || r.CanView === "true" || r.CanView === 1 ? true : false,
    r.CanCreate === true || r.CanCreate === "true" || r.CanCreate === 1 ? true : false,
    r.CanEdit === true || r.CanEdit === "true" || r.CanEdit === 1 ? true : false,
    r.CanDelete === true || r.CanDelete === "true" || r.CanDelete === 1 ? true : false
  ]);

  if (rows.length > 0) {
    sheet.getRange(2, 1, rows.length, CRM_SCHEMAS.RIGHTS.length).setValues(rows);
  }

  logAudit_("SYSTEM", "UPDATE_RIGHTS", "Role permissions updated");
  return { success: true, message: "Permissions updated successfully." };
}

function getRolePermissions_(role) {
  try {
    const rights = getRolesRights_();
    return rights.filter(r => String(r.Role).toLowerCase() === String(role).toLowerCase());
  } catch (e) {
    return [];
  }
}

