import React, { useState, useEffect } from 'react';
import { 
  Mail, 
  Send, 
  Users, 
  UserCheck, 
  Paperclip, 
  Sparkles, 
  DollarSign, 
  CheckCircle, 
  AlertCircle, 
  Clock, 
  FileText, 
  Eye, 
  Download,
  Info,
  Layers,
  X
} from 'lucide-react';
import { crmApi } from '../services/api';
import { useAuth } from '../context/AuthContext';
import Header from '../components/Header';

export default function BulkMail() {
  const { hasPermission } = useAuth();
  const [target, setTarget] = useState('customers'); // 'customers' or 'employees'
  const [emailMode, setEmailMode] = useState('personalized'); // 'common' or 'personalized'
  const [customers, setCustomers] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [selectedRecipients, setSelectedRecipients] = useState([]);
  
  // Email Form
  const [subject, setSubject] = useState('Important Mutual Fund Portfolio Update - SR INVESTMENTS');
  const [content, setContent] = useState(`Dear {FullName},

We are pleased to share your portfolio update from SR INVESTMENTS (ARN-189241).

Your Investor Code: {CustomerCode}
Registered PAN: {PanNumber}
Linked Bank: {BankName}
Risk Appetite: {RiskProfile}

Please find the attached market advisory note for this quarter. Feel free to contact your dedicated advisor for any SIP top-ups or rebalancing.

Warm regards,
SR INVESTMENTS Advisory Team`);
  
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
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.25rem' }}>
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

        {/* Amazon SES Campaign History & Invoices */}
        <div className="crm-card">
          <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <h4 style={{ fontSize: '1rem', fontWeight: '700', color: '#0f172a', margin: 0 }}>
                Amazon SES Campaign Dispatches & Billing History
              </h4>
              <p style={{ fontSize: '0.75rem', color: '#64748b', margin: '2px 0 0 0' }}>
                Audited transmission records and Amazon SES invoicing breakdown
              </p>
            </div>
          </div>

          <div className="table-responsive">
            <table className="crm-table">
              <thead>
                <tr>
                  <th>Campaign ID</th>
                  <th>Timestamp</th>
                  <th>Target Audience</th>
                  <th>Recipients</th>
                  <th>Subject</th>
                  <th>AWS Billed Amount</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {campaigns.length === 0 ? (
                  <tr>
                    <td colSpan="7" style={{ textAlign: 'center', padding: '2rem', color: '#94a3b8' }}>
                      No campaigns sent yet. Compose and dispatch your first email above.
                    </td>
                  </tr>
                ) : (
                  campaigns.map((camp) => (
                    <tr key={camp.campaignId}>
                      <td><code style={{ backgroundColor: '#eff6ff', color: '#1e40af', padding: '2px 6px', borderRadius: '4px' }}>{camp.campaignId}</code></td>
                      <td>{new Date(camp.timestamp).toLocaleString()}</td>
                      <td>
                        <span className="badge badge-neutral" style={{ textTransform: 'capitalize' }}>
                          {camp.target} ({camp.mode})
                        </span>
                      </td>
                      <td><strong>{camp.recipientCount}</strong> emails</td>
                      <td style={{ maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {camp.subject}
                      </td>
                      <td>
                        <strong style={{ color: '#2563eb' }}>{camp.estimatedCostUSD}</strong> <span style={{ fontSize: '0.725rem', color: '#64748b' }}>({camp.estimatedCostINR})</span>
                      </td>
                      <td>
                        <span className="badge badge-success">
                          <CheckCircle size={10} /> {camp.status}
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
