/**
 * SR INVESTMENTS CRM - Main Google Apps Script Router (Blue Family Edition)
 * 
 * Project: SR_CRM_GAScript
 * Spreadsheet ID: 1Bll7386rIJD2CIl1VX--0Okcn-jxXOpII0OHh9FSKSM
 * Drive Folder ID: 1rVz2OnKPDHbXuq-ujsJg2R3vzYDwnzMU (SRInvestmentsCRM)
 *
 * Supported Actions:
 * - login (via staffId / email / mobile)
 * - googleLogin (multi-google ID verification)
 * - downloadDriveBackup (Full Drive ZIP generator)
 * - customers & staff CRUD
 * - settings & rights RBAC
 */

function doGet(e) {
  const params = (e && e.parameter) || {};
  
  // 1. Health / Ping check
  if (params.ping || params.action === "health") {
    return jsonResponse_({
      success: true,
      status: "healthy",
      service: "SR Investments CRM Live Backend (Blue Edition)",
      spreadsheetId: CRM_CONFIG.SPREADSHEET_ID,
      timestamp: new Date().toISOString()
    });
  }

  // 2. Public Default Configuration Check (CORS & Auth Free)
  if (params.action === "getDefaultConfig" || params.action === "config") {
    try {
      const cfg = getDefaultConfig_();
      if (params.callback) {
        return ContentService.createTextOutput(params.callback + "(" + JSON.stringify({ success: true, data: cfg }) + ");")
          .setMimeType(ContentService.MimeType.JAVASCRIPT);
      }
      return jsonResponse_({ success: true, data: cfg });
    } catch (err) {
      if (params.callback) {
        return ContentService.createTextOutput(params.callback + "(" + JSON.stringify({ success: false, message: err.message }) + ");")
          .setMimeType(ContentService.MimeType.JAVASCRIPT);
      }
      return jsonResponse_({ success: false, message: err.message });
    }
  }

  // 2. Direct JSONP Request Handler (Bypasses all CORS limitations in any browser)
  if (params.callback) {
    try {
      const action = params.action || "health";
      let payload = {};
      if (params.payload) {
        try {
          payload = typeof params.payload === "string" ? JSON.parse(params.payload) : params.payload;
        } catch (err) {
          payload = {};
        }
      }
      const result = handleAction_(action, payload);
      const jsonpOutput = params.callback + "(" + JSON.stringify({ success: true, data: result }) + ");";
      return ContentService.createTextOutput(jsonpOutput)
        .setMimeType(ContentService.MimeType.JAVASCRIPT);
    } catch (err) {
      const jsonpErr = params.callback + "(" + JSON.stringify({ success: false, message: err.message || String(err) }) + ");";
      return ContentService.createTextOutput(jsonpErr)
        .setMimeType(ContentService.MimeType.JAVASCRIPT);
    }
  }

  // 3. Direct JSON Request Handler for GET actions
  if (params.action) {
    try {
      let payload = {};
      if (params.payload) {
        try {
          payload = typeof params.payload === "string" ? JSON.parse(params.payload) : params.payload;
        } catch (err) {
          payload = {};
        }
      }
      const result = handleAction_(params.action, payload);
      return jsonResponse_({ success: true, data: result });
    } catch (err) {
      return jsonResponse_({ success: false, message: err.message || String(err) });
    }
  }

  // 4. Fallback inline HTML bridge (Zero external Bridge.html dependency)
  return HtmlService.createHtmlOutput(getBridgeHtml_())
    .setTitle("SR Investments CRM Bridge")
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}

function getBridgeHtml_() {
  return '<!doctype html><html lang="en"><head><base target="_top"><meta charset="utf-8">' +
    '<title>SR Investments CRM Bridge</title>' +
    '<style>html,body{margin:0;padding:0;background:transparent;overflow:hidden;}</style></head><body>' +
    '<script>' +
    'window.addEventListener("message",function(event){' +
    '  var data=event.data||{};' +
    '  if(data.type!=="CRM_BRIDGE_REQUEST")return;' +
    '  var requestId=data.requestId; var action=data.action; var payload=data.payload||{}; var target=event.source;' +
    '  google.script.run' +
    '    .withSuccessHandler(function(result){ target.postMessage({ type:"CRM_BRIDGE_RESPONSE", requestId:requestId, ok:true, result:result }, "*"); })' +
    '    .withFailureHandler(function(error){ target.postMessage({ type:"CRM_BRIDGE_RESPONSE", requestId:requestId, ok:false, error:error&&error.message?error.message:String(error) }, "*"); })' +
    '    .bridgeRequest(action,payload);' +
    '});' +
    'window.parent.postMessage({ type:"CRM_BRIDGE_READY" }, "*");' +
    '<\/script></body></html>';
}

function doPost(e) {
  try {
    let reqData = {};
    if (e && e.postData && e.postData.contents) {
      try {
        reqData = JSON.parse(e.postData.contents);
      } catch (err) {
        if (e.parameter && e.parameter.data) {
          reqData = JSON.parse(e.parameter.data);
        }
      }
    } else if (e && e.parameter && e.parameter.data) {
      reqData = JSON.parse(e.parameter.data);
    }

    const action = reqData.action;
    const payload = reqData.payload || reqData;
    
    if (!action) {
      throw new Error("Missing 'action' parameter.");
    }

    const result = handleAction_(action, payload);
    return jsonResponse_({ success: true, data: result });
  } catch (error) {
    return jsonResponse_({
      success: false,
      message: error.message || String(error)
    });
  }
}

function bridgeRequest(action, payload) {
  try {
    return {
      success: true,
      data: handleAction_(action, payload || {})
    };
  } catch (error) {
    return {
      success: false,
      message: error.message || String(error)
    };
  }
}

function handleAction_(action, payload) {
  switch (action) {
    // Health & Verification
    case "health":
      return { ok: true, spreadsheetId: CRM_CONFIG.SPREADSHEET_ID, timestamp: new Date().toISOString() };

    case "setupCRM":
      return setupCRM();

    // Authentication: Credentials & Google
    case "login":
      return loginUser_(payload.username || payload.email, payload.password);

    case "googleLogin":
      return googleLogin_(payload.googleEmail, payload.googleName);

    // Password Reset via OTP
    case "sendPasswordResetOtp":
      return sendPasswordResetOtp_(payload);

    case "verifyPasswordResetOtp":
      return verifyPasswordResetOtp_(payload);

    case "resetPasswordWithOtp":
      return resetPasswordWithOtp_(payload);

    // SaaS Multi-Tenant & Workspace Selection
    case "selectTenant":
      return selectTenant_(payload);

    case "getTenants":
      verifyIsSuperAdmin_(payload);
      return getTenants_(payload);

    case "saveTenant":
      verifyIsSuperAdmin_(payload);
      return saveTenant_(payload);

    case "deleteTenant":
      verifyIsSuperAdmin_(payload);
      return deleteTenant_(payload);

    case "getTenantLicenses":
      verifyIsSuperAdmin_(payload);
      return getTenantLicenses_(payload);

    case "saveTenantLicense":
      verifyIsSuperAdmin_(payload);
      return saveTenantLicense_(payload);

    case "activateTenantLicense":
      verifyIsSuperAdmin_(payload);
      return activateTenantLicense_(payload);

    case "cancelTenantLicense":
      verifyIsSuperAdmin_(payload);
      return cancelTenantLicense_(payload);

    // Payment Receiving Accounts Master (Central DB)
    case "getPaymentAccounts":
      return getPaymentAccounts_(payload);

    case "modifyTenantLicensingColumns":
      return modifyTenantLicensingColumns_();

    // Subscription Plans Master (SaaS Tiers & Quotas)
    case "getSubscriptionPlans":
      verifyIsSuperAdmin_(payload);
      return getSubscriptionPlans_(payload);

    case "saveSubscriptionPlan":
      verifyIsSuperAdmin_(payload);
      return saveSubscriptionPlan_(payload);

    case "deleteSubscriptionPlan":
      verifyIsSuperAdmin_(payload);
      return deleteSubscriptionPlan_(payload);

    case "getUserDocuments":
      return getUserDocuments_(payload);

    case "uploadUserDocument":
      return uploadUserDocument_(payload);

    case "updateUserProfile":
      return updateUserProfile_(payload);

    case "changePassword":
      return changeUserPassword_(payload);

    // Dashboard
    case "getDashboard":
      return getDashboardMetrics_(payload);

    // Customers (Investors)
    case "getCustomers":
      return getCustomers_(payload);

    case "saveCustomer":
      return saveCustomer_(payload);

    case "deleteCustomer":
      return deleteCustomer_(payload);

    case "restoreCustomer":
      return restoreCustomer_(payload);

    // Staff / Employees
    case "getEmployees":
      return getEmployees_(payload);

    case "saveEmployee":
      return saveEmployee_(payload);

    case "deleteEmployee":
      return deleteEmployee_(payload);

    case "restoreEmployee":
      return restoreEmployee_(payload);

    // Master HUB (Departments, Designations, Roles)
    case "getMasters":
      return getMasters_(payload);

    case "getDepartments":
      return getDepartments_(payload);

    case "getDesignations":
      return getDesignations_(payload);

    case "getRoles":
      return getRoles_(payload);

    case "saveMasterItem":
      return saveMasterItem_(payload);

    case "deleteMasterItem":
      return deleteMasterItem_(payload);

    case "restoreMasterItem":
      return restoreMasterItem_(payload);

    // Drive Full ZIP Backup
    case "downloadDriveBackup":
      return backupDriveFilesToZip_(payload);

    // Realtime Notifications
    case "getNotifications":
      return getNotifications_(payload);

    case "sendNotification":
      return sendNotification_(payload);

    // Settings & Permissions
    case "getCompanySettings":
      return getCompanySettings_(payload);

    case "saveCompanySettings":
      return saveCompanySettings_(payload);

    case "getRolesRights":
      return getRolesRights_(payload);

    case "saveRolesRights":
      return saveRolesRights_(payload);

    // Central Database Management & Maintenance
    case "setupCentralDatabase":
      return setupCentralDatabase();

    case "renameUserMasterColumn": {
      const umSheet = getOrCreateSheet_(CRM_CONFIG.SHEETS.USER_MASTER, CRM_SCHEMAS.USER_MASTER);
      return { success: true, message: "User_Master column 'GoogleEmails' successfully renamed to 'AlternateEmailsList'." };
    }

    case "setupTenantDatabase":
      return setupTenantTemplateDatabase(payload && payload.spreadsheetId);

    case "cleanCentralDatabase":
      return cleanCentralDatabase();

    // Central SaaS Default Configuration
    case "getDefaultConfig":
      return getDefaultConfig_();

    case "saveDefaultConfig":
      return saveDefaultConfig_(payload);

    case "getDailyDispatchStats":
      return getDailyDispatchStats_();

    // Drive File Operations
    case "uploadFile":
      return uploadDriveFile_(
        payload.folder || CRM_CONFIG.SUBFOLDERS.CUSTOMERS,
        payload.fileName,
        payload.mimeType,
        payload.base64,
        payload.oldFileId,
        payload.tenantId
      );

    default:
      throw new Error("Unknown action: " + action);
  }
}

/**
 * ==============================================================
 * GOOGLE SHEETS UI MENU INTEGRATION
 * When opened inside Google Sheets, adds a top navigation menu
 * to run database initialization or clean accidental tabs.
 * ==============================================================
 */
function onOpen() {
  try {
    // Automatically ensure Payment_Accounts tab exists on spreadsheet open
    ensurePaymentAccountsSheet_();
  } catch (e) {
    Logger.log("Payment_Accounts check onOpen: " + e.message);
  }

  try {
    SpreadsheetApp.getUi()
      .createMenu("🚀 SaaS CRM Tools")
      .addItem("1. Setup Central SaaS Database (Masters Only)", "setupCentralDatabaseMenu_")
      .addItem("2. Setup Default-Config in Central DB", "setupDefaultConfigMenu_")
      .addItem("3. Setup _CRM_DATABASE_TEMPLATE (Operational Sheets)", "setupTemplateDatabaseMenu_")
      .addSeparator()
      .addItem("💳 Add / Verify Payment_Accounts Tab", "setupPaymentAccountsMenu_")
      .addItem("📋 Modify Tenant Licensing Columns (Payment Fields)", "modifyTenantLicensingColumnsMenu_")
      .addItem("🧹 Clean Accidental Sheets from Central DB", "cleanCentralDatabaseMenu_")
      .addToUi();
  } catch (e) {
    Logger.log("onOpen UI skipped (standalone execution): " + e.message);
  }
}

function setupPaymentAccountsMenu_() {
  const ui = SpreadsheetApp.getUi();
  const sheet = ensurePaymentAccountsSheet_();
  ui.alert(
    "Payment_Accounts Verified",
    "Tab 'Payment_Accounts' is active with " + (sheet.getLastRow() - 1) + " accounts.\nHeaders and schemas verified in Central_SaaS_Master_DB.",
    ui.ButtonSet.OK
  );
}

function modifyTenantLicensingColumnsMenu_() {
  const ui = SpreadsheetApp.getUi();
  const res = modifyTenantLicensingColumns_();
  ui.alert(
    "Tenant Licensing Columns Updated",
    res.message + "\n\nTotal Columns: " + res.columns.length + "\nRows: " + res.rowCount,
    ui.ButtonSet.OK
  );
}

/**
 * Standalone runner to add 'Payment_Accounts' tab if not exists
 */
function addPaymentAccountsTab() {
  const sheet = ensurePaymentAccountsSheet_();
  return {
    success: true,
    message: "Payment_Accounts tab verified with " + (sheet.getLastRow() - 1) + " accounts.",
    sheetName: sheet.getName(),
    rows: sheet.getLastRow()
  };
}

function setupDefaultConfigMenu_() {
  const ui = SpreadsheetApp.getUi();
  const cfg = getDefaultConfig_();
  ui.alert("Default-Config Initialized", "Default configuration tab is verified in Central DB.\nLogin Company Name: " + (cfg.LoginCompanyName || "SR INVESTMENTS CRM") + "\nGoogleClientId: " + (cfg.GoogleClientId || "Ready"), ui.ButtonSet.OK);
}

/**
 * Run this function once in Apps Script editor to authorize Google Mail (script.send_mail) permissions
 */
function authorizeMailPermission() {
  let email = "";
  try {
    email = Session.getEffectiveUser().getEmail();
  } catch (e) {
    email = "admin";
  }
  const quota = MailApp.getRemainingDailyQuota();
  Logger.log("Mail authorization is active for: " + email + ". Remaining daily email quota: " + quota);
  return "Mail authorization verified! Daily email quota remaining: " + quota;
}

function cleanCentralDatabaseMenu_() {
  const ui = SpreadsheetApp.getUi();
  const res = cleanCentralDatabase();
  ui.alert(
    "Central Database Cleaned",
    res.message + "\n\nPreserved Sheets:\n" + res.preservedSheets.join(", ") + 
    (res.deletedSheets.length > 0 ? "\n\nDeleted Sheets:\n" + res.deletedSheets.join(", ") : "\n\nNo accidental operational sheets found."),
    ui.ButtonSet.OK
  );
}

function setupCentralDatabaseMenu_() {
  const ui = SpreadsheetApp.getUi();
  const res = setupCentralDatabase();
  ui.alert("Central Setup Complete", res.message, ui.ButtonSet.OK);
}

function setupTemplateDatabaseMenu_() {
  const ui = SpreadsheetApp.getUi();
  const res = setupTenantTemplateDatabase();
  ui.alert("Template Setup Complete", res.message + "\nID: " + res.spreadsheetId, ui.ButtonSet.OK);
}
