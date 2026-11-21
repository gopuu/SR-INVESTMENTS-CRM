/**
 * SR INVESTMENTS CRM - Customer Module (Mutual Fund Investors)
 * Manages investor records, KYC verification, bank mandates, nominee & portfolio details.
 * Implements strict SEBI audit compliance: Soft-delete always, Created_By/At, Updated_By/At, Deleted_By/At.
 * Multi-Tenant Aware: Routes dynamically to tenant spreadsheet when tenantId is provided.
 */

/**
 * Retrieve all customers/investors with optional filtering
 */
function getCustomers_(filters) {
  filters = filters || {};
  const tenantId = (filters && typeof filters === "object") ? (filters.tenantId || filters.activeTenantId) : null;
  const sheet = getOrCreateSheet_(CRM_CONFIG.SHEETS.CUSTOMERS, CRM_SCHEMAS.CUSTOMERS, tenantId);
  let rows = getSheetRowsAsObjects_(sheet, CRM_SCHEMAS.CUSTOMERS);

  // Soft-delete filter: Exclude deleted records unless explicitly requested
  const includeDeleted = filters && (filters.includeDeleted === true || filters.includeDeleted === "true");
  if (!includeDeleted) {
    rows = rows.filter(c => c.IsDeleted !== true && c.IsDeleted !== "TRUE" && c.IsDeleted !== "true");
  }

  // Keyword Search
  if (filters && filters.search) {
    const q = String(filters.search).toLowerCase().trim();
    rows = rows.filter(c => 
      (c.CustomerCode && String(c.CustomerCode).toLowerCase().includes(q)) ||
      (c.FullName && String(c.FullName).toLowerCase().includes(q)) ||
      (c.PanNumber && String(c.PanNumber).toLowerCase().includes(q)) ||
      (c.Email && String(c.Email).toLowerCase().includes(q)) ||
      (c.Mobile && String(c.Mobile).includes(q)) ||
      (c.City && String(c.City).toLowerCase().includes(q))
    );
  }

  // KYC Status Filter
  if (filters && filters.kycStatus) {
    const kyc = String(filters.kycStatus).trim().toLowerCase();
    rows = rows.filter(c => String(c.KycStatus || "").toLowerCase() === kyc);
  }

  // Risk Profile Filter
  if (filters && filters.riskProfile) {
    const risk = String(filters.riskProfile).trim().toLowerCase();
    rows = rows.filter(c => String(c.RiskProfile || "").toLowerCase() === risk);
  }

  return rows;
}

/**
 * Get single customer by CustomerId or CustomerCode
 */
function getCustomerById_(customerId, tenantId) {
  if (!customerId) return null;
  const sheet = getOrCreateSheet_(CRM_CONFIG.SHEETS.CUSTOMERS, CRM_SCHEMAS.CUSTOMERS, tenantId);
  const rows = getSheetRowsAsObjects_(sheet, CRM_SCHEMAS.CUSTOMERS);
  const cleanId = String(customerId).trim().toLowerCase();
  
  return rows.find(c => 
    String(c.CustomerId || "").toLowerCase() === cleanId || 
    String(c.CustomerCode || "").toLowerCase() === cleanId
  ) || null;
}

/**
 * Create or Update Customer (Investor) Record
 */
function saveCustomer_(data) {
  data = data || {};
  if (!data.FullName || !String(data.FullName).trim()) {
    throw new Error("Customer Full Name is required.");
  }
  if (!data.Mobile || !String(data.Mobile).trim()) {
    throw new Error("Mobile Number is required.");
  }
  
  // PAN Number Format Validation (SEBI Standard: 5 uppercase letters, 4 digits, 1 uppercase letter)
  if (data.PanNumber && String(data.PanNumber).trim()) {
    const cleanPan = String(data.PanNumber).trim().toUpperCase();
    if (!/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(cleanPan)) {
      throw new Error("Invalid PAN format. Standard format: ABCDE1234F");
    }
  }

  const tenantId = (data && typeof data === "object") ? (data.tenantId || data.activeTenantId) : null;
  const sheet = getOrCreateSheet_(CRM_CONFIG.SHEETS.CUSTOMERS, CRM_SCHEMAS.CUSTOMERS, tenantId);
  const now = new Date().toISOString();
  const userEmail = data.userEmail || "admin@srinvestments.com";
  const id = cleanStr_(data.CustomerId) || createId_("CUST");
  const code = cleanStr_(data.CustomerCode) || ("SR" + Math.floor(10000 + Math.random() * 90000));

  const rows = getSheetRowsAsObjects_(sheet, CRM_SCHEMAS.CUSTOMERS);
  const existingIndex = rows.findIndex(r => String(r.CustomerId || "").trim() === id);
  const existingRecord = existingIndex >= 0 ? rows[existingIndex] : null;

  // Audit Fields Management
  const isDeleted = existingRecord 
    ? Boolean(existingRecord.IsDeleted === true || existingRecord.IsDeleted === "TRUE" || existingRecord.IsDeleted === "true") 
    : false;
  const createdBy = existingRecord ? (existingRecord.Created_By || userEmail) : userEmail;
  const createdAt = existingRecord ? (existingRecord.Created_At || existingRecord.CreatedAt || now) : now;
  const updatedBy = userEmail;
  const updatedAt = now;
  const deletedBy = existingRecord ? (existingRecord.Deleted_By || "") : "";
  const deletedAt = existingRecord ? (existingRecord.Deleted_At || "") : "";

  const recordObj = {
    CustomerId: id,
    CustomerCode: code,
    FullName: cleanStr_(data.FullName),
    Email: cleanStr_(data.Email),
    Mobile: cleanStr_(data.Mobile),
    PanNumber: cleanStr_(data.PanNumber ? data.PanNumber.toUpperCase() : ""),
    AadhaarLast4: cleanStr_(data.AadhaarLast4),
    KycStatus: cleanStr_(data.KycStatus || "Compliant"),
    InvestorCategory: cleanStr_(data.InvestorCategory || "Individual"),
    DateOfBirth: cleanStr_(data.DateOfBirth),
    NomineeName: cleanStr_(data.NomineeName),
    NomineeRelation: cleanStr_(data.NomineeRelation),
    BankName: cleanStr_(data.BankName),
    AccountNumber: cleanStr_(data.AccountNumber),
    IfscCode: cleanStr_(data.IfscCode ? data.IfscCode.toUpperCase() : ""),
    City: cleanStr_(data.City),
    State: cleanStr_(data.State),
    RiskProfile: cleanStr_(data.RiskProfile || "Moderate"),
    Notes: cleanStr_(data.Notes),
    IsDeleted: isDeleted,
    Created_By: createdBy,
    Created_At: createdAt,
    Updated_By: updatedBy,
    Updated_At: updatedAt,
    Deleted_By: deletedBy,
    Deleted_At: deletedAt
  };

  const rowIndex = existingIndex >= 0 ? existingIndex + 2 : 0;
  writeRowByHeaders_(sheet, rowIndex, recordObj, CRM_SCHEMAS.CUSTOMERS);

  if (existingIndex >= 0) {
    logAudit_(userEmail, "UPDATE", "Customers", code, "Updated investor: " + code + " (" + data.FullName + ")");
  } else {
    logAudit_(userEmail, "CREATE", "Customers", code, "Created investor: " + code + " (" + data.FullName + ")");
  }

  return { customerId: id, customerCode: code, message: "Investor saved successfully." };
}

/**
 * Soft-Delete Customer: Never purges row, marks IsDeleted=true with Deleted_By and Deleted_At
 */
function deleteCustomer_(payload) {
  payload = payload || {};
  const customerId = typeof payload === "object" ? (payload.customerId || payload.CustomerId) : payload;
  const userEmail = (typeof payload === "object" && payload.userEmail) ? payload.userEmail : "admin@srinvestments.com";
  if (!customerId) throw new Error("CustomerId is required.");

  const tenantId = (payload && typeof payload === "object") ? (payload.tenantId || payload.activeTenantId) : null;
  const sheet = getOrCreateSheet_(CRM_CONFIG.SHEETS.CUSTOMERS, CRM_SCHEMAS.CUSTOMERS, tenantId);
  const rows = getSheetRowsAsObjects_(sheet, CRM_SCHEMAS.CUSTOMERS);
  const index = rows.findIndex(r => String(r.CustomerId || "").trim() === String(customerId).trim());
  if (index === -1) throw new Error("Investor record not found.");

  const rec = rows[index];
  const now = new Date().toISOString();
  const rowNum = index + 2;

  const colIsDeleted = getHeaderColIndex_(sheet, "IsDeleted");
  const colDeletedBy = getHeaderColIndex_(sheet, "Deleted_By");
  const colDeletedAt = getHeaderColIndex_(sheet, "Deleted_At");

  if (colIsDeleted > 0) sheet.getRange(rowNum, colIsDeleted).setValue(true);
  if (colDeletedBy > 0) sheet.getRange(rowNum, colDeletedBy).setValue(userEmail);
  if (colDeletedAt > 0) sheet.getRange(rowNum, colDeletedAt).setValue(now);

  logAudit_(userEmail, "DELETE", "Customers", rec.CustomerCode || customerId, 
    "Deleted investor: " + (rec.FullName || "") + " (" + (rec.CustomerCode || customerId) + ")");

  return { success: true, message: "Investor deleted successfully (preserved in compliance audit archive)." };
}

/**
 * Restore Soft-Deleted Customer
 */
function restoreCustomer_(payload) {
  payload = payload || {};
  const customerId = typeof payload === "object" ? (payload.customerId || payload.CustomerId) : payload;
  const userEmail = (typeof payload === "object" && payload.userEmail) ? payload.userEmail : "admin@srinvestments.com";
  if (!customerId) throw new Error("CustomerId is required.");

  const tenantId = (payload && typeof payload === "object") ? (payload.tenantId || payload.activeTenantId) : null;
  const sheet = getOrCreateSheet_(CRM_CONFIG.SHEETS.CUSTOMERS, CRM_SCHEMAS.CUSTOMERS, tenantId);
  const rows = getSheetRowsAsObjects_(sheet, CRM_SCHEMAS.CUSTOMERS);
  const index = rows.findIndex(r => String(r.CustomerId || "").trim() === String(customerId).trim());
  if (index === -1) throw new Error("Investor record not found.");

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

  logAudit_(userEmail, "RESTORE", "Customers", rec.CustomerCode || customerId, 
    "Restored investor: " + (rec.FullName || "") + " (" + (rec.CustomerCode || customerId) + ")");

  return { success: true, message: "Investor restored successfully." };
}
