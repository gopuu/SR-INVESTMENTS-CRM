/**
 * SR INVESTMENTS CRM - Customer Module (Mutual Fund Investors)
 * Manages investor records, KYC verification, bank mandates, nominee & portfolio details.
 */

function getCustomers_(filters) {
  const sheet = getOrCreateSheet_(CRM_CONFIG.SHEETS.CUSTOMERS, CRM_SCHEMAS.CUSTOMERS);
  let rows = getSheetRowsAsObjects_(sheet, CRM_SCHEMAS.CUSTOMERS);

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
  const id = cleanStr_(data.CustomerId) || createId_("CUST");
  const code = cleanStr_(data.CustomerCode) || ("SR" + Math.floor(10000 + Math.random() * 90000));

  const rows = getSheetRowsAsObjects_(sheet, CRM_SCHEMAS.CUSTOMERS);
  const existingIndex = rows.findIndex(r => r.CustomerId === id);

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
    existingIndex >= 0 ? (rows[existingIndex].CreatedAt || now) : now,
    now
  ];

  if (existingIndex >= 0) {
    sheet.getRange(existingIndex + 2, 1, 1, CRM_SCHEMAS.CUSTOMERS.length).setValues([rowValues]);
    logAudit_("SYSTEM", "UPDATE_CUSTOMER", "Updated investor: " + code + " (" + data.FullName + ")");
  } else {
    sheet.appendRow(rowValues);
    logAudit_("SYSTEM", "CREATE_CUSTOMER", "Created investor: " + code + " (" + data.FullName + ")");
  }

  return { customerId: id, customerCode: code, message: "Investor saved successfully." };
}

function deleteCustomer_(customerId) {
  if (!customerId) throw new Error("CustomerId is required.");
  const sheet = getOrCreateSheet_(CRM_CONFIG.SHEETS.CUSTOMERS, CRM_SCHEMAS.CUSTOMERS);
  const rows = getSheetRowsAsObjects_(sheet, CRM_SCHEMAS.CUSTOMERS);
  const index = rows.findIndex(r => r.CustomerId === customerId);
  if (index === -1) throw new Error("Investor record not found.");

  sheet.deleteRow(index + 2);
  logAudit_("SYSTEM", "DELETE_CUSTOMER", "Deleted customer ID: " + customerId);
  return { success: true, message: "Investor deleted successfully." };
}

