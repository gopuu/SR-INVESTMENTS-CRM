import React, { useState } from 'react';
import { TrendingUp, ShieldCheck, Lock, Mail, ArrowRight, AlertCircle, CheckCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { crmApi } from '../services/api';

export default function Login() {
  const { login } = useAuth();
  const [email, setEmail] = useState('admin@srinvestments.com');
  const [password, setPassword] = useState('admin123');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const isDemo = crmApi.isDemoMode();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password);
    } catch (err) {
      setError(err.message || 'Login failed. Please check credentials.');
    } finally {
      setLoading(false);
    }
  };

  const fillDemoAdmin = () => {
    setEmail('admin@srinvestments.com');
    setPassword('admin123');
    setError('');
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      backgroundColor: '#0f172a',
      color: '#f8fafc',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '2rem'
    }}>
      <div style={{
        width: '100%',
        maxWidth: '440px',
        backgroundColor: '#1e293b',
        borderRadius: '16px',
        border: '1px solid #334155',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.4)',
        padding: '2.5rem'
      }}>
        {/* Brand Header */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{
            width: '56px',
            height: '56px',
            borderRadius: '14px',
            background: 'linear-gradient(135deg, #059669 0%, #10b981 100%)',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#ffffff',
            fontWeight: '800',
            fontSize: '1.5rem',
            boxShadow: '0 8px 20px rgba(5, 150, 105, 0.4)',
            marginBottom: '1rem'
          }}>
            SR
          </div>
          <h2 style={{ fontSize: '1.45rem', fontWeight: '800', color: '#ffffff', margin: 0, letterSpacing: '0.02em' }}>
            SR INVESTMENTS
          </h2>
          <p style={{ fontSize: '0.85rem', color: '#94a3b8', marginTop: '0.35rem' }}>
            Mutual Fund Advisory & Wealth CRM
          </p>
        </div>

        {/* Backend mode pill */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '0.5rem',
          backgroundColor: '#0f172a',
          padding: '0.45rem 0.85rem',
          borderRadius: '8px',
          fontSize: '0.75rem',
          color: '#cbd5e1',
          marginBottom: '1.5rem',
          border: '1px solid #334155'
        }}>
          <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#10b981' }}></span>
          <span>{isDemo ? 'Local Storage Demo Mode Ready' : 'Live Google Apps Script Connection'}</span>
        </div>

        {error && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.6rem',
            padding: '0.75rem 1rem',
            backgroundColor: '#451a1a',
            border: '1px solid #7f1d1d',
            borderRadius: '8px',
            color: '#fca5a5',
            fontSize: '0.825rem',
            marginBottom: '1.25rem'
          }}>
            <AlertCircle size={16} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group" style={{ marginBottom: '1.25rem' }}>
            <label className="form-label" style={{ color: '#cbd5e1' }}>Work Email</label>
            <div style={{ position: 'relative' }}>
              <input
                type="email"
                className="form-input"
                style={{
                  backgroundColor: '#0f172a',
                  borderColor: '#334155',
                  color: '#ffffff',
                  paddingLeft: '2.5rem'
                }}
                placeholder="name@srinvestments.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              <Mail size={16} color="#64748b" style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)' }} />
            </div>
          </div>

          <div className="form-group" style={{ marginBottom: '1.5rem' }}>
            <label className="form-label" style={{ color: '#cbd5e1' }}>Password</label>
            <div style={{ position: 'relative' }}>
              <input
                type="password"
                className="form-input"
                style={{
                  backgroundColor: '#0f172a',
                  borderColor: '#334155',
                  color: '#ffffff',
                  paddingLeft: '2.5rem'
                }}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <Lock size={16} color="#64748b" style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)' }} />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn btn-primary"
            style={{ width: '100%', padding: '0.75rem', fontSize: '0.925rem', fontWeight: '600' }}
          >
            {loading ? 'Authenticating...' : 'Sign In to CRM'}
            {!loading && <ArrowRight size={16} />}
          </button>
        </form>

        {/* Demo credentials helper */}
        <div style={{
          marginTop: '1.5rem',
          paddingTop: '1.25rem',
          borderTop: '1px solid #334155',
          textAlign: 'center'
        }}>
          <button
            type="button"
            onClick={fillDemoAdmin}
            style={{
              background: 'transparent',
              border: 'none',
              color: '#10b981',
              fontSize: '0.785rem',
              cursor: 'pointer',
              fontWeight: '500',
              textDecoration: 'underline'
            }}
          >
            Fill Default Admin Credentials (admin@srinvestments.com / admin123)
          </button>
          <div style={{ fontSize: '0.7rem', color: '#64748b', marginTop: '0.5rem' }}>
            Google Sheets & Apps Script Architecture
          </div>
        </div>
      </div>
    </div>
  );
}

