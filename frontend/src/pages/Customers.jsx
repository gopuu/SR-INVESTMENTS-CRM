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
  Bookmark
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
      const draftList = await crmApi.call('getCustomerDrafts', {});
      const validDrafts = Array.isArray(draftList) ? draftList : [];
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

  // ================= SAVE AS DRAFT =================
  const handleSaveDraft = async (silent = false) => {
    try {
      setSavingDraft(true);
      const custName = formData.FullName || [formData.FirstName, formData.LastName].filter(Boolean).join(' ') || 'Customer Draft';
      const payload = {
        DraftKey: activeDraftKey,
        CurrentStep: currentStep,
        CustomerName: custName,
        userEmail: user?.email,
        DraftData: {
          ...formData,
          DraftKey: activeDraftKey,
          CurrentStep: currentStep
        }
      };

      const res = await crmApi.call('saveCustomerDraft', payload);
      if (res?.data?.DraftKey) {
        setActiveDraftKey(res.data.DraftKey);
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

  // Next Step Action
  const handleNextStep = async () => {
    if (!validateStep(currentStep)) return;
    
    // Auto-save draft on step transition
    if (!editingCustomer) {
      await handleSaveDraft(true);
    }

    if (currentStep < 7) {
      setCurrentStep(currentStep + 1);
      setValidationErrors({});
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

  const handleDeleteDraft = async (draft) => {
    const confirmed = await showConfirm(
      'Delete Draft?',
      `Delete draft for "${draft.CustomerName || draft.DraftKey}"?`
    );
    if (!confirmed) return;
    try {
      await crmApi.call('deleteCustomerDraft', {
        draftKey: draft.DraftKey,
        userEmail: user?.email
      });
      showSuccess('Draft Deleted', 'Customer draft deleted successfully.');
      await loadDrafts();
    } catch (err) {
      showError('Failed', err.message || 'Could not delete draft');
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
    <div className="flex-1 flex flex-col h-full bg-[#f8fafc] overflow-hidden">
      <Header title="Customers & Investors" onOpenBackup={onOpenBackup} />

      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
        {/* Top Control Bar */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex flex-1 items-center gap-3">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input
                type="text"
                placeholder="Search by Name, Code, PAN, Email, Mobile, City..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 text-sm rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
              />
            </div>

            <select
              value={kycFilter}
              onChange={(e) => setKycFilter(e.target.value)}
              className="py-2 px-3 text-sm rounded-lg border border-slate-200 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            >
              <option value="">All KYC Status</option>
              <option value="VERIFIED">Verified</option>
              <option value="PENDING">Pending</option>
              <option value="REJECTED">Rejected</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            {/* Drafts Button - Visible ONLY when draftCount > 0 per requirement */}
            {draftCount > 0 && (
              <button
                type="button"
                onClick={() => setIsDraftsModalOpen(true)}
                className="inline-flex items-center gap-2 px-3.5 py-2 text-sm font-semibold rounded-lg bg-amber-50 text-amber-700 border border-amber-200 hover:bg-amber-100 transition-colors shadow-sm"
              >
                <Bookmark size={16} className="text-amber-600" />
                <span>Drafts ({draftCount})</span>
              </button>
            )}

            {hasPermission('Customers', 'CanCreate') && (
              <button
                type="button"
                onClick={openAddModal}
                className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-lg bg-green-600 text-white hover:bg-green-700 transition-colors shadow-sm"
              >
                <Plus size={18} />
                <span>+ Add Customer</span>
              </button>
            )}
          </div>
        </div>

        {/* Customer Data Table */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 border-b border-slate-200 text-xs uppercase font-semibold text-slate-600">
                <tr>
                  <th className="px-4 py-3.5">Investor Info</th>
                  <th className="px-4 py-3.5">Contact Details</th>
                  <th className="px-4 py-3.5">PAN & Aadhaar</th>
                  <th className="px-4 py-3.5">Location</th>
                  <th className="px-4 py-3.5">System IDs</th>
                  <th className="px-4 py-3.5">KYC Status</th>
                  <th className="px-4 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {loading ? (
                  <tr>
                    <td colSpan={7} className="px-4 py-12 text-center text-slate-400">
                      <RefreshCw size={24} className="animate-spin mx-auto mb-2 text-blue-500" />
                      Loading investors...
                    </td>
                  </tr>
                ) : customers.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-4 py-12 text-center text-slate-400">
                      No investors found matching the criteria.
                    </td>
                  </tr>
                ) : (
                  customers.slice(0, visibleCount).map((cust) => (
                    <tr 
                      key={cust.CustomerId || cust.CustomerCode}
                      className={`hover:bg-slate-50/70 transition-colors ${cust.IsDeleted ? 'bg-red-50/40 text-slate-400' : ''}`}
                    >
                      <td className="px-4 py-3">
                        <div className="font-semibold text-slate-900 flex items-center gap-1.5">
                          {cust.FullName || `${cust.FirstName || ''} ${cust.LastName || ''}`}
                          {cust.IsDeleted && <span className="text-xs bg-red-100 text-red-600 px-1.5 py-0.5 rounded font-normal">Deleted</span>}
                        </div>
                        <div className="text-xs font-mono text-slate-500">
                          Code: {cust.CustomerCode || '-'} {cust.Title ? `(${cust.Title})` : ''}
                        </div>
                      </td>

                      <td className="px-4 py-3">
                        <div className="text-slate-800">{cust.Mobile || '-'}</div>
                        <div className="text-xs text-slate-500">{cust.Email || '-'}</div>
                      </td>

                      <td className="px-4 py-3">
                        <div className="font-mono text-xs text-slate-800">PAN: {cust.PanNumber || '-'}</div>
                        <div className="font-mono text-xs text-slate-500">UID: {cust.AadharNo || cust.AadhaarLast4 || '-'}</div>
                      </td>

                      <td className="px-4 py-3">
                        <div className="text-slate-700">{cust.City || '-'}, {cust.State || '-'}</div>
                        <div className="text-xs text-slate-500">{cust.Pincode || ''} {cust.Area ? `(${cust.Area})` : ''}</div>
                      </td>

                      <td className="px-4 py-3">
                        <div className="text-xs text-slate-700 font-mono">BSE: {cust.BseUcc || '-'}</div>
                        <div className="text-xs text-slate-500 font-mono">SK: {cust.SkCustId || cust.SkClientId || '-'}</div>
                      </td>

                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                          String(cust.KycStatus).toUpperCase() === 'VERIFIED' ? 'bg-emerald-100 text-emerald-800' :
                          String(cust.KycStatus).toUpperCase() === 'REJECTED' ? 'bg-rose-100 text-rose-800' :
                          'bg-amber-100 text-amber-800'
                        }`}>
                          {cust.KycStatus || 'PENDING'}
                        </span>
                      </td>

                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-1">
                          {hasPermission('Customers', 'CanEdit') && !cust.IsDeleted && (
                            <button
                              type="button"
                              onClick={() => openEditModal(cust)}
                              title="Edit Customer"
                              className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                            >
                              <Edit2 size={16} />
                            </button>
                          )}

                          {hasPermission('Customers', 'CanDelete') && !cust.IsDeleted && (
                            <button
                              type="button"
                              onClick={() => handleDelete(cust.CustomerId, cust.FullName)}
                              title="Delete Customer"
                              className="p-1.5 text-red-600 hover:bg-red-50 rounded-md transition-colors"
                            >
                              <Trash2 size={16} />
                            </button>
                          )}

                          {cust.IsDeleted && (
                            <button
                              type="button"
                              onClick={() => handleRestore(cust.CustomerId, cust.FullName)}
                              title="Restore Customer"
                              className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded-md transition-colors"
                            >
                              <RotateCcw size={16} />
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
          <div ref={sentinelRef} className="h-4" />
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 7-STEP CUSTOMER REGISTRATION / EDIT MODAL                                 */}
      {/* ========================================================================= */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        maxWidth="900px"
        hideHeader={true}
      >
        <div className="bg-white rounded-xl overflow-hidden -m-4 sm:-m-6 flex flex-col h-full max-h-[88vh] min-h-0">
          {/* Custom Header with Primary Color (Fixed Top) */}
          <div style={{
            background: 'linear-gradient(135deg, #1d4ed8 0%, #2563eb 100%)',
            color: '#ffffff',
            padding: '1.25rem 1.75rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexShrink: 0,
            borderTopLeftRadius: '12px',
            borderTopRightRadius: '12px',
            boxShadow: '0 2px 8px rgba(37, 99, 235, 0.25)',
            zIndex: 10
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
              <div style={{
                width: '40px',
                height: '40px',
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
                {editingCustomer ? <Edit3 size={20} /> : <UserPlus size={20} />}
              </div>
              <div>
                <h2 style={{ margin: 0, fontSize: '1.15rem', fontWeight: '800', color: '#ffffff', letterSpacing: '-0.01em' }}>
                  {editingCustomer ? `Edit Customer: ${editingCustomer.FullName || editingCustomer.EmployeeCode}` : 'Add Customer'}
                </h2>
                <p style={{ margin: '0.15rem 0 0', fontSize: '0.775rem', color: '#dbeafe', fontWeight: '400' }}>
                  7-Step KYC, Bank, Nominee & Investor Registration Wizard
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              aria-label="Close modal"
              style={{
                background: 'rgba(255, 255, 255, 0.15)',
                border: '1px solid rgba(255, 255, 255, 0.25)',
                color: '#ffffff',
                width: '32px',
                height: '32px',
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
              <X size={18} />
            </button>
          </div>

          {/* 7-Step Progress Wizard Bar (Fixed) */}
          <div className="bg-white border-b border-slate-200 px-4 sm:px-8 py-5 flex-shrink-0">
            <div className="flex items-center justify-between relative">
              {/* Connecting line */}
              <div className="absolute left-6 right-6 top-4 -translate-y-1/2 h-0.5 bg-slate-200 -z-0" />

              {stepsMeta.map((s) => {
                const isActive = currentStep === s.num;
                const isPassed = currentStep > s.num;

                return (
                  <div 
                    key={s.num} 
                    className="flex flex-col items-center relative z-10 cursor-pointer"
                    onClick={() => {
                      // Allow jumping to steps <= currentStep or if valid
                      if (s.num <= currentStep) {
                        setCurrentStep(s.num);
                      }
                    }}
                  >
                    <div 
                      className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm transition-all shadow-sm ${
                        isActive 
                          ? 'bg-[#ea580c] text-white ring-4 ring-orange-100 scale-105' 
                          : isPassed 
                            ? 'bg-[#16a34a] text-white' 
                            : 'bg-slate-200 text-slate-600'
                      }`}
                    >
                      {s.num}
                    </div>
                    <span className={`text-xs mt-1.5 font-medium ${
                      isActive ? 'text-[#ea580c] font-bold' : isPassed ? 'text-[#16a34a]' : 'text-slate-500'
                    }`}>
                      {s.label}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Step Body (Scrollable) */}
          <div className="p-6 flex-1 min-h-0 overflow-y-auto space-y-6">
            
            {/* ================= STEP 1: BASIC DETAILS ================= */}
            {currentStep === 1 && (
              <div className="space-y-4">
                <h3 className="text-base font-semibold text-slate-800 border-b pb-2">Basic Details</h3>
                
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">
                      Title <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={formData.Title}
                      onChange={(e) => handleTitleChange(e.target.value)}
                      className={`w-full px-3 py-2 text-sm rounded-lg border ${
                        validationErrors.Title ? 'border-red-500' : 'border-slate-300'
                      } bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20`}
                    >
                      <option value="">--Select--</option>
                      <option value="Mr">Mr</option>
                      <option value="Mrs">Mrs</option>
                      <option value="Ms">Ms</option>
                      <option value="Minor">Minor</option>
                      <option value="HUF">HUF</option>
                    </select>
                    {validationErrors.Title && <p className="text-xs text-red-500 mt-1">{validationErrors.Title}</p>}
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">
                      First Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. RAHUL"
                      value={formData.FirstName}
                      onChange={(e) => handleNamePartChange('FirstName', e.target.value.toUpperCase())}
                      className={`w-full px-3 py-2 text-sm rounded-lg border uppercase ${
                        validationErrors.FirstName ? 'border-red-500' : 'border-slate-300'
                      } focus:outline-none focus:ring-2 focus:ring-blue-500/20`}
                    />
                    {validationErrors.FirstName && <p className="text-xs text-red-500 mt-1">{validationErrors.FirstName}</p>}
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">
                      Middle Name
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. PRAKASH"
                      value={formData.MiddleName}
                      onChange={(e) => handleNamePartChange('MiddleName', e.target.value.toUpperCase())}
                      className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 uppercase focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">
                      Last Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. KUMAR"
                      value={formData.LastName}
                      onChange={(e) => handleNamePartChange('LastName', e.target.value.toUpperCase())}
                      className={`w-full px-3 py-2 text-sm rounded-lg border uppercase ${
                        validationErrors.LastName ? 'border-red-500' : 'border-slate-300'
                      } focus:outline-none focus:ring-2 focus:ring-blue-500/20`}
                    />
                    {validationErrors.LastName && <p className="text-xs text-red-500 mt-1">{validationErrors.LastName}</p>}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">
                      Gender <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={formData.Gender}
                      onChange={(e) => setFormData({ ...formData, Gender: e.target.value })}
                      className={`w-full px-3 py-2 text-sm rounded-lg border ${
                        validationErrors.Gender ? 'border-red-500' : 'border-slate-300'
                      } bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20`}
                    >
                      <option value="">--Select--</option>
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                    </select>
                    {validationErrors.Gender && <p className="text-xs text-red-500 mt-1">{validationErrors.Gender}</p>}
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">
                      Birth Date <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="date"
                      value={formData.DateOfBirth}
                      onChange={(e) => setFormData({ ...formData, DateOfBirth: e.target.value })}
                      className={`w-full px-3 py-2 text-sm rounded-lg border ${
                        validationErrors.DateOfBirth ? 'border-red-500' : 'border-slate-300'
                      } bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20`}
                    />
                    {validationErrors.DateOfBirth && <p className="text-xs text-red-500 mt-1">{validationErrors.DateOfBirth}</p>}
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">
                      Occupation {formData.Title !== 'Minor' && <span className="text-red-500">*</span>}
                    </label>
                    <select
                      value={formData.Occupation}
                      onChange={(e) => setFormData({ ...formData, Occupation: e.target.value })}
                      className={`w-full px-3 py-2 text-sm rounded-lg border ${
                        validationErrors.Occupation ? 'border-red-500' : 'border-slate-300'
                      } bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20`}
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
                    {validationErrors.Occupation && <p className="text-xs text-red-500 mt-1">{validationErrors.Occupation}</p>}
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">
                      Annual Income {formData.Title !== 'Minor' && <span className="text-red-500">*</span>}
                    </label>
                    <select
                      value={formData.AnnualIncome}
                      onChange={(e) => setFormData({ ...formData, AnnualIncome: e.target.value })}
                      className={`w-full px-3 py-2 text-sm rounded-lg border ${
                        validationErrors.AnnualIncome ? 'border-red-500' : 'border-slate-300'
                      } bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20`}
                    >
                      <option value="">--Select--</option>
                      <option value="Below 1 Lakh">Below 1 Lakh</option>
                      <option value="1-5 Lakhs">1-5 Lakhs</option>
                      <option value="5-10 Lakhs">5-10 Lakhs</option>
                      <option value="10-25 Lakhs">10-25 Lakhs</option>
                      <option value="25 Lakhs - 1 Crore">25 Lakhs - 1 Crore</option>
                      <option value="Above 1 Crore">Above 1 Crore</option>
                    </select>
                    {validationErrors.AnnualIncome && <p className="text-xs text-red-500 mt-1">{validationErrors.AnnualIncome}</p>}
                  </div>
                </div>
              </div>
            )}

            {/* ================= STEP 2: CONTACT & KYC ================= */}
            {currentStep === 2 && (
              <div className="space-y-4">
                <h3 className="text-base font-semibold text-slate-800 border-b pb-2">Contact & KYC</h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">
                      Mobile <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      maxLength={10}
                      placeholder="10-digit mobile number"
                      value={formData.Mobile}
                      onChange={(e) => setFormData({ ...formData, Mobile: e.target.value.replace(/\D/g, '') })}
                      className={`w-full px-3 py-2 text-sm rounded-lg border ${
                        validationErrors.Mobile ? 'border-red-500' : 'border-slate-300'
                      } focus:outline-none focus:ring-2 focus:ring-blue-500/20`}
                    />
                    {validationErrors.Mobile && <p className="text-xs text-red-500 mt-1">{validationErrors.Mobile}</p>}
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">
                      Email <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="email"
                      placeholder="e.g. rahul@example.com"
                      value={formData.Email}
                      onChange={(e) => setFormData({ ...formData, Email: e.target.value.trim() })}
                      className={`w-full px-3 py-2 text-sm rounded-lg border ${
                        validationErrors.Email ? 'border-red-500' : 'border-slate-300'
                      } focus:outline-none focus:ring-2 focus:ring-blue-500/20`}
                    />
                    {validationErrors.Email && <p className="text-xs text-red-500 mt-1">{validationErrors.Email}</p>}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">
                      PAN <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      maxLength={10}
                      placeholder="e.g. ABCDE1234F"
                      value={formData.PanNumber}
                      onChange={(e) => setFormData({ ...formData, PanNumber: e.target.value.toUpperCase().trim() })}
                      className={`w-full px-3 py-2 text-sm rounded-lg border uppercase ${
                        validationErrors.PanNumber ? 'border-red-500' : 'border-slate-300'
                      } focus:outline-none focus:ring-2 focus:ring-blue-500/20`}
                    />
                    {validationErrors.PanNumber && <p className="text-xs text-red-500 mt-1">{validationErrors.PanNumber}</p>}
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">
                      Aadhaar <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      maxLength={12}
                      placeholder="12-digit Aadhaar number"
                      value={formData.AadharNo}
                      onChange={(e) => setFormData({ ...formData, AadharNo: e.target.value.replace(/\D/g, '') })}
                      className={`w-full px-3 py-2 text-sm rounded-lg border ${
                        validationErrors.AadharNo ? 'border-red-500' : 'border-slate-300'
                      } focus:outline-none focus:ring-2 focus:ring-blue-500/20`}
                    />
                    {validationErrors.AadharNo && <p className="text-xs text-red-500 mt-1">{validationErrors.AadharNo}</p>}
                  </div>
                </div>
              </div>
            )}

            {/* ================= STEP 3: ADDRESS DETAILS ================= */}
            {currentStep === 3 && (
              <div className="space-y-4">
                <h3 className="text-base font-semibold text-slate-800 border-b pb-2">Address Details</h3>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">
                    Address <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    rows={2}
                    placeholder="House/Flat No, Building, Street Address"
                    value={formData.Address}
                    onChange={(e) => setFormData({ ...formData, Address: e.target.value })}
                    className={`w-full px-3 py-2 text-sm rounded-lg border ${
                      validationErrors.Address ? 'border-red-500' : 'border-slate-300'
                    } focus:outline-none focus:ring-2 focus:ring-blue-500/20`}
                  />
                  {validationErrors.Address && <p className="text-xs text-red-500 mt-1">{validationErrors.Address}</p>}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">
                      Pincode <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      maxLength={6}
                      placeholder="6-digit Pincode (Auto-fills Area & City)"
                      value={formData.Pincode}
                      onChange={(e) => handlePincodeChange(e.target.value)}
                      className={`w-full px-3 py-2 text-sm rounded-lg border ${
                        validationErrors.Pincode ? 'border-red-500' : 'border-slate-300'
                      } focus:outline-none focus:ring-2 focus:ring-blue-500/20`}
                    />
                    {validationErrors.Pincode && <p className="text-xs text-red-500 mt-1">{validationErrors.Pincode}</p>}
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">
                      Area / Locality <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Bamroli, Vesu"
                      value={formData.Area}
                      onChange={(e) => setFormData({ ...formData, Area: e.target.value })}
                      className={`w-full px-3 py-2 text-sm rounded-lg border ${
                        validationErrors.Area ? 'border-red-500' : 'border-slate-300'
                      } focus:outline-none focus:ring-2 focus:ring-blue-500/20`}
                    />
                    {validationErrors.Area && <p className="text-xs text-red-500 mt-1">{validationErrors.Area}</p>}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">
                      City / District <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Surat"
                      value={formData.City}
                      onChange={(e) => setFormData({ ...formData, City: e.target.value })}
                      className={`w-full px-3 py-2 text-sm rounded-lg border ${
                        validationErrors.City ? 'border-red-500' : 'border-slate-300'
                      } focus:outline-none focus:ring-2 focus:ring-blue-500/20`}
                    />
                    {validationErrors.City && <p className="text-xs text-red-500 mt-1">{validationErrors.City}</p>}
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">
                      State <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Gujarat"
                      value={formData.State}
                      onChange={(e) => setFormData({ ...formData, State: e.target.value })}
                      className={`w-full px-3 py-2 text-sm rounded-lg border ${
                        validationErrors.State ? 'border-red-500' : 'border-slate-300'
                      } focus:outline-none focus:ring-2 focus:ring-blue-500/20`}
                    />
                    {validationErrors.State && <p className="text-xs text-red-500 mt-1">{validationErrors.State}</p>}
                  </div>
                </div>
              </div>
            )}

            {/* ================= STEP 4: SYSTEM DETAILS ================= */}
            {currentStep === 4 && (
              <div className="space-y-4">
                <h3 className="text-base font-semibold text-slate-800 border-b pb-2">System Details</h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">
                      BSE UCC
                    </label>
                    <input
                      type="text"
                      maxLength={15}
                      placeholder="BSE UCC (Max 15 Alphanumeric)"
                      value={formData.BseUcc}
                      onChange={(e) => setFormData({ ...formData, BseUcc: e.target.value.toUpperCase().trim() })}
                      className={`w-full px-3 py-2 text-sm rounded-lg border uppercase ${
                        validationErrors.BseUcc ? 'border-red-500' : 'border-slate-300'
                      } focus:outline-none focus:ring-2 focus:ring-blue-500/20`}
                    />
                    {validationErrors.BseUcc && <p className="text-xs text-red-500 mt-1">{validationErrors.BseUcc}</p>}
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">
                      SK CUSTID
                    </label>
                    <input
                      type="text"
                      placeholder="SK CustId (Numeric)"
                      value={formData.SkCustId}
                      onChange={(e) => setFormData({ ...formData, SkCustId: e.target.value.replace(/\D/g, '') })}
                      className={`w-full px-3 py-2 text-sm rounded-lg border ${
                        validationErrors.SkCustId ? 'border-red-500' : 'border-slate-300'
                      } focus:outline-none focus:ring-2 focus:ring-blue-500/20`}
                    />
                    {validationErrors.SkCustId && <p className="text-xs text-red-500 mt-1">{validationErrors.SkCustId}</p>}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">
                      SK DP ID
                    </label>
                    <input
                      type="text"
                      placeholder="SK DP ID (Alphanumeric)"
                      value={formData.SkDpId}
                      onChange={(e) => setFormData({ ...formData, SkDpId: e.target.value.toUpperCase().trim() })}
                      className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 uppercase focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">
                      SK CLIENT ID
                    </label>
                    <input
                      type="text"
                      placeholder="SK Client ID (Alphanumeric)"
                      value={formData.SkClientId}
                      onChange={(e) => setFormData({ ...formData, SkClientId: e.target.value.toUpperCase().trim() })}
                      className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 uppercase focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">
                    SK ID / Customer Unique ID <span className="text-red-500">*</span>
                  </label>
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
                    className={`w-full px-3 py-2 text-sm rounded-lg border uppercase font-mono ${
                      validationErrors.SR_UniqueId ? 'border-red-500' : 'border-slate-300'
                    } focus:outline-none focus:ring-2 focus:ring-blue-500/20`}
                  />
                  {validationErrors.SR_UniqueId && <p className="text-xs text-red-500 mt-1">{validationErrors.SR_UniqueId}</p>}
                </div>
              </div>
            )}

            {/* ================= STEP 5: BANK DETAILS (Customer_Bank Sheet) ================= */}
            {currentStep === 5 && (
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b pb-2">
                  <h3 className="text-base font-semibold text-slate-800">
                    Bank Details <span className="text-xs font-normal text-slate-500">(Max 3 banks allowed)</span>
                  </h3>
                  {formData.banks.length < 3 && (
                    <button
                      type="button"
                      onClick={addBankRow}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 transition-colors shadow-sm"
                    >
                      <Plus size={14} /> + Add Bank
                    </button>
                  )}
                </div>

                {formData.banks.map((b, idx) => (
                  <div key={idx} className="bg-slate-50 p-4 rounded-xl border border-slate-200 relative space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-700 uppercase tracking-wide">
                        Bank #{idx + 1} {idx === 0 && <span className="text-emerald-600">(Primary Mandate)</span>}
                      </span>
                      {idx > 0 && (
                        <button
                          type="button"
                          onClick={() => removeBankRow(idx)}
                          className="text-red-600 hover:text-red-700 text-xs font-semibold flex items-center gap-1"
                        >
                          <Trash2 size={14} /> Remove
                        </button>
                      )}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div>
                        <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">
                          IFSC Code <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          maxLength={11}
                          placeholder="e.g. SBIN0001234"
                          value={b.IfscCode}
                          onChange={(e) => handleIfscChange(idx, e.target.value)}
                          className={`w-full px-3 py-2 text-sm rounded-lg border uppercase font-mono ${
                            validationErrors[`bank_${idx}_IfscCode`] ? 'border-red-500' : 'border-slate-300'
                          } bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20`}
                        />
                        {validationErrors[`bank_${idx}_IfscCode`] && (
                          <p className="text-xs text-red-500 mt-1">{validationErrors[`bank_${idx}_IfscCode`]}</p>
                        )}
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">
                          Bank Name <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          placeholder="State Bank of India"
                          value={b.BankName}
                          onChange={(e) => {
                            const nb = [...formData.banks];
                            nb[idx].BankName = e.target.value;
                            setFormData({ ...formData, banks: nb });
                          }}
                          className={`w-full px-3 py-2 text-sm rounded-lg border ${
                            validationErrors[`bank_${idx}_BankName`] ? 'border-red-500' : 'border-slate-300'
                          } bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20`}
                        />
                        {validationErrors[`bank_${idx}_BankName`] && (
                          <p className="text-xs text-red-500 mt-1">{validationErrors[`bank_${idx}_BankName`]}</p>
                        )}
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">
                          A/C Number <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          placeholder="Bank Account Number"
                          value={b.AccountNumber}
                          onChange={(e) => {
                            const nb = [...formData.banks];
                            nb[idx].AccountNumber = e.target.value.trim();
                            setFormData({ ...formData, banks: nb });
                          }}
                          className={`w-full px-3 py-2 text-sm rounded-lg border font-mono ${
                            validationErrors[`bank_${idx}_AccountNumber`] ? 'border-red-500' : 'border-slate-300'
                          } bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20`}
                        />
                        {validationErrors[`bank_${idx}_AccountNumber`] && (
                          <p className="text-xs text-red-500 mt-1">{validationErrors[`bank_${idx}_AccountNumber`]}</p>
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">
                          Account Type <span className="text-red-500">*</span>
                        </label>
                        <select
                          value={b.AccountType}
                          onChange={(e) => {
                            const nb = [...formData.banks];
                            nb[idx].AccountType = e.target.value;
                            setFormData({ ...formData, banks: nb });
                          }}
                          className={`w-full px-3 py-2 text-sm rounded-lg border ${
                            validationErrors[`bank_${idx}_AccountType`] ? 'border-red-500' : 'border-slate-300'
                          } bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20`}
                        >
                          <option value="Saving">Saving</option>
                          <option value="Current">Current</option>
                          <option value="NRE">NRE</option>
                          <option value="NRO">NRO</option>
                        </select>
                        {validationErrors[`bank_${idx}_AccountType`] && (
                          <p className="text-xs text-red-500 mt-1">{validationErrors[`bank_${idx}_AccountType`]}</p>
                        )}
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">
                          MICR Code
                        </label>
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
                          className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 bg-white font-mono focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* ================= STEP 6: NOMINEE DETAILS (Customer_Nominee Sheet) ================= */}
            {currentStep === 6 && (
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b pb-2">
                  <div>
                    <h3 className="text-base font-semibold text-slate-800">
                      {getNomineeStepLabel()} Details 
                      <span className="text-xs font-normal text-slate-500 ml-2">
                        (Max {getMaxNominees()} allowed, Total Share must sum to 100%)
                      </span>
                    </h3>
                  </div>
                  {formData.nominees.length < getMaxNominees() && (
                    <button
                      type="button"
                      onClick={addNomineeRow}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 transition-colors shadow-sm"
                    >
                      <Plus size={14} /> + Add {getNomineeStepLabel()}
                    </button>
                  )}
                </div>

                {validationErrors.NomineeTotalShare && (
                  <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-lg flex items-center gap-2">
                    <AlertCircle size={16} />
                    <span>{validationErrors.NomineeTotalShare}</span>
                  </div>
                )}

                {formData.nominees.map((n, idx) => (
                  <div key={idx} className="bg-slate-50 p-4 rounded-xl border border-slate-200 relative space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-700 uppercase tracking-wide">
                        {getNomineeStepLabel()} #{idx + 1}
                      </span>
                      {idx > 0 && (
                        <button
                          type="button"
                          onClick={() => removeNomineeRow(idx)}
                          className="text-red-600 hover:text-red-700 text-xs font-semibold flex items-center gap-1"
                        >
                          <Trash2 size={14} /> Remove
                        </button>
                      )}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div>
                        <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">
                          {getNomineeStepLabel()} Name <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          placeholder="Full Name of Nominee"
                          value={n.NomineeName}
                          onChange={(e) => {
                            const nn = [...formData.nominees];
                            nn[idx].NomineeName = e.target.value.toUpperCase();
                            setFormData({ ...formData, nominees: nn });
                          }}
                          className={`w-full px-3 py-2 text-sm rounded-lg border uppercase ${
                            validationErrors[`nominee_${idx}_NomineeName`] ? 'border-red-500' : 'border-slate-300'
                          } bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20`}
                        />
                        {validationErrors[`nominee_${idx}_NomineeName`] && (
                          <p className="text-xs text-red-500 mt-1">{validationErrors[`nominee_${idx}_NomineeName`]}</p>
                        )}
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">
                          Relation <span className="text-red-500">*</span>
                        </label>
                        <select
                          value={n.Relation}
                          onChange={(e) => {
                            const nn = [...formData.nominees];
                            nn[idx].Relation = e.target.value;
                            setFormData({ ...formData, nominees: nn });
                          }}
                          className={`w-full px-3 py-2 text-sm rounded-lg border ${
                            validationErrors[`nominee_${idx}_Relation`] ? 'border-red-500' : 'border-slate-300'
                          } bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20`}
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
                        {validationErrors[`nominee_${idx}_Relation`] && (
                          <p className="text-xs text-red-500 mt-1">{validationErrors[`nominee_${idx}_Relation`]}</p>
                        )}
                      </div>

                      {n.Relation === 'Other' && (
                        <div>
                          <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">
                            Specify Relation <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="text"
                            placeholder="Specify relation"
                            value={n.RelationOther}
                            onChange={(e) => {
                              const nn = [...formData.nominees];
                              nn[idx].RelationOther = e.target.value;
                              setFormData({ ...formData, nominees: nn });
                            }}
                            className={`w-full px-3 py-2 text-sm rounded-lg border ${
                              validationErrors[`nominee_${idx}_RelationOther`] ? 'border-red-500' : 'border-slate-300'
                            } bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20`}
                          />
                        </div>
                      )}

                      <div>
                        <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">
                          DOB <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="date"
                          value={n.DateOfBirth}
                          onChange={(e) => {
                            const nn = [...formData.nominees];
                            nn[idx].DateOfBirth = e.target.value;
                            setFormData({ ...formData, nominees: nn });
                          }}
                          className={`w-full px-3 py-2 text-sm rounded-lg border ${
                            validationErrors[`nominee_${idx}_DateOfBirth`] ? 'border-red-500' : 'border-slate-300'
                          } bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20`}
                        />
                        {validationErrors[`nominee_${idx}_DateOfBirth`] && (
                          <p className="text-xs text-red-500 mt-1">{validationErrors[`nominee_${idx}_DateOfBirth`]}</p>
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div>
                        <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">
                          Occupation <span className="text-red-500">*</span>
                        </label>
                        <select
                          value={n.Occupation}
                          onChange={(e) => {
                            const nn = [...formData.nominees];
                            nn[idx].Occupation = e.target.value;
                            setFormData({ ...formData, nominees: nn });
                          }}
                          className={`w-full px-3 py-2 text-sm rounded-lg border ${
                            validationErrors[`nominee_${idx}_Occupation`] ? 'border-red-500' : 'border-slate-300'
                          } bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20`}
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
                        {validationErrors[`nominee_${idx}_Occupation`] && (
                          <p className="text-xs text-red-500 mt-1">{validationErrors[`nominee_${idx}_Occupation`]}</p>
                        )}
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">
                          ID Proof Type <span className="text-red-500">*</span>
                        </label>
                        <select
                          value={n.IdProofType}
                          onChange={(e) => {
                            const nn = [...formData.nominees];
                            nn[idx].IdProofType = e.target.value;
                            setFormData({ ...formData, nominees: nn });
                          }}
                          className={`w-full px-3 py-2 text-sm rounded-lg border ${
                            validationErrors[`nominee_${idx}_IdProofType`] ? 'border-red-500' : 'border-slate-300'
                          } bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20`}
                        >
                          <option value="">--Select--</option>
                          <option value="PAN">PAN</option>
                          <option value="Aadhaar">Aadhaar</option>
                          <option value="Driving License">Driving License</option>
                          <option value="Passport">Passport</option>
                          <option value="Voter ID">Voter ID</option>
                          <option value="Other">Other</option>
                        </select>
                        {validationErrors[`nominee_${idx}_IdProofType`] && (
                          <p className="text-xs text-red-500 mt-1">{validationErrors[`nominee_${idx}_IdProofType`]}</p>
                        )}
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">
                          Document No <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          placeholder="ID Document Number"
                          value={n.DocumentNo}
                          onChange={(e) => {
                            const nn = [...formData.nominees];
                            nn[idx].DocumentNo = e.target.value.toUpperCase().trim();
                            setFormData({ ...formData, nominees: nn });
                          }}
                          className={`w-full px-3 py-2 text-sm rounded-lg border uppercase ${
                            validationErrors[`nominee_${idx}_DocumentNo`] ? 'border-red-500' : 'border-slate-300'
                          } bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20`}
                        />
                        {validationErrors[`nominee_${idx}_DocumentNo`] && (
                          <p className="text-xs text-red-500 mt-1">{validationErrors[`nominee_${idx}_DocumentNo`]}</p>
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                      <div>
                        <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">
                          Mobile
                        </label>
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
                          className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">
                          Email
                        </label>
                        <input
                          type="email"
                          placeholder="Email address"
                          value={n.Email}
                          onChange={(e) => {
                            const nn = [...formData.nominees];
                            nn[idx].Email = e.target.value.trim();
                            setFormData({ ...formData, nominees: nn });
                          }}
                          className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">
                          Address
                        </label>
                        <input
                          type="text"
                          placeholder="Nominee address"
                          value={n.Address}
                          onChange={(e) => {
                            const nn = [...formData.nominees];
                            nn[idx].Address = e.target.value;
                            setFormData({ ...formData, nominees: nn });
                          }}
                          className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">
                          Share % <span className="text-red-500">*</span>
                        </label>
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
                          className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 bg-white font-bold text-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* ================= STEP 7: DOCUMENTS UPLOAD ================= */}
            {currentStep === 7 && (
              <div className="space-y-4">
                <h3 className="text-base font-semibold text-slate-800 border-b pb-2">Documents Upload</h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* PAN Card */}
                  <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-700 uppercase">
                        PAN Card <span className="text-red-500">*</span>
                      </span>
                      {formData.PanDocUrl && (
                        <button
                          type="button"
                          onClick={() => removeFile('PanDoc')}
                          className="text-red-600 hover:text-red-700 text-xs"
                        >
                          Remove
                        </button>
                      )}
                    </div>
                    {formData.PanDocUrl ? (
                      <div className="h-28 bg-white border rounded-lg flex items-center justify-center overflow-hidden">
                        <img src={formData.PanDocUrl} alt="PAN Preview" className="h-full object-contain" />
                      </div>
                    ) : (
                      <label className="h-28 border-2 border-dashed border-slate-300 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:bg-slate-100 transition-colors">
                        <Upload size={20} className="text-slate-400 mb-1" />
                        <span className="text-xs text-slate-500">Upload PAN Copy (JPG/PNG)</span>
                        <input type="file" accept="image/*,application/pdf" className="hidden" onChange={(e) => handleFileUpload('PanDoc', e)} />
                      </label>
                    )}
                    {validationErrors.PanDoc && <p className="text-xs text-red-500">{validationErrors.PanDoc}</p>}
                  </div>

                  {/* Aadhaar Card */}
                  <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-700 uppercase">
                        Aadhaar Card <span className="text-red-500">*</span>
                      </span>
                      {formData.AadharDocUrl && (
                        <button
                          type="button"
                          onClick={() => removeFile('AadharDoc')}
                          className="text-red-600 hover:text-red-700 text-xs"
                        >
                          Remove
                        </button>
                      )}
                    </div>
                    {formData.AadharDocUrl ? (
                      <div className="h-28 bg-white border rounded-lg flex items-center justify-center overflow-hidden">
                        <img src={formData.AadharDocUrl} alt="Aadhaar Preview" className="h-full object-contain" />
                      </div>
                    ) : (
                      <label className="h-28 border-2 border-dashed border-slate-300 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:bg-slate-100 transition-colors">
                        <Upload size={20} className="text-slate-400 mb-1" />
                        <span className="text-xs text-slate-500">Upload Aadhaar Copy</span>
                        <input type="file" accept="image/*,application/pdf" className="hidden" onChange={(e) => handleFileUpload('AadharDoc', e)} />
                      </label>
                    )}
                    {validationErrors.AadharDoc && <p className="text-xs text-red-500">{validationErrors.AadharDoc}</p>}
                  </div>

                  {/* Bank Cheque */}
                  <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-700 uppercase">Bank Cheque / Passbook</span>
                      {formData.BankChequeDocUrl && (
                        <button
                          type="button"
                          onClick={() => removeFile('BankChequeDoc')}
                          className="text-red-600 hover:text-red-700 text-xs"
                        >
                          Remove
                        </button>
                      )}
                    </div>
                    {formData.BankChequeDocUrl ? (
                      <div className="h-28 bg-white border rounded-lg flex items-center justify-center overflow-hidden">
                        <img src={formData.BankChequeDocUrl} alt="Cheque Preview" className="h-full object-contain" />
                      </div>
                    ) : (
                      <label className="h-28 border-2 border-dashed border-slate-300 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:bg-slate-100 transition-colors">
                        <Upload size={20} className="text-slate-400 mb-1" />
                        <span className="text-xs text-slate-500">Cancelled Cheque Copy</span>
                        <input type="file" accept="image/*,application/pdf" className="hidden" onChange={(e) => handleFileUpload('BankChequeDoc', e)} />
                      </label>
                    )}
                  </div>

                  {/* Nominee Proof */}
                  <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-700 uppercase">
                        Nominee ID Proof <span className="text-red-500">*</span>
                      </span>
                      {formData.NomineeProofDocUrl && (
                        <button
                          type="button"
                          onClick={() => removeFile('NomineeProofDoc')}
                          className="text-red-600 hover:text-red-700 text-xs"
                        >
                          Remove
                        </button>
                      )}
                    </div>
                    {formData.NomineeProofDocUrl ? (
                      <div className="h-28 bg-white border rounded-lg flex items-center justify-center overflow-hidden">
                        <img src={formData.NomineeProofDocUrl} alt="Nominee Proof Preview" className="h-full object-contain" />
                      </div>
                    ) : (
                      <label className="h-28 border-2 border-dashed border-slate-300 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:bg-slate-100 transition-colors">
                        <Upload size={20} className="text-slate-400 mb-1" />
                        <span className="text-xs text-slate-500">Upload Nominee Proof</span>
                        <input type="file" accept="image/*,application/pdf" className="hidden" onChange={(e) => handleFileUpload('NomineeProofDoc', e)} />
                      </label>
                    )}
                    {validationErrors.NomineeProofDoc && <p className="text-xs text-red-500">{validationErrors.NomineeProofDoc}</p>}
                  </div>

                  {/* Customer Signature Upload */}
                  <div className="sm:col-span-2 p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-700 uppercase">
                        Customer Signature <span className="text-red-500">*</span>
                      </span>
                      {formData.SignDocUrl && (
                        <button
                          type="button"
                          onClick={() => removeFile('SignDoc')}
                          className="text-red-600 hover:text-red-700 text-xs"
                        >
                          Remove
                        </button>
                      )}
                    </div>
                    {formData.SignDocUrl ? (
                      <div className="h-24 bg-white border rounded-lg flex items-center justify-center overflow-hidden">
                        <img src={formData.SignDocUrl} alt="Signature Preview" className="h-full object-contain" />
                      </div>
                    ) : (
                      <label className="h-24 border-2 border-dashed border-slate-300 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:bg-slate-100 transition-colors">
                        <Upload size={20} className="text-slate-400 mb-1" />
                        <span className="text-xs text-slate-500">Upload Signature Copy (PNG / JPG)</span>
                        <input type="file" accept="image/*" className="hidden" onChange={(e) => handleFileUpload('SignDoc', e)} />
                      </label>
                    )}
                    {validationErrors.SignDoc && <p className="text-xs text-red-500">{validationErrors.SignDoc}</p>}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Modal Footer Bar (Pinned Non-scrolling: Next, Prev, Save as Draft, Submit) */}
          <div className="bg-white border-t border-slate-200 px-6 py-4 flex items-center justify-between flex-shrink-0 shadow-[0_-2px_10px_rgba(0,0,0,0.04)] z-10">
            <span className="text-xs text-slate-500">* Required fields</span>

            <div className="flex items-center gap-2">
              {/* Save Draft Button - enabled on any step */}
              {!editingCustomer && (
                <button
                  type="button"
                  disabled={savingDraft}
                  onClick={() => handleSaveDraft(false)}
                  className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-lg bg-amber-50 text-amber-800 border border-amber-300 hover:bg-amber-100 transition-colors"
                >
                  <Save size={14} />
                  <span>{savingDraft ? 'Saving Draft...' : 'Save Draft'}</span>
                </button>
              )}

              {/* Previous Button (Steps 2-7) */}
              {currentStep > 1 && (
                <button
                  type="button"
                  onClick={handlePrevStep}
                  className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-lg border border-slate-300 bg-white text-slate-700 hover:bg-slate-100 transition-colors"
                >
                  <ArrowLeft size={14} /> Previous
                </button>
              )}

              {/* Next Button (Steps 1-6) */}
              {currentStep < 7 ? (
                <button
                  type="button"
                  onClick={handleNextStep}
                  className="inline-flex items-center gap-1.5 px-6 py-2 text-xs font-bold rounded-lg bg-green-600 text-white hover:bg-green-700 transition-colors shadow-sm"
                >
                  Next <ArrowRight size={14} />
                </button>
              ) : (
                /* Save & Submit Button (Step 7) */
                <button
                  type="button"
                  disabled={saving}
                  onClick={handleSubmit}
                  className="inline-flex items-center gap-1.5 px-6 py-2 text-xs font-bold rounded-lg bg-green-600 text-white hover:bg-green-700 transition-colors shadow-sm disabled:opacity-50"
                >
                  <Check size={16} />
                  <span>{saving ? 'Saving...' : 'Save & Submit'}</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </Modal>

      {/* ========================================================================= */}
      {/* CUSTOMER DRAFTS MODAL (Matching User Screenshot media_1795372118128_96a7)   */}
      {/* ========================================================================= */}
      <Modal
        isOpen={isDraftsModalOpen}
        onClose={() => setIsDraftsModalOpen(false)}
        maxWidth="750px"
        title="Customer Drafts"
      >
        <div className="space-y-4">
          <p className="text-xs text-slate-500">
            Resuming a draft will pre-fill the customer form at Step 1, letting you review previous values and advance seamlessly.
          </p>

          <div className="border border-slate-200 rounded-xl overflow-hidden">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 border-b border-slate-200 text-xs uppercase font-semibold text-slate-600">
                <tr>
                  <th className="px-4 py-3 text-center w-12">Id</th>
                  <th className="px-4 py-3">Customer / Draft Key</th>
                  <th className="px-4 py-3 text-center w-40">Step Progress</th>
                  <th className="px-4 py-3 text-center">Last Modified</th>
                  <th className="px-4 py-3 text-center w-28">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {drafts.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-4 py-8 text-center text-slate-400 text-xs">
                      No active drafts available.
                    </td>
                  </tr>
                ) : (
                  drafts.map((d, idx) => {
                    const step = d.StepNo || 1;
                    const total = d.TotalSteps || 7;
                    const pct = Math.round((step / total) * 100);

                    return (
                      <tr key={d.DraftKey || idx} className="hover:bg-slate-50/80 transition-colors">
                        <td className="px-4 py-3 text-center text-xs text-slate-500 font-mono">
                          {idx + 1}
                        </td>
                        <td className="px-4 py-3">
                          <div className="font-semibold text-slate-800 text-xs">{d.CustomerName}</div>
                          <div className="text-[10px] text-slate-400 font-mono">{d.DraftKey}</div>
                        </td>
                        <td className="px-4 py-3 text-center">
                          <div className="text-xs font-medium text-slate-700 mb-1">
                            Step {step} of {total}
                          </div>
                          <div className="w-full bg-slate-200 rounded-full h-1.5 overflow-hidden">
                            <div 
                              className="bg-blue-600 h-1.5 rounded-full transition-all" 
                              style={{ width: `${pct}%` }} 
                            />
                          </div>
                        </td>
                        <td className="px-4 py-3 text-center text-xs text-slate-600">
                          <div>{d.LastModifiedBy || 'Admin'}</div>
                          <div className="text-[10px] text-slate-400">
                            {d.LastModifiedOn ? new Date(d.LastModifiedOn).toLocaleString() : '-'}
                          </div>
                        </td>
                        <td className="px-4 py-3 text-center">
                          <div className="flex items-center justify-center gap-1.5">
                            <button
                              type="button"
                              onClick={() => handleResumeDraft(d)}
                              title="Resume Draft"
                              className="p-1.5 text-blue-600 hover:bg-blue-50 border border-blue-200 rounded-md transition-colors"
                            >
                              <Play size={14} className="fill-blue-600" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteDraft(d)}
                              title="Delete Draft"
                              className="p-1.5 text-red-600 hover:bg-red-50 border border-red-200 rounded-md transition-colors"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </Modal>
    </div>
  );
}
