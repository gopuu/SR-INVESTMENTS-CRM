import React, { useState, useEffect } from 'react';
import { 
  TrendingUp, 
  ShieldCheck, 
  Lock, 
  User, 
  ArrowRight, 
  AlertCircle, 
  AlertTriangle,
  Mail, 
  Phone,
  CheckCircle,
  HelpCircle,
  Building2,
  ChevronRight,
  Sparkles,
  Settings as SettingsIcon,
  ExternalLink,
  Eye,
  EyeOff,
  RefreshCw,
  ArrowLeft,
  KeyRound,
  Check,
  X
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { crmApi } from '../services/api';

function parseJwt(token) {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch {
    return null;
  }
}

export default function Login() {
  const { login, loginWithGoogle, selectWorkspace } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [multiTenantData, setMultiTenantData] = useState(null);

  // Google OAuth Client ID & Configuration
  const [googleClientId, setGoogleClientId] = useState(() => crmApi.getGoogleClientId());
  const [loginCompanyName, setLoginCompanyName] = useState(() => crmApi.getLoginCompanyName());
  const [showConfigModal, setShowConfigModal] = useState(false);
  const [clientIdInput, setClientIdInput] = useState('');
  const [showSimulatedModal, setShowSimulatedModal] = useState(false);
  const [simulatedEmail, setSimulatedEmail] = useState('');

  // Forgot Password & OTP verification state
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [isForgotEmailEnabled, setIsForgotEmailEnabled] = useState(true);
  const [isForgotSmsEnabled, setIsForgotSmsEnabled] = useState(true);
  const [forgotEmailSent, setForgotEmailSent] = useState(false);
  const [forgotSmsSent, setForgotSmsSent] = useState(false);
  const [forgotSmsNotice, setForgotSmsNotice] = useState('');
  const [forgotStep, setForgotStep] = useState(1); // 1: Identifier, 2: OTP, 3: New Password, 4: Success
  const [forgotIdentifier, setForgotIdentifier] = useState('');
  const [forgotOtp, setForgotOtp] = useState('');
  const [forgotResetToken, setForgotResetToken] = useState('');
  const [forgotMaskedEmail, setForgotMaskedEmail] = useState('');
  const [forgotMaskedMobile, setForgotMaskedMobile] = useState('');
  const [forgotNewPassword, setForgotNewPassword] = useState('');
  const [forgotConfirmPassword, setForgotConfirmPassword] = useState('');
  const [showForgotPassToggle, setShowForgotPassToggle] = useState(false);
  const [showForgotConfirmToggle, setShowForgotConfirmToggle] = useState(false);
  const [forgotLoading, setForgotLoading] = useState(false);
  const [forgotError, setForgotError] = useState('');
  const [forgotSuccessMsg, setForgotSuccessMsg] = useState('');
  const [otpResendTimer, setOtpResendTimer] = useState(0);

  // Helper: Evaluates password strength against standard security criteria
  const getPasswordRequirements = (pass) => {
    const p = pass || '';
    return [
      { key: 'length', label: 'At least 8 characters', met: p.length >= 8 },
      { key: 'upper', label: 'One uppercase letter (A-Z)', met: /[A-Z]/.test(p) },
      { key: 'lower', label: 'One lowercase letter (a-z)', met: /[a-z]/.test(p) },
      { key: 'number', label: 'One number (0-9)', met: /[0-9]/.test(p) },
      { key: 'special', label: 'One special symbol (!@#$%^&*)', met: /[^A-Za-z0-9]/.test(p) }
    ];
  };

  const getPasswordStrength = (pass) => {
    if (!pass) return { score: 0, label: '', color: '#64748b', percent: 0 };
    const reqs = getPasswordRequirements(pass);
    const met = reqs.filter(r => r.met).length;
    if (met <= 2) return { score: 1, label: 'Weak', color: '#ef4444', percent: 25 };
    if (met === 3) return { score: 2, label: 'Fair', color: '#f59e0b', percent: 50 };
    if (met === 4) return { score: 3, label: 'Good', color: '#3b82f6', percent: 75 };
    return { score: 4, label: 'Strong', color: '#10b981', percent: 100 };
  };

  // Timer countdown for OTP resend cooldown
  useEffect(() => {
    let interval = null;
    if (otpResendTimer > 0) {
      interval = setInterval(() => {
        setOtpResendTimer((prev) => (prev > 0 ? prev - 1 : 0));
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [otpResendTimer]);

  // Auto-fetch Central DB Default-Config on Login mount (supports Incognito mode)
  useEffect(() => {
    let isMounted = true;
    crmApi.fetchDefaultConfig().then((cfg) => {
      if (!isMounted) return;
      const cid = cfg?.GoogleClientId || cfg?.googleclientid;
      if (cid && cid !== googleClientId) {
        setGoogleClientId(cid);
      }
      const compName = cfg?.LoginCompanyName || cfg?.logincompanyname;
      if (compName) {
        setLoginCompanyName(compName);
      }
      const parseBool = (val, def = true) => {
        if (val === undefined || val === null || String(val).trim() === '') return def;
        const s = String(val).trim().toLowerCase();
        return s === 'true' || s === '1' || s === 'yes' || s === 'enabled';
      };
      const emailFlag = cfg?.IsForgotPasswordWithEmail ?? cfg?.isforgotpasswordwithemail;
      const smsFlag = cfg?.IsForgotPasswordWithMobileNo ?? cfg?.isforgotpasswordwithmobileno;
      setIsForgotEmailEnabled(parseBool(emailFlag, true));
      setIsForgotSmsEnabled(parseBool(smsFlag, true));
    }).catch((err) => {
      console.warn('Central DB config fetch in Login:', err);
    });
    return () => { isMounted = false; };
  }, [googleClientId]);

  // Initialize Google Identity Services (GIS)
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const activeClientId = googleClientId || crmApi.getGoogleClientId();
    if (!activeClientId) return;

    const initGIS = () => {
      if (!window.google?.accounts?.id) return;
      try {
        window.google.accounts.id.initialize({
          client_id: activeClientId,
          callback: (response) => {
            if (response && response.credential) {
              const payload = parseJwt(response.credential);
              if (payload && payload.email) {
                handleGoogleSignIn(payload.email, payload.name || payload.email.split('@')[0]);
              }
            }
          },
          auto_select: false,
          cancel_on_tap_outside: true,
        });

        const container = document.getElementById('google-native-signin-btn');
        if (container) {
          container.innerHTML = '';
          window.google.accounts.id.renderButton(container, {
            theme: 'outline',
            size: 'large',
            text: 'continue_with',
            shape: 'rectangular',
            width: 380,
            logo_alignment: 'left'
          });
        }
      } catch (err) {
        console.warn('Google Identity initialization warning:', err);
      }
    };

    if (window.google?.accounts?.id) {
      initGIS();
    } else {
      const timer = setInterval(() => {
        if (window.google?.accounts?.id) {
          clearInterval(timer);
          initGIS();
        }
      }, 300);
      return () => clearInterval(timer);
    }
  }, [googleClientId]);

  const handleStandardSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await login(username, password);
      if (res && res.multiTenant) {
        setMultiTenantData(res);
      }
    } catch (err) {
      setError(err.message || 'Login failed. Please verify credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async (email, name) => {
    setError('');
    setLoading(true);
    setShowConfigModal(false);
    setShowSimulatedModal(false);
    try {
      const res = await loginWithGoogle(email, name);
      if (res && res.multiTenant) {
        setMultiTenantData(res);
      }
    } catch (err) {
      setError(err.message || 'Google authentication failed.');
    } finally {
      setLoading(false);
    }
  };

  // Trigger Google Native OAuth 2.0 Account Picker Popup
  const triggerNativeGooglePopup = async () => {
    setError('');
    let activeClientId = googleClientId || crmApi.getGoogleClientId();

    // If Client ID is not in state/localStorage (e.g. fresh Incognito session),
    // fetch dynamically from Central DB Default-Config tab first!
    if (!activeClientId) {
      setLoading(true);
      try {
        const cfg = await crmApi.fetchDefaultConfig();
        const cid = cfg?.GoogleClientId || cfg?.googleclientid;
        if (cid) {
          activeClientId = cid;
          setGoogleClientId(cid);
        }
      } catch (fetchErr) {
        console.warn('Could not auto-fetch Google Client ID from Central DB:', fetchErr);
      } finally {
        setLoading(false);
      }
    }

    // If still not configured yet, open guidance modal
    if (!activeClientId) {
      setClientIdInput('');
      setShowConfigModal(true);
      return;
    }

    if (!window.google?.accounts) {
      setError('Google Identity Services SDK is loading. Please verify internet access and try again.');
      return;
    }

    // Launch Google's native account chooser dialog (prompt: select_account)
    try {
      const tokenClient = window.google.accounts.oauth2.initTokenClient({
        client_id: activeClientId,
        scope: 'email profile openid',
        prompt: 'select_account',
        callback: async (tokenResponse) => {
          if (tokenResponse.error) {
            if (tokenResponse.error !== 'access_denied') {
              setError(`Google Sign-In: ${tokenResponse.error_description || tokenResponse.error}`);
            }
            return;
          }
          try {
            setLoading(true);
            const userRes = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
              headers: { Authorization: `Bearer ${tokenResponse.access_token}` }
            });
            const profile = await userRes.json();
            if (profile && profile.email) {
              await handleGoogleSignIn(profile.email, profile.name || profile.email.split('@')[0]);
            } else {
              throw new Error('Could not retrieve email from Google Account.');
            }
          } catch (fetchErr) {
            setError(fetchErr.message || 'Failed to retrieve Google profile data.');
            setLoading(false);
          }
        }
      });

      tokenClient.requestAccessToken({ prompt: 'select_account' });
    } catch (err) {
      try {
        window.google.accounts.id.prompt();
      } catch {
        setError(err.message || 'Could not open Google Account Chooser.');
      }
    }
  };

  const handleSaveGoogleClientId = (e) => {
    e.preventDefault();
    if (!clientIdInput.trim()) return;
    const cleanId = clientIdInput.trim();
    crmApi.setGoogleClientId(cleanId);
    setGoogleClientId(cleanId);
    setShowConfigModal(false);
    // Persist to Central DB asynchronously if live backend is connected
    crmApi.saveDefaultConfig({ GoogleClientId: cleanId }).catch(() => {});
    // After saving, immediately launch the native Google popup
    setTimeout(() => {
      triggerNativeGooglePopup();
    }, 200);
  };

  const handleSelectWorkspace = async (ws) => {
    setError('');
    setLoading(true);
    try {
      await selectWorkspace(ws, multiTenantData);
    } catch (err) {
      setError(err.message || 'Failed to open workspace.');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenForgotPassword = () => {
    setError('');
    setForgotError('');
    setForgotSuccessMsg('');
    setForgotSmsNotice('');
    setForgotEmailSent(false);
    setForgotSmsSent(false);
    setForgotStep(1);
    setForgotIdentifier(username || '');
    setForgotOtp('');
    setForgotResetToken('');
    setForgotMaskedEmail('');
    setForgotMaskedMobile('');
    setForgotNewPassword('');
    setForgotConfirmPassword('');
    setShowForgotPassToggle(false);
    setShowForgotConfirmToggle(false);
    setShowForgotModal(true);
  };

  const handleSendOtp = async (e) => {
    if (e) e.preventDefault();
    if (!forgotIdentifier.trim()) {
      setForgotError('Please enter your Mobile Number, Email ID, or User ID.');
      return;
    }
    setForgotError('');
    setForgotSmsNotice('');
    setForgotEmailSent(false);
    setForgotSmsSent(false);
    setForgotLoading(true);
    try {
      const res = await crmApi.sendPasswordResetOtp(forgotIdentifier.trim());
      const hasEmailSent = Boolean(res.emailSent);
      const hasSmsSent = Boolean(res.smsSent);
      setForgotEmailSent(hasEmailSent);
      setForgotSmsSent(hasSmsSent);
      setForgotMaskedEmail(hasEmailSent ? (res.maskedEmail || res.email || '') : '');
      setForgotMaskedMobile(hasSmsSent ? (res.maskedMobile || res.mobile || '') : '');
      if (res.smsError) {
        setForgotSmsNotice(res.smsError);
      } else {
        setForgotSmsNotice('');
      }
      setForgotSuccessMsg(res.message || 'OTP sent successfully.');
      setForgotStep(2);
      setOtpResendTimer(60);
    } catch (err) {
      setForgotError(err.message || 'Failed to send OTP. Please check the entered identifier.');
    } finally {
      setForgotLoading(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    if (e) e.preventDefault();
    if (!forgotOtp.trim() || forgotOtp.trim().length !== 6) {
      setForgotError('Please enter the full 6-digit verification code.');
      return;
    }
    setForgotError('');
    setForgotLoading(true);
    try {
      const res = await crmApi.verifyPasswordResetOtp(forgotIdentifier.trim(), forgotOtp.trim());
      setForgotResetToken(res.resetToken || '');
      setForgotSuccessMsg('Code verified! Please enter your new password.');
      setForgotStep(3);
    } catch (err) {
      setForgotError(err.message || 'Invalid or expired verification code.');
    } finally {
      setForgotLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    if (e) e.preventDefault();
    setForgotError('');

    const reqs = getPasswordRequirements(forgotNewPassword);
    const unmet = reqs.filter(r => !r.met);
    if (unmet.length > 0) {
      setForgotError(`Password does not meet strength requirements. It must include: ${unmet.map(u => u.label).join(', ')}.`);
      return;
    }

    if (forgotNewPassword !== forgotConfirmPassword) {
      setForgotError('New Password and Confirm Password do not match.');
      return;
    }

    setForgotLoading(true);
    try {
      const res = await crmApi.resetPasswordWithOtp(
        forgotIdentifier.trim(),
        forgotOtp.trim(),
        forgotResetToken,
        forgotNewPassword
      );
      setForgotSuccessMsg(res.message || 'Password updated successfully!');
      setForgotStep(4);
      setUsername(forgotIdentifier.trim());
      setPassword('');
    } catch (err) {
      setForgotError(err.message || 'Failed to update password. Please try again.');
    } finally {
      setForgotLoading(false);
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
        {/* Brand Header */}
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
            fontSize: '1.4rem',
            boxShadow: '0 8px 20px rgba(37, 99, 235, 0.35)',
            marginBottom: '1rem',
            letterSpacing: '0.05em'
          }}>
            {(() => {
              const words = (loginCompanyName || 'SR INVESTMENTS CRM').split(' ').filter(Boolean);
              return words.length >= 2 ? (words[0][0] + words[1][0]).toUpperCase() : (words[0]?.slice(0, 2).toUpperCase() || 'SR');
            })()}
          </div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: '800', color: '#ffffff', margin: 0, letterSpacing: '0.02em' }}>
            {loginCompanyName || 'SR INVESTMENTS CRM'}
          </h2>
          <p style={{ fontSize: '0.85rem', color: '#94a3b8', marginTop: '0.35rem' }}>
            Centralized SaaS Mutual Fund & Advisory CRM
          </p>
        </div>

        {/* MULTI-TENANT WORKSPACE SELECTOR (Image 5) */}
        {multiTenantData ? (
          <div>
            <div style={{ textAlign: 'left', marginBottom: '1.5rem' }}>
              <h2 style={{ fontSize: '1.35rem', fontWeight: '800', color: '#ffffff', margin: 0 }}>
                Select your workspace
              </h2>
              <p style={{ fontSize: '0.825rem', color: '#94a3b8', marginTop: '0.35rem' }}>
                You have access to multiple organizations.
              </p>
            </div>

            {error && (
              <div style={{
                padding: '0.75rem 1rem',
                borderRadius: '8px',
                marginBottom: '1.25rem',
                fontSize: '0.8rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                backgroundColor: '#fee2e2',
                color: '#b91c1c'
              }}>
                <AlertCircle size={15} />
                <span>{error}</span>
              </div>
            )}

            {/* List of Organization Cards (Image 5) */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1.5rem' }}>
              {multiTenantData.workspaces.map((ws, idx) => {
                const initial = ws.companyName ? ws.companyName.charAt(0).toUpperCase() : 'W';
                const avatarColors = [
                  { bg: '#2563eb', color: '#ffffff' }, // Royal Blue
                  { bg: '#0d9488', color: '#ffffff' }, // Teal
                  { bg: '#7c3aed', color: '#ffffff' }  // Purple
                ];
                const avatarTheme = avatarColors[idx % avatarColors.length];

                return (
                  <button
                    key={ws.tenantId || idx}
                    type="button"
                    onClick={() => handleSelectWorkspace(ws)}
                    disabled={loading}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '1rem 1.25rem',
                      backgroundColor: '#0f172a',
                      border: '1px solid #334155',
                      borderRadius: '12px',
                      cursor: 'pointer',
                      textAlign: 'left',
                      transition: 'all 0.2s ease',
                      width: '100%'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor = '#3b82f6';
                      e.currentTarget.style.transform = 'translateY(-2px)';
                      e.currentTarget.style.boxShadow = '0 6px 16px rgba(59, 130, 246, 0.2)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = '#334155';
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.boxShadow = 'none';
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                      <div style={{
                        width: '42px',
                        height: '42px',
                        borderRadius: '10px',
                        backgroundColor: avatarTheme.bg,
                        color: avatarTheme.color,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '1.1rem',
                        fontWeight: '800',
                        flexShrink: 0,
                        boxShadow: '0 2px 5px rgba(0,0,0,0.2)'
                      }}>
                        {initial}
                      </div>

                      <div>
                        <div style={{ fontSize: '0.925rem', fontWeight: '700', color: '#ffffff' }}>
                          {ws.companyName}
                        </div>
                        <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '2px' }}>
                          <span style={{ color: '#60a5fa', fontWeight: '600' }}>{ws.role}</span>
                          <span style={{ margin: '0 4px', color: '#475569' }}>·</span>
                          <span style={{ fontFamily: 'monospace' }}>{ws.tenantId}</span>
                        </div>
                      </div>
                    </div>

                    <div style={{ color: '#64748b' }}>
                      <ChevronRight size={18} />
                    </div>
                  </button>
                );
              })}
            </div>

            <button
              type="button"
              onClick={() => { setMultiTenantData(null); setError(''); }}
              style={{
                width: '100%',
                padding: '0.65rem',
                background: 'transparent',
                border: '1px solid #334155',
                borderRadius: '8px',
                color: '#94a3b8',
                fontSize: '0.8rem',
                cursor: 'pointer',
                transition: 'all 0.15s ease'
              }}
              onMouseEnter={(e) => e.currentTarget.style.color = '#ffffff'}
              onMouseLeave={(e) => e.currentTarget.style.color = '#94a3b8'}
            >
              ← Back to Sign In
            </button>
          </div>
        ) : (
          /* STANDARD LOGIN FORM */
          <>
            {/* Error Banner */}
            {error && (
              <div style={{
                padding: '0.75rem 1rem',
                borderRadius: '8px',
                marginBottom: '1.25rem',
                fontSize: '0.8rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                backgroundColor: '#fee2e2',
                color: '#b91c1c'
              }}>
                <AlertCircle size={15} />
                <span>{error}</span>
              </div>
            )}

            {/* Google Native One-Click Login Button */}
            <div style={{ marginBottom: '1.25rem' }}>
              <button
                type="button"
                onClick={triggerNativeGooglePopup}
                disabled={loading}
                style={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.75rem',
                  backgroundColor: '#ffffff',
                  color: '#1f2937',
                  border: '1px solid #e5e7eb',
                  padding: '0.75rem',
                  borderRadius: '8px',
                  fontSize: '0.875rem',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'background 0.15s ease',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
                }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f9fafb'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#ffffff'}
              >
                <svg width="18" height="18" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
                </svg>
                <span>Continue with Google</span>
              </button>

              {/* Hidden or secondary container for GIS auto-render if initialized */}
              <div id="google-native-signin-btn" style={{ display: 'none' }}></div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', margin: '0.75rem 0 1.25rem' }}>
              <div style={{ flex: 1, height: '1px', backgroundColor: '#334155' }}></div>
              <span style={{ padding: '0 0.75rem', fontSize: '0.75rem', color: '#64748b', textTransform: 'uppercase' }}>or sign in with credentials</span>
              <div style={{ flex: 1, height: '1px', backgroundColor: '#334155' }}></div>
            </div>

            {/* Credentials Form */}
            <form onSubmit={handleStandardSubmit}>
              <div className="form-group" style={{ marginBottom: '1.25rem' }}>
                <label className="form-label" style={{ color: '#cbd5e1' }}>
                  Username / Email / Mobile
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
                    placeholder="admin@srinvestments.com"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                  />
                  <User size={16} color="#64748b" style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)' }} />
                </div>
              </div>

              <div className="form-group" style={{ marginBottom: '1.5rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
                  <label className="form-label" style={{ color: '#cbd5e1', margin: 0 }}>Password</label>
                  {(isForgotEmailEnabled || isForgotSmsEnabled) && (
                    <button
                      type="button"
                      onClick={handleOpenForgotPassword}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: '#60a5fa',
                        fontSize: '0.75rem',
                        cursor: 'pointer',
                        padding: 0,
                        fontWeight: '500'
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.textDecoration = 'underline'}
                      onMouseLeave={(e) => e.currentTarget.style.textDecoration = 'none'}
                    >
                      Forgot password?
                    </button>
                  )}
                </div>
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
          </>
        )}
      </div>

      {/* Google OAuth Client ID Configuration Modal */}
      {showConfigModal && (
        <div className="modal-overlay" onClick={() => setShowConfigModal(false)}>
          <div 
            className="modal-content" 
            style={{ maxWidth: '480px' }} 
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <svg width="22" height="22" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
                </svg>
                <h3 style={{ fontSize: '1.05rem', fontWeight: '700', color: '#0f172a', margin: 0 }}>
                  Google OAuth Account Chooser Setup
                </h3>
              </div>
            </div>

            <div className="modal-body">
              <p style={{ fontSize: '0.85rem', color: '#475569', lineHeight: 1.5, marginBottom: '1rem' }}>
                To display your browser's real logged-in Google accounts (e.g. <code>gopal@gmail.com</code>) in Google's native popup, Google requires a <strong>Google Cloud OAuth 2.0 Client ID</strong> for your domain/origin.
              </p>

              <div style={{
                backgroundColor: '#f8fafc',
                border: '1px solid #e2e8f0',
                borderRadius: '8px',
                padding: '0.85rem 1rem',
                fontSize: '0.8rem',
                color: '#334155',
                marginBottom: '1.25rem',
                lineHeight: 1.5
              }}>
                <div style={{ fontWeight: '700', color: '#0f172a', marginBottom: '0.35rem' }}>
                  Quick 1-Minute Setup in Google Cloud:
                </div>
                <ol style={{ margin: 0, paddingLeft: '1.25rem' }}>
                  <li>Go to <a href="https://console.cloud.google.com/apis/credentials" target="_blank" rel="noreferrer" style={{ color: '#2563eb', fontWeight: '600' }}>Google Cloud Console Credentials <ExternalLink size={11} style={{ display: 'inline' }} /></a>.</li>
                  <li>Click <strong>Create Credentials &gt; OAuth client ID</strong>.</li>
                  <li>Select <strong>Web application</strong>.</li>
                  <li>In <em>Authorized JavaScript origins</em>, add your URL: <code>{typeof window !== 'undefined' ? window.location.origin : 'http://localhost:5173'}</code>.</li>
                  <li>Copy the generated <strong>Client ID</strong> and paste below:</li>
                </ol>
              </div>

              <form onSubmit={handleSaveGoogleClientId}>
                <div className="form-group" style={{ marginBottom: '1.25rem' }}>
                  <label className="form-label" style={{ fontWeight: '600' }}>
                    Google OAuth 2.0 Web Client ID
                  </label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="xxxxxxxxxxxx-xxxxxxxxxxxxxxxx.apps.googleusercontent.com"
                    value={clientIdInput}
                    onChange={(e) => setClientIdInput(e.target.value)}
                    required
                    autoFocus
                  />
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1.5rem' }}>
                  <button
                    type="button"
                    style={{
                      background: 'none',
                      border: 'none',
                      color: '#64748b',
                      fontSize: '0.78rem',
                      cursor: 'pointer',
                      textDecoration: 'underline',
                      padding: 0
                    }}
                    onClick={() => {
                      setShowConfigModal(false);
                      setShowSimulatedModal(true);
                    }}
                  >
                    Test with manual email for now
                  </button>

                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button type="button" className="btn btn-secondary" onClick={() => setShowConfigModal(false)}>
                      Cancel
                    </button>
                    <button type="submit" className="btn btn-primary" disabled={!clientIdInput.trim()}>
                      Save & Open Google
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Fallback Email Simulation Modal (for dev/testing only) */}
      {showSimulatedModal && (
        <div className="modal-overlay" onClick={() => setShowSimulatedModal(false)}>
          <div 
            className="modal-content" 
            style={{ maxWidth: '420px' }} 
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-header">
              <h3 style={{ fontSize: '1rem', fontWeight: '700', color: '#0f172a', margin: 0 }}>
                Test Sign-In with Email (Simulation)
              </h3>
            </div>

            <div className="modal-body">
              <p style={{ fontSize: '0.85rem', color: '#64748b', marginBottom: '1rem' }}>
                Enter any registered Google Account email to test workspace routing:
              </p>

              <form onSubmit={(e) => {
                e.preventDefault();
                if (simulatedEmail.trim()) {
                  handleGoogleSignIn(simulatedEmail.trim(), simulatedEmail.trim().split('@')[0]);
                }
              }}>
                <div className="form-group" style={{ marginBottom: '1.25rem' }}>
                  <label className="form-label">Google Email Address</label>
                  <input
                    type="email"
                    className="form-input"
                    placeholder="yourname@gmail.com"
                    value={simulatedEmail}
                    onChange={(e) => setSimulatedEmail(e.target.value)}
                    required
                    autoFocus
                  />
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
                  <button type="button" className="btn btn-secondary" onClick={() => setShowSimulatedModal(false)}>
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={!simulatedEmail.trim() || loading}
                  >
                    {loading ? 'Authenticating...' : 'Continue to CRM'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
      {/* Forgot Password & OTP Modal */}
      {showForgotModal && (
        <div className="modal-overlay" onClick={() => !forgotLoading && setShowForgotModal(false)}>
          <div 
            className="modal-content" 
            style={{ 
              maxWidth: '460px', 
              backgroundColor: '#1e293b', 
              color: '#f8fafc',
              border: '1px solid #334155',
              borderRadius: '16px',
              padding: '1.75rem'
            }} 
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                <div style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '10px',
                  backgroundColor: '#1e40af',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#ffffff'
                }}>
                  <KeyRound size={18} />
                </div>
                <div>
                  <h3 style={{ fontSize: '1.1rem', fontWeight: '700', color: '#ffffff', margin: 0 }}>
                    {forgotStep === 1 && 'Reset Your Password'}
                    {forgotStep === 2 && 'Verify Security Code'}
                    {forgotStep === 3 && 'Create New Password'}
                    {forgotStep === 4 && 'Password Reset Complete'}
                  </h3>
                  <p style={{ fontSize: '0.75rem', color: '#94a3b8', margin: '2px 0 0 0' }}>
                    {forgotStep === 1 && 'Step 1 of 3: Account Verification'}
                    {forgotStep === 2 && 'Step 2 of 3: Enter 6-digit OTP'}
                    {forgotStep === 3 && 'Step 3 of 3: Set New Password'}
                    {forgotStep === 4 && 'Success'}
                  </p>
                </div>
              </div>
              <button 
                type="button" 
                onClick={() => setShowForgotModal(false)}
                disabled={forgotLoading}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#94a3b8',
                  fontSize: '1.4rem',
                  cursor: 'pointer',
                  lineHeight: 1,
                  padding: '4px'
                }}
              >
                &times;
              </button>
            </div>

            {/* Error Alert */}
            {forgotError && (
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                backgroundColor: 'rgba(239, 68, 68, 0.15)',
                border: '1px solid #ef4444',
                color: '#fca5a5',
                padding: '0.65rem 0.85rem',
                borderRadius: '8px',
                fontSize: '0.8rem',
                marginBottom: '1.25rem'
              }}>
                <AlertCircle size={15} style={{ flexShrink: 0 }} />
                <span>{forgotError}</span>
              </div>
            )}

            {/* Info Message */}
            {forgotSuccessMsg && forgotStep !== 4 && (
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                backgroundColor: 'rgba(16, 185, 129, 0.15)',
                border: '1px solid #10b981',
                color: '#6ee7b7',
                padding: '0.65rem 0.85rem',
                borderRadius: '8px',
                fontSize: '0.8rem',
                marginBottom: '1.25rem'
              }}>
                <CheckCircle size={15} style={{ flexShrink: 0 }} />
                <span>{forgotSuccessMsg}</span>
              </div>
            )}

            {/* STEP 1: Enter Identifier */}
            {forgotStep === 1 && (
              <form onSubmit={handleSendOtp}>
                <p style={{ fontSize: '0.825rem', color: '#cbd5e1', lineHeight: 1.5, marginBottom: '1.25rem' }}>
                  {isForgotEmailEnabled && isForgotSmsEnabled ? (
                    <>
                      Enter your registered <strong>Mobile Number</strong>, <strong>Email ID</strong> (any custom domain), or <strong>User ID</strong>. We will send a 6-digit verification code to <strong>both your Mobile SMS and Primary Email</strong>.
                    </>
                  ) : isForgotEmailEnabled ? (
                    <>
                      Enter your registered <strong>Email ID</strong> or <strong>User ID</strong>. We will send a 6-digit verification code to your registered <strong>Email</strong>.
                    </>
                  ) : (
                    <>
                      Enter your registered <strong>Mobile Number</strong> or <strong>User ID</strong>. We will send a 6-digit verification code via <strong>Mobile SMS</strong>.
                    </>
                  )}
                </p>

                <div className="form-group" style={{ marginBottom: '1.5rem' }}>
                  <label className="form-label" style={{ color: '#cbd5e1' }}>
                    {isForgotEmailEnabled && isForgotSmsEnabled ? 'Mobile Number / Email ID / User ID' : isForgotEmailEnabled ? 'Email ID / User ID' : 'Mobile Number / User ID'}
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
                      placeholder={
                        isForgotEmailEnabled && isForgotSmsEnabled 
                          ? "e.g. 1234567890, user@srinvestments.com, USER1" 
                          : isForgotEmailEnabled 
                            ? "e.g. user@srinvestments.com, USER1" 
                            : "e.g. 1234567890, USER1"
                      }
                      value={forgotIdentifier}
                      onChange={(e) => setForgotIdentifier(e.target.value)}
                      required
                      autoFocus
                    />
                    {isForgotEmailEnabled && !isForgotSmsEnabled ? (
                      <Mail size={16} color="#64748b" style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)' }} />
                    ) : isForgotSmsEnabled && !isForgotEmailEnabled ? (
                      <Phone size={16} color="#64748b" style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)' }} />
                    ) : (
                      <User size={16} color="#64748b" style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)' }} />
                    )}
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
                  <button 
                    type="button" 
                    className="btn btn-secondary" 
                    onClick={() => setShowForgotModal(false)}
                    disabled={forgotLoading}
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit" 
                    className="btn btn-primary"
                    disabled={forgotLoading || !forgotIdentifier.trim()}
                    style={{ minWidth: '130px' }}
                  >
                    {forgotLoading ? (
                      <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                        <RefreshCw size={14} className="spin-animation" /> Sending OTP...
                      </span>
                    ) : (
                      <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                        Send OTP <ArrowRight size={14} />
                      </span>
                    )}
                  </button>
                </div>
              </form>
            )}

            {/* STEP 2: Enter & Verify OTP */}
            {forgotStep === 2 && (
              <form onSubmit={handleVerifyOtp}>
                <p style={{ fontSize: '0.825rem', color: '#cbd5e1', lineHeight: 1.5, marginBottom: '0.85rem', textAlign: 'center' }}>
                  A 6-digit verification code was dispatched to:
                </p>

                {/* Destination Badges: Mobile SMS & Email */}
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginBottom: forgotSmsNotice ? '0.75rem' : '1.25rem', justifyContent: 'center' }}>
                  {forgotSmsSent && forgotMaskedMobile && !forgotSmsNotice && (
                    <div style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.4rem',
                      backgroundColor: 'rgba(37, 99, 235, 0.15)',
                      border: '1px solid #3b82f6',
                      borderRadius: '8px',
                      padding: '0.4rem 0.75rem',
                      fontSize: '0.78rem',
                      color: '#93c5fd'
                    }}>
                      <Phone size={13} style={{ color: '#60a5fa' }} />
                      <span>Mobile SMS: <strong>{forgotMaskedMobile}</strong></span>
                    </div>
                  )}
                  {forgotEmailSent && forgotMaskedEmail && (
                    <div style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.4rem',
                      backgroundColor: 'rgba(16, 185, 129, 0.15)',
                      border: '1px solid #10b981',
                      borderRadius: '8px',
                      padding: '0.4rem 0.75rem',
                      fontSize: '0.78rem',
                      color: '#a7f3d0'
                    }}>
                      <Mail size={13} style={{ color: '#34d399' }} />
                      <span>Email: <strong>{forgotMaskedEmail}</strong></span>
                    </div>
                  )}
                </div>

                {/* SMS Delivery Notice / Gateway Error Alert */}
                {forgotSmsNotice && (
                  <div style={{
                    backgroundColor: 'rgba(245, 158, 11, 0.12)',
                    border: '1px solid #f59e0b',
                    borderRadius: '8px',
                    padding: '0.65rem 0.85rem',
                    marginBottom: '1.25rem',
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '0.6rem',
                    fontSize: '0.78rem',
                    color: '#fef3c7',
                    lineHeight: 1.45,
                    textAlign: 'left'
                  }}>
                    <AlertTriangle size={16} style={{ color: '#fbbf24', flexShrink: 0, marginTop: '2px' }} />
                    <div>
                      <div><strong style={{ color: '#fbbf24' }}>SMS Delivery Notice:</strong> {forgotSmsNotice}</div>
                      <div style={{ marginTop: '0.25rem', color: '#86efac', fontWeight: '500' }}>
                        ✓ Verification OTP was sent to your registered Email ({forgotMaskedEmail}).
                      </div>
                    </div>
                  </div>
                )}

                <div className="form-group" style={{ marginBottom: '1.25rem', textAlign: 'center' }}>
                  <label className="form-label" style={{ color: '#cbd5e1', display: 'block', textAlign: 'center' }}>
                    Enter 6-Digit Code
                  </label>
                  <input
                    type="text"
                    maxLength={6}
                    autoComplete="one-time-code"
                    className="form-input"
                    style={{
                      backgroundColor: '#0f172a',
                      borderColor: '#3b82f6',
                      color: '#60a5fa',
                      fontSize: '1.6rem',
                      fontWeight: '800',
                      letterSpacing: '0.5rem',
                      textAlign: 'center',
                      padding: '0.65rem 1rem',
                      maxWidth: '220px',
                      margin: '0 auto'
                    }}
                    placeholder="••••••"
                    value={forgotOtp}
                    onChange={(e) => setForgotOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    required
                    autoFocus
                  />
                  <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '0.5rem' }}>
                    Code expires in 10 minutes.
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1.5rem' }}>
                  <button
                    type="button"
                    onClick={() => {
                      setForgotStep(1);
                      setForgotError('');
                      setForgotOtp('');
                    }}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: '#94a3b8',
                      fontSize: '0.78rem',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.25rem'
                    }}
                  >
                    <ArrowLeft size={13} /> Change Mobile/Email
                  </button>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <button
                      type="button"
                      disabled={otpResendTimer > 0 || forgotLoading}
                      onClick={handleSendOtp}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: otpResendTimer > 0 ? '#64748b' : '#3b82f6',
                        fontSize: '0.78rem',
                        cursor: otpResendTimer > 0 ? 'not-allowed' : 'pointer',
                        padding: 0
                      }}
                    >
                      {otpResendTimer > 0 ? `Resend in ${otpResendTimer}s` : 'Resend Code'}
                    </button>

                    <button 
                      type="submit" 
                      className="btn btn-primary"
                      disabled={forgotLoading || forgotOtp.trim().length !== 6}
                    >
                      {forgotLoading ? 'Verifying...' : 'Verify Code'}
                    </button>
                  </div>
                </div>
              </form>
            )}

            {/* STEP 3: Enter New Password */}
            {forgotStep === 3 && (() => {
              const passReqs = getPasswordRequirements(forgotNewPassword);
              const passStrength = getPasswordStrength(forgotNewPassword);
              const allReqsMet = passReqs.every(r => r.met);
              const passwordsMatch = Boolean(forgotNewPassword && forgotConfirmPassword && forgotNewPassword === forgotConfirmPassword);

              return (
                <form onSubmit={handleResetPassword}>
                  <p style={{ fontSize: '0.825rem', color: '#cbd5e1', lineHeight: 1.5, marginBottom: '1.25rem' }}>
                    Identity verified for {forgotSmsSent && forgotMaskedMobile && <><strong style={{ color: '#60a5fa' }}>{forgotMaskedMobile}</strong> and </>}<strong style={{ color: '#60a5fa' }}>{forgotMaskedEmail}</strong>. Create a strong new password for your account.
                  </p>

                  <div className="form-group" style={{ marginBottom: '0.85rem' }}>
                    <label className="form-label" style={{ color: '#cbd5e1' }}>New Password</label>
                    <div style={{ position: 'relative' }}>
                      <input
                        type={showForgotPassToggle ? 'text' : 'password'}
                        className="form-input"
                        style={{
                          backgroundColor: '#0f172a',
                          borderColor: forgotNewPassword ? (allReqsMet ? '#10b981' : '#3b82f6') : '#334155',
                          color: '#ffffff',
                          paddingLeft: '2.5rem',
                          paddingRight: '2.5rem'
                        }}
                        placeholder="Create strong password"
                        value={forgotNewPassword}
                        onChange={(e) => setForgotNewPassword(e.target.value)}
                        required
                        autoFocus
                      />
                      <Lock size={16} color="#64748b" style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)' }} />
                      <button
                        type="button"
                        onClick={() => setShowForgotPassToggle(!showForgotPassToggle)}
                        style={{
                          position: 'absolute',
                          right: '0.85rem',
                          top: '50%',
                          transform: 'translateY(-50%)',
                          background: 'none',
                          border: 'none',
                          color: '#64748b',
                          cursor: 'pointer',
                          padding: 0
                        }}
                      >
                        {showForgotPassToggle ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>

                    {/* Real-time Password Strength Meter */}
                    {forgotNewPassword && (
                      <div style={{ marginTop: '0.5rem', marginBottom: '0.5rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.25rem' }}>
                          <span style={{ fontSize: '0.72rem', color: '#94a3b8' }}>Password Strength:</span>
                          <span style={{ fontSize: '0.75rem', fontWeight: '700', color: passStrength.color }}>
                            {passStrength.label}
                          </span>
                        </div>
                        <div style={{ width: '100%', height: '5px', backgroundColor: '#334155', borderRadius: '3px', overflow: 'hidden' }}>
                          <div style={{
                            width: `${passStrength.percent}%`,
                            height: '100%',
                            backgroundColor: passStrength.color,
                            transition: 'all 0.3s ease'
                          }} />
                        </div>
                      </div>
                    )}

                    {/* Requirements Checklist Card */}
                    <div style={{
                      backgroundColor: 'rgba(15, 23, 42, 0.7)',
                      border: '1px solid #334155',
                      borderRadius: '8px',
                      padding: '0.65rem 0.85rem',
                      marginTop: '0.6rem'
                    }}>
                      <div style={{ fontSize: '0.7rem', fontWeight: '700', color: '#94a3b8', marginBottom: '0.35rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                        Password Pattern Requirements:
                      </div>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '0.3rem 0.6rem' }}>
                        {passReqs.map(req => (
                          <div 
                            key={req.key}
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: '0.4rem',
                              fontSize: '0.74rem',
                              color: req.met ? '#34d399' : '#94a3b8',
                              transition: 'color 0.2s ease'
                            }}
                          >
                            {req.met ? (
                              <Check size={13} style={{ color: '#10b981', flexShrink: 0 }} />
                            ) : (
                              <span style={{ width: '13px', height: '13px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', color: '#64748b' }}>•</span>
                            )}
                            <span>{req.label}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="form-group" style={{ marginBottom: '1.5rem' }}>
                    <label className="form-label" style={{ color: '#cbd5e1' }}>Confirm New Password</label>
                    <div style={{ position: 'relative' }}>
                      <input
                        type={showForgotConfirmToggle ? 'text' : 'password'}
                        className="form-input"
                        style={{
                          backgroundColor: '#0f172a',
                          borderColor: forgotConfirmPassword ? (passwordsMatch ? '#10b981' : '#ef4444') : '#334155',
                          color: '#ffffff',
                          paddingLeft: '2.5rem',
                          paddingRight: '2.5rem'
                        }}
                        placeholder="Re-enter new password"
                        value={forgotConfirmPassword}
                        onChange={(e) => setForgotConfirmPassword(e.target.value)}
                        required
                      />
                      <Lock size={16} color="#64748b" style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)' }} />
                      <button
                        type="button"
                        onClick={() => setShowForgotConfirmToggle(!showForgotConfirmToggle)}
                        style={{
                          position: 'absolute',
                          right: '0.85rem',
                          top: '50%',
                          transform: 'translateY(-50%)',
                          background: 'none',
                          border: 'none',
                          color: '#64748b',
                          cursor: 'pointer',
                          padding: 0
                        }}
                      >
                        {showForgotConfirmToggle ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>

                    {/* Confirm password feedback */}
                    {forgotConfirmPassword && (
                      <div style={{
                        marginTop: '0.35rem',
                        fontSize: '0.75rem',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.35rem',
                        color: passwordsMatch ? '#34d399' : '#f87171'
                      }}>
                        {passwordsMatch ? (
                          <>
                            <Check size={13} /> Passwords match
                          </>
                        ) : (
                          <>
                            <X size={13} /> Passwords do not match
                          </>
                        )}
                      </div>
                    )}
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
                    <button 
                      type="button" 
                      className="btn btn-secondary" 
                      onClick={() => setShowForgotModal(false)}
                      disabled={forgotLoading}
                    >
                      Cancel
                    </button>
                    <button 
                      type="submit" 
                      className="btn btn-primary"
                      disabled={forgotLoading || !allReqsMet || !passwordsMatch}
                    >
                      {forgotLoading ? (
                        <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                          <RefreshCw size={14} className="spin-animation" /> Updating Password...
                        </span>
                      ) : (
                        'Save & Update Password'
                      )}
                    </button>
                  </div>
                </form>
              );
            })()}

            {/* STEP 4: Success Message */}
            {forgotStep === 4 && (
              <div style={{ textAlign: 'center', padding: '1rem 0' }}>
                <div style={{
                  width: '56px',
                  height: '56px',
                  borderRadius: '50%',
                  backgroundColor: 'rgba(16, 185, 129, 0.15)',
                  border: '2px solid #10b981',
                  color: '#10b981',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '1rem'
                }}>
                  <CheckCircle size={28} />
                </div>
                <h4 style={{ fontSize: '1.15rem', fontWeight: '700', color: '#ffffff', margin: '0 0 0.5rem' }}>
                  Password Reset Successfully!
                </h4>
                <p style={{ fontSize: '0.85rem', color: '#94a3b8', lineHeight: 1.5, margin: '0 0 1.5rem' }}>
                  Your password has been securely updated with SHA-256 encryption. You can now log in using your new credentials.
                </p>

                <button
                  type="button"
                  className="btn btn-primary"
                  style={{ width: '100%', padding: '0.75rem', fontSize: '0.9rem', fontWeight: '600' }}
                  onClick={() => setShowForgotModal(false)}
                >
                  Return to Login
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
