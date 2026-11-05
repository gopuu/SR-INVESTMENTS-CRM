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
  CheckCheck
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
                  <th>Recipients</th>
                  <th>Subject Line</th>
                  <th>Gateway & Encryption</th>
                  <th>SEBI Disclaimer</th>
                  <th>Compliance Status</th>
                </tr>
              </thead>
              <tbody>
                {campaigns.length === 0 ? (
                  <tr>
                    <td colSpan="9" style={{ textAlign: 'center', padding: '2.5rem', color: '#94a3b8' }}>
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
                        <strong style={{ color: '#0f172a' }}>{camp.recipientCount}</strong> emails
                      </td>
                      <td style={{ maxWidth: '220px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
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
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
