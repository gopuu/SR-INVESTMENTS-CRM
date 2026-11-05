import React, { useState } from 'react';
import { 
  TrendingUp, 
  ShieldCheck, 
  Lock, 
  User, 
  ArrowRight, 
  AlertCircle, 
  Mail, 
  Phone,
  CheckCircle,
  HelpCircle
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { crmApi } from '../services/api';

export default function Login() {
  const { login, loginWithGoogle } = useAuth();
  const [username, setUsername] = useState('SR-EMP01');
  const [password, setPassword] = useState('password123');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showGoogleModal, setShowGoogleModal] = useState(false);
  const [customGoogleEmail, setCustomGoogleEmail] = useState('');
  const isDemo = crmApi.isDemoMode();

  const handleStandardSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(username, password);
    } catch (err) {
      setError(err.message || 'Login failed. Please verify credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async (email, name) => {
    setError('');
    setLoading(true);
    setShowGoogleModal(false);
    try {
      await loginWithGoogle(email, name);
    } catch (err) {
      setError(err.message || 'Google authentication failed.');
    } finally {
      setLoading(false);
    }
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
        maxWidth: '460px',
        backgroundColor: '#1e293b',
        borderRadius: '16px',
        border: '1px solid #334155',
        boxShadow: '0 25px 50px -12px rgba(15, 23, 42, 0.6)',
        padding: '2.5rem'
      }}>
        {/* Brand Header - Royal Blue */}
        <div style={{ textAlign: 'center', marginBottom: '1.75rem' }}>
          <div style={{
            width: '60px',
            height: '60px',
            borderRadius: '14px',
            background: 'linear-gradient(135deg, #1d4ed8 0%, #3b82f6 100%)',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#ffffff',
            fontWeight: '800',
            fontSize: '1.6rem',
            boxShadow: '0 8px 20px rgba(37, 99, 235, 0.35)',
            marginBottom: '1rem'
          }}>
            SR
          </div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: '800', color: '#ffffff', margin: 0, letterSpacing: '0.02em' }}>
            SR INVESTMENTS
          </h2>
          <p style={{ fontSize: '0.85rem', color: '#94a3b8', marginTop: '0.35rem' }}>
            Mutual Fund Advisory & Wealth CRM
          </p>
        </div>

        {/* Status Indicator */}
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
          <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#3b82f6' }}></span>
          <span>{isDemo ? 'Local Storage Mode' : 'Live Google Sheet Sync'}</span>
        </div>

        {/* Error message */}
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

        {/* Google Sign-in Button */}
        <button
          type="button"
          onClick={() => setShowGoogleModal(true)}
          disabled={loading}
          style={{
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.75rem',
            padding: '0.7rem',
            backgroundColor: '#ffffff',
            color: '#1f2937',
            border: '1px solid #d1d5db',
            borderRadius: '8px',
            fontSize: '0.875rem',
            fontWeight: '600',
            cursor: 'pointer',
            marginBottom: '1.25rem',
            transition: 'background 0.15s ease'
          }}
          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f9fafb'}
          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#ffffff'}
        >
          {/* Google 4-color SVG */}
          <svg width="18" height="18" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
          </svg>
          <span>Continue with Google</span>
        </button>

        <div style={{ display: 'flex', alignItems: 'center', margin: '1rem 0 1.25rem' }}>
          <div style={{ flex: 1, height: '1px', backgroundColor: '#334155' }}></div>
          <span style={{ padding: '0 0.75rem', fontSize: '0.75rem', color: '#64748b', textTransform: 'uppercase' }}>or sign in with credentials</span>
          <div style={{ flex: 1, height: '1px', backgroundColor: '#334155' }}></div>
        </div>

        {/* Credentials Form */}
        <form onSubmit={handleStandardSubmit}>
          <div className="form-group" style={{ marginBottom: '1.25rem' }}>
            <label className="form-label" style={{ color: '#cbd5e1' }}>
              Username (Staff ID / Email / Mobile)
            </label>
            <div style={{ position: 'relative' }}>
              <input
                type="text"
                className="form-input"
                style={{
                  backgroundColor: '#0f172a',
                  borderColor: '#334155',
                  color: '#ffffff',
                  paddingLeft: '2.5rem'
                }}
                placeholder="SR-EMP01 or email or mobile"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
              <User size={16} color="#64748b" style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)' }} />
            </div>
            <div style={{ fontSize: '0.7rem', color: '#64748b', marginTop: '0.35rem' }}>
              Accepts Employee Code, primary email, Google email, or 10-digit mobile.
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

        {/* 1-Click Demo Fillers */}
        <div style={{
          marginTop: '1.5rem',
          paddingTop: '1.25rem',
          borderTop: '1px solid #334155',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '0.725rem', color: '#94a3b8', marginBottom: '0.5rem', fontWeight: '500' }}>
            Quick Demo Fillers:
          </div>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
            <button
              type="button"
              onClick={() => { setUsername('SR-EMP01'); setPassword('password123'); setError(''); }}
              style={{
                background: '#0f172a',
                border: '1px solid #334155',
                color: '#60a5fa',
                fontSize: '0.725rem',
                padding: '0.3rem 0.6rem',
                borderRadius: '6px',
                cursor: 'pointer'
              }}
            >
              By Staff ID (SR-EMP01)
            </button>
            <button
              type="button"
              onClick={() => { setUsername('admin@srinvestments.com'); setPassword('password123'); setError(''); }}
              style={{
                background: '#0f172a',
                border: '1px solid #334155',
                color: '#60a5fa',
                fontSize: '0.725rem',
                padding: '0.3rem 0.6rem',
                borderRadius: '6px',
                cursor: 'pointer'
              }}
            >
              By Email (admin@srinvestments.com)
            </button>
            <button
              type="button"
              onClick={() => { setUsername('9820111223'); setPassword('password123'); setError(''); }}
              style={{
                background: '#0f172a',
                border: '1px solid #334155',
                color: '#60a5fa',
                fontSize: '0.725rem',
                padding: '0.3rem 0.6rem',
                borderRadius: '6px',
                cursor: 'pointer'
              }}
            >
              By Mobile (9820111223)
            </button>
          </div>
        </div>
      </div>

      {/* Google Account Selector Modal */}
      {showGoogleModal && (
        <div className="modal-overlay" onClick={() => setShowGoogleModal(false)}>
          <div 
            className="modal-content" 
            style={{ maxWidth: '440px' }} 
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <svg width="20" height="20" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
                </svg>
                <h3 style={{ fontSize: '1rem', fontWeight: '700', color: '#0f172a', margin: 0 }}>
                  Sign in with Google
                </h3>
              </div>
            </div>

            <div className="modal-body">
              <p style={{ fontSize: '0.8rem', color: '#64748b', marginBottom: '1rem' }}>
                Select a registered Google account or enter your linked staff Google ID:
              </p>

              {/* Registered demo Google IDs */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', marginBottom: '1.25rem' }}>
                {[
                  { name: 'Rajesh Sharma (Admin)', email: 'rajesh.sharma.mf@gmail.com' },
                  { name: 'Pooja Mehta (Operations)', email: 'pooja.mehta.crm@gmail.com' },
                  { name: 'Amit Verma (Advisor)', email: 'amit.invest@gmail.com' }
                ].map((g) => (
                  <button
                    key={g.email}
                    type="button"
                    onClick={() => handleGoogleSignIn(g.email, g.name)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '0.75rem',
                      borderRadius: '8px',
                      border: '1px solid #e2e8f0',
                      backgroundColor: '#f8fafc',
                      cursor: 'pointer',
                      textAlign: 'left'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#eff6ff'}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#f8fafc'}
                  >
                    <div>
                      <div style={{ fontSize: '0.825rem', fontWeight: '600', color: '#0f172a' }}>{g.name}</div>
                      <div style={{ fontSize: '0.75rem', color: '#2563eb' }}>{g.email}</div>
                    </div>
                    <ArrowRight size={14} color="#64748b" />
                  </button>
                ))}
              </div>

              {/* Custom Google Email input */}
              <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: '1rem' }}>
                <label className="form-label">Or enter another registered Google ID:</label>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <input
                    type="email"
                    className="form-input"
                    placeholder="your.id@gmail.com"
                    value={customGoogleEmail}
                    onChange={(e) => setCustomGoogleEmail(e.target.value)}
                  />
                  <button
                    type="button"
                    className="btn btn-primary"
                    disabled={!customGoogleEmail}
                    onClick={() => handleGoogleSignIn(customGoogleEmail, 'Google User')}
                  >
                    Sign In
                  </button>
                </div>
              </div>
            </div>

            <div className="modal-footer">
              <button 
                type="button" 
                className="btn btn-secondary btn-sm"
                onClick={() => setShowGoogleModal(false)}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
