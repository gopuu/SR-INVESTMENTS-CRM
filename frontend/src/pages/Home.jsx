import React, { useState, useEffect } from 'react';
import { 
  Users, 
  UserCheck, 
  CheckCircle2, 
  TrendingUp, 
  PieChart, 
  ShieldCheck, 
  ArrowUpRight,
  PlusCircle,
  Archive,
  DollarSign
} from 'lucide-react';
import { crmApi } from '../services/api';
import Header from '../components/Header';

export default function Home({ onNavigate, onOpenBackup }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadDashboard = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await crmApi.call('getDashboard');
      setData(res);
    } catch (err) {
      setError(err.message || 'Failed to load dashboard metrics');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboard();
  }, []);

  const totalCust = data?.totalCustomers || 0;
  const kycCompliant = data?.kycCompliantCount || 0;
  const kycPct = totalCust > 0 ? Math.round((kycCompliant / totalCust) * 100) : 100;

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
      <Header 
        title="Investment Overview & Dashboard" 
        subtitle="SR INVESTMENTS — Mutual Fund Portfolio & Operations Summary"
        onRefresh={loadDashboard}
        refreshing={loading}
        onOpenBackup={onOpenBackup}
      />

      <div className="page-wrapper">
        {error && (
          <div style={{
            padding: '1rem',
            backgroundColor: '#fee2e2',
            border: '1px solid #fca5a5',
            borderRadius: '8px',
            color: '#b91c1c',
            marginBottom: '1.5rem',
            fontSize: '0.875rem'
          }}>
            {error}
          </div>
        )}

        {/* Top Stat Cards - Blue Family Theme */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
          gap: '1.25rem',
          marginBottom: '1.5rem'
        }}>
          {/* Card 1: Total Investors */}
          <div className="crm-card" style={{ padding: '1.25rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: '0.8125rem', fontWeight: '600', color: '#64748b' }}>Total Investors</span>
              <div style={{
                width: '38px',
                height: '38px',
                borderRadius: '8px',
                backgroundColor: '#eff6ff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#2563eb'
              }}>
                <Users size={20} />
              </div>
            </div>
            <div style={{ fontSize: '1.85rem', fontWeight: '800', color: '#0f172a', marginTop: '0.5rem' }}>
              {loading ? '...' : totalCust}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', marginTop: '0.35rem', fontSize: '0.75rem', color: '#2563eb', fontWeight: '600' }}>
              <ArrowUpRight size={14} /> Active mutual fund folios
            </div>
          </div>

          {/* Card 2: KYC Compliance */}
          <div className="crm-card" style={{ padding: '1.25rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: '0.8125rem', fontWeight: '600', color: '#64748b' }}>KYC Compliant</span>
              <div style={{
                width: '38px',
                height: '38px',
                borderRadius: '8px',
                backgroundColor: '#dbeafe',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#1d4ed8'
              }}>
                <CheckCircle2 size={20} />
              </div>
            </div>
            <div style={{ fontSize: '1.85rem', fontWeight: '800', color: '#0f172a', marginTop: '0.5rem' }}>
              {loading ? '...' : `${kycPct}%`}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', marginTop: '0.35rem', fontSize: '0.75rem', color: '#64748b' }}>
              <span>{kycCompliant} of {totalCust} investors verified</span>
            </div>
          </div>

          {/* Card 3: Active Staff */}
          <div className="crm-card" style={{ padding: '1.25rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: '0.8125rem', fontWeight: '600', color: '#64748b' }}>Advisory & Staff</span>
              <div style={{
                width: '38px',
                height: '38px',
                borderRadius: '8px',
                backgroundColor: '#f1f5f9',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#0f172a'
              }}>
                <UserCheck size={20} />
              </div>
            </div>
            <div style={{ fontSize: '1.85rem', fontWeight: '800', color: '#0f172a', marginTop: '0.5rem' }}>
              {loading ? '...' : (data?.activeEmployees || 0)}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', marginTop: '0.35rem', fontSize: '0.75rem', color: '#64748b' }}>
              <span>{data?.totalEmployees || 0} registered team members</span>
            </div>
          </div>

          {/* Card 4: AMFI ARN Status */}
          <div className="crm-card" style={{ padding: '1.25rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: '0.8125rem', fontWeight: '600', color: '#64748b' }}>AMFI Registration</span>
              <div style={{
                width: '38px',
                height: '38px',
                borderRadius: '8px',
                backgroundColor: '#eff6ff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#2563eb'
              }}>
                <ShieldCheck size={20} />
              </div>
            </div>
            <div style={{ fontSize: '1.25rem', fontWeight: '800', color: '#0f172a', marginTop: '0.75rem', letterSpacing: '0.02em' }}>
              ARN-189241
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', marginTop: '0.35rem', fontSize: '0.75rem', color: '#1d4ed8', fontWeight: '600' }}>
              Active AMFI Distributor
            </div>
          </div>
        </div>

        {/* Quick Operations Strip */}
        <div className="crm-card" style={{ padding: '1.25rem 1.5rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h3 style={{ fontSize: '0.95rem', fontWeight: '700', color: '#0f172a', margin: 0 }}>
              Quick CRM Operations
            </h3>
            <p style={{ fontSize: '0.8rem', color: '#64748b', margin: '2px 0 0 0' }}>
              Manage investor accounts, review KYC status, or download complete Drive backups
            </p>
          </div>
          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
            <button 
              className="btn btn-primary"
              onClick={() => onNavigate('customers')}
            >
              <PlusCircle size={16} /> Add Investor
            </button>
            <button 
              className="btn btn-secondary"
              onClick={onOpenBackup}
            >
              <Archive size={16} /> Drive Backup
            </button>
          </div>
        </div>

        {/* Two-column layout: Mutual Fund Distribution & Investor Categories */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: '1.5rem',
          marginBottom: '1.5rem'
        }}>
          {/* Mutual Fund Category Breakdown */}
          <div className="crm-card" style={{ padding: '1.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
              <div>
                <h3 style={{ fontSize: '1rem', fontWeight: '700', color: '#0f172a', margin: 0 }}>
                  Mutual Fund Asset Breakdown
                </h3>
                <span style={{ fontSize: '0.75rem', color: '#64748b' }}>Investor portfolio distribution</span>
              </div>
              <TrendingUp size={18} color="#2563eb" />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8125rem', marginBottom: '0.35rem' }}>
                  <span style={{ fontWeight: '600' }}>Equity Funds (Large, Mid & Flexi Cap)</span>
                  <span style={{ color: '#2563eb', fontWeight: '700' }}>58%</span>
                </div>
                <div style={{ width: '100%', height: '8px', backgroundColor: '#f1f5f9', borderRadius: '4px', overflow: 'hidden' }}>
                  <div style={{ width: '58%', height: '100%', backgroundColor: '#2563eb' }}></div>
                </div>
              </div>

              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8125rem', marginBottom: '0.35rem' }}>
                  <span style={{ fontWeight: '600' }}>Hybrid & Balanced Advantage</span>
                  <span style={{ color: '#3b82f6', fontWeight: '700' }}>24%</span>
                </div>
                <div style={{ width: '100%', height: '8px', backgroundColor: '#f1f5f9', borderRadius: '4px', overflow: 'hidden' }}>
                  <div style={{ width: '24%', height: '100%', backgroundColor: '#3b82f6' }}></div>
                </div>
              </div>

              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8125rem', marginBottom: '0.35rem' }}>
                  <span style={{ fontWeight: '600' }}>Debt & Arbitrage Funds</span>
                  <span style={{ color: '#60a5fa', fontWeight: '700' }}>14%</span>
                </div>
                <div style={{ width: '100%', height: '8px', backgroundColor: '#f1f5f9', borderRadius: '4px', overflow: 'hidden' }}>
                  <div style={{ width: '14%', height: '100%', backgroundColor: '#60a5fa' }}></div>
                </div>
              </div>

              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8125rem', marginBottom: '0.35rem' }}>
                  <span style={{ fontWeight: '600' }}>Liquid & Overnight Cash</span>
                  <span style={{ color: '#94a3b8', fontWeight: '700' }}>4%</span>
                </div>
                <div style={{ width: '100%', height: '8px', backgroundColor: '#f1f5f9', borderRadius: '4px', overflow: 'hidden' }}>
                  <div style={{ width: '4%', height: '100%', backgroundColor: '#94a3b8' }}></div>
                </div>
              </div>
            </div>
          </div>

          {/* Investor Categories & Top AMC Partners */}
          <div className="crm-card" style={{ padding: '1.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
              <div>
                <h3 style={{ fontSize: '1rem', fontWeight: '700', color: '#0f172a', margin: 0 }}>
                  Investor Categories & AMCs
                </h3>
                <span style={{ fontSize: '0.75rem', color: '#64748b' }}>Investor types & partner fund houses</span>
              </div>
              <PieChart size={18} color="#2563eb" />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '1.25rem' }}>
              <div style={{ padding: '0.85rem', backgroundColor: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Individual (Retail/HNI)</div>
                <div style={{ fontSize: '1.2rem', fontWeight: '700', color: '#0f172a' }}>
                  {data?.categoryBreakdown?.Individual || 0}
                </div>
              </div>
              <div style={{ padding: '0.85rem', backgroundColor: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                <div style={{ fontSize: '0.75rem', color: '#64748b' }}>NRI Investors</div>
                <div style={{ fontSize: '1.2rem', fontWeight: '700', color: '#0f172a' }}>
                  {data?.categoryBreakdown?.NRI || 0}
                </div>
              </div>
              <div style={{ padding: '0.85rem', backgroundColor: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                <div style={{ fontSize: '0.75rem', color: '#64748b' }}>HUF Accounts</div>
                <div style={{ fontSize: '1.2rem', fontWeight: '700', color: '#0f172a' }}>
                  {data?.categoryBreakdown?.HUF || 0}
                </div>
              </div>
              <div style={{ padding: '0.85rem', backgroundColor: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Corporate / Trusts</div>
                <div style={{ fontSize: '1.2rem', fontWeight: '700', color: '#0f172a' }}>
                  {data?.categoryBreakdown?.Corporate || 0}
                </div>
              </div>
            </div>

            <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: '600', marginBottom: '0.5rem' }}>
              Supported AMCs:
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
              {['HDFC Mutual Fund', 'ICICI Prudential', 'SBI Mutual Fund', 'Axis MF', 'Nippon India', 'Mirae Asset', 'Kotak Mahindra'].map((amc) => (
                <span key={amc} style={{
                  fontSize: '0.725rem',
                  padding: '0.2rem 0.55rem',
                  backgroundColor: '#eff6ff',
                  borderRadius: '4px',
                  color: '#1e40af',
                  border: '1px solid #bfdbfe'
                }}>
                  {amc}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Recent Investors Table */}
        <div className="crm-card">
          <div style={{
            padding: '1.25rem 1.5rem',
            borderBottom: '1px solid #e2e8f0',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}>
            <div>
              <h3 style={{ fontSize: '1rem', fontWeight: '700', color: '#0f172a', margin: 0 }}>
                Recent Onboarded Investors
              </h3>
              <p style={{ fontSize: '0.775rem', color: '#64748b', margin: '2px 0 0 0' }}>
                Latest mutual fund investor accounts added to SR INVESTMENTS
              </p>
            </div>
            <button 
              className="btn btn-secondary btn-sm"
              onClick={() => onNavigate('customers')}
            >
              View All Investors
            </button>
          </div>

          <div className="table-responsive">
            <table className="crm-table">
              <thead>
                <tr>
                  <th>Customer Code</th>
                  <th>Full Name</th>
                  <th>PAN Number</th>
                  <th>Mobile</th>
                  <th>Category</th>
                  <th>Risk Profile</th>
                  <th>KYC Status</th>
                </tr>
              </thead>
              <tbody>
                {(!data?.recentCustomers || data.recentCustomers.length === 0) ? (
                  <tr>
                    <td colSpan="7" style={{ textAlign: 'center', padding: '2rem', color: '#94a3b8' }}>
                      No investor records available.
                    </td>
                  </tr>
                ) : (
                  data.recentCustomers.map((cust) => (
                    <tr key={cust.CustomerId || cust.CustomerCode}>
                      <td>
                        <strong style={{ color: '#2563eb' }}>{cust.CustomerCode}</strong>
                      </td>
                      <td style={{ fontWeight: '600' }}>{cust.FullName}</td>
                      <td>
                        <code style={{ backgroundColor: '#f1f5f9', padding: '2px 6px', borderRadius: '4px' }}>
                          {cust.PanNumber || '—'}
                        </code>
                      </td>
                      <td>{cust.Mobile}</td>
                      <td>
                        <span className="badge badge-neutral">{cust.InvestorCategory || 'Individual'}</span>
                      </td>
                      <td>{cust.RiskProfile || 'Moderate'}</td>
                      <td>
                        <span className={`badge ${cust.KycStatus === 'Compliant' ? 'badge-primary' : (cust.KycStatus === 'Pending' ? 'badge-warning' : 'badge-danger')}`}>
                          {cust.KycStatus || 'Pending'}
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
