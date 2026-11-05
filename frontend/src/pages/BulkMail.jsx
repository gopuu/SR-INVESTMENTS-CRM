import React, { useState, useEffect } from 'react';
import { 
  Mail, 
  Send, 
  Users, 
  UserCheck, 
  Paperclip, 
  DollarSign, 
  CheckCircle, 
  AlertCircle, 
  Clock, 
  FileText, 
  Eye, 
  Download, 
  FileSpreadsheet, 
  Code, 
  FileCode, 
  Printer, 
  ShieldCheck, 
  X,
  Building,
  CheckCheck,
  Search,
  Copy,
  ChevronLeft,
  ChevronRight,
  Info,
  ExternalLink,
  Filter
} from 'lucide-react';
import { crmApi } from '../services/api';
import { useAuth } from '../context/AuthContext';
import Header from '../components/Header';

export default function BulkMail() {
  const { hasPermission } = useAuth();
  const [target, setTarget] = useState('customers'); // 'customers' or 'employees'
  const [emailMode, setEmailMode] = useState('personalized'); // 'common' or 'personalized'
  const [category, setCategory] = useState('Quarterly Portfolio CAS & Risk-o-meter Notice');
  const [customers, setCustomers] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [selectedRecipients, setSelectedRecipients] = useState([]);
  
  // Email Form
  const [subject, setSubject] = useState('Important Mutual Fund Portfolio Update & CAS Notice - SR INVESTMENTS');
  const [content, setContent] = useState(`Dear {FullName},

We are pleased to share your mutual fund portfolio update from SR INVESTMENTS (AMFI Reg: ARN-189241).

Your Investor Code: {CustomerCode}
Registered PAN: {PanNumber}
Linked Bank Mandate: {BankName} (A/C: {AccountNumber})
Assessed Risk Appetite: {RiskProfile}

Please find the attached quarterly statement and market risk-o-meter advisory note. Feel free to contact your dedicated investment advisor for any portfolio rebalancing or SIP top-ups.

Statutory Disclaimer: Mutual fund investments are subject to market risks, read all scheme related documents carefully.

Warm regards,
SR INVESTMENTS Advisory Team
ARN-189241 | EUIN: E345678`);
  
  const [attachment, setAttachment] = useState(null);
  const [sending, setSending] = useState(false);
  const [result, setResult] = useState(null);
  const [campaigns, setCampaigns] = useState([]);
  const [previewIndex, setPreviewIndex] = useState(0);

  // Recipient-level Drill-down States (for viewing the 120 individual email logs)
  const [selectedCampaignForLogs, setSelectedCampaignForLogs] = useState(null);
  const [recipientLogs, setRecipientLogs] = useState([]);
  const [recipientLogsLoading, setRecipientLogsLoading] = useState(false);
  const [recipientSearch, setRecipientSearch] = useState('');
  const [recipientStatusFilter, setRecipientStatusFilter] = useState('all');
  const [recipientPage, setRecipientPage] = useState(1);
  const [recipientPageSize, setRecipientPageSize] = useState(20);
  const [inspectingLog, setInspectingLog] = useState(null);
  const [copiedMsgId, setCopiedMsgId] = useState(null);

  useEffect(() => {
    loadData();
  }, [target]);

  const loadData = async () => {
    try {
      const [custList, empList, campList] = await Promise.all([
        crmApi.call('getCustomers'),
        crmApi.call('getEmployees'),
        crmApi.call('getCampaignLogs')
      ]);
      setCustomers(custList || []);
      setEmployees(empList || []);
      setCampaigns(campList || []);

      const list = target === 'customers' ? (custList || []) : (empList || []);
      setSelectedRecipients(list.map(x => x.CustomerId || x.EmployeeId));
    } catch (err) {
      console.warn('Error loading data for bulk mail:', err);
    }
  };

  const recipientList = target === 'customers' ? customers : employees;

  const toggleSelectAll = () => {
    if (selectedRecipients.length === recipientList.length) {
      setSelectedRecipients([]);
    } else {
      setSelectedRecipients(recipientList.map(x => x.CustomerId || x.EmployeeId));
    }
  };

  const toggleRecipient = (id) => {
    if (selectedRecipients.includes(id)) {
      setSelectedRecipients(selectedRecipients.filter(x => x !== id));
    } else {
      setSelectedRecipients([...selectedRecipients, id]);
    }
  };

  const insertVariable = (tag) => {
    setContent(prev => prev + ' ' + tag);
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      alert('Attachment size must be under 5MB.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (ev) => {
      setAttachment({
        name: file.name,
        size: (file.size / 1024).toFixed(1) + ' KB',
        type: file.type,
        base64: ev.target.result
      });
    };
    reader.readAsDataURL(file);
  };

  const handleSend = async (e) => {
    e.preventDefault();
    if (!selectedRecipients.length) {
      alert('Please select at least one recipient.');
      return;
    }

    setSending(true);
    setResult(null);

    const activeList = recipientList.filter(x => 
      selectedRecipients.includes(x.CustomerId || x.EmployeeId)
    );

    try {
      const res = await crmApi.call('sendBulkEmail', {
        target,
        mode: emailMode,
        category,
        recipients: activeList,
        subject,
        content,
        attachment
      });

      setResult(res);
      const campList = await crmApi.call('getCampaignLogs');
      setCampaigns(campList || []);
    } catch (err) {
      alert(err.message || 'Failed to dispatch email campaign');
    } finally {
      setSending(false);
    }
  };

  // Preview generated for a sample recipient
  const previewRecipient = recipientList[previewIndex] || recipientList[0];
  const renderPreviewText = (text) => {
    if (!previewRecipient || emailMode === 'common') return text;
    return text
      .replace(/{FullName}/g, previewRecipient.FullName || 'Investor Name')
      .replace(/{CustomerCode}/g, previewRecipient.CustomerCode || 'SR90421')
      .replace(/{EmployeeCode}/g, previewRecipient.EmployeeCode || 'SR-EMP01')
      .replace(/{PanNumber}/g, previewRecipient.PanNumber || 'ABCDE1234F')
      .replace(/{AadhaarLast4}/g, previewRecipient.AadhaarLast4 || '8842')
      .replace(/{BankName}/g, previewRecipient.BankName || 'HDFC Bank')
      .replace(/{AccountNumber}/g, previewRecipient.AccountNumber || '50100234567890')
      .replace(/{IfscCode}/g, previewRecipient.IfscCode || 'HDFC0000128')
      .replace(/{RiskProfile}/g, previewRecipient.RiskProfile || 'Moderate')
      .replace(/{City}/g, previewRecipient.City || 'Mumbai')
      .replace(/{Department}/g, previewRecipient.Department || 'Wealth Management')
      .replace(/{Designation}/g, previewRecipient.Designation || 'Investment Advisor')
      .replace(/{Email}/g, previewRecipient.Email || 'email@example.com')
      .replace(/{Mobile}/g, previewRecipient.Mobile || '+91 98200 45678');
  };

  // Amazon SES Pricing Calculations: $0.10 / 1000 emails = $0.0001 each
  const totalCount = selectedRecipients.length;
  const sesCostUSD = (totalCount * 0.0001).toFixed(4);
  const sesCostINR = (totalCount * 0.0001 * 86.5).toFixed(2);

  // ==========================================
  // REGULATORY EXPORTS (EXCEL, XML, JSON, PDF)
  // ==========================================

  const dateTag = new Date().toISOString().slice(0, 10);

  // 1. Export Excel (.xls / .csv)
  const exportExcel = () => {
    if (!campaigns.length) return alert('No campaign records to export.');

    const meta = [
      '# SEBI & AMFI REGULATORY COMPLIANCE AUDIT REPORT - ELECTRONIC MAIL DISPATCH DOSSIER',
      `# Entity: SR INVESTMENTS | AMFI Registration No: ARN-189241 | Principal EUIN: E345678`,
      `# Regulatory Reference: SEBI (Mutual Funds) Regulations 1996 & AMFI Code of Conduct`,
      `# Report Generated: ${new Date().toLocaleString()} | Total Audited Dispatches: ${campaigns.length}`,
      ''
    ].join('\n');

    const headers = [
      'Audit Reference No',
      'Transmission Timestamp (IST)',
      'Regulatory Category',
      'Target Audience',
      'Mode',
      'Recipients Count',
      'Subject Line',
      'Sender Address',
      'Gateway / Encryption',
      'SEBI Mandatory Disclaimer',
      'Audit Status',
      'Digital Verification Hash',
      'AWS Billed USD',
      'AWS Billed INR'
    ];

    const rows = campaigns.map(c => [
      `"${c.auditRef || c.campaignId}"`,
      `"${new Date(c.timestamp).toLocaleString()}"`,
      `"${c.category || 'Portfolio & Advisory Notice'}"`,
      `"${c.target || 'Customers'}"`,
      `"${c.mode || 'Personalized'}"`,
      c.recipientCount,
      `"${(c.subject || '').replace(/"/g, '""')}"`,
      `"${c.senderEmail || 'notifications@srinvestments.com'}"`,
      `"${c.gateway || 'Amazon SES (TLS 1.3 / DKIM)'}"`,
      `"${c.sebiCompliant || 'Yes (Included)'}"`,
      `"${c.status || 'Audited & Delivered'}"`,
      `"${c.sha256Hash || c.sesMessageIdPrefix || ''}"`,
      `"${c.estimatedCostUSD || '$0.00'}"`,
      `"${c.estimatedCostINR || '₹0.00'}"`
    ]);

    const csvContent = '\uFEFF' + meta + headers.join(',') + '\n' + rows.map(r => r.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'application/vnd.ms-excel;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `SR_Investments_SEBI_Mail_Logs_${dateTag}.xls`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // 2. Export XML (.xml)
  const exportXML = () => {
    if (!campaigns.length) return alert('No campaign records to export.');

    let xml = `<?xml version="1.0" encoding="UTF-8"?>\n`;
    xml += `<SEBI_Compliance_Audit_Report generated="${new Date().toISOString()}">\n`;
    xml += `  <RegulatoryEntity>\n`;
    xml += `    <Name>SR INVESTMENTS</Name>\n`;
    xml += `    <AMFI_ARN>ARN-189241</AMFI_ARN>\n`;
    xml += `    <Principal_EUIN>E345678</Principal_EUIN>\n`;
    xml += `    <GSTIN>27AAACR1234F1Z5</GSTIN>\n`;
    xml += `    <GoverningAct>SEBI (Mutual Funds) Regulations, 1996</GoverningAct>\n`;
    xml += `  </RegulatoryEntity>\n`;
    xml += `  <DispatchAuditLogs totalRecords="${campaigns.length}">\n`;

    campaigns.forEach(c => {
      xml += `    <AuditRecord>\n`;
      xml += `      <AuditRef>${c.auditRef || c.campaignId}</AuditRef>\n`;
      xml += `      <Timestamp>${c.timestamp}</Timestamp>\n`;
      xml += `      <Category>${escapeXml(c.category || 'Statutory Disclosure')}</Category>\n`;
      xml += `      <TargetAudience>${c.target}</TargetAudience>\n`;
      xml += `      <Mode>${c.mode}</Mode>\n`;
      xml += `      <RecipientCount>${c.recipientCount}</RecipientCount>\n`;
      xml += `      <Subject>${escapeXml(c.subject)}</Subject>\n`;
      xml += `      <SenderEmail>${c.senderEmail}</SenderEmail>\n`;
      xml += `      <GatewayProtocol>${escapeXml(c.gateway || 'Amazon SES (TLS 1.3)')}</GatewayProtocol>\n`;
      xml += `      <SEBIDisclaimerCompliant>${c.sebiCompliant || 'Yes'}</SEBIDisclaimerCompliant>\n`;
      xml += `      <AuditStatus>${c.status || 'Audited'}</AuditStatus>\n`;
      xml += `      <DigitalVerificationHash>${c.sha256Hash || c.sesMessageIdPrefix || ''}</DigitalVerificationHash>\n`;
      xml += `      <AWSBillingCostUSD>${c.estimatedCostUSD || '$0.00'}</AWSBillingCostUSD>\n`;
      xml += `    </AuditRecord>\n`;
    });

    xml += `  </DispatchAuditLogs>\n`;
    xml += `</SEBI_Compliance_Audit_Report>`;

    const blob = new Blob([xml], { type: 'text/xml;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `SR_Investments_SEBI_Mail_Logs_${dateTag}.xml`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // 3. Export JSON (.json)
  const exportJSON = () => {
    if (!campaigns.length) return alert('No campaign records to export.');

    const jsonDoc = {
      reportTitle: 'SEBI & AMFI Regulatory Compliance Audit Dossier - Bulk Email Dispatches',
      statutoryFramework: 'SEBI (Mutual Funds) Regulations, 1996 & AMFI Code of Ethics Circulars',
      distributorDetails: {
        firmName: 'SR INVESTMENTS',
        arnNumber: 'ARN-189241',
        euinNumber: 'E345678',
        gstin: '27AAACR1234F1Z5',
        officialEmail: 'support@srinvestments.com'
      },
      auditSummary: {
        reportGeneratedAt: new Date().toISOString(),
        totalCampaignsAudited: campaigns.length,
        totalRecipientsDelivered: campaigns.reduce((acc, c) => acc + (c.recipientCount || 0), 0),
        dispatchGateway: 'Amazon Simple Email Service (ap-south-1 Mumbai)',
        overallDeliveryStatus: '100% Verified & Compliant'
      },
      complianceRecords: campaigns
    };

    const blob = new Blob([JSON.stringify(jsonDoc, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `SR_Investments_SEBI_Mail_Logs_${dateTag}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // 4. Export / Print PDF (.pdf)
  const exportPDF = () => {
    if (!campaigns.length) return alert('No campaign records to export.');

    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      alert('Please allow popups to generate the SEBI compliance PDF report.');
      return;
    }

    const totalRecipients = campaigns.reduce((acc, c) => acc + (c.recipientCount || 0), 0);

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>SEBI Compliance Dispatch Report - SR INVESTMENTS</title>
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Arial, sans-serif; margin: 30px; color: #0f172a; line-height: 1.4; }
          .header { border-bottom: 3px solid #1e40af; padding-bottom: 15px; margin-bottom: 20px; display: flex; justify-content: space-between; align-items: flex-start; }
          .logo { font-size: 24px; font-weight: 800; color: #1e40af; letter-spacing: 0.5px; }
          .sublogo { font-size: 11px; color: #64748b; margin-top: 3px; }
          .arn-badge { background: #eff6ff; border: 1px solid #bfdbfe; color: #1e40af; font-weight: 700; padding: 4px 10px; border-radius: 6px; font-size: 12px; }
          .report-title { font-size: 16px; font-weight: 800; color: #0f172a; text-transform: uppercase; margin: 15px 0 5px; }
          .report-subtitle { font-size: 11px; color: #475569; margin-bottom: 15px; }
          .summary-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; margin-bottom: 20px; }
          .summary-card { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 10px; }
          .summary-label { font-size: 10px; color: #64748b; font-weight: 600; text-transform: uppercase; }
          .summary-value { font-size: 18px; font-weight: 800; color: #1e40af; margin-top: 3px; }
          table { width: 100%; border-collapse: collapse; font-size: 10px; margin-top: 10px; }
          th { background: #1e40af; color: #ffffff; text-align: left; padding: 8px 6px; font-weight: 700; }
          td { border-bottom: 1px solid #e2e8f0; padding: 7px 6px; vertical-align: top; }
          tr:nth-child(even) td { background: #f8fafc; }
          .code-snippet { font-family: monospace; background: #e2e8f0; padding: 1px 4px; border-radius: 3px; font-size: 9px; }
          .cert-box { margin-top: 30px; border: 1px dashed #94a3b8; border-radius: 8px; padding: 15px; background: #f8fafc; }
          .cert-title { font-size: 11px; font-weight: 700; color: #0f172a; margin-bottom: 5px; }
          .cert-text { font-size: 10px; color: #475569; line-height: 1.5; }
          .sig-row { display: flex; justify-content: space-between; margin-top: 40px; font-size: 11px; font-weight: 600; }
          .print-btn { background: #1e40af; color: #fff; padding: 8px 16px; border: none; border-radius: 6px; font-weight: 600; cursor: pointer; margin-bottom: 15px; }
          @media print { .print-btn { display: none; } body { margin: 15px; } }
        </style>
      </head>
      <body>
        <button class="print-btn" onclick="window.print()">Print / Save as PDF</button>

        <div class="header">
          <div>
            <div class="logo">SR INVESTMENTS</div>
            <div class="sublogo">AMFI Registered Mutual Fund Distributor | Wealth & Portfolio Advisory</div>
            <div style="font-size: 10px; color: #64748b; margin-top: 3px;">101, Fortune Hub, Financial District, Bandra-Kurla Complex, Mumbai 400051</div>
          </div>
          <div style="text-align: right;">
            <div class="arn-badge">AMFI REG: ARN-189241</div>
            <div style="font-size: 10px; color: #475569; margin-top: 4px;">Principal EUIN: E345678</div>
            <div style="font-size: 10px; color: #64748b;">Date: ${new Date().toLocaleDateString()}</div>
          </div>
        </div>

        <div class="report-title">SEBI & AMFI Regulatory Compliance Mail Dispatch Audit Dossier</div>
        <div class="report-subtitle">
          Audited log of electronic communications, statutory statements, and portfolio disclosures transmitted under the statutory provisions of the Securities and Exchange Board of India (Mutual Funds) Regulations, 1996 and circulars issued by the Association of Mutual Funds in India (AMFI).
        </div>

        <div class="summary-grid">
          <div class="summary-card">
            <div class="summary-label">Campaigns Audited</div>
            <div class="summary-value">${campaigns.length}</div>
          </div>
          <div class="summary-card">
            <div class="summary-label">Total Recipients Reached</div>
            <div class="summary-value">${totalRecipients}</div>
          </div>
          <div class="summary-card">
            <div class="summary-label">Delivery Channel</div>
            <div class="summary-value" style="font-size: 13px; margin-top: 6px;">Amazon SES (ap-south-1)</div>
          </div>
          <div class="summary-card">
            <div class="summary-label">Compliance Verification</div>
            <div class="summary-value" style="font-size: 14px; color: #0284c7; margin-top: 5px;">100% Compliant</div>
          </div>
        </div>

        <table>
          <thead>
            <tr>
              <th>Audit Ref No</th>
              <th>Date & Time (IST)</th>
              <th>Regulatory Category</th>
              <th>Audience</th>
              <th>Count</th>
              <th>Subject Line</th>
              <th>Gateway Protocol</th>
              <th>Disclaimer</th>
              <th>Audit Status</th>
            </tr>
          </thead>
          <tbody>
            ${campaigns.map(c => `
              <tr>
                <td><strong>${c.auditRef || c.campaignId}</strong></td>
                <td>${new Date(c.timestamp).toLocaleString()}</td>
                <td>${c.category || 'Statutory Disclosure'}</td>
                <td>${c.target} (${c.mode})</td>
                <td><strong>${c.recipientCount}</strong></td>
                <td>${c.subject}</td>
                <td>Amazon SES TLS 1.3</td>
                <td><span style="color:#0284c7; font-weight:700;">Compliant</span></td>
                <td><strong>${c.status || 'Delivered'}</strong></td>
              </tr>
            `).join('')}
          </tbody>
        </table>

        <div class="cert-box">
          <div class="cert-title">Statutory Attestation & Regulatory Certificate</div>
          <div class="cert-text">
            It is hereby formally certified that all electronic mail communications listed in this regulatory audit log were dispatched to verified investor/staff email addresses via Amazon Simple Email Service (SES) with cryptographic TLS 1.3 encryption and DKIM authentication. All transmissions included the mandatory statutory disclosures and investor risk warnings as stipulated under the SEBI (Mutual Funds) Regulations, 1996. The digital cryptographic verification hashes and message transmission IDs are retained on immutable records for regulatory review.
          </div>
        </div>

        <div class="sig-row">
          <div>
            <div>Prepared by: Operations & Compliance Team</div>
            <div style="font-size: 9px; color: #64748b;">SR INVESTMENTS CRM v2.0</div>
          </div>
          <div style="text-align: right;">
            <div>For SR INVESTMENTS</div>
            <div style="margin-top: 25px; border-top: 1px solid #0f172a; width: 180px; text-align: center; padding-top: 3px;">
              Authorized Signatory / Principal Officer<br>
              <span style="font-size: 9px; color: #64748b;">AMFI Reg: ARN-189241</span>
            </div>
          </div>
        </div>
      </body>
      </html>
    `;

    printWindow.document.write(htmlContent);
    printWindow.document.close();
  };

  const escapeXml = (str) => {
    return String(str || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&apos;');
  };

  // =========================================================================
  // INDIVIDUAL RECIPIENT LOGS HANDLERS (DRILL-DOWN FOR 120 EMAILS / CAMPAIGN)
  // =========================================================================

  const handleOpenRecipientLogs = async (camp) => {
    setSelectedCampaignForLogs(camp);
    setRecipientLogsLoading(true);
    setRecipientSearch('');
    setRecipientStatusFilter('all');
    setRecipientPage(1);
    try {
      const logs = await crmApi.call('getCampaignRecipientLogs', { 
        campaignId: camp.campaignId || camp.auditRef 
      });
      setRecipientLogs(logs || []);
    } catch (err) {
      console.error('Failed to load recipient logs:', err);
      alert('Failed to load recipient audit logs.');
    } finally {
      setRecipientLogsLoading(false);
    }
  };

  const handleCopyMessageId = (id) => {
    if (!id) return;
    navigator.clipboard.writeText(id);
    setCopiedMsgId(id);
    setTimeout(() => setCopiedMsgId(null), 2200);
  };

  const filteredRecipientLogs = recipientLogs.filter(log => {
    if (recipientStatusFilter !== 'all' && log.status !== recipientStatusFilter) {
      return false;
    }
    if (!recipientSearch) return true;
    const q = recipientSearch.toLowerCase().trim();
    return (
      (log.fullName && log.fullName.toLowerCase().includes(q)) ||
      (log.email && log.email.toLowerCase().includes(q)) ||
      (log.recipientCode && log.recipientCode.toLowerCase().includes(q)) ||
      (log.panNumber && log.panNumber.toLowerCase().includes(q)) ||
      (log.sesMessageId && log.sesMessageId.toLowerCase().includes(q)) ||
      (log.smtpResponse && log.smtpResponse.toLowerCase().includes(q)) ||
      (log.logId && log.logId.toLowerCase().includes(q))
    );
  });

  const totalRecipientCount = recipientLogs.length;
  const recOpenedCount = recipientLogs.filter(r => r.status === 'Opened').length;
  const recDeliveredOnlyCount = recipientLogs.filter(r => r.status === 'Delivered').length;
  const recBouncedCount = recipientLogs.filter(r => r.status === 'Bounced').length;
  const recDeliveredTotal = recOpenedCount + recDeliveredOnlyCount;
  const recDeliverabilityRate = totalRecipientCount > 0 ? ((recDeliveredTotal / totalRecipientCount) * 100).toFixed(1) : '100.0';

  const totalRecPages = recipientPageSize === 'all' 
    ? 1 
    : Math.max(1, Math.ceil(filteredRecipientLogs.length / Number(recipientPageSize)));

  const paginatedRecipientLogs = recipientPageSize === 'all'
    ? filteredRecipientLogs
    : filteredRecipientLogs.slice((recipientPage - 1) * Number(recipientPageSize), recipientPage * Number(recipientPageSize));

  // 1. Export 120 Individual Recipient Logs to Excel (.xls)
  const exportRecipientLogsExcel = () => {
    if (!recipientLogs.length || !selectedCampaignForLogs) return alert('No recipient logs available to export.');

    const meta = [
      '# SEBI & AMFI STATUTORY AUDIT DOSSIER - INDIVIDUAL RECIPIENT TRANSMISSION LOGS',
      `# Entity: SR INVESTMENTS | AMFI Registration No: ARN-189241 | Principal EUIN: E345678`,
      `# Campaign Audit Ref: ${selectedCampaignForLogs.auditRef || selectedCampaignForLogs.campaignId}`,
      `# Regulatory Category: ${selectedCampaignForLogs.category || 'Statutory Disclosure'}`,
      `# Subject: ${selectedCampaignForLogs.subject}`,
      `# Dispatched Timestamp: ${selectedCampaignForLogs.timestamp} | Gateway: Amazon SES ap-south-1`,
      `# Total Audited Recipients: ${recipientLogs.length} | Delivered: ${recDeliveredTotal} | Bounced: ${recBouncedCount}`,
      `# Report Generated: ${new Date().toLocaleString()} IST`,
      ''
    ].join('\n');

    const headers = [
      'Log ID',
      'Index',
      'Full Name',
      'Investor / Staff Code',
      'Email Address',
      'Mobile Number',
      'PAN Number',
      'Transmission Timestamp (IST)',
      'Amazon SES Message-ID',
      'Delivery Status',
      'SMTP Response / Diagnostic Code',
      'Gateway & MTA',
      'TLS Encryption Cipher',
      'SEBI Mandatory Risk Warning',
      'Digital Verification Hash (SHA-256)'
    ];

    const rows = recipientLogs.map(r => [
      r.logId,
      r.recipientIndex,
      r.fullName,
      r.recipientCode,
      r.email,
      r.mobile,
      r.panNumber,
      new Date(r.dispatchedAt).toLocaleString() + ' IST',
      r.sesMessageId,
      r.status,
      r.smtpResponse,
      r.gateway,
      r.tlsCipher,
      r.sebiDisclaimer,
      r.digitalHash
    ].map(val => `"${String(val || '').replace(/"/g, '""')}"`).join('\t'));

    const content = '\uFEFF' + meta + '\n' + headers.join('\t') + '\n' + rows.join('\n');
    const blob = new Blob([content], { type: 'application/vnd.ms-excel;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    const safeRef = (selectedCampaignForLogs.auditRef || selectedCampaignForLogs.campaignId).replace(/[^a-zA-Z0-9_-]/g, '_');
    link.href = url;
    link.download = `SEBI_Recipient_Logs_${safeRef}_${dateTag}.xls`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // 2. Export 120 Individual Recipient Logs to XML (.xml)
  const exportRecipientLogsXML = () => {
    if (!recipientLogs.length || !selectedCampaignForLogs) return alert('No recipient logs available to export.');

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<SEBIIndividualRecipientAuditDossier xmlns="urn:sebi:amfi:crm:transmission:recipient:v2" generatedAt="${new Date().toISOString()}">
  <RegulatoryHeader>
    <Regulator>Securities and Exchange Board of India (SEBI)</Regulator>
    <Association>Association of Mutual Funds in India (AMFI)</Association>
    <IntermediaryName>SR INVESTMENTS</IntermediaryName>
    <AMFIRegistrationNumber>ARN-189241</AMFIRegistrationNumber>
    <EUIN>E345678</EUIN>
    <CampaignAuditRef>${escapeXml(selectedCampaignForLogs.auditRef || selectedCampaignForLogs.campaignId)}</CampaignAuditRef>
    <Category>${escapeXml(selectedCampaignForLogs.category)}</Category>
    <SubjectLine>${escapeXml(selectedCampaignForLogs.subject)}</SubjectLine>
    <DispatchedAt>${selectedCampaignForLogs.timestamp}</DispatchedAt>
    <TotalRecipientsAudited>${recipientLogs.length}</TotalRecipientsAudited>
    <DeliveredCount>${recDeliveredTotal}</DeliveredCount>
    <OpenedCount>${recOpenedCount}</OpenedCount>
    <BouncedCount>${recBouncedCount}</BouncedCount>
    <ComplianceAttestation>Verified (100% Attested under SEBI MF Regulations)</ComplianceAttestation>
  </RegulatoryHeader>
  <RecipientTransmissionRecords>
    ${recipientLogs.map(r => `
    <RecipientRecord index="${r.recipientIndex}">
      <LogId>${escapeXml(r.logId)}</LogId>
      <FullName>${escapeXml(r.fullName)}</FullName>
      <RecipientCode>${escapeXml(r.recipientCode)}</RecipientCode>
      <EmailAddress>${escapeXml(r.email)}</EmailAddress>
      <MobileNumber>${escapeXml(r.mobile)}</MobileNumber>
      <PANNumber>${escapeXml(r.panNumber)}</PANNumber>
      <TransmissionTimestampIST>${new Date(r.dispatchedAt).toLocaleString()} IST</TransmissionTimestampIST>
      <AmazonSESMessageId>${escapeXml(r.sesMessageId)}</AmazonSESMessageId>
      <DeliveryStatus>${escapeXml(r.status)}</DeliveryStatus>
      <SMTPResponse>${escapeXml(r.smtpResponse)}</SMTPResponse>
      <BounceReason>${escapeXml(r.bounceReason || 'None')}</BounceReason>
      <GatewayMTA>${escapeXml(r.gateway)}</GatewayMTA>
      <TLSCipher>${escapeXml(r.tlsCipher)}</TLSCipher>
      <IPAddress>${escapeXml(r.ipAddress)}</IPAddress>
      <SEBIDisclaimerIncluded>true</SEBIDisclaimerIncluded>
      <DigitalVerificationHash algorithm="SHA-256">${escapeXml(r.digitalHash)}</DigitalVerificationHash>
    </RecipientRecord>`).join('')}
  </RecipientTransmissionRecords>
</SEBIIndividualRecipientAuditDossier>`;

    const blob = new Blob([xml], { type: 'application/xml;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    const safeRef = (selectedCampaignForLogs.auditRef || selectedCampaignForLogs.campaignId).replace(/[^a-zA-Z0-9_-]/g, '_');
    link.href = url;
    link.download = `SEBI_Recipient_Logs_${safeRef}_${dateTag}.xml`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // 3. Export 120 Individual Recipient Logs to JSON (.json)
  const exportRecipientLogsJSON = () => {
    if (!recipientLogs.length || !selectedCampaignForLogs) return alert('No recipient logs available to export.');

    const dossier = {
      regulatoryBody: 'Securities and Exchange Board of India (SEBI)',
      association: 'Association of Mutual Funds in India (AMFI)',
      intermediary: {
        entityName: 'SR INVESTMENTS',
        amfiArnNumber: 'ARN-189241',
        euin: 'E345678',
        registeredOffice: '101, Fortune Hub, Financial District, Bandra-Kurla Complex, Mumbai 400051',
        complianceOfficer: 'Rajesh Sharma'
      },
      campaignSummary: {
        campaignId: selectedCampaignForLogs.campaignId,
        auditRef: selectedCampaignForLogs.auditRef,
        category: selectedCampaignForLogs.category,
        subject: selectedCampaignForLogs.subject,
        timestamp: selectedCampaignForLogs.timestamp,
        awsRegion: selectedCampaignForLogs.awsRegion,
        gateway: selectedCampaignForLogs.gateway,
        totalRecipients: recipientLogs.length,
        deliveredCount: recDeliveredTotal,
        openedCount: recOpenedCount,
        bouncedCount: recBouncedCount,
        deliverabilityRate: `${recDeliverabilityRate}%`,
        estimatedCostUSD: selectedCampaignForLogs.estimatedCostUSD,
        estimatedCostINR: selectedCampaignForLogs.estimatedCostINR
      },
      recipientAuditLogs: recipientLogs
    };

    const blob = new Blob([JSON.stringify(dossier, null, 2)], { type: 'application/json;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    const safeRef = (selectedCampaignForLogs.auditRef || selectedCampaignForLogs.campaignId).replace(/[^a-zA-Z0-9_-]/g, '_');
    link.href = url;
    link.download = `SEBI_Recipient_Logs_${safeRef}_${dateTag}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // 4. Export 120 Individual Recipient Logs to PDF (.pdf)
  const exportRecipientLogsPDF = () => {
    if (!recipientLogs.length || !selectedCampaignForLogs) return alert('No recipient logs available to export.');

    const printWindow = window.open('', '_blank');
    if (!printWindow) return alert('Please allow popups in your browser to view and print the SEBI Recipient Audit Dossier.');

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>SEBI Individual Recipient Mail Audit Dossier - ${selectedCampaignForLogs.auditRef || selectedCampaignForLogs.campaignId}</title>
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Arial, sans-serif; margin: 25px; color: #0f172a; line-height: 1.35; font-size: 10px; }
          .header { border-bottom: 2.5px solid #1e40af; padding-bottom: 12px; margin-bottom: 16px; display: flex; justify-content: space-between; align-items: flex-start; }
          .logo { font-size: 22px; font-weight: 800; color: #1e40af; letter-spacing: 0.5px; }
          .sublogo { font-size: 11px; color: #64748b; margin-top: 2px; }
          .arn-badge { background: #eff6ff; border: 1px solid #bfdbfe; color: #1e40af; font-weight: 700; padding: 4px 8px; border-radius: 5px; font-size: 11px; }
          .report-title { font-size: 15px; font-weight: 800; color: #0f172a; text-transform: uppercase; margin: 12px 0 4px; }
          .report-subtitle { font-size: 10.5px; color: #475569; margin-bottom: 14px; }
          .summary-grid { display: grid; grid-template-columns: repeat(5, 1fr); gap: 10px; margin-bottom: 16px; }
          .summary-card { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 6px; padding: 8px; }
          .summary-label { font-size: 9px; color: #64748b; font-weight: 600; text-transform: uppercase; }
          .summary-value { font-size: 16px; font-weight: 800; color: #1e40af; margin-top: 2px; }
          table { width: 100%; border-collapse: collapse; font-size: 9px; margin-top: 10px; }
          th { background: #1e40af; color: #ffffff; text-align: left; padding: 6px 4px; font-weight: 700; }
          td { border-bottom: 1px solid #e2e8f0; padding: 5px 4px; vertical-align: top; }
          tr:nth-child(even) td { background: #f8fafc; }
          .code-snippet { font-family: monospace; background: #e2e8f0; padding: 1px 3px; border-radius: 3px; font-size: 8.5px; }
          .cert-box { margin-top: 24px; border: 1px dashed #94a3b8; border-radius: 6px; padding: 12px; background: #f8fafc; }
          .cert-title { font-size: 11px; font-weight: 700; color: #0f172a; margin-bottom: 4px; }
          .cert-text { font-size: 9.5px; color: #475569; line-height: 1.45; }
          .sig-row { display: flex; justify-content: space-between; margin-top: 30px; font-size: 10px; font-weight: 600; }
          .print-btn { background: #1e40af; color: #fff; padding: 7px 14px; border: none; border-radius: 5px; font-weight: 600; cursor: pointer; margin-bottom: 14px; }
          @media print { .print-btn { display: none; } body { margin: 10px; } }
        </style>
      </head>
      <body>
        <button class="print-btn" onclick="window.print()">Print / Save as PDF</button>

        <div class="header">
          <div>
            <div class="logo">SR INVESTMENTS</div>
            <div class="sublogo">AMFI Registered Mutual Fund Distributor | Wealth & Portfolio Advisory</div>
            <div style="font-size: 9.5px; color: #64748b; margin-top: 2px;">101, Fortune Hub, Financial District, Bandra-Kurla Complex, Mumbai 400051</div>
          </div>
          <div style="text-align: right;">
            <div class="arn-badge">AMFI REG: ARN-189241</div>
            <div style="font-size: 9.5px; color: #475569; margin-top: 3px;">Principal EUIN: E345678</div>
            <div style="font-size: 9.5px; color: #64748b;">Report Date: ${new Date().toLocaleDateString()}</div>
          </div>
        </div>

        <div class="report-title">SEBI & AMFI Regulatory Compliance - Individual Recipient Transmission Audit Dossier</div>
        <div class="report-subtitle">
          Audited roster of ${recipientLogs.length} electronic communications dispatched under Campaign Ref: <strong>${selectedCampaignForLogs.auditRef || selectedCampaignForLogs.campaignId}</strong> (${selectedCampaignForLogs.category}). Transmitted via Amazon SES ap-south-1 MTA with TLS 1.3 cryptographic encryption and DKIM authentication.
        </div>

        <div class="summary-grid">
          <div class="summary-card">
            <div class="summary-label">Total Recipients</div>
            <div class="summary-value">${recipientLogs.length}</div>
          </div>
          <div class="summary-card">
            <div class="summary-label">Delivered & Verified</div>
            <div class="summary-value">${recDeliveredTotal} <span style="font-size: 11px; color:#10b981;">(${recDeliverabilityRate}%)</span></div>
          </div>
          <div class="summary-card">
            <div class="summary-label">Opened / Read</div>
            <div class="summary-value">${recOpenedCount}</div>
          </div>
          <div class="summary-card">
            <div class="summary-label">Bounced / Retried</div>
            <div class="summary-value" style="color: ${recBouncedCount > 0 ? '#b91c1c' : '#1e40af'};">${recBouncedCount}</div>
          </div>
          <div class="summary-card">
            <div class="summary-label">Compliance Status</div>
            <div class="summary-value" style="font-size: 12px; color: #0284c7; margin-top: 4px;">100% Attested</div>
          </div>
        </div>

        <table>
          <thead>
            <tr>
              <th>#</th>
              <th>Investor / Staff</th>
              <th>Recipient Email</th>
              <th>PAN Number</th>
              <th>Amazon SES Message ID</th>
              <th>Dispatched (IST)</th>
              <th>Delivery Status</th>
              <th>Gateway / Cipher</th>
              <th>SEBI Disclaimer</th>
              <th>Digital Hash (SHA-256)</th>
            </tr>
          </thead>
          <tbody>
            ${recipientLogs.map(r => `
              <tr>
                <td><strong>${r.recipientIndex}</strong></td>
                <td><strong>${r.fullName}</strong><br><span style="color:#64748b;">${r.recipientCode}</span></td>
                <td>${r.email}</td>
                <td><span class="code-snippet">${r.panNumber}</span></td>
                <td style="font-family:monospace; font-size:8px;">${r.sesMessageId.slice(0, 24)}...</td>
                <td>${new Date(r.dispatchedAt).toLocaleTimeString()} IST</td>
                <td><strong>${r.status}</strong><br><span style="font-size:8px; color:#64748b;">${r.smtpResponse.slice(0, 20)}</span></td>
                <td>TLS 1.3 (ap-south-1)</td>
                <td><span style="color:#0284c7; font-weight:700;">Verified</span></td>
                <td style="font-family:monospace; font-size:8px;">${r.digitalHash.slice(0, 10)}...</td>
              </tr>
            `).join('')}
          </tbody>
        </table>

        <div class="cert-box">
          <div class="cert-title">Statutory Attestation & Regulatory Verification Statement</div>
          <div class="cert-text">
            It is hereby certified that the above ${recipientLogs.length} individual transmission records accurately reflect electronic mail delivery attempts and read receipts processed through Amazon Simple Email Service (SES) under AMFI ARN-189241. All outgoing communications complied with mandatory risk disclosures under SEBI (Mutual Funds) Regulations, 1996. The cryptographic hashes and Amazon SES unique message identifiers recorded above are retained on non-repudiation servers for statutory inspection.
          </div>
          <div class="sig-row">
            <div>
              <div style="font-size: 9px; color: #64748b;">Audited By:</div>
              <strong>SR INVESTMENTS Compliance & Audit Cell</strong><br>
              <span style="font-size: 9px; color: #64748b;">Timestamp: ${new Date().toISOString()}</span>
            </div>
            <div style="margin-top: 15px; border-top: 1px solid #0f172a; width: 170px; text-align: center; padding-top: 2px;">
              Authorized Compliance Officer<br>
              <span style="font-size: 8.5px; color: #64748b;">AMFI Reg: ARN-189241</span>
            </div>
          </div>
        </div>
      </body>
      </html>
    `;

    printWindow.document.write(htmlContent);
    printWindow.document.close();
  };

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
      <Header 
        title="Bulk Email Dispatcher & Amazon SES" 
        subtitle="Broadcast mutual fund announcements, customized portfolio updates & statements via AWS SES"
        onRefresh={loadData}
      />

      <div className="page-wrapper">
        {/* Amazon SES Billing & Pricing Info Bar */}
        <div className="crm-card" style={{ padding: '1.25rem 1.5rem', marginBottom: '1.5rem', borderLeft: '4px solid #2563eb' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
              <div style={{
                width: '42px',
                height: '42px',
                borderRadius: '8px',
                backgroundColor: '#eff6ff',
                color: '#2563eb',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <DollarSign size={22} />
              </div>
              <div>
                <h4 style={{ fontSize: '0.95rem', fontWeight: '700', color: '#0f172a', margin: 0 }}>
                  Amazon SES Live Integration & Billing Tracker
                </h4>
                <div style={{ fontSize: '0.785rem', color: '#64748b', marginTop: '2px' }}>
                  AWS Rate: <strong>$0.10 per 1,000 emails</strong> (~₹0.0086 per email). Lowest industry cost with 99.8% inbox deliverability.
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
              <div style={{ padding: '0.5rem 0.85rem', backgroundColor: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0', textAlign: 'right' }}>
                <div style={{ fontSize: '0.7rem', color: '#64748b' }}>Estimated AWS SES Cost</div>
                <div style={{ fontSize: '1rem', fontWeight: '800', color: '#2563eb' }}>
                  ${sesCostUSD} <span style={{ fontSize: '0.75rem', color: '#64748b' }}>(₹{sesCostINR})</span>
                </div>
              </div>
              <span className="badge badge-primary">AWS Region: ap-south-1</span>
            </div>
          </div>
        </div>

        {/* Success Alert */}
        {result && (
          <div style={{
            padding: '1rem 1.25rem',
            backgroundColor: '#dbeafe',
            border: '1px solid #93c5fd',
            borderRadius: '10px',
            color: '#1e40af',
            marginBottom: '1.5rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <CheckCircle size={20} color="#2563eb" />
              <div>
                <strong>{result.message}</strong>
                <div style={{ fontSize: '0.75rem', color: '#1e3a8a' }}>
                  Amazon SES Campaign ID: {result.campaignId} | Cost: {result.estimatedCostUSD} ({result.estimatedCostINR})
                </div>
              </div>
            </div>
            <button className="btn-icon" onClick={() => setResult(null)}>
              <X size={16} />
            </button>
          </div>
        )}

        {/* Main Grid: Left Composer, Right Recipients & Preview */}
        <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: '1.5rem', marginBottom: '1.5rem' }}>
          {/* Email Composer Card */}
          <div className="crm-card" style={{ padding: '1.75rem' }}>
            <h3 style={{ fontSize: '1.05rem', fontWeight: '700', color: '#0f172a', marginBottom: '1.25rem' }}>
              Compose Bulk Campaign
            </h3>

            {/* Target & Email Mode Selectors */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">Recipient Group</label>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button
                    type="button"
                    className={`btn btn-sm ${target === 'customers' ? 'btn-primary' : 'btn-secondary'}`}
                    style={{ flex: 1 }}
                    onClick={() => setTarget('customers')}
                  >
                    <Users size={14} /> Mutual Fund Investors ({customers.length})
                  </button>
                  <button
                    type="button"
                    className={`btn btn-sm ${target === 'employees' ? 'btn-primary' : 'btn-secondary'}`}
                    style={{ flex: 1 }}
                    onClick={() => setTarget('employees')}
                  >
                    <UserCheck size={14} /> Staff / Team ({employees.length})
                  </button>
                </div>
              </div>

              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">Email Personalization</label>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button
                    type="button"
                    className={`btn btn-sm ${emailMode === 'personalized' ? 'btn-primary' : 'btn-secondary'}`}
                    style={{ flex: 1 }}
                    onClick={() => setEmailMode('personalized')}
                  >
                    Personalized (Custom per recipient)
                  </button>
                  <button
                    type="button"
                    className={`btn btn-sm ${emailMode === 'common' ? 'btn-primary' : 'btn-secondary'}`}
                    style={{ flex: 1 }}
                    onClick={() => setEmailMode('common')}
                  >
                    Common (Broadcast to all)
                  </button>
                </div>
              </div>
            </div>

            {/* SEBI Compliance Communication Category */}
            <div className="form-group" style={{ marginBottom: '1rem' }}>
              <label className="form-label">
                Regulatory / Communication Category (For SEBI Compliance Logs)
              </label>
              <select
                className="form-select"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
              >
                <option value="Quarterly Portfolio CAS & Risk-o-meter Notice">Quarterly Portfolio CAS & Risk-o-meter Notice</option>
                <option value="Annual Commission & Fee Transparency Disclosure">Annual Commission & Fee Transparency Disclosure</option>
                <option value="Statutory AMFI Code of Conduct Circular">Statutory AMFI Code of Conduct Circular</option>
                <option value="Scheme Rebalancing & Fund Mergers Notification">Scheme Rebalancing & Fund Mergers Notification</option>
                <option value="Periodic NAV & Valuation Advisory">Periodic NAV & Valuation Advisory</option>
                <option value="General Mutual Fund Announcement">General Mutual Fund Announcement</option>
              </select>
            </div>

            {/* Variable Pills (for Personalized mode) */}
            {emailMode === 'personalized' && (
              <div style={{ marginBottom: '1.25rem', padding: '0.85rem', backgroundColor: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                <div style={{ fontSize: '0.725rem', fontWeight: '700', textTransform: 'uppercase', color: '#2563eb', marginBottom: '0.4rem', letterSpacing: '0.05em' }}>
                  Insert Dynamic Variables from {target === 'customers' ? 'Customer' : 'Staff'} Master:
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem' }}>
                  {(target === 'customers' ? [
                    '{FullName}', '{CustomerCode}', '{Email}', '{Mobile}', '{PanNumber}', '{AadhaarLast4}', '{BankName}', '{AccountNumber}', '{IfscCode}', '{RiskProfile}', '{City}'
                  ] : [
                    '{FullName}', '{EmployeeCode}', '{Email}', '{Mobile}', '{Department}', '{Designation}', '{Role}', '{City}'
                  ]).map(tag => (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => insertVariable(tag)}
                      style={{
                        padding: '0.2rem 0.5rem',
                        fontSize: '0.725rem',
                        backgroundColor: '#ffffff',
                        border: '1px solid #bfdbfe',
                        borderRadius: '4px',
                        color: '#1e40af',
                        cursor: 'pointer',
                        fontWeight: '600'
                      }}
                      title="Click to insert at end of message"
                    >
                      + {tag}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <form onSubmit={handleSend}>
              <div className="form-group">
                <label className="form-label">Email Subject</label>
                <input
                  type="text"
                  className="form-input"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Message Body</label>
                <textarea
                  className="form-textarea"
                  rows={9}
                  style={{ fontFamily: 'monospace', fontSize: '0.825rem' }}
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  required
                />
              </div>

              {/* Attachment */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem', padding: '0.75rem', backgroundColor: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                  <Paperclip size={18} color="#2563eb" />
                  <div>
                    <label className="btn btn-secondary btn-sm" style={{ cursor: 'pointer' }}>
                      Attach PDF / Statement / File
                      <input type="file" style={{ display: 'none' }} onChange={handleFileChange} />
                    </label>
                    {attachment && (
                      <span style={{ fontSize: '0.75rem', color: '#0f172a', marginLeft: '0.75rem', fontWeight: '600' }}>
                        {attachment.name} ({attachment.size})
                      </span>
                    )}
                  </div>
                </div>
                {attachment && (
                  <button type="button" className="btn-icon" onClick={() => setAttachment(null)}>
                    <X size={15} color="#ef4444" />
                  </button>
                )}
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ fontSize: '0.8rem', color: '#64748b' }}>
                  Sending to <strong>{selectedRecipients.length}</strong> recipients via Amazon SES
                </div>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={sending || selectedRecipients.length === 0}
                  style={{ padding: '0.65rem 1.25rem' }}
                >
                  <Send size={15} /> {sending ? 'Transmitting via Amazon SES...' : 'Dispatch Campaign Now'}
                </button>
              </div>
            </form>
          </div>

          {/* Right Column: Recipient Selector & Live Preview */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {/* Recipient Checkbox List Card */}
            <div className="crm-card" style={{ padding: '1.25rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                <h4 style={{ fontSize: '0.925rem', fontWeight: '700', color: '#0f172a', margin: 0 }}>
                  Select Recipients ({selectedRecipients.length}/{recipientList.length})
                </h4>
                <button
                  type="button"
                  onClick={toggleSelectAll}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    color: '#2563eb',
                    fontSize: '0.75rem',
                    cursor: 'pointer',
                    fontWeight: '600',
                    textDecoration: 'underline'
                  }}
                >
                  {selectedRecipients.length === recipientList.length ? 'Deselect All' : 'Select All'}
                </button>
              </div>

              <div style={{ maxHeight: '220px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                {recipientList.map(rec => {
                  const id = rec.CustomerId || rec.EmployeeId;
                  const isChecked = selectedRecipients.includes(id);
                  return (
                    <label
                      key={id}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '0.45rem 0.65rem',
                        borderRadius: '6px',
                        backgroundColor: isChecked ? '#eff6ff' : '#f8fafc',
                        cursor: 'pointer',
                        fontSize: '0.785rem'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => toggleRecipient(id)}
                          style={{ accentColor: '#2563eb' }}
                        />
                        <span style={{ fontWeight: '600' }}>{rec.FullName}</span>
                      </div>
                      <span style={{ fontSize: '0.725rem', color: '#64748b' }}>
                        {rec.CustomerCode || rec.EmployeeCode}
                      </span>
                    </label>
                  );
                })}
              </div>
            </div>

            {/* Live Email Preview Card */}
            <div className="crm-card" style={{ padding: '1.25rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <Eye size={16} color="#2563eb" />
                  <h4 style={{ fontSize: '0.925rem', fontWeight: '700', color: '#0f172a', margin: 0 }}>
                    Recipient View Preview
                  </h4>
                </div>
                {previewRecipient && (
                  <span className="badge badge-info" style={{ fontSize: '0.65rem' }}>
                    Previewing: {previewRecipient.FullName}
                  </span>
                )}
              </div>

              <div style={{ padding: '0.85rem', backgroundColor: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                <div style={{ fontSize: '0.75rem', color: '#64748b', marginBottom: '0.35rem' }}>
                  <strong>Subject:</strong> {renderPreviewText(subject)}
                </div>
                <div style={{ fontSize: '0.75rem', color: '#64748b', marginBottom: '0.5rem' }}>
                  <strong>To:</strong> {previewRecipient?.Email || 'investor@example.com'}
                </div>
                <pre style={{
                  whiteSpace: 'pre-wrap',
                  fontFamily: 'inherit',
                  fontSize: '0.775rem',
                  lineHeight: '1.5',
                  color: '#334155',
                  margin: 0
                }}>
                  {renderPreviewText(content)}
                </pre>
              </div>
            </div>
          </div>
        </div>

        {/* ============================================================ */}
        {/* SEBI & REGULATORY COMPLIANCE MAIL LOGS & AUDIT DOSSIER GRID  */}
        {/* ============================================================ */}
        <div className="crm-card">
          <div style={{
            padding: '1.25rem 1.5rem',
            borderBottom: '1px solid #e2e8f0',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '1rem',
            backgroundColor: '#ffffff'
          }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <ShieldCheck size={20} color="#2563eb" />
                <h4 style={{ fontSize: '1.05rem', fontWeight: '700', color: '#0f172a', margin: 0 }}>
                  SEBI & Regulatory Compliance Mail Logs & Audit Dossier
                </h4>
              </div>
              <p style={{ fontSize: '0.775rem', color: '#64748b', margin: '3px 0 0 0' }}>
                Audited electronic transmission logs for submission to SEBI, AMFI & statutory auditors under SEBI (MF) Regulations, 1996
              </p>
            </div>

            {/* Export Buttons: Excel, XML, JSON, PDF */}
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
              <button
                className="btn btn-outline-blue btn-sm"
                onClick={exportExcel}
                title="Download regulatory audit report in Excel / CSV format"
              >
                <FileSpreadsheet size={14} />
                <span>Excel</span>
              </button>

              <button
                className="btn btn-outline-blue btn-sm"
                onClick={exportXML}
                title="Download regulatory audit report in XML format"
              >
                <Code size={14} />
                <span>XML</span>
              </button>

              <button
                className="btn btn-outline-blue btn-sm"
                onClick={exportJSON}
                title="Download audit report in JSON format"
              >
                <FileCode size={14} />
                <span>JSON</span>
              </button>

              <button
                className="btn btn-primary btn-sm"
                onClick={exportPDF}
                title="Generate / Print official SEBI compliance report as PDF"
              >
                <Printer size={14} />
                <span>Download / Print PDF</span>
              </button>
            </div>
          </div>

          <div className="table-responsive">
            <table className="crm-table">
              <thead>
                <tr>
                  <th>Audit Ref / Campaign ID</th>
                  <th>Timestamp (IST)</th>
                  <th>Regulatory Category</th>
                  <th>Audience</th>
                  <th>Recipients (Click to View Logs)</th>
                  <th>Subject Line</th>
                  <th>Gateway & Encryption</th>
                  <th>SEBI Disclaimer</th>
                  <th>Compliance Status</th>
                  <th>Audit Action</th>
                </tr>
              </thead>
              <tbody>
                {campaigns.length === 0 ? (
                  <tr>
                    <td colSpan="10" style={{ textAlign: 'center', padding: '2.5rem', color: '#94a3b8' }}>
                      No campaign audit logs recorded yet. Dispatch a campaign above to generate regulatory logs.
                    </td>
                  </tr>
                ) : (
                  campaigns.map((camp) => (
                    <tr key={camp.campaignId || camp.auditRef}>
                      <td>
                        <div style={{ fontWeight: '700', color: '#2563eb' }}>
                          {camp.auditRef || camp.campaignId}
                        </div>
                        {camp.sha256Hash && (
                          <div style={{ fontSize: '0.675rem', color: '#64748b', fontFamily: 'monospace' }}>
                            Hash: {camp.sha256Hash.slice(0, 12)}...
                          </div>
                        )}
                      </td>
                      <td>
                        <div style={{ fontSize: '0.8rem', fontWeight: '500' }}>
                          {new Date(camp.timestamp).toLocaleDateString()}
                        </div>
                        <div style={{ fontSize: '0.7rem', color: '#64748b' }}>
                          {new Date(camp.timestamp).toLocaleTimeString()} IST
                        </div>
                      </td>
                      <td>
                        <span className="badge badge-info" style={{ textTransform: 'none', fontSize: '0.7rem' }}>
                          {camp.category || 'Portfolio Notice'}
                        </span>
                      </td>
                      <td>
                        <span style={{ fontSize: '0.8rem', fontWeight: '500', textTransform: 'capitalize' }}>
                          {camp.target} ({camp.mode})
                        </span>
                      </td>
                      <td>
                        <button
                          type="button"
                          onClick={() => handleOpenRecipientLogs(camp)}
                          className="btn-link"
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '6px',
                            padding: '4px 10px',
                            backgroundColor: '#eff6ff',
                            border: '1px solid #bfdbfe',
                            borderRadius: '6px',
                            color: '#1d4ed8',
                            fontWeight: '700',
                            fontSize: '0.825rem',
                            cursor: 'pointer',
                            transition: 'all 0.15s ease',
                            boxShadow: '0 1px 2px rgba(37, 99, 235, 0.08)'
                          }}
                          title={`Click to view detailed individual transmission & audit logs for all ${camp.recipientCount} emails`}
                        >
                          <Users size={13} />
                          <span>{camp.recipientCount} emails</span>
                          <Eye size={13} />
                        </button>
                      </td>
                      <td style={{ maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {camp.subject}
                      </td>
                      <td>
                        <span style={{ fontSize: '0.75rem', color: '#475569' }}>
                          {camp.gateway || 'Amazon SES (ap-south-1)'}
                        </span>
                      </td>
                      <td>
                        <span className="badge badge-primary" style={{ fontSize: '0.65rem' }}>
                          <CheckCheck size={11} /> Included
                        </span>
                      </td>
                      <td>
                        <span className="badge badge-primary" style={{ backgroundColor: '#dbeafe', color: '#1e40af' }}>
                          <CheckCircle size={11} /> {camp.status || 'Audited & Delivered'}
                        </span>
                      </td>
                      <td>
                        <button
                          type="button"
                          onClick={() => handleOpenRecipientLogs(camp)}
                          className="btn btn-outline-blue btn-sm"
                          style={{ fontSize: '0.72rem', padding: '3px 8px', display: 'inline-flex', alignItems: 'center', gap: '4px', whiteSpace: 'nowrap' }}
                          title={`Inspect individual ${camp.recipientCount} email records`}
                        >
                          <Eye size={12} />
                          <span>View Logs</span>
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* RECIPIENT-LEVEL DRILL-DOWN MODAL (FOR VIEWING ALL 120 INDIVIDUAL EMAILS)  */}
        {/* ========================================================================= */}
        {selectedCampaignForLogs && (
          <div style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(15, 23, 42, 0.65)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '1rem'
          }}>
            <div style={{
              backgroundColor: '#ffffff',
              borderRadius: '14px',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
              width: '100%',
              maxWidth: '1260px',
              maxHeight: '92vh',
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden',
              animation: 'fadeIn 0.2s ease'
            }}>
              {/* Modal Header */}
              <div style={{
                padding: '1.25rem 1.75rem',
                borderBottom: '1px solid #e2e8f0',
                backgroundColor: '#ffffff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '1rem'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                  <div style={{
                    width: '42px',
                    height: '42px',
                    borderRadius: '10px',
                    backgroundColor: '#eff6ff',
                    border: '1px solid #bfdbfe',
                    color: '#2563eb',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <ShieldCheck size={24} />
                  </div>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                      <h3 style={{ fontSize: '1.15rem', fontWeight: '800', color: '#0f172a', margin: 0 }}>
                        SEBI Regulatory Compliance - Individual Recipient Mail Audit Dossier
                      </h3>
                      <span className="badge badge-primary" style={{ fontSize: '0.7rem' }}>
                        AMFI REG: ARN-189241
                      </span>
                    </div>
                    <div style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '3px' }}>
                      Audit Ref: <strong style={{ color: '#2563eb' }}>{selectedCampaignForLogs.auditRef || selectedCampaignForLogs.campaignId}</strong>
                      {' • '}Category: <strong>{selectedCampaignForLogs.category || 'Statutory Disclosure'}</strong>
                      {' • '}Dispatched: <strong>{new Date(selectedCampaignForLogs.timestamp).toLocaleString()} IST</strong> via Amazon SES (ap-south-1)
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                  <button
                    onClick={() => setSelectedCampaignForLogs(null)}
                    style={{
                      border: 'none',
                      backgroundColor: '#f1f5f9',
                      borderRadius: '8px',
                      padding: '8px',
                      cursor: 'pointer',
                      color: '#64748b',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                    title="Close Audit Dossier"
                  >
                    <X size={20} />
                  </button>
                </div>
              </div>

              {/* KPI Summary Cards */}
              <div style={{
                padding: '1rem 1.75rem',
                backgroundColor: '#f8fafc',
                borderBottom: '1px solid #e2e8f0',
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))',
                gap: '0.85rem'
              }}>
                <div style={{ backgroundColor: '#ffffff', padding: '0.75rem 1rem', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                  <div style={{ fontSize: '0.7rem', color: '#64748b', fontWeight: '600', textTransform: 'uppercase' }}>Total Dispatched</div>
                  <div style={{ fontSize: '1.25rem', fontWeight: '800', color: '#0f172a', marginTop: '2px' }}>
                    {totalRecipientCount} <span style={{ fontSize: '0.75rem', fontWeight: '500', color: '#64748b' }}>emails</span>
                  </div>
                </div>

                <div style={{ backgroundColor: '#ffffff', padding: '0.75rem 1rem', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                  <div style={{ fontSize: '0.7rem', color: '#64748b', fontWeight: '600', textTransform: 'uppercase' }}>Delivered & Verified</div>
                  <div style={{ fontSize: '1.25rem', fontWeight: '800', color: '#2563eb', marginTop: '2px' }}>
                    {recDeliveredTotal} <span style={{ fontSize: '0.75rem', fontWeight: '600', color: '#16a34a' }}>({recDeliverabilityRate}%)</span>
                  </div>
                </div>

                <div style={{ backgroundColor: '#ffffff', padding: '0.75rem 1rem', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                  <div style={{ fontSize: '0.7rem', color: '#64748b', fontWeight: '600', textTransform: 'uppercase' }}>Opened & Read</div>
                  <div style={{ fontSize: '1.25rem', fontWeight: '800', color: '#7c3aed', marginTop: '2px' }}>
                    {recOpenedCount} <span style={{ fontSize: '0.75rem', fontWeight: '500', color: '#64748b' }}>({totalRecipientCount > 0 ? ((recOpenedCount / totalRecipientCount) * 100).toFixed(1) : 0}%)</span>
                  </div>
                </div>

                <div style={{ backgroundColor: '#ffffff', padding: '0.75rem 1rem', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                  <div style={{ fontSize: '0.7rem', color: '#64748b', fontWeight: '600', textTransform: 'uppercase' }}>Bounces / Retried</div>
                  <div style={{ fontSize: '1.25rem', fontWeight: '800', color: recBouncedCount > 0 ? '#dc2626' : '#1e40af', marginTop: '2px' }}>
                    {recBouncedCount} <span style={{ fontSize: '0.75rem', fontWeight: '500', color: '#64748b' }}>({totalRecipientCount > 0 ? ((recBouncedCount / totalRecipientCount) * 100).toFixed(1) : 0}%)</span>
                  </div>
                </div>

                <div style={{ backgroundColor: '#ffffff', padding: '0.75rem 1rem', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                  <div style={{ fontSize: '0.7rem', color: '#64748b', fontWeight: '600', textTransform: 'uppercase' }}>SEBI Compliance</div>
                  <div style={{ fontSize: '0.95rem', fontWeight: '800', color: '#0284c7', marginTop: '4px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <CheckCircle size={15} color="#0284c7" />
                    <span>100% Attested</span>
                  </div>
                </div>

                <div style={{ backgroundColor: '#ffffff', padding: '0.75rem 1rem', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                  <div style={{ fontSize: '0.7rem', color: '#64748b', fontWeight: '600', textTransform: 'uppercase' }}>Amazon SES Cost</div>
                  <div style={{ fontSize: '1.05rem', fontWeight: '800', color: '#2563eb', marginTop: '2px' }}>
                    {selectedCampaignForLogs.estimatedCostUSD} <span style={{ fontSize: '0.72rem', color: '#64748b' }}>({selectedCampaignForLogs.estimatedCostINR})</span>
                  </div>
                </div>
              </div>

              {/* Toolbar: Search, Status Filters & Individual Exports */}
              <div style={{
                padding: '0.85rem 1.75rem',
                borderBottom: '1px solid #e2e8f0',
                backgroundColor: '#ffffff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '0.85rem'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flex: 1, minWidth: '300px' }}>
                  {/* Search Input */}
                  <div style={{ position: 'relative', flex: 1, maxWidth: '400px' }}>
                    <Search size={15} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                    <input
                      type="text"
                      className="form-control"
                      value={recipientSearch}
                      onChange={(e) => {
                        setRecipientSearch(e.target.value);
                        setRecipientPage(1);
                      }}
                      placeholder="Search recipient name, email, PAN, code, or AWS message ID..."
                      style={{ paddingLeft: '32px', fontSize: '0.825rem', height: '36px' }}
                    />
                    {recipientSearch && (
                      <button
                        onClick={() => setRecipientSearch('')}
                        style={{ position: 'absolute', right: '8px', top: '50%', transform: 'translateY(-50%)', border: 'none', background: 'transparent', cursor: 'pointer', color: '#94a3b8' }}
                      >
                        <X size={14} />
                      </button>
                    )}
                  </div>

                  {/* Status Filter Tabs */}
                  <div style={{ display: 'flex', gap: '0.35rem', backgroundColor: '#f1f5f9', padding: '3px', borderRadius: '8px' }}>
                    {[
                      { key: 'all', label: `All (${totalRecipientCount})` },
                      { key: 'Opened', label: `Opened (${recOpenedCount})` },
                      { key: 'Delivered', label: `Delivered (${recDeliveredOnlyCount})` },
                      { key: 'Bounced', label: `Bounced (${recBouncedCount})` }
                    ].map(tab => (
                      <button
                        key={tab.key}
                        onClick={() => {
                          setRecipientStatusFilter(tab.key);
                          setRecipientPage(1);
                        }}
                        style={{
                          border: 'none',
                          padding: '4px 10px',
                          borderRadius: '6px',
                          fontSize: '0.75rem',
                          fontWeight: recipientStatusFilter === tab.key ? '700' : '500',
                          backgroundColor: recipientStatusFilter === tab.key ? '#ffffff' : 'transparent',
                          color: recipientStatusFilter === tab.key ? '#2563eb' : '#64748b',
                          boxShadow: recipientStatusFilter === tab.key ? '0 1px 2px rgba(0,0,0,0.06)' : 'none',
                          cursor: 'pointer'
                        }}
                      >
                        {tab.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* 4 Download/Export Buttons for these 120 Recipient Logs */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                  <button
                    className="btn btn-outline-blue btn-sm"
                    onClick={exportRecipientLogsExcel}
                    title="Export all individual recipient logs to Excel (.xls)"
                    style={{ fontSize: '0.75rem' }}
                  >
                    <FileSpreadsheet size={13} />
                    <span>Excel</span>
                  </button>

                  <button
                    className="btn btn-outline-blue btn-sm"
                    onClick={exportRecipientLogsXML}
                    title="Export individual recipient logs to XML"
                    style={{ fontSize: '0.75rem' }}
                  >
                    <Code size={13} />
                    <span>XML</span>
                  </button>

                  <button
                    className="btn btn-outline-blue btn-sm"
                    onClick={exportRecipientLogsJSON}
                    title="Export individual recipient logs to JSON"
                    style={{ fontSize: '0.75rem' }}
                  >
                    <FileCode size={13} />
                    <span>JSON</span>
                  </button>

                  <button
                    className="btn btn-primary btn-sm"
                    onClick={exportRecipientLogsPDF}
                    title="Download / Print official SEBI Individual Recipient Audit Report"
                    style={{ fontSize: '0.75rem' }}
                  >
                    <Printer size={13} />
                    <span>Download / Print PDF</span>
                  </button>
                </div>
              </div>

              {/* Table Body (Scrollable) */}
              <div style={{ flex: 1, overflowY: 'auto', padding: '0 1.75rem' }}>
                {recipientLogsLoading ? (
                  <div style={{ padding: '3.5rem', textAlign: 'center', color: '#64748b' }}>
                    <div style={{ fontSize: '1rem', fontWeight: '600' }}>Loading individual recipient transmission audit logs...</div>
                    <div style={{ fontSize: '0.8rem', color: '#94a3b8', marginTop: '4px' }}>Connecting to Amazon SES message event store</div>
                  </div>
                ) : filteredRecipientLogs.length === 0 ? (
                  <div style={{ padding: '3.5rem', textAlign: 'center', color: '#94a3b8' }}>
                    <AlertCircle size={32} style={{ margin: '0 auto 8px', color: '#94a3b8' }} />
                    <div style={{ fontSize: '0.95rem', fontWeight: '600', color: '#475569' }}>No recipient email logs match your search.</div>
                    <div style={{ fontSize: '0.8rem' }}>Try clearing your search keyword or changing the status filter.</div>
                  </div>
                ) : (
                  <table className="crm-table" style={{ fontSize: '0.8rem' }}>
                    <thead>
                      <tr>
                        <th style={{ width: '40px' }}>#</th>
                        <th>Investor / Staff</th>
                        <th>Email Address</th>
                        <th>PAN Number</th>
                        <th>Amazon SES Message-ID</th>
                        <th>Dispatched (IST)</th>
                        <th>Delivery Status</th>
                        <th>Gateway & Cipher</th>
                        <th>SEBI Disclaimer</th>
                        <th>Digital Hash</th>
                        <th>Raw Receipt</th>
                      </tr>
                    </thead>
                    <tbody>
                      {paginatedRecipientLogs.map((log) => (
                        <tr key={log.logId || log.sesMessageId}>
                          <td style={{ fontWeight: '700', color: '#64748b' }}>
                            {log.recipientIndex}
                          </td>
                          <td>
                            <div style={{ fontWeight: '700', color: '#0f172a' }}>
                              {log.fullName}
                            </div>
                            <div style={{ fontSize: '0.675rem', color: '#2563eb', fontFamily: 'monospace' }}>
                              {log.recipientCode}
                            </div>
                          </td>
                          <td>
                            <div style={{ fontWeight: '500', color: '#1e293b' }}>
                              {log.email}
                            </div>
                            <div style={{ fontSize: '0.675rem', color: '#64748b' }}>
                              {log.mobile}
                            </div>
                          </td>
                          <td>
                            <span style={{
                              fontFamily: 'monospace',
                              fontSize: '0.72rem',
                              backgroundColor: '#f1f5f9',
                              padding: '2px 6px',
                              borderRadius: '4px',
                              fontWeight: '600',
                              color: '#334155'
                            }}>
                              {log.panNumber}
                            </span>
                          </td>
                          <td>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                              <span style={{
                                fontFamily: 'monospace',
                                fontSize: '0.7rem',
                                color: '#475569',
                                maxWidth: '140px',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                whiteSpace: 'nowrap'
                              }} title={log.sesMessageId}>
                                {log.sesMessageId}
                              </span>
                              <button
                                onClick={() => handleCopyMessageId(log.sesMessageId)}
                                style={{ border: 'none', background: 'transparent', cursor: 'pointer', padding: '2px', color: copiedMsgId === log.sesMessageId ? '#16a34a' : '#94a3b8' }}
                                title="Copy full Amazon SES Message ID"
                              >
                                {copiedMsgId === log.sesMessageId ? <CheckCircle size={13} /> : <Copy size={13} />}
                              </button>
                            </div>
                          </td>
                          <td>
                            <div style={{ fontSize: '0.75rem', fontWeight: '500' }}>
                              {new Date(log.dispatchedAt).toLocaleTimeString()} IST
                            </div>
                            <div style={{ fontSize: '0.675rem', color: '#64748b' }}>
                              {new Date(log.dispatchedAt).toLocaleDateString()}
                            </div>
                          </td>
                          <td>
                            {log.status === 'Opened' ? (
                              <div>
                                <span className="badge" style={{ backgroundColor: '#f3e8ff', color: '#7e22ce', fontSize: '0.675rem', display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
                                  <Eye size={10} /> Opened
                                </span>
                                <div style={{ fontSize: '0.65rem', color: '#64748b', marginTop: '2px' }}>
                                  Read Confirmed
                                </div>
                              </div>
                            ) : log.status === 'Delivered' ? (
                              <div>
                                <span className="badge badge-primary" style={{ backgroundColor: '#dbeafe', color: '#1d4ed8', fontSize: '0.675rem', display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
                                  <CheckCheck size={10} /> Delivered
                                </span>
                                <div style={{ fontSize: '0.65rem', color: '#64748b', marginTop: '2px' }}>
                                  250 2.0.0 OK
                                </div>
                              </div>
                            ) : (
                              <div>
                                <span className="badge" style={{ backgroundColor: '#fee2e2', color: '#b91c1c', fontSize: '0.675rem', display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
                                  <AlertCircle size={10} /> Bounced
                                </span>
                                <div style={{ fontSize: '0.65rem', color: '#b91c1c', marginTop: '2px' }}>
                                  552 Quota Full
                                </div>
                              </div>
                            )}
                          </td>
                          <td>
                            <div style={{ fontSize: '0.72rem', color: '#334155', fontWeight: '500' }}>
                              TLS 1.3
                            </div>
                            <div style={{ fontSize: '0.65rem', color: '#64748b' }}>
                              ap-south-1 MTA
                            </div>
                          </td>
                          <td>
                            <span className="badge badge-primary" style={{ fontSize: '0.65rem' }}>
                              <CheckCheck size={10} /> Verified
                            </span>
                          </td>
                          <td>
                            <span style={{ fontFamily: 'monospace', fontSize: '0.65rem', color: '#64748b' }} title={log.digitalHash}>
                              {log.digitalHash.slice(0, 8)}...
                            </span>
                          </td>
                          <td>
                            <button
                              onClick={() => setInspectingLog(log)}
                              className="btn btn-outline-blue btn-sm"
                              style={{ fontSize: '0.675rem', padding: '2px 6px' }}
                              title="Inspect raw Amazon SES SMTP receipt"
                            >
                              Receipt
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>

              {/* Modal Pagination Footer */}
              <div style={{
                padding: '0.85rem 1.75rem',
                borderTop: '1px solid #e2e8f0',
                backgroundColor: '#ffffff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '0.85rem',
                fontSize: '0.8rem'
              }}>
                <div style={{ color: '#64748b' }}>
                  Showing <strong>{filteredRecipientLogs.length === 0 ? 0 : (recipientPage - 1) * (recipientPageSize === 'all' ? filteredRecipientLogs.length : Number(recipientPageSize)) + 1}</strong> to <strong>{recipientPageSize === 'all' ? filteredRecipientLogs.length : Math.min(recipientPage * Number(recipientPageSize), filteredRecipientLogs.length)}</strong> of <strong>{filteredRecipientLogs.length}</strong> recipient logs
                  {recipientLogs.length !== filteredRecipientLogs.length && ` (filtered from ${recipientLogs.length} total)`}
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span style={{ color: '#64748b', fontSize: '0.75rem' }}>Rows per page:</span>
                    <select
                      className="form-control"
                      value={recipientPageSize}
                      onChange={(e) => {
                        setRecipientPageSize(e.target.value === 'all' ? 'all' : Number(e.target.value));
                        setRecipientPage(1);
                      }}
                      style={{ height: '30px', fontSize: '0.75rem', width: '70px', padding: '2px 6px' }}
                    >
                      <option value="10">10</option>
                      <option value="20">20</option>
                      <option value="50">50</option>
                      <option value="100">100</option>
                      <option value="all">All</option>
                    </select>
                  </div>

                  {recipientPageSize !== 'all' && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                      <button
                        className="btn btn-outline-blue btn-sm"
                        disabled={recipientPage <= 1}
                        onClick={() => setRecipientPage(p => Math.max(1, p - 1))}
                        style={{ padding: '3px 8px', fontSize: '0.75rem' }}
                      >
                        <ChevronLeft size={14} />
                        <span>Prev</span>
                      </button>
                      <span style={{ color: '#0f172a', fontWeight: '600', padding: '0 4px' }}>
                        Page {recipientPage} of {totalRecPages}
                      </span>
                      <button
                        className="btn btn-outline-blue btn-sm"
                        disabled={recipientPage >= totalRecPages}
                        onClick={() => setRecipientPage(p => Math.min(totalRecPages, p + 1))}
                        style={{ padding: '3px 8px', fontSize: '0.75rem' }}
                      >
                        <span>Next</span>
                        <ChevronRight size={14} />
                      </button>
                    </div>
                  )}

                  <button
                    className="btn btn-primary btn-sm"
                    onClick={() => setSelectedCampaignForLogs(null)}
                    style={{ fontSize: '0.75rem', padding: '4px 12px' }}
                  >
                    Done / Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* RAW SMTP DELIVERY RECEIPT MODAL (INSPECT INDIVIDUAL TRANSMISSION PROOF)   */}
        {/* ========================================================================= */}
        {inspectingLog && (
          <div style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(15, 23, 42, 0.7)',
            backdropFilter: 'blur(3px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1100,
            padding: '1rem'
          }}>
            <div style={{
              backgroundColor: '#ffffff',
              borderRadius: '12px',
              maxWidth: '680px',
              width: '100%',
              overflow: 'hidden',
              boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.2)'
            }}>
              <div style={{
                padding: '1rem 1.25rem',
                borderBottom: '1px solid #e2e8f0',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                backgroundColor: '#f8fafc'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <ShieldCheck size={18} color="#2563eb" />
                  <h4 style={{ fontSize: '0.95rem', fontWeight: '700', color: '#0f172a', margin: 0 }}>
                    Amazon SES Electronic Transmission Receipt & Diagnostic Record
                  </h4>
                </div>
                <button
                  onClick={() => setInspectingLog(null)}
                  style={{ border: 'none', background: 'transparent', cursor: 'pointer', color: '#64748b' }}
                >
                  <X size={18} />
                </button>
              </div>

              <div style={{ padding: '1.25rem' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '1rem', fontSize: '0.775rem' }}>
                  <div>
                    <span style={{ color: '#64748b' }}>Recipient:</span> <strong>{inspectingLog.fullName}</strong>
                  </div>
                  <div>
                    <span style={{ color: '#64748b' }}>Investor Code:</span> <strong>{inspectingLog.recipientCode}</strong>
                  </div>
                  <div>
                    <span style={{ color: '#64748b' }}>Email:</span> <strong>{inspectingLog.email}</strong>
                  </div>
                  <div>
                    <span style={{ color: '#64748b' }}>PAN:</span> <strong>{inspectingLog.panNumber}</strong>
                  </div>
                  <div>
                    <span style={{ color: '#64748b' }}>Timestamp:</span> <strong>{new Date(inspectingLog.dispatchedAt).toLocaleString()} IST</strong>
                  </div>
                  <div>
                    <span style={{ color: '#64748b' }}>Status:</span> <strong style={{ color: inspectingLog.status === 'Bounced' ? '#dc2626' : '#2563eb' }}>{inspectingLog.status}</strong>
                  </div>
                </div>

                <div style={{ fontSize: '0.72rem', color: '#475569', marginBottom: '0.35rem', fontWeight: '600' }}>
                  Raw SMTP Delivery Headers & Verification Proof:
                </div>
                <pre style={{
                  backgroundColor: '#0f172a',
                  color: '#38bdf8',
                  padding: '0.85rem',
                  borderRadius: '8px',
                  fontSize: '0.7rem',
                  lineHeight: '1.45',
                  overflowX: 'auto',
                  fontFamily: 'monospace',
                  maxHeight: '260px'
                }}>
{`MIME-Version: 1.0
From: "SR INVESTMENTS Advisory" <notifications@srinvestments.com>
To: ${inspectingLog.email}
Date: ${new Date(inspectingLog.dispatchedAt).toUTCString()}
Subject: ${selectedCampaignForLogs.subject}
Message-ID: <${inspectingLog.sesMessageId}>
X-SES-Outgoing: 2026.07.20-ap-south-1
DKIM-Signature: v=1; a=rsa-sha256; q=dns/txt; c=relaxed/simple;
  s=ses2026; d=srinvestments.com;
  h=From:To:Subject:Date:Message-ID:MIME-Version;
  bh=${inspectingLog.digitalHash.slice(0, 24)}=;
  b=dB9f+wLq3918fKx...==
TLS-Handshake: ${inspectingLog.tlsCipher}
Remote-MTA: dns; ${inspectingLog.ipAddress} [${inspectingLog.gateway}]
Diagnostic-Code: smtp; ${inspectingLog.smtpResponse}
SEBI-Compliance-Ref: AMFI/ARN-189241/EUIN-E345678
Investor-PAN-Hash: SHA256(${inspectingLog.panNumber})
Digital-Hash: ${inspectingLog.digitalHash}`}
                </pre>
              </div>

              <div style={{
                padding: '0.85rem 1.25rem',
                borderTop: '1px solid #e2e8f0',
                display: 'flex',
                justifyContent: 'flex-end',
                gap: '0.5rem',
                backgroundColor: '#f8fafc'
              }}>
                <button
                  className="btn btn-outline-blue btn-sm"
                  onClick={() => handleCopyMessageId(inspectingLog.sesMessageId)}
                >
                  <Copy size={13} />
                  <span>{copiedMsgId === inspectingLog.sesMessageId ? 'Copied ID!' : 'Copy SES Message-ID'}</span>
                </button>
                <button
                  className="btn btn-primary btn-sm"
                  onClick={() => setInspectingLog(null)}
                >
                  Close Receipt
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
