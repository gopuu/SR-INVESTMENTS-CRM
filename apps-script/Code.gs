/**
 * SR INVESTMENTS CRM - Main Google Apps Script Router (Blue Family Edition)
 * 
 * Project: SR_CRM_GAScript
 * Spreadsheet ID: 1Bll7386rIJD2CIl1VX--0Okcn-jxXOpII0OHh9FSKSM
 * Drive Folder ID: 1IxulBQJTKrxYAyYMUhz5bllvaMZUYvy (SRInvestmentsCRM)
 *
 * Supported Actions:
 * - login (via staffId / email / mobile)
 * - googleLogin (multi-google ID verification)
 * - sendBulkEmail (Amazon SES integration)
 * - downloadDriveBackup (Full Drive ZIP generator)
 * - customers & staff CRUD
 * - settings & rights RBAC
 */

function doGet(e) {
  const params = (e && e.parameter) || {};
  
  if (params.ping || params.action === "health") {
    return jsonResponse_({
      success: true,
      status: "healthy",
      service: "SR Investments CRM Live Backend (Blue Edition)",
      spreadsheetId: CRM_CONFIG.SPREADSHEET_ID,
      timestamp: new Date().toISOString()
    });
  }

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

    // SEBI Audit Logs Register
    case "getAuditLogs":
      return getAuditLogs_(payload);

    // Bulk Mailing via Amazon SES
    case "sendBulkEmail":
      return sendBulkEmailSES_(payload);

    case "getCampaignLogs":
      return getCampaignLogs_();

    case "getCampaignRecipientLogs":
      return getCampaignRecipientLogs_(payload.campaignId);

    // Drive Full ZIP Backup
    case "downloadDriveBackup":
      return backupDriveFilesToZip_();

    // Settings & Permissions
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
