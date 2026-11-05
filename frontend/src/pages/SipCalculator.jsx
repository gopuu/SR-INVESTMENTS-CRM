import React, { useState } from 'react';
import { 
  Calculator, 
  TrendingUp, 
  DollarSign, 
  Percent, 
  Calendar, 
  PieChart as PieIcon,
  ShieldCheck,
  CheckCircle,
  Sparkles
} from 'lucide-react';
import Header from '../components/Header';

export default function SipCalculator() {
  const [sipAmount, setSipAmount] = useState(10000);
  const [returnRate, setReturnRate] = useState(13);
  const [years, setYears] = useState(10);
  const [stepUp, setStepUp] = useState(10); // 10% annual step up
  const [isStepUpEnabled, setIsStepUpEnabled] = useState(false);

  // Calculations
  const calculateSIP = () => {
    const monthlyRate = returnRate / 12 / 100;
    const totalMonths = years * 12;

    let totalInvested = 0;
    let totalValue = 0;
    let currentMonthlySIP = sipAmount;

    const yearlyBreakdown = [];

    for (let y = 1; y <= years; y++) {
      let yearlyInvested = 0;
      for (let m = 1; m <= 12; m++) {
        yearlyInvested += currentMonthlySIP;
        totalInvested += currentMonthlySIP;
        totalValue = (totalValue + currentMonthlySIP) * (1 + monthlyRate);
      }
      yearlyBreakdown.push({
        year: y,
        sipAmount: currentMonthlySIP,
        invested: Math.round(totalInvested),
        wealthGained: Math.round(totalValue - totalInvested),
        futureValue: Math.round(totalValue)
      });

      if (isStepUpEnabled) {
        currentMonthlySIP = Math.round(currentMonthlySIP * (1 + stepUp / 100));
      }
    }

    const estimatedGains = Math.round(totalValue - totalInvested);

    return {
      totalInvested: Math.round(totalInvested),
      estimatedGains,
      futureValue: Math.round(totalValue),
      yearlyBreakdown
    };
  };

  const results = calculateSIP();

  const formatINR = (val) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(val);
  };

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
      <Header 
        title="Mutual Fund SIP & Wealth Calculator" 
        subtitle="Simulate Systematic Investment Plans (SIP), compound growth & Step-up projections for investors"
      />

      <div className="page-wrapper">
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: '1.5rem',
          marginBottom: '1.5rem'
        }}>
          {/* Inputs Card */}
          <div className="crm-card" style={{ padding: '2rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
              <div style={{
                width: '40px',
                height: '40px',
                borderRadius: '8px',
                backgroundColor: '#ecfdf5',
                color: '#059669',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <Calculator size={20} />
              </div>
              <div>
                <h3 style={{ fontSize: '1.05rem', fontWeight: '700', color: '#0f172a', margin: 0 }}>
                  SIP Parameters
                </h3>
                <span style={{ fontSize: '0.75rem', color: '#64748b' }}>Customizable investor parameters</span>
              </div>
            </div>

            {/* Slider 1: Monthly Investment */}
            <div className="form-group" style={{ marginBottom: '1.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                <label className="form-label" style={{ margin: 0 }}>Monthly Investment (₹)</label>
                <span style={{ fontWeight: '700', color: '#059669', fontSize: '1rem' }}>
                  {formatINR(sipAmount)}
                </span>
              </div>
              <input
                type="range"
                min="500"
                max="200000"
                step="500"
                value={sipAmount}
                onChange={(e) => setSipAmount(Number(e.target.value))}
                style={{ width: '100%', accentColor: '#059669', cursor: 'pointer' }}
              />
              <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem', flexWrap: 'wrap' }}>
                {[5000, 10000, 25000, 50000, 100000].map(amt => (
                  <button
                    key={amt}
                    type="button"
                    onClick={() => setSipAmount(amt)}
                    style={{
                      fontSize: '0.725rem',
                      padding: '0.25rem 0.5rem',
                      borderRadius: '4px',
                      border: '1px solid #e2e8f0',
                      backgroundColor: sipAmount === amt ? '#059669' : '#f8fafc',
                      color: sipAmount === amt ? '#ffffff' : '#334155',
                      cursor: 'pointer'
                    }}
                  >
                    {formatINR(amt)}
                  </button>
                ))}
              </div>
            </div>

            {/* Slider 2: Expected Return */}
            <div className="form-group" style={{ marginBottom: '1.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                <label className="form-label" style={{ margin: 0 }}>Expected Return Rate (p.a)</label>
                <span style={{ fontWeight: '700', color: '#0284c7', fontSize: '1rem' }}>
                  {returnRate}%
                </span>
              </div>
              <input
                type="range"
                min="6"
                max="25"
                step="0.5"
                value={returnRate}
                onChange={(e) => setReturnRate(Number(e.target.value))}
                style={{ width: '100%', accentColor: '#0284c7', cursor: 'pointer' }}
              />
              <div style={{ fontSize: '0.725rem', color: '#64748b', marginTop: '0.25rem' }}>
                Historical Sensex/Nifty CAGR: ~12-14% | Mid/Small Cap: ~14-17%
              </div>
            </div>

            {/* Slider 3: Time Period */}
            <div className="form-group" style={{ marginBottom: '1.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                <label className="form-label" style={{ margin: 0 }}>Investment Horizon (Years)</label>
                <span style={{ fontWeight: '700', color: '#0f172a', fontSize: '1rem' }}>
                  {years} Years ({years * 12} Months)
                </span>
              </div>
              <input
                type="range"
                min="1"
                max="35"
                step="1"
                value={years}
                onChange={(e) => setYears(Number(e.target.value))}
                style={{ width: '100%', accentColor: '#0f172a', cursor: 'pointer' }}
              />
            </div>

            {/* Step-up Checkbox */}
            <div style={{ padding: '0.85rem', backgroundColor: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', cursor: 'pointer', fontSize: '0.825rem', fontWeight: '600' }}>
                <input
                  type="checkbox"
                  checked={isStepUpEnabled}
                  onChange={(e) => setIsStepUpEnabled(e.target.checked)}
                  style={{ width: '16px', height: '16px', accentColor: '#059669' }}
                />
                <span>Enable Annual Step-Up SIP (Inflation beating)</span>
              </label>

              {isStepUpEnabled && (
                <div style={{ marginTop: '0.75rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.785rem', marginBottom: '0.25rem' }}>
                    <span>Annual Increase Rate:</span>
                    <strong style={{ color: '#059669' }}>{stepUp}% every year</strong>
                  </div>
                  <input
                    type="range"
                    min="5"
                    max="25"
                    step="5"
                    value={stepUp}
                    onChange={(e) => setStepUp(Number(e.target.value))}
                    style={{ width: '100%', accentColor: '#059669' }}
                  />
                </div>
              )}
            </div>
          </div>

          {/* Results Summary Card */}
          <div className="crm-card" style={{ padding: '2rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem' }}>
                <TrendingUp size={22} color="#059669" />
                <h3 style={{ fontSize: '1.1rem', fontWeight: '700', color: '#0f172a', margin: 0 }}>
                  Projected Wealth Summary
                </h3>
              </div>

              {/* Total Future Value Highlight */}
              <div style={{
                padding: '1.5rem',
                backgroundColor: '#f0fdf4',
                borderRadius: '12px',
                border: '1px solid #bbf7d0',
                marginBottom: '1.5rem',
                textAlign: 'center'
              }}>
                <div style={{ fontSize: '0.8rem', fontWeight: '700', textTransform: 'uppercase', color: '#15803d', letterSpacing: '0.05em' }}>
                  Expected Maturity Value
                </div>
                <div style={{ fontSize: '2.4rem', fontWeight: '900', color: '#0f172a', marginTop: '0.35rem' }}>
                  {formatINR(results.futureValue)}
                </div>
                <div style={{ fontSize: '0.785rem', color: '#166534', marginTop: '0.35rem' }}>
                  Compounded over {years} years at {returnRate}% p.a.
                </div>
              </div>

              {/* Breakdown Grid */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
                <div style={{ padding: '1rem', backgroundColor: '#f8fafc', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
                  <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: '600' }}>Total Invested Amount</div>
                  <div style={{ fontSize: '1.25rem', fontWeight: '800', color: '#334155', marginTop: '0.25rem' }}>
                    {formatINR(results.totalInvested)}
                  </div>
                </div>

                <div style={{ padding: '1rem', backgroundColor: '#ecfdf5', borderRadius: '10px', border: '1px solid #a7f3d0' }}>
                  <div style={{ fontSize: '0.75rem', color: '#047857', fontWeight: '600' }}>Estimated Wealth Gain</div>
                  <div style={{ fontSize: '1.25rem', fontWeight: '800', color: '#059669', marginTop: '0.25rem' }}>
                    {formatINR(results.estimatedGains)}
                  </div>
                </div>
              </div>
            </div>

            {/* Power of compounding note */}
            <div style={{
              padding: '1rem',
              backgroundColor: '#f1f5f9',
              borderRadius: '8px',
              fontSize: '0.785rem',
              color: '#475569',
              display: 'flex',
              alignItems: 'center',
              gap: '0.6rem'
            }}>
              <Sparkles size={18} color="#059669" />
              <span>
                <strong>Wealth Multiplier:</strong> Your money grows to{' '}
                <strong>{(results.futureValue / (results.totalInvested || 1)).toFixed(1)}x</strong> of total investment!
              </span>
            </div>
          </div>
        </div>

        {/* Year by Year Growth Schedule */}
        <div className="crm-card">
          <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid #e2e8f0' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: '700', color: '#0f172a', margin: 0 }}>
              Year-by-Year Growth Projection Schedule
            </h3>
            <span style={{ fontSize: '0.775rem', color: '#64748b' }}>
              Detailed timeline of capital invested, compound interest gains & cumulative future portfolio value
            </span>
          </div>

          <div className="table-responsive">
            <table className="crm-table">
              <thead>
                <tr>
                  <th>End of Year</th>
                  <th>Monthly SIP Amount</th>
                  <th>Total Amount Invested</th>
                  <th>Estimated Gains</th>
                  <th style={{ textAlign: 'right' }}>Projected Portfolio Value</th>
                </tr>
              </thead>
              <tbody>
                {results.yearlyBreakdown.map((row) => (
                  <tr key={row.year}>
                    <td>
                      <strong>Year {row.year}</strong>
                    </td>
                    <td>{formatINR(row.sipAmount)}</td>
                    <td>{formatINR(row.invested)}</td>
                    <td style={{ color: '#059669', fontWeight: '600' }}>
                      +{formatINR(row.wealthGained)}
                    </td>
                    <td style={{ textAlign: 'right', fontWeight: '700', color: '#0f172a' }}>
                      {formatINR(row.futureValue)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

