/**
 * SR INVESTMENTS CRM - Customer Module (Mutual Fund Investors)
 * Manages 7-step investor onboarding: Basic, KYC, Address, System, Bank, Nominee, Documents.
 * Implements strict SEBI audit compliance: Soft-delete always, Created_By/At, Updated_By/At, Deleted_By/At.
 * Multi-Tenant Aware: Routes dynamically to tenant spreadsheet when tenantId is provided.
 * Stores Multi-Bank records in 'Customer_Bank' (Max 3, initially 1).
 * Stores Multi-Nominee records in 'Customer_Nominee' (Max 3, initially 1).
 * Stores Drafts in 'Customer_Draft' with soft-delete upon completion.
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
 * Get single customer by CustomerId or CustomerCode, including linked Bank and Nominee records
 */
function getCustomerById_(customerId, tenantId) {
  if (!customerId) return null;
  const sheet = getOrCreateSheet_(CRM_CONFIG.SHEETS.CUSTOMERS, CRM_SCHEMAS.CUSTOMERS, tenantId);
  const rows = getSheetRowsAsObjects_(sheet, CRM_SCHEMAS.CUSTOMERS);
  const cleanId = String(customerId).trim().toLowerCase();
  
  const customer = rows.find(c => 
    String(c.CustomerId || "").toLowerCase() === cleanId || 
    String(c.CustomerCode || "").toLowerCase() === cleanId
  );
  if (!customer) return null;

  const actualCustId = customer.CustomerId;

  // Fetch Banks
  let banks = [];
  try {
    const bankSheet = getOrCreateSheet_(CRM_CONFIG.SHEETS.CUSTOMER_BANK, CRM_SCHEMAS.CUSTOMER_BANK, tenantId);
    const bankRows = getSheetRowsAsObjects_(bankSheet, CRM_SCHEMAS.CUSTOMER_BANK);
    banks = bankRows.filter(b => 
      String(b.CustomerId || "").toLowerCase() === String(actualCustId).toLowerCase() &&
      b.IsDeleted !== true && b.IsDeleted !== "TRUE" && b.IsDeleted !== "true"
    );
  } catch (err) {
    Logger.log("Error loading banks for customer: " + err.message);
  }

  // Fetch Nominees
  let nominees = [];
  try {
    const nomSheet = getOrCreateSheet_(CRM_CONFIG.SHEETS.CUSTOMER_NOMINEE, CRM_SCHEMAS.CUSTOMER_NOMINEE, tenantId);
    const nomRows = getSheetRowsAsObjects_(nomSheet, CRM_SCHEMAS.CUSTOMER_NOMINEE);
    nominees = nomRows.filter(n => 
      String(n.CustomerId || "").toLowerCase() === String(actualCustId).toLowerCase() &&
      n.IsDeleted !== true && n.IsDeleted !== "TRUE" && n.IsDeleted !== "true"
    );
  } catch (err) {
    Logger.log("Error loading nominees for customer: " + err.message);
  }

  return {
    ...customer,
    banks: banks,
    nominees: nominees
  };
}

/**
 * Create or Update Customer (Investor) Record with Multi-Bank, Multi-Nominee, Documents & Draft cleanup
 */
function saveCustomer_(data) {
  data = data || {};
  
  // Calculate Full Name from parts if not provided
  let fullName = cleanStr_(data.FullName || "");
  if (!fullName && (data.FirstName || data.LastName)) {
    fullName = [data.FirstName, data.MiddleName, data.LastName].filter(Boolean).join(" ").trim();
  }
  if (!fullName) {
    throw new Error("Customer Full Name (First Name & Last Name) is required.");
  }
  data.FullName = fullName;

  if (!data.Mobile || !String(data.Mobile).trim()) {
    throw new Error("Mobile Number is required.");
  }
  
  // PAN Number Format Validation
  if (data.PanNumber && String(data.PanNumber).trim()) {
    const cleanPan = String(data.PanNumber).trim().toUpperCase();
    if (!/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(cleanPan)) {
      throw new Error("Invalid PAN format. Standard format: ABCDE1234F");
    }
    data.PanNumber = cleanPan;
  }

  const tenantId = (data && typeof data === "object") ? (data.tenantId || data.activeTenantId) : null;
  const sheet = getOrCreateSheet_(CRM_CONFIG.SHEETS.CUSTOMERS, CRM_SCHEMAS.CUSTOMERS, tenantId);
  const now = new Date().toISOString();
  const userEmail = data.userEmail || "admin@srinvestments.com";
  const id = cleanStr_(data.CustomerId) || createId_("CUST");
  const rows = getSheetRowsAsObjects_(sheet, CRM_SCHEMAS.CUSTOMERS);
  const existingIndex = rows.findIndex(r => String(r.CustomerId || "").trim() === id);
  const existingRecord = existingIndex >= 0 ? rows[existingIndex] : null;

  // Customer Code: Alphanumeric, defaults to SR Unique Id or initials
  let code = cleanStr_(data.CustomerCode || data.SR_UniqueId || "").trim().toUpperCase();
  if (!code) {
    if (existingRecord && existingRecord.CustomerCode) {
      code = existingRecord.CustomerCode;
    } else {
      code = generateInitialsCode_(fullName);
      if (!code) code = "CUST" + (rows.length + 1);
    }
  }

  // Strict Duplicate Customer Code check
  const dupCode = rows.find(r => {
    const isDel = r.IsDeleted === true || r.IsDeleted === "TRUE" || String(r.IsDeleted).toLowerCase() === "true";
    if (isDel) return false;
    if (String(r.CustomerId || "").trim() === id) return false;
    return cleanStr_(r.CustomerCode).toLowerCase() === code.toLowerCase();
  });
  if (dupCode) {
    throw new Error(`Duplicate Customer Code: '${code}' is already assigned to '${dupCode.FullName || dupCode.CustomerCode}'. Customer Code must be unique.`);
  }

  // Audit Fields Management
  const isNew = existingIndex < 0;
  const isAdmin = isCallerAdmin_(data);
  const approval = getApprovalSettings_(tenantId);

  let isDeletedVal = false;
  let createdByVal = userEmail;
  let createdAtVal = now;
  let updatedByVal = userEmail;
  let updatedAtVal = now;
  let deletedByVal = "";
  let deletedAtVal = "";

  let crAppBy = "";
  let crAppAt = "";
  let upAppBy = "";
  let upAppAt = "";
  let delAppBy = "";
  let delAppAt = "";
  let appHist = "";
  let appBy = "";
  let appAt = "";

  if (!isNew && existingRecord) {
    isDeletedVal = existingRecord.IsDeleted === true || existingRecord.IsDeleted === "TRUE" || String(existingRecord.IsDeleted).toLowerCase() === "true";
    createdByVal = existingRecord.Created_By || userEmail;
    createdAtVal = existingRecord.Created_At || now;
    deletedByVal = existingRecord.Deleted_By || "";
    deletedAtVal = existingRecord.Deleted_At || "";

    crAppBy = existingRecord.Created_Approved_By || "";
    crAppAt = existingRecord.Created_Approved_At || "";
    upAppBy = existingRecord.Updated_Approved_By || "";
    upAppAt = existingRecord.Updated_Approved_At || "";
    delAppBy = existingRecord.Deleted_Approved_By || "";
    delAppAt = existingRecord.Deleted_Approved_At || "";
    appHist = existingRecord.Approval_History || "";
    appBy = existingRecord.Approved_By || "";
    appAt = existingRecord.Approved_At || "";

    if (approval.requireCustomerApproval && !isAdmin) {
      upAppBy = "";
      upAppAt = "";
      appHist = appendApprovalHistory_(appHist, "UPDATE_REQUESTED", userEmail, now);
    } else {
      upAppBy = userEmail;
      upAppAt = now;
      appBy = userEmail;
      appAt = now;
      if (approval.requireCustomerApproval && isAdmin) {
        appHist = appendApprovalHistory_(appHist, "UPDATE_AUTO_APPROVED", userEmail, now);
      }
    }
  } else {
    if (approval.requireCustomerApproval && !isAdmin) {
      crAppBy = "";
      crAppAt = "";
      appHist = appendApprovalHistory_("", "CREATE_REQUESTED", userEmail, now);
    } else {
      crAppBy = userEmail;
      crAppAt = now;
      appBy = userEmail;
      appAt = now;
      if (approval.requireCustomerApproval && isAdmin) {
        appHist = appendApprovalHistory_("", "CREATE_AUTO_APPROVED", userEmail, now);
      }
    }
  }

  // Handle Document uploads (Base64 -> Google Drive)
  const docFields = [
    { key: "PanDoc", urlKey: "PanDocUrl", defaultPrefix: "PAN_" },
    { key: "AadharDoc", urlKey: "AadharDocUrl", defaultPrefix: "AADHAAR_" },
    { key: "BankStatementDoc", urlKey: "BankStatementDocUrl", defaultPrefix: "BANK_STMT_" },
    { key: "BankChequeDoc", urlKey: "BankChequeDocUrl", defaultPrefix: "CHEQUE_" },
    { key: "NomineeProofDoc", urlKey: "NomineeProofDocUrl", defaultPrefix: "NOMINEE_PROOF_" },
    { key: "SignDoc", urlKey: "SignDocUrl", defaultPrefix: "SIGN_" }
  ];

  docFields.forEach(df => {
    let rawFile = data[df.key];
    if (rawFile && typeof rawFile === "object" && rawFile.base64) {
      try {
        const uploaded = uploadDriveFile_(
          CRM_CONFIG.SUBFOLDERS.CUSTOMERS,
          rawFile.name || (df.defaultPrefix + code + ".jpg"),
          rawFile.mimeType || "image/jpeg",
          rawFile.base64,
          null,
          tenantId
        );
        data[df.urlKey] = uploaded.viewUrl;
      } catch (err) {
        Logger.log("Failed to upload " + df.key + ": " + err.message);
      }
    } else if (typeof rawFile === "string" && rawFile.startsWith("data:")) {
      try {
        const uploaded = uploadDriveFile_(
          CRM_CONFIG.SUBFOLDERS.CUSTOMERS,
          df.defaultPrefix + code + ".jpg",
          "image/jpeg",
          rawFile,
          null,
          tenantId
        );
        data[df.urlKey] = uploaded.viewUrl;
      } catch (err) {
        Logger.log("Failed to upload base64 string for " + df.key + ": " + err.message);
      }
    }
  });

  const aadhaarVal = cleanStr_(data.AadharNo || data.AadhaarLast4 || "");
  const aadhaarLast4 = aadhaarVal.length >= 4 ? aadhaarVal.slice(-4) : aadhaarVal;

  const record = {
    CustomerId: id,
    CustomerCode: code,
    Title: cleanStr_(data.Title || data.TitleId),
    FirstName: cleanStr_(data.FirstName),
    MiddleName: cleanStr_(data.MiddleName),
    LastName: cleanStr_(data.LastName),
    FullName: fullName,
    Gender: cleanStr_(data.Gender),
    DateOfBirth: cleanStr_(data.DateOfBirth || data.BirthDate || data.DOB),
    Occupation: cleanStr_(data.Occupation || data.OccupationId),
    AnnualIncome: cleanStr_(data.AnnualIncome || data.AnnualIncomeId),
    Mobile: cleanStr_(data.Mobile || data.MobileNo),
    Email: cleanStr_(data.Email || data.EmailId),
    PanNumber: cleanStr_(data.PanNumber || data.PAN),
    AadharNo: aadhaarVal,
    AadhaarLast4: aadhaarLast4,
    Address: cleanStr_(data.Address),
    Pincode: cleanStr_(data.Pincode),
    Area: cleanStr_(data.Area),
    City: cleanStr_(data.City),
    State: cleanStr_(data.State),
    BseUcc: cleanStr_(data.BseUcc || data.BSE_UCC),
    SkCustId: cleanStr_(data.SkCustId || data.SK_CustId),
    SkDpId: cleanStr_(data.SkDpId || data.SK_DPID),
    SkClientId: cleanStr_(data.SkClientId || data.SK_ClientId),
    PanDocUrl: cleanStr_(data.PanDocUrl || (existingRecord && existingRecord.PanDocUrl)),
    AadharDocUrl: cleanStr_(data.AadharDocUrl || (existingRecord && existingRecord.AadharDocUrl)),
    BankStatementDocUrl: cleanStr_(data.BankStatementDocUrl || (existingRecord && existingRecord.BankStatementDocUrl)),
    BankChequeDocUrl: cleanStr_(data.BankChequeDocUrl || (existingRecord && existingRecord.BankChequeDocUrl)),
    NomineeProofDocUrl: cleanStr_(data.NomineeProofDocUrl || (existingRecord && existingRecord.NomineeProofDocUrl)),
    SignDocUrl: cleanStr_(data.SignDocUrl || (existingRecord && existingRecord.SignDocUrl)),
    KycStatus: cleanStr_(data.KycStatus || (existingRecord && existingRecord.KycStatus) || "PENDING"),
    InvestorCategory: cleanStr_(data.InvestorCategory || "INDIVIDUAL"),
    RiskProfile: cleanStr_(data.RiskProfile || "MODERATE"),
    Notes: cleanStr_(data.Notes || ""),
    Status: cleanStr_(data.Status || "ACTIVE"),
    IsDeleted: isDeletedVal,
    Created_By: createdByVal,
    Created_At: createdAtVal,
    Updated_By: updatedByVal,
    Updated_At: updatedAtVal,
    Deleted_By: deletedByVal,
    Deleted_At: deletedAtVal,
    Created_Approved_By: crAppBy,
    Created_Approved_At: crAppAt,
    Updated_Approved_By: upAppBy,
    Updated_Approved_At: upAppAt,
    Deleted_Approved_By: delAppBy,
    Deleted_Approved_At: delAppAt,
    Approval_History: appHist,
    Approved_By: appBy,
    Approved_At: appAt
  };

  const targetRow = isNew ? -1 : (existingIndex + 2);
  writeRowByHeaders_(sheet, targetRow, record, CRM_SCHEMAS.CUSTOMERS);

  // ================= SAVE BANKS (Customer_Bank sheet, Max 3) =================
  let banksList = data.banks || data.Banks;
  if (typeof banksList === "string") {
    try { banksList = JSON.parse(banksList); } catch (e) { banksList = []; }
  }
  if (Array.isArray(banksList) && banksList.length > 0) {
    try {
      const bankSheet = getOrCreateSheet_(CRM_CONFIG.SHEETS.CUSTOMER_BANK, CRM_SCHEMAS.CUSTOMER_BANK, tenantId);
      const existingBanks = getSheetRowsAsObjects_(bankSheet, CRM_SCHEMAS.CUSTOMER_BANK);
      
      // Soft-delete previous banks for this customer
      existingBanks.forEach((eb, idx) => {
        if (String(eb.CustomerId).trim().toLowerCase() === String(id).trim().toLowerCase() && !eb.IsDeleted) {
          eb.IsDeleted = true;
          eb.Deleted_By = userEmail;
          eb.Deleted_At = now;
          writeRowByHeaders_(bankSheet, idx + 2, eb, CRM_SCHEMAS.CUSTOMER_BANK);
        }
      });

      // Insert up to 3 bank rows
      banksList.slice(0, 3).forEach((b, bIdx) => {
        if (!b || (!b.IfscCode && !b.IFSCCode && !b.AccountNumber)) return;
        const bankRecord = {
          BankId: cleanStr_(b.BankId || b.Id) || ("BNK_" + Date.now() + "_" + (bIdx + 1)),
          CustomerId: id,
          CustomerCode: code,
          BankIndex: bIdx + 1,
          IfscCode: cleanStr_(b.IfscCode || b.IFSCCode || b.IFSC).toUpperCase(),
          BankName: cleanStr_(b.BankName || b.bank_name),
          AccountNumber: cleanStr_(b.AccountNumber || b.AccountNo),
          AccountType: cleanStr_(b.AccountType || b.AccountTypeId || "Saving"),
          MicrCode: cleanStr_(b.MicrCode || b.MICRCode || b.MICR),
          IsPrimary: bIdx === 0,
          IsDeleted: false,
          Created_By: userEmail,
          Created_At: now,
          Updated_By: userEmail,
          Updated_At: now,
          Deleted_By: "",
          Deleted_At: ""
        };
        writeRowByHeaders_(bankSheet, -1, bankRecord, CRM_SCHEMAS.CUSTOMER_BANK);
      });
    } catch (err) {
      Logger.log("Error saving bank records: " + err.message);
    }
  }

  // ================= SAVE NOMINEES (Customer_Nominee sheet, Max 3) =================
  let nomineeList = data.nominees || data.Nominees;
  if (typeof nomineeList === "string") {
    try { nomineeList = JSON.parse(nomineeList); } catch (e) { nomineeList = []; }
  }
  if (Array.isArray(nomineeList) && nomineeList.length > 0) {
    try {
      const nomSheet = getOrCreateSheet_(CRM_CONFIG.SHEETS.CUSTOMER_NOMINEE, CRM_SCHEMAS.CUSTOMER_NOMINEE, tenantId);
      const existingNoms = getSheetRowsAsObjects_(nomSheet, CRM_SCHEMAS.CUSTOMER_NOMINEE);

      // Soft-delete previous nominees for this customer
      existingNoms.forEach((en, idx) => {
        if (String(en.CustomerId).trim().toLowerCase() === String(id).trim().toLowerCase() && !en.IsDeleted) {
          en.IsDeleted = true;
          en.Deleted_By = userEmail;
          en.Deleted_At = now;
          writeRowByHeaders_(nomSheet, idx + 2, en, CRM_SCHEMAS.CUSTOMER_NOMINEE);
        }
      });

      // Insert up to 3 nominee rows
      nomineeList.slice(0, 3).forEach((n, nIdx) => {
        if (!n || (!n.NomineeName && !n.GuardianName && !n.Name)) return;
        const nomRecord = {
          NomineeId: cleanStr_(n.NomineeId || n.Id) || ("NOM_" + Date.now() + "_" + (nIdx + 1)),
          CustomerId: id,
          CustomerCode: code,
          NomineeIndex: nIdx + 1,
          NomineeName: cleanStr_(n.NomineeName || n.GuardianName || n.Name),
          Relation: cleanStr_(n.Relation || n.RelationId),
          RelationOther: cleanStr_(n.RelationOther || ""),
          DateOfBirth: cleanStr_(n.DateOfBirth || n.DOB || n.Dob),
          Occupation: cleanStr_(n.Occupation || n.OccupationId),
          IdProofType: cleanStr_(n.IdProofType || n.ProofTypeId),
          DocumentNo: cleanStr_(n.DocumentNo || n.ProofNumber || n.DocNo),
          Mobile: cleanStr_(n.Mobile || n.MobileNo),
          Email: cleanStr_(n.Email || n.EmailId),
          Address: cleanStr_(n.Address),
          SharePercentage: cleanStr_(n.SharePercentage || n.Share || (nIdx === 0 ? "100" : "0")),
          IsDeleted: false,
          Created_By: userEmail,
          Created_At: now,
          Updated_By: userEmail,
          Updated_At: now,
          Deleted_By: "",
          Deleted_At: ""
        };
        writeRowByHeaders_(nomSheet, -1, nomRecord, CRM_SCHEMAS.CUSTOMER_NOMINEE);
      });
    } catch (err) {
      Logger.log("Error saving nominee records: " + err.message);
    }
  }

  // ================= SOFT-DELETE DRAFT (If completed from a draft) =================
  const draftKey = cleanStr_(data.draftKey || data.DraftKey || data.draftId || data.DraftId);
  if (draftKey) {
    try {
      deleteCustomerDraft_(draftKey, userEmail, tenantId);
    } catch (e) {
      Logger.log("Error soft-deleting draft: " + e.message);
    }
  }

  // Audit Log & Notification (safely handled so audit/notif errors never abort investor creation)
  try {
    logAudit_(userEmail, isNew ? "CREATE" : "UPDATE", "Customers", code,
      (isNew ? "Registered new investor: " : "Updated investor: ") + fullName + " (" + code + ")");
  } catch (e) {
    Logger.log("logAudit_ error: " + e.message);
  }

  try {
    sendNotification_({
      actorEmail: userEmail,
      title: isNew ? "New Investor Onboarded" : "Investor Record Updated",
      message: `${fullName} (${code}) ${isNew ? 'registered' : 'updated'} by ${userEmail}`,
      action: isNew ? "CREATE" : "UPDATE",
      module: "Customers",
      recordId: code,
      targetUserEmail: userEmail,
      targetRoute: "/customers",
      tenantId: tenantId
    });
  } catch (e) {
    Logger.log("sendNotification_ error: " + e.message);
  }

  return {
    status: "Success",
    success: true,
    customerId: id,
    customerCode: code,
    message: isNew ? "Investor registered successfully." : "Investor updated successfully."
  };
}

/**
 * Soft Delete Customer (Investor) Record and linked Bank & Nominee rows
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

  // Soft-delete linked banks
  try {
    const bankSheet = getOrCreateSheet_(CRM_CONFIG.SHEETS.CUSTOMER_BANK, CRM_SCHEMAS.CUSTOMER_BANK, tenantId);
    const bankRows = getSheetRowsAsObjects_(bankSheet, CRM_SCHEMAS.CUSTOMER_BANK);
    bankRows.forEach((b, bIdx) => {
      if (String(b.CustomerId).trim().toLowerCase() === String(customerId).trim().toLowerCase() && !b.IsDeleted) {
        b.IsDeleted = true;
        b.Deleted_By = userEmail;
        b.Deleted_At = now;
        writeRowByHeaders_(bankSheet, bIdx + 2, b, CRM_SCHEMAS.CUSTOMER_BANK);
      }
    });
  } catch (err) {
    Logger.log("Error soft deleting banks: " + err.message);
  }

  // Soft-delete linked nominees
  try {
    const nomSheet = getOrCreateSheet_(CRM_CONFIG.SHEETS.CUSTOMER_NOMINEE, CRM_SCHEMAS.CUSTOMER_NOMINEE, tenantId);
    const nomRows = getSheetRowsAsObjects_(nomSheet, CRM_SCHEMAS.CUSTOMER_NOMINEE);
    nomRows.forEach((n, nIdx) => {
      if (String(n.CustomerId).trim().toLowerCase() === String(customerId).trim().toLowerCase() && !n.IsDeleted) {
        n.IsDeleted = true;
        n.Deleted_By = userEmail;
        n.Deleted_At = now;
        writeRowByHeaders_(nomSheet, nIdx + 2, n, CRM_SCHEMAS.CUSTOMER_NOMINEE);
      }
    });
  } catch (err) {
    Logger.log("Error soft deleting nominees: " + err.message);
  }

  logAudit_(userEmail, "DELETE", "Customers", rec.CustomerCode || customerId, 
    "Soft-deleted investor: " + (rec.FullName || "") + " (" + (rec.CustomerCode || customerId) + ")");

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

// =========================================================================
// CUSTOMER DRAFTS MODULE (Customer_Draft sheet)
// =========================================================================

/**
 * Retrieve active customer drafts (IsDeleted != TRUE)
 */
function getCustomerDrafts_(filters) {
  filters = filters || {};
  const tenantId = (filters && typeof filters === "object") ? (filters.tenantId || filters.activeTenantId) : null;
  const sheet = getOrCreateSheet_(CRM_CONFIG.SHEETS.CUSTOMER_DRAFT, CRM_SCHEMAS.CUSTOMER_DRAFT, tenantId);
  const rows = getSheetRowsAsObjects_(sheet, CRM_SCHEMAS.CUSTOMER_DRAFT);

  const activeDrafts = rows.filter(d => 
    d.IsDeleted !== true && d.IsDeleted !== "TRUE" && d.IsDeleted !== "true"
  );

  return activeDrafts.map((d, idx) => {
    let parsedData = null;
    if (d.DraftDataJson) {
      try { parsedData = typeof d.DraftDataJson === "string" ? JSON.parse(d.DraftDataJson) : d.DraftDataJson; } catch (e) { parsedData = null; }
    }
    return {
      Id: d.DraftId || (idx + 1),
      DraftKey: d.DraftKey,
      CustomerName: d.CustomerName || (parsedData && (parsedData.FullName || [parsedData.FirstName, parsedData.LastName].filter(Boolean).join(" "))) || "Unnamed Draft",
      StepNo: Number(d.CurrentStep || 1),
      TotalSteps: Number(d.TotalSteps || 7),
      LastModifiedBy: d.Updated_By || d.Created_By || "System",
      LastModifiedOn: d.Updated_At || d.Created_At || "",
      DraftData: parsedData || {}
    };
  });
}

/**
 * Save or Update Customer Draft
 */
function saveCustomerDraft_(payload) {
  payload = payload || {};
  const tenantId = (payload && typeof payload === "object") ? (payload.tenantId || payload.activeTenantId) : null;
  const userEmail = payload.userEmail || payload.ActionBy || "admin@srinvestments.com";
  const sheet = getOrCreateSheet_(CRM_CONFIG.SHEETS.CUSTOMER_DRAFT, CRM_SCHEMAS.CUSTOMER_DRAFT, tenantId);
  const rows = getSheetRowsAsObjects_(sheet, CRM_SCHEMAS.CUSTOMER_DRAFT);
  const now = new Date().toISOString();

  let draftKey = cleanStr_(payload.DraftKey || payload.draftKey || "");
  const currentStep = Number(payload.CurrentStep || payload.StepNo || 1);
  const totalSteps = Number(payload.TotalSteps || 7);
  
  // Name determination
  let custName = cleanStr_(payload.CustomerName || "");
  if (!custName && payload.DraftData) {
    custName = cleanStr_(payload.DraftData.FullName || [payload.DraftData.FirstName, payload.DraftData.LastName].filter(Boolean).join(" "));
  }
  if (!custName && (payload.FirstName || payload.LastName)) {
    custName = [payload.FirstName, payload.LastName].filter(Boolean).join(" ");
  }
  if (!custName) custName = "Draft (" + (payload.PAN || payload.Mobile || "New") + ")";

  // DraftDataJson
  let dataJsonStr = "";
  if (payload.DraftDataJson && typeof payload.DraftDataJson === "string") {
    dataJsonStr = payload.DraftDataJson;
  } else if (payload.DraftData) {
    dataJsonStr = JSON.stringify(payload.DraftData);
  } else {
    dataJsonStr = JSON.stringify(payload);
  }

  // Look for existing draft
  let existingIndex = -1;
  if (draftKey) {
    existingIndex = rows.findIndex(r => String(r.DraftKey || "").trim() === draftKey);
  }

  let draftId = "";
  if (existingIndex >= 0) {
    const existing = rows[existingIndex];
    draftId = existing.DraftId || ("DRF_" + Date.now());
    draftKey = existing.DraftKey;

    const updatedRecord = {
      DraftId: draftId,
      DraftKey: draftKey,
      CustomerName: custName,
      CurrentStep: currentStep,
      TotalSteps: totalSteps,
      DraftDataJson: dataJsonStr,
      Status: "DRAFT",
      IsDeleted: false,
      Created_By: existing.Created_By || userEmail,
      Created_At: existing.Created_At || now,
      Updated_By: userEmail,
      Updated_At: now,
      Deleted_By: "",
      Deleted_At: ""
    };
    writeRowByHeaders_(sheet, existingIndex + 2, updatedRecord, CRM_SCHEMAS.CUSTOMER_DRAFT);
  } else {
    draftId = "DRF_" + Date.now();
    if (!draftKey) {
      draftKey = "DKEY_" + Math.random().toString(36).substring(2, 9).toUpperCase();
    }
    const newRecord = {
      DraftId: draftId,
      DraftKey: draftKey,
      CustomerName: custName,
      CurrentStep: currentStep,
      TotalSteps: totalSteps,
      DraftDataJson: dataJsonStr,
      Status: "DRAFT",
      IsDeleted: false,
      Created_By: userEmail,
      Created_At: now,
      Updated_By: userEmail,
      Updated_At: now,
      Deleted_By: "",
      Deleted_At: ""
    };
    writeRowByHeaders_(sheet, -1, newRecord, CRM_SCHEMAS.CUSTOMER_DRAFT);
  }

  return {
    status: "Success",
    success: true,
    data: {
      DraftId: draftId,
      DraftKey: draftKey
    },
    message: "Customer draft saved successfully."
  };
}

/**
 * Soft Delete Customer Draft
 */
function deleteCustomerDraft_(draftKeyOrId, userEmail, tenantId) {
  if (!draftKeyOrId) return { success: false, message: "DraftKey or Id required" };
  userEmail = userEmail || "admin@srinvestments.com";
  const sheet = getOrCreateSheet_(CRM_CONFIG.SHEETS.CUSTOMER_DRAFT, CRM_SCHEMAS.CUSTOMER_DRAFT, tenantId);
  const rows = getSheetRowsAsObjects_(sheet, CRM_SCHEMAS.CUSTOMER_DRAFT);
  const now = new Date().toISOString();

  const target = String(draftKeyOrId).trim().toLowerCase();
  const index = rows.findIndex(r => 
    String(r.DraftKey || "").trim().toLowerCase() === target ||
    String(r.DraftId || "").trim().toLowerCase() === target
  );

  if (index >= 0) {
    const rowNum = index + 2;
    const colIsDeleted = getHeaderColIndex_(sheet, "IsDeleted");
    const colDeletedBy = getHeaderColIndex_(sheet, "Deleted_By");
    const colDeletedAt = getHeaderColIndex_(sheet, "Deleted_At");

    if (colIsDeleted > 0) sheet.getRange(rowNum, colIsDeleted).setValue(true);
    if (colDeletedBy > 0) sheet.getRange(rowNum, colDeletedBy).setValue(userEmail);
    if (colDeletedAt > 0) sheet.getRange(rowNum, colDeletedAt).setValue(now);

    return { status: "Success", success: true, message: "Draft deleted successfully." };
  }

  return { status: "Success", success: true, message: "Draft not found or already removed." };
}
