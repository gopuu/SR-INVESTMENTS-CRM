/**
 * SR INVESTMENTS CRM - Unified API Client (Blue Family Edition)
 * 
 * Features:
 * 1. Multi-credential login: staffId / emailId / mobileNo + password
 * 2. Login with Google (matches primary or any registered Google email)
 * 3. Auto-increment Employee Code (SR-EMP01, SR-EMP02, etc.)
 * 4. Multi-email support for staff (multiple Google IDs)
 * 5. Multi-User RBAC & Client Document Vault
 * 6. Google Drive complete ZIP backup
 */

/**
 * SHA-256 Password Hasher
 * Returns a 64-character lowercase hex string
 */
export async function hashPasswordSHA256(password) {
  if (!password) return '';
  const str = String(password).trim();
  if (/^[a-f0-9]{64}$/i.test(str)) {
    return str.toLowerCase();
  }
  if (typeof crypto !== 'undefined' && crypto.subtle) {
    try {
      const utf8 = new TextEncoder().encode(str);
      const hashBuffer = await crypto.subtle.digest('SHA-256', utf8);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      return hashArray.map(b => b.toString(16).padStart(2, '0')).join('').toLowerCase();
    } catch (e) {
      console.warn('SubtleCrypto error:', e);
    }
  }
  return jsSha256(str);
}

function jsSha256(ascii) {
  function rightRotate(value, amount) {
    return (value >>> amount) | (value << (32 - amount));
  }
  const mathPow = Math.pow;
  const maxWord = mathPow(2, 32);
  let lengthProperty = 'length';
  let i, j;
  let result = '';
  const words = [];
  const asciiBitLength = ascii[lengthProperty] * 8;
  let hash = [];
  const k = [];
  let primeCounter = 0;
  const isComposite = {};
  for (let candidate = 2; primeCounter < 64; candidate++) {
    if (!isComposite[candidate]) {
      for (i = 0; i < 300; i += candidate) {
        isComposite[i] = candidate;
      }
      hash[primeCounter] = (mathPow(candidate, 0.5) * maxWord) | 0;
      k[primeCounter++] = (mathPow(candidate, 1 / 3) * maxWord) | 0;
    }
  }
  hash = hash.slice(0, 8);
  ascii += '\x80';
  while ((ascii[lengthProperty] % 64) - 56) ascii += '\x00';
  for (i = 0; i < ascii[lengthProperty]; i++) {
    j = ascii.charCodeAt(i);
    if (j >> 8) return '';
    words[i >> 2] |= j << (((3 - i) % 4) * 8);
  }
  words[words[lengthProperty]] = (asciiBitLength / maxWord) | 0;
  words[words[lengthProperty]] = asciiBitLength;
  for (j = 0; j < words[lengthProperty];) {
    const w = words.slice(j, (j += 16));
    const oldHash = hash;
    hash = hash.slice(0, 8);
    for (i = 0; i < 64; i++) {
      const w15 = w[i - 15], w2 = w[i - 2];
      const s0 = rightRotate(w15, 7) ^ rightRotate(w15, 18) ^ (w15 >>> 3);
      const s1 = rightRotate(w2, 17) ^ rightRotate(w2, 19) ^ (w2 >>> 10);
      const ch = (hash[4] & hash[5]) ^ (~hash[4] & hash[6]);
      const temp1 = hash[7] + (rightRotate(hash[4], 6) ^ rightRotate(hash[4], 11) ^ rightRotate(hash[4], 25)) + ch + k[i] + (w[i] = (i < 16) ? w[i] : (w[i - 16] + s0 + w[i - 7] + s1) | 0);
      const maj = (hash[0] & hash[1]) ^ (hash[0] & hash[2]) ^ (hash[1] & hash[2]);
      const temp2 = (rightRotate(hash[0], 2) ^ rightRotate(hash[0], 13) ^ rightRotate(hash[0], 22)) + maj;
      hash = [(temp1 + temp2) | 0].concat(hash);
      hash[4] = (hash[4] + temp1) | 0;
    }
    for (i = 0; i < 8; i++) {
      hash[i] = (hash[i] + oldHash[i]) | 0;
    }
  }
  for (i = 0; i < 8; i++) {
    for (j = 3; j + 1; j--) {
      const b = (hash[i] >> (j * 8)) & 255;
      result += ((b < 16) ? 0 : '') + b.toString(16);
    }
  }
  return result;
}

const STORAGE_KEYS = {
  CONFIG_URL: 'sr_crm_gas_url',
  DEMO_MODE: 'sr_crm_demo_mode',
  CUSTOMERS: 'sr_crm_demo_customers',
  CUSTOMER_BANK: 'sr_crm_demo_customer_bank',
  CUSTOMER_NOMINEE: 'sr_crm_demo_customer_nominee',
  CUSTOMER_DRAFT: 'sr_crm_demo_customer_draft',
  EMPLOYEES: 'sr_crm_demo_employees',
  SETTINGS: 'sr_crm_demo_settings',
  RIGHTS: 'sr_crm_demo_rights',
  NOTIFICATIONS: 'sr_crm_demo_notifications',
  SHOW_DELETED_GLOBALLY: 'sr_crm_show_deleted_globally',
  DEPARTMENTS: 'sr_crm_master_departments',
  DESIGNATIONS: 'sr_crm_master_designations',
  ROLES: 'sr_crm_master_roles',
  // Central SaaS Registries
  TENANTS: 'sr_crm_saas_tenants',
  USER_MASTER: 'sr_crm_saas_users',
  TENANT_USER_MAPPING: 'sr_crm_saas_tenant_user_mapping',
  TENANT_LICENSES: 'sr_crm_saas_tenant_licenses',
  USER_DOCUMENTS: 'sr_crm_saas_user_documents',
  SUBSCRIPTION_PLANS: 'sr_crm_subscription_plans',
  PAYMENT_ACCOUNTS: 'sr_crm_payment_accounts',
  ACTIVE_TENANT: 'sr_crm_active_tenant',
  GOOGLE_CLIENT_ID: 'sr_crm_google_client_id'
};

const SEED_DATA = {
  settings: {
    CompanyName: 'SR GROWW',
    ArnNumber: 'ARN-189241',
    EuinNumber: 'E345678',
    GSTIN: '27AAACR1234F1Z5',
    SupportEmail: 'support@srinvestments.com',
    ContactPhone: '9876543210',
    OfficeAddress: '101, Fortune Hub, Financial District, Bandra-Kurla Complex, Mumbai 400051'
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
    { Role: 'Admin', Module: 'MasterHub', CanView: true, CanCreate: true, CanEdit: true, CanDelete: true },
    { Role: 'Admin', Module: 'Settings', CanView: true, CanCreate: true, CanEdit: true, CanDelete: true },
    { Role: 'Admin', Module: 'DriveBackup', CanView: true, CanCreate: true, CanEdit: true, CanDelete: true },
    { Role: 'Relationship Manager', Module: 'Dashboard', CanView: true, CanCreate: false, CanEdit: false, CanDelete: false },
    { Role: 'Relationship Manager', Module: 'Customers', CanView: true, CanCreate: true, CanEdit: true, CanDelete: false },
    { Role: 'Relationship Manager', Module: 'Staff', CanView: true, CanCreate: false, CanEdit: false, CanDelete: false },
    { Role: 'Relationship Manager', Module: 'MasterHub', CanView: true, CanCreate: false, CanEdit: false, CanDelete: false },
    { Role: 'Relationship Manager', Module: 'Settings', CanView: false, CanCreate: false, CanEdit: false, CanDelete: false },
    { Role: 'Relationship Manager', Module: 'DriveBackup', CanView: false, CanCreate: false, CanEdit: false, CanDelete: false },
    { Role: 'Backoffice Staff', Module: 'Dashboard', CanView: true, CanCreate: false, CanEdit: false, CanDelete: false },
    { Role: 'Backoffice Staff', Module: 'Customers', CanView: true, CanCreate: true, CanEdit: true, CanDelete: false },
    { Role: 'Backoffice Staff', Module: 'Staff', CanView: false, CanCreate: false, CanEdit: false, CanDelete: false },
    { Role: 'Backoffice Staff', Module: 'MasterHub', CanView: true, CanCreate: false, CanEdit: false, CanDelete: false },
    { Role: 'Backoffice Staff', Module: 'Settings', CanView: false, CanCreate: false, CanEdit: false, CanDelete: false },
    { Role: 'Backoffice Staff', Module: 'DriveBackup', CanView: false, CanCreate: false, CanEdit: false, CanDelete: false }
  ],
  departments: [
    { DepartmentId: 'DEP_01', DepartmentCode: 'WM', DepartmentName: 'Wealth Management', Description: 'Client advisory & wealth portfolios', Status: 'Active', IsDeleted: false },
    { DepartmentId: 'DEP_02', DepartmentCode: 'OPS', DepartmentName: 'Operations & KYC', Description: 'Client onboarding, KYC & document verification', Status: 'Active', IsDeleted: false },
    { DepartmentId: 'DEP_03', DepartmentCode: 'MF', DepartmentName: 'Mutual Funds', Description: 'Mutual fund distributions, CAS & order processing', Status: 'Active', IsDeleted: false },
    { DepartmentId: 'DEP_04', DepartmentCode: 'ACC', DepartmentName: 'Accounts & Finance', Description: 'Commission reconciliation & accounting', Status: 'Active', IsDeleted: false },
    { DepartmentId: 'DEP_05', DepartmentCode: 'ADM', DepartmentName: 'Administration', Description: 'CRM system management & access controls', Status: 'Active', IsDeleted: false },
    { DepartmentId: 'DEP_06', DepartmentCode: 'CMP', DepartmentName: 'Compliance & Legal', Description: 'AMFI & SEBI regulatory compliance audit', Status: 'Active', IsDeleted: false }
  ],
  designations: [
    { DesignationId: 'DES_01', DesignationCode: 'SIA', DesignationName: 'Senior Investment Advisor', Department: 'Wealth Management', Description: 'Advises high net worth clients', Status: 'Active', IsDeleted: false },
    { DesignationId: 'DES_02', DesignationCode: 'RM', DesignationName: 'Relationship Manager', Department: 'Wealth Management', Description: 'Manages customer relationships & portfolios', Status: 'Active', IsDeleted: false },
    { DesignationId: 'DES_03', DesignationCode: 'MFS', DesignationName: 'Mutual Fund Specialist', Department: 'Mutual Funds', Description: 'Specialized mutual fund product advisory', Status: 'Active', IsDeleted: false },
    { DesignationId: 'DES_04', DesignationCode: 'BM', DesignationName: 'Branch Manager', Department: 'Administration', Description: 'Branch operations and advisory supervision', Status: 'Active', IsDeleted: false },
    { DesignationId: 'DES_05', DesignationCode: 'CO', DesignationName: 'Compliance Officer', Department: 'Compliance & Legal', Description: 'Statutory AMFI & SEBI compliance surveillance', Status: 'Active', IsDeleted: false },
    { DesignationId: 'DES_06', DesignationCode: 'OE', DesignationName: 'Operations Executive', Department: 'Operations & KYC', Description: 'Client KYC verification & documentation', Status: 'Active', IsDeleted: false },
    { DesignationId: 'DES_07', DesignationCode: 'BE', DesignationName: 'Backoffice Executive', Department: 'Operations & KYC', Description: 'Data entry, backoffice operations and investor requests', Status: 'Active', IsDeleted: false },
    { DesignationId: 'DES_08', DesignationCode: 'ADM', DesignationName: 'Administrator', Department: 'Administration', Description: 'Overall CRM administration and security', Status: 'Active', IsDeleted: false }
  ],
  roles: [
    { RoleId: 'ROL_01', RoleCode: 'ADMIN', RoleName: 'Admin', Description: 'Complete CRM administration, settings & audit logs', Status: 'Active', IsDeleted: false },
    { RoleId: 'ROL_02', RoleCode: 'RM', RoleName: 'Relationship Manager', Description: 'Customer advisory, staff view & transaction tools', Status: 'Active', IsDeleted: false },
    { RoleId: 'ROL_03', RoleCode: 'BO', RoleName: 'Backoffice Staff', Description: 'Operations, KYC verification & record management', Status: 'Active', IsDeleted: false },
    { RoleId: 'ROL_04', RoleCode: 'STF', RoleName: 'Staff', Description: 'Standard team member with basic view & self-service access', Status: 'Active', IsDeleted: false }
  ],
  tenants: [
    {
      TenantId: 'TEN001',
      TenantName: 'SR INVESTMENTS',
      CompanyName: 'SR GROWW',
      TagLine: 'Mutual Fund CRM',
      ArnNumber: 'ARN-189241',
      SpreadsheetId: '1Bll7386rIJD2CIl1VX--0Okcn-jxXOpII0OHh9FSKSM',
      DriveRootFolderId: '1IxulBQJTKrxYAyYMUhz5bllvaMZUYvy',
      SupportEmail: 'admin@abc.com',
      ContactPhone: '+91 98765 43210',
      OfficeAddress: '101, Fortune Hub, Financial District, Bandra-Kurla Complex, Mumbai 400051',
      Status: 'Active',
      IsDeleted: false,
      Created_By: 'superadmin@srinvestments.com',
      Created_At: '2026-01-01T00:00:00Z',
      Updated_By: 'superadmin@srinvestments.com',
      Updated_At: '2026-01-01T00:00:00Z',
      Deleted_By: '',
      Deleted_At: ''
    },
    {
      TenantId: 'TEN002',
      TenantName: 'XYZ FINANCE',
      CompanyName: 'XYZ Finance',
      TagLine: 'Smart Investments',
      ArnNumber: 'ARN-992144',
      SpreadsheetId: '1ABC_SPREADSHEET_ID_LIVE',
      DriveRootFolderId: '1ABC_DRIVE_FOLDER_LIVE',
      SupportEmail: 'admin@xyz.com',
      ContactPhone: '+91 98220 12345',
      OfficeAddress: '5th Floor, Trade Center, Nariman Point, Mumbai',
      Status: 'Active',
      IsDeleted: false,
      Created_By: 'superadmin@srinvestments.com',
      Created_At: '2026-03-15T00:00:00Z',
      Updated_By: 'superadmin@srinvestments.com',
      Updated_At: '2026-03-15T00:00:00Z',
      Deleted_By: '',
      Deleted_At: ''
    },
    {
      TenantId: 'TEN003',
      TenantName: 'PQR ASSOCIATES',
      CompanyName: 'PQR Associates',
      TagLine: 'Wealth Management',
      ArnNumber: 'ARN-551209',
      SpreadsheetId: '1XYZ_SPREADSHEET_ID_LIVE',
      DriveRootFolderId: '1XYZ_DRIVE_FOLDER_LIVE',
      SupportEmail: 'contact@pqrassociates.in',
      ContactPhone: '+91 98110 54321',
      OfficeAddress: '302, Cyber Heights, HITEC City, Hyderabad',
      Status: 'Active',
      IsDeleted: false,
      Created_By: 'superadmin@srinvestments.com',
      Created_At: '2026-08-01T00:00:00Z',
      Updated_By: 'superadmin@srinvestments.com',
      Updated_At: '2026-08-01T00:00:00Z',
      Deleted_By: '',
      Deleted_At: ''
    }
  ],
  tenantLicenses: [
    {
      Id: 'LIC_001',
      TenantId: 'TEN001',
      LicenseType: 'Enterprise',
      StartDate: '2026-01-01',
      EndDate: '2027-12-31',
      Amount: 120000,
      IsActive: true,
      Status: 'Active',
      Notes: 'Annual Enterprise Plan - Full Suite Access',
      IsDeleted: false,
      Created_By: 'superadmin@srinvestments.com',
      Created_At: '2026-01-01T10:00:00Z',
      Updated_By: 'superadmin@srinvestments.com',
      Updated_At: '2026-01-01T10:00:00Z',
      Deleted_By: '',
      Deleted_At: ''
    },
    {
      Id: 'LIC_002',
      TenantId: 'TEN002',
      LicenseType: 'Professional',
      StartDate: '2026-06-01',
      EndDate: '2027-05-31',
      Amount: 60000,
      IsActive: true,
      Status: 'Active',
      Notes: 'Annual Professional Subscription',
      IsDeleted: false,
      Created_By: 'superadmin@srinvestments.com',
      Created_At: '2026-06-01T10:00:00Z',
      Updated_By: 'superadmin@srinvestments.com',
      Updated_At: '2026-06-01T10:00:00Z',
      Deleted_By: '',
      Deleted_At: ''
    },
    {
      Id: 'LIC_003',
      TenantId: 'TEN003',
      LicenseType: 'Starter',
      StartDate: '2026-10-15',
      EndDate: '2026-11-25',
      Amount: 15000,
      IsActive: true,
      Status: 'Trial',
      Notes: '30-Day Starter Trial (Expiring Soon)',
      IsDeleted: false,
      Created_By: 'superadmin@srinvestments.com',
      Created_At: '2026-10-15T10:00:00Z',
      Updated_By: 'superadmin@srinvestments.com',
      Updated_At: '2026-10-15T10:00:00Z',
      Deleted_By: '',
      Deleted_At: ''
    }
  ],
  userMaster: [
    {
      UserId: 'USER1',
      Email: 'anonymousofjain@gmail.com',
      AlternateEmailsList: 'admin@srinvestments.com',
      GoogleEmails: 'admin@srinvestments.com',
      Password: 'admin123',
      FullName: 'Gopal Kushwaha (Founder)',
      Mobile: '8306588313',
      IsSuperAdmin: true,
      Status: 'Active',
      IsDeleted: false,
      Created_By: 'system',
      Created_At: '2026-01-01T00:00:00Z',
      Updated_By: 'system',
      Updated_At: '2026-01-01T00:00:00Z',
      Deleted_By: '',
      Deleted_At: ''
    },
    {
      UserId: 'USER2',
      Email: 'kgopal8306@gmail.com',
      AlternateEmailsList: '',
      GoogleEmails: 'kgopal8306@gmail.com',
      Password: 'password123',
      FullName: 'Gopal8306',
      Mobile: '8306588314',
      IsSuperAdmin: false,
      Status: 'Active',
      IsDeleted: false,
      Created_By: 'system',
      Created_At: '2026-01-01T00:00:00Z',
      Updated_By: 'system',
      Updated_At: '2026-01-01T00:00:00Z',
      Deleted_By: '',
      Deleted_At: ''
    },
    {
      UserId: 'USR_001',
      Email: 'admin@srinvestments.com',
      AlternateEmailsList: 'admin@srinvestments.com, gopal@gmail.com',
      GoogleEmails: 'admin@srinvestments.com, gopal@gmail.com',
      Password: 'admin123',
      FullName: 'System Administrator (Founder)',
      Mobile: '+91 98765 43210',
      IsSuperAdmin: true,
      Status: 'Active',
      IsDeleted: false,
      Created_By: 'system',
      Created_At: '2026-01-01T00:00:00Z',
      Updated_By: 'system',
      Updated_At: '2026-01-01T00:00:00Z',
      Deleted_By: '',
      Deleted_At: ''
    },
    {
      UserId: 'USR_002',
      Email: 'consultant@srinvestments.com',
      AlternateEmailsList: 'consultant@srinvestments.com, consultant.mf@gmail.com',
      GoogleEmails: 'consultant@srinvestments.com, consultant.mf@gmail.com',
      Password: 'password123',
      FullName: 'Financial Consultant (Multi-Org)',
      Mobile: '+91 98200 45678',
      IsSuperAdmin: false,
      Status: 'Active',
      IsDeleted: false,
      Created_By: 'admin@srinvestments.com',
      Created_At: '2026-03-01T00:00:00Z',
      Updated_By: 'admin@srinvestments.com',
      Updated_At: '2026-03-01T00:00:00Z',
      Deleted_By: '',
      Deleted_At: ''
    },
    {
      UserId: 'USR_003',
      Email: 'rajesh@srinvestments.com',
      AlternateEmailsList: 'rajesh.sharma.mf@gmail.com',
      GoogleEmails: 'rajesh.sharma.mf@gmail.com',
      Password: 'password123',
      FullName: 'Rajesh Sharma',
      Mobile: '+91 98201 11223',
      IsSuperAdmin: false,
      Status: 'Active',
      IsDeleted: false,
      Created_By: 'admin@srinvestments.com',
      Created_At: '2026-04-15T00:00:00Z',
      Updated_By: 'admin@srinvestments.com',
      Updated_At: '2026-04-15T00:00:00Z',
      Deleted_By: '',
      Deleted_At: ''
    }
  ],
  tenantUserMapping: [
    { MappingId: 'MAP_001', UserId: 'USR_001', TenantId: 'TEN001', Role: 'Admin', Status: 'Active', IsDeleted: false },
    { MappingId: 'MAP_002', UserId: 'USR_001', TenantId: 'TEN002', Role: 'Admin', Status: 'Active', IsDeleted: false },
    { MappingId: 'MAP_003', UserId: 'USR_002', TenantId: 'TEN001', Role: 'Admin', Status: 'Active', IsDeleted: false },
    { MappingId: 'MAP_004', UserId: 'USR_002', TenantId: 'TEN002', Role: 'Employee', Status: 'Active', IsDeleted: false },
    { MappingId: 'MAP_005', UserId: 'USR_003', TenantId: 'TEN001', Role: 'Staff', Status: 'Active', IsDeleted: false }
  ],
  userDocuments: [
    {
      Id: 'DOC_001',
      UserId: 'USR_001',
      TenantId: 'TEN001',
      DocName: 'AMFI_Registration_Certificate.pdf',
      DocType: 'AMFI Certificate',
      DocPath: 'https://drive.google.com/sample_amfi',
      DriveFileId: 'DRIVE_DOC_101',
      ViewUrl: 'https://drive.google.com/sample_amfi',
      IsDeleted: false,
      Created_By: 'admin@srinvestments.com',
      Created_At: '2026-01-10T10:00:00Z',
      Updated_By: 'admin@srinvestments.com',
      Updated_At: '2026-01-10T10:00:00Z',
      Deleted_By: '',
      Deleted_At: ''
    }
  ],
  subscriptionPlans: [
    {
      PlanId: 'PLAN001',
      PlanName: 'Starter',
      PlanCode: 'STARTER',
      Price: 25000,
      DurationMonths: 3,
      StaffLimit: 3,
      CustomerLimit: 1000,
      Features: 'Up to 3 Staff, 1k Investors, Core CRM, Basic Portfolio, Email Support',
      IsPopular: false,
      Badge: '',
      Description: 'Up to 3 Staff • 1k Investors • Core CRM',
      Color: '#0284c7',
      Status: 'Active',
      IsDeleted: false,
      Created_By: 'system@srinvestments.com',
      Created_At: '2026-01-01T00:00:00Z',
      Updated_By: 'system@srinvestments.com',
      Updated_At: '2026-01-01T00:00:00Z'
    },
    {
      PlanId: 'PLAN002',
      PlanName: 'Professional',
      PlanCode: 'PROFESSIONAL',
      Price: 60000,
      DurationMonths: 12,
      StaffLimit: 15,
      CustomerLimit: 10000,
      Features: 'Up to 15 Staff, 10k Investors, SIP Tracker, Reports, Role Rights',
      IsPopular: true,
      Badge: 'POPULAR',
      Description: 'Up to 15 Staff • 10k Investors • SIP Tracker • Reports',
      Color: '#2563eb',
      Status: 'Active',
      IsDeleted: false,
      Created_By: 'system@srinvestments.com',
      Created_At: '2026-01-01T00:00:00Z',
      Updated_By: 'system@srinvestments.com',
      Updated_At: '2026-01-01T00:00:00Z'
    },
    {
      PlanId: 'PLAN003',
      PlanName: 'Enterprise',
      PlanCode: 'ENTERPRISE',
      Price: 120000,
      DurationMonths: 24,
      StaffLimit: 999,
      CustomerLimit: 99999,
      Features: 'Unlimited Staff & Investors, Custom Drive Vault, Dedicated Sheet Database, Priority SLA Support, Full Audit Trail',
      IsPopular: false,
      Badge: '',
      Description: 'Unlimited Staff & Investors • Custom Drive Vault • Priority SLA',
      Color: '#7c3aed',
      Status: 'Active',
      IsDeleted: false,
      Created_By: 'system@srinvestments.com',
      Created_At: '2026-01-01T00:00:00Z',
      Updated_By: 'system@srinvestments.com',
      Updated_At: '2026-01-01T00:00:00Z'
    }
  ]
};

function initDemoStore() {
  if (!localStorage.getItem(STORAGE_KEYS.CUSTOMERS)) {
    localStorage.setItem(STORAGE_KEYS.CUSTOMERS, JSON.stringify(SEED_DATA.customers));
  }
  if (!localStorage.getItem(STORAGE_KEYS.EMPLOYEES)) {
    localStorage.setItem(STORAGE_KEYS.EMPLOYEES, JSON.stringify(SEED_DATA.employees));
  }
  if (!localStorage.getItem(STORAGE_KEYS.SUBSCRIPTION_PLANS)) {
    localStorage.setItem(STORAGE_KEYS.SUBSCRIPTION_PLANS, JSON.stringify(SEED_DATA.subscriptionPlans));
  }
  if (!localStorage.getItem(STORAGE_KEYS.SETTINGS)) {
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(SEED_DATA.settings));
  }
  if (!localStorage.getItem(STORAGE_KEYS.RIGHTS)) {
    localStorage.setItem(STORAGE_KEYS.RIGHTS, JSON.stringify(SEED_DATA.rights));
  }
  if (!localStorage.getItem(STORAGE_KEYS.NOTIFICATIONS)) {
    localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(SEED_NOTIFICATIONS));
  }
  if (!localStorage.getItem(STORAGE_KEYS.DEPARTMENTS)) {
    localStorage.setItem(STORAGE_KEYS.DEPARTMENTS, JSON.stringify(SEED_DATA.departments));
  }
  if (!localStorage.getItem(STORAGE_KEYS.DESIGNATIONS)) {
    localStorage.setItem(STORAGE_KEYS.DESIGNATIONS, JSON.stringify(SEED_DATA.designations));
  }
  if (!localStorage.getItem(STORAGE_KEYS.ROLES)) {
    localStorage.setItem(STORAGE_KEYS.ROLES, JSON.stringify(SEED_DATA.roles));
  }
  if (!localStorage.getItem(STORAGE_KEYS.TENANTS)) {
    localStorage.setItem(STORAGE_KEYS.TENANTS, JSON.stringify(SEED_DATA.tenants));
  }
  if (!localStorage.getItem(STORAGE_KEYS.TENANT_LICENSES)) {
    localStorage.setItem(STORAGE_KEYS.TENANT_LICENSES, JSON.stringify(SEED_DATA.tenantLicenses));
  }
  if (!localStorage.getItem(STORAGE_KEYS.USER_MASTER)) {
    localStorage.setItem(STORAGE_KEYS.USER_MASTER, JSON.stringify(SEED_DATA.userMaster));
  }
  if (!localStorage.getItem(STORAGE_KEYS.TENANT_USER_MAPPING)) {
    localStorage.setItem(STORAGE_KEYS.TENANT_USER_MAPPING, JSON.stringify(SEED_DATA.tenantUserMapping));
  }
  if (!localStorage.getItem(STORAGE_KEYS.USER_DOCUMENTS)) {
    localStorage.setItem(STORAGE_KEYS.USER_DOCUMENTS, JSON.stringify(SEED_DATA.userDocuments));
  }

  // Ensure USER1 / Founder is present and has IsSuperAdmin: true in stored User_Master
  try {
    const rawUsers = localStorage.getItem(STORAGE_KEYS.USER_MASTER);
    if (rawUsers) {
      let users = JSON.parse(rawUsers);
      let updated = false;
      const user1 = users.find(u => u.UserId === 'USER1' || u.Email === 'anonymousofjain@gmail.com' || u.Email === 'admin@srinvestments.com');
      if (user1 && !user1.IsSuperAdmin) {
        user1.IsSuperAdmin = true;
        updated = true;
      } else if (!user1) {
        users.unshift(SEED_DATA.userMaster[0]);
        updated = true;
      }
      // Ensure kgopal8306@gmail.com (USER2) has IsSuperAdmin: false
      const user2 = users.find(u => u.Email === 'kgopal8306@gmail.com' || u.UserId === 'USER2');
      if (user2 && user2.IsSuperAdmin) {
        user2.IsSuperAdmin = false;
        updated = true;
      }
      if (updated) {
        localStorage.setItem(STORAGE_KEYS.USER_MASTER, JSON.stringify(users));
      }
    }
  } catch (err) {}

  // Sanitize any corrupted Status values in existing stored employees (e.g. from column shift)
  try {
    const rawEmps = localStorage.getItem(STORAGE_KEYS.EMPLOYEES);
    if (rawEmps) {
      let emps = JSON.parse(rawEmps);
      let modified = false;
      emps = emps.map(e => {
        if (e.Status && e.Status !== 'Active' && e.Status !== 'Inactive') {
          e.Status = 'Active';
          modified = true;
        }
        return e;
      });
      if (modified) {
        localStorage.setItem(STORAGE_KEYS.EMPLOYEES, JSON.stringify(emps));
      }
    }
  } catch (err) {}
}

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
    action: 'UPDATE',
    module: 'Staff',
    recordId: 'SR-EMP02',
    title: 'Staff Profile Updated: Pooja Mehta (SR-EMP02)',
    message: 'Pooja Mehta updated operational certification details.',
    targetRoute: 'staff',
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

// Multi-User Cross-Device Poller State
let syncPollerTimer = null;
let lastSyncVersion = 0;
let lastActiveTenantId = null;
let isPollingActive = false;
let isFetchInProgress = false;

export function broadcastCrmEvent(event) {
  try {
    if (realtimeChannel) {
      realtimeChannel.postMessage(event);
    }
    window.dispatchEvent(new CustomEvent('sr_crm_local_event', { detail: event }));

    // In demo mode or cross-tab local storage fallback:
    if (typeof localStorage !== 'undefined' && event && event.module) {
      try {
        const stored = localStorage.getItem('sr_crm_auth_user');
        const u = stored ? JSON.parse(stored) : {};
        const tId = String(event.tenantId || u.activeTenantId || 'TEN001').toUpperCase();
        const key = 'sr_crm_tenant_sync_' + tId;
        let list = JSON.parse(localStorage.getItem(key) || '[]');
        list.unshift({
          tenantId: tId,
          version: Date.now(),
          module: event.module,
          action: event.action || 'update',
          by: event.actorEmail || u.email || 'user',
          timestamp: new Date().toISOString()
        });
        if (list.length > 20) list = list.slice(0, 20);
        localStorage.setItem(key, JSON.stringify(list));
      } catch (err) {}
    }
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
 * Global DB / Excel Transaction Call Tracking System
 */
let activeDbCallsCount = 0;
const dbCallSubscribers = new Set();

export function subscribeDbCalls(listener) {
  dbCallSubscribers.add(listener);
  try {
    listener(activeDbCallsCount > 0, activeDbCallsCount, '');
  } catch (e) {}
  return () => dbCallSubscribers.delete(listener);
}

export function notifyDbCallStart(action) {
  if (action === 'checkTenantSync' || action === 'health') return;
  activeDbCallsCount++;
  dbCallSubscribers.forEach(fn => {
    try {
      fn(true, activeDbCallsCount, action);
    } catch (e) {}
  });
}

export function notifyDbCallEnd(action, success = true, error = null) {
  if (action === 'checkTenantSync' || action === 'health') return;
  activeDbCallsCount = Math.max(0, activeDbCallsCount - 1);
  const isStillLoading = activeDbCallsCount > 0;
  dbCallSubscribers.forEach(fn => {
    try {
      fn(isStillLoading, activeDbCallsCount, action, success, error);
    } catch (e) {}
  });
}

/**
 * Periodically polls Google Apps Script or Demo store to detect any CRUD changes
 * performed by OTHER users/systems of the SAME tenant, and reflects them instantly.
 */
export async function pollTenantSync() {
  if (isFetchInProgress) return;
  try {
    isFetchInProgress = true;
    let tenantId = 'TEN001';
    let userEmail = '';
    
    try {
      const stored = localStorage.getItem('sr_crm_auth_user');
      if (stored) {
        const u = JSON.parse(stored);
        tenantId = u.activeTenantId || tenantId;
        userEmail = u.email || '';
      }
      const activeTenant = crmApi.getActiveTenant();
      if (activeTenant && (activeTenant.tenantId || activeTenant.TenantId)) {
        tenantId = activeTenant.tenantId || activeTenant.TenantId;
      }
    } catch (e) {}

    if (!tenantId) return;

    // Reset baseline when switching tenant
    if (lastActiveTenantId !== tenantId) {
      lastActiveTenantId = tenantId;
      lastSyncVersion = 0;
    }

    const res = await crmApi.call('checkTenantSync', {
      tenantId,
      lastVersion: lastSyncVersion,
      userEmail
    });

    if (res && res.latestVersion) {
      const isInitialHandshake = lastSyncVersion === 0;
      lastSyncVersion = Math.max(lastSyncVersion, Number(res.latestVersion));

      if (!isInitialHandshake && res.changed && Array.isArray(res.events) && res.events.length > 0) {
        const cleanUserEmail = String(userEmail || '').trim().toLowerCase();
        
        res.events.forEach(ev => {
          const isActorCurrent = cleanUserEmail && String(ev.by || '').trim().toLowerCase() === cleanUserEmail;
          const isVeryRecent = (Date.now() - Number(ev.version || 0)) < 3000;

          // If performed on another machine / user, trigger real-time module refresh
          if (!isActorCurrent || !isVeryRecent) {
            broadcastCrmEvent({
              type: 'DATA_CHANGED',
              module: ev.module,
              action: ev.action,
              subType: ev.action,
              actorEmail: ev.by,
              timestamp: ev.timestamp,
              remote: true,
              tenantId: ev.tenantId
            });
          }
        });
      }
    }
  } catch (err) {
    // Gracefully ignore intermittent network blips
  } finally {
    isFetchInProgress = false;
  }
}

/**
 * Starts the cross-system realtime sync poller.
 * Polls at high frequency (2.5s) when window is active, 7s when minimized.
 */
export function startRealtimeSyncPoller() {
  if (isPollingActive) return;
  isPollingActive = true;
  lastSyncVersion = 0;

  const scheduleNext = () => {
    if (!isPollingActive) return;
    const isHidden = typeof document !== 'undefined' && document.hidden;
    const interval = isHidden ? 7000 : 2500;

    syncPollerTimer = setTimeout(async () => {
      await pollTenantSync();
      if (isPollingActive) scheduleNext();
    }, interval);
  };

  // Immediate initial check
  pollTenantSync().finally(() => {
    if (isPollingActive) scheduleNext();
  });
}

/**
 * Stops the realtime poller upon logout or teardown
 */
export function stopRealtimeSyncPoller() {
  isPollingActive = false;
  if (syncPollerTimer) {
    clearTimeout(syncPollerTimer);
    syncPollerTimer = null;
  }
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
    action,         // 'CREATE', 'UPDATE', 'DELETE', 'RESTORE', etc.
    module,         // 'Customers', 'Staff', 'Settings', etc.
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

// Audit tracking is maintained strictly within each Master table row
// (IsDeleted, Created_At, Created_By, Updated_At, Updated_By, Deleted_At, Deleted_By)
export function logAuditLocal(userEmail, action, module, recordId, details) {
  // Master record audit fields are updated directly on the entity
}

/**
 * Helper to generate default alphanumeric Code from Name initials:
 * e.g. "Hello World" -> "HW", "Hello" -> "H", "Wealth Management" -> "WM"
 */
export function getInitialsCode(name = '') {
  if (!name || typeof name !== 'string') return '';
  const trimmed = name.trim();
  if (!trimmed) return '';
  const words = trimmed.split(/[\s\-_&/]+/).map(w => w.replace(/^[^a-zA-Z0-9]+|[^a-zA-Z0-9]+$/g, '')).filter(Boolean);
  if (words.length === 0) return '';
  if (words.length === 1) {
    return words[0].charAt(0).toUpperCase();
  }
  return words.map(w => w.charAt(0).toUpperCase()).join('');
}

// Next autoincrement serial number / ID generator (pure numeric integer: last row + 1)
export function getNextEmployeeCode(employees = []) {
  let maxNum = 0;
  (employees || []).forEach(emp => {
    const raw = String(emp.EmployeeCode || '').trim();
    const num = parseInt(raw, 10);
    if (!isNaN(num) && num > maxNum) {
      maxNum = num;
    } else {
      const match = raw.match(/\d+/g);
      if (match) {
        const last = parseInt(match[match.length - 1], 10);
        if (last > maxNum) maxNum = last;
      }
    }
  });
  const total = (employees || []).length;
  const nextNum = Math.max(maxNum, total) + 1;
  return String(nextNum);
}

// Next autoincrement investor serial number / ID generator (pure numeric integer: last row + 1)
export function getNextCustomerCode(customers = []) {
  let maxNum = 0;
  (customers || []).forEach(cust => {
    const raw = String(cust.CustomerCode || '').trim();
    const num = parseInt(raw, 10);
    if (!isNaN(num) && num > maxNum) {
      maxNum = num;
    } else {
      const match = raw.match(/\d+/g);
      if (match) {
        const last = parseInt(match[match.length - 1], 10);
        if (last > maxNum) maxNum = last;
      }
    }
  });
  const total = (customers || []).length;
  const nextNum = Math.max(maxNum, total) + 1;
  return String(nextNum);
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
            if (data.ok) {
              const res = data.result;
              if (res && res.success === false) {
                req.reject(new Error(res.message || 'Server error'));
              } else {
                req.resolve(res && res.data !== undefined ? res.data : res);
              }
            } else {
              req.reject(new Error(data.error || 'Bridge request failed'));
            }
          }
        }
      });
    }

    iframe.src = url.includes('?') ? `${url}&bridge=1` : `${url}?bridge=1`;
    setTimeout(() => resolve(false), 7000);
  });

  return bridgeReadyPromise;
}

function callJsonp(url, action, payload = {}) {
  return new Promise((resolve, reject) => {
    const callbackName = 'crm_jsonp_' + Date.now() + '_' + Math.floor(Math.random() * 100000);
    const script = document.createElement('script');
    
    const timeout = setTimeout(() => {
      delete window[callbackName];
      if (script.parentNode) script.parentNode.removeChild(script);
      reject(new Error('JSONP request timed out (12s).'));
    }, 12000);

    window[callbackName] = (response) => {
      clearTimeout(timeout);
      delete window[callbackName];
      if (script.parentNode) script.parentNode.removeChild(script);
      if (response && response.success) {
        resolve(response.data !== undefined ? response.data : response);
      } else {
        const appErr = new Error(response?.message || 'Server error');
        appErr.isBackendError = true;
        reject(appErr);
      }
    };

    script.onerror = () => {
      clearTimeout(timeout);
      delete window[callbackName];
      if (script.parentNode) script.parentNode.removeChild(script);
      reject(new Error('Network error calling Google Apps Script. Please verify Deployment "Who has access" is set to "Anyone".'));
    };

    const separator = url.includes('?') ? '&' : '?';
    const payloadStr = encodeURIComponent(JSON.stringify(payload));
    script.src = `${url}${separator}callback=${callbackName}&action=${encodeURIComponent(action)}&payload=${payloadStr}`;
    document.body.appendChild(script);
  });
}

let cachedCentralConfig = null;
let centralConfigPromise = null;

const LIVE_GAS_URL = 'https://script.google.com/macros/s/AKfycby3bg1iDpQTYbj4vmD2dPHyTOlnqNUrg_aOSC5gxdwse5bt0mxtG_cja9t2zh7x8q9bBw/exec';
const DEAD_GAS_URLS = [
  'AKfycbw9r2OEf6eTEc0NRRmHsPJZKn_ikez9bPewbgho8WQd98E9rU8WR6LKf5d36a7utNq3Vg'
];

export const crmApi = {
  getBackendUrl() {
    let url = localStorage.getItem(STORAGE_KEYS.CONFIG_URL);
    // Auto-migrate from deprecated / dead Apps Script deployment URLs
    if (url) {
      const isDead = DEAD_GAS_URLS.some(dead => url.includes(dead));
      if (isDead) {
        localStorage.removeItem(STORAGE_KEYS.CONFIG_URL);
        url = null;
      }
    }
    // Normalize URL to always include /exec
    let effectiveUrl = (
      url ||
      (typeof import.meta !== 'undefined' && import.meta.env?.VITE_GAS_URL) ||
      (typeof window !== 'undefined' && window.CRM_CONFIG && window.CRM_CONFIG.GAS_URL) ||
      LIVE_GAS_URL
    );
    if (effectiveUrl && typeof effectiveUrl === 'string') {
      effectiveUrl = effectiveUrl.trim();
      if (!effectiveUrl.endsWith('/exec')) {
        effectiveUrl = effectiveUrl.replace(/\/+$/, '') + '/exec';
      }
    }
    return effectiveUrl;
  },

  setBackendUrl(url) {
    if (url) {
      let clean = url.trim();
      if (!clean.endsWith('/exec')) {
        clean = clean.replace(/\/+$/, '') + '/exec';
      }
      localStorage.setItem(STORAGE_KEYS.CONFIG_URL, clean);
    } else {
      localStorage.removeItem(STORAGE_KEYS.CONFIG_URL);
    }
  },

  /**
   * Fetches global configuration dynamically from Central_SaaS_Master_DB tab 'Default-Config'
   * Eliminates hardcoding in .env and allows real-time updates from Google Sheets!
   */
  async fetchDefaultConfig(force = false) {
    if (cachedCentralConfig && !force) return cachedCentralConfig;
    if (centralConfigPromise && !force) return centralConfigPromise;

    centralConfigPromise = (async () => {
      try {
        const gasUrl = this.getBackendUrl();
        if (!gasUrl || this.isDemoMode()) return {};
        const isLocal = typeof window !== 'undefined' && 
          (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');
        const endpoint = isLocal ? '/api/gas' : gasUrl;
        const headers = { 'Accept': 'application/json' };
        if (isLocal) {
          headers['x-gas-target-url'] = gasUrl;
        }

        // 1. Direct GET query (fastest, CORS-safe, pre-flight free)
        try {
          const sep = endpoint.includes('?') ? '&' : '?';
          const resp = await fetch(`${endpoint}${sep}action=getDefaultConfig`, {
            method: 'GET',
            headers
          });
          if (resp.ok) {
            const json = await resp.json();
            const cfg = json?.data || json?.result || json;
            if (cfg && typeof cfg === 'object' && (cfg.GoogleClientId || cfg.SystemName || cfg.googleclientid)) {
              cachedCentralConfig = cfg;
              const cid = cfg.GoogleClientId || cfg.googleclientid;
              if (cid) {
                localStorage.setItem(STORAGE_KEYS.GOOGLE_CLIENT_ID, String(cid).trim());
              }
              return cfg;
            }
          }
        } catch {
          // Ignore direct GET error and proceed to POST call fallback
        }

        // 2. Standard call fallback
        const res = await this.call('getDefaultConfig', {}, { silent: true });
        if (res && typeof res === 'object') {
          cachedCentralConfig = res;
          const cid = res.GoogleClientId || res.googleclientid;
          if (cid) {
            localStorage.setItem(STORAGE_KEYS.GOOGLE_CLIENT_ID, String(cid).trim());
          }
          return res;
        }
      } catch (err) {
        console.warn('Central DB Default-Config fetch notice:', err?.message || err);
      } finally {
        centralConfigPromise = null;
      }
      return cachedCentralConfig || {};
    })();

    return centralConfigPromise;
  },

  /**
   * Saves updated configuration to Central_SaaS_Master_DB tab 'Default-Config'
   */
  async saveDefaultConfig(configs = {}) {
    if (this.isDemoMode()) {
      if (configs.GoogleClientId) this.setGoogleClientId(configs.GoogleClientId);
      return { success: true, message: 'Saved to demo storage' };
    }
    const res = await this.call('saveDefaultConfig', configs);
    if (res && (res.data || res.success)) {
      await this.fetchDefaultConfig(true);
    }
    return res;
  },

  getLoginCompanyName() {
    return (
      cachedCentralConfig?.LoginCompanyName ||
      cachedCentralConfig?.logincompanyname ||
      cachedCentralConfig?.SystemName ||
      'SR INVESTMENTS CRM'
    );
  },

  async sendPasswordResetOtp(identifier) {
    return this.call('sendPasswordResetOtp', { identifier });
  },

  async verifyPasswordResetOtp(identifier, otp) {
    return this.call('verifyPasswordResetOtp', { identifier, otp });
  },

  async resetPasswordWithOtp(identifier, otp, resetToken, newPassword) {
    return this.call('resetPasswordWithOtp', { identifier, otp, resetToken, newPassword });
  },

  async getDailyDispatchStats() {
    return this.call('getDailyDispatchStats');
  },

  getGoogleClientId() {
    return (
      localStorage.getItem(STORAGE_KEYS.GOOGLE_CLIENT_ID) ||
      cachedCentralConfig?.GoogleClientId ||
      cachedCentralConfig?.googleclientid ||
      (typeof import.meta !== 'undefined' && import.meta.env?.VITE_GOOGLE_CLIENT_ID) ||
      (typeof window !== 'undefined' && window.CRM_CONFIG && window.CRM_CONFIG.GOOGLE_CLIENT_ID) ||
      ''
    );
  },

  setGoogleClientId(clientId) {
    if (clientId) {
      localStorage.setItem(STORAGE_KEYS.GOOGLE_CLIENT_ID, clientId.trim());
    } else {
      localStorage.removeItem(STORAGE_KEYS.GOOGLE_CLIENT_ID);
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

  publishEvent(event) {
    broadcastCrmEvent(event);
  },

  broadcastEvent(event) {
    broadcastCrmEvent(event);
  },

  async checkTenantSync(tenantId, lastVersion = 0) {
    return this.call('checkTenantSync', { tenantId, lastVersion });
  },

  async getTenants(showDeleted = false) {
    return this.call('getTenants', { showDeleted });
  },

  async saveTenant(tenantData) {
    return this.call('saveTenant', tenantData);
  },

  async deleteTenant(tenantId) {
    return this.call('deleteTenant', { tenantId });
  },

  async getTenantLicenses(tenantId, showDeleted = false) {
    return this.call('getTenantLicenses', { tenantId, showDeleted });
  },

  async saveTenantLicense(licenseData) {
    return this.call('saveTenantLicense', licenseData);
  },

  async getSubscriptionPlans(showDeleted = false) {
    return this.call('getSubscriptionPlans', { showDeleted });
  },

  async saveSubscriptionPlan(planData) {
    return this.call('saveSubscriptionPlan', planData);
  },

  async deleteSubscriptionPlan(planId) {
    return this.call('deleteSubscriptionPlan', { PlanId: planId });
  },

  async activateTenantLicense(licenseId, tenantId) {
    return this.call('activateTenantLicense', { licenseId, tenantId });
  },

  async cancelTenantLicense(licenseId, tenantId) {
    return this.call('cancelTenantLicense', { licenseId, tenantId });
  },

  async getCentralUsers(showDeleted = false) {
    return this.call('getCentralUsers', { showDeleted });
  },

  async saveCentralUser(userData) {
    return this.call('saveCentralUser', userData);
  },

  async deleteCentralUser(userId) {
    return this.call('deleteCentralUser', { userId });
  },

  async restoreCentralUser(userId) {
    return this.call('restoreCentralUser', { userId });
  },

  async getTenantUserMappings(tenantId = null, showDeleted = false) {
    return this.call('getTenantUserMappings', { tenantId, showDeleted });
  },

  async saveTenantUserMappings(tenantId, mappings, replaceMode = true) {
    return this.call('saveTenantUserMappings', { tenantId, mappings, replaceMode });
  },

  async deleteTenantUserMapping(mappingId, tenantId = null, userId = null) {
    return this.call('deleteTenantUserMapping', { mappingId, tenantId, userId });
  },

  async testConnection(targetUrl) {
    const gasUrl = (targetUrl || this.getBackendUrl() || '').trim();
    if (!gasUrl) {
      throw new Error('Please enter a valid Google Apps Script Web App URL.');
    }
    const isLocal = typeof window !== 'undefined' && 
      (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');
    const endpoint = isLocal ? '/api/gas' : gasUrl;
    const customHeaders = isLocal ? { 'x-gas-target-url': gasUrl } : {};

    // 1. Direct GET health check (fastest)
    try {
      const pingUrl = endpoint.includes('?') ? `${endpoint}&action=health&ping=1` : `${endpoint}?action=health&ping=1`;
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 7000);
      const res = await fetch(pingUrl, {
        method: 'GET',
        headers: customHeaders,
        redirect: 'follow',
        signal: controller.signal
      });
      clearTimeout(timeoutId);
      if (res.ok) {
        const json = await res.json();
        return { success: true, timestamp: json.timestamp || new Date().toISOString() };
      }
    } catch (e) {
      console.warn('Direct GET test failed, trying fallbacks...', e);
    }

    // 2. Direct JSONP fallback (if not on local)
    if (!isLocal) {
      try {
        const res = await callJsonp(gasUrl, 'health', {});
        return { success: true, timestamp: res.timestamp || new Date().toISOString() };
      } catch (e) {
        console.warn('JSONP test failed...', e);
      }
    }

    throw new Error('Connection test failed. Please verify the Web App deployment has "Who has access" set to "Anyone".');
  },

  getActiveTenant() {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.ACTIVE_TENANT);
      return stored ? JSON.parse(stored) : null;
    } catch (e) {
      return null;
    }
  },

  setActiveTenant(tenant) {
    if (tenant) {
      localStorage.setItem(STORAGE_KEYS.ACTIVE_TENANT, JSON.stringify(tenant));
    } else {
      localStorage.removeItem(STORAGE_KEYS.ACTIVE_TENANT);
    }
  },

  async call(action, payload = {}) {
    const isTracked = action !== 'checkTenantSync' && action !== 'health' && !payload?._silent;
    if (isTracked) notifyDbCallStart(action);
    let callSuccess = false;
    let callError = null;
    try {
      const res = await this._executeCall(action, payload);
      callSuccess = true;
      return res;
    } catch (err) {
      callError = err;
      throw err;
    } finally {
      if (isTracked) notifyDbCallEnd(action, callSuccess, callError);
    }
  },

  async _executeCall(action, payload = {}) {
    let currentUserEmail = 'admin@srinvestments.com';
    let currentUserName = 'Administrator';
    let currentTenantId = 'TEN001';
    let currentUserId = 'USER1';
    let currentUserIsSuperAdmin = false;
    try {
      const stored = localStorage.getItem('sr_crm_auth_user');
      if (stored) {
        const u = JSON.parse(stored);
        if (u.email) currentUserEmail = u.email;
        if (u.name) currentUserName = u.name;
        if (u.activeTenantId) currentTenantId = u.activeTenantId;
        if (u.userId || u.UserId) currentUserId = u.userId || u.UserId;
        currentUserIsSuperAdmin = Boolean(
          u.isSuperAdmin === true ||
          String(u.isSuperAdmin).toLowerCase() === 'true' ||
          u.IsSuperAdmin === true ||
          String(u.IsSuperAdmin).toLowerCase() === 'true'
        );
      }
      const activeTenant = this.getActiveTenant();
      if (activeTenant && activeTenant.tenantId) {
        currentTenantId = activeTenant.tenantId;
      }
    } catch (e) {}

    const enrichedPayload = {
      ...payload,
      tenantId: payload.tenantId !== undefined ? payload.tenantId : currentTenantId,
      userEmail: payload.userEmail || currentUserEmail,
      userName: payload.userName || currentUserName,
      userId: payload.userId || currentUserId,
      isSuperAdmin: payload.isSuperAdmin !== undefined ? payload.isSuperAdmin : currentUserIsSuperAdmin
    };

    if (this.isDemoMode()) {
      return this.handleDemoAction(action, enrichedPayload);
    }

    const gasUrl = this.getBackendUrl();

    if (action === 'health') {
      return this.testConnection(gasUrl);
    }

    const isLocal = typeof window !== 'undefined' && 
      (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');
    const endpoint = isLocal ? '/api/gas' : gasUrl;
    const postHeaders = {
      'Content-Type': 'text/plain;charset=utf-8'
    };
    if (isLocal) {
      postHeaders['x-gas-target-url'] = gasUrl;
    }

    // 1. Direct fetch (POST) - seamlessly proxied on localhost via Vite dev proxy
    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: postHeaders,
        body: JSON.stringify({ action, payload: enrichedPayload }),
        redirect: 'follow'
      });

      if (response.ok) {
        const json = await response.json();
        if (json.success) return json.data !== undefined ? json.data : json;
        const appErr = new Error(json.message || 'Server error');
        appErr.isBackendError = true;
        throw appErr;
      }
    } catch (fetchErr) {
      if (fetchErr.isBackendError) {
        throw fetchErr;
      }
      console.warn('Direct POST fetch failed, falling back...', fetchErr);
    }

    // 2. Direct GET fetch fallback for moderate payloads
    const hasLargePayload = enrichedPayload?.image?.base64 || (JSON.stringify(enrichedPayload).length > 1800);
    if (!hasLargePayload) {
      try {
        const payloadStr = encodeURIComponent(JSON.stringify(enrichedPayload));
        const sep = endpoint.includes('?') ? '&' : '?';
        const getUrl = `${endpoint}${sep}action=${encodeURIComponent(action)}&payload=${payloadStr}`;
        const getHeaders = isLocal ? { 'x-gas-target-url': gasUrl } : {};
        const response = await fetch(getUrl, {
          method: 'GET',
          headers: getHeaders,
          redirect: 'follow'
        });
        if (response.ok) {
          const json = await response.json();
          if (json.success) return json.data !== undefined ? json.data : json;
          const appErr = new Error(json.message || 'Server error');
          appErr.isBackendError = true;
          throw appErr;
        }
      } catch (getErr) {
        if (getErr.isBackendError) {
          throw getErr;
        }
        console.warn('Direct GET fetch fallback failed...', getErr);
      }
    }

    // 3. JSONP fallback (for production/remote non-localhost)
    if (!hasLargePayload && !isLocal) {
      try {
        const jsonpData = await callJsonp(gasUrl, action, enrichedPayload);
        return jsonpData;
      } catch (jsonpErr) {
        if (jsonpErr.isBackendError) {
          throw jsonpErr;
        }
        console.warn('JSONP fallback failed...', jsonpErr);
      }
    }

    throw new Error('Unable to communicate with Google Apps Script backend. Please verify your internet connection and deployment settings ("Who has access" = "Anyone").');
  },

  async handleDemoAction(action, payload) {
    initDemoStore();
    await new Promise((r) => setTimeout(r, 150));

    const assertSuperAdminDemo = (p) => {
      const userMaster = JSON.parse(localStorage.getItem(STORAGE_KEYS.USER_MASTER) || '[]');
      const reqEmail = String(p.userEmail || '').trim().toLowerCase();
      const reqId = String(p.userId || '').trim().toLowerCase();

      if (!reqEmail && !reqId) {
        throw new Error('Access Denied: Requester identity missing. Super Admin privilege (IsSuperAdmin=TRUE) is required.');
      }

      const matched = userMaster.find(u => {
        if (u.IsDeleted) return false;
        const matchEmail = u.Email && u.Email.toLowerCase() === reqEmail;
        const matchId = u.UserId && u.UserId.toLowerCase() === reqId;
        const altEmails = u.AlternateEmailsList || u.GoogleEmails || '';
        const altList = altEmails ? altEmails.toLowerCase().split(',').map(s => s.trim()) : [];
        return matchEmail || matchId || (reqEmail && altList.includes(reqEmail));
      });

      if (!matched) {
        throw new Error(`Access Denied: User (${reqEmail || reqId}) not found in User Master. Super Admin privilege required.`);
      }

      const isSuper = Boolean(matched.IsSuperAdmin) || String(matched.IsSuperAdmin).toLowerCase() === 'true';
      if (!isSuper) {
        throw new Error(`Access Denied: Super Admin privilege required. IsSuperAdmin is FALSE in database for user (${matched.Email || reqEmail}). Operation rejected.`);
      }
      return matched;
    };

    const checkDemoTenantLicenseActive = (tenantId, isSuperAdmin) => {
      if (isSuperAdmin) return { valid: true };
      if (!tenantId) return { valid: true };
      let licenses = JSON.parse(localStorage.getItem(STORAGE_KEYS.TENANT_LICENSES) || '[]');
      const tenantLicenses = licenses.filter(l => String(l.TenantId).toUpperCase() === String(tenantId).toUpperCase() && !l.IsDeleted);
      if (tenantLicenses.length === 0) return { valid: true };
      
      const now = new Date();
      const today = now.toISOString().slice(0, 10);
      let activeLic = tenantLicenses.find(l => Boolean(l.IsActive) || String(l.Status).toLowerCase() === 'active');
      
      if (activeLic && activeLic.EndDate && today > activeLic.EndDate) {
        activeLic.IsActive = false;
        activeLic.Status = 'Expired';
        activeLic = null;
      }

      if (!activeLic) {
        // Auto-promote queued NEW license if StartDate <= today <= EndDate
        const queued = tenantLicenses.filter(l => 
          (String(l.Status).toLowerCase() === 'new' || String(l.Status).toLowerCase() === 'upcoming') &&
          l.StartDate && today >= l.StartDate && (!l.EndDate || today <= l.EndDate)
        );
        if (queued.length > 0) {
          queued.sort((a, b) => new Date(a.StartDate).getTime() - new Date(b.StartDate).getTime());
          queued[0].IsActive = true;
          queued[0].Status = 'Active';
          activeLic = queued[0];
          localStorage.setItem(STORAGE_KEYS.TENANT_LICENSES, JSON.stringify(licenses));
        }
      }

      if (!activeLic) {
        return { valid: false, error: `Subscription Expired: No active subscription found for your organization (${tenantId}). Please contact your CRM Administrator or Super Admin to renew.` };
      }
      return { valid: true };
    };

    switch (action) {
      case 'health':
        return { ok: true, mode: 'Demo / Local Storage', timestamp: new Date().toISOString() };

      // Multi-credential login: staffId / emailId / mobileNo + password
      case 'login': {
        const { username, password } = payload;
        if (!username || !password) throw new Error('Username and password are required.');

        const cleanInput = username.trim().toLowerCase();
        const cleanMobile = username.trim().replace(/[\s\-\(\)\+]/g, '');

        // 1. Central SaaS User_Master lookup
        const userMaster = JSON.parse(localStorage.getItem(STORAGE_KEYS.USER_MASTER) || '[]');
        const tenants = JSON.parse(localStorage.getItem(STORAGE_KEYS.TENANTS) || '[]');
        const mappings = JSON.parse(localStorage.getItem(STORAGE_KEYS.TENANT_USER_MAPPING) || '[]');

        const matchedUser = userMaster.find((u) => {
          if (u.IsDeleted) return false;
          const matchEmail = u.Email && u.Email.toLowerCase() === cleanInput;
          const matchId = u.UserId && u.UserId.toLowerCase() === cleanInput;
          const matchMobile = u.Mobile && u.Mobile.replace(/[\s\-\(\)\+]/g, '') === cleanMobile;
          const altMobiles = u.AlternateMobile ? u.AlternateMobile.split(',').map(m => m.replace(/[\s\-\(\)\+]/g, '').trim()) : [];
          const matchAltMobile = altMobiles.includes(cleanMobile);
          const altEmails = u.AlternateEmailsList || u.GoogleEmails;
          const gList = altEmails ? altEmails.toLowerCase().split(',').map(s => s.trim()) : [];
          return matchEmail || matchId || matchMobile || matchAltMobile || gList.includes(cleanInput);
        });

        if (matchedUser) {
          const rawPass = password.trim();
          const hashedInput = await hashPasswordSHA256(rawPass);
          const storedPass = String(matchedUser.Password || '').trim();
          const isValid = (storedPass === hashedInput) || (storedPass === rawPass) || (rawPass === 'admin123') || (rawPass === 'password123');
          if (!isValid) {
            throw new Error('Invalid password.');
          }
          if (matchedUser.Status !== 'Active') {
            throw new Error('This user account is inactive. Please contact Administrator.');
          }

          const userWorkspaces = mappings
            .filter(m => !m.IsDeleted && String(m.Status).toLowerCase() === 'active' && (m.UserId === matchedUser.UserId || m.UserId === matchedUser.Email))
            .map(m => {
              const t = tenants.find(x => x.TenantId === m.TenantId && !x.IsDeleted);
              return t ? {
                tenantId: t.TenantId,
                companyName: t.CompanyName,
                arnNumber: t.ArnNumber || '',
                role: m.Role || 'Staff',
                status: t.Status
              } : null;
            })
            .filter(Boolean);

          // If user belongs to multiple organizations -> show Workspace Picker screen!
          if (userWorkspaces.length > 1) {
            return {
              multiTenant: true,
              preAuthToken: 'PRE_' + Date.now(),
              user: {
                userId: matchedUser.UserId,
                name: matchedUser.FullName,
                email: matchedUser.Email,
                isSuperAdmin: Boolean(matchedUser.IsSuperAdmin)
              },
              workspaces: userWorkspaces
            };
          }

          // Single workspace direct login
          const defaultTenant = tenants.find(t => !t.IsDeleted);
          const primaryTenant = userWorkspaces[0] || {
            tenantId: defaultTenant?.TenantId || 'TEN001',
            companyName: defaultTenant?.CompanyName || 'SR GROWW',
            CompanyName: defaultTenant?.CompanyName || 'SR GROWW',
            tagLine: defaultTenant?.TagLine || 'Mutual Fund CRM',
            TagLine: defaultTenant?.TagLine || 'Mutual Fund CRM',
            role: matchedUser.IsSuperAdmin ? 'Admin' : 'Staff'
          };

          const licChk = checkDemoTenantLicenseActive(primaryTenant.tenantId, Boolean(matchedUser.IsSuperAdmin));
          if (!licChk.valid) throw new Error(licChk.error);

          const sessionUser = {
            userId: matchedUser.UserId,
            employeeCode: 'EMP_' + primaryTenant.tenantId,
            name: matchedUser.FullName,
            email: matchedUser.Email,
            role: primaryTenant.role || 'Staff',
            isSuperAdmin: Boolean(matchedUser.IsSuperAdmin),
            status: matchedUser.Status,
            activeTenantId: primaryTenant.tenantId,
            companyName: primaryTenant.companyName,
            workspaces: userWorkspaces,
            lastLogin: new Date().toISOString()
          };

          crmApi.setActiveTenant(primaryTenant);
          return {
            user: sessionUser,
            tenant: primaryTenant,
            rights: JSON.parse(localStorage.getItem(STORAGE_KEYS.RIGHTS) || '[]'),
            token: 'TOKEN_' + Date.now()
          };
        }

        // Fallback: Check legacy employees
        const employees = JSON.parse(localStorage.getItem(STORAGE_KEYS.EMPLOYEES) || '[]');
        if (cleanInput === 'admin' || cleanInput === 'admin@srinvestments.com') {
          if (password === 'admin123' || password === 'password123') {
            const adminTenant = tenants[0] || { tenantId: 'TEN001', companyName: 'ABC Investments', role: 'Admin' };
            crmApi.setActiveTenant(adminTenant);
            return {
              user: {
                userId: 'USR_001',
                employeeCode: 'SR-ADMIN',
                name: 'System Administrator (Founder)',
                email: 'admin@srinvestments.com',
                mobile: '+91 98765 43210',
                role: 'Admin',
                isSuperAdmin: true,
                status: 'Active',
                activeTenantId: adminTenant.tenantId,
                companyName: adminTenant.companyName,
                workspaces: [adminTenant],
                lastLogin: new Date().toISOString()
              },
              tenant: adminTenant,
              rights: JSON.parse(localStorage.getItem(STORAGE_KEYS.RIGHTS) || '[]'),
              token: 'TOKEN_' + Date.now()
            };
          }
        }

        const staff = employees.find((e) => {
          const matchCode = e.EmployeeCode && e.EmployeeCode.trim().toLowerCase() === cleanInput;
          const matchEmail = e.Email && e.Email.trim().toLowerCase() === cleanInput;
          const matchGoogleEmails = e.GoogleEmails && e.GoogleEmails.toLowerCase().split(',').map(s => s.trim()).includes(cleanInput);
          const empMobileClean = e.Mobile ? e.Mobile.replace(/[\s\-\(\)\+]/g, '') : '';
          const matchMobile = empMobileClean && empMobileClean === cleanMobile;
          return matchCode || matchEmail || matchGoogleEmails || matchMobile;
        });

        if (!staff) {
          throw new Error('No account found for this Username / Staff ID / Email / Mobile.');
        }

        if (staff.Status !== 'Active') {
          throw new Error('This account is inactive. Please contact your CRM Administrator.');
        }

        const rawPass = password.trim();
        const hashedInput = await hashPasswordSHA256(rawPass);
        const expectedPassword = String(staff.Password || 'password123').trim();
        const isValid = (expectedPassword === hashedInput) || (expectedPassword === rawPass) || (rawPass === 'admin123') || (rawPass === 'password123');
        if (!isValid) {
          throw new Error('Invalid password.');
        }

        const defaultTenant = tenants[0] || { tenantId: 'TEN001', companyName: 'ABC Investments', role: staff.Role || 'Staff' };
        crmApi.setActiveTenant(defaultTenant);

        return {
          user: {
            userId: staff.EmployeeId,
            employeeCode: staff.EmployeeCode,
            name: staff.FullName,
            email: staff.Email,
            googleEmails: staff.GoogleEmails,
            mobile: staff.Mobile,
            role: staff.Role || 'Staff',
            isSuperAdmin: false,
            activeTenantId: defaultTenant.tenantId,
            companyName: defaultTenant.companyName,
            department: staff.Department,
            status: staff.Status,
            workspaces: [defaultTenant],
            lastLogin: new Date().toISOString()
          },
          tenant: defaultTenant,
          rights: JSON.parse(localStorage.getItem(STORAGE_KEYS.RIGHTS) || '[]'),
          token: 'TOKEN_' + Date.now()
        };
      }

      // Login with Google (supports multi-workspace detection as in Image 5)
      case 'googleLogin': {
        const { googleEmail, googleName } = payload;
        if (!googleEmail) throw new Error('Google email required.');

        const cleanEmail = googleEmail.trim().toLowerCase();
        const userMaster = JSON.parse(localStorage.getItem(STORAGE_KEYS.USER_MASTER) || '[]');
        const tenants = JSON.parse(localStorage.getItem(STORAGE_KEYS.TENANTS) || '[]');
        const mappings = JSON.parse(localStorage.getItem(STORAGE_KEYS.TENANT_USER_MAPPING) || '[]');

        let isSuperAdmin = cleanEmail.includes('admin') || cleanEmail === 'admin@srinvestments.com';
        let matchedUser = userMaster.find((u) => {
          if (u.IsDeleted) return false;
          const matchEmail = u.Email && u.Email.toLowerCase() === cleanEmail;
          const altEmails = u.AlternateEmailsList || u.GoogleEmails;
          const gList = altEmails ? altEmails.toLowerCase().split(',').map(s => s.trim()) : [];
          return matchEmail || gList.includes(cleanEmail);
        });

        if (!matchedUser) {
          const employees = JSON.parse(localStorage.getItem(STORAGE_KEYS.EMPLOYEES) || '[]');
          const emp = employees.find(e => {
            if (e.IsDeleted) return false;
            const matchEmail = e.Email && e.Email.toLowerCase() === cleanEmail;
            const altEmails = e.AlternateEmailsList || e.GoogleEmails;
            const gList = altEmails ? altEmails.toLowerCase().split(',').map(s => s.trim()) : [];
            return matchEmail || gList.includes(cleanEmail);
          });
          if (emp) {
            matchedUser = {
              UserId: emp.EmployeeId || emp.EmployeeCode,
              FullName: emp.FullName,
              Email: emp.Email,
              Role: emp.Role || 'Staff',
              Status: emp.Status,
              IsSuperAdmin: false
            };
          }
        }

        if (!matchedUser) {
          throw new Error('Access Denied: Google account (' + cleanEmail + ') is not registered in this CRM. Please contact your CRM Administrator.');
        }

        if (matchedUser.Status && String(matchedUser.Status).toLowerCase() !== 'active') {
          throw new Error('Your CRM account (' + cleanEmail + ') is inactive. Please contact CRM Administrator.');
        }

        if (matchedUser) {
          isSuperAdmin = Boolean(matchedUser.IsSuperAdmin);
        }

        const userId = matchedUser.UserId || cleanEmail;
        const userName = matchedUser.FullName || googleName || 'Google User';

        const userWorkspaces = mappings
          .filter(m => !m.IsDeleted && String(m.Status).toLowerCase() === 'active' && (m.UserId === userId || m.UserId === cleanEmail))
          .map(m => {
            const t = tenants.find(x => x.TenantId === m.TenantId && !x.IsDeleted);
            return t ? {
              tenantId: t.TenantId,
              companyName: t.CompanyName,
              arnNumber: t.ArnNumber || '',
              role: m.Role || 'Staff',
              status: t.Status
            } : null;
          })
          .filter(Boolean);

        // Multiple organizations found -> prompt workspace selection!
        if (userWorkspaces.length > 1) {
          return {
            multiTenant: true,
            preAuthToken: 'PRE_G_' + Date.now(),
            user: {
              userId,
              name: userName,
              email: cleanEmail,
              isSuperAdmin
            },
            workspaces: userWorkspaces
          };
        }

        const defaultTenant = tenants.find(t => !t.IsDeleted);
        const primaryTenant = userWorkspaces[0] || {
          tenantId: defaultTenant?.TenantId || 'TEN001',
          companyName: defaultTenant?.CompanyName || 'SR GROWW',
          CompanyName: defaultTenant?.CompanyName || 'SR GROWW',
          tagLine: defaultTenant?.TagLine || 'Mutual Fund CRM',
          TagLine: defaultTenant?.TagLine || 'Mutual Fund CRM',
          role: isSuperAdmin ? 'Admin' : 'Staff'
        };

        const licChk = checkDemoTenantLicenseActive(primaryTenant.tenantId, isSuperAdmin);
        if (!licChk.valid) throw new Error(licChk.error);

        const sessionUser = {
          userId,
          employeeCode: 'GOOGLE_' + primaryTenant.tenantId,
          name: userName,
          email: cleanEmail,
          role: primaryTenant.role || (isSuperAdmin ? 'Admin' : 'Staff'),
          isSuperAdmin,
          status: 'Active',
          activeTenantId: primaryTenant.tenantId,
          companyName: primaryTenant.companyName,
          workspaces: userWorkspaces.length ? userWorkspaces : [primaryTenant],
          lastLogin: new Date().toISOString()
        };

        crmApi.setActiveTenant(primaryTenant);
        return {
          user: sessionUser,
          tenant: primaryTenant,
          rights: JSON.parse(localStorage.getItem(STORAGE_KEYS.RIGHTS) || '[]'),
          token: 'GOOGLE_TOKEN_' + Date.now()
        };
      }

      // Finalize workspace selection from Workspace Picker or In-App Switcher
      case 'selectTenant': {
        const { tenantId, userId, userEmail, userName, isSuperAdmin } = payload;
        const tenants = JSON.parse(localStorage.getItem(STORAGE_KEYS.TENANTS) || '[]');
        const mappings = JSON.parse(localStorage.getItem(STORAGE_KEYS.TENANT_USER_MAPPING) || '[]');

        const t = tenants.find(x => x.TenantId === tenantId && !x.IsDeleted);
        if (!t) throw new Error('Workspace not found or inactive.');

        const licChk = checkDemoTenantLicenseActive(tenantId, Boolean(isSuperAdmin));
        if (!licChk.valid) throw new Error(licChk.error);

        const userWorkspaces = mappings
          .filter(m => !m.IsDeleted && String(m.Status).toLowerCase() === 'active' && (m.UserId === userId || m.UserId === userEmail))
          .map(m => {
            const tMatch = tenants.find(x => x.TenantId === m.TenantId && !x.IsDeleted);
            return tMatch ? {
              tenantId: tMatch.TenantId,
              companyName: tMatch.CompanyName,
              arnNumber: tMatch.ArnNumber || '',
              role: m.Role || 'Staff',
              status: tMatch.Status
            } : null;
          })
          .filter(Boolean);

        const mapEntry = mappings.find(m => m.TenantId === tenantId && (m.UserId === userId || m.UserId === userEmail));
        const role = mapEntry ? mapEntry.Role : (payload.role || 'Staff');

        let resolvedCompName = '';
        let resolvedTagLine = '';
        if (isSuperAdmin) {
          const defCfg = JSON.parse(localStorage.getItem(STORAGE_KEYS.DEFAULT_CONFIG) || '{}');
          resolvedCompName = defCfg.CompanyName || defCfg.LoginCompanyName || 'SR TECHNO';
          resolvedTagLine = defCfg.CompanyTagLine || defCfg.TagLine || 'SuperAdmin App';
        } else {
          resolvedCompName = t.CompanyName || 'SR Groww';
          resolvedTagLine = t.TagLine || 'Mutual Fund CRM';
        }

        const selectedTenant = {
          tenantId: t.TenantId,
          companyName: resolvedCompName,
          CompanyName: resolvedCompName,
          tagLine: resolvedTagLine,
          TagLine: resolvedTagLine,
          arnNumber: t.ArnNumber || '',
          role,
          status: t.Status
        };

        const sessionUser = {
          userId: userId || 'USR_001',
          employeeCode: 'EMP_' + t.TenantId,
          name: userName || 'User',
          email: userEmail,
          role,
          isSuperAdmin: Boolean(isSuperAdmin),
          status: 'Active',
          activeTenantId: t.TenantId,
          companyName: resolvedCompName,
          CompanyName: resolvedCompName,
          tagLine: resolvedTagLine,
          TagLine: resolvedTagLine,
          workspaces: userWorkspaces.length ? userWorkspaces : [selectedTenant],
          lastLogin: new Date().toISOString()
        };

        crmApi.setActiveTenant(selectedTenant);
        return {
          user: sessionUser,
          tenant: selectedTenant,
          rights: JSON.parse(localStorage.getItem(STORAGE_KEYS.RIGHTS) || '[]'),
          token: 'TOKEN_TEN_' + Date.now()
        };
      }

      // ==========================================
      // FORGOT PASSWORD VIA OTP (Demo mode)
      // ==========================================
      case 'sendPasswordResetOtp': {
        const identifier = String(payload.identifier || payload.username || payload.email || '').trim().toLowerCase();
        const employees = JSON.parse(localStorage.getItem(STORAGE_KEYS.EMPLOYEES) || '[]');
        const userMaster = JSON.parse(localStorage.getItem(STORAGE_KEYS.USER_MASTER) || '[]');
        const cleanMobile = identifier.replace(/[\s\-\(\)\+]/g, '');

        let matched = userMaster.find(u => 
          (u.Email && u.Email.toLowerCase() === identifier) ||
          (u.UserId && u.UserId.toLowerCase() === identifier) ||
          (u.Mobile && u.Mobile.replace(/[\s\-\(\)\+]/g, '') === cleanMobile)
        );

        if (!matched) {
          matched = employees.find(e => 
            (e.Email && e.Email.toLowerCase() === identifier) ||
            (e.EmployeeCode && e.EmployeeCode.toLowerCase() === identifier) ||
            (e.Mobile && e.Mobile.replace(/[\s\-\(\)\+]/g, '') === cleanMobile)
          );
        }

        if (!matched) {
          throw new Error('User does not exist. Please enter a valid registered Email ID or Contact Number.');
        }

        const email = matched.Email || (identifier.includes('@') ? identifier : 'admin@srinvestments.com');
        const mobile = matched.Mobile || (cleanMobile.length >= 10 ? cleanMobile : '8306588313');
        const demoOtp = '123456';
        sessionStorage.setItem('sr_demo_otp_' + email.toLowerCase(), JSON.stringify({
          otp: demoOtp,
          email,
          mobile,
          expiresAt: Date.now() + 10 * 60 * 1000
        }));

        const maskEmail = (em) => {
          if (!em || !em.includes('@')) return em || '';
          const parts = em.split('@');
          return parts[0].charAt(0) + '***' + parts[0].slice(-1) + '@' + parts[1];
        };

        const maskMobile = (mob) => {
          if (!mob) return '';
          const digits = mob.replace(/\D/g, '');
          return digits.length > 4 ? '******' + digits.slice(-4) : '****';
        };

        const maskedEmail = maskEmail(email);
        const maskedMobile = maskMobile(mobile);

        return {
          success: true,
          message: `Verification code sent to Email (${maskedEmail}) and Mobile SMS (${maskedMobile}). (Demo OTP: 123456)`,
          maskedEmail,
          maskedMobile,
          emailSent: true,
          smsSent: true,
          email,
          mobile,
          identifier
        };
      }

      case 'verifyPasswordResetOtp': {
        const email = String(payload.email || payload.identifier || '').trim().toLowerCase();
        const inputOtp = String(payload.otp || '').trim();
        const storedStr = sessionStorage.getItem('sr_demo_otp_' + email) || sessionStorage.getItem('sr_demo_otp_admin@srinvestments.com');

        if (!storedStr && inputOtp !== '123456') {
          throw new Error('Verification code has expired or was not requested.');
        }

        if (inputOtp !== '123456') {
          const stored = JSON.parse(storedStr);
          if (stored.otp !== inputOtp) throw new Error('Incorrect verification code. Please check and try again.');
        }

        const resetToken = 'RST_DEMO_' + Date.now();
        sessionStorage.setItem('sr_demo_reset_token_' + email, resetToken);
        return {
          success: true,
          message: 'Code verified successfully.',
          resetToken,
          email
        };
      }

      case 'resetPasswordWithOtp': {
        const { newPassword } = payload;
        const email = String(payload.email || payload.identifier || '').trim().toLowerCase();
        const passRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z\d]).{8,}$/;
        if (!newPassword || !passRegex.test(newPassword)) {
          throw new Error('Password must be at least 8 characters long and include an uppercase letter, lowercase letter, number, and special character.');
        }

        const employees = JSON.parse(localStorage.getItem(STORAGE_KEYS.EMPLOYEES) || '[]');
        const updatedEmps = employees.map(e => {
          if (e.Email && e.Email.toLowerCase() === email) {
            return { ...e, Password: newPassword };
          }
          return e;
        });
        localStorage.setItem(STORAGE_KEYS.EMPLOYEES, JSON.stringify(updatedEmps));

        const userMaster = JSON.parse(localStorage.getItem(STORAGE_KEYS.USER_MASTER) || '[]');
        const updatedUM = userMaster.map(u => {
          if (u.Email && u.Email.toLowerCase() === email) {
            return { ...u, Password: newPassword };
          }
          return u;
        });
        localStorage.setItem(STORAGE_KEYS.USER_MASTER, JSON.stringify(updatedUM));

        return {
          success: true,
          message: 'Password updated successfully! You can now log in with your new password.',
          email
        };
      }

      // ==========================================
      // SUPERADMIN CLIENT & LICENSING SAAS ACTIONS
      // ==========================================
      case 'getTenantBranding': {
        const isSuperAdmin = Boolean(payload.isSuperAdmin === true || String(payload.isSuperAdmin).toLowerCase() === 'true');
        if (isSuperAdmin) {
          const defCfg = JSON.parse(localStorage.getItem(STORAGE_KEYS.DEFAULT_CONFIG) || '{}');
          const cName = defCfg.CompanyName || defCfg.LoginCompanyName || 'SR TECHNO';
          const tLine = defCfg.CompanyTagLine || defCfg.TagLine || 'SuperAdmin App';
          return {
            success: true,
            isSuperAdmin: true,
            tenantId: 'CENTRAL',
            companyName: cName,
            CompanyName: cName,
            tagLine: tLine,
            TagLine: tLine,
            arnNumber: '',
            supportEmail: defCfg.SupportEmail || '',
            contactPhone: ''
          };
        }

        const tenants = JSON.parse(localStorage.getItem(STORAGE_KEYS.TENANTS) || '[]');
        let tId = payload.tenantId || payload.TenantId;
        if ((!tId || tId === 'CENTRAL') && payload.userId) {
          const mappings = JSON.parse(localStorage.getItem(STORAGE_KEYS.TENANT_USER_MAPPINGS) || '[]');
          const userMap = mappings.find(m => !m.IsDeleted && String(m.Status).toLowerCase() === 'active' && String(m.UserId).toLowerCase() === String(payload.userId).toLowerCase());
          if (userMap) tId = userMap.TenantId;
        }
        if (!tId || tId === 'CENTRAL') tId = 'TEN001';

        const t = tenants.find(x => String(x.TenantId || '').toUpperCase() === String(tId).toUpperCase() && !x.IsDeleted) || tenants[0];
        const cName = t?.CompanyName || 'SR Groww';
        const tLine = t?.TagLine || 'Mutual Fund CRM';
        return {
          success: true,
          isSuperAdmin: false,
          tenantId: t?.TenantId || tId,
          companyName: cName,
          CompanyName: cName,
          tagLine: tLine,
          TagLine: tLine,
          arnNumber: t?.ArnNumber || '',
          supportEmail: t?.SupportEmail || '',
          contactPhone: t?.ContactPhone || ''
        };
      }

      case 'getTenants': {
        assertSuperAdminDemo(payload);
        const tenants = JSON.parse(localStorage.getItem(STORAGE_KEYS.TENANTS) || '[]');
        const licenses = JSON.parse(localStorage.getItem(STORAGE_KEYS.TENANT_LICENSES) || '[]');
        const showDeleted = Boolean(payload.showDeleted);

        let list = showDeleted ? tenants : tenants.filter(t => !t.IsDeleted);
        return list.map(t => {
          const tLicenses = licenses.filter(l => l.TenantId === t.TenantId && !l.IsDeleted);
          const activeLicense = tLicenses.find(l => l.IsActive || l.Status === 'Active') 
            || tLicenses[tLicenses.length - 1] 
            || null;
          return {
            ...t,
            activeLicense: activeLicense ? {
              id: activeLicense.Id,
              licenseType: activeLicense.LicenseType || 'Professional',
              startDate: activeLicense.StartDate,
              endDate: activeLicense.EndDate,
              isActive: Boolean(activeLicense.IsActive),
              status: activeLicense.Status || 'Active',
              amount: activeLicense.Amount || 0
            } : null
          };
        });
      }

      case 'saveTenant': {
        assertSuperAdminDemo(payload);
        const tenants = JSON.parse(localStorage.getItem(STORAGE_KEYS.TENANTS) || '[]');
        const now = new Date().toISOString();
        const existingIds = new Set(tenants.map(t => String(t.TenantId || '').toUpperCase()));
        
        let tenantId = (payload.TenantId || '').trim();
        const isNew = !tenantId || (!payload.isEdit && !existingIds.has(tenantId.toUpperCase()));
        if (isNew) {
          let maxNum = 0;
          tenants.forEach(t => {
            const m = String(t.TenantId || '').match(/^TEN(\d+)$/i);
            if (m) {
              const num = parseInt(m[1], 10);
              if (num > maxNum) maxNum = num;
            }
          });
          let nextNum = maxNum + 1;
          let candidate = 'TEN' + String(nextNum).padStart(3, '0');
          while (existingIds.has(candidate)) {
            nextNum++;
            candidate = 'TEN' + String(nextNum).padStart(3, '0');
          }
          tenantId = candidate;
        }

        const record = {
          TenantId: tenantId,
          TenantName: (payload.TenantName || payload.CompanyName || 'SR INVESTMENTS').trim(),
          CompanyName: (payload.CompanyName || 'New Client Company').trim(),
          TagLine: (payload.TagLine || payload.CompanyTagLine || 'Mutual Fund CRM').trim(),
          ArnNumber: payload.ArnNumber || '',
          SpreadsheetId: payload.SpreadsheetId || '',
          DriveRootFolderId: payload.DriveRootFolderId || '',
          SupportEmail: payload.SupportEmail || '',
          ContactPhone: payload.ContactPhone || '',
          OfficeAddress: payload.OfficeAddress || '',
          Status: payload.Status || 'Active',
          IsDeleted: false,
          Updated_By: payload.userEmail || 'superadmin@srinvestments.com',
          Updated_At: now
        };

        if (isNew) {
          record.Created_By = payload.userEmail || 'superadmin@srinvestments.com';
          record.Created_At = now;
          record.Deleted_By = '';
          record.Deleted_At = '';
          tenants.push(record);
        } else {
          const idx = tenants.findIndex(t => t.TenantId === tenantId);
          if (idx >= 0) {
            tenants[idx] = { ...tenants[idx], ...record };
          } else {
            tenants.push(record);
          }
        }

        localStorage.setItem(STORAGE_KEYS.TENANTS, JSON.stringify(tenants));

        if (payload.initialLicense) {
          const licenses = JSON.parse(localStorage.getItem(STORAGE_KEYS.TENANT_LICENSES) || '[]');
          licenses.push({
            Id: 'LIC_' + Date.now(),
            TenantId: tenantId,
            LicenseType: payload.initialLicense.licenseType || 'Professional',
            StartDate: payload.initialLicense.startDate || now.slice(0, 10),
            EndDate: payload.initialLicense.endDate || '',
            Amount: Number(payload.initialLicense.amount !== undefined ? payload.initialLicense.amount : 0) || 0,
            PaymentMode: payload.initialLicense.paymentMode || 'Cash',
            TxnDate: payload.initialLicense.txnDate || now.slice(0, 10),
            PaymentAccount: payload.initialLicense.paymentAccount || 'Cash',
            ReferenceNo: payload.initialLicense.referenceNo || '',
            IsActive: true,
            Status: 'Active',
            Notes: payload.initialLicense.notes || 'Initial subscription license setup on onboarding',
            IsDeleted: false,
            Created_By: payload.userEmail || 'superadmin@srinvestments.com',
            Created_At: now,
            Updated_By: payload.userEmail || 'superadmin@srinvestments.com',
            Updated_At: now,
            Deleted_By: '',
            Deleted_At: ''
          });
          localStorage.setItem(STORAGE_KEYS.TENANT_LICENSES, JSON.stringify(licenses));
        }

        broadcastCrmEvent({ type: 'DATA_CHANGED', module: 'Tenants' });
        return { success: true, tenantId, message: 'Client organization saved successfully.' };
      }

      case 'deleteTenant': {
        assertSuperAdminDemo(payload);
        const tenantId = payload.tenantId || payload.TenantId;
        const tenants = JSON.parse(localStorage.getItem(STORAGE_KEYS.TENANTS) || '[]');
        const idx = tenants.findIndex(t => t.TenantId === tenantId);
        if (idx >= 0) {
          tenants[idx].IsDeleted = true;
          tenants[idx].Deleted_By = payload.userEmail || 'superadmin@srinvestments.com';
          tenants[idx].Deleted_At = new Date().toISOString();
          tenants[idx].Status = 'Suspended';
          localStorage.setItem(STORAGE_KEYS.TENANTS, JSON.stringify(tenants));
        }
        broadcastCrmEvent({ type: 'DATA_CHANGED', module: 'Tenants' });
        return { success: true, message: 'Client organization deleted.' };
      }

      case 'getPaymentAccounts': {
        const defaultAccounts = [
          { AccountId: 'ACC001', AccountName: 'Cash in Hand', AccountType: 'Cash', AccountNumber: '-', Status: 'Active' },
          { AccountId: 'ACC002', AccountName: 'Bank1 (Primary Current)', AccountType: 'Bank', AccountNumber: '50200012345678', Status: 'Active' },
          { AccountId: 'ACC003', AccountName: 'Bank2 (Operating)', AccountType: 'Bank', AccountNumber: '001105009876', Status: 'Active' }
        ];
        const raw = localStorage.getItem(STORAGE_KEYS.PAYMENT_ACCOUNTS);
        if (!raw) {
          localStorage.setItem(STORAGE_KEYS.PAYMENT_ACCOUNTS, JSON.stringify(defaultAccounts));
          return defaultAccounts;
        }
        return JSON.parse(raw);
      }

      case 'getTenantLicenses': {
        assertSuperAdminDemo(payload);
        const tenantId = payload.tenantId || payload.TenantId;
        let licenses = JSON.parse(localStorage.getItem(STORAGE_KEYS.TENANT_LICENSES) || '[]');
        if (tenantId) {
          licenses = licenses.filter(l => l.TenantId === tenantId);
        }
        if (!payload.showDeleted) {
          licenses = licenses.filter(l => !l.IsDeleted);
        }
        return licenses.reverse();
      }

      case 'saveTenantLicense': {
        assertSuperAdminDemo(payload);
        const tenantId = payload.tenantId || payload.TenantId;
        if (!tenantId) throw new Error('Tenant ID required for licensing.');

        const licenses = JSON.parse(localStorage.getItem(STORAGE_KEYS.TENANT_LICENSES) || '[]');
        const now = new Date().toISOString();
        const id = payload.id || payload.Id || ('LIC_' + Date.now());
        const isNew = !payload.id && !payload.Id;
        const rawStatus = payload.Status || 'Active';
        const startDate = payload.StartDate || payload.startDate || now.slice(0, 10);
        const isFuture = startDate > now.slice(0, 10);
        const status = isFuture && rawStatus === 'Active' ? 'NEW' : rawStatus;

        if (status === 'Active') {
          licenses.forEach(l => {
            if (l.TenantId === tenantId && l.Id !== id && l.IsActive) {
              l.IsActive = false;
              l.Status = 'Expired';
              l.Updated_At = now;
            }
          });
        }

        const record = {
          Id: id,
          TenantId: tenantId,
          LicenseType: payload.LicenseType || payload.licenseType || 'Professional',
          StartDate: startDate,
          EndDate: payload.EndDate || payload.endDate || '',
          Amount: Number(payload.Amount !== undefined ? payload.Amount : (payload.amount !== undefined ? payload.amount : 0)) || 0,
          PaymentMode: payload.PaymentMode || payload.paymentMode || 'Cash',
          TxnDate: payload.TxnDate || payload.txnDate || now.slice(0, 10),
          PaymentAccount: payload.PaymentAccount || payload.paymentAccount || payload.account || 'Cash',
          ReferenceNo: payload.ReferenceNo || payload.referenceNo || '',
          IsActive: status === 'Active',
          Status: status,
          Notes: payload.Notes || payload.notes || '',
          IsDeleted: false,
          Updated_By: payload.userEmail || 'superadmin@srinvestments.com',
          Updated_At: now
        };

        if (isNew) {
          record.Created_By = payload.userEmail || 'superadmin@srinvestments.com';
          record.Created_At = now;
          record.Deleted_By = '';
          record.Deleted_At = '';
          licenses.push(record);
        } else {
          const idx = licenses.findIndex(l => l.Id === id);
          if (idx >= 0) {
            licenses[idx] = { ...licenses[idx], ...record };
          } else {
            licenses.push(record);
          }
        }

        localStorage.setItem(STORAGE_KEYS.TENANT_LICENSES, JSON.stringify(licenses));
        broadcastCrmEvent({ type: 'DATA_CHANGED', module: 'Licenses' });
        return { success: true, licenseId: id, message: 'Subscription license updated successfully.' };
      }

      case 'activateTenantLicense': {
        assertSuperAdminDemo(payload);
        const tenantId = payload.tenantId || payload.TenantId;
        const licenseId = payload.licenseId || payload.id || payload.Id;
        const licenses = JSON.parse(localStorage.getItem(STORAGE_KEYS.TENANT_LICENSES) || '[]');
        const now = new Date().toISOString();
        licenses.forEach(l => {
          if (String(l.TenantId).toUpperCase() === String(tenantId).toUpperCase()) {
            if (l.Id === licenseId) {
              l.IsActive = true;
              l.Status = 'Active';
              l.Updated_At = now;
            } else if (Boolean(l.IsActive) || String(l.Status).toLowerCase() === 'active') {
              l.IsActive = false;
              l.Status = 'Expired';
              l.Updated_At = now;
            }
          }
        });
        localStorage.setItem(STORAGE_KEYS.TENANT_LICENSES, JSON.stringify(licenses));
        broadcastCrmEvent({ type: 'DATA_CHANGED', module: 'Licenses' });
        return { success: true, message: 'License activated successfully.' };
      }

      case 'cancelTenantLicense': {
        assertSuperAdminDemo(payload);
        const tenantId = payload.tenantId || payload.TenantId;
        const licenseId = String(payload.licenseId || payload.id || payload.Id || '').trim();
        const licenses = JSON.parse(localStorage.getItem(STORAGE_KEYS.TENANT_LICENSES) || '[]');
        const now = new Date().toISOString();
        licenses.forEach(l => {
          const matchId = String(l.Id || '').trim() === licenseId;
          const matchTenant = !tenantId || String(l.TenantId || '').trim().toUpperCase() === String(tenantId).trim().toUpperCase();
          if (matchId && matchTenant) {
            l.IsActive = false;
            l.Status = 'CANCELLED';
            l.Updated_At = now;
          }
        });
        localStorage.setItem(STORAGE_KEYS.TENANT_LICENSES, JSON.stringify(licenses));
        broadcastCrmEvent({ type: 'DATA_CHANGED', module: 'Licenses' });
        return { success: true, message: 'License cancelled successfully.' };
      }

      case 'checkTenantSync': {
        const tenantId = String(payload.tenantId || 'TEN001').toUpperCase();
        const lastVersion = Number(payload.lastVersion || 0);
        const raw = localStorage.getItem('sr_crm_tenant_sync_' + tenantId) || '[]';
        let history = [];
        try { history = JSON.parse(raw); } catch (e) {}
        if (!Array.isArray(history) || history.length === 0) {
          return { changed: false, tenantId, latestVersion: lastVersion || Date.now(), events: [] };
        }
        const latestVer = Math.max(...history.map(e => Number(e.version || 0)));
        if (lastVersion <= 0) {
          return { changed: false, tenantId, latestVersion: latestVer, events: [] };
        }
        const newEvents = history.filter(ev => Number(ev.version) > lastVersion);
        return {
          changed: newEvents.length > 0,
          tenantId,
          latestVersion: latestVer,
          events: newEvents
        };
      }

      // USER MASTER & TENANT USER MAPPING (Central SaaS)
      case 'getCentralUsers': {
        assertSuperAdminDemo(payload);
        const raw = localStorage.getItem('sr_crm_central_users');
        let users = raw ? JSON.parse(raw) : [
          {
            UserId: 'USER1',
            FullName: 'Gopal Kushwaha',
            Email: 'anonymousofjain@gmail.com',
            AlternateEmailsList: '',
            Mobile: '8306588313',
            AlternateMobile: '',
            IsSuperAdmin: true,
            Status: 'Active',
            IsDeleted: false,
            Created_At: '2026-01-01T00:00:00.000Z',
            Created_By: 'system'
          },
          {
            UserId: 'USER2',
            FullName: 'Gopal8306',
            Email: 'kgopal8306@gmail.com',
            AlternateEmailsList: '',
            Mobile: '8306588314',
            AlternateMobile: '',
            IsSuperAdmin: false,
            Status: 'Active',
            IsDeleted: false,
            Created_At: '2026-01-01T00:00:00.000Z',
            Created_By: 'system'
          }
        ];
        if (!raw) {
          localStorage.setItem('sr_crm_central_users', JSON.stringify(users));
        }
        if (!payload?.showDeleted) {
          users = users.filter(u => !u.IsDeleted);
        }
        return users;
      }

      case 'saveCentralUser': {
        assertSuperAdminDemo(payload);
        const raw = localStorage.getItem('sr_crm_central_users');
        let users = raw ? JSON.parse(raw) : [
          {
            UserId: 'USER1',
            FullName: 'Gopal Kushwaha',
            Email: 'anonymousofjain@gmail.com',
            AlternateEmailsList: '',
            Mobile: '8306588313',
            AlternateMobile: '',
            IsSuperAdmin: true,
            Status: 'Active',
            IsDeleted: false,
            Created_At: '2026-01-01T00:00:00.000Z',
            Created_By: 'system'
          },
          {
            UserId: 'USER2',
            FullName: 'Gopal8306',
            Email: 'kgopal8306@gmail.com',
            AlternateEmailsList: '',
            Mobile: '8306588314',
            AlternateMobile: '',
            IsSuperAdmin: false,
            Status: 'Active',
            IsDeleted: false,
            Created_At: '2026-01-01T00:00:00.000Z',
            Created_By: 'system'
          }
        ];

        const email = String(payload.Email || payload.email || '').trim().toLowerCase();
        if (!email) throw new Error('Email is required.');
        const fullName = String(payload.FullName || payload.fullName || '').trim();
        if (!fullName) throw new Error('Full Name is required.');

        let userId = String(payload.UserId || payload.userId || '').trim();
        const now = new Date().toISOString();
        const isSuperAdmin = payload.IsSuperAdmin === true || String(payload.IsSuperAdmin).toLowerCase() === 'true';

        let existingIdx = -1;
        if (userId) {
          existingIdx = users.findIndex(u => String(u.UserId || '').toLowerCase() === userId.toLowerCase());
        }
        if (existingIdx === -1) {
          existingIdx = users.findIndex(u => String(u.Email || '').toLowerCase() === email);
        }

        if (existingIdx >= 0) {
          // Update
          const target = users[existingIdx];
          userId = target.UserId;
          target.FullName = fullName;
          target.Email = email;
          target.AlternateEmailsList = String(payload.AlternateEmailsList || payload.alternateEmails || '').trim();
          target.Mobile = String(payload.Mobile || payload.mobile || '').trim();
          target.AlternateMobile = String(payload.AlternateMobile || payload.alternateMobile || '').trim();
          target.IsSuperAdmin = isSuperAdmin;
          target.Status = String(payload.Status || payload.status || 'Active').trim();
          target.Updated_At = now;
          target.Updated_By = 'admin@srinvestments.com';
        } else {
          // Insert
          const maxNum = users.reduce((acc, u) => {
            const m = String(u.UserId || '').match(/USER(\d+)/i);
            return m ? Math.max(acc, parseInt(m[1], 10)) : acc;
          }, 0);
          userId = userId || `USER${maxNum + 1}`;

          const newUser = {
            UserId: userId,
            FullName: fullName,
            Email: email,
            AlternateEmailsList: String(payload.AlternateEmailsList || payload.alternateEmails || '').trim(),
            Mobile: String(payload.Mobile || payload.mobile || '').trim(),
            AlternateMobile: String(payload.AlternateMobile || payload.alternateMobile || '').trim(),
            IsSuperAdmin: isSuperAdmin,
            Status: String(payload.Status || payload.status || 'Active').trim(),
            IsDeleted: false,
            Created_At: now,
            Created_By: 'admin@srinvestments.com'
          };
          users.push(newUser);
        }

        localStorage.setItem('sr_crm_central_users', JSON.stringify(users));
        dispatchCrmEvent('UserMaster', 'USER_MASTER_UPDATED', { userId });
        return { status: 'Success', success: true, message: 'User saved successfully.', userId };
      }

      case 'deleteCentralUser': {
        assertSuperAdminDemo(payload);
        const userId = String(payload.UserId || payload.userId || '').trim();
        if (!userId) throw new Error('UserId is required.');
        const raw = localStorage.getItem('sr_crm_central_users') || '[]';
        let users = JSON.parse(raw);
        const idx = users.findIndex(u => String(u.UserId || '').toLowerCase() === userId.toLowerCase());
        if (idx === -1) throw new Error(`User '${userId}' not found.`);

        users[idx].IsDeleted = true;
        users[idx].Deleted_At = new Date().toISOString();
        users[idx].Deleted_By = 'admin@srinvestments.com';
        localStorage.setItem('sr_crm_central_users', JSON.stringify(users));

        // Also deactivate mappings
        try {
          const mapRaw = localStorage.getItem('sr_crm_tenant_user_mappings') || '[]';
          let mappings = JSON.parse(mapRaw);
          mappings.forEach(m => {
            if (String(m.UserId || '').toLowerCase() === userId.toLowerCase()) {
              m.IsDeleted = true;
              m.Deleted_At = new Date().toISOString();
            }
          });
          localStorage.setItem('sr_crm_tenant_user_mappings', JSON.stringify(mappings));
        } catch (_) {}

        dispatchCrmEvent('UserMaster', 'USER_MASTER_DELETED', { userId });
        return { status: 'Success', success: true, message: 'User deleted successfully.' };
      }

      case 'restoreCentralUser': {
        assertSuperAdminDemo(payload);
        const userId = String(payload.UserId || payload.userId || '').trim();
        if (!userId) throw new Error('UserId is required.');
        const raw = localStorage.getItem('sr_crm_central_users') || '[]';
        let users = JSON.parse(raw);
        const idx = users.findIndex(u => String(u.UserId || '').toLowerCase() === userId.toLowerCase());
        if (idx === -1) throw new Error(`User '${userId}' not found.`);

        users[idx].IsDeleted = false;
        users[idx].Updated_At = new Date().toISOString();
        delete users[idx].Deleted_At;
        delete users[idx].Deleted_By;
        localStorage.setItem('sr_crm_central_users', JSON.stringify(users));

        dispatchCrmEvent('UserMaster', 'USER_MASTER_RESTORED', { userId });
        return { status: 'Success', success: true, message: 'User restored successfully.' };
      }

      case 'getTenantUserMappings': {
        assertSuperAdminDemo(payload);
        const raw = localStorage.getItem('sr_crm_tenant_user_mappings') || '[]';
        let mappings = JSON.parse(raw);
        if (payload.tenantId) {
          mappings = mappings.filter(m => m.TenantId === payload.tenantId);
        }
        if (!payload.showDeleted) {
          mappings = mappings.filter(m => !m.IsDeleted);
        }
        return mappings;
      }

      case 'saveTenantUserMappings': {
        assertSuperAdminDemo(payload);
        const tenantId = payload.tenantId;
        const incoming = payload.mappings || [];
        const raw = localStorage.getItem('sr_crm_tenant_user_mappings') || '[]';
        let mappings = JSON.parse(raw);
        const now = new Date().toISOString();

        incoming.forEach(item => {
          const idx = mappings.findIndex(m => m.TenantId === tenantId && m.UserId === item.userId);
          if (idx >= 0) {
            mappings[idx].Role = item.role || 'Staff';
            mappings[idx].Status = item.status || 'Active';
            mappings[idx].IsDeleted = false;
            mappings[idx].Updated_At = now;
          } else {
            mappings.push({
              MappingId: 'MAP_' + Date.now() + '_' + Math.floor(Math.random() * 1000),
              TenantId: tenantId,
              UserId: item.userId,
              Role: item.role || 'Staff',
              Status: item.status || 'Active',
              IsDeleted: false,
              Created_At: now,
              Updated_At: now
            });
          }
        });

        if (payload.replaceMode !== false) {
          const selected = new Set(incoming.map(i => i.userId));
          mappings.forEach(m => {
            if (m.TenantId === tenantId && !selected.has(m.UserId)) {
              m.IsDeleted = true;
              m.Status = 'Inactive';
            }
          });
        }

        localStorage.setItem('sr_crm_tenant_user_mappings', JSON.stringify(mappings));
        broadcastCrmEvent({ type: 'DATA_CHANGED', module: 'TenantUserMapping' });
        return { success: true, count: incoming.length, message: 'Mappings saved successfully' };
      }

      case 'deleteTenantUserMapping': {
        assertSuperAdminDemo(payload);
        const raw = localStorage.getItem('sr_crm_tenant_user_mappings') || '[]';
        let mappings = JSON.parse(raw);
        const idx = mappings.findIndex(m => m.MappingId === payload.mappingId);
        if (idx >= 0) {
          mappings[idx].IsDeleted = true;
          mappings[idx].Status = 'Inactive';
          localStorage.setItem('sr_crm_tenant_user_mappings', JSON.stringify(mappings));
        }
        broadcastCrmEvent({ type: 'DATA_CHANGED', module: 'TenantUserMapping' });
        return { success: true, message: 'Mapping removed' };
      }

      // SUBSCRIPTION PLANS MASTER (SaaS Tiers & Quotas)
      case 'getSubscriptionPlans': {
        assertSuperAdminDemo(payload);
        const plans = JSON.parse(localStorage.getItem(STORAGE_KEYS.SUBSCRIPTION_PLANS) || '[]');
        if (!payload.showDeleted) {
          return plans.filter(p => !p.IsDeleted);
        }
        return plans;
      }

      case 'saveSubscriptionPlan': {
        assertSuperAdminDemo(payload);
        const plans = JSON.parse(localStorage.getItem(STORAGE_KEYS.SUBSCRIPTION_PLANS) || '[]');
        const now = new Date().toISOString();
        const isNew = !payload.PlanId;
        const planId = payload.PlanId || ('PLAN' + String(plans.length + 1).padStart(3, '0'));

        const record = {
          PlanId: planId,
          PlanName: payload.PlanName || 'New Subscription Plan',
          PlanCode: (payload.PlanCode || payload.PlanName || 'CUSTOM').toUpperCase(),
          Price: Number(payload.Price !== undefined ? payload.Price : 0),
          DurationMonths: Number(payload.DurationMonths || 12),
          StaffLimit: Number(payload.StaffLimit !== undefined ? payload.StaffLimit : 5),
          CustomerLimit: Number(payload.CustomerLimit !== undefined ? payload.CustomerLimit : 1000),
          Features: payload.Features || '',
          IsPopular: Boolean(payload.IsPopular),
          Badge: payload.Badge || (payload.IsPopular ? 'POPULAR' : ''),
          Description: payload.Description || '',
          Color: payload.Color || (payload.IsPopular ? '#2563eb' : (payload.Price > 60000 ? '#7c3aed' : '#0284c7')),
          Status: payload.Status || 'Active',
          IsDeleted: false,
          Updated_By: payload.userEmail || 'superadmin@srinvestments.com',
          Updated_At: now
        };

        if (isNew) {
          record.Created_By = payload.userEmail || 'superadmin@srinvestments.com';
          record.Created_At = now;
          record.Deleted_By = '';
          record.Deleted_At = '';
          plans.push(record);
        } else {
          const idx = plans.findIndex(p => p.PlanId === planId);
          if (idx >= 0) {
            plans[idx] = { ...plans[idx], ...record };
          } else {
            plans.push(record);
          }
        }

        localStorage.setItem(STORAGE_KEYS.SUBSCRIPTION_PLANS, JSON.stringify(plans));
        broadcastCrmEvent({ type: 'DATA_CHANGED', module: 'SubscriptionPlans' });
        return { success: true, plan: record, message: 'Subscription plan saved successfully.' };
      }

      case 'deleteSubscriptionPlan': {
        assertSuperAdminDemo(payload);
        const planId = payload.PlanId || payload.id;
        const plans = JSON.parse(localStorage.getItem(STORAGE_KEYS.SUBSCRIPTION_PLANS) || '[]');
        const idx = plans.findIndex(p => p.PlanId === planId);
        if (idx >= 0) {
          plans[idx].IsDeleted = true;
          plans[idx].Deleted_By = payload.userEmail || 'superadmin@srinvestments.com';
          plans[idx].Deleted_At = new Date().toISOString();
          plans[idx].Status = 'Inactive';
          localStorage.setItem(STORAGE_KEYS.SUBSCRIPTION_PLANS, JSON.stringify(plans));
        }
        broadcastCrmEvent({ type: 'DATA_CHANGED', module: 'SubscriptionPlans' });
        return { success: true, message: 'Subscription plan deleted successfully.' };
      }

      case 'getUserDocuments': {
        const userId = payload.userId || payload.UserId;
        const tenantId = payload.tenantId || payload.TenantId;
        let docs = JSON.parse(localStorage.getItem(STORAGE_KEYS.USER_DOCUMENTS) || '[]');

        if (userId) docs = docs.filter(d => d.UserId === userId);
        if (tenantId) docs = docs.filter(d => d.TenantId === tenantId);
        if (!payload.showDeleted) docs = docs.filter(d => !d.IsDeleted);

        return docs.reverse();
      }

      case 'uploadUserDocument': {
        const file = payload.file;
        if (!file) throw new Error('File required.');

        const docs = JSON.parse(localStorage.getItem(STORAGE_KEYS.USER_DOCUMENTS) || '[]');
        const docId = 'DOC_' + Date.now();
        const now = new Date().toISOString();

        const newDoc = {
          Id: docId,
          UserId: payload.userId || '',
          TenantId: payload.tenantId || '',
          DocName: payload.docName || file.name || 'User Document',
          DocType: payload.docType || 'General Document',
          DocPath: file.base64 || 'https://drive.google.com/sample',
          DriveFileId: 'DRIVE_' + Date.now(),
          ViewUrl: file.base64 || 'https://drive.google.com/sample',
          IsDeleted: false,
          Created_By: payload.userEmail || 'user@srinvestments.com',
          Created_At: now,
          Updated_By: payload.userEmail || 'user@srinvestments.com',
          Updated_At: now,
          Deleted_By: '',
          Deleted_At: ''
        };

        docs.push(newDoc);
        localStorage.setItem(STORAGE_KEYS.USER_DOCUMENTS, JSON.stringify(docs));
        return { success: true, documentId: docId };
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

      case 'getCustomerById': {
        const id = payload.id || payload.customerId || payload.CustomerId;
        const list = JSON.parse(localStorage.getItem(STORAGE_KEYS.CUSTOMERS) || '[]');
        const cust = list.find(c => String(c.CustomerId || '').toLowerCase() === String(id || '').toLowerCase() || String(c.CustomerCode || '').toLowerCase() === String(id || '').toLowerCase());
        if (!cust) return null;
        
        const allBanks = JSON.parse(localStorage.getItem(STORAGE_KEYS.CUSTOMER_BANK) || '[]');
        const allNoms = JSON.parse(localStorage.getItem(STORAGE_KEYS.CUSTOMER_NOMINEE) || '[]');
        const banks = allBanks.filter(b => String(b.CustomerId || '').toLowerCase() === String(cust.CustomerId || '').toLowerCase() && !b.IsDeleted);
        const nominees = allNoms.filter(n => String(n.CustomerId || '').toLowerCase() === String(cust.CustomerId || '').toLowerCase() && !n.IsDeleted);

        return { ...cust, banks, nominees };
      }

      case 'getCustomerDrafts': {
        const allDrafts = JSON.parse(localStorage.getItem(STORAGE_KEYS.CUSTOMER_DRAFT) || '[]');
        const active = allDrafts.filter(d => !d.IsDeleted);
        return active.map((d, idx) => ({
          Id: d.DraftId || (idx + 1),
          DraftKey: d.DraftKey,
          CustomerName: d.CustomerName || (d.DraftData && (d.DraftData.FullName || [d.DraftData.FirstName, d.DraftData.LastName].filter(Boolean).join(' '))) || 'Draft',
          StepNo: Number(d.CurrentStep || 1),
          TotalSteps: Number(d.TotalSteps || 7),
          LastModifiedBy: d.Updated_By || d.Created_By || 'System',
          LastModifiedOn: d.Updated_At || d.Created_At || '',
          DraftData: d.DraftData || {}
        }));
      }

      case 'saveCustomerDraft': {
        const allDrafts = JSON.parse(localStorage.getItem(STORAGE_KEYS.CUSTOMER_DRAFT) || '[]');
        const now = new Date().toISOString();
        const userEmail = payload.userEmail || payload.ActionBy || 'admin@srinvestments.com';
        let draftKey = payload.DraftKey || payload.draftKey;
        const step = Number(payload.CurrentStep || payload.StepNo || 1);
        const total = Number(payload.TotalSteps || 7);

        let custName = payload.CustomerName || '';
        if (!custName && payload.DraftData) {
          custName = payload.DraftData.FullName || [payload.DraftData.FirstName, payload.DraftData.LastName].filter(Boolean).join(' ');
        }
        if (!custName && (payload.FirstName || payload.LastName)) {
          custName = [payload.FirstName, payload.LastName].filter(Boolean).join(' ');
        }
        if (!custName) custName = 'Draft (' + (payload.PAN || payload.Mobile || 'New') + ')';

        let existingIdx = -1;
        if (draftKey) {
          existingIdx = allDrafts.findIndex(d => d.DraftKey === draftKey);
        }

        let draftId = '';
        if (existingIdx >= 0) {
          const ex = allDrafts[existingIdx];
          draftId = ex.DraftId || ('DRF_' + Date.now());
          allDrafts[existingIdx] = {
            ...ex,
            CustomerName: custName,
            CurrentStep: step,
            TotalSteps: total,
            DraftData: payload.DraftData || payload,
            Updated_By: userEmail,
            Updated_At: now
          };
        } else {
          draftId = 'DRF_' + Date.now();
          if (!draftKey) draftKey = 'DKEY_' + Math.random().toString(36).substring(2, 9).toUpperCase();
          allDrafts.push({
            DraftId: draftId,
            DraftKey: draftKey,
            CustomerName: custName,
            CurrentStep: step,
            TotalSteps: total,
            DraftData: payload.DraftData || payload,
            Status: 'DRAFT',
            IsDeleted: false,
            Created_By: userEmail,
            Created_At: now,
            Updated_By: userEmail,
            Updated_At: now
          });
        }
        localStorage.setItem(STORAGE_KEYS.CUSTOMER_DRAFT, JSON.stringify(allDrafts));
        return { status: 'Success', success: true, data: { DraftId: draftId, DraftKey: draftKey } };
      }

      case 'deleteCustomerDraft': {
        const key = payload.draftKey || payload.DraftKey || payload.id || payload.draftId;
        const allDrafts = JSON.parse(localStorage.getItem(STORAGE_KEYS.CUSTOMER_DRAFT) || '[]');
        const idx = allDrafts.findIndex(d => d.DraftKey === key || d.DraftId === key);
        if (idx >= 0) {
          allDrafts[idx].IsDeleted = true;
          allDrafts[idx].Deleted_By = payload.userEmail || 'admin@srinvestments.com';
          allDrafts[idx].Deleted_At = new Date().toISOString();
          localStorage.setItem(STORAGE_KEYS.CUSTOMER_DRAFT, JSON.stringify(allDrafts));
        }
        return { status: 'Success', success: true, message: 'Draft deleted.' };
      }

      case 'saveCustomer': {
        const list = JSON.parse(localStorage.getItem(STORAGE_KEYS.CUSTOMERS) || '[]');
        const id = payload.CustomerId || ('CUST_' + Date.now());
        const code = payload.CustomerCode || payload.SR_UniqueId || ('SR' + Math.floor(10000 + Math.random() * 90000));
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

        // Determine FullName
        let fullName = payload.FullName || '';
        if (!fullName && (payload.FirstName || payload.LastName)) {
          fullName = [payload.FirstName, payload.MiddleName, payload.LastName].filter(Boolean).join(' ');
        }

        const record = {
          ...payload,
          CustomerId: id,
          CustomerCode: code,
          FullName: fullName,
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

        // Save Banks
        let banksList = payload.banks || payload.Banks;
        if (typeof banksList === 'string') { try { banksList = JSON.parse(banksList); } catch (e) { banksList = []; } }
        if (Array.isArray(banksList) && banksList.length > 0) {
          const allBanks = JSON.parse(localStorage.getItem(STORAGE_KEYS.CUSTOMER_BANK) || '[]');
          allBanks.forEach(b => {
            if (b.CustomerId === id) b.IsDeleted = true;
          });
          banksList.slice(0, 3).forEach((b, bIdx) => {
            allBanks.push({
              BankId: b.BankId || ('BNK_' + Date.now() + '_' + (bIdx + 1)),
              CustomerId: id,
              CustomerCode: code,
              BankIndex: bIdx + 1,
              IfscCode: (b.IfscCode || b.IFSCCode || '').toUpperCase(),
              BankName: b.BankName || b.bank_name,
              AccountNumber: b.AccountNumber || b.AccountNo,
              AccountType: b.AccountType || b.AccountTypeId || 'Saving',
              MicrCode: b.MicrCode || b.MICRCode || '',
              IsPrimary: bIdx === 0,
              IsDeleted: false,
              Created_By: userEmail,
              Created_At: now,
              Updated_By: userEmail,
              Updated_At: now
            });
          });
          localStorage.setItem(STORAGE_KEYS.CUSTOMER_BANK, JSON.stringify(allBanks));
        }

        // Save Nominees
        let nomineeList = payload.nominees || payload.Nominees;
        if (typeof nomineeList === 'string') { try { nomineeList = JSON.parse(nomineeList); } catch (e) { nomineeList = []; } }
        if (Array.isArray(nomineeList) && nomineeList.length > 0) {
          const allNoms = JSON.parse(localStorage.getItem(STORAGE_KEYS.CUSTOMER_NOMINEE) || '[]');
          allNoms.forEach(n => {
            if (n.CustomerId === id) n.IsDeleted = true;
          });
          nomineeList.slice(0, 3).forEach((n, nIdx) => {
            allNoms.push({
              NomineeId: n.NomineeId || ('NOM_' + Date.now() + '_' + (nIdx + 1)),
              CustomerId: id,
              CustomerCode: code,
              NomineeIndex: nIdx + 1,
              NomineeName: n.NomineeName || n.GuardianName || n.Name,
              Relation: n.Relation || n.RelationId,
              RelationOther: n.RelationOther || '',
              DateOfBirth: n.DateOfBirth || n.DOB || '',
              Occupation: n.Occupation || n.OccupationId,
              IdProofType: n.IdProofType || n.ProofTypeId,
              DocumentNo: n.DocumentNo || n.ProofNumber || '',
              Mobile: n.Mobile || n.MobileNo || '',
              Email: n.Email || n.EmailId || '',
              Address: n.Address || '',
              SharePercentage: n.SharePercentage || n.Share || (nIdx === 0 ? '100' : '0'),
              IsDeleted: false,
              Created_By: userEmail,
              Created_At: now,
              Updated_By: userEmail,
              Updated_At: now
            });
          });
          localStorage.setItem(STORAGE_KEYS.CUSTOMER_NOMINEE, JSON.stringify(allNoms));
        }

        // Soft delete draft if submitted from draft
        const draftKey = payload.draftKey || payload.DraftKey || payload.draftId;
        if (draftKey) {
          const allDrafts = JSON.parse(localStorage.getItem(STORAGE_KEYS.CUSTOMER_DRAFT) || '[]');
          const dIdx = allDrafts.findIndex(d => d.DraftKey === draftKey || d.DraftId === draftKey);
          if (dIdx >= 0) {
            allDrafts[dIdx].IsDeleted = true;
            allDrafts[dIdx].Deleted_By = userEmail;
            allDrafts[dIdx].Deleted_At = now;
            localStorage.setItem(STORAGE_KEYS.CUSTOMER_DRAFT, JSON.stringify(allDrafts));
          }
        }

        broadcastCrmEvent({ type: 'DATA_CHANGED', module: 'Customers', recordId: code });
        return { status: 'Success', success: true, customerId: id, customerCode: code, message: 'Investor saved successfully.' };
      }

      // Delete Customer Always
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

          // Soft delete banks and nominees
          const allBanks = JSON.parse(localStorage.getItem(STORAGE_KEYS.CUSTOMER_BANK) || '[]');
          allBanks.forEach(b => { if (b.CustomerId === customerId) b.IsDeleted = true; });
          localStorage.setItem(STORAGE_KEYS.CUSTOMER_BANK, JSON.stringify(allBanks));

          const allNoms = JSON.parse(localStorage.getItem(STORAGE_KEYS.CUSTOMER_NOMINEE) || '[]');
          allNoms.forEach(n => { if (n.CustomerId === customerId) n.IsDeleted = true; });
          localStorage.setItem(STORAGE_KEYS.CUSTOMER_NOMINEE, JSON.stringify(allNoms));

          logAuditLocal(userEmail, 'DELETE', 'Customers', rec.CustomerCode, `Deleted investor: ${rec.FullName} (${rec.CustomerCode})`);
          dispatchNotification({
            action: 'DELETE',
            module: 'Customers',
            recordId: rec.CustomerCode,
            title: `Customer Deleted: ${rec.FullName}`,
            message: `${rec.FullName} (${rec.CustomerCode}) was deleted by ${userEmail}.`,
            targetRoute: 'customers'
          });
          broadcastCrmEvent({ type: 'DATA_CHANGED', module: 'Customers', recordId: rec.CustomerCode });
        }
        return { success: true, message: 'Customer deleted successfully (retained in compliance audit archive).' };
      }

      // Restore Deleted Customer
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
        // Sanitize status values
        list = list.map(e => {
          if (!e.Status || (e.Status !== 'Active' && e.Status !== 'Inactive')) {
            e.Status = 'Active';
          }
          return e;
        });
        if (payload.search) {
          const q = payload.search.toLowerCase();
          list = list.filter(e =>
            (e.FullName && e.FullName.toLowerCase().includes(q)) ||
            (e.EmployeeCode && e.EmployeeCode.toLowerCase().includes(q)) ||
            (e.Email && e.Email.toLowerCase().includes(q)) ||
            (e.AlternateEmails && e.AlternateEmails.toLowerCase().includes(q)) ||
            (e.GoogleEmails && e.GoogleEmails.toLowerCase().includes(q)) ||
            (e.Mobile && String(e.Mobile).toLowerCase().includes(q)) ||
            (e.AlternateMobile && String(e.AlternateMobile).toLowerCase().includes(q)) ||
            (e.Department && e.Department.toLowerCase().includes(q)) ||
            (e.Designation && e.Designation.toLowerCase().includes(q))
          );
        }
        return list;
      }

      case 'saveEmployee': {
        if (!payload.FullName || !payload.FullName.trim()) throw new Error('Staff Member Name is required.');
        if (!payload.Email || !payload.Email.trim()) throw new Error('Primary Email is compulsory (required for inner join & authentication).');
        if (!payload.Mobile || !payload.Mobile.trim()) throw new Error('Primary Mobile Number is compulsory.');

        const list = JSON.parse(localStorage.getItem(STORAGE_KEYS.EMPLOYEES) || '[]');
        const id = payload.EmployeeId || ('EMP_' + Date.now());
        const userEmail = payload.userEmail || 'admin@srinvestments.com';
        const now = new Date().toISOString();
        const index = list.findIndex(e => e.EmployeeId === id);
        const existing = index >= 0 ? list[index] : null;

        // 1. Gather all incoming emails (Primary + Google IDs / Alternate list)
        const incomingEmails = [];
        const primaryEmailClean = (payload.Email || '').trim().toLowerCase();
        if (primaryEmailClean) incomingEmails.push(primaryEmailClean);
        const altEmailsVal = payload.AlternateEmails || payload.GoogleEmails;
        if (altEmailsVal) {
          altEmailsVal.toLowerCase().split(',').forEach(s => {
            const em = s.trim();
            if (em && !incomingEmails.includes(em)) incomingEmails.push(em);
          });
        }

        // 2. Gather all incoming mobiles (Primary + Alternate Mobile numbers)
        const incomingMobiles = [];
        const primaryMobileClean = (payload.Mobile || '').trim().replace(/[\s\-\(\)\+]/g, '');
        if (primaryMobileClean) incomingMobiles.push(primaryMobileClean);
        if (payload.AlternateMobile) {
          payload.AlternateMobile.split(',').forEach(s => {
            const mob = s.trim().replace(/[\s\-\(\)\+]/g, '');
            if (mob && !incomingMobiles.includes(mob)) incomingMobiles.push(mob);
          });
        }

        // 3. Strict duplicate validation across existing staff in this tenant
        list.forEach((r, idx) => {
          if (r.EmployeeId === id || (index >= 0 && idx === index)) return;
          if (r.IsDeleted) return;

          // Check emails
          const existingRowEmails = [];
          if (r.Email) existingRowEmails.push(r.Email.trim().toLowerCase());
          const rowAltEmails = r.AlternateEmails || r.GoogleEmails;
          if (rowAltEmails) {
            rowAltEmails.toLowerCase().split(',').forEach(s => {
              const em = s.trim();
              if (em && !existingRowEmails.includes(em)) existingRowEmails.push(em);
            });
          }

          incomingEmails.forEach(incEmail => {
            if (existingRowEmails.includes(incEmail)) {
              throw new Error(`Email '${incEmail}' already exists for staff member: ${r.FullName || r.EmployeeCode || r.EmployeeId} (${r.EmployeeCode || ''}).`);
            }
          });

          // Check mobiles
          const existingRowMobiles = [];
          if (r.Mobile) existingRowMobiles.push(String(r.Mobile).trim().replace(/[\s\-\(\)\+]/g, ''));
          if (r.AlternateMobile) {
            String(r.AlternateMobile).split(',').forEach(s => {
              const mob = s.trim().replace(/[\s\-\(\)\+]/g, '');
              if (mob && !existingRowMobiles.includes(mob)) existingRowMobiles.push(mob);
            });
          }

          incomingMobiles.forEach(incMob => {
            if (existingRowMobiles.includes(incMob)) {
              throw new Error(`Mobile number '${incMob}' already exists for staff member: ${r.FullName || r.EmployeeCode || r.EmployeeId} (${r.EmployeeCode || ''}).`);
            }
          });
        });

        // Auto-increment EmployeeCode if new (scans all rows including archived)
        let code = payload.EmployeeCode;
        if (!code || index === -1) {
          code = getNextEmployeeCode(list);
        }

        let photoUrl = payload.PhotoUrl;
        if (payload.image && payload.image.base64) {
          photoUrl = payload.image.base64;
        }

        let status = payload.Status || 'Active';
        if (status !== 'Active' && status !== 'Inactive') {
          status = 'Active';
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
          BirthDate: payload.BirthDate || '',
          BloodGroup: payload.BloodGroup || '',
          AadharNo: payload.AadharNo || '',
          Status: status,
          AlternateEmails: payload.AlternateEmails || payload.GoogleEmails || '',
          GoogleEmails: payload.AlternateEmails || payload.GoogleEmails || '',
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

        // Auto Dual-Sync: Central User_Master & Tenant_User_Mapping
        try {
          const tenantId = payload.tenantId || crmApi.getActiveTenant()?.tenantId || 'TEN001';
          const userMaster = JSON.parse(localStorage.getItem(STORAGE_KEYS.USER_MASTER) || '[]');
          const mappings = JSON.parse(localStorage.getItem(STORAGE_KEYS.TENANT_USER_MAPPING) || '[]');
          const cleanEmail = (record.Email || '').toLowerCase();
          
          let uIdx = userMaster.findIndex(u => u.Email && u.Email.toLowerCase() === cleanEmail);
          let uId = '';
          if (uIdx >= 0) {
            uId = userMaster[uIdx].UserId;
            userMaster[uIdx] = {
              ...userMaster[uIdx],
              FullName: record.FullName,
              Mobile: record.Mobile,
              AlternateMobile: record.AlternateMobile || '',
              AlternateEmailsList: record.AlternateEmails || record.GoogleEmails || '',
              GoogleEmails: record.AlternateEmails || record.GoogleEmails || '',
              Password: hashedPassword,
              Status: record.Status || 'Active',
              Updated_By: userEmail,
              Updated_At: now
            };
          } else {
            uId = 'USR_' + String(userMaster.length + 1).padStart(3, '0');
            userMaster.push({
              UserId: uId,
              Email: cleanEmail,
              AlternateEmailsList: record.AlternateEmails || record.GoogleEmails || '',
              GoogleEmails: record.AlternateEmails || record.GoogleEmails || '',
              Password: hashedPassword,
              FullName: record.FullName,
              Mobile: record.Mobile,
              AlternateMobile: record.AlternateMobile || '',
              IsSuperAdmin: false,
              Status: record.Status || 'Active',
              IsDeleted: false,
              Created_By: userEmail,
              Created_At: now,
              Updated_By: userEmail,
              Updated_At: now,
              Deleted_By: '',
              Deleted_At: ''
            });
          }
          localStorage.setItem(STORAGE_KEYS.USER_MASTER, JSON.stringify(userMaster));

          // Mapping
          let mIdx = mappings.findIndex(m => m.TenantId === tenantId && (m.UserId === uId || m.UserId === cleanEmail));
          if (mIdx >= 0) {
            mappings[mIdx].Role = record.Role || 'Staff';
            mappings[mIdx].Status = record.Status || 'Active';
            mappings[mIdx].Updated_By = userEmail;
            mappings[mIdx].Updated_At = now;
          } else {
            mappings.push({
              MappingId: 'MAP_' + String(mappings.length + 1).padStart(3, '0'),
              UserId: uId,
              TenantId: tenantId,
              Role: record.Role || 'Staff',
              Status: record.Status || 'Active',
              IsDeleted: false,
              Created_By: userEmail,
              Created_At: now,
              Updated_By: userEmail,
              Updated_At: now,
              Deleted_By: '',
              Deleted_At: ''
            });
          }
          localStorage.setItem(STORAGE_KEYS.TENANT_USER_MAPPING, JSON.stringify(mappings));
        } catch (e) {
          console.warn('Local dual-sync warning:', e);
        }

        broadcastCrmEvent({ type: 'DATA_CHANGED', module: 'Staff', recordId: code });
        return { employeeId: id, employeeCode: code, message: `Staff ${code} saved successfully.` };
      }

      // Delete Employee Always
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

          // Dual-sync: Deactivate mapping in central Tenant_User_Mapping
          try {
            const tenantId = payload.tenantId || crmApi.getActiveTenant()?.tenantId || 'TEN001';
            const mappings = JSON.parse(localStorage.getItem(STORAGE_KEYS.TENANT_USER_MAPPING) || '[]');
            const cleanMail = (rec.Email || '').toLowerCase();
            const mIdx = mappings.findIndex(m => m.TenantId === tenantId && (m.UserId === cleanMail || m.UserId === rec.EmployeeId));
            if (mIdx >= 0) {
              mappings[mIdx].Status = 'Inactive';
              mappings[mIdx].IsDeleted = true;
              mappings[mIdx].Deleted_By = userEmail;
              mappings[mIdx].Deleted_At = new Date().toISOString();
              localStorage.setItem(STORAGE_KEYS.TENANT_USER_MAPPING, JSON.stringify(mappings));
            }
          } catch (e) {}

          logAuditLocal(userEmail, 'DELETE', 'Staff', rec.EmployeeCode, `Deleted staff member: ${rec.FullName} (${rec.EmployeeCode})`);
          dispatchNotification({
            action: 'DELETE',
            module: 'Staff',
            recordId: rec.EmployeeCode,
            title: `Staff Deleted: ${rec.FullName}`,
            message: `${rec.FullName} (${rec.EmployeeCode}) was deleted by ${userEmail}.`,
            targetRoute: 'staff'
          });
          broadcastCrmEvent({ type: 'DATA_CHANGED', module: 'Staff', recordId: rec.EmployeeCode });
        }
        return { success: true, message: 'Staff member deleted successfully (retained in compliance audit archive).' };
      }

      // Restore Deleted Employee
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

      // Drive Backup Listing & ZIP generator
      case 'getDriveBackupsList': {
        const isSuper = Boolean(payload.isSuperAdmin);
        const activeTenant = crmApi.getActiveTenant() || { tenantId: 'TEN001', companyName: 'SR_Investments' };
        const cleanCompany = isSuper ? 'SR_Investments_CRM_ROOT' : (activeTenant.companyName || 'SR_Investments').replace(/[^a-zA-Z0-9_-]/g, '_');
        const cleanTenant = isSuper ? 'ROOT' : (activeTenant.tenantId || 'TEN001').replace(/[^a-zA-Z0-9_-]/g, '_');
        const storageKey = isSuper ? 'crm_drive_root_backups_list' : `crm_drive_backups_${cleanTenant}`;
        const existingBackups = JSON.parse(localStorage.getItem(storageKey) || localStorage.getItem('crm_drive_backups_list') || '[]');
        const emailCount = Number(localStorage.getItem('crm_dispatch_email_count') || 0);
        const emailMaxLimit = 200;

        return {
          success: true,
          isSuperAdmin: isSuper,
          companyName: cleanCompany,
          tenantId: cleanTenant,
          driveFolderUrl: 'https://drive.google.com/drive/folders/1rVz2OnKPDHbXuq-ujsJg2R3vzYDwnzMU',
          driveFolderPath: isSuper ? 'My Drive > SRInvestmentsCRM' : `My Drive > SRInvestmentsCRM > org > ${cleanTenant}`,
          driveFolderName: isSuper ? 'SRInvestmentsCRM' : cleanTenant,
          emailStats: {
            emailCount: emailCount,
            emailMaxLimit: emailMaxLimit,
            remainingEmails: Math.max(0, emailMaxLimit - emailCount),
            isLimitReached: emailCount >= emailMaxLimit
          },
          backups: existingBackups.slice(0, 3)
        };
      }

      case 'downloadDriveBackup': {
        const isSuper = Boolean(payload.isSuperAdmin);
        const customers = JSON.parse(localStorage.getItem(STORAGE_KEYS.CUSTOMERS) || '[]');
        const employees = JSON.parse(localStorage.getItem(STORAGE_KEYS.EMPLOYEES) || '[]');
        const settings = JSON.parse(localStorage.getItem(STORAGE_KEYS.SETTINGS) || '{}');
        const tenants = JSON.parse(localStorage.getItem(STORAGE_KEYS.TENANTS) || '[]');
        const users = JSON.parse(localStorage.getItem(STORAGE_KEYS.USERS) || '[]');
        const activeTenant = crmApi.getActiveTenant() || { tenantId: 'TEN001', companyName: 'SR_Investments' };
        const cleanCompany = isSuper ? 'SR_Investments_CRM_ROOT' : (activeTenant.companyName || 'SR_Investments').replace(/[^a-zA-Z0-9_-]/g, '_');
        const cleanTenant = isSuper ? 'ROOT' : (activeTenant.tenantId || 'TEN001').replace(/[^a-zA-Z0-9_-]/g, '_');
        const prefixBase = isSuper ? 'SR_Investments_CRM_ROOT_ALL' : `${cleanCompany}_CRM_${cleanTenant}`;

        // Create client-side downloadable backup JSON
        const backupPackage = isSuper ? {
          meta: {
            title: 'SR Investments CRM - SuperAdmin Full Platform & Root Drive Backup',
            generatedAt: new Date().toISOString(),
            scope: 'FULL_SYSTEM_ROOT',
            firm: 'SR Investments Platform',
            version: '2.0.0'
          },
          rootStructure: {
            org: tenants.map(t => ({ tenantId: t.TenantId, name: t.TenantName || t.CompanyName })),
            customerFiles: 'CustomerFiles/ (PAN, Folio, KYC)',
            employeeFiles: 'EmployeeFiles/ (Staff records)',
            centralDB: 'Central_SaaS_Master_DB'
          },
          database: {
            tenants,
            users,
            customers,
            employees,
            settings
          }
        } : {
          meta: {
            title: `${cleanCompany} CRM - Full Database & File Backup`,
            generatedAt: new Date().toISOString(),
            tenantId: cleanTenant,
            firm: cleanCompany,
            version: '2.0.0'
          },
          database: {
            customers,
            employees,
            settings
          }
        };

        const now = new Date();
        const dateStr = now.getFullYear().toString() +
          String(now.getMonth() + 1).padStart(2, '0') +
          String(now.getDate()).padStart(2, '0') + '_' +
          String(now.getHours()).padStart(2, '0') +
          String(now.getMinutes()).padStart(2, '0') +
          String(now.getSeconds()).padStart(2, '0');
        const zipFileName = `${prefixBase}_${dateStr}.zip`;

        const blob = new Blob([JSON.stringify(backupPackage, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);

        const storageKey = isSuper ? 'crm_drive_root_backups_list' : `crm_drive_backups_${cleanTenant}`;
        const list = JSON.parse(localStorage.getItem(storageKey) || localStorage.getItem('crm_drive_backups_list') || '[]');
        const updatedList = [
          {
            id: 'backup_' + Date.now(),
            name: zipFileName,
            sizeFormatted: isSuper ? '4.85 MB' : '1.24 MB',
            createdDate: now.toISOString(),
            downloadUrl: url,
            viewUrl: 'https://drive.google.com/drive/folders/1rVz2OnKPDHbXuq-ujsJg2R3vzYDwnzMU'
          },
          ...list.slice(0, 2)
        ];
        localStorage.setItem(storageKey, JSON.stringify(updatedList));

        const emailCount = Number(localStorage.getItem('crm_dispatch_email_count') || 0);
        const emailMaxLimit = 200;

        return {
          success: true,
          isSuperAdmin: isSuper,
          downloadUrl: url,
          fileName: zipFileName,
          fileSizeBytes: isSuper ? 5085560 : 1300234,
          sizeFormatted: isSuper ? '4.85 MB' : '1.24 MB',
          isLarge: false,
          driveFolderUrl: 'https://drive.google.com/drive/folders/1rVz2OnKPDHbXuq-ujsJg2R3vzYDwnzMU',
          driveFolderPath: isSuper ? 'My Drive > SRInvestmentsCRM' : `My Drive > SRInvestmentsCRM > org > ${cleanTenant}`,
          companyName: cleanCompany,
          tenantId: cleanTenant,
          emailStats: {
            emailCount: emailCount,
            emailMaxLimit: emailMaxLimit,
            remainingEmails: Math.max(0, emailMaxLimit - emailCount),
            isLimitReached: emailCount >= emailMaxLimit
          },
          backups: updatedList
        };
      }

      case 'sendBackupToEmail': {
        const emailCount = Number(localStorage.getItem('crm_dispatch_email_count') || 0);
        const emailMaxLimit = 200;
        if (emailCount >= emailMaxLimit) {
          throw new Error(`Daily email limit reached (${emailCount}/${emailMaxLimit} emails sent today). Please opt for manual download or try again after 24 hours.`);
        }
        const newCount = emailCount + 1;
        localStorage.setItem('crm_dispatch_email_count', String(newCount));
        const recipient = payload.recipientEmail || payload.email || 'company@example.com';
        return {
          success: true,
          emailCount: newCount,
          emailMaxLimit: emailMaxLimit,
          remainingEmails: Math.max(0, emailMaxLimit - newCount),
          message: `Backup archive sent successfully with ZIP attachment to ${recipient}. (Today's count: ${newCount}/${emailMaxLimit})`
        };
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

      // ==========================================
      // MASTER HUB (DEPARTMENTS, DESIGNATIONS, ROLES)
      // ==========================================
      case 'getMasters': {
        const depts = JSON.parse(localStorage.getItem(STORAGE_KEYS.DEPARTMENTS) || JSON.stringify(SEED_DATA.departments)).filter(d => !d.IsDeleted);
        const desigs = JSON.parse(localStorage.getItem(STORAGE_KEYS.DESIGNATIONS) || JSON.stringify(SEED_DATA.designations)).filter(d => !d.IsDeleted);
        const rls = JSON.parse(localStorage.getItem(STORAGE_KEYS.ROLES) || JSON.stringify(SEED_DATA.roles)).filter(r => !r.IsDeleted);
        return { departments: depts, designations: desigs, roles: rls };
      }

      case 'getDepartments': {
        let list = JSON.parse(localStorage.getItem(STORAGE_KEYS.DEPARTMENTS) || JSON.stringify(SEED_DATA.departments));
        const includeDel = payload.includeDeleted !== undefined ? payload.includeDeleted : this.getShowDeletedGlobally();
        if (!includeDel) list = list.filter(d => !d.IsDeleted);
        return list;
      }

      case 'getDesignations': {
        let list = JSON.parse(localStorage.getItem(STORAGE_KEYS.DESIGNATIONS) || JSON.stringify(SEED_DATA.designations));
        const includeDel = payload.includeDeleted !== undefined ? payload.includeDeleted : this.getShowDeletedGlobally();
        if (!includeDel) list = list.filter(d => !d.IsDeleted);
        return list;
      }

      case 'getRoles': {
        let list = JSON.parse(localStorage.getItem(STORAGE_KEYS.ROLES) || JSON.stringify(SEED_DATA.roles));
        const includeDel = payload.includeDeleted !== undefined ? payload.includeDeleted : this.getShowDeletedGlobally();
        if (!includeDel) list = list.filter(r => !r.IsDeleted);
        return list;
      }

      case 'saveMasterItem': {
        const type = (payload.type || '').toLowerCase();
        const data = payload.data || {};
        const userEmail = payload.userEmail || 'admin@srinvestments.com';
        const now = new Date().toISOString();

        let storageKey, idField, prefix, codeField, nameField;
        if (type === 'department') {
          storageKey = STORAGE_KEYS.DEPARTMENTS;
          idField = 'DepartmentId';
          codeField = 'DepartmentCode';
          nameField = 'DepartmentName';
          prefix = 'DEP';
        } else if (type === 'designation') {
          storageKey = STORAGE_KEYS.DESIGNATIONS;
          idField = 'DesignationId';
          codeField = 'DesignationCode';
          nameField = 'DesignationName';
          prefix = 'DES';
        } else if (type === 'role') {
          storageKey = STORAGE_KEYS.ROLES;
          idField = 'RoleId';
          codeField = 'RoleCode';
          nameField = 'RoleName';
          prefix = 'ROL';
        } else {
          throw new Error('Invalid master type: ' + type);
        }

        const list = JSON.parse(localStorage.getItem(storageKey) || JSON.stringify(SEED_DATA[type + 's'] || []));
        const id = data[idField] || (prefix + '_' + Date.now().toString().slice(-6));
        const index = list.findIndex(item => item[idField] === id);
        const existing = index >= 0 ? list[index] : null;

        const record = {
          ...data,
          [idField]: id,
          [codeField]: data[codeField] || (prefix + '_' + (list.length + 1)),
          [nameField]: data[nameField] || '',
          Status: data.Status || 'Active',
          IsDeleted: existing ? Boolean(existing.IsDeleted) : false,
          Created_By: existing ? (existing.Created_By || userEmail) : userEmail,
          Created_At: existing ? (existing.Created_At || now) : now,
          Updated_By: userEmail,
          Updated_At: now,
          Deleted_By: existing ? (existing.Deleted_By || '') : '',
          Deleted_At: existing ? (existing.Deleted_At || '') : ''
        };

        if (index >= 0) {
          list[index] = record;
        } else {
          list.push(record);
        }

        localStorage.setItem(storageKey, JSON.stringify(list));
        logAuditLocal(userEmail, index >= 0 ? 'UPDATE' : 'CREATE', 'MasterHub', record[codeField], 
          `${index >= 0 ? 'Updated' : 'Created'} ${type}: ${record[nameField]} (${record[codeField]})`);
        broadcastCrmEvent({ type: 'DATA_CHANGED', module: 'MasterHub', subType: type });
        return { success: true, item: record };
      }

      case 'deleteMasterItem': {
        const type = (payload.type || '').toLowerCase();
        const id = payload.id;
        const userEmail = payload.userEmail || 'admin@srinvestments.com';
        const now = new Date().toISOString();

        let storageKey, idField;
        if (type === 'department') {
          storageKey = STORAGE_KEYS.DEPARTMENTS;
          idField = 'DepartmentId';
        } else if (type === 'designation') {
          storageKey = STORAGE_KEYS.DESIGNATIONS;
          idField = 'DesignationId';
        } else if (type === 'role') {
          storageKey = STORAGE_KEYS.ROLES;
          idField = 'RoleId';
        } else {
          throw new Error('Invalid master type: ' + type);
        }

        const list = JSON.parse(localStorage.getItem(storageKey) || JSON.stringify(SEED_DATA[type + 's'] || []));
        const index = list.findIndex(item => item[idField] === id);
        if (index !== -1) {
          list[index].IsDeleted = true;
          list[index].Deleted_By = userEmail;
          list[index].Deleted_At = now;
          localStorage.setItem(storageKey, JSON.stringify(list));
          logAuditLocal(userEmail, 'DELETE', 'MasterHub', id, `Deleted ${type}: ${id}`);
          broadcastCrmEvent({ type: 'DATA_CHANGED', module: 'MasterHub', subType: type });
        }
        return { success: true, message: `${type} deleted.` };
      }

      case 'restoreMasterItem': {
        const type = (payload.type || '').toLowerCase();
        const id = payload.id;
        const userEmail = payload.userEmail || 'admin@srinvestments.com';
        const now = new Date().toISOString();

        let storageKey, idField;
        if (type === 'department') {
          storageKey = STORAGE_KEYS.DEPARTMENTS;
          idField = 'DepartmentId';
        } else if (type === 'designation') {
          storageKey = STORAGE_KEYS.DESIGNATIONS;
          idField = 'DesignationId';
        } else if (type === 'role') {
          storageKey = STORAGE_KEYS.ROLES;
          idField = 'RoleId';
        } else {
          throw new Error('Invalid master type: ' + type);
        }

        const list = JSON.parse(localStorage.getItem(storageKey) || JSON.stringify(SEED_DATA[type + 's'] || []));
        const index = list.findIndex(item => item[idField] === id);
        if (index !== -1) {
          list[index].IsDeleted = false;
          list[index].Updated_By = userEmail;
          list[index].Updated_At = now;
          list[index].Deleted_By = '';
          list[index].Deleted_At = '';
          localStorage.setItem(storageKey, JSON.stringify(list));
          logAuditLocal(userEmail, 'RESTORE', 'MasterHub', id, `Restored ${type}: ${id}`);
          broadcastCrmEvent({ type: 'DATA_CHANGED', module: 'MasterHub', subType: type });
        }
        return { success: true, message: `${type} restored.` };
      }

      case 'getCompanySettings': {
        return JSON.parse(localStorage.getItem(STORAGE_KEYS.SETTINGS) || JSON.stringify(SEED_DATA.settings));
      }

      case 'saveCompanySettings': {
        localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(payload));
        // Two-way sync: Update tenant in STORAGE_KEYS.TENANTS if present
        try {
          const tenants = JSON.parse(localStorage.getItem(STORAGE_KEYS.TENANTS) || '[]');
          const curTenantId = localStorage.getItem('sr_crm_active_tenant_id') || 'TEN001';
          const tIdx = tenants.findIndex(t => t.TenantId === curTenantId);
          if (tIdx >= 0) {
            if (payload.CompanyName) tenants[tIdx].CompanyName = payload.CompanyName;
            if (payload.CompanyTagLine || payload.TagLine) tenants[tIdx].TagLine = payload.CompanyTagLine || payload.TagLine;
            localStorage.setItem(STORAGE_KEYS.TENANTS, JSON.stringify(tenants));
          }
        } catch (e) {
          console.warn('Local tenant sync error:', e);
        }
        return { success: true, message: 'Company settings saved.' };
      }

      case 'getRolesRights': {
        return JSON.parse(localStorage.getItem(STORAGE_KEYS.RIGHTS) || JSON.stringify(SEED_DATA.rights));
      }

      case 'saveRolesRights': {
        localStorage.setItem(STORAGE_KEYS.RIGHTS, JSON.stringify(payload));
        return { success: true, message: 'Role permissions saved.' };
      }

      case 'getApprovalSettings': {
        const stored = localStorage.getItem('sr_crm_approval_settings');
        if (stored) return JSON.parse(stored);
        return { success: true, enabled: false, onAdd: false, onEdit: false, onDelete: false };
      }

      case 'saveApprovalSettings': {
        const settings = {
          success: true,
          enabled: Boolean(payload.enabled),
          onAdd: payload.onAdd !== false,
          onEdit: payload.onEdit !== false,
          onDelete: payload.onDelete !== false
        };
        localStorage.setItem('sr_crm_approval_settings', JSON.stringify(settings));
        broadcastCrmEvent({ type: 'DATA_CHANGED', module: 'Settings', subType: 'APPROVAL_SETTINGS_CHANGED' });
        return { success: true, message: 'Approval workflow settings saved successfully.', settings };
      }

      case 'approveRecord': {
        const mod = String(payload.module || payload.type || '').toLowerCase();
        const id = payload.id;
        const now = new Date().toISOString();
        const adminEmail = payload.adminEmail || payload.userEmail || 'admin@srinvestments.com';

        let storageKey = '';
        let idField = '';
        if (mod.includes('dep')) { storageKey = STORAGE_KEYS.DEPARTMENTS; idField = 'DepartmentId'; }
        else if (mod.includes('des')) { storageKey = STORAGE_KEYS.DESIGNATIONS; idField = 'DesignationId'; }
        else if (mod.includes('rol')) { storageKey = STORAGE_KEYS.ROLES; idField = 'RoleId'; }
        else if (mod.includes('staf') || mod.includes('emp')) { storageKey = STORAGE_KEYS.EMPLOYEES; idField = 'EmployeeId'; }
        else if (mod.includes('cust')) { storageKey = STORAGE_KEYS.CUSTOMERS; idField = 'CustomerId'; }

        if (storageKey) {
          let list = JSON.parse(localStorage.getItem(storageKey) || '[]');
          const idx = list.findIndex(r => String(r[idField] || '') === String(id));
          if (idx !== -1) {
            const isDelete = String(list[idx].Status || '').toLowerCase().includes('delete');
            let hist = [];
            try {
              hist = Array.isArray(list[idx].Approval_History) ? list[idx].Approval_History : JSON.parse(list[idx].Approval_History || '[]');
            } catch (e) {
              hist = [];
            }

            if (isDelete) {
              list[idx].IsDeleted = true;
              list[idx].Status = 'Deleted';
              list[idx].Deleted_By = adminEmail;
              list[idx].Deleted_At = now;
              list[idx].Deleted_Approved_By = adminEmail;
              list[idx].Deleted_Approved_At = now;
              hist.push({ action: 'DELETE', status: 'Approved', approvedBy: adminEmail, approvedAt: now });
            } else {
              list[idx].Status = 'Active';
              const isCreate = !list[idx].Created_Approved_By && !list[idx].Created_Approved_At;
              if (isCreate) {
                list[idx].Created_Approved_By = adminEmail;
                list[idx].Created_Approved_At = now;
                hist.push({ action: 'CREATE', status: 'Approved', approvedBy: adminEmail, approvedAt: now });
              } else {
                list[idx].Updated_Approved_By = adminEmail;
                list[idx].Updated_Approved_At = now;
                hist.push({ action: 'EDIT', status: 'Approved', approvedBy: adminEmail, approvedAt: now });
              }
            }
            list[idx].Approval_History = JSON.stringify(hist);
            list[idx].Approved_By = adminEmail;
            list[idx].Approved_At = now;
            list[idx].Updated_By = adminEmail;
            list[idx].Updated_At = now;
            localStorage.setItem(storageKey, JSON.stringify(list));
            broadcastCrmEvent({ type: 'DATA_CHANGED', module: mod });
          }
        }
        return { success: true, message: `${payload.module || payload.type} approved successfully.` };
      }

      case 'rejectRecord': {
        const mod = String(payload.module || payload.type || '').toLowerCase();
        const id = payload.id;
        const reason = payload.reason ? (' - ' + payload.reason) : '';
        const now = new Date().toISOString();
        const adminEmail = payload.adminEmail || payload.userEmail || 'admin@srinvestments.com';

        let storageKey = '';
        let idField = '';
        if (mod.includes('dep')) { storageKey = STORAGE_KEYS.DEPARTMENTS; idField = 'DepartmentId'; }
        else if (mod.includes('des')) { storageKey = STORAGE_KEYS.DESIGNATIONS; idField = 'DesignationId'; }
        else if (mod.includes('rol')) { storageKey = STORAGE_KEYS.ROLES; idField = 'RoleId'; }
        else if (mod.includes('staf') || mod.includes('emp')) { storageKey = STORAGE_KEYS.EMPLOYEES; idField = 'EmployeeId'; }
        else if (mod.includes('cust')) { storageKey = STORAGE_KEYS.CUSTOMERS; idField = 'CustomerId'; }

        if (storageKey) {
          let list = JSON.parse(localStorage.getItem(storageKey) || '[]');
          const idx = list.findIndex(r => String(r[idField] || '') === String(id));
          if (idx !== -1) {
            const isDelete = String(list[idx].Status || '').toLowerCase().includes('delete');
            let hist = [];
            try {
              hist = Array.isArray(list[idx].Approval_History) ? list[idx].Approval_History : JSON.parse(list[idx].Approval_History || '[]');
            } catch (e) {
              hist = [];
            }

            if (isDelete) {
              list[idx].Status = 'Active';
              hist.push({ action: 'DELETE', status: 'Rejected', rejectedBy: adminEmail, rejectedAt: now, reason: payload.reason || '' });
            } else {
              list[idx].Status = 'Rejected';
              const isCreate = !list[idx].Created_Approved_By && !list[idx].Created_Approved_At;
              hist.push({ action: isCreate ? 'CREATE' : 'EDIT', status: 'Rejected', rejectedBy: adminEmail, rejectedAt: now, reason: payload.reason || '' });
            }
            list[idx].Approval_History = JSON.stringify(hist);
            list[idx].Approved_By = adminEmail + ' (Rejected' + reason + ')';
            list[idx].Approved_At = now;
            list[idx].Updated_By = adminEmail;
            list[idx].Updated_At = now;
            localStorage.setItem(storageKey, JSON.stringify(list));
            broadcastCrmEvent({ type: 'DATA_CHANGED', module: mod });
          }
        }
        return { success: true, message: `${payload.module || payload.type} rejected.` };
      }

      case 'updateUserProfile': {
        return { success: true, message: 'Profile updated.' };
      }

      case 'changePassword': {
        if (!payload.newPassword || payload.newPassword.length < 6) {
          throw new Error('New password must be at least 6 characters.');
        }
        const hashedNew = await hashPasswordSHA256(payload.newPassword);
        const users = JSON.parse(localStorage.getItem(STORAGE_KEYS.USER_MASTER) || '[]');
        const idx = users.findIndex(u => u.Email === payload.email || u.UserId === payload.userId);
        if (idx >= 0) {
          users[idx].Password = hashedNew;
          localStorage.setItem(STORAGE_KEYS.USER_MASTER, JSON.stringify(users));
        }
        const employees = JSON.parse(localStorage.getItem(STORAGE_KEYS.EMPLOYEES) || '[]');
        const eIdx = employees.findIndex(e => e.Email === payload.email || e.EmployeeId === payload.userId);
        if (eIdx >= 0) {
          employees[eIdx].Password = hashedNew;
          localStorage.setItem(STORAGE_KEYS.EMPLOYEES, JSON.stringify(employees));
        }
        return { success: true, message: 'Password updated and secured with SHA-256.' };
      }

      default:
        throw new Error('Unknown action: ' + action);
    }
  }
};

export default crmApi;
