import React, { useState, useEffect, useRef } from 'react';
import { 
  Users, 
  Search, 
  Plus, 
  UserPlus,
  Edit2, 
  Edit3,
  Trash2, 
  Download, 
  CheckCircle, 
  CheckCircle2,
  AlertCircle, 
  FileText,
  Building,
  CreditCard,
  UserCheck,
  RotateCcw,
  Archive,
  Clock,
  RefreshCw,
  Check,
  X,
  Play,
  Save,
  ArrowRight,
  ArrowLeft,
  Upload,
  Eye,
  FileCheck,
  ShieldCheck,
  Bookmark,
  User,
  Mail
} from 'lucide-react';
import { crmApi, subscribeCrmEvents, getInitialsCode } from '../services/api';
import { useAuth } from '../context/AuthContext';
import Header from '../components/Header';
import Modal from '../components/Modal';
import { showSuccess, showError, showWarning, showConfirm } from '../utils/swal';

export default function Customers({ onOpenBackup }) {
  const { user, hasPermission, isSuperAdmin } = useAuth();
  const isAdmin = user?.role === 'Admin' || user?.role?.toLowerCase() === 'admin' || isSuperAdmin;
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [kycFilter, setKycFilter] = useState('');
  const [showDeleted, setShowDeleted] = useState(() => crmApi.getShowDeletedGlobally());
  
  // Progressive scroll pagination state (Initial 10 rows, auto-loads +10 on scroll)
  const PAGE_SIZE = 10;
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const sentinelRef = useRef(null);

  // Drafts state
  const [drafts, setDrafts] = useState([]);
  const [draftCount, setDraftCount] = useState(0);
  const [isDraftsModalOpen, setIsDraftsModalOpen] = useState(false);
  const [activeDraftKey, setActiveDraftKey] = useState(null);
  const [selectedDraftKeys, setSelectedDraftKeys] = useState([]);

  // Background Draft Queue State (Non-blocking fast step progression)
  const [bgDraftStatus, setBgDraftStatus] = useState(null); // { step, status: 'saving'|'saved'|'error', text }
  const draftQueueRef = useRef([]);
  const isProcessingDraftRef = useRef(false);
  const currentDraftKeyRef = useRef(null);

  useEffect(() => {
    currentDraftKeyRef.current = activeDraftKey;
  }, [activeDraftKey]);

  // 7-Step Wizard state
  const [currentStep, setCurrentStep] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState(null);
  const [saving, setSaving] = useState(false);
  const [savingDraft, setSavingDraft] = useState(false);
  const [isCodeManual, setIsCodeManual] = useState(false);
  const [validationErrors, setValidationErrors] = useState({});

  // Initial Multi-bank & Multi-nominee structures
  const defaultBank = () => ({
    BankId: '',
    IfscCode: '',
    BankName: '',
    AccountNumber: '',
    AccountType: 'Saving',
    MicrCode: ''
  });

  const defaultNominee = (index = 0) => ({
    NomineeId: '',
    NomineeName: '',
    Relation: '',
    RelationOther: '',
    DateOfBirth: '',
    Occupation: '',
    IdProofType: '',
    DocumentNo: '',
    Mobile: '',
    Email: '',
    Address: '',
    SharePercentage: index === 0 ? '100' : '0'
  });

  const initialFormState = {
    CustomerId: '',
    CustomerCode: '',
    SR_UniqueId: '',
    // Step 1: Basic
    Title: '',
    FirstName: '',
    MiddleName: '',
    LastName: '',
    FullName: '',
    Gender: '',
    DateOfBirth: '',
    Occupation: '',
    AnnualIncome: '',
    // Step 2: KYC
    Mobile: '',
    Email: '',
    PanNumber: '',
    AadharNo: '',
    // Step 3: Address
    Address: '',
    Pincode: '',
    Area: '',
    City: '',
    State: '',
    // Step 4: System
    BseUcc: '',
    SkCustId: '',
    SkDpId: '',
    SkClientId: '',
    // Step 5: Banks
    banks: [defaultBank()],
    // Step 6: Nominees
    nominees: [defaultNominee(0)],
    // Step 7: Docs
    PanDoc: null,
    AadharDoc: null,
    BankStatementDoc: null,
    BankChequeDoc: null,
    NomineeProofDoc: null,
    SignDoc: null,
    PanDocUrl: '',
    AadharDocUrl: '',
    BankStatementDocUrl: '',
    BankChequeDocUrl: '',
    NomineeProofDocUrl: '',
    SignDocUrl: '',
    KycStatus: 'PENDING',
    InvestorCategory: 'INDIVIDUAL',
    RiskProfile: 'MODERATE',
    Notes: '',
    Status: 'ACTIVE'
  };

  const [formData, setFormData] = useState(initialFormState);

  // Reset pagination to initial 10 rows when search or filter criteria change
  useEffect(() => {
    setVisibleCount(PAGE_SIZE);
  }, [search, kycFilter, showDeleted]);

  // Infinite scroll intersection observer for high performance fast scrolling
  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) return;

    const observer = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting) {
        setVisibleCount(prev => Math.min(prev + PAGE_SIZE, customers.length));
      }
    }, { threshold: 0.1, rootMargin: '120px' });

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [customers.length]);

  const loadCustomers = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await crmApi.call('getCustomers', {
        search,
        kycStatus: kycFilter,
        includeDeleted: showDeleted
      });
      setCustomers(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.message || 'Failed to load customers');
    } finally {
      setLoading(false);
    }
  };

  const loadDrafts = async () => {
    try {
      const serverDrafts = await crmApi.call('getCustomerDrafts', { _silent: true }).catch(() => []);
      let localDrafts = [];
      try {
        localDrafts = JSON.parse(localStorage.getItem('sr_crm_customer_drafts') || '[]');
      } catch (e) {}

      const mergedMap = new Map();
      if (Array.isArray(serverDrafts)) {
        serverDrafts.forEach(d => { if (d.DraftKey) mergedMap.set(d.DraftKey, d); });
      }
      if (Array.isArray(localDrafts)) {
        localDrafts.forEach(d => {
          if (d.DraftKey && !mergedMap.has(d.DraftKey)) {
            mergedMap.set(d.DraftKey, d);
          }
        });
      }
      const validDrafts = Array.from(mergedMap.values());
      setDrafts(validDrafts);
      setDraftCount(validDrafts.length);
    } catch (err) {
      console.warn('Failed to load customer drafts:', err);
    }
  };

  useEffect(() => {
    loadCustomers();
    loadDrafts();
  }, [search, kycFilter, showDeleted]);

  useEffect(() => {
    const unsubscribe = subscribeCrmEvents((evt) => {
      if (evt.module === 'Customers' || evt.module === 'Drafts') {
        loadCustomers();
        loadDrafts();
      }
    });
    return () => unsubscribe();
  }, []);

  const openAddModal = () => {
    setEditingCustomer(null);
    setIsCodeManual(false);
    setActiveDraftKey(null);
    currentDraftKeyRef.current = null;
    draftQueueRef.current = [];
    setBgDraftStatus(null);
    setCurrentStep(1);
    setValidationErrors({});
    const genCode = 'SR' + Math.floor(10000 + Math.random() * 90000);
    setFormData({
      ...initialFormState,
      CustomerCode: genCode,
      SR_UniqueId: genCode,
      banks: [defaultBank()],
      nominees: [defaultNominee(0)]
    });
    setIsModalOpen(true);
  };

  const openEditModal = async (cust) => {
    setEditingCustomer(cust);
    setIsCodeManual(true);
    setActiveDraftKey(null);
    currentDraftKeyRef.current = null;
    draftQueueRef.current = [];
    setBgDraftStatus(null);
    setCurrentStep(1);
    setValidationErrors({});

    try {
      const fullCust = await crmApi.call('getCustomerById', { id: cust.CustomerId });
      const record = fullCust || cust;
      setFormData({
        ...initialFormState,
        ...record,
        CustomerId: record.CustomerId || '',
        CustomerCode: record.CustomerCode || '',
        SR_UniqueId: record.CustomerCode || '',
        Title: record.Title || '',
        FirstName: record.FirstName || '',
        MiddleName: record.MiddleName || '',
        LastName: record.LastName || '',
        FullName: record.FullName || '',
        Gender: record.Gender || '',
        DateOfBirth: record.DateOfBirth || record.BirthDate || '',
        Occupation: record.Occupation || '',
        AnnualIncome: record.AnnualIncome || '',
        Mobile: record.Mobile || '',
        Email: record.Email || '',
        PanNumber: record.PanNumber || '',
        AadharNo: record.AadharNo || record.AadhaarLast4 || '',
        Address: record.Address || '',
        Pincode: record.Pincode || '',
        Area: record.Area || '',
        City: record.City || '',
        State: record.State || '',
        BseUcc: record.BseUcc || record.BSE_UCC || '',
        SkCustId: record.SkCustId || record.SK_CustId || '',
        SkDpId: record.SkDpId || record.SK_DPID || '',
        SkClientId: record.SkClientId || record.SK_ClientId || '',
        banks: Array.isArray(record.banks) && record.banks.length > 0 ? record.banks : [defaultBank()],
        nominees: Array.isArray(record.nominees) && record.nominees.length > 0 ? record.nominees : [defaultNominee(0)],
        PanDocUrl: record.PanDocUrl || '',
        AadharDocUrl: record.AadharDocUrl || '',
        BankStatementDocUrl: record.BankStatementDocUrl || '',
        BankChequeDocUrl: record.BankChequeDocUrl || '',
        NomineeProofDocUrl: record.NomineeProofDocUrl || '',
        SignDocUrl: record.SignDocUrl || ''
      });
    } catch (e) {
      setFormData({
        ...initialFormState,
        ...cust,
        banks: [defaultBank()],
        nominees: [defaultNominee(0)]
      });
    }
    setIsModalOpen(true);
  };

  // Auto-generate FullName and initials code
  const handleNamePartChange = (field, val) => {
    const updated = { ...formData, [field]: val };
    const fn = [
      field === 'FirstName' ? val : updated.FirstName,
      field === 'MiddleName' ? val : updated.MiddleName,
      field === 'LastName' ? val : updated.LastName
    ].filter(Boolean).join(' ');
    
    updated.FullName = fn;

    if (!isCodeManual && !editingCustomer && fn.trim().length > 0) {
      const initials = getInitialsCode(fn);
      if (initials) {
        updated.CustomerCode = initials;
        updated.SR_UniqueId = initials;
      }
    }
    setFormData(updated);
  };

  // Auto-set Gender on Title change
  const handleTitleChange = (val) => {
    let gender = formData.Gender;
    if (val === 'Mr') gender = 'Male';
    else if (val === 'Mrs' || val === 'Ms') gender = 'Female';

    // If Title is Minor or HUF, nominee limit is 1
    let noms = [...formData.nominees];
    if (val === 'Minor' || val === 'HUF') {
      if (noms.length > 1) {
        noms = [noms[0]];
        noms[0].SharePercentage = '100';
      }
    }

    setFormData({
      ...formData,
      Title: val,
      Gender: gender,
      nominees: noms
    });
  };

  // Max Nominees allowed based on Title
  const getMaxNominees = () => {
    if (formData.Title === 'Minor' || formData.Title === 'HUF') return 1;
    return 3;
  };

  // Step Label for Nominee based on Title
  const getNomineeStepLabel = () => {
    if (formData.Title === 'Minor') return 'Guardian';
    if (formData.Title === 'HUF') return 'Karta';
    return 'Nominee';
  };

  // Postal Pincode Auto-fetch
  const handlePincodeChange = async (val) => {
    const cleanPin = val.replace(/\D/g, '').slice(0, 6);
    setFormData(prev => ({ ...prev, Pincode: cleanPin }));

    if (cleanPin.length === 6) {
      try {
        const res = await fetch(`https://api.postalpincode.in/pincode/${cleanPin}`);
        const data = await res.json();
        if (data && data[0] && data[0].Status === 'Success' && data[0].PostOffice && data[0].PostOffice.length > 0) {
          const po = data[0].PostOffice[0];
          setFormData(prev => ({
            ...prev,
            Pincode: cleanPin,
            Area: po.Name || prev.Area,
            City: po.District || po.Division || prev.City,
            State: po.State || prev.State
          }));
        }
      } catch (err) {
        console.warn('Pincode fetch error:', err);
      }
    }
  };

  // Razorpay IFSC Auto-fetch for Bank
  const handleIfscChange = async (index, val) => {
    const cleanIfsc = val.toUpperCase().trim();
    const updatedBanks = [...formData.banks];
    updatedBanks[index] = { ...updatedBanks[index], IfscCode: cleanIfsc };
    setFormData({ ...formData, banks: updatedBanks });

    if (cleanIfsc.length === 11) {
      try {
        const res = await fetch(`https://ifsc.razorpay.com/${cleanIfsc}`);
        if (res.ok) {
          const data = await res.json();
          const newBanks = [...formData.banks];
          newBanks[index] = {
            ...newBanks[index],
            IfscCode: cleanIfsc,
            BankName: data.BANK || newBanks[index].BankName,
            MicrCode: data.MICR || newBanks[index].MicrCode
          };
          setFormData(prev => ({ ...prev, banks: newBanks }));
        }
      } catch (err) {
        console.warn('IFSC lookup failed:', err);
      }
    }
  };

  // Dynamic Bank rows
  const addBankRow = () => {
    if (formData.banks.length >= 3) return;
    setFormData({
      ...formData,
      banks: [...formData.banks, defaultBank()]
    });
  };

  const removeBankRow = (idx) => {
    if (formData.banks.length <= 1) return;
    const filtered = formData.banks.filter((_, i) => i !== idx);
    setFormData({ ...formData, banks: filtered });
  };

  // Dynamic Nominee rows
  const addNomineeRow = () => {
    const max = getMaxNominees();
    if (formData.nominees.length >= max) return;
    setFormData({
      ...formData,
      nominees: [...formData.nominees, defaultNominee(formData.nominees.length)]
    });
  };

  const removeNomineeRow = (idx) => {
    if (formData.nominees.length <= 1) return;
    const filtered = formData.nominees.filter((_, i) => i !== idx);
    setFormData({ ...formData, nominees: filtered });
  };

  // File Upload Helper
  const handleFileUpload = (docKey, e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      showWarning('File size exceeds 5MB limit.');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setFormData(prev => ({
        ...prev,
        [docKey]: {
          name: file.name,
          mimeType: file.type,
          base64: reader.result
        },
        [docKey + 'Url']: reader.result
      }));
    };
    reader.readAsDataURL(file);
  };

  const removeFile = (docKey) => {
    setFormData(prev => ({
      ...prev,
      [docKey]: null,
      [docKey + 'Url']: ''
    }));
  };

  // ================= VALIDATION LOGIC =================
  const validateStep = (step) => {
    const errs = {};

    if (step === 1) {
      if (!formData.Title) errs.Title = 'Title is required';
      if (!formData.FirstName || !formData.FirstName.trim()) errs.FirstName = 'First Name is required';
      if (!formData.LastName || !formData.LastName.trim()) errs.LastName = 'Last Name is required';
      if (!formData.Gender) errs.Gender = 'Gender is required';
      if (!formData.DateOfBirth) errs.DateOfBirth = 'Birth Date is required';
      if (formData.Title !== 'Minor' && !formData.Occupation) errs.Occupation = 'Occupation is required';
      if (formData.Title !== 'Minor' && !formData.AnnualIncome) errs.AnnualIncome = 'Annual Income is required';
    }

    if (step === 2) {
      if (!formData.Mobile || !/^\d{10}$/.test(formData.Mobile)) {
        errs.Mobile = 'Mobile must be exactly 10 digits';
      }
      if (!formData.Email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.Email)) {
        errs.Email = 'Valid Email Address is required';
      }
      if (!formData.PanNumber || !/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(formData.PanNumber.toUpperCase())) {
        errs.PanNumber = 'Valid PAN required (e.g. ABCDE1234F)';
      }
      if (!formData.AadharNo || !/^\d{12}$/.test(formData.AadharNo)) {
        errs.AadharNo = 'Aadhaar must be exactly 12 digits';
      }
    }

    if (step === 3) {
      if (!formData.Address || !formData.Address.trim()) errs.Address = 'Address is required';
      if (!formData.Pincode || !/^\d{6}$/.test(formData.Pincode)) errs.Pincode = 'Pincode must be 6 digits';
      if (!formData.Area || !formData.Area.trim()) errs.Area = 'Area / Locality is required';
      if (!formData.City || !formData.City.trim()) errs.City = 'City / District is required';
      if (!formData.State || !formData.State.trim()) errs.State = 'State is required';
    }

    if (step === 4) {
      if (formData.BseUcc && !/^[a-zA-Z0-9]{1,15}$/.test(formData.BseUcc)) {
        errs.BseUcc = 'BSE UCC must be alphanumeric (max 15 chars)';
      }
      if (formData.SkCustId && !/^\d+$/.test(formData.SkCustId)) {
        errs.SkCustId = 'SK CustId must be numeric';
      }
      if (!formData.CustomerCode && !formData.SR_UniqueId) {
        errs.SR_UniqueId = 'Customer Code / SR ID is required';
      }
    }

    if (step === 5) {
      formData.banks.forEach((b, idx) => {
        if (!b.IfscCode || b.IfscCode.length !== 11) {
          errs[`bank_${idx}_IfscCode`] = '11-character IFSC is required';
        }
        if (!b.BankName || !b.BankName.trim()) {
          errs[`bank_${idx}_BankName`] = 'Bank Name is required';
        }
        if (!b.AccountNumber || !b.AccountNumber.trim()) {
          errs[`bank_${idx}_AccountNumber`] = 'Account Number is required';
        }
        if (!b.AccountType) {
          errs[`bank_${idx}_AccountType`] = 'Account Type is required';
        }
      });
    }

    if (step === 6) {
      let totalShare = 0;
      formData.nominees.forEach((n, idx) => {
        if (!n.NomineeName || !n.NomineeName.trim()) {
          errs[`nominee_${idx}_NomineeName`] = `${getNomineeStepLabel()} Name is required`;
        }
        if (!n.Relation) {
          errs[`nominee_${idx}_Relation`] = 'Relation is required';
        }
        if (n.Relation === 'Other' && (!n.RelationOther || !n.RelationOther.trim())) {
          errs[`nominee_${idx}_RelationOther`] = 'Please specify relation';
        }
        if (!n.DateOfBirth) {
          errs[`nominee_${idx}_DateOfBirth`] = 'DOB is required';
        }
        if (!n.Occupation) {
          errs[`nominee_${idx}_Occupation`] = 'Occupation is required';
        }
        if (!n.IdProofType) {
          errs[`nominee_${idx}_IdProofType`] = 'ID Proof Type is required';
        }
        if (!n.DocumentNo || !n.DocumentNo.trim()) {
          errs[`nominee_${idx}_DocumentNo`] = 'Document No is required';
        }
        const share = Number(n.SharePercentage || 0);
        totalShare += share;
      });

      if (totalShare !== 100) {
        errs.NomineeTotalShare = `Total Nominee Share must equal 100% (currently ${totalShare}%)`;
      }
    }

    if (step === 7) {
      if (!formData.PanDoc && !formData.PanDocUrl) errs.PanDoc = 'PAN Card copy is required';
      if (!formData.AadharDoc && !formData.AadharDocUrl) errs.AadharDoc = 'Aadhaar Card copy is required';
      if (!formData.NomineeProofDoc && !formData.NomineeProofDocUrl) errs.NomineeProofDoc = 'Nominee Proof is required';
      if (!formData.SignDoc && !formData.SignDocUrl) errs.SignDoc = 'Customer Signature is required';
    }

    setValidationErrors(errs);
    return Object.keys(errs).length === 0;
  };

  // Helper styling for inputs and error messages (Generous width and comfortable height)
  const getInputStyle = (errorKey, extra = {}) => ({
    width: '100%',
    padding: '0.65rem 0.9rem',
    fontSize: '0.875rem',
    borderRadius: '8px',
    border: validationErrors[errorKey] ? '1.5px solid #ef4444' : '1px solid #cbd5e1',
    backgroundColor: validationErrors[errorKey] ? '#fff5f5' : '#ffffff',
    color: '#0f172a',
    outline: 'none',
    boxSizing: 'border-box',
    transition: 'border-color 0.15s ease, box-shadow 0.15s ease',
    boxShadow: validationErrors[errorKey] ? '0 0 0 2px rgba(239, 68, 68, 0.15)' : 'none',
    minHeight: '42px',
    ...extra
  });

  const renderFieldError = (errorKey) => {
    if (!validationErrors[errorKey]) return null;
    return (
      <p style={{
        color: '#ef4444',
        fontSize: '0.75rem',
        marginTop: '0.35rem',
        marginBottom: 0,
        fontWeight: '500',
        display: 'flex',
        alignItems: 'center',
        gap: '4px'
      }}>
        <AlertCircle size={12} />
        <span>{validationErrors[errorKey]}</span>
      </p>
    );
  };

  const renderFieldLabel = (label, isRequired) => (
    <label style={{
      display: 'block',
      fontSize: '0.785rem',
      fontWeight: '600',
      color: '#475569',
      textTransform: 'uppercase',
      letterSpacing: '0.025em',
      marginBottom: '0.4rem'
    }}>
      {label} {isRequired && <span style={{ color: '#ef4444' }}>*</span>}
    </label>
  );

  // ================= SAVE AS DRAFT & BACKGROUND QUEUE =================
  const persistLocalDraft = (key, step, custName, data) => {
    try {
      const drafts = JSON.parse(localStorage.getItem('sr_crm_customer_drafts') || '[]');
      const dKey = key || ('DKEY_' + Math.random().toString(36).substring(2, 9).toUpperCase());
      const existingIdx = drafts.findIndex(d => d.DraftKey === dKey);
      const now = new Date().toISOString();
      const entry = {
        DraftKey: dKey,
        CustomerName: custName,
        StepNo: step,
        TotalSteps: 7,
        LastModifiedBy: user?.email || 'User',
        LastModifiedOn: now,
        DraftData: { ...data, DraftKey: dKey, CurrentStep: step }
      };
      if (existingIdx >= 0) drafts[existingIdx] = entry;
      else drafts.unshift(entry);
      localStorage.setItem('sr_crm_customer_drafts', JSON.stringify(drafts));
      return dKey;
    } catch (e) {
      return key;
    }
  };

  const handleSaveDraft = async (silent = false) => {
    try {
      setSavingDraft(true);
      const custName = formData.FullName || [formData.FirstName, formData.LastName].filter(Boolean).join(' ') || 'Customer Draft';
      const keyToUse = currentDraftKeyRef.current || activeDraftKey;
      const assignedKey = persistLocalDraft(keyToUse, currentStep, custName, formData);
      if (assignedKey) {
        currentDraftKeyRef.current = assignedKey;
        setActiveDraftKey(assignedKey);
      }

      const payload = {
        DraftKey: assignedKey,
        CurrentStep: currentStep,
        CustomerName: custName,
        userEmail: user?.email,
        _silent: silent,
        DraftData: {
          ...formData,
          DraftKey: assignedKey,
          CurrentStep: currentStep
        }
      };

      try {
        const res = await crmApi.call('saveCustomerDraft', payload);
        if (res?.data?.DraftKey) {
          currentDraftKeyRef.current = res.data.DraftKey;
          setActiveDraftKey(res.data.DraftKey);
        }
      } catch (cloudErr) {
        console.warn('Cloud draft save notice (saved locally):', cloudErr?.message || cloudErr);
      }

      await loadDrafts();
      if (!silent) {
        showSuccess('Draft Saved', `Draft for "${custName}" (Step ${currentStep} of 7) has been saved.`);
      }
      return true;
    } catch (err) {
      if (!silent) {
        showError('Draft Save Failed', err.message || 'Could not save draft');
      }
      return false;
    } finally {
      setSavingDraft(false);
    }
  };

  // Queue background draft save without blocking step navigation
  const queueDraftSave = (stepNumber, formSnapshot) => {
    draftQueueRef.current.push({ step: stepNumber, data: { ...formSnapshot } });
    processDraftQueue();
  };

  const processDraftQueue = async () => {
    if (isProcessingDraftRef.current) return;
    if (draftQueueRef.current.length === 0) return;

    isProcessingDraftRef.current = true;
    const task = draftQueueRef.current.shift();

    setBgDraftStatus({
      step: task.step,
      status: 'saving',
      text: `Draft (Step ${task.step}) saving...`
    });

    try {
      const custName = task.data.FullName || [task.data.FirstName, task.data.LastName].filter(Boolean).join(' ') || 'Customer Draft';
      const keyToUse = currentDraftKeyRef.current || activeDraftKey;

      // 1. Instant local persistence (ensures user data is never lost)
      const assignedKey = persistLocalDraft(keyToUse, task.step, custName, task.data);
      if (assignedKey) {
        currentDraftKeyRef.current = assignedKey;
        setActiveDraftKey(assignedKey);
      }

      // 2. Background cloud synchronization (with _silent: true so it doesn't conflict with global bottom toast)
      const payload = {
        DraftKey: assignedKey,
        CurrentStep: task.step,
        CustomerName: custName,
        userEmail: user?.email,
        _silent: true,
        DraftData: {
          ...task.data,
          DraftKey: assignedKey,
          CurrentStep: task.step
        }
      };

      try {
        const res = await crmApi.call('saveCustomerDraft', payload);
        if (res?.data?.DraftKey) {
          currentDraftKeyRef.current = res.data.DraftKey;
          setActiveDraftKey(res.data.DraftKey);
        }
      } catch (cloudErr) {
        console.warn('Cloud draft sync notice (stored locally):', cloudErr?.message || cloudErr);
      }

      loadDrafts();

      setBgDraftStatus({
        step: task.step,
        status: 'saved',
        text: `Draft (Step ${task.step}) saved`
      });

      setTimeout(() => {
        setBgDraftStatus(prev => {
          if (prev?.step === task.step && prev?.status === 'saved' && draftQueueRef.current.length === 0) {
            return null;
          }
          return prev;
        });
      }, 2500);
    } catch (err) {
      console.warn('Background draft save error:', err);
      setBgDraftStatus({
        step: task.step,
        status: 'error',
        text: `Draft (Step ${task.step}) failed`
      });
      setTimeout(() => {
        setBgDraftStatus(null);
      }, 3000);
    } finally {
      isProcessingDraftRef.current = false;
      if (draftQueueRef.current.length > 0) {
        processDraftQueue();
      }
    }
  };

  // Next Step Action: Immediate forward navigation + background queue!
  const handleNextStep = () => {
    if (!validateStep(currentStep)) return;

    const completedStep = currentStep;
    if (currentStep < 7) {
      setCurrentStep(prev => prev + 1);
      setValidationErrors({});
    }

    // Auto-save draft asynchronously in background queue without blocking UI
    if (!editingCustomer) {
      queueDraftSave(completedStep, formData);
    }
  };

  // Previous Step Action
  const handlePrevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
      setValidationErrors({});
    }
  };

  // ================= SUBMIT COMPLETED FORM =================
  const handleSubmit = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    if (!validateStep(7)) return;

    // Check all previous steps one more time
    for (let s = 1; s <= 6; s++) {
      if (!validateStep(s)) {
        setCurrentStep(s);
        showWarning(`Please complete required fields in Step ${s}`);
        return;
      }
    }

    try {
      setSaving(true);
      const payload = {
        ...formData,
        draftKey: activeDraftKey,
        userEmail: user?.email
      };

      await crmApi.call('saveCustomer', payload);
      showSuccess(`Customer "${formData.FullName}" saved successfully!`);
      if (activeDraftKey) {
        try {
          const localDrafts = JSON.parse(localStorage.getItem('sr_crm_customer_drafts') || '[]');
          const filtered = localDrafts.filter(d => d.DraftKey !== activeDraftKey);
          localStorage.setItem('sr_crm_customer_drafts', JSON.stringify(filtered));
        } catch (e) {}
      }
      setIsModalOpen(false);
      setActiveDraftKey(null);
      await loadCustomers();
      await loadDrafts();
    } catch (err) {
      showError(err.message || 'Failed to save customer');
    } finally {
      setSaving(false);
    }
  };

  // ================= DRAFTS RESUME & DELETE =================
  const handleResumeDraft = (draft) => {
    setIsDraftsModalOpen(false);
    const dData = draft.DraftData || {};
    setActiveDraftKey(draft.DraftKey);
    currentDraftKeyRef.current = draft.DraftKey;
    draftQueueRef.current = [];
    setBgDraftStatus(null);
    setEditingCustomer(null);
    setCurrentStep(1); // per user instruction: resume starts at 1st step prefilled, review & go next
    setValidationErrors({});
    setFormData({
      ...initialFormState,
      ...dData,
      banks: Array.isArray(dData.banks) && dData.banks.length > 0 ? dData.banks : [defaultBank()],
      nominees: Array.isArray(dData.nominees) && dData.nominees.length > 0 ? dData.nominees : [defaultNominee(0)]
    });
    setIsModalOpen(true);
  };

  // Multi-select & Batch Delete Drafts Handlers
  const toggleSelectAllDrafts = () => {
    if (drafts.length === 0) return;
    if (selectedDraftKeys.length === drafts.length) {
      setSelectedDraftKeys([]);
    } else {
      setSelectedDraftKeys(drafts.map(d => d.DraftKey).filter(Boolean));
    }
  };

  const toggleSelectDraft = (draftKey) => {
    if (!draftKey) return;
    setSelectedDraftKeys(prev => 
      prev.includes(draftKey) 
        ? prev.filter(k => k !== draftKey) 
        : [...prev, draftKey]
    );
  };

  const handleDeleteSelectedDrafts = async () => {
    if (selectedDraftKeys.length === 0) return;
    const count = selectedDraftKeys.length;
    const confirmed = await showConfirm(
      'Delete Selected Drafts?',
      `Are you sure you want to delete ${count} selected draft${count === 1 ? '' : 's'}? This action cannot be undone.`
    );
    if (!confirmed) return;
    try {
      // 1. Delete in parallel from backend
      await Promise.allSettled(
        selectedDraftKeys.map(key => 
          crmApi.call('deleteCustomerDraft', { draftKey: key, userEmail: user?.email }).catch(() => {})
        )
      );

      // 2. Remove from local storage mirror
      try {
        const localDrafts = JSON.parse(localStorage.getItem('sr_crm_customer_drafts') || '[]');
        const keySet = new Set(selectedDraftKeys);
        const filtered = localDrafts.filter(d => !keySet.has(d.DraftKey));
        localStorage.setItem('sr_crm_customer_drafts', JSON.stringify(filtered));
      } catch (e) {}

      showSuccess('Drafts Deleted', `${count} customer draft${count === 1 ? '' : 's'} deleted successfully.`);
      setSelectedDraftKeys([]);
      await loadDrafts();
    } catch (err) {
      showError('Failed', err.message || 'Could not delete selected drafts');
    }
  };

  const handleDelete = async (id, name) => {
    const confirmed = await showConfirm(
      'Delete Investor?',
      `Are you sure you want to delete investor "${name}"? Records are preserved in the deleted archive.`
    );
    if (!confirmed) return;
    try {
      await crmApi.call('deleteCustomer', { customerId: id, userEmail: user?.email });
      await loadCustomers();
      showSuccess(`Investor "${name}" deleted.`);
    } catch (err) {
      showError(err.message || 'Failed to delete customer');
    }
  };

  const handleRestore = async (id, name) => {
    const confirmed = await showConfirm(
      'Restore Investor?',
      `Restore deleted investor "${name}" to active status?`
    );
    if (!confirmed) return;
    try {
      await crmApi.call('restoreCustomer', { customerId: id, userEmail: user?.email });
      await loadCustomers();
      showSuccess(`Investor "${name}" restored.`);
    } catch (err) {
      showError(err.message || 'Failed to restore customer');
    }
  };

  const stepsMeta = [
    { num: 1, label: 'Basic' },
    { num: 2, label: 'KYC' },
    { num: 3, label: 'Address' },
    { num: 4, label: 'System' },
    { num: 5, label: 'Bank' },
    { num: 6, label: getNomineeStepLabel() },
    { num: 7, label: 'Docs' }
  ];

  return (
    <div className="crm-page-container">
      <Header title="Customers & Investors" onOpenBackup={onOpenBackup} />

      <div className="crm-page-content" style={{ padding: '1.5rem 2rem' }}>
        {/* Top Control Bar */}
        <div className="crm-card" style={{ padding: '1.25rem', marginBottom: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', flex: 1, minWidth: '280px', maxWidth: '520px' }}>
              <div style={{ position: 'relative', flex: 1 }}>
                <Search size={16} color="#94a3b8" style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)' }} />
                <input
                  type="text"
                  className="form-input"
                  placeholder="Search by Name, Code, PAN, Email, Mobile, City..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  style={{ paddingLeft: '2.5rem', height: '42px', borderRadius: '8px' }}
                />
              </div>

              <select
                className="form-select"
                value={kycFilter}
                onChange={(e) => setKycFilter(e.target.value)}
                style={{ width: 'auto', minWidth: '150px', height: '42px', borderRadius: '8px' }}
              >
                <option value="">All KYC Status</option>
                <option value="VERIFIED">Verified</option>
                <option value="PENDING">Pending</option>
                <option value="REJECTED">Rejected</option>
              </select>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
              {/* Drafts Button - Visible ONLY when draftCount > 0 per requirement */}
              {draftCount > 0 && (
                <button
                  type="button"
                  onClick={() => setIsDraftsModalOpen(true)}
                  className="btn btn-secondary"
                  style={{
                    backgroundColor: '#fef3c7',
                    borderColor: '#fde68a',
                    color: '#b45309',
                    fontWeight: '700',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.4rem',
                    height: '42px',
                    padding: '0 1rem',
                    borderRadius: '8px'
                  }}
                >
                  <Bookmark size={15} color="#b45309" />
                  <span>Drafts ({draftCount})</span>
                </button>
              )}

              {hasPermission('Customers', 'CanCreate') && (
                <button
                  type="button"
                  onClick={openAddModal}
                  className="btn btn-primary"
                  style={{
                    height: '42px',
                    padding: '0 1.25rem',
                    borderRadius: '8px',
                    fontWeight: '700',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.4rem'
                  }}
                >
                  <Plus size={16} />
                  <span>Add Customer</span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Customer Data Table */}
        <div className="crm-card" style={{ padding: '0', overflow: 'hidden' }}>
          <div className="table-responsive">
            <table className="crm-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr>
                  <th style={{ padding: '0.75rem 1.25rem' }}>Investor Info</th>
                  <th style={{ padding: '0.75rem 1rem' }}>Contact Details</th>
                  <th style={{ padding: '0.75rem 1rem' }}>PAN & Aadhaar</th>
                  <th style={{ padding: '0.75rem 1rem' }}>Location</th>
                  <th style={{ padding: '0.75rem 1rem' }}>System IDs</th>
                  <th style={{ padding: '0.75rem 1rem' }}>KYC Status</th>
                  <th style={{ padding: '0.75rem 1.25rem', textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={7} style={{ padding: '3rem', textAlign: 'center', color: '#64748b' }}>
                      <RefreshCw size={24} className="spin-animation" style={{ margin: '0 auto 0.5rem', color: '#3b82f6' }} />
                      <p style={{ margin: 0, fontWeight: '500' }}>Loading investors...</p>
                    </td>
                  </tr>
                ) : customers.length === 0 ? (
                  <tr>
                    <td colSpan={7} style={{ padding: '3rem', textAlign: 'center', color: '#64748b' }}>
                      <p style={{ margin: 0, fontWeight: '600' }}>No investors found matching the criteria.</p>
                    </td>
                  </tr>
                ) : (
                  customers.slice(0, visibleCount).map((cust) => (
                    <tr 
                      key={cust.CustomerId || cust.CustomerCode}
                      style={{
                        backgroundColor: cust.IsDeleted ? '#fff5f5' : 'transparent',
                        opacity: cust.IsDeleted ? 0.75 : 1
                      }}
                    >
                      <td style={{ padding: '0.85rem 1.25rem' }}>
                        <div style={{ fontWeight: '700', color: '#1e293b', fontSize: '0.875rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                          <span>{cust.FullName || `${cust.FirstName || ''} ${cust.LastName || ''}`}</span>
                          {cust.IsDeleted && (
                            <span style={{ fontSize: '0.675rem', backgroundColor: '#fee2e2', color: '#dc2626', padding: '1px 6px', borderRadius: '4px', fontWeight: '700' }}>
                              Deleted
                            </span>
                          )}
                        </div>
                        <div style={{ fontSize: '0.75rem', fontFamily: 'monospace', color: '#64748b', marginTop: '2px' }}>
                          Code: {cust.CustomerCode || '-'} {cust.Title ? `(${cust.Title})` : ''}
                        </div>
                      </td>

                      <td style={{ padding: '0.85rem 1rem' }}>
                        <div style={{ color: '#1e293b', fontWeight: '600', fontSize: '0.825rem' }}>{cust.Mobile || '-'}</div>
                        <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{cust.Email || '-'}</div>
                      </td>

                      <td style={{ padding: '0.85rem 1rem' }}>
                        <div style={{ fontFamily: 'monospace', fontSize: '0.8rem', color: '#1e293b', fontWeight: '600' }}>PAN: {cust.PanNumber || '-'}</div>
                        <div style={{ fontFamily: 'monospace', fontSize: '0.75rem', color: '#64748b' }}>UID: {cust.AadharNo || cust.AadhaarLast4 || '-'}</div>
                      </td>

                      <td style={{ padding: '0.85rem 1rem' }}>
                        <div style={{ color: '#1e293b', fontSize: '0.825rem' }}>{cust.City || '-'}, {cust.State || '-'}</div>
                        <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{cust.Pincode || ''} {cust.Area ? `(${cust.Area})` : ''}</div>
                      </td>

                      <td style={{ padding: '0.85rem 1rem' }}>
                        <div style={{ fontSize: '0.75rem', fontFamily: 'monospace', color: '#1e293b' }}>BSE: {cust.BseUcc || '-'}</div>
                        <div style={{ fontSize: '0.725rem', fontFamily: 'monospace', color: '#64748b' }}>SK: {cust.SkCustId || cust.SkClientId || '-'}</div>
                      </td>

                      <td style={{ padding: '0.85rem 1rem' }}>
                        <span className={`badge ${
                          String(cust.KycStatus).toUpperCase() === 'VERIFIED' ? 'badge-success' :
                          String(cust.KycStatus).toUpperCase() === 'REJECTED' ? 'badge-danger' :
                          'badge-warning'
                        }`}>
                          {cust.KycStatus || 'PENDING'}
                        </span>
                      </td>

                      <td style={{ padding: '0.85rem 1.25rem', textAlign: 'right' }}>
                        <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'flex-end', gap: '0.4rem' }}>
                          {hasPermission('Customers', 'CanEdit') && !cust.IsDeleted && (
                            <button
                              type="button"
                              className="btn btn-neutral"
                              onClick={() => openEditModal(cust)}
                              title="Edit Customer"
                              style={{ padding: '6px', color: '#2563eb' }}
                            >
                              <Edit2 size={15} />
                            </button>
                          )}

                          {hasPermission('Customers', 'CanDelete') && !cust.IsDeleted && (
                            <button
                              type="button"
                              className="btn btn-neutral"
                              onClick={() => handleDelete(cust.CustomerId, cust.FullName)}
                              title="Delete Customer"
                              style={{ padding: '6px', color: '#ef4444' }}
                            >
                              <Trash2 size={15} />
                            </button>
                          )}

                          {cust.IsDeleted && (
                            <button
                              type="button"
                              className="btn btn-neutral"
                              onClick={() => handleRestore(cust.CustomerId, cust.FullName)}
                              title="Restore Customer"
                              style={{ padding: '4px 8px', fontSize: '0.75rem', color: '#059669', display: 'flex', alignItems: 'center', gap: '0.25rem' }}
                            >
                              <RotateCcw size={13} />
                              <span>Restore</span>
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          {/* Intersection Observer Sentinel for Progressive Loading */}
          <div ref={sentinelRef} style={{ height: '16px' }} />
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 7-STEP CUSTOMER REGISTRATION / EDIT MODAL                                 */}
      {/* ========================================================================= */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        maxWidth="1140px"
        hideHeader={true}
      >
        <div style={{
          backgroundColor: '#ffffff',
          borderRadius: '16px',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          height: '100%',
          maxHeight: '92vh',
          width: '100%'
        }}>
          {/* Custom Header with Primary Gradient & Background Draft Status (Fixed Top) */}
          <div style={{
            background: 'linear-gradient(135deg, #1d4ed8 0%, #2563eb 100%)',
            color: '#ffffff',
            padding: '1.25rem 2.25rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexShrink: 0,
            boxShadow: '0 2px 8px rgba(37, 99, 235, 0.25)',
            zIndex: 10
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
              <div style={{
                width: '42px',
                height: '42px',
                borderRadius: '12px',
                backgroundColor: 'rgba(255, 255, 255, 0.18)',
                backdropFilter: 'blur(8px)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#ffffff',
                border: '1px solid rgba(255, 255, 255, 0.25)',
                flexShrink: 0
              }}>
                {editingCustomer ? <Edit3 size={20} /> : <UserPlus size={20} />}
              </div>
              <div>
                <h2 style={{ margin: 0, fontSize: '1.25rem', fontWeight: '800', color: '#ffffff', letterSpacing: '-0.01em' }}>
                  {editingCustomer ? `Edit Customer: ${editingCustomer.FullName || editingCustomer.EmployeeCode}` : 'Add Customer'}
                </h2>
                <p style={{ margin: '0.15rem 0 0', fontSize: '0.825rem', color: '#dbeafe', fontWeight: '400' }}>
                  7-Step KYC, Bank, Nominee & Investor Registration Wizard
                </p>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
              {/* Asynchronous Background Draft Queue Pill (Top-Right End) */}
              {bgDraftStatus && (
                <div style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '5px 12px',
                  borderRadius: '999px',
                  fontSize: '0.785rem',
                  fontWeight: '600',
                  backgroundColor: bgDraftStatus.status === 'saving' 
                    ? 'rgba(255, 255, 255, 0.22)' 
                    : bgDraftStatus.status === 'saved' 
                      ? 'rgba(16, 185, 129, 0.35)' 
                      : 'rgba(239, 68, 68, 0.35)',
                  border: '1px solid rgba(255, 255, 255, 0.35)',
                  color: '#ffffff',
                  backdropFilter: 'blur(4px)',
                  transition: 'all 0.2s ease'
                }}>
                  {bgDraftStatus.status === 'saving' && (
                    <RefreshCw size={13} className="spin-animation" />
                  )}
                  {bgDraftStatus.status === 'saved' && (
                    <Check size={13} strokeWidth={3} />
                  )}
                  {bgDraftStatus.status === 'error' && (
                    <AlertCircle size={13} />
                  )}
                  <span>{bgDraftStatus.text}</span>
                </div>
              )}

              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                aria-label="Close modal"
                style={{
                  background: 'rgba(255, 255, 255, 0.15)',
                  border: '1px solid rgba(255, 255, 255, 0.25)',
                  color: '#ffffff',
                  width: '34px',
                  height: '34px',
                  borderRadius: '10px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease'
                }}
                onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.3)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.15)'; }}
              >
                <X size={18} />
              </button>
            </div>
          </div>

          {/* 7-Step Progress Wizard Stepper Bar with Forward Progress Line (Fixed) */}
          <div style={{
            backgroundColor: '#ffffff',
            borderBottom: '1px solid #e2e8f0',
            padding: '1.25rem 3.5rem',
            flexShrink: 0
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'relative' }}>
              {/* Connecting background line & dynamic forward progress fill */}
              <div style={{
                position: 'absolute',
                left: '26px',
                right: '26px',
                top: '19px',
                height: '3px',
                backgroundColor: '#f1f5f9',
                borderRadius: '2px',
                zIndex: 0
              }}>
                <div style={{
                  height: '100%',
                  width: `${((currentStep - 1) / 6) * 100}%`,
                  background: 'linear-gradient(90deg, #10b981 0%, #ea580c 100%)',
                  borderRadius: '2px',
                  transition: 'width 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
                }} />
              </div>

              {stepsMeta.map((s) => {
                const isActive = currentStep === s.num;
                const isPassed = currentStep > s.num;

                return (
                  <div 
                    key={s.num} 
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      position: 'relative',
                      zIndex: 1,
                      cursor: s.num <= currentStep ? 'pointer' : 'default',
                      userSelect: 'none'
                    }}
                    onClick={() => {
                      if (s.num <= currentStep) {
                        setCurrentStep(s.num);
                      }
                    }}
                  >
                    <div 
                      style={{
                        width: '38px',
                        height: '38px',
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontWeight: '700',
                        fontSize: '0.875rem',
                        transition: 'all 0.2s ease',
                        backgroundColor: isActive 
                          ? '#ea580c' 
                          : isPassed 
                            ? '#10b981' 
                            : '#f8fafc',
                        color: (isActive || isPassed) ? '#ffffff' : '#64748b',
                        border: (isActive || isPassed) ? 'none' : '1.5px solid #cbd5e1',
                        boxShadow: isActive 
                          ? '0 0 0 4px rgba(234, 88, 12, 0.18), 0 2px 4px rgba(234, 88, 12, 0.3)' 
                          : isPassed 
                            ? '0 2px 4px rgba(16, 185, 129, 0.2)' 
                            : 'none',
                        transform: isActive ? 'scale(1.08)' : 'scale(1)'
                      }}
                    >
                      {isPassed ? <Check size={16} strokeWidth={3} /> : s.num}
                    </div>
                    <span style={{
                      fontSize: '0.8rem',
                      marginTop: '6px',
                      fontWeight: isActive ? '700' : '500',
                      color: isActive ? '#ea580c' : isPassed ? '#10b981' : '#64748b',
                      transition: 'color 0.2s ease'
                    }}>
                      {s.label}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Step Body (Scrollable with Comfortable Padding & Red Validation Feedback) */}
          <div style={{
            padding: '1.75rem 2.5rem',
            flex: 1,
            minHeight: 0,
            overflowY: 'auto'
          }}>
            
            {/* ================= STEP 1: BASIC DETAILS ================= */}
            {currentStep === 1 && (
              <div className="space-y-4">
                <div style={{ borderBottom: '1px solid #e2e8f0', paddingBottom: '0.65rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Users size={18} color="#2563eb" />
                  <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: '700', color: '#0f172a' }}>Basic Details</h3>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                  <div>
                    {renderFieldLabel('Title', true)}
                    <select
                      value={formData.Title}
                      onChange={(e) => handleTitleChange(e.target.value)}
                      style={getInputStyle('Title')}
                    >
                      <option value="">--Select--</option>
                      <option value="Mr">Mr</option>
                      <option value="Mrs">Mrs</option>
                      <option value="Ms">Ms</option>
                      <option value="Minor">Minor</option>
                      <option value="HUF">HUF</option>
                    </select>
                    {renderFieldError('Title')}
                  </div>

                  <div>
                    {renderFieldLabel('First Name', true)}
                    <input
                      type="text"
                      placeholder="e.g. RAHUL"
                      value={formData.FirstName}
                      onChange={(e) => handleNamePartChange('FirstName', e.target.value.toUpperCase())}
                      style={getInputStyle('FirstName', { textTransform: 'uppercase' })}
                    />
                    {renderFieldError('FirstName')}
                  </div>

                  <div>
                    {renderFieldLabel('Middle Name', false)}
                    <input
                      type="text"
                      placeholder="e.g. PRAKASH"
                      value={formData.MiddleName}
                      onChange={(e) => handleNamePartChange('MiddleName', e.target.value.toUpperCase())}
                      style={getInputStyle('MiddleName', { textTransform: 'uppercase' })}
                    />
                  </div>

                  <div>
                    {renderFieldLabel('Last Name', true)}
                    <input
                      type="text"
                      placeholder="e.g. KUMAR"
                      value={formData.LastName}
                      onChange={(e) => handleNamePartChange('LastName', e.target.value.toUpperCase())}
                      style={getInputStyle('LastName', { textTransform: 'uppercase' })}
                    />
                    {renderFieldError('LastName')}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                  <div>
                    {renderFieldLabel('Gender', true)}
                    <select
                      value={formData.Gender}
                      onChange={(e) => setFormData({ ...formData, Gender: e.target.value })}
                      style={getInputStyle('Gender')}
                    >
                      <option value="">--Select--</option>
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                    </select>
                    {renderFieldError('Gender')}
                  </div>

                  <div>
                    {renderFieldLabel('Birth Date', true)}
                    <input
                      type="date"
                      value={formData.DateOfBirth}
                      onChange={(e) => setFormData({ ...formData, DateOfBirth: e.target.value })}
                      style={getInputStyle('DateOfBirth')}
                    />
                    {renderFieldError('DateOfBirth')}
                  </div>

                  <div>
                    {renderFieldLabel('Occupation', formData.Title !== 'Minor')}
                    <select
                      value={formData.Occupation}
                      onChange={(e) => setFormData({ ...formData, Occupation: e.target.value })}
                      style={getInputStyle('Occupation')}
                    >
                      <option value="">--Select--</option>
                      <option value="Business">Business</option>
                      <option value="Professional">Professional</option>
                      <option value="Service">Service</option>
                      <option value="Agriculture">Agriculture</option>
                      <option value="Housewife">Housewife</option>
                      <option value="Student">Student</option>
                      <option value="Retired">Retired</option>
                      <option value="Others">Others</option>
                    </select>
                    {renderFieldError('Occupation')}
                  </div>

                  <div>
                    {renderFieldLabel('Annual Income', formData.Title !== 'Minor')}
                    <select
                      value={formData.AnnualIncome}
                      onChange={(e) => setFormData({ ...formData, AnnualIncome: e.target.value })}
                      style={getInputStyle('AnnualIncome')}
                    >
                      <option value="">--Select--</option>
                      <option value="Below 1 Lakh">Below 1 Lakh</option>
                      <option value="1-5 Lakhs">1-5 Lakhs</option>
                      <option value="5-10 Lakhs">5-10 Lakhs</option>
                      <option value="10-25 Lakhs">10-25 Lakhs</option>
                      <option value="25 Lakhs - 1 Crore">25 Lakhs - 1 Crore</option>
                      <option value="Above 1 Crore">Above 1 Crore</option>
                    </select>
                    {renderFieldError('AnnualIncome')}
                  </div>
                </div>
              </div>
            )}

            {/* ================= STEP 2: CONTACT & KYC ================= */}
            {currentStep === 2 && (
              <div className="space-y-5">
                <div style={{ borderBottom: '1px solid #e2e8f0', paddingBottom: '0.65rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <ShieldCheck size={18} color="#2563eb" />
                  <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: '700', color: '#0f172a' }}>Contact & KYC Details</h3>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    {renderFieldLabel('Primary Mobile Number', true)}
                    <input
                      type="text"
                      maxLength={10}
                      placeholder="10-digit mobile number"
                      value={formData.Mobile}
                      onChange={(e) => setFormData({ ...formData, Mobile: e.target.value.replace(/\D/g, '') })}
                      style={getInputStyle('Mobile')}
                    />
                    {renderFieldError('Mobile')}
                  </div>

                  <div>
                    {renderFieldLabel('Email Address', true)}
                    <input
                      type="email"
                      placeholder="e.g. rahul@example.com"
                      value={formData.Email}
                      onChange={(e) => setFormData({ ...formData, Email: e.target.value.trim() })}
                      style={getInputStyle('Email')}
                    />
                    {renderFieldError('Email')}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    {renderFieldLabel('PAN Number', true)}
                    <input
                      type="text"
                      maxLength={10}
                      placeholder="e.g. ABCDE1234F"
                      value={formData.PanNumber}
                      onChange={(e) => setFormData({ ...formData, PanNumber: e.target.value.toUpperCase().trim() })}
                      style={getInputStyle('PanNumber', { textTransform: 'uppercase', fontFamily: 'monospace' })}
                    />
                    {renderFieldError('PanNumber')}
                  </div>

                  <div>
                    {renderFieldLabel('Aadhaar Number', true)}
                    <input
                      type="text"
                      maxLength={12}
                      placeholder="12-digit Aadhaar number"
                      value={formData.AadharNo}
                      onChange={(e) => setFormData({ ...formData, AadharNo: e.target.value.replace(/\D/g, '') })}
                      style={getInputStyle('AadharNo', { fontFamily: 'monospace' })}
                    />
                    {renderFieldError('AadharNo')}
                  </div>
                </div>
              </div>
            )}

            {/* ================= STEP 3: ADDRESS DETAILS ================= */}
            {currentStep === 3 && (
              <div className="space-y-5">
                <div style={{ borderBottom: '1px solid #e2e8f0', paddingBottom: '0.65rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Building size={18} color="#2563eb" />
                  <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: '700', color: '#0f172a' }}>Address Details</h3>
                </div>

                <div>
                  {renderFieldLabel('Full Residential Address', true)}
                  <textarea
                    rows={3}
                    placeholder="House/Flat No, Building Name, Street Address"
                    value={formData.Address}
                    onChange={(e) => setFormData({ ...formData, Address: e.target.value })}
                    style={getInputStyle('Address', { minHeight: '70px' })}
                  />
                  {renderFieldError('Address')}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    {renderFieldLabel('Postal Pincode', true)}
                    <input
                      type="text"
                      maxLength={6}
                      placeholder="6-digit Pincode (Auto-fills Area & City)"
                      value={formData.Pincode}
                      onChange={(e) => handlePincodeChange(e.target.value)}
                      style={getInputStyle('Pincode', { fontFamily: 'monospace' })}
                    />
                    {renderFieldError('Pincode')}
                  </div>

                  <div>
                    {renderFieldLabel('Area / Locality', true)}
                    <input
                      type="text"
                      placeholder="e.g. Vesu, Althan"
                      value={formData.Area}
                      onChange={(e) => setFormData({ ...formData, Area: e.target.value })}
                      style={getInputStyle('Area')}
                    />
                    {renderFieldError('Area')}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    {renderFieldLabel('City / District', true)}
                    <input
                      type="text"
                      placeholder="e.g. Surat"
                      value={formData.City}
                      onChange={(e) => setFormData({ ...formData, City: e.target.value })}
                      style={getInputStyle('City')}
                    />
                    {renderFieldError('City')}
                  </div>

                  <div>
                    {renderFieldLabel('State', true)}
                    <input
                      type="text"
                      placeholder="e.g. Gujarat"
                      value={formData.State}
                      onChange={(e) => setFormData({ ...formData, State: e.target.value })}
                      style={getInputStyle('State')}
                    />
                    {renderFieldError('State')}
                  </div>
                </div>
              </div>
            )}

            {/* ================= STEP 4: SYSTEM DETAILS ================= */}
            {currentStep === 4 && (
              <div className="space-y-5">
                <div style={{ borderBottom: '1px solid #e2e8f0', paddingBottom: '0.65rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <FileText size={18} color="#2563eb" />
                  <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: '700', color: '#0f172a' }}>System & Integration IDs</h3>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    {renderFieldLabel('BSE UCC', false)}
                    <input
                      type="text"
                      maxLength={15}
                      placeholder="BSE UCC (Max 15 Alphanumeric)"
                      value={formData.BseUcc}
                      onChange={(e) => setFormData({ ...formData, BseUcc: e.target.value.toUpperCase().trim() })}
                      style={getInputStyle('BseUcc', { textTransform: 'uppercase' })}
                    />
                    {renderFieldError('BseUcc')}
                  </div>

                  <div>
                    {renderFieldLabel('SK CUSTID', false)}
                    <input
                      type="text"
                      placeholder="SK CustId (Numeric)"
                      value={formData.SkCustId}
                      onChange={(e) => setFormData({ ...formData, SkCustId: e.target.value.replace(/\D/g, '') })}
                      style={getInputStyle('SkCustId')}
                    />
                    {renderFieldError('SkCustId')}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    {renderFieldLabel('SK DP ID', false)}
                    <input
                      type="text"
                      placeholder="SK DP ID (Alphanumeric)"
                      value={formData.SkDpId}
                      onChange={(e) => setFormData({ ...formData, SkDpId: e.target.value.toUpperCase().trim() })}
                      style={getInputStyle('SkDpId', { textTransform: 'uppercase' })}
                    />
                  </div>

                  <div>
                    {renderFieldLabel('SK CLIENT ID', false)}
                    <input
                      type="text"
                      placeholder="SK Client ID (Alphanumeric)"
                      value={formData.SkClientId}
                      onChange={(e) => setFormData({ ...formData, SkClientId: e.target.value.toUpperCase().trim() })}
                      style={getInputStyle('SkClientId', { textTransform: 'uppercase' })}
                    />
                  </div>
                </div>

                <div>
                  {renderFieldLabel('Customer Code / Unique ID', true)}
                  <input
                    type="text"
                    placeholder="Customer Code or SR Unique ID"
                    value={formData.CustomerCode || formData.SR_UniqueId}
                    onChange={(e) => {
                      setIsCodeManual(true);
                      setFormData({ 
                        ...formData, 
                        CustomerCode: e.target.value.toUpperCase().trim(),
                        SR_UniqueId: e.target.value.toUpperCase().trim()
                      });
                    }}
                    style={getInputStyle('SR_UniqueId', { textTransform: 'uppercase', fontFamily: 'monospace' })}
                  />
                  {renderFieldError('SR_UniqueId')}
                </div>
              </div>
            )}

            {/* ================= STEP 5: BANK DETAILS (Customer_Bank Sheet) ================= */}
            {currentStep === 5 && (
              <div className="space-y-5">
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid #e2e8f0', paddingBottom: '0.65rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                    <CreditCard size={18} color="#2563eb" />
                    <div>
                      <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: '700', color: '#0f172a' }}>
                        Bank Accounts
                      </h3>
                      <span style={{ fontSize: '0.785rem', color: '#64748b' }}>Max 3 bank accounts allowed</span>
                    </div>
                  </div>

                  {formData.banks.length < 3 && (
                    <button
                      type="button"
                      onClick={addBankRow}
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px',
                        padding: '0.45rem 0.95rem',
                        fontSize: '0.8rem',
                        fontWeight: '600',
                        borderRadius: '8px',
                        backgroundColor: '#10b981',
                        color: '#ffffff',
                        border: 'none',
                        cursor: 'pointer',
                        boxShadow: '0 1px 3px rgba(16, 185, 129, 0.25)',
                        transition: 'background-color 0.15s ease'
                      }}
                      onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#059669'; }}
                      onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = '#10b981'; }}
                    >
                      <Plus size={15} />
                      <span>Add Bank</span>
                    </button>
                  )}
                </div>

                {formData.banks.map((b, idx) => (
                  <div key={idx} style={{
                    backgroundColor: '#f8fafc',
                    padding: '1.25rem 1.5rem',
                    borderRadius: '12px',
                    border: '1px solid #e2e8f0',
                    marginBottom: '1rem',
                    boxShadow: '0 1px 2px rgba(0, 0, 0, 0.03)'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.85rem' }}>
                      <span style={{ fontSize: '0.825rem', fontWeight: '700', color: '#1e293b', textTransform: 'uppercase', letterSpacing: '0.025em' }}>
                        Bank Account #{idx + 1} {idx === 0 && <span style={{ color: '#059669', fontWeight: '600' }}>(Primary Mandate)</span>}
                      </span>
                      {idx > 0 && (
                        <button
                          type="button"
                          onClick={() => removeBankRow(idx)}
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px',
                            color: '#dc2626',
                            background: '#fee2e2',
                            border: '1px solid #fecaca',
                            padding: '0.25rem 0.65rem',
                            borderRadius: '6px',
                            fontSize: '0.75rem',
                            fontWeight: '600',
                            cursor: 'pointer',
                            transition: 'all 0.15s ease'
                          }}
                          onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#fca5a5'; }}
                          onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = '#fee2e2'; }}
                        >
                          <Trash2 size={13} />
                          <span>Remove</span>
                        </button>
                      )}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div>
                        {renderFieldLabel('IFSC Code', true)}
                        <input
                          type="text"
                          maxLength={11}
                          placeholder="e.g. SBIN0001234"
                          value={b.IfscCode}
                          onChange={(e) => handleIfscChange(idx, e.target.value)}
                          style={getInputStyle(`bank_${idx}_IfscCode`, { textTransform: 'uppercase', fontFamily: 'monospace' })}
                        />
                        {renderFieldError(`bank_${idx}_IfscCode`)}
                      </div>

                      <div>
                        {renderFieldLabel('Bank Name', true)}
                        <input
                          type="text"
                          placeholder="State Bank of India"
                          value={b.BankName}
                          onChange={(e) => {
                            const nb = [...formData.banks];
                            nb[idx].BankName = e.target.value;
                            setFormData({ ...formData, banks: nb });
                          }}
                          style={getInputStyle(`bank_${idx}_BankName`)}
                        />
                        {renderFieldError(`bank_${idx}_BankName`)}
                      </div>

                      <div>
                        {renderFieldLabel('A/C Number', true)}
                        <input
                          type="text"
                          placeholder="Bank Account Number"
                          value={b.AccountNumber}
                          onChange={(e) => {
                            const nb = [...formData.banks];
                            nb[idx].AccountNumber = e.target.value.trim();
                            setFormData({ ...formData, banks: nb });
                          }}
                          style={getInputStyle(`bank_${idx}_AccountNumber`, { fontFamily: 'monospace' })}
                        />
                        {renderFieldError(`bank_${idx}_AccountNumber`)}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4" style={{ marginTop: '0.85rem' }}>
                      <div>
                        {renderFieldLabel('Account Type', true)}
                        <select
                          value={b.AccountType}
                          onChange={(e) => {
                            const nb = [...formData.banks];
                            nb[idx].AccountType = e.target.value;
                            setFormData({ ...formData, banks: nb });
                          }}
                          style={getInputStyle(`bank_${idx}_AccountType`)}
                        >
                          <option value="Saving">Saving</option>
                          <option value="Current">Current</option>
                          <option value="NRE">NRE</option>
                          <option value="NRO">NRO</option>
                        </select>
                        {renderFieldError(`bank_${idx}_AccountType`)}
                      </div>

                      <div>
                        {renderFieldLabel('MICR Code', false)}
                        <input
                          type="text"
                          maxLength={9}
                          placeholder="9-digit MICR (Optional)"
                          value={b.MicrCode}
                          onChange={(e) => {
                            const nb = [...formData.banks];
                            nb[idx].MicrCode = e.target.value.replace(/\D/g, '');
                            setFormData({ ...formData, banks: nb });
                          }}
                          style={getInputStyle(`bank_${idx}_MicrCode`, { fontFamily: 'monospace' })}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* ================= STEP 6: NOMINEE DETAILS (Customer_Nominee Sheet) ================= */}
            {currentStep === 6 && (
              <div className="space-y-5">
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid #e2e8f0', paddingBottom: '0.65rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                    <UserCheck size={18} color="#2563eb" />
                    <div>
                      <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: '700', color: '#0f172a' }}>
                        {getNomineeStepLabel()} Details
                      </h3>
                      <span style={{ fontSize: '0.785rem', color: '#64748b' }}>
                        Max {getMaxNominees()} allowed, Total share must equal 100%
                      </span>
                    </div>
                  </div>

                  {formData.nominees.length < getMaxNominees() && (
                    <button
                      type="button"
                      onClick={addNomineeRow}
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px',
                        padding: '0.45rem 0.95rem',
                        fontSize: '0.8rem',
                        fontWeight: '600',
                        borderRadius: '8px',
                        backgroundColor: '#10b981',
                        color: '#ffffff',
                        border: 'none',
                        cursor: 'pointer',
                        boxShadow: '0 1px 3px rgba(16, 185, 129, 0.25)',
                        transition: 'background-color 0.15s ease'
                      }}
                      onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#059669'; }}
                      onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = '#10b981'; }}
                    >
                      <Plus size={15} />
                      <span>Add {getNomineeStepLabel()}</span>
                    </button>
                  )}
                </div>

                {validationErrors.NomineeTotalShare && (
                  <div style={{
                    padding: '0.75rem 1rem',
                    backgroundColor: '#fef2f2',
                    border: '1px solid #fecaca',
                    color: '#b91c1c',
                    fontSize: '0.8rem',
                    borderRadius: '8px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}>
                    <AlertCircle size={16} />
                    <span>{validationErrors.NomineeTotalShare}</span>
                  </div>
                )}

                {formData.nominees.map((n, idx) => (
                  <div key={idx} style={{
                    backgroundColor: '#f8fafc',
                    padding: '1.25rem 1.5rem',
                    borderRadius: '12px',
                    border: '1px solid #e2e8f0',
                    marginBottom: '1rem',
                    boxShadow: '0 1px 2px rgba(0, 0, 0, 0.03)'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.85rem' }}>
                      <span style={{ fontSize: '0.825rem', fontWeight: '700', color: '#1e293b', textTransform: 'uppercase', letterSpacing: '0.025em' }}>
                        {getNomineeStepLabel()} #{idx + 1}
                      </span>
                      {idx > 0 && (
                        <button
                          type="button"
                          onClick={() => removeNomineeRow(idx)}
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px',
                            color: '#dc2626',
                            background: '#fee2e2',
                            border: '1px solid #fecaca',
                            padding: '0.25rem 0.65rem',
                            borderRadius: '6px',
                            fontSize: '0.75rem',
                            fontWeight: '600',
                            cursor: 'pointer',
                            transition: 'all 0.15s ease'
                          }}
                          onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#fca5a5'; }}
                          onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = '#fee2e2'; }}
                        >
                          <Trash2 size={13} />
                          <span>Remove</span>
                        </button>
                      )}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div>
                        {renderFieldLabel(`${getNomineeStepLabel()} Name`, true)}
                        <input
                          type="text"
                          placeholder="Full Name of Nominee"
                          value={n.NomineeName}
                          onChange={(e) => {
                            const nn = [...formData.nominees];
                            nn[idx].NomineeName = e.target.value.toUpperCase();
                            setFormData({ ...formData, nominees: nn });
                          }}
                          style={getInputStyle(`nominee_${idx}_NomineeName`, { textTransform: 'uppercase' })}
                        />
                        {renderFieldError(`nominee_${idx}_NomineeName`)}
                      </div>

                      <div>
                        {renderFieldLabel('Relation', true)}
                        <select
                          value={n.Relation}
                          onChange={(e) => {
                            const nn = [...formData.nominees];
                            nn[idx].Relation = e.target.value;
                            setFormData({ ...formData, nominees: nn });
                          }}
                          style={getInputStyle(`nominee_${idx}_Relation`)}
                        >
                          <option value="">--Select--</option>
                          <option value="Father">Father</option>
                          <option value="Mother">Mother</option>
                          <option value="Spouse">Spouse</option>
                          <option value="Son">Son</option>
                          <option value="Daughter">Daughter</option>
                          <option value="Brother">Brother</option>
                          <option value="Sister">Sister</option>
                          <option value="Guardian">Guardian</option>
                          <option value="Other">Other</option>
                        </select>
                        {renderFieldError(`nominee_${idx}_Relation`)}
                      </div>

                      {n.Relation === 'Other' && (
                        <div>
                          {renderFieldLabel('Specify Relation', true)}
                          <input
                            type="text"
                            placeholder="Specify relation"
                            value={n.RelationOther}
                            onChange={(e) => {
                              const nn = [...formData.nominees];
                              nn[idx].RelationOther = e.target.value;
                              setFormData({ ...formData, nominees: nn });
                            }}
                            style={getInputStyle(`nominee_${idx}_RelationOther`)}
                          />
                          {renderFieldError(`nominee_${idx}_RelationOther`)}
                        </div>
                      )}

                      <div>
                        {renderFieldLabel('DOB', true)}
                        <input
                          type="date"
                          value={n.DateOfBirth}
                          onChange={(e) => {
                            const nn = [...formData.nominees];
                            nn[idx].DateOfBirth = e.target.value;
                            setFormData({ ...formData, nominees: nn });
                          }}
                          style={getInputStyle(`nominee_${idx}_DateOfBirth`)}
                        />
                        {renderFieldError(`nominee_${idx}_DateOfBirth`)}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4" style={{ marginTop: '0.85rem' }}>
                      <div>
                        {renderFieldLabel('Occupation', true)}
                        <select
                          value={n.Occupation}
                          onChange={(e) => {
                            const nn = [...formData.nominees];
                            nn[idx].Occupation = e.target.value;
                            setFormData({ ...formData, nominees: nn });
                          }}
                          style={getInputStyle(`nominee_${idx}_Occupation`)}
                        >
                          <option value="">--Select--</option>
                          <option value="Business">Business</option>
                          <option value="Service">Service</option>
                          <option value="Professional">Professional</option>
                          <option value="Agriculture">Agriculture</option>
                          <option value="Housewife">Housewife</option>
                          <option value="Student">Student</option>
                          <option value="Retired">Retired</option>
                          <option value="Other">Other</option>
                        </select>
                        {renderFieldError(`nominee_${idx}_Occupation`)}
                      </div>

                      <div>
                        {renderFieldLabel('ID Proof Type', true)}
                        <select
                          value={n.IdProofType}
                          onChange={(e) => {
                            const nn = [...formData.nominees];
                            nn[idx].IdProofType = e.target.value;
                            setFormData({ ...formData, nominees: nn });
                          }}
                          style={getInputStyle(`nominee_${idx}_IdProofType`)}
                        >
                          <option value="">--Select--</option>
                          <option value="PAN">PAN</option>
                          <option value="Aadhaar">Aadhaar</option>
                          <option value="Driving License">Driving License</option>
                          <option value="Passport">Passport</option>
                          <option value="Voter ID">Voter ID</option>
                          <option value="Other">Other</option>
                        </select>
                        {renderFieldError(`nominee_${idx}_IdProofType`)}
                      </div>

                      <div>
                        {renderFieldLabel('Document No', true)}
                        <input
                          type="text"
                          placeholder="ID Document Number"
                          value={n.DocumentNo}
                          onChange={(e) => {
                            const nn = [...formData.nominees];
                            nn[idx].DocumentNo = e.target.value.toUpperCase().trim();
                            setFormData({ ...formData, nominees: nn });
                          }}
                          style={getInputStyle(`nominee_${idx}_DocumentNo`, { textTransform: 'uppercase' })}
                        />
                        {renderFieldError(`nominee_${idx}_DocumentNo`)}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-4 gap-4" style={{ marginTop: '0.85rem' }}>
                      <div>
                        {renderFieldLabel('Mobile', false)}
                        <input
                          type="text"
                          maxLength={10}
                          placeholder="10-digit mobile"
                          value={n.Mobile}
                          onChange={(e) => {
                            const nn = [...formData.nominees];
                            nn[idx].Mobile = e.target.value.replace(/\D/g, '');
                            setFormData({ ...formData, nominees: nn });
                          }}
                          style={getInputStyle(`nominee_${idx}_Mobile`)}
                        />
                      </div>

                      <div>
                        {renderFieldLabel('Email', false)}
                        <input
                          type="email"
                          placeholder="Email address"
                          value={n.Email}
                          onChange={(e) => {
                            const nn = [...formData.nominees];
                            nn[idx].Email = e.target.value.trim();
                            setFormData({ ...formData, nominees: nn });
                          }}
                          style={getInputStyle(`nominee_${idx}_Email`)}
                        />
                      </div>

                      <div>
                        {renderFieldLabel('Address', false)}
                        <input
                          type="text"
                          placeholder="Nominee address"
                          value={n.Address}
                          onChange={(e) => {
                            const nn = [...formData.nominees];
                            nn[idx].Address = e.target.value;
                            setFormData({ ...formData, nominees: nn });
                          }}
                          style={getInputStyle(`nominee_${idx}_Address`)}
                        />
                      </div>

                      <div>
                        {renderFieldLabel('Share %', true)}
                        <input
                          type="number"
                          min={1}
                          max={100}
                          placeholder="100"
                          value={n.SharePercentage}
                          onChange={(e) => {
                            const nn = [...formData.nominees];
                            nn[idx].SharePercentage = e.target.value;
                            setFormData({ ...formData, nominees: nn });
                          }}
                          style={getInputStyle(`nominee_${idx}_SharePercentage`, { fontWeight: '700', color: '#1d4ed8' })}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* ================= STEP 7: DOCUMENTS UPLOAD ================= */}
            {currentStep === 7 && (
              <div className="space-y-5">
                <div style={{ borderBottom: '1px solid #e2e8f0', paddingBottom: '0.65rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <FileCheck size={18} color="#2563eb" />
                  <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: '700', color: '#0f172a' }}>Required Documents Upload</h3>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* PAN Card */}
                  <div style={{
                    padding: '1.15rem',
                    backgroundColor: '#f8fafc',
                    border: validationErrors.PanDoc ? '1.5px solid #ef4444' : '1px solid #e2e8f0',
                    borderRadius: '12px'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.65rem' }}>
                      {renderFieldLabel('PAN Card', true)}
                      {formData.PanDocUrl && (
                        <button
                          type="button"
                          onClick={() => removeFile('PanDoc')}
                          style={{ color: '#dc2626', background: 'none', border: 'none', fontSize: '0.75rem', cursor: 'pointer', fontWeight: '600' }}
                        >
                          Remove
                        </button>
                      )}
                    </div>
                    {formData.PanDocUrl ? (
                      <div style={{ height: '115px', backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                        <img src={formData.PanDocUrl} alt="PAN Preview" style={{ maxHeight: '100%', maxWidth: '100%', objectFit: 'contain' }} />
                      </div>
                    ) : (
                      <label style={{
                        height: '115px',
                        border: '2px dashed #cbd5e1',
                        borderRadius: '8px',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer',
                        backgroundColor: '#ffffff',
                        transition: 'border-color 0.15s ease'
                      }}>
                        <Upload size={22} color="#94a3b8" style={{ marginBottom: '6px' }} />
                        <span style={{ fontSize: '0.8rem', color: '#475569', fontWeight: '500' }}>Upload PAN (JPG/PNG/PDF)</span>
                        <input type="file" accept="image/*,application/pdf" style={{ display: 'none' }} onChange={(e) => handleFileUpload('PanDoc', e)} />
                      </label>
                    )}
                    {renderFieldError('PanDoc')}
                  </div>

                  {/* Aadhaar Card */}
                  <div style={{
                    padding: '1.15rem',
                    backgroundColor: '#f8fafc',
                    border: validationErrors.AadharDoc ? '1.5px solid #ef4444' : '1px solid #e2e8f0',
                    borderRadius: '12px'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.65rem' }}>
                      {renderFieldLabel('Aadhaar Card', true)}
                      {formData.AadharDocUrl && (
                        <button
                          type="button"
                          onClick={() => removeFile('AadharDoc')}
                          style={{ color: '#dc2626', background: 'none', border: 'none', fontSize: '0.75rem', cursor: 'pointer', fontWeight: '600' }}
                        >
                          Remove
                        </button>
                      )}
                    </div>
                    {formData.AadharDocUrl ? (
                      <div style={{ height: '115px', backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                        <img src={formData.AadharDocUrl} alt="Aadhaar Preview" style={{ maxHeight: '100%', maxWidth: '100%', objectFit: 'contain' }} />
                      </div>
                    ) : (
                      <label style={{
                        height: '115px',
                        border: '2px dashed #cbd5e1',
                        borderRadius: '8px',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer',
                        backgroundColor: '#ffffff',
                        transition: 'border-color 0.15s ease'
                      }}>
                        <Upload size={22} color="#94a3b8" style={{ marginBottom: '6px' }} />
                        <span style={{ fontSize: '0.8rem', color: '#475569', fontWeight: '500' }}>Upload Aadhaar Copy</span>
                        <input type="file" accept="image/*,application/pdf" style={{ display: 'none' }} onChange={(e) => handleFileUpload('AadharDoc', e)} />
                      </label>
                    )}
                    {renderFieldError('AadharDoc')}
                  </div>

                  {/* Bank Cheque */}
                  <div style={{
                    padding: '1.15rem',
                    backgroundColor: '#f8fafc',
                    border: '1px solid #e2e8f0',
                    borderRadius: '12px'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.65rem' }}>
                      {renderFieldLabel('Bank Cheque / Passbook', false)}
                      {formData.BankChequeDocUrl && (
                        <button
                          type="button"
                          onClick={() => removeFile('BankChequeDoc')}
                          style={{ color: '#dc2626', background: 'none', border: 'none', fontSize: '0.75rem', cursor: 'pointer', fontWeight: '600' }}
                        >
                          Remove
                        </button>
                      )}
                    </div>
                    {formData.BankChequeDocUrl ? (
                      <div style={{ height: '115px', backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                        <img src={formData.BankChequeDocUrl} alt="Cheque Preview" style={{ maxHeight: '100%', maxWidth: '100%', objectFit: 'contain' }} />
                      </div>
                    ) : (
                      <label style={{
                        height: '115px',
                        border: '2px dashed #cbd5e1',
                        borderRadius: '8px',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer',
                        backgroundColor: '#ffffff',
                        transition: 'border-color 0.15s ease'
                      }}>
                        <Upload size={22} color="#94a3b8" style={{ marginBottom: '6px' }} />
                        <span style={{ fontSize: '0.8rem', color: '#475569', fontWeight: '500' }}>Cancelled Cheque (Optional)</span>
                        <input type="file" accept="image/*,application/pdf" style={{ display: 'none' }} onChange={(e) => handleFileUpload('BankChequeDoc', e)} />
                      </label>
                    )}
                  </div>

                  {/* Nominee Proof */}
                  <div style={{
                    padding: '1.15rem',
                    backgroundColor: '#f8fafc',
                    border: validationErrors.NomineeProofDoc ? '1.5px solid #ef4444' : '1px solid #e2e8f0',
                    borderRadius: '12px'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.65rem' }}>
                      {renderFieldLabel('Nominee ID Proof', true)}
                      {formData.NomineeProofDocUrl && (
                        <button
                          type="button"
                          onClick={() => removeFile('NomineeProofDoc')}
                          style={{ color: '#dc2626', background: 'none', border: 'none', fontSize: '0.75rem', cursor: 'pointer', fontWeight: '600' }}
                        >
                          Remove
                        </button>
                      )}
                    </div>
                    {formData.NomineeProofDocUrl ? (
                      <div style={{ height: '115px', backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                        <img src={formData.NomineeProofDocUrl} alt="Nominee Proof Preview" style={{ maxHeight: '100%', maxWidth: '100%', objectFit: 'contain' }} />
                      </div>
                    ) : (
                      <label style={{
                        height: '115px',
                        border: '2px dashed #cbd5e1',
                        borderRadius: '8px',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer',
                        backgroundColor: '#ffffff',
                        transition: 'border-color 0.15s ease'
                      }}>
                        <Upload size={22} color="#94a3b8" style={{ marginBottom: '6px' }} />
                        <span style={{ fontSize: '0.8rem', color: '#475569', fontWeight: '500' }}>Upload Nominee Proof</span>
                        <input type="file" accept="image/*,application/pdf" style={{ display: 'none' }} onChange={(e) => handleFileUpload('NomineeProofDoc', e)} />
                      </label>
                    )}
                    {renderFieldError('NomineeProofDoc')}
                  </div>

                  {/* Customer Signature Upload */}
                  <div className="sm:col-span-2" style={{
                    padding: '1.15rem',
                    backgroundColor: '#f8fafc',
                    border: validationErrors.SignDoc ? '1.5px solid #ef4444' : '1px solid #e2e8f0',
                    borderRadius: '12px'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.65rem' }}>
                      {renderFieldLabel('Customer Signature', true)}
                      {formData.SignDocUrl && (
                        <button
                          type="button"
                          onClick={() => removeFile('SignDoc')}
                          style={{ color: '#dc2626', background: 'none', border: 'none', fontSize: '0.75rem', cursor: 'pointer', fontWeight: '600' }}
                        >
                          Remove
                        </button>
                      )}
                    </div>
                    {formData.SignDocUrl ? (
                      <div style={{ height: '100px', backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                        <img src={formData.SignDocUrl} alt="Signature Preview" style={{ maxHeight: '100%', maxWidth: '100%', objectFit: 'contain' }} />
                      </div>
                    ) : (
                      <label style={{
                        height: '100px',
                        border: '2px dashed #cbd5e1',
                        borderRadius: '8px',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer',
                        backgroundColor: '#ffffff',
                        transition: 'border-color 0.15s ease'
                      }}>
                        <Upload size={22} color="#94a3b8" style={{ marginBottom: '6px' }} />
                        <span style={{ fontSize: '0.8rem', color: '#475569', fontWeight: '500' }}>Upload Signature Image (PNG / JPG)</span>
                        <input type="file" accept="image/*" style={{ display: 'none' }} onChange={(e) => handleFileUpload('SignDoc', e)} />
                      </label>
                    )}
                    {renderFieldError('SignDoc')}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Modal Footer Bar (Pinned Non-scrolling: Next, Prev, Save as Draft, Submit) */}
          <div style={{
            backgroundColor: '#ffffff',
            borderTop: '1px solid #e2e8f0',
            padding: '1.15rem 2.25rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexShrink: 0,
            boxShadow: '0 -2px 10px rgba(0, 0, 0, 0.04)',
            zIndex: 10
          }}>
            <span style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: '500' }}>
              <span style={{ color: '#ef4444', fontWeight: '700' }}>*</span> Required fields
            </span>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              {/* Save Draft Button */}
              {!editingCustomer && (
                <button
                  type="button"
                  disabled={savingDraft}
                  onClick={() => handleSaveDraft(false)}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '0.65rem 1.25rem',
                    fontSize: '0.85rem',
                    fontWeight: '600',
                    borderRadius: '8px',
                    backgroundColor: '#fffbeb',
                    color: '#b45309',
                    border: '1px solid #fde68a',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease'
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#fef3c7'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = '#fffbeb'; }}
                >
                  <Bookmark size={15} />
                  <span>{savingDraft ? 'Saving Draft...' : 'Save Draft'}</span>
                </button>
              )}

              {/* Previous Button (Steps 2-7) */}
              {currentStep > 1 && (
                <button
                  type="button"
                  onClick={handlePrevStep}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '0.65rem 1.35rem',
                    fontSize: '0.85rem',
                    fontWeight: '600',
                    borderRadius: '8px',
                    backgroundColor: '#ffffff',
                    color: '#334155',
                    border: '1px solid #cbd5e1',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease'
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#f8fafc'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = '#ffffff'; }}
                >
                  <ArrowLeft size={15} />
                  <span>Previous</span>
                </button>
              )}

              {/* Next Button (Steps 1-6) */}
              {currentStep < 7 ? (
                <button
                  type="button"
                  onClick={handleNextStep}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '0.65rem 1.85rem',
                    fontSize: '0.875rem',
                    fontWeight: '700',
                    borderRadius: '8px',
                    backgroundColor: '#16a34a',
                    color: '#ffffff',
                    border: 'none',
                    cursor: 'pointer',
                    boxShadow: '0 2px 6px rgba(22, 163, 74, 0.25)',
                    transition: 'all 0.15s ease'
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#15803d'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = '#16a34a'; }}
                >
                  <span>Next</span>
                  <ArrowRight size={15} />
                </button>
              ) : (
                /* Save & Submit Button (Step 7) */
                <button
                  type="button"
                  disabled={saving}
                  onClick={handleSubmit}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '0.65rem 1.85rem',
                    fontSize: '0.875rem',
                    fontWeight: '700',
                    borderRadius: '8px',
                    backgroundColor: '#16a34a',
                    color: '#ffffff',
                    border: 'none',
                    cursor: 'pointer',
                    boxShadow: '0 2px 6px rgba(22, 163, 74, 0.25)',
                    opacity: saving ? 0.65 : 1,
                    transition: 'all 0.15s ease'
                  }}
                  onMouseEnter={(e) => { if (!saving) e.currentTarget.style.backgroundColor = '#15803d'; }}
                  onMouseLeave={(e) => { if (!saving) e.currentTarget.style.backgroundColor = '#16a34a'; }}
                >
                  <Check size={16} strokeWidth={2.5} />
                  <span>{saving ? 'Registering...' : editingCustomer ? 'Update Customer' : 'Submit Registration'}</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </Modal>

      {/* ========================================================================= */}
      {/* CUSTOMER DRAFTS MODAL (Expert UI/UX Redesign)                             */}
      {/* ========================================================================= */}
      <Modal
        isOpen={isDraftsModalOpen}
        onClose={() => setIsDraftsModalOpen(false)}
        maxWidth="920px"
        hideHeader={true}
      >
        <div style={{
          backgroundColor: '#ffffff',
          borderRadius: '14px',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          maxHeight: '88vh'
        }}>
          {/* Custom Header with Primary Gradient */}
          <div style={{
            background: 'linear-gradient(135deg, #1d4ed8 0%, #2563eb 100%)',
            color: '#ffffff',
            padding: '1rem 1.5rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexShrink: 0,
            boxShadow: '0 2px 8px rgba(37, 99, 235, 0.25)',
            zIndex: 10
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <div style={{
                width: '38px',
                height: '38px',
                borderRadius: '10px',
                backgroundColor: 'rgba(255, 255, 255, 0.18)',
                backdropFilter: 'blur(8px)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#ffffff',
                border: '1px solid rgba(255, 255, 255, 0.25)',
                flexShrink: 0
              }}>
                <Bookmark size={18} />
              </div>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <h2 style={{ margin: 0, fontSize: '1.1rem', fontWeight: '800', color: '#ffffff', letterSpacing: '-0.01em' }}>
                    Customer Drafts
                  </h2>
                  <span style={{
                    backgroundColor: 'rgba(255, 255, 255, 0.22)',
                    border: '1px solid rgba(255, 255, 255, 0.35)',
                    color: '#ffffff',
                    padding: '2px 8px',
                    borderRadius: '999px',
                    fontSize: '0.7rem',
                    fontWeight: '700'
                  }}>
                    {drafts.length} {drafts.length === 1 ? 'Draft' : 'Drafts'}
                  </span>
                </div>
                <p style={{ margin: '0.1rem 0 0', fontSize: '0.75rem', color: '#dbeafe', fontWeight: '400' }}>
                  Resume any in-progress customer registration from where you left off
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setIsDraftsModalOpen(false)}
              aria-label="Close modal"
              style={{
                background: 'rgba(255, 255, 255, 0.15)',
                border: '1px solid rgba(255, 255, 255, 0.25)',
                color: '#ffffff',
                width: '30px',
                height: '30px',
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                transition: 'all 0.15s ease'
              }}
              onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.3)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.15)'; }}
            >
              <X size={16} />
            </button>
          </div>

          {/* Modal Body */}
          <div style={{ padding: '1.25rem 1.5rem', overflowY: 'auto', flex: 1 }}>
            {/* Informational Guidance Banner */}
            <div style={{
              display: 'flex',
              alignItems: 'flex-start',
              gap: '10px',
              padding: '0.75rem 1rem',
              backgroundColor: '#eff6ff',
              border: '1px solid #bfdbfe',
              borderRadius: '10px',
              marginBottom: '1rem',
              color: '#1e40af',
              fontSize: '0.785rem',
              lineHeight: '1.45'
            }}>
              <AlertCircle size={16} color="#2563eb" style={{ flexShrink: 0, marginTop: '2px' }} />
              <div>
                <strong style={{ fontWeight: '700' }}>Fast Resume:</strong> Clicking <strong>Resume</strong> pre-fills the 7-step customer registration wizard starting from Step 1, allowing you to review previously entered information and advance forward. Submitting at the final step automatically archives the draft.
              </div>
            </div>

            {/* Redesigned Grid Table */}
            <div style={{
              border: '1px solid #e2e8f0',
              borderRadius: '12px',
              overflow: 'hidden',
              boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)',
              backgroundColor: '#ffffff'
            }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.8rem' }}>
                <thead>
                  <tr style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0', color: '#475569', fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                    <th style={{ padding: '0.75rem 0.65rem', textAlign: 'center', width: '60px', fontWeight: '700' }}>
                      <input
                        type="checkbox"
                        checked={drafts.length > 0 && selectedDraftKeys.length === drafts.length}
                        onChange={toggleSelectAllDrafts}
                        title="Select All Drafts"
                        style={{ width: '16px', height: '16px', cursor: 'pointer', accentColor: '#2563eb' }}
                      />
                    </th>
                    <th style={{ padding: '0.75rem 1rem', fontWeight: '700' }}>Customer / Draft Key</th>
                    <th style={{ padding: '0.75rem 1rem', fontWeight: '700', width: '220px' }}>Step Progress</th>
                    <th style={{ padding: '0.75rem 1rem', fontWeight: '700' }}>Last Modified</th>
                    <th style={{ padding: '0.75rem 1rem', textAlign: 'right', fontWeight: '700', width: '130px' }}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {drafts.length === 0 ? (
                    <tr>
                      <td colSpan={5} style={{ padding: '3rem 1rem', textAlign: 'center', color: '#94a3b8' }}>
                        <Bookmark size={32} color="#cbd5e1" style={{ margin: '0 auto 0.5rem' }} />
                        <p style={{ margin: 0, fontWeight: '600', fontSize: '0.875rem', color: '#475569' }}>No Active Drafts Found</p>
                        <p style={{ margin: '0.25rem 0 0', fontSize: '0.75rem' }}>Drafts are automatically created whenever you fill out customer steps.</p>
                      </td>
                    </tr>
                  ) : (
                    drafts.map((d, idx) => {
                      const step = Number(d.StepNo || d.CurrentStep || d.DraftData?.CurrentStep || 1);
                      const total = Number(d.TotalSteps || 7);
                      const pct = Math.min(100, Math.max(14, Math.round((step / total) * 100)));
                      const currentStepMeta = stepsMeta[step - 1] || stepsMeta[0];
                      const isSelected = selectedDraftKeys.includes(d.DraftKey);

                      return (
                        <tr
                          key={d.DraftKey || idx}
                          style={{
                            borderBottom: idx === drafts.length - 1 ? 'none' : '1px solid #f1f5f9',
                            backgroundColor: isSelected ? '#f8faff' : 'transparent',
                            transition: 'background-color 0.15s ease'
                          }}
                          onMouseEnter={(e) => { if (!isSelected) e.currentTarget.style.backgroundColor = '#f8fafc'; }}
                          onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = isSelected ? '#f8faff' : 'transparent'; }}
                        >
                          {/* Checkbox & Row Number in 1st Column */}
                          <td style={{ padding: '0.85rem 0.65rem', textAlign: 'center' }}>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                              <input
                                type="checkbox"
                                checked={isSelected}
                                onChange={() => toggleSelectDraft(d.DraftKey)}
                                style={{ width: '16px', height: '16px', cursor: 'pointer', accentColor: '#2563eb' }}
                              />
                              <span style={{
                                width: '22px',
                                height: '22px',
                                borderRadius: '50%',
                                backgroundColor: isSelected ? '#dbeafe' : '#f1f5f9',
                                color: isSelected ? '#1e40af' : '#475569',
                                fontWeight: '700',
                                fontSize: '0.7rem',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontFamily: 'monospace'
                              }}>
                                {idx + 1}
                              </span>
                            </div>
                          </td>

                          {/* Customer Name & Draft Key Badge */}
                          <td style={{ padding: '0.85rem 1rem' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                              <User size={14} color="#2563eb" />
                              <span style={{ fontWeight: '700', color: '#0f172a', fontSize: '0.85rem' }}>
                                {d.CustomerName || 'Unnamed Customer'}
                              </span>
                            </div>
                            <div style={{ marginTop: '4px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                              <span style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '4px',
                                backgroundColor: '#f1f5f9',
                                border: '1px solid #e2e8f0',
                                borderRadius: '4px',
                                padding: '1px 6px',
                                fontSize: '0.7rem',
                                color: '#475569',
                                fontFamily: 'monospace',
                                fontWeight: '600'
                              }}>
                                <Bookmark size={10} color="#64748b" />
                                {d.DraftKey}
                              </span>
                            </div>
                          </td>

                          {/* Step Progress & Visual Bar */}
                          <td style={{ padding: '0.85rem 1rem' }}>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
                              <span style={{ fontSize: '0.775rem', fontWeight: '700', color: '#1e293b' }}>
                                Step {step} of {total}
                              </span>
                              <span style={{
                                fontSize: '0.675rem',
                                fontWeight: '700',
                                color: '#2563eb',
                                backgroundColor: '#eff6ff',
                                padding: '1px 6px',
                                borderRadius: '4px',
                                border: '1px solid #dbeafe'
                              }}>
                                {currentStepMeta.label}
                              </span>
                            </div>
                            <div style={{ width: '100%', backgroundColor: '#e2e8f0', borderRadius: '999px', height: '6px', overflow: 'hidden' }}>
                              <div
                                style={{
                                  height: '100%',
                                  width: `${pct}%`,
                                  background: 'linear-gradient(90deg, #2563eb 0%, #10b981 100%)',
                                  borderRadius: '999px',
                                  transition: 'width 0.3s ease'
                                }}
                              />
                            </div>
                            <span style={{ fontSize: '0.675rem', color: '#64748b', fontWeight: '600', marginTop: '3px', display: 'block' }}>
                              {pct}% Completed
                            </span>
                          </td>

                          {/* Last Modified */}
                          <td style={{ padding: '0.85rem 1rem' }}>
                            <div style={{ fontSize: '0.775rem', fontWeight: '600', color: '#334155', display: 'flex', alignItems: 'center', gap: '5px' }}>
                              <Mail size={12} color="#94a3b8" />
                              <span>{d.LastModifiedBy || 'Admin'}</span>
                            </div>
                            <div style={{ fontSize: '0.7rem', color: '#64748b', marginTop: '3px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                              <Clock size={11} color="#94a3b8" />
                              <span>
                                {d.LastModifiedOn ? new Date(d.LastModifiedOn).toLocaleString('en-IN', {
                                  day: '2-digit',
                                  month: 'short',
                                  year: 'numeric',
                                  hour: '2-digit',
                                  minute: '2-digit'
                                }) : '-'}
                              </span>
                            </div>
                          </td>

                          {/* Action Button: ONLY Resume */}
                          <td style={{ padding: '0.85rem 1rem', textAlign: 'right' }}>
                            <button
                              type="button"
                              onClick={() => handleResumeDraft(d)}
                              title="Resume Customer Registration"
                              style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '6px',
                                padding: '7px 14px',
                                fontSize: '0.775rem',
                                fontWeight: '700',
                                borderRadius: '7px',
                                backgroundColor: '#2563eb',
                                color: '#ffffff',
                                border: 'none',
                                cursor: 'pointer',
                                boxShadow: '0 1px 3px rgba(37, 99, 235, 0.25)',
                                transition: 'all 0.15s ease'
                              }}
                              onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#1d4ed8'; }}
                              onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = '#2563eb'; }}
                            >
                              <Play size={13} fill="#ffffff" />
                              <span>Resume</span>
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Modal Footer (Pinned) */}
          <div style={{
            backgroundColor: '#ffffff',
            borderTop: '1px solid #e2e8f0',
            padding: '0.75rem 1.5rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexShrink: 0
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span style={{ fontSize: '0.75rem', color: '#64748b' }}>
                Showing <strong>{drafts.length}</strong> active draft{drafts.length === 1 ? '' : 's'}
              </span>
              {selectedDraftKeys.length > 0 && (
                <span style={{
                  fontSize: '0.72rem',
                  color: '#dc2626',
                  fontWeight: '700',
                  backgroundColor: '#fef2f2',
                  padding: '2px 8px',
                  borderRadius: '4px',
                  border: '1px solid #fecaca'
                }}>
                  {selectedDraftKeys.length} selected
                </span>
              )}
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              {selectedDraftKeys.length > 0 && (
                <button
                  type="button"
                  onClick={handleDeleteSelectedDrafts}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '5px',
                    padding: '0.45rem 1rem',
                    fontSize: '0.775rem',
                    fontWeight: '700',
                    borderRadius: '8px',
                    backgroundColor: '#dc2626',
                    color: '#ffffff',
                    border: 'none',
                    cursor: 'pointer',
                    boxShadow: '0 1px 3px rgba(220, 38, 38, 0.25)',
                    transition: 'all 0.15s ease'
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#b91c1c'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = '#dc2626'; }}
                >
                  <Trash2 size={13} />
                  <span>Delete Selected ({selectedDraftKeys.length})</span>
                </button>
              )}

              <button
                type="button"
                onClick={() => setIsDraftsModalOpen(false)}
                style={{
                  padding: '0.45rem 1.15rem',
                  fontSize: '0.775rem',
                  fontWeight: '600',
                  borderRadius: '8px',
                  backgroundColor: '#f8fafc',
                  color: '#334155',
                  border: '1px solid #cbd5e1',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease'
                }}
                onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#f1f5f9'; }}
                onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = '#f8fafc'; }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
}
