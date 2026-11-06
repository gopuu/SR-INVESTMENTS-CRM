/**
 * SR INVESTMENTS CRM - Customer Module (Mutual Fund Investors)
 * Manages investor records, KYC verification, bank mandates, nominee & portfolio details.
 * Implements strict SEBI audit compliance: Soft-delete always, Created_By/At, Updated_By/At, Deleted_By/At.
 */

function getCustomers_(filters) {
  const sheet = getOrCreateSheet_(CRM_CONFIG.SHEETS.CUSTOMERS, CRM_SCHEMAS.CUSTOMERS);
  let rows = getSheetRowsAsObjects_(sheet, CRM_SCHEMAS.CUSTOMERS);

  // Soft-delete filter: Exclude deleted records unless explicitly requested
  const includeDeleted = filters && (filters.includeDeleted === true || filters.includeDeleted === "true");
  if (!includeDeleted) {
    rows = rows.filter(c => c.IsDeleted !== true && c.IsDeleted !== "TRUE" && c.IsDeleted !== "true");
  }

  if (filters && filters.search) {
    const q = String(filters.search).toLowerCase();
    rows = rows.filter(c => 
      (c.CustomerCode && c.CustomerCode.toLowerCase().includes(q)) ||
      (c.FullName && c.FullName.toLowerCase().includes(q)) ||
      (c.PanNumber && c.PanNumber.toLowerCase().includes(q)) ||
      (c.Email && c.Email.toLowerCase().includes(q)) ||
      (c.Mobile && c.Mobile.includes(q))
    );
  }

  if (filters && filters.kycStatus) {
    rows = rows.filter(c => c.KycStatus === filters.kycStatus);
  }

  return rows;
}

function saveCustomer_(data) {
  if (!data.FullName || !data.FullName.trim()) throw new Error("Customer Full Name is required.");
  if (!data.Mobile || !data.Mobile.trim()) throw new Error("Mobile Number is required.");
  
  if (data.PanNumber && !/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/i.test(data.PanNumber.trim())) {
    throw new Error("Invalid PAN format. Example: ABCDE1234F");
  }

  const sheet = getOrCreateSheet_(CRM_CONFIG.SHEETS.CUSTOMERS, CRM_SCHEMAS.CUSTOMERS);
  const now = new Date().toISOString();
  const userEmail = data.userEmail || "admin@srinvestments.com";
  const id = cleanStr_(data.CustomerId) || createId_("CUST");
  const code = cleanStr_(data.CustomerCode) || ("SR" + Math.floor(10000 + Math.random() * 90000));

  const rows = getSheetRowsAsObjects_(sheet, CRM_SCHEMAS.CUSTOMERS);
  const existingIndex = rows.findIndex(r => r.CustomerId === id);
  const existingRecord = existingIndex >= 0 ? rows[existingIndex] : null;

  // Audit Fields Management
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
    cleanStr_(data.Mobile),
    cleanStr_(data.PanNumber ? data.PanNumber.toUpperCase() : ""),
    cleanStr_(data.AadhaarLast4),
    cleanStr_(data.KycStatus || "Compliant"),
    cleanStr_(data.InvestorCategory || "Individual"),
    cleanStr_(data.DateOfBirth),
    cleanStr_(data.NomineeName),
    cleanStr_(data.NomineeRelation),
    cleanStr_(data.BankName),
    cleanStr_(data.AccountNumber),
    cleanStr_(data.IfscCode ? data.IfscCode.toUpperCase() : ""),
    cleanStr_(data.City),
    cleanStr_(data.State),
    cleanStr_(data.RiskProfile || "Moderate"),
    cleanStr_(data.Notes),
    isDeleted,
    createdBy,
    createdAt,
    updatedBy,
    updatedAt,
    deletedBy,
    deletedAt
  ];

  if (existingIndex >= 0) {
    sheet.getRange(existingIndex + 2, 1, 1, CRM_SCHEMAS.CUSTOMERS.length).setValues([rowValues]);
    logAudit_(userEmail, "UPDATE", "Customers", code, "Updated investor: " + code + " (" + data.FullName + ")");
  } else {
    sheet.appendRow(rowValues);
    logAudit_(userEmail, "CREATE", "Customers", code, "Created investor: " + code + " (" + data.FullName + ")");
  }

  return { customerId: id, customerCode: code, message: "Investor saved successfully." };
}

/**
 * Soft-Delete Customer: Never purges row, marks IsDeleted=true with Deleted_By and Deleted_At
 */
function deleteCustomer_(payload) {
  const customerId = typeof payload === "object" ? payload.customerId : payload;
  const userEmail = (typeof payload === "object" && payload.userEmail) ? payload.userEmail : "admin@srinvestments.com";
  if (!customerId) throw new Error("CustomerId is required.");

  const sheet = getOrCreateSheet_(CRM_CONFIG.SHEETS.CUSTOMERS, CRM_SCHEMAS.CUSTOMERS);
  const rows = getSheetRowsAsObjects_(sheet, CRM_SCHEMAS.CUSTOMERS);
  const index = rows.findIndex(r => r.CustomerId === customerId);
  if (index === -1) throw new Error("Investor record not found.");

  const rec = rows[index];
  const now = new Date().toISOString();
  const rowNum = index + 2;

  const colIsDeleted = CRM_SCHEMAS.CUSTOMERS.indexOf("IsDeleted") + 1;
  const colDeletedBy = CRM_SCHEMAS.CUSTOMERS.indexOf("Deleted_By") + 1;
  const colDeletedAt = CRM_SCHEMAS.CUSTOMERS.indexOf("Deleted_At") + 1;

  sheet.getRange(rowNum, colIsDeleted).setValue(true);
  sheet.getRange(rowNum, colDeletedBy).setValue(userEmail);
  sheet.getRange(rowNum, colDeletedAt).setValue(now);

  logAudit_(userEmail, "SOFT_DELETE", "Customers", rec.CustomerCode || customerId, 
    "Soft-deleted investor: " + (rec.FullName || "") + " (" + (rec.CustomerCode || customerId) + ")");

  return { success: true, message: "Investor soft-deleted successfully (preserved in compliance audit archive)." };
}

/**
 * Restore Soft-Deleted Customer
 */
function restoreCustomer_(payload) {
  const customerId = typeof payload === "object" ? payload.customerId : payload;
  const userEmail = (typeof payload === "object" && payload.userEmail) ? payload.userEmail : "admin@srinvestments.com";
  if (!customerId) throw new Error("CustomerId is required.");

  const sheet = getOrCreateSheet_(CRM_CONFIG.SHEETS.CUSTOMERS, CRM_SCHEMAS.CUSTOMERS);
  const rows = getSheetRowsAsObjects_(sheet, CRM_SCHEMAS.CUSTOMERS);
  const index = rows.findIndex(r => r.CustomerId === customerId);
  if (index === -1) throw new Error("Investor record not found.");

  const rec = rows[index];
  const now = new Date().toISOString();
  const rowNum = index + 2;

  sheet.getRange(rowNum, CRM_SCHEMAS.CUSTOMERS.indexOf("IsDeleted") + 1).setValue(false);
  sheet.getRange(rowNum, CRM_SCHEMAS.CUSTOMERS.indexOf("Updated_By") + 1).setValue(userEmail);
  sheet.getRange(rowNum, CRM_SCHEMAS.CUSTOMERS.indexOf("Updated_At") + 1).setValue(now);
  sheet.getRange(rowNum, CRM_SCHEMAS.CUSTOMERS.indexOf("Deleted_By") + 1).setValue("");
  sheet.getRange(rowNum, CRM_SCHEMAS.CUSTOMERS.indexOf("Deleted_At") + 1).setValue("");

  logAudit_(userEmail, "RESTORE", "Customers", rec.CustomerCode || customerId, 
    "Restored investor: " + (rec.FullName || "") + " (" + (rec.CustomerCode || customerId) + ")");

  return { success: true, message: "Investor restored successfully." };
}
