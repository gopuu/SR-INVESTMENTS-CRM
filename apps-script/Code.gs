/**
 * SR INVESTMENTS CRM - Main Google Apps Script Router
 * 
 * Project: SR_CRM_GAScript
 * Spreadsheet ID: 1Bll7386rIJD2CIl1VX--0Okcn-jxXOpII0OHh9FSKSM
 * Drive Folder ID: 1IxulBQJTKrxYAyYMUhz5bllvaMZUYvy (SRInvestmentsCRM)
 *
 * Supported Communications:
 * 1. Direct Web App POST (doPost) from React frontend
 * 2. Bridge.html iframe (google.script.run) fallback
 * 3. Health & Status GET (doGet)
 */

function doGet(e) {
  const params = (e && e.parameter) || {};
  
  // Health ping
  if (params.ping || params.action === "health") {
    return jsonResponse_({
      success: true,
      status: "healthy",
      service: "SR Investments CRM Live Backend",
      spreadsheetId: CRM_CONFIG.SPREADSHEET_ID,
      timestamp: new Date().toISOString()
    });
  }

  // Serve Bridge.html for iframe fallback
  return HtmlService.createHtmlOutputFromFile("Bridge")
    .setTitle("SR Investments CRM Bridge")
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
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

/**
 * Called by Bridge.html through google.script.run
 */
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

/**
 * Central CRM Action Dispatcher
 */
function handleAction_(action, payload) {
  switch (action) {
    // System & Health
    case "health":
      return { ok: true, spreadsheetId: CRM_CONFIG.SPREADSHEET_ID, timestamp: new Date().toISOString() };

    case "setupCRM":
      return setupCRM();

    // Authentication & Profile
    case "login":
      return loginUser_(payload.email, payload.password);

    case "updateUserProfile":
      return updateUserProfile_(payload);

    case "changePassword":
      return changeUserPassword_(payload);

    // Dashboard
    case "getDashboard":
      return getDashboardMetrics_();

    // Customers (Investors)
    case "getCustomers":
      return getCustomers_(payload);

    case "saveCustomer":
      return saveCustomer_(payload);

    case "deleteCustomer":
      return deleteCustomer_(payload.customerId);

    // Staff / Employees
    case "getEmployees":
      return getEmployees_(payload);

    case "saveEmployee":
      return saveEmployee_(payload);

    case "deleteEmployee":
      return deleteEmployee_(payload.employeeId);

    // Company Settings & Rights
    case "getCompanySettings":
      return getCompanySettings_();

    case "saveCompanySettings":
      return saveCompanySettings_(payload);

    case "getRolesRights":
      return getRolesRights_();

    case "saveRolesRights":
      return saveRolesRights_(payload);

    // Drive File Operations
    case "uploadFile":
      return uploadDriveFile_(
        payload.folder || CRM_CONFIG.SUBFOLDERS.CUSTOMERS,
        payload.fileName,
        payload.mimeType,
        payload.base64,
        payload.oldFileId
      );

    default:
      throw new Error("Unknown action: " + action);
  }
}
