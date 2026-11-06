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
  AUDIT_LOGS: 'sr_crm_demo_audit_logs',
  TASKS: 'sr_crm_demo_tasks',
  TASK_CONFIG: 'sr_crm_demo_task_config',
  TODOS: 'sr_crm_demo_todos',
  NOTIFICATIONS: 'sr_crm_demo_notifications',
  SHOW_DELETED_GLOBALLY: 'sr_crm_show_deleted_globally',
  PERSONAL_NOTES: 'sr_crm_demo_notes'
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
  if (!localStorage.getItem(STORAGE_KEYS.TASK_CONFIG)) {
    localStorage.setItem(STORAGE_KEYS.TASK_CONFIG, JSON.stringify(SEED_TASK_CONFIG));
  }
  if (!localStorage.getItem(STORAGE_KEYS.TASKS)) {
    localStorage.setItem(STORAGE_KEYS.TASKS, JSON.stringify(SEED_TASKS));
  }
  if (!localStorage.getItem(STORAGE_KEYS.TODOS)) {
    localStorage.setItem(STORAGE_KEYS.TODOS, JSON.stringify(SEED_TODOS));
  }
  if (!localStorage.getItem(STORAGE_KEYS.NOTIFICATIONS)) {
    localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(SEED_NOTIFICATIONS));
  }
  if (!localStorage.getItem(STORAGE_KEYS.PERSONAL_NOTES)) {
    localStorage.setItem(STORAGE_KEYS.PERSONAL_NOTES, JSON.stringify(SEED_PERSONAL_NOTES));
  }
}

export const SEED_TASK_CONFIG = [
  { index: 1, name: 'Step 1: NEW' },
  { index: 2, name: 'Step 2: IN PROGRESS' },
  { index: 3, name: 'Step 3: REVIEW / PENDING' },
  { index: 4, name: 'Step 4: VERIFICATION' },
  { index: 5, name: 'Step 5: COMPLETED' }
];

export const SEED_TASKS = [
  {
    TaskId: 'TSK-101',
    Title: 'PAN-Aadhaar Linking Verification for HNI Clients',
    Description: 'Verify linkage status on Income Tax Portal for top 50 folio holders in compliance with SEBI circular.',
    StepIndex: 1,
    StepName: 'Step 1: NEW',
    Priority: 'High',
    AssigneeEmail: 'amit.v@srinvestments.com',
    AssigneeName: 'Amit Verma',
    ReporterEmail: 'admin@srinvestments.com',
    ReporterName: 'System Administrator',
    DueDate: '2026-11-15',
    Tags: 'Compliance, KYC, HNI',
    Comments: [
      { id: 'c1', author: 'Rajesh Sharma', timestamp: '2026-11-04T10:15:00Z', text: 'Checked first 10 accounts, 2 need status update from client.' }
    ],
    History: [
      { timestamp: '2026-11-03T09:00:00Z', author: 'System Administrator', action: 'Created task TSK-101 and assigned to Amit Verma' }
    ],
    IsDeleted: false,
    Created_By: 'admin@srinvestments.com',
    Created_At: '2026-11-03T09:00:00Z',
    Updated_By: 'admin@srinvestments.com',
    Updated_At: '2026-11-04T10:15:00Z',
    Deleted_By: '',
    Deleted_At: ''
  },
  {
    TaskId: 'TSK-102',
    Title: 'Quarterly Portfolio CAS & Risk-o-meter Dispatch',
    Description: 'Prepare Consolidated Account Statement template and dispatch via Amazon SES to active investor base.',
    StepIndex: 2,
    StepName: 'Step 2: IN PROGRESS',
    Priority: 'Urgent',
    AssigneeEmail: 'pooja.m@srinvestments.com',
    AssigneeName: 'Pooja Mehta',
    ReporterEmail: 'rajesh@srinvestments.com',
    ReporterName: 'Rajesh Sharma',
    DueDate: '2026-11-10',
    Tags: 'BulkMail, SES, Operations',
    Comments: [
      { id: 'c2', author: 'Pooja Mehta', timestamp: '2026-11-05T14:30:00Z', text: 'Test campaign sent to 5 internal accounts, formatting verified.' }
    ],
    History: [
      { timestamp: '2026-11-02T11:00:00Z', author: 'Rajesh Sharma', action: 'Task created' },
      { timestamp: '2026-11-04T16:00:00Z', author: 'Pooja Mehta', action: 'Moved from "Step 1: NEW" to "Step 2: IN PROGRESS"' }
    ],
    IsDeleted: false,
    Created_By: 'rajesh@srinvestments.com',
    Created_At: '2026-11-02T11:00:00Z',
    Updated_By: 'pooja.m@srinvestments.com',
    Updated_At: '2026-11-05T14:30:00Z',
    Deleted_By: '',
    Deleted_At: ''
  },
  {
    TaskId: 'TSK-103',
    Title: 'CKYC Remediation for Non-Compliant NRI Accounts',
    Description: 'Collect overseas address proofs and updated FATCA declarations from NRI investors.',
    StepIndex: 3,
    StepName: 'Step 3: REVIEW / PENDING',
    Priority: 'High',
    AssigneeEmail: 'rajesh@srinvestments.com',
    AssigneeName: 'Rajesh Sharma',
    ReporterEmail: 'admin@srinvestments.com',
    ReporterName: 'System Administrator',
    DueDate: '2026-11-20',
    Tags: 'NRI, CKYC, Compliance',
    Comments: [],
    History: [
      { timestamp: '2026-11-01T10:00:00Z', author: 'System Administrator', action: 'Task created' },
      { timestamp: '2026-11-04T12:00:00Z', author: 'Rajesh Sharma', action: 'Moved from "Step 2: IN PROGRESS" to "Step 3: REVIEW / PENDING"' }
    ],
    IsDeleted: false,
    Created_By: 'admin@srinvestments.com',
    Created_At: '2026-11-01T10:00:00Z',
    Updated_By: 'rajesh@srinvestments.com',
    Updated_At: '2026-11-04T12:00:00Z',
    Deleted_By: '',
    Deleted_At: ''
  },
  {
    TaskId: 'TSK-104',
    Title: 'Amazon SES Domain Verification & DKIM Rotation Audit',
    Description: 'Ensure DKIM keys and SPF records for srinvestments.com are active in AWS SES ap-south-1 console.',
    StepIndex: 4,
    StepName: 'Step 4: VERIFICATION',
    Priority: 'Medium',
    AssigneeEmail: 'admin@srinvestments.com',
    AssigneeName: 'System Administrator',
    ReporterEmail: 'admin@srinvestments.com',
    ReporterName: 'System Administrator',
    DueDate: '2026-11-12',
    Tags: 'IT, Security, SES',
    Comments: [],
    History: [
      { timestamp: '2026-11-02T15:00:00Z', author: 'System Administrator', action: 'Task created' },
      { timestamp: '2026-11-05T09:30:00Z', author: 'System Administrator', action: 'Moved to "Step 4: VERIFICATION"' }
    ],
    IsDeleted: false,
    Created_By: 'admin@srinvestments.com',
    Created_At: '2026-11-02T15:00:00Z',
    Updated_By: 'admin@srinvestments.com',
    Updated_At: '2026-11-05T09:30:00Z',
    Deleted_By: '',
    Deleted_At: ''
  },
  {
    TaskId: 'TSK-105',
    Title: 'Annual ARN-189241 Regulatory Filing Dossier',
    Description: 'Compile AMFI annual return, employee certification copies, and SEBI compliance audit trail.',
    StepIndex: 5,
    StepName: 'Step 5: COMPLETED',
    Priority: 'High',
    AssigneeEmail: 'admin@srinvestments.com',
    AssigneeName: 'System Administrator',
    ReporterEmail: 'admin@srinvestments.com',
    ReporterName: 'System Administrator',
    DueDate: '2026-10-31',
    Tags: 'AMFI, SEBI, Audit',
    Comments: [
      { id: 'c3', author: 'System Administrator', timestamp: '2026-10-30T17:00:00Z', text: 'Dossier submitted and digital acknowledgment archived in Drive.' }
    ],
    History: [
      { timestamp: '2026-10-25T10:00:00Z', author: 'System Administrator', action: 'Task created' },
      { timestamp: '2026-10-30T17:00:00Z', author: 'System Administrator', action: 'Moved to "Step 5: COMPLETED"' }
    ],
    IsDeleted: false,
    Created_By: 'admin@srinvestments.com',
    Created_At: '2026-10-25T10:00:00Z',
    Updated_By: 'admin@srinvestments.com',
    Updated_At: '2026-10-30T17:00:00Z',
    Deleted_By: '',
    Deleted_At: ''
  }
];

export const SEED_TODOS = [
  {
    TodoId: 'TODO_01',
    UserEmail: 'admin@srinvestments.com',
    Title: 'Review KYC documents for Vikramaditya Roy',
    Notes: 'Aadhaar XML uploaded, check PAN match on NSDL portal.',
    Priority: 'High',
    DueDate: '2026-11-06',
    IsCompleted: false,
    Category: 'KYC Verification',
    IsDeleted: false,
    Created_By: 'admin@srinvestments.com',
    Created_At: '2026-11-06T08:00:00Z',
    Updated_By: 'admin@srinvestments.com',
    Updated_At: '2026-11-06T08:00:00Z',
    Deleted_By: '',
    Deleted_At: ''
  },
  {
    TodoId: 'TODO_02',
    UserEmail: 'admin@srinvestments.com',
    Title: 'Follow up with Sunita Rao regarding quarterly SIP top-up',
    Notes: 'Recommend Multi-Cap & Flexi-Cap fund allocation.',
    Priority: 'Medium',
    DueDate: '2026-11-07',
    IsCompleted: false,
    Category: 'Client Advisory',
    IsDeleted: false,
    Created_By: 'admin@srinvestments.com',
    Created_At: '2026-11-06T08:15:00Z',
    Updated_By: 'admin@srinvestments.com',
    Updated_At: '2026-11-06T08:15:00Z',
    Deleted_By: '',
    Deleted_At: ''
  },
  {
    TodoId: 'TODO_03',
    UserEmail: 'admin@srinvestments.com',
    Title: 'Download daily NAV and backup CRM Database to Drive ZIP',
    Notes: 'Scheduled under regulatory compliance routine.',
    Priority: 'Low',
    DueDate: '2026-11-06',
    IsCompleted: true,
    Category: 'Operations',
    IsDeleted: false,
    Created_By: 'admin@srinvestments.com',
    Created_At: '2026-11-05T09:00:00Z',
    Updated_By: 'admin@srinvestments.com',
    Updated_At: '2026-11-06T07:30:00Z',
    Deleted_By: '',
    Deleted_At: ''
  }
];

export const SEED_PERSONAL_NOTES = [
  {
    id: 'note_1',
    userEmail: 'admin@srinvestments.com',
    title: 'SEBI AMFI Compliance Checklist (Q3)',
    content: '1. Complete CAS dispatch log verification.\n2. Ensure all staff certificates (EUIN) are current.\n3. Audit soft-deleted customer logs and ensure permanent preservation for 8 years.',
    color: '#eff6ff',
    pinned: true,
    updatedAt: '2026-11-06T08:00:00Z'
  },
  {
    id: 'note_2',
    userEmail: 'admin@srinvestments.com',
    title: 'Top SIP Funds for High-Net-Worth Advisory',
    content: 'Large & Midcap: ICICI Prudential Large & Mid Cap Fund\nFlexicap: Parag Parikh Flexi Cap Fund\nSmallcap: Nippon India Small Cap Fund',
    color: '#f0fdf4',
    pinned: false,
    updatedAt: '2026-11-05T15:20:00Z'
  }
];

export const SEED_NOTIFICATIONS = [
  {
    id: 'notif_001',
    timestamp: '2026-11-06T08:15:00Z',
    actorEmail: 'admin@srinvestments.com',
    actorName: 'System Administrator',
    actorRole: 'Admin',
    isSuperUser: true,
    targetAudience: 'ADMIN_ONLY',
    action: 'UPDATE',
    module: 'Customers',
    recordId: 'SR90421',
    title: 'Customer Updated: Vikramaditya Roy (SR90421)',
    message: 'Admin updated investor profile and KYC status.',
    targetRoute: 'customers',
    readBy: []
  },
  {
    id: 'notif_002',
    timestamp: '2026-11-06T07:45:00Z',
    actorEmail: 'pooja.m@srinvestments.com',
    actorName: 'Pooja Mehta',
    actorRole: 'Backoffice Staff',
    isSuperUser: false,
    targetAudience: 'ALL_STAFF',
    action: 'TASK_MOVE',
    module: 'Tasks',
    recordId: 'TSK-102',
    title: 'Task In Progress: CAS & Risk-o-meter Dispatch',
    message: 'Pooja Mehta moved TSK-102 to Step 2: IN PROGRESS.',
    targetRoute: 'tasks',
    readBy: []
  },
  {
    id: 'notif_003',
    timestamp: '2026-11-05T18:30:00Z',
    actorEmail: 'rajesh@srinvestments.com',
    actorName: 'Rajesh Sharma',
    actorRole: 'Senior Investment Advisor',
    isSuperUser: false,
    targetAudience: 'ALL_STAFF',
    action: 'CREATE',
    module: 'Customers',
    recordId: 'SR48920',
    title: 'New Investor Enrolled: Sunita Rao (SR48920)',
    message: 'Rajesh Sharma onboarded a new Individual KYC Compliant investor.',
    targetRoute: 'customers',
    readBy: []
  }
];

// ==========================================
// REALTIME CROSS-USER EVENT BUS & CHANNELS
// ==========================================
const realtimeChannel = typeof BroadcastChannel !== 'undefined' ? new BroadcastChannel('sr_crm_realtime_channel') : null;

export function broadcastCrmEvent(event) {
  try {
    if (realtimeChannel) {
      realtimeChannel.postMessage(event);
    }
    window.dispatchEvent(new CustomEvent('sr_crm_local_event', { detail: event }));
  } catch (e) {
    console.warn('Realtime broadcast failed:', e);
  }
}

export function subscribeCrmEvents(handler) {
  const channelHandler = (ev) => handler(ev.data);
  const domHandler = (ev) => handler(ev.detail);

  if (realtimeChannel) {
    realtimeChannel.addEventListener('message', channelHandler);
  }
  window.addEventListener('sr_crm_local_event', domHandler);

  return () => {
    if (realtimeChannel) {
      realtimeChannel.removeEventListener('message', channelHandler);
    }
    window.removeEventListener('sr_crm_local_event', domHandler);
  };
}

/**
 * Dispatch real-time notification with role filtering:
 * 1. Admin/IsSuperUser actions -> Target Audience: ADMIN_ONLY (notifies only admin users)
 * 2. Non-Admin actions -> Target Audience: ALL_STAFF (notifies all staff members + admins)
 */
export function dispatchNotification({ action, module, recordId, title, message, targetRoute }) {
  let currentUser = { email: 'admin@srinvestments.com', name: 'System Administrator', role: 'Admin', isSuperUser: true };
  try {
    const stored = localStorage.getItem('sr_crm_auth_user');
    if (stored) currentUser = JSON.parse(stored);
  } catch (e) {}

  const isAdmin = currentUser.role === 'Admin' || currentUser.isSuperUser === true || currentUser.IsSuperUser === true || currentUser.email.includes('admin');
  const targetAudience = isAdmin ? 'ADMIN_ONLY' : 'ALL_STAFF';

  const notif = {
    id: 'notif_' + Date.now() + '_' + Math.floor(Math.random() * 1000),
    timestamp: new Date().toISOString(),
    actorEmail: currentUser.email,
    actorName: currentUser.name || currentUser.fullName || currentUser.email,
    actorRole: currentUser.role || 'Staff',
    isSuperUser: isAdmin,
    targetAudience, // 'ADMIN_ONLY' or 'ALL_STAFF'
    action,         // 'CREATE', 'UPDATE', 'DELETE', 'RESTORE', 'TASK_MOVE', etc.
    module,         // 'Customers', 'Staff', 'Tasks', 'ToDo', etc.
    recordId: recordId || '',
    title: title || `${module} Activity`,
    message: message || '',
    targetRoute: targetRoute || (module.toLowerCase() === 'staff' ? 'staff' : module.toLowerCase()),
    readBy: []
  };

  try {
    const list = JSON.parse(localStorage.getItem(STORAGE_KEYS.NOTIFICATIONS) || JSON.stringify(SEED_NOTIFICATIONS));
    list.unshift(notif);
    if (list.length > 100) list.pop();
    localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(list));
  } catch (e) {}

  broadcastCrmEvent({
    type: 'NOTIFICATION_DISPATCHED',
    notification: notif,
    module,
    action,
    recordId
  });

  return notif;
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

  getShowDeletedGlobally() {
    return localStorage.getItem(STORAGE_KEYS.SHOW_DELETED_GLOBALLY) === 'true';
  },

  setShowDeletedGlobally(enabled) {
    localStorage.setItem(STORAGE_KEYS.SHOW_DELETED_GLOBALLY, enabled ? 'true' : 'false');
    broadcastCrmEvent({ type: 'DATA_CHANGED', module: 'Settings', subType: 'SHOW_DELETED_CHANGED', value: enabled });
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
            reject(new Error('Connection timed out (20s). Google Apps Script is still running the old version or Bridge.html is missing. Please paste the updated Code.gs, Common_Code.gs, and Bridge.html into Apps Script and deploy a New Version.'));
          }
        }, 15000);
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
        const includeDel = payload.includeDeleted !== undefined ? payload.includeDeleted : this.getShowDeletedGlobally();
        if (!includeDel) {
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
          dispatchNotification({
            action: 'UPDATE',
            module: 'Customers',
            recordId: code,
            title: `Customer Updated: ${record.FullName}`,
            message: `${record.FullName} (${code}) was updated by ${userEmail}.`,
            targetRoute: 'customers'
          });
        } else {
          list.push(record);
          logAuditLocal(userEmail, 'CREATE', 'Customers', code, `Created investor: ${record.FullName} (${code})`);
          dispatchNotification({
            action: 'CREATE',
            module: 'Customers',
            recordId: code,
            title: `New Customer Enrolled: ${record.FullName}`,
            message: `${record.FullName} (${code}) was onboarded by ${userEmail}.`,
            targetRoute: 'customers'
          });
        }

        localStorage.setItem(STORAGE_KEYS.CUSTOMERS, JSON.stringify(list));
        broadcastCrmEvent({ type: 'DATA_CHANGED', module: 'Customers', recordId: code });
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
          dispatchNotification({
            action: 'DELETE',
            module: 'Customers',
            recordId: rec.CustomerCode,
            title: `Customer Soft-Deleted: ${rec.FullName}`,
            message: `${rec.FullName} (${rec.CustomerCode}) was archived by ${userEmail}.`,
            targetRoute: 'customers'
          });
          broadcastCrmEvent({ type: 'DATA_CHANGED', module: 'Customers', recordId: rec.CustomerCode });
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
          dispatchNotification({
            action: 'RESTORE',
            module: 'Customers',
            recordId: rec.CustomerCode,
            title: `Customer Restored: ${rec.FullName}`,
            message: `${rec.FullName} (${rec.CustomerCode}) was restored by ${userEmail}.`,
            targetRoute: 'customers'
          });
          broadcastCrmEvent({ type: 'DATA_CHANGED', module: 'Customers', recordId: rec.CustomerCode });
        }
        return { success: true, message: 'Customer restored successfully.' };
      }

      case 'getEmployees': {
        let list = JSON.parse(localStorage.getItem(STORAGE_KEYS.EMPLOYEES) || '[]');
        const includeDel = payload.includeDeleted !== undefined ? payload.includeDeleted : this.getShowDeletedGlobally();
        if (!includeDel) {
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
          dispatchNotification({
            action: 'UPDATE',
            module: 'Staff',
            recordId: code,
            title: `Staff Member Updated: ${record.FullName}`,
            message: `${record.FullName} (${code}) profile was updated by ${userEmail}.`,
            targetRoute: 'staff'
          });
        } else {
          list.push(record);
          logAuditLocal(userEmail, 'CREATE', 'Staff', code, `Created staff: ${record.FullName} (${code})`);
          dispatchNotification({
            action: 'CREATE',
            module: 'Staff',
            recordId: code,
            title: `New Staff Enrolled: ${record.FullName}`,
            message: `${record.FullName} (${code}) joined as ${record.Designation || 'Staff'}.`,
            targetRoute: 'staff'
          });
        }

        localStorage.setItem(STORAGE_KEYS.EMPLOYEES, JSON.stringify(list));
        broadcastCrmEvent({ type: 'DATA_CHANGED', module: 'Staff', recordId: code });
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
          dispatchNotification({
            action: 'DELETE',
            module: 'Staff',
            recordId: rec.EmployeeCode,
            title: `Staff Archived: ${rec.FullName}`,
            message: `${rec.FullName} (${rec.EmployeeCode}) was archived by ${userEmail}.`,
            targetRoute: 'staff'
          });
          broadcastCrmEvent({ type: 'DATA_CHANGED', module: 'Staff', recordId: rec.EmployeeCode });
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
          dispatchNotification({
            action: 'RESTORE',
            module: 'Staff',
            recordId: rec.EmployeeCode,
            title: `Staff Restored: ${rec.FullName}`,
            message: `${rec.FullName} (${rec.EmployeeCode}) was restored by ${userEmail}.`,
            targetRoute: 'staff'
          });
          broadcastCrmEvent({ type: 'DATA_CHANGED', module: 'Staff', recordId: rec.EmployeeCode });
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

      // ==========================================
      // JIRA-STYLE TASK TRACKER DEMO ACTIONS
      // ==========================================
      case 'getTaskStepConfig': {
        const stored = localStorage.getItem(STORAGE_KEYS.TASK_CONFIG);
        return stored ? JSON.parse(stored) : SEED_TASK_CONFIG;
      }

      case 'saveTaskStepConfig': {
        const { steps, userEmail } = payload;
        if (!steps || !steps.length) throw new Error('Steps config required.');
        localStorage.setItem(STORAGE_KEYS.TASK_CONFIG, JSON.stringify(steps));
        logAuditLocal(userEmail, 'UPDATE', 'TaskTracker', 'WORKFLOW_CONFIG', 'Admin customized JIRA 5-step status labels.');
        dispatchNotification({
          action: 'UPDATE',
          module: 'Tasks',
          recordId: 'WORKFLOW_CONFIG',
          title: 'Task Workflow Updated',
          message: `${userEmail} updated JIRA Kanban status step names.`,
          targetRoute: 'tasks'
        });
        broadcastCrmEvent({ type: 'DATA_CHANGED', module: 'Tasks', subType: 'CONFIG_CHANGED' });
        return { success: true, steps };
      }

      case 'getTasks': {
        let list = JSON.parse(localStorage.getItem(STORAGE_KEYS.TASKS) || JSON.stringify(SEED_TASKS));
        const includeDel = payload.includeDeleted !== undefined ? payload.includeDeleted : this.getShowDeletedGlobally();
        if (!includeDel) {
          list = list.filter(t => !t.IsDeleted);
        }
        if (payload.assignee && payload.assignee !== 'all') {
          const q = payload.assignee.toLowerCase();
          list = list.filter(t =>
            (t.AssigneeEmail && t.AssigneeEmail.toLowerCase() === q) ||
            (t.AssigneeName && t.AssigneeName.toLowerCase().includes(q))
          );
        }
        if (payload.priority && payload.priority !== 'all') {
          list = list.filter(t => t.Priority === payload.priority);
        }
        if (payload.search) {
          const q = payload.search.toLowerCase();
          list = list.filter(t =>
            (t.Title && t.Title.toLowerCase().includes(q)) ||
            (t.TaskId && t.TaskId.toLowerCase().includes(q)) ||
            (t.Description && t.Description.toLowerCase().includes(q)) ||
            (t.Tags && t.Tags.toLowerCase().includes(q))
          );
        }
        return list;
      }

      case 'saveTask': {
        const list = JSON.parse(localStorage.getItem(STORAGE_KEYS.TASKS) || JSON.stringify(SEED_TASKS));
        const id = payload.TaskId || ('TSK-' + Math.floor(100 + Math.random() * 900));
        const userEmail = payload.userEmail || 'admin@srinvestments.com';
        const userName = payload.userName || userEmail;
        const now = new Date().toISOString();
        const index = list.findIndex(t => t.TaskId === id);
        const existing = index >= 0 ? list[index] : null;

        const isDeleted = existing ? Boolean(existing.IsDeleted) : false;
        const createdBy = existing ? (existing.Created_By || userEmail) : userEmail;
        const createdAt = existing ? (existing.Created_At || now) : now;
        const history = existing ? (existing.History || []) : [
          { timestamp: now, author: userName, action: `Created task ${id} and assigned to ${payload.AssigneeName || 'Unassigned'}` }
        ];

        const record = {
          ...existing,
          ...payload,
          TaskId: id,
          History: history,
          Comments: payload.Comments || existing?.Comments || [],
          IsDeleted: isDeleted,
          Created_By: createdBy,
          Created_At: createdAt,
          Updated_By: userEmail,
          Updated_At: now,
          Deleted_By: existing ? (existing.Deleted_By || '') : '',
          Deleted_At: existing ? (existing.Deleted_At || '') : ''
        };

        if (index >= 0) {
          list[index] = record;
          logAuditLocal(userEmail, 'UPDATE', 'TaskTracker', id, `Updated task: ${record.Title} (${id})`);
          dispatchNotification({
            action: 'UPDATE',
            module: 'Tasks',
            recordId: id,
            title: `Task Updated: ${record.Title}`,
            message: `${userName} updated task ${id} (${record.Title})`,
            targetRoute: 'tasks'
          });
        } else {
          list.push(record);
          logAuditLocal(userEmail, 'CREATE', 'TaskTracker', id, `Created task: ${record.Title} (${id})`);
          dispatchNotification({
            action: 'CREATE',
            module: 'Tasks',
            recordId: id,
            title: `New Task Assigned: ${record.Title}`,
            message: `${userName} created and assigned task ${id} to ${record.AssigneeName}.`,
            targetRoute: 'tasks'
          });
        }

        localStorage.setItem(STORAGE_KEYS.TASKS, JSON.stringify(list));
        broadcastCrmEvent({ type: 'DATA_CHANGED', module: 'Tasks', recordId: id });
        return { success: true, taskId: id, task: record };
      }

      case 'updateTaskStatus': {
        const { taskId, stepIndex, stepName, userEmail, userName } = payload;
        const list = JSON.parse(localStorage.getItem(STORAGE_KEYS.TASKS) || JSON.stringify(SEED_TASKS));
        const index = list.findIndex(t => t.TaskId === taskId);
        if (index === -1) throw new Error('Task not found: ' + taskId);

        const rec = list[index];
        const oldStepName = rec.StepName || `Step ${rec.StepIndex}`;
        const now = new Date().toISOString();

        rec.StepIndex = Number(stepIndex);
        rec.StepName = stepName;
        rec.Updated_By = userEmail || 'admin@srinvestments.com';
        rec.Updated_At = now;

        if (!rec.History) rec.History = [];
        rec.History.push({
          timestamp: now,
          author: userName || userEmail || 'Staff',
          action: `Moved task from "${oldStepName}" to "${stepName}"`
        });

        localStorage.setItem(STORAGE_KEYS.TASKS, JSON.stringify(list));
        logAuditLocal(userEmail, 'STATUS_CHANGE', 'TaskTracker', taskId, `Moved ${taskId} from ${oldStepName} to ${stepName}`);
        dispatchNotification({
          action: 'TASK_MOVE',
          module: 'Tasks',
          recordId: taskId,
          title: `Task Transition: ${rec.Title}`,
          message: `${userName || userEmail} moved task ${taskId} to ${stepName}.`,
          targetRoute: 'tasks'
        });
        broadcastCrmEvent({ type: 'DATA_CHANGED', module: 'Tasks', recordId: taskId });
        return { success: true, taskId, stepIndex, stepName };
      }

      case 'deleteTask': {
        const { taskId, userEmail } = payload;
        const list = JSON.parse(localStorage.getItem(STORAGE_KEYS.TASKS) || JSON.stringify(SEED_TASKS));
        const index = list.findIndex(t => t.TaskId === taskId);
        if (index !== -1) {
          const rec = list[index];
          rec.IsDeleted = true;
          rec.Deleted_By = userEmail || 'admin@srinvestments.com';
          rec.Deleted_At = new Date().toISOString();
          localStorage.setItem(STORAGE_KEYS.TASKS, JSON.stringify(list));
          logAuditLocal(userEmail, 'SOFT_DELETE', 'TaskTracker', taskId, `Soft-deleted task: ${rec.Title} (${taskId})`);
          dispatchNotification({
            action: 'DELETE',
            module: 'Tasks',
            recordId: taskId,
            title: `Task Archived: ${rec.Title}`,
            message: `${userEmail} archived task ${taskId}.`,
            targetRoute: 'tasks'
          });
          broadcastCrmEvent({ type: 'DATA_CHANGED', module: 'Tasks', recordId: taskId });
        }
        return { success: true, message: 'Task soft-deleted.' };
      }

      // ==========================================
      // PERSONAL TODO LIST & NOTES DEMO ACTIONS
      // ==========================================
      case 'getToDos': {
        let list = JSON.parse(localStorage.getItem(STORAGE_KEYS.TODOS) || JSON.stringify(SEED_TODOS));
        const includeDel = payload.includeDeleted !== undefined ? payload.includeDeleted : this.getShowDeletedGlobally();
        if (!includeDel) {
          list = list.filter(t => !t.IsDeleted);
        }
        if (payload.userEmail) {
          const q = payload.userEmail.trim().toLowerCase();
          list = list.filter(t => !t.UserEmail || t.UserEmail.toLowerCase() === q);
        }
        return list;
      }

      case 'saveToDo': {
        const list = JSON.parse(localStorage.getItem(STORAGE_KEYS.TODOS) || JSON.stringify(SEED_TODOS));
        const id = payload.TodoId || ('TODO_' + Date.now());
        const userEmail = payload.userEmail || payload.UserEmail || 'admin@srinvestments.com';
        const now = new Date().toISOString();
        const index = list.findIndex(t => t.TodoId === id);
        const existing = index >= 0 ? list[index] : null;

        const record = {
          ...existing,
          ...payload,
          TodoId: id,
          UserEmail: userEmail,
          IsCompleted: payload.IsCompleted !== undefined ? Boolean(payload.IsCompleted) : (existing?.IsCompleted || false),
          IsDeleted: false,
          Created_By: existing ? (existing.Created_By || userEmail) : userEmail,
          Created_At: existing ? (existing.Created_At || now) : now,
          Updated_By: userEmail,
          Updated_At: now
        };

        if (index >= 0) {
          list[index] = record;
        } else {
          list.unshift(record);
        }

        localStorage.setItem(STORAGE_KEYS.TODOS, JSON.stringify(list));
        broadcastCrmEvent({ type: 'DATA_CHANGED', module: 'ToDo', recordId: id });
        return { success: true, todo: record };
      }

      case 'deleteToDo': {
        const { todoId, userEmail } = payload;
        const list = JSON.parse(localStorage.getItem(STORAGE_KEYS.TODOS) || JSON.stringify(SEED_TODOS));
        const index = list.findIndex(t => t.TodoId === todoId);
        if (index !== -1) {
          const rec = list[index];
          rec.IsDeleted = true;
          rec.Deleted_By = userEmail || 'admin@srinvestments.com';
          rec.Deleted_At = new Date().toISOString();
          localStorage.setItem(STORAGE_KEYS.TODOS, JSON.stringify(list));
          broadcastCrmEvent({ type: 'DATA_CHANGED', module: 'ToDo', recordId: todoId });
        }
        return { success: true };
      }

      case 'getPersonalNotes': {
        const list = JSON.parse(localStorage.getItem(STORAGE_KEYS.PERSONAL_NOTES) || JSON.stringify(SEED_PERSONAL_NOTES));
        if (payload.userEmail) {
          const q = payload.userEmail.trim().toLowerCase();
          return list.filter(n => !n.userEmail || n.userEmail.toLowerCase() === q);
        }
        return list;
      }

      case 'savePersonalNotes': {
        const { notes } = payload;
        localStorage.setItem(STORAGE_KEYS.PERSONAL_NOTES, JSON.stringify(notes || []));
        broadcastCrmEvent({ type: 'DATA_CHANGED', module: 'ToDo', subType: 'NOTES_SAVED' });
        return { success: true };
      }

      // ==========================================
      // REALTIME NOTIFICATIONS DEMO ACTIONS
      // ==========================================
      case 'getNotifications': {
        const list = JSON.parse(localStorage.getItem(STORAGE_KEYS.NOTIFICATIONS) || JSON.stringify(SEED_NOTIFICATIONS));
        const isSuperUser = Boolean(payload.isSuperUser);
        const role = payload.role || 'Staff';
        const isAdmin = isSuperUser || role.toLowerCase() === 'admin' || (payload.userEmail && payload.userEmail.includes('admin'));

        // Requirement:
        // When Any ADMIN (IsSuperUser=true) staff do any operation, notify ADMIN users only
        // When Non-Admin, do any operations, notify All Staff member (Non-Admin + Admin)
        const filtered = list.filter(n => {
          if (n.targetAudience === 'ADMIN_ONLY') {
            return isAdmin;
          }
          return true; // ALL_STAFF
        });

        return filtered.slice(0, 50);
      }

      case 'markNotificationRead': {
        const { notifId, userEmail } = payload;
        const list = JSON.parse(localStorage.getItem(STORAGE_KEYS.NOTIFICATIONS) || JSON.stringify(SEED_NOTIFICATIONS));
        const notif = list.find(n => n.id === notifId);
        if (notif) {
          if (!notif.readBy) notif.readBy = [];
          if (!notif.readBy.includes(userEmail)) notif.readBy.push(userEmail);
          localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(list));
        }
        return { success: true };
      }

      case 'markAllNotificationsRead': {
        const { userEmail } = payload;
        const list = JSON.parse(localStorage.getItem(STORAGE_KEYS.NOTIFICATIONS) || JSON.stringify(SEED_NOTIFICATIONS));
        list.forEach(n => {
          if (!n.readBy) n.readBy = [];
          if (!n.readBy.includes(userEmail)) n.readBy.push(userEmail);
        });
        localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(list));
        return { success: true };
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
