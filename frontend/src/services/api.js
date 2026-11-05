/**
 * SR INVESTMENTS CRM - Unified API Client
 * 
 * Features:
 * 1. Live Google Apps Script (doPost JSON / text-plain fetch with 302 follow)
 * 2. Bridge.html iframe postMessage fallback (100% reliable)
 * 3. Rich Mock / LocalStorage Demo Data mode (so CRM works out-of-the-box before GAS deployment)
 */

const STORAGE_KEYS = {
  CONFIG_URL: 'sr_crm_gas_url',
  DEMO_MODE: 'sr_crm_demo_mode',
  CUSTOMERS: 'sr_crm_demo_customers',
  EMPLOYEES: 'sr_crm_demo_employees',
  SETTINGS: 'sr_crm_demo_settings',
  RIGHTS: 'sr_crm_demo_rights'
};

// Seed sample Mutual Fund CRM data
const SEED_DATA = {
  settings: {
    COMPANY_NAME: 'SR INVESTMENTS',
    ARN_NUMBER: 'ARN-189241',
    EUIN_NUMBER: 'E345678',
    GSTIN: '27AAACR1234F1Z5',
    SUPPORT_EMAIL: 'support@srinvestments.com',
    CONTACT_PHONE: '+91 98765 43210',
    OFFICE_ADDRESS: '101, Fortune Hub, Financial District, Bandra-Kurla Complex, Mumbai 400051'
  },
  employees: [
    {
      EmployeeId: 'EMP_001',
      EmployeeCode: 'SR-EMP01',
      FullName: 'Rajesh Sharma',
      Email: 'rajesh@srinvestments.com',
      Mobile: '+91 98201 11223',
      Department: 'Wealth Management',
      Designation: 'Senior Investment Advisor',
      Role: 'Relationship Manager',
      JoiningDate: '2022-04-15',
      Status: 'Active',
      Address: '402, Sea Crest Towers',
      City: 'Mumbai',
      State: 'Maharashtra',
      PhotoUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      DriveFileId: '',
      CreatedAt: '2022-04-15T10:00:00Z',
      UpdatedAt: '2026-08-10T12:00:00Z'
    },
    {
      EmployeeId: 'EMP_002',
      EmployeeCode: 'SR-EMP02',
      FullName: 'Pooja Mehta',
      Email: 'pooja.m@srinvestments.com',
      Mobile: '+91 98199 44556',
      Department: 'Operations & KYC',
      Designation: 'Operations Executive',
      Role: 'Backoffice Staff',
      JoiningDate: '2023-01-10',
      Status: 'Active',
      Address: 'B-12, Green Park',
      City: 'Pune',
      State: 'Maharashtra',
      PhotoUrl: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80',
      DriveFileId: '',
      CreatedAt: '2023-01-10T10:00:00Z',
      UpdatedAt: '2026-07-22T14:30:00Z'
    },
    {
      EmployeeId: 'EMP_003',
      EmployeeCode: 'SR-EMP03',
      FullName: 'Amit Verma',
      Email: 'amit.v@srinvestments.com',
      Mobile: '+91 98330 99887',
      Department: 'Mutual Funds',
      Designation: 'Mutual Fund Analyst',
      Role: 'Staff',
      JoiningDate: '2023-09-01',
      Status: 'Active',
      Address: '701, Sun City',
      City: 'Ahmedabad',
      State: 'Gujarat',
      PhotoUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
      DriveFileId: '',
      CreatedAt: '2023-09-01T10:00:00Z',
      UpdatedAt: '2026-09-15T09:00:00Z'
    }
  ],
  customers: [
    {
      CustomerId: 'CUST_101',
      CustomerCode: 'SR90421',
      FullName: 'Vikramaditya Roy',
      Email: 'v.roy@example.com',
      Mobile: '+91 98200 45678',
      PanNumber: 'ABCDE1234F',
      AadhaarLast4: '8842',
      KycStatus: 'Compliant',
      InvestorCategory: 'Individual',
      DateOfBirth: '1982-06-14',
      NomineeName: 'Sunita Roy',
      NomineeRelation: 'Spouse',
      BankName: 'HDFC Bank',
      AccountNumber: '50100234567890',
      IfscCode: 'HDFC0000128',
      City: 'Mumbai',
      State: 'Maharashtra',
      RiskProfile: 'Aggressive',
      Notes: 'Prefers equity diversified & large & mid-cap SIPs. Portfolio size: ₹45 Lakhs',
      CreatedAt: '2024-02-10T11:20:00Z',
      UpdatedAt: '2026-08-14T16:00:00Z'
    },
    {
      CustomerId: 'CUST_102',
      CustomerCode: 'SR89215',
      FullName: 'Ananya Deshmukh',
      Email: 'ananya.d@example.com',
      Mobile: '+91 98112 34567',
      PanNumber: 'BKRPD8901M',
      AadhaarLast4: '1249',
      KycStatus: 'Compliant',
      InvestorCategory: 'Individual',
      DateOfBirth: '1990-11-23',
      NomineeName: 'Rohan Deshmukh',
      NomineeRelation: 'Brother',
      BankName: 'ICICI Bank',
      AccountNumber: '001205009876',
      IfscCode: 'ICIC0000012',
      City: 'Pune',
      State: 'Maharashtra',
      RiskProfile: 'Moderate',
      Notes: 'Monthly SIP ₹25,000 in Flexi Cap and Hybrid Debt funds.',
      CreatedAt: '2024-05-18T14:10:00Z',
      UpdatedAt: '2026-09-02T10:30:00Z'
    },
    {
      CustomerId: 'CUST_103',
      CustomerCode: 'SR76104',
      FullName: 'Karan Singhania (HUF)',
      Email: 'karan.singhania@example.com',
      Mobile: '+91 98450 78901',
      PanNumber: 'AAACS6543K',
      AadhaarLast4: '5501',
      KycStatus: 'Pending',
      InvestorCategory: 'HUF',
      DateOfBirth: '1975-03-30',
      NomineeName: 'Meera Singhania',
      NomineeRelation: 'Member',
      BankName: 'State Bank of India',
      AccountNumber: '31234567890',
      IfscCode: 'SBIN0000300',
      City: 'Bengaluru',
      State: 'Karnataka',
      RiskProfile: 'High',
      Notes: 'Karta KYC documents pending address verification.',
      CreatedAt: '2026-01-12T09:45:00Z',
      UpdatedAt: '2026-08-20T17:15:00Z'
    },
    {
      CustomerId: 'CUST_104',
      CustomerCode: 'SR65203',
      FullName: 'Sunil Nair',
      Email: 'sunil.nair@example.com',
      Mobile: '+91 98950 12345',
      PanNumber: 'CKSPN4321A',
      AadhaarLast4: '9012',
      KycStatus: 'Compliant',
      InvestorCategory: 'NRI',
      DateOfBirth: '1985-08-19',
      NomineeName: 'Deepa Nair',
      NomineeRelation: 'Spouse',
      BankName: 'Axis Bank',
      AccountNumber: '915010045678901',
      IfscCode: 'UTIB0000010',
      City: 'Kochi',
      State: 'Kerala',
      RiskProfile: 'Moderate',
      Notes: 'NRE Account linked. Regular monthly SIP in index funds.',
      CreatedAt: '2026-03-05T15:00:00Z',
      UpdatedAt: '2026-09-01T11:00:00Z'
    }
  ],
  rights: [
    { Role: 'Admin', Module: 'Dashboard', CanView: true, CanCreate: true, CanEdit: true, CanDelete: true },
    { Role: 'Admin', Module: 'Customers', CanView: true, CanCreate: true, CanEdit: true, CanDelete: true },
    { Role: 'Admin', Module: 'Staff', CanView: true, CanCreate: true, CanEdit: true, CanDelete: true },
    { Role: 'Admin', Module: 'Settings', CanView: true, CanCreate: true, CanEdit: true, CanDelete: true },
    { Role: 'Relationship Manager', Module: 'Dashboard', CanView: true, CanCreate: false, CanEdit: false, CanDelete: false },
    { Role: 'Relationship Manager', Module: 'Customers', CanView: true, CanCreate: true, CanEdit: true, CanDelete: false },
    { Role: 'Relationship Manager', Module: 'Staff', CanView: true, CanCreate: false, CanEdit: false, CanDelete: false },
    { Role: 'Relationship Manager', Module: 'Settings', CanView: false, CanCreate: false, CanEdit: false, CanDelete: false },
    { Role: 'Backoffice Staff', Module: 'Dashboard', CanView: true, CanCreate: false, CanEdit: false, CanDelete: false },
    { Role: 'Backoffice Staff', Module: 'Customers', CanView: true, CanCreate: true, CanEdit: true, CanDelete: false },
    { Role: 'Backoffice Staff', Module: 'Staff', CanView: false, CanCreate: false, CanEdit: false, CanDelete: false },
    { Role: 'Backoffice Staff', Module: 'Settings', CanView: false, CanCreate: false, CanEdit: false, CanDelete: false }
  ]
};

// Initialize localStorage demo store if empty
function initDemoStore() {
  if (!localStorage.getItem(STORAGE_KEYS.CUSTOMERS)) {
    localStorage.setItem(STORAGE_KEYS.CUSTOMERS, JSON.stringify(SEED_DATA.customers));
  }
  if (!localStorage.getItem(STORAGE_KEYS.EMPLOYEES)) {
    localStorage.setItem(STORAGE_KEYS.EMPLOYEES, JSON.stringify(SEED_DATA.employees));
  }
  if (!localStorage.getItem(STORAGE_KEYS.SETTINGS)) {
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(SEED_DATA.settings));
  }
  if (!localStorage.getItem(STORAGE_KEYS.RIGHTS)) {
    localStorage.setItem(STORAGE_KEYS.RIGHTS, JSON.stringify(SEED_DATA.rights));
  }
}

// Iframe bridge state
let bridgeIframe = null;
let bridgeReadyPromise = null;
let bridgeSeq = 0;
const bridgePending = new Map();

function ensureBridge(url) {
  if (bridgeReadyPromise) return bridgeReadyPromise;

  bridgeReadyPromise = new Promise((resolve) => {
    let iframe = document.getElementById('gas-bridge-iframe');
    if (!iframe) {
      iframe = document.createElement('iframe');
      iframe.id = 'gas-bridge-iframe';
      iframe.style.display = 'none';
      document.body.appendChild(iframe);
      bridgeIframe = iframe;

      window.addEventListener('message', (event) => {
        const data = event.data || {};
        if (data.type === 'CRM_BRIDGE_READY') {
          resolve(true);
        } else if (data.type === 'CRM_BRIDGE_RESPONSE') {
          const req = bridgePending.get(data.requestId);
          if (req) {
            bridgePending.delete(data.requestId);
            if (data.ok) req.resolve(data.result);
            else req.reject(new Error(data.error || 'Bridge request failed'));
          }
        }
      });
    }

    iframe.src = url.includes('?') ? `${url}&bridge=1` : `${url}?bridge=1`;

    // Timeout fallback after 7 seconds
    setTimeout(() => resolve(false), 7000);
  });

  return bridgeReadyPromise;
}

export const crmApi = {
  // Get active GAS backend URL
  getBackendUrl() {
    return localStorage.getItem(STORAGE_KEYS.CONFIG_URL) || '';
  },

  // Set active GAS backend URL
  setBackendUrl(url) {
    if (url) {
      localStorage.setItem(STORAGE_KEYS.CONFIG_URL, url.trim());
    } else {
      localStorage.removeItem(STORAGE_KEYS.CONFIG_URL);
    }
  },

  // Check whether Live or Demo Mode is currently used
  isDemoMode() {
    const url = this.getBackendUrl();
    if (!url || url.includes('PASTE_YOUR') || url.includes('PASTE_GOOGLE')) return true;
    return localStorage.getItem(STORAGE_KEYS.DEMO_MODE) === 'true';
  },

  setDemoMode(enabled) {
    localStorage.setItem(STORAGE_KEYS.DEMO_MODE, enabled ? 'true' : 'false');
  },

  // Central dispatch
  async call(action, payload = {}) {
    if (this.isDemoMode()) {
      return this.handleDemoAction(action, payload);
    }

    const gasUrl = this.getBackendUrl();

    // 1. Try Direct Fetch first (payload wrapped as text/plain to bypass CORS preflight)
    try {
      const response = await fetch(gasUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'text/plain;charset=utf-8'
        },
        body: JSON.stringify({ action, payload }),
        redirect: 'follow'
      });

      if (response.ok) {
        const json = await response.json();
        if (json.success) return json.data;
        throw new Error(json.message || 'Server returned an error');
      }
    } catch (fetchErr) {
      console.warn('Direct fetch failed, attempting iframe bridge fallback...', fetchErr);
    }

    // 2. Fallback to Bridge.html iframe postMessage
    try {
      await ensureBridge(gasUrl);
      if (!bridgeIframe || !bridgeIframe.contentWindow) {
        throw new Error('Bridge iframe unavailable');
      }

      return new Promise((resolve, reject) => {
        const requestId = 'req_' + Date.now() + '_' + (++bridgeSeq);
        bridgePending.set(requestId, { resolve, reject });

        bridgeIframe.contentWindow.postMessage({
          type: 'CRM_BRIDGE_REQUEST',
          requestId,
          action,
          payload
        }, '*');

        setTimeout(() => {
          if (bridgePending.has(requestId)) {
            bridgePending.delete(requestId);
            reject(new Error('Backend request timed out (20s). Please check your GAS deployment.'));
          }
        }, 20000);
      });
    } catch (bridgeErr) {
      console.error('All live transports failed:', bridgeErr);
      throw new Error(bridgeErr.message || 'Unable to communicate with Google Apps Script backend.');
    }
  },

  // DEMO MODE HANDLER
  async handleDemoAction(action, payload) {
    initDemoStore();
    // Simulate brief network latency
    await new Promise((r) => setTimeout(r, 180));

    switch (action) {
      case 'health':
        return { ok: true, mode: 'Demo / Local Storage', timestamp: new Date().toISOString() };

      case 'login': {
        const { email, password } = payload;
        if (!email || !password) throw new Error('Email and password required.');
        if (password !== 'admin123' && password !== 'password') {
          throw new Error('Invalid credentials. Use admin@srinvestments.com / admin123');
        }
        return {
          user: {
            userId: 'USR_001',
            name: 'System Administrator',
            email: email,
            role: 'Admin',
            status: 'Active',
            lastLogin: new Date().toISOString()
          },
          rights: JSON.parse(localStorage.getItem(STORAGE_KEYS.RIGHTS) || '[]'),
          token: 'DEMO_TOKEN_' + Date.now()
        };
      }

      case 'getDashboard': {
        const customers = JSON.parse(localStorage.getItem(STORAGE_KEYS.CUSTOMERS) || '[]');
        const employees = JSON.parse(localStorage.getItem(STORAGE_KEYS.EMPLOYEES) || '[]');

        const kycCounts = { Compliant: 0, Pending: 0, Rejected: 0 };
        const categoryCounts = { Individual: 0, HUF: 0, Corporate: 0, NRI: 0 };

        customers.forEach((c) => {
          const k = c.KycStatus || 'Pending';
          kycCounts[k] = (kycCounts[k] || 0) + 1;
          const cat = c.InvestorCategory || 'Individual';
          categoryCounts[cat] = (categoryCounts[cat] || 0) + 1;
        });

        return {
          totalCustomers: customers.length,
          activeEmployees: employees.filter(e => e.Status === 'Active').length,
          totalEmployees: employees.length,
          kycCompliantCount: kycCounts.Compliant || 0,
          kycPendingCount: kycCounts.Pending || 0,
          kycBreakdown: kycCounts,
          categoryBreakdown: categoryCounts,
          recentCustomers: customers.slice(-5).reverse()
        };
      }

      case 'getCustomers': {
        let list = JSON.parse(localStorage.getItem(STORAGE_KEYS.CUSTOMERS) || '[]');
        if (payload.search) {
          const q = payload.search.toLowerCase();
          list = list.filter(c =>
            (c.FullName && c.FullName.toLowerCase().includes(q)) ||
            (c.CustomerCode && c.CustomerCode.toLowerCase().includes(q)) ||
            (c.PanNumber && c.PanNumber.toLowerCase().includes(q)) ||
            (c.Email && c.Email.toLowerCase().includes(q)) ||
            (c.Mobile && c.Mobile.includes(q))
          );
        }
        if (payload.kycStatus) {
          list = list.filter(c => c.KycStatus === payload.kycStatus);
        }
        return list;
      }

      case 'saveCustomer': {
        const list = JSON.parse(localStorage.getItem(STORAGE_KEYS.CUSTOMERS) || '[]');
        const id = payload.CustomerId || ('CUST_' + Date.now());
        const code = payload.CustomerCode || ('SR' + Math.floor(10000 + Math.random() * 90000));
        const index = list.findIndex(c => c.CustomerId === id);

        const record = {
          ...payload,
          CustomerId: id,
          CustomerCode: code,
          CreatedAt: index >= 0 ? list[index].CreatedAt : new Date().toISOString(),
          UpdatedAt: new Date().toISOString()
        };

        if (index >= 0) {
          list[index] = record;
        } else {
          list.push(record);
        }

        localStorage.setItem(STORAGE_KEYS.CUSTOMERS, JSON.stringify(list));
        return { customerId: id, customerCode: code, message: 'Customer saved successfully.' };
      }

      case 'deleteCustomer': {
        let list = JSON.parse(localStorage.getItem(STORAGE_KEYS.CUSTOMERS) || '[]');
        list = list.filter(c => c.CustomerId !== payload.customerId);
        localStorage.setItem(STORAGE_KEYS.CUSTOMERS, JSON.stringify(list));
        return { success: true, message: 'Customer removed.' };
      }

      case 'getEmployees': {
        let list = JSON.parse(localStorage.getItem(STORAGE_KEYS.EMPLOYEES) || '[]');
        if (payload.search) {
          const q = payload.search.toLowerCase();
          list = list.filter(e =>
            (e.FullName && e.FullName.toLowerCase().includes(q)) ||
            (e.EmployeeCode && e.EmployeeCode.toLowerCase().includes(q)) ||
            (e.Email && e.Email.toLowerCase().includes(q)) ||
            (e.Department && e.Department.toLowerCase().includes(q))
          );
        }
        return list;
      }

      case 'saveEmployee': {
        const list = JSON.parse(localStorage.getItem(STORAGE_KEYS.EMPLOYEES) || '[]');
        const id = payload.EmployeeId || ('EMP_' + Date.now());
        const index = list.findIndex(e => e.EmployeeId === id);

        let photoUrl = payload.PhotoUrl;
        if (payload.image && payload.image.base64) {
          photoUrl = payload.image.base64; // In demo mode, store base64 directly
        }

        const record = {
          ...payload,
          EmployeeId: id,
          PhotoUrl: photoUrl || list[index]?.PhotoUrl || '',
          CreatedAt: index >= 0 ? list[index].CreatedAt : new Date().toISOString(),
          UpdatedAt: new Date().toISOString()
        };

        if (index >= 0) {
          list[index] = record;
        } else {
          list.push(record);
        }

        localStorage.setItem(STORAGE_KEYS.EMPLOYEES, JSON.stringify(list));
        return { employeeId: id, message: 'Staff saved successfully.' };
      }

      case 'deleteEmployee': {
        let list = JSON.parse(localStorage.getItem(STORAGE_KEYS.EMPLOYEES) || '[]');
        list = list.filter(e => e.EmployeeId !== payload.employeeId);
        localStorage.setItem(STORAGE_KEYS.EMPLOYEES, JSON.stringify(list));
        return { success: true, message: 'Staff member removed.' };
      }

      case 'getCompanySettings': {
        return JSON.parse(localStorage.getItem(STORAGE_KEYS.SETTINGS) || JSON.stringify(SEED_DATA.settings));
      }

      case 'saveCompanySettings': {
        localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(payload));
        return { success: true, message: 'Company settings saved.' };
      }

      case 'getRolesRights': {
        return JSON.parse(localStorage.getItem(STORAGE_KEYS.RIGHTS) || JSON.stringify(SEED_DATA.rights));
      }

      case 'saveRolesRights': {
        localStorage.setItem(STORAGE_KEYS.RIGHTS, JSON.stringify(payload));
        return { success: true, message: 'Role permissions saved.' };
      }

      case 'updateUserProfile': {
        return { success: true, message: 'User profile updated.' };
      }

      case 'changePassword': {
        if (!payload.newPassword || payload.newPassword.length < 6) {
          throw new Error('New password must be at least 6 characters.');
        }
        return { success: true, message: 'Password updated successfully.' };
      }

      default:
        throw new Error('Unknown demo action: ' + action);
    }
  }
};

