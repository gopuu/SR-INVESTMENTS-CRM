/**
 * SR INVESTMENTS CRM - Unified API Client (Blue Family Edition)
 * 
 * Features:
 * 1. Multi-credential login: staffId / emailId / mobileNo + password
 * 2. Login with Google (matches primary or any registered Google email)
 * 3. Auto-increment Employee Code (SR-EMP01, SR-EMP02, etc.)
 * 4. Multi-email support for staff (multiple Google IDs)
 * 5. Bulk Mailing with Amazon SES integration & billing estimates
 * 6. Google Drive complete ZIP backup
 */

const STORAGE_KEYS = {
  CONFIG_URL: 'sr_crm_gas_url',
  DEMO_MODE: 'sr_crm_demo_mode',
  CUSTOMERS: 'sr_crm_demo_customers',
  EMPLOYEES: 'sr_crm_demo_employees',
  SETTINGS: 'sr_crm_demo_settings',
  RIGHTS: 'sr_crm_demo_rights',
  CAMPAIGNS: 'sr_crm_demo_campaigns',
  AUDIT_LOGS: 'sr_crm_demo_audit_logs'
};

const SEED_DATA = {
  settings: {
    COMPANY_NAME: 'SR INVESTMENTS',
    ARN_NUMBER: 'ARN-189241',
    EUIN_NUMBER: 'E345678',
    GSTIN: '27AAACR1234F1Z5',
    SUPPORT_EMAIL: 'support@srinvestments.com',
    CONTACT_PHONE: '+91 98765 43210',
    OFFICE_ADDRESS: '101, Fortune Hub, Financial District, Bandra-Kurla Complex, Mumbai 400051',
    // Amazon SES configuration
    SES_REGION: 'ap-south-1',
    SES_SENDER_EMAIL: 'notifications@srinvestments.com',
    SES_ACCESS_KEY: 'AKIA_DEMO_SR_INVESTMENTS',
    SES_SECRET_KEY: 'wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY'
  },
  employees: [
    {
      EmployeeId: 'EMP_001',
      EmployeeCode: 'SR-EMP01',
      FullName: 'Rajesh Sharma',
      Email: 'rajesh@srinvestments.com',
      GoogleEmails: 'rajesh.sharma.mf@gmail.com, rajesh.sr@gmail.com',
      Mobile: '+91 98201 11223',
      Department: 'Wealth Management',
      Designation: 'Senior Investment Advisor',
      Role: 'Admin',
      Password: 'password123',
      JoiningDate: '2022-04-15',
      Status: 'Active',
      Address: '402, Sea Crest Towers',
      City: 'Mumbai',
      State: 'Maharashtra',
      PhotoUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      DriveFileId: '',
      IsDeleted: false,
      Created_By: 'system@srinvestments.com',
      Created_At: '2022-04-15T10:00:00Z',
      Updated_By: 'admin@srinvestments.com',
      Updated_At: '2026-08-10T12:00:00Z',
      Deleted_By: '',
      Deleted_At: ''
    },
    {
      EmployeeId: 'EMP_002',
      EmployeeCode: 'SR-EMP02',
      FullName: 'Pooja Mehta',
      Email: 'pooja.m@srinvestments.com',
      GoogleEmails: 'pooja.mehta.crm@gmail.com',
      Mobile: '+91 98199 44556',
      Department: 'Operations & KYC',
      Designation: 'Operations Executive',
      Role: 'Backoffice Staff',
      Password: 'password123',
      JoiningDate: '2023-01-10',
      Status: 'Active',
      Address: 'B-12, Green Park',
      City: 'Pune',
      State: 'Maharashtra',
      PhotoUrl: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80',
      DriveFileId: '',
      IsDeleted: false,
      Created_By: 'rajesh@srinvestments.com',
      Created_At: '2023-01-10T10:00:00Z',
      Updated_By: 'admin@srinvestments.com',
      Updated_At: '2026-07-22T14:30:00Z',
      Deleted_By: '',
      Deleted_At: ''
    },
    {
      EmployeeId: 'EMP_003',
      EmployeeCode: 'SR-EMP03',
      FullName: 'Amit Verma',
      Email: 'amit.v@srinvestments.com',
      GoogleEmails: 'amit.invest@gmail.com',
      Mobile: '+91 98330 99887',
      Department: 'Mutual Funds',
      Designation: 'Mutual Fund Analyst',
      Role: 'Staff',
      Password: 'password123',
      JoiningDate: '2023-09-01',
      Status: 'Active',
      Address: '701, Sun City',
      City: 'Ahmedabad',
      State: 'Gujarat',
      PhotoUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
      DriveFileId: '',
      IsDeleted: false,
      Created_By: 'rajesh@srinvestments.com',
      Created_At: '2023-09-01T10:00:00Z',
      Updated_By: 'admin@srinvestments.com',
      Updated_At: '2026-09-15T09:00:00Z',
      Deleted_By: '',
      Deleted_At: ''
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
      Notes: 'Prefers equity diversified SIPs. Portfolio: ₹45 Lakhs',
      IsDeleted: false,
      Created_By: 'pooja.m@srinvestments.com',
      Created_At: '2024-02-10T11:20:00Z',
      Updated_By: 'rajesh@srinvestments.com',
      Updated_At: '2026-08-14T16:00:00Z',
      Deleted_By: '',
      Deleted_At: ''
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
      IsDeleted: false,
      Created_By: 'pooja.m@srinvestments.com',
      Created_At: '2024-05-18T14:10:00Z',
      Updated_By: 'pooja.m@srinvestments.com',
      Updated_At: '2026-09-02T10:30:00Z',
      Deleted_By: '',
      Deleted_At: ''
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
      IsDeleted: false,
      Created_By: 'amit.v@srinvestments.com',
      Created_At: '2026-01-12T09:45:00Z',
      Updated_By: 'amit.v@srinvestments.com',
      Updated_At: '2026-08-20T17:15:00Z',
      Deleted_By: '',
      Deleted_At: ''
    }
  ],
  rights: [
    { Role: 'Admin', Module: 'Dashboard', CanView: true, CanCreate: true, CanEdit: true, CanDelete: true },
    { Role: 'Admin', Module: 'Customers', CanView: true, CanCreate: true, CanEdit: true, CanDelete: true },
    { Role: 'Admin', Module: 'Staff', CanView: true, CanCreate: true, CanEdit: true, CanDelete: true },
    { Role: 'Admin', Module: 'BulkMail', CanView: true, CanCreate: true, CanEdit: true, CanDelete: true },
    { Role: 'Admin', Module: 'Settings', CanView: true, CanCreate: true, CanEdit: true, CanDelete: true },
    { Role: 'Admin', Module: 'DriveBackup', CanView: true, CanCreate: true, CanEdit: true, CanDelete: true },
    { Role: 'Relationship Manager', Module: 'Dashboard', CanView: true, CanCreate: false, CanEdit: false, CanDelete: false },
    { Role: 'Relationship Manager', Module: 'Customers', CanView: true, CanCreate: true, CanEdit: true, CanDelete: false },
    { Role: 'Relationship Manager', Module: 'Staff', CanView: true, CanCreate: false, CanEdit: false, CanDelete: false },
    { Role: 'Relationship Manager', Module: 'BulkMail', CanView: true, CanCreate: true, CanEdit: false, CanDelete: false },
    { Role: 'Relationship Manager', Module: 'Settings', CanView: false, CanCreate: false, CanEdit: false, CanDelete: false },
    { Role: 'Relationship Manager', Module: 'DriveBackup', CanView: false, CanCreate: false, CanEdit: false, CanDelete: false },
    { Role: 'Backoffice Staff', Module: 'Dashboard', CanView: true, CanCreate: false, CanEdit: false, CanDelete: false },
    { Role: 'Backoffice Staff', Module: 'Customers', CanView: true, CanCreate: true, CanEdit: true, CanDelete: false },
    { Role: 'Backoffice Staff', Module: 'Staff', CanView: false, CanCreate: false, CanEdit: false, CanDelete: false },
    { Role: 'Backoffice Staff', Module: 'BulkMail', CanView: true, CanCreate: true, CanEdit: false, CanDelete: false },
    { Role: 'Backoffice Staff', Module: 'Settings', CanView: false, CanCreate: false, CanEdit: false, CanDelete: false },
    { Role: 'Backoffice Staff', Module: 'DriveBackup', CanView: false, CanCreate: false, CanEdit: false, CanDelete: false }
  ],
  campaigns: [
    {
      campaignId: 'SEBI-AUD-2026-0814-01',
      timestamp: '2026-08-14T10:30:00Z',
      auditRef: 'SEBI/MF/DISP/2026/0814',
      target: 'customers',
      mode: 'personalized',
      category: 'Quarterly Portfolio CAS & Risk-o-meter Notice',
      recipientCount: 45,
      subject: 'Important Mutual Fund Portfolio Update & CAS Notice - SR INVESTMENTS',
      senderEmail: 'notifications@srinvestments.com',
      awsRegion: 'ap-south-1',
      gateway: 'Amazon SES (TLS 1.3 / DKIM Verified)',
      sebiCompliant: 'Yes (Statutory Disclaimer Included)',
      status: 'Audited & Delivered',
      sesMessageIdPrefix: '0100018a123f49b0-9f12',
      sha256Hash: 'a8f5c3b991d743e1208947621fde54b73210',
      estimatedCostUSD: '$0.0045',
      estimatedCostINR: '₹0.39'
    },
    {
      campaignId: 'SEBI-AUD-2026-0720-02',
      timestamp: '2026-07-20T14:15:00Z',
      auditRef: 'SEBI/MF/DISP/2026/0720',
      target: 'customers',
      mode: 'common',
      category: 'Annual Commission & Fee Transparency Disclosure',
      recipientCount: 120,
      subject: 'Annual Regulatory Disclosure: AMFI Commission & Brokerage Structure',
      senderEmail: 'compliance@srinvestments.com',
      awsRegion: 'ap-south-1',
      gateway: 'Amazon SES (TLS 1.3 / DKIM Verified)',
      sebiCompliant: 'Yes (Statutory Disclaimer Included)',
      status: 'Audited & Delivered',
      sesMessageIdPrefix: '01000189b418a09e-77d1',
      sha256Hash: 'b71239aa8841029487c61f52b0981e471902',
      estimatedCostUSD: '$0.0120',
      estimatedCostINR: '₹1.04'
    },
    {
      campaignId: 'SEBI-AUD-2026-0610-03',
      timestamp: '2026-06-10T09:45:00Z',
      auditRef: 'SEBI/MF/DISP/2026/0610',
      target: 'employees',
      mode: 'common',
      category: 'Internal Advisory Staff Code of Conduct Circular',
      recipientCount: 12,
      subject: 'Internal Compliance Directive: SEBI Adherence for Mutual Fund Advisory',
      senderEmail: 'compliance@srinvestments.com',
      awsRegion: 'ap-south-1',
      gateway: 'Amazon SES (TLS 1.3 / DKIM Verified)',
      sebiCompliant: 'Yes (Statutory Disclaimer Included)',
      status: 'Audited & Delivered',
      sesMessageIdPrefix: '01000187cf29411a-44e2',
      sha256Hash: 'e49982701fbc3409187361adbc8947112033',
      estimatedCostUSD: '$0.0012',
      estimatedCostINR: '₹0.10'
    }
  ]
};

// Realistic mock Indian investor names for generating authentic SEBI compliance logs
const MOCK_FIRST_NAMES = [
  'Rajesh', 'Pooja', 'Amit', 'Vikramaditya', 'Ananya', 'Rohan', 'Sneha', 'Arun', 'Priya', 'Kavita',
  'Sanjay', 'Meera', 'Sunil', 'Divya', 'Gaurav', 'Aditi', 'Alok', 'Shweta', 'Nikhil', 'Deepa',
  'Suresh', 'Manish', 'Ritu', 'Kishore', 'Bhavna', 'Harish', 'Swati', 'Vinay', 'Tarun', 'Archana',
  'Naveen', 'Ramesh', 'Rashmi', 'Vivek', 'Pallavi', 'Santosh', 'Neelam', 'Ajay', 'Shilpa', 'Mohit',
  'Preeti', 'Abhishek', 'Anita', 'Pradeep', 'Jyoti', 'Satish', 'Varun', 'Sarita', 'Pankaj', 'Komal'
];

const MOCK_LAST_NAMES = [
  'Sharma', 'Mehta', 'Verma', 'Roy', 'Deshmukh', 'Patel', 'Joshi', 'Gupta', 'Menon', 'Nair',
  'Iyer', 'Singhania', 'Agarwal', 'Chopra', 'Bhatia', 'Malhotra', 'Reddy', 'Rao', 'Kulkarni', 'Bansal',
  'Jain', 'Saxena', 'Pandey', 'Mishra', 'Trivedi', 'Shah', 'Mukherjee', 'Chatterjee', 'Sen', 'Dutta'
];

const MOCK_DOMAINS = ['gmail.com', 'yahoo.co.in', 'outlook.com', 'hotmail.com', 'icicibank.com', 'hdfcbank.com', 'tcs.com', 'infosys.com'];
const MOCK_PAN_PREFIXES = ['ABCDE', 'BKRPD', 'CKNPA', 'DFGPM', 'EHKPR', 'FNLPK', 'GJMPJ', 'HMQPZ', 'IPRPK', 'JQSPT'];

/**
 * Generates or retrieves individual recipient transmission logs for a campaign (e.g. 120 emails).
 */
export function getOrGenerateCampaignRecipientLogs(campaignId) {
  const storageKey = `sr_crm_recipient_logs_${campaignId}`;
  const stored = localStorage.getItem(storageKey);
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch (e) {
      // fallback to generation
    }
  }

  // Find campaign details
  const campaigns = JSON.parse(localStorage.getItem(STORAGE_KEYS.CAMPAIGNS) || JSON.stringify(SEED_DATA.campaigns));
  const campaign = campaigns.find(c => c.campaignId === campaignId || c.auditRef === campaignId) || {
    campaignId: campaignId,
    auditRef: 'SEBI/MF/DISP/2026/0720',
    target: 'customers',
    recipientCount: 120,
    timestamp: '2026-07-20T14:15:00Z',
    subject: 'Annual Regulatory Disclosure: AMFI Commission & Brokerage Structure',
    sesMessageIdPrefix: '01000189b418a09e'
  };

  const count = campaign.recipientCount || 120;
  const isEmployee = campaign.target === 'employees';
  const baseTime = new Date(campaign.timestamp || '2026-07-20T14:15:00Z').getTime();
  const prefix = campaign.sesMessageIdPrefix || '01000189b418a09e';

  const logs = [];
  for (let i = 0; i < count; i++) {
    const fn = MOCK_FIRST_NAMES[i % MOCK_FIRST_NAMES.length];
    const ln = MOCK_LAST_NAMES[(i * 3 + Math.floor(i / 7)) % MOCK_LAST_NAMES.length];
    const domain = MOCK_DOMAINS[i % MOCK_DOMAINS.length];
    const panPrefix = MOCK_PAN_PREFIXES[i % MOCK_PAN_PREFIXES.length];
    const panNum = `${panPrefix}${String(1000 + ((i * 47) % 8999))}${String.fromCharCode(65 + ((i * 7) % 26))}`;
    const code = isEmployee ? `SR-EMP${String((i % 12) + 1).padStart(2, '0')}` : `SR-CUST${String(100 + i + 1)}`;
    const email = `${fn.toLowerCase()}.${ln.toLowerCase()}${i > 30 ? (i + 1) : ''}@${domain}`;
    const mobile = `+91 98${String(10000000 + (i * 82731) % 89999999)}`;
    const sentTime = new Date(baseTime + i * 280).toISOString(); // Dispatched at ~3-4 emails/sec
    const hex1 = ((i * 1234567) % 0xffffff).toString(16).padStart(6, '0');
    const hex2 = ((i * 7654321) % 0xffffff).toString(16).padStart(6, '0');
    const sesMsgId = `${prefix}-${hex1}-${hex2}-000000`;
    const hash = Array.from(new Uint8Array(16)).map((_, idx) => ((i * 17 + idx * 31) % 256).toString(16).padStart(2, '0')).join('');

    // Delivery Status distribution: ~78% Opened, ~20% Delivered, ~2% Bounced
    let status = 'Delivered';
    let smtpCode = '250 2.0.0 OK: Message accepted for delivery';
    let bounceReason = null;

    if (i === 17 || i === 83) {
      status = 'Bounced';
      smtpCode = '552 5.2.2 Mailbox quota exceeded';
      bounceReason = 'Soft Bounce: Recipient mailbox is full. Amazon SES retry policy exhausted.';
    } else if (i % 5 !== 0) {
      status = 'Opened';
      smtpCode = '250 2.1.5 Recipient OK (Read receipt confirmed)';
    }

    logs.push({
      logId: `LOG-${campaignId.slice(-6)}-${String(i + 1).padStart(4, '0')}`,
      campaignId: campaign.campaignId,
      auditRef: campaign.auditRef,
      recipientIndex: i + 1,
      fullName: `${fn} ${ln}`,
      recipientCode: code,
      email: email,
      panNumber: panNum,
      mobile: mobile,
      dispatchedAt: sentTime,
      sesMessageId: sesMsgId,
      status: status,
      smtpResponse: smtpCode,
      bounceReason: bounceReason,
      gateway: 'Amazon SES (ap-south-1 MTA)',
      tlsCipher: 'TLS 1.3 / ECDHE-RSA-AES128-GCM-SHA256',
      ipAddress: `23.251.234.${10 + (i % 60)}`,
      sebiDisclaimer: 'Statutory Disclaimer & Risk-o-meter Notice Embedded',
      digitalHash: hash,
      messageSizeKb: (14.2 + (i % 7) * 0.4).toFixed(1)
    });
  }

  try {
    localStorage.setItem(storageKey, JSON.stringify(logs));
  } catch (e) {
    // quota safe
  }
  return logs;
}

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
  if (!localStorage.getItem(STORAGE_KEYS.CAMPAIGNS)) {
    localStorage.setItem(STORAGE_KEYS.CAMPAIGNS, JSON.stringify(SEED_DATA.campaigns));
  }
  if (!localStorage.getItem(STORAGE_KEYS.AUDIT_LOGS)) {
    localStorage.setItem(STORAGE_KEYS.AUDIT_LOGS, JSON.stringify(SEED_AUDIT_LOGS));
  }
}

const SEED_AUDIT_LOGS = [
  {
    LogId: 'LOG_20260814_001',
    Timestamp: '2026-08-14T16:00:00Z',
    UserEmail: 'admin@srinvestments.com',
    Action: 'UPDATE',
    Module: 'Customers',
    RecordId: 'SR90421',
    Details: 'Updated investor risk profile to Aggressive for Vikramaditya Roy'
  },
  {
    LogId: 'LOG_20260810_002',
    Timestamp: '2026-08-10T12:00:00Z',
    UserEmail: 'admin@srinvestments.com',
    Action: 'CREATE',
    Module: 'Staff',
    RecordId: 'SR-EMP01',
    Details: 'Created staff Rajesh Sharma (Senior Investment Advisor)'
  },
  {
    LogId: 'LOG_20260720_003',
    Timestamp: '2026-07-20T14:15:00Z',
    UserEmail: 'compliance@srinvestments.com',
    Action: 'BULK_MAIL',
    Module: 'BulkMail',
    RecordId: 'SEBI-AUD-2026-0720-02',
    Details: 'Dispatched 120 emails: Annual Commission & Fee Transparency Disclosure'
  }
];

export function logAuditLocal(userEmail, action, module, recordId, details) {
  try {
    const list = JSON.parse(localStorage.getItem(STORAGE_KEYS.AUDIT_LOGS) || JSON.stringify(SEED_AUDIT_LOGS));
    const newEntry = {
      LogId: 'LOG_' + Date.now().toString().slice(-8),
      Timestamp: new Date().toISOString(),
      UserEmail: userEmail || 'admin@srinvestments.com',
      Action: action,
      Module: module,
      RecordId: recordId || '',
      Details: details || ''
    };
    list.unshift(newEntry);
    localStorage.setItem(STORAGE_KEYS.AUDIT_LOGS, JSON.stringify(list));
  } catch (e) {
    console.warn('Failed to save local audit log:', e);
  }
}

// Next autoincrement employee code generator
export function getNextEmployeeCode(employees = []) {
  let maxNum = 0;
  employees.forEach(emp => {
    if (emp.EmployeeCode && emp.EmployeeCode.startsWith('SR-EMP')) {
      const numStr = emp.EmployeeCode.replace('SR-EMP', '').trim();
      const num = parseInt(numStr, 10);
      if (!isNaN(num) && num > maxNum) {
        maxNum = num;
      }
    }
  });
  const nextNum = maxNum + 1;
  return `SR-EMP${String(nextNum).padStart(2, '0')}`;
}

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
    setTimeout(() => resolve(false), 7000);
  });

  return bridgeReadyPromise;
}

export const crmApi = {
  getBackendUrl() {
    return localStorage.getItem(STORAGE_KEYS.CONFIG_URL) || '';
  },

  setBackendUrl(url) {
    if (url) {
      localStorage.setItem(STORAGE_KEYS.CONFIG_URL, url.trim());
    } else {
      localStorage.removeItem(STORAGE_KEYS.CONFIG_URL);
    }
  },

  isDemoMode() {
    const url = this.getBackendUrl();
    if (!url || url.includes('PASTE_YOUR') || url.includes('PASTE_GOOGLE')) return true;
    return localStorage.getItem(STORAGE_KEYS.DEMO_MODE) === 'true';
  },

  setDemoMode(enabled) {
    localStorage.setItem(STORAGE_KEYS.DEMO_MODE, enabled ? 'true' : 'false');
  },

  async call(action, payload = {}) {
    let currentUserEmail = 'admin@srinvestments.com';
    let currentUserName = 'Administrator';
    try {
      const stored = localStorage.getItem('sr_crm_auth_user');
      if (stored) {
        const u = JSON.parse(stored);
        if (u.email) currentUserEmail = u.email;
        if (u.name) currentUserName = u.name;
      }
    } catch (e) {}

    const enrichedPayload = {
      ...payload,
      userEmail: payload.userEmail || currentUserEmail,
      userName: payload.userName || currentUserName
    };

    if (this.isDemoMode()) {
      return this.handleDemoAction(action, enrichedPayload);
    }

    const gasUrl = this.getBackendUrl();

    // 1. Direct fetch
    try {
      const response = await fetch(gasUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'text/plain;charset=utf-8'
        },
        body: JSON.stringify({ action, payload: enrichedPayload }),
        redirect: 'follow'
      });

      if (response.ok) {
        const json = await response.json();
        if (json.success) return json.data;
        throw new Error(json.message || 'Server error');
      }
    } catch (fetchErr) {
      console.warn('Direct fetch failed, falling back to bridge...', fetchErr);
    }

    // 2. Iframe Bridge
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
          payload: enrichedPayload
        }, '*');

        setTimeout(() => {
          if (bridgePending.has(requestId)) {
            bridgePending.delete(requestId);
            reject(new Error('Request timed out (20s).'));
          }
        }, 20000);
      });
    } catch (bridgeErr) {
      console.error('All live transports failed:', bridgeErr);
      throw new Error(bridgeErr.message || 'Unable to communicate with Google Apps Script backend.');
    }
  },

  async handleDemoAction(action, payload) {
    initDemoStore();
    await new Promise((r) => setTimeout(r, 150));

    switch (action) {
      case 'health':
        return { ok: true, mode: 'Demo / Local Storage', timestamp: new Date().toISOString() };

      // Multi-credential login: staffId / emailId / mobileNo + password
      case 'login': {
        const { username, password } = payload;
        if (!username || !password) throw new Error('Username and password are required.');

        const cleanInput = username.trim().toLowerCase();
        const cleanMobile = username.trim().replace(/[\s\-\(\)\+]/g, '');

        const employees = JSON.parse(localStorage.getItem(STORAGE_KEYS.EMPLOYEES) || '[]');

        // Check if admin default
        if (cleanInput === 'admin' || cleanInput === 'admin@srinvestments.com') {
          if (password === 'admin123' || password === 'password123') {
            return {
              user: {
                userId: 'USR_001',
                employeeCode: 'SR-ADMIN',
                name: 'System Administrator',
                email: 'admin@srinvestments.com',
                mobile: '+91 98765 43210',
                role: 'Admin',
                status: 'Active',
                lastLogin: new Date().toISOString()
              },
              rights: JSON.parse(localStorage.getItem(STORAGE_KEYS.RIGHTS) || '[]'),
              token: 'TOKEN_' + Date.now()
            };
          }
        }

        // Search employees by:
        // 1. EmployeeCode (staffId)
        // 2. Primary Email
        // 3. Registered Google Emails list
        // 4. Mobile Number
        const staff = employees.find((e) => {
          const matchCode = e.EmployeeCode && e.EmployeeCode.trim().toLowerCase() === cleanInput;
          const matchEmail = e.Email && e.Email.trim().toLowerCase() === cleanInput;
          const matchGoogleEmails = e.GoogleEmails && e.GoogleEmails.toLowerCase().split(',').map(s => s.trim()).includes(cleanInput);
          const empMobileClean = e.Mobile ? e.Mobile.replace(/[\s\-\(\)\+]/g, '') : '';
          const matchMobile = empMobileClean && empMobileClean === cleanMobile;

          return matchCode || matchEmail || matchGoogleEmails || matchMobile;
        });

        if (!staff) {
          throw new Error('No staff account found for this Username / Staff ID / Email / Mobile.');
        }

        if (staff.Status !== 'Active') {
          throw new Error('This account is inactive. Please contact your CRM Administrator.');
        }

        // Verify password
        const expectedPassword = staff.Password || 'password123';
        if (password !== expectedPassword && password !== 'admin123' && password !== 'password123') {
          throw new Error('Invalid password.');
        }

        return {
          user: {
            userId: staff.EmployeeId,
            employeeCode: staff.EmployeeCode,
            name: staff.FullName,
            email: staff.Email,
            googleEmails: staff.GoogleEmails,
            mobile: staff.Mobile,
            role: staff.Role || 'Staff',
            department: staff.Department,
            status: staff.Status,
            lastLogin: new Date().toISOString()
          },
          rights: JSON.parse(localStorage.getItem(STORAGE_KEYS.RIGHTS) || '[]'),
          token: 'TOKEN_' + Date.now()
        };
      }

      // Login with Google (matches any staff registered primary or additional Google email)
      case 'googleLogin': {
        const { googleEmail, googleName } = payload;
        if (!googleEmail) throw new Error('Google email required.');

        const cleanEmail = googleEmail.trim().toLowerCase();
        const employees = JSON.parse(localStorage.getItem(STORAGE_KEYS.EMPLOYEES) || '[]');

        // Check if admin email
        if (cleanEmail === 'admin@srinvestments.com' || cleanEmail.includes('admin')) {
          return {
            user: {
              userId: 'USR_001',
              employeeCode: 'SR-ADMIN',
              name: googleName || 'System Administrator',
              email: cleanEmail,
              mobile: '+91 98765 43210',
              role: 'Admin',
              status: 'Active',
              lastLogin: new Date().toISOString()
            },
            rights: JSON.parse(localStorage.getItem(STORAGE_KEYS.RIGHTS) || '[]'),
            token: 'GOOGLE_TOKEN_' + Date.now()
          };
        }

        const staff = employees.find((e) => {
          const matchEmail = e.Email && e.Email.trim().toLowerCase() === cleanEmail;
          const matchGoogleEmails = e.GoogleEmails && e.GoogleEmails.toLowerCase().split(',').map(s => s.trim()).includes(cleanEmail);
          return matchEmail || matchGoogleEmails;
        });

        if (!staff) {
          throw new Error(`Google account (${cleanEmail}) is not registered in Staff Master. Please contact Admin to add this Google ID.`);
        }

        return {
          user: {
            userId: staff.EmployeeId,
            employeeCode: staff.EmployeeCode,
            name: staff.FullName,
            email: staff.Email,
            googleEmails: staff.GoogleEmails,
            mobile: staff.Mobile,
            role: staff.Role || 'Staff',
            department: staff.Department,
            status: staff.Status,
            lastLogin: new Date().toISOString()
          },
          rights: JSON.parse(localStorage.getItem(STORAGE_KEYS.RIGHTS) || '[]'),
          token: 'GOOGLE_TOKEN_' + Date.now()
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
        if (!payload.includeDeleted) {
          list = list.filter(c => !c.IsDeleted);
        }
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
        const userEmail = payload.userEmail || 'admin@srinvestments.com';
        const now = new Date().toISOString();
        const index = list.findIndex(c => c.CustomerId === id);
        const existing = index >= 0 ? list[index] : null;

        const isDeleted = existing ? Boolean(existing.IsDeleted) : false;
        const createdBy = existing ? (existing.Created_By || userEmail) : userEmail;
        const createdAt = existing ? (existing.Created_At || existing.CreatedAt || now) : now;
        const updatedBy = userEmail;
        const updatedAt = now;
        const deletedBy = existing ? (existing.Deleted_By || '') : '';
        const deletedAt = existing ? (existing.Deleted_At || '') : '';

        const record = {
          ...payload,
          CustomerId: id,
          CustomerCode: code,
          IsDeleted: isDeleted,
          Created_By: createdBy,
          Created_At: createdAt,
          Updated_By: updatedBy,
          Updated_At: updatedAt,
          Deleted_By: deletedBy,
          Deleted_At: deletedAt
        };

        if (index >= 0) {
          list[index] = record;
          logAuditLocal(userEmail, 'UPDATE', 'Customers', code, `Updated investor: ${record.FullName} (${code})`);
        } else {
          list.push(record);
          logAuditLocal(userEmail, 'CREATE', 'Customers', code, `Created investor: ${record.FullName} (${code})`);
        }

        localStorage.setItem(STORAGE_KEYS.CUSTOMERS, JSON.stringify(list));
        return { customerId: id, customerCode: code, message: 'Investor saved successfully.' };
      }

      // Soft-Delete Customer Always
      case 'deleteCustomer': {
        const customerId = payload.customerId || payload.CustomerId;
        const userEmail = payload.userEmail || 'admin@srinvestments.com';
        const list = JSON.parse(localStorage.getItem(STORAGE_KEYS.CUSTOMERS) || '[]');
        const index = list.findIndex(c => c.CustomerId === customerId);
        if (index !== -1) {
          const rec = list[index];
          rec.IsDeleted = true;
          rec.Deleted_By = userEmail;
          rec.Deleted_At = new Date().toISOString();
          localStorage.setItem(STORAGE_KEYS.CUSTOMERS, JSON.stringify(list));
          logAuditLocal(userEmail, 'SOFT_DELETE', 'Customers', rec.CustomerCode, `Soft-deleted investor: ${rec.FullName} (${rec.CustomerCode})`);
        }
        return { success: true, message: 'Customer soft-deleted successfully (retained in compliance audit archive).' };
      }

      // Restore Soft-Deleted Customer
      case 'restoreCustomer': {
        const customerId = payload.customerId || payload.CustomerId;
        const userEmail = payload.userEmail || 'admin@srinvestments.com';
        const list = JSON.parse(localStorage.getItem(STORAGE_KEYS.CUSTOMERS) || '[]');
        const index = list.findIndex(c => c.CustomerId === customerId);
        if (index !== -1) {
          const rec = list[index];
          rec.IsDeleted = false;
          rec.Updated_By = userEmail;
          rec.Updated_At = new Date().toISOString();
          rec.Deleted_By = '';
          rec.Deleted_At = '';
          localStorage.setItem(STORAGE_KEYS.CUSTOMERS, JSON.stringify(list));
          logAuditLocal(userEmail, 'RESTORE', 'Customers', rec.CustomerCode, `Restored investor: ${rec.FullName} (${rec.CustomerCode})`);
        }
        return { success: true, message: 'Customer restored successfully.' };
      }

      case 'getEmployees': {
        let list = JSON.parse(localStorage.getItem(STORAGE_KEYS.EMPLOYEES) || '[]');
        if (!payload.includeDeleted) {
          list = list.filter(e => !e.IsDeleted);
        }
        if (payload.search) {
          const q = payload.search.toLowerCase();
          list = list.filter(e =>
            (e.FullName && e.FullName.toLowerCase().includes(q)) ||
            (e.EmployeeCode && e.EmployeeCode.toLowerCase().includes(q)) ||
            (e.Email && e.Email.toLowerCase().includes(q)) ||
            (e.GoogleEmails && e.GoogleEmails.toLowerCase().includes(q)) ||
            (e.Department && e.Department.toLowerCase().includes(q))
          );
        }
        return list;
      }

      case 'saveEmployee': {
        const list = JSON.parse(localStorage.getItem(STORAGE_KEYS.EMPLOYEES) || '[]');
        const id = payload.EmployeeId || ('EMP_' + Date.now());
        const userEmail = payload.userEmail || 'admin@srinvestments.com';
        const now = new Date().toISOString();
        const index = list.findIndex(e => e.EmployeeId === id);
        const existing = index >= 0 ? list[index] : null;

        // Auto-increment EmployeeCode if new (scans all rows including archived)
        let code = payload.EmployeeCode;
        if (!code || index === -1) {
          code = getNextEmployeeCode(list);
        }

        let photoUrl = payload.PhotoUrl;
        if (payload.image && payload.image.base64) {
          photoUrl = payload.image.base64;
        }

        const isDeleted = existing ? Boolean(existing.IsDeleted) : false;
        const createdBy = existing ? (existing.Created_By || userEmail) : userEmail;
        const createdAt = existing ? (existing.Created_At || existing.CreatedAt || now) : now;
        const updatedBy = userEmail;
        const updatedAt = now;
        const deletedBy = existing ? (existing.Deleted_By || '') : '';
        const deletedAt = existing ? (existing.Deleted_At || '') : '';

        const record = {
          ...payload,
          EmployeeId: id,
          EmployeeCode: code,
          GoogleEmails: payload.GoogleEmails || '',
          PhotoUrl: photoUrl || list[index]?.PhotoUrl || '',
          IsDeleted: isDeleted,
          Created_By: createdBy,
          Created_At: createdAt,
          Updated_By: updatedBy,
          Updated_At: updatedAt,
          Deleted_By: deletedBy,
          Deleted_At: deletedAt
        };

        if (index >= 0) {
          list[index] = record;
          logAuditLocal(userEmail, 'UPDATE', 'Staff', code, `Updated staff: ${record.FullName} (${code})`);
        } else {
          list.push(record);
          logAuditLocal(userEmail, 'CREATE', 'Staff', code, `Created staff: ${record.FullName} (${code})`);
        }

        localStorage.setItem(STORAGE_KEYS.EMPLOYEES, JSON.stringify(list));
        return { employeeId: id, employeeCode: code, message: `Staff ${code} saved successfully.` };
      }

      // Soft-Delete Employee Always
      case 'deleteEmployee': {
        const empId = payload.employeeId || payload.EmployeeId;
        const userEmail = payload.userEmail || 'admin@srinvestments.com';
        const list = JSON.parse(localStorage.getItem(STORAGE_KEYS.EMPLOYEES) || '[]');
        const index = list.findIndex(e => e.EmployeeId === empId);
        if (index !== -1) {
          const rec = list[index];
          rec.IsDeleted = true;
          rec.Deleted_By = userEmail;
          rec.Deleted_At = new Date().toISOString();
          localStorage.setItem(STORAGE_KEYS.EMPLOYEES, JSON.stringify(list));
          logAuditLocal(userEmail, 'SOFT_DELETE', 'Staff', rec.EmployeeCode, `Soft-deleted staff member: ${rec.FullName} (${rec.EmployeeCode})`);
        }
        return { success: true, message: 'Staff member soft-deleted successfully (retained in compliance audit archive).' };
      }

      // Restore Soft-Deleted Employee
      case 'restoreEmployee': {
        const empId = payload.employeeId || payload.EmployeeId;
        const userEmail = payload.userEmail || 'admin@srinvestments.com';
        const list = JSON.parse(localStorage.getItem(STORAGE_KEYS.EMPLOYEES) || '[]');
        const index = list.findIndex(e => e.EmployeeId === empId);
        if (index !== -1) {
          const rec = list[index];
          rec.IsDeleted = false;
          rec.Updated_By = userEmail;
          rec.Updated_At = new Date().toISOString();
          rec.Deleted_By = '';
          rec.Deleted_At = '';
          localStorage.setItem(STORAGE_KEYS.EMPLOYEES, JSON.stringify(list));
          logAuditLocal(userEmail, 'RESTORE', 'Staff', rec.EmployeeCode, `Restored staff member: ${rec.FullName} (${rec.EmployeeCode})`);
        }
        return { success: true, message: 'Staff member restored successfully.' };
      }

      // Audit Logs Register
      case 'getAuditLogs': {
        let list = JSON.parse(localStorage.getItem(STORAGE_KEYS.AUDIT_LOGS) || JSON.stringify(SEED_AUDIT_LOGS));
        if (payload.module && payload.module !== 'all') {
          list = list.filter(a => a.Module === payload.module);
        }
        if (payload.search) {
          const q = payload.search.toLowerCase();
          list = list.filter(a =>
            (a.Action && a.Action.toLowerCase().includes(q)) ||
            (a.UserEmail && a.UserEmail.toLowerCase().includes(q)) ||
            (a.RecordId && a.RecordId.toLowerCase().includes(q)) ||
            (a.Details && a.Details.toLowerCase().includes(q))
          );
        }
        return list;
      }

      // Bulk Mailing with Amazon SES Integration
      case 'sendBulkEmail': {
        const { target, recipients, mode, subject, content, attachment, sesConfig } = payload;
        if (!recipients || !recipients.length) throw new Error('No recipients selected.');
        if (!subject || !content) throw new Error('Subject and message content are required.');

        // Calculate Amazon SES estimated billing
        // SES standard rate: $0.10 per 1,000 emails ($0.0001 per email)
        const recipientCount = recipients.length;
        const estCostUSD = (recipientCount * 0.0001).toFixed(4);
        const estCostINR = (recipientCount * 0.0001 * 86.5).toFixed(2); // ~86.5 INR/USD

        const campaignId = 'SEBI-AUD-' + Date.now().toString().slice(-8);
        const auditRef = 'SEBI/MF/DISP/' + new Date().getFullYear() + '/' + Date.now().toString().slice(-6);
        const hash = Array.from(crypto.getRandomValues(new Uint8Array(16))).map(b => b.toString(16).padStart(2, '0')).join('');

        const campaignLog = {
          campaignId,
          auditRef,
          timestamp: new Date().toISOString(),
          target,
          mode,
          category: payload.category || 'Statutory Portfolio & Advisory Communication',
          recipientCount,
          subject,
          senderEmail: sesConfig?.senderEmail || 'notifications@srinvestments.com',
          awsRegion: sesConfig?.region || 'ap-south-1',
          gateway: 'Amazon SES (TLS 1.3 / DKIM Verified)',
          sebiCompliant: 'Yes (Statutory Disclaimer Included)',
          status: 'Audited & Delivered',
          sesMessageIdPrefix: '010001' + Math.random().toString(36).substring(2, 10),
          sha256Hash: hash,
          estimatedCostUSD: `$${estCostUSD}`,
          estimatedCostINR: `₹${estCostINR}`
        };

        const existingCampaigns = JSON.parse(localStorage.getItem(STORAGE_KEYS.CAMPAIGNS) || '[]');
        existingCampaigns.unshift(campaignLog);
        localStorage.setItem(STORAGE_KEYS.CAMPAIGNS, JSON.stringify(existingCampaigns));

        // Create individual recipient transmission logs for SEBI audit
        const individualLogs = recipients.map((rec, idx) => {
          const recName = rec.FullName || rec.name || 'Valued Investor';
          const recEmail = rec.Email || rec.email || 'investor@example.com';
          const recCode = rec.CustomerCode || rec.EmployeeCode || `REC-${idx + 1}`;
          const recPan = rec.PanNumber || 'PAN-NOT-AVAIL';
          const hex1 = ((idx * 13579) % 0xffffff).toString(16).padStart(6, '0');
          const hex2 = ((idx * 97531) % 0xffffff).toString(16).padStart(6, '0');
          const sesMsgId = `${campaignLog.sesMessageIdPrefix}-${hex1}-${hex2}-000000`;
          const rowHash = Array.from(crypto.getRandomValues(new Uint8Array(16))).map(b => b.toString(16).padStart(2, '0')).join('');

          return {
            logId: `LOG-${campaignId.slice(-6)}-${String(idx + 1).padStart(4, '0')}`,
            campaignId,
            auditRef,
            recipientIndex: idx + 1,
            fullName: recName,
            recipientCode: recCode,
            email: recEmail,
            panNumber: recPan,
            mobile: rec.Mobile || '+91 98000 00000',
            dispatchedAt: new Date(Date.now() + idx * 250).toISOString(),
            sesMessageId: sesMsgId,
            status: idx % 11 === 0 ? 'Opened' : 'Delivered',
            smtpResponse: '250 2.0.0 OK: Message accepted for delivery by Amazon SES MTA',
            bounceReason: null,
            gateway: 'Amazon SES (ap-south-1 MTA)',
            tlsCipher: 'TLS 1.3 / ECDHE-RSA-AES128-GCM-SHA256',
            ipAddress: `23.251.234.${10 + (idx % 50)}`,
            sebiDisclaimer: 'Statutory Disclaimer & Risk-o-meter Notice Embedded',
            digitalHash: rowHash,
            messageSizeKb: (14.2 + (idx % 6) * 0.5).toFixed(1)
          };
        });

        localStorage.setItem(`sr_crm_recipient_logs_${campaignId}`, JSON.stringify(individualLogs));

        return {
          success: true,
          campaignId,
          recipientCount,
          estimatedCostUSD: `$${estCostUSD}`,
          estimatedCostINR: `₹${estCostINR}`,
          message: `Campaign sent successfully to ${recipientCount} ${target} via Amazon SES.`
        };
      }

      case 'getCampaignLogs': {
        return JSON.parse(localStorage.getItem(STORAGE_KEYS.CAMPAIGNS) || '[]');
      }

      case 'getCampaignRecipientLogs': {
        const { campaignId } = payload;
        return getOrGenerateCampaignRecipientLogs(campaignId);
      }

      // Drive Backup in ZIP format
      case 'downloadDriveBackup': {
        const customers = JSON.parse(localStorage.getItem(STORAGE_KEYS.CUSTOMERS) || '[]');
        const employees = JSON.parse(localStorage.getItem(STORAGE_KEYS.EMPLOYEES) || '[]');
        const settings = JSON.parse(localStorage.getItem(STORAGE_KEYS.SETTINGS) || '{}');

        // Create client-side downloadable backup JSON or manifest
        const backupPackage = {
          meta: {
            title: 'SR INVESTMENTS CRM - Full Database & File Backup',
            generatedAt: new Date().toISOString(),
            firm: 'SR INVESTMENTS (ARN-189241)',
            version: '2.0.0'
          },
          database: {
            customers,
            employees,
            settings
          }
        };

        const blob = new Blob([JSON.stringify(backupPackage, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        return {
          downloadUrl: url,
          fileName: `SR_Investments_Drive_Backup_${new Date().toISOString().slice(0, 10)}.zip`
        };
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
        return { success: true, message: 'Profile updated.' };
      }

      case 'changePassword': {
        if (!payload.newPassword || payload.newPassword.length < 6) {
          throw new Error('New password must be at least 6 characters.');
        }
        return { success: true, message: 'Password updated successfully.' };
      }

      default:
        throw new Error('Unknown action: ' + action);
    }
  }
};
