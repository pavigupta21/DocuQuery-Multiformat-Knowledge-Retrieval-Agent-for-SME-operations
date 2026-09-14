import React, { useState } from 'react';
import { 
  Mail, 
  Lock, 
  Eye, 
  EyeOff, 
  Sparkles, 
  FileText, 
  FileSpreadsheet, 
  MailCheck, 
  ArrowRight, 
  AlertCircle,
  Zap,
  KeyRound,
  CheckCircle2
} from 'lucide-react';
import './LoginPage.css';

const LoginPage = ({ onLoginSuccess, showToast }) => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState(() => {
    return localStorage.getItem('docuquery_remember_email') || '';
  });
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(() => {
    return !!localStorage.getItem('docuquery_remember_email');
  });
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Email Verification State
  const [isVerifyingEmail, setIsVerifyingEmail] = useState(false);
  const [otpCode, setOtpCode] = useState('');
  const [pendingUserData, setPendingUserData] = useState(null);

  //Forgot and reset password State
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [resetCode, setResetCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [isResettingPassword, setIsResettingPassword] = useState(false);

  const saveUserSession = (userData, shouldRemember) => {
    if (shouldRemember) {
      localStorage.setItem('docuquery_user', JSON.stringify(userData));
      localStorage.setItem('docuquery_remember_email', userData.email);
      sessionStorage.removeItem('docuquery_user');
    } else {
      sessionStorage.setItem('docuquery_user', JSON.stringify(userData));
      localStorage.removeItem('docuquery_user');
      localStorage.removeItem('docuquery_remember_email');
    }
  };

  const extractErrorMessage = (data, fallbackMsg) => {
    if (!data) return fallbackMsg;
    if (typeof data.detail === 'string') return data.detail;
    if (Array.isArray(data.detail) && data.detail.length > 0) {
      const firstErr = data.detail[0];
      return firstErr.msg ? `Invalid ${firstErr.loc ? firstErr.loc[firstErr.loc.length - 1] : 'field'}: ${firstErr.msg}` : fallbackMsg;
    }
    return data.message || fallbackMsg;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');

    if (isSignUp && !fullName.trim()) {
      const msg = 'Please enter your full name.';
      setErrorMessage(msg);
      if (showToast) showToast({ type: 'error', title: 'Name Required', message: msg });
      return;
    }

    if (!email.trim()) {
      const msg = 'Please enter your work email address.';
      setErrorMessage(msg);
      if (showToast) showToast({ type: 'error', title: 'Email Required', message: msg });
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      const msg = `Please enter a complete email address ending with a top-level domain (e.g. user@example.com).`;
      setErrorMessage(msg);
      if (showToast) showToast({ type: 'error', title: 'Invalid Email Format', message: msg });
      return;
    }

    if (!password || password.length < 6) {
      const msg = 'Password must be at least 6 characters long.';
      setErrorMessage(msg);
      if (showToast) showToast({ type: 'error', title: 'Password Too Short', message: msg });
      return;
    }

    setIsLoading(true);

    try {
      if (isSignUp) {
        // REGISTER FLOW
        const response = await fetch('http://127.0.0.1:8000/auth/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ full_name: fullName, email: email.trim(), password }),
        });

        const data = await response.json();
        if (!response.ok) {
          throw new Error(extractErrorMessage(data, 'Registration failed'));
        }

        setIsLoading(false);
        const userObj = { email: data.email, name: data.full_name, role: 'Employee' };
        setPendingUserData(userObj);

        if (!data.is_verified) {
          setIsVerifyingEmail(true);
          if (showToast) {
            showToast({
              type: 'info',
              title: 'Verification Code Sent!',
              message: `We sent a 6-digit OTP code to ${data.email}. Please check your inbox.`
            });
          }
        } else {
          saveUserSession(userObj, rememberMe);
          onLoginSuccess(userObj);
        }

      } else {
        // LOGIN FLOW
        const response = await fetch('http://127.0.0.1:8000/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: email.trim(), password }),
        });

        const data = await response.json();
        if (!response.ok) {
          const errDetail = extractErrorMessage(data, 'Invalid email or password');
          if (errDetail.toLowerCase().includes('not verified')) {
            setPendingUserData({ email: email.trim(), name: 'Employee User', role: 'Employee' });
            setIsVerifyingEmail(true);
            if (showToast) {
              showToast({
                type: 'warning',
                title: 'Verification Required',
                message: 'Please enter the 6-digit verification code sent to your email.'
              });
            }
            return;
          }
          throw new Error(errDetail);
        }

        setIsLoading(false);
        const userData = { email: data.email, name: data.full_name, role: 'Employee' };
        saveUserSession(userData, rememberMe);
        onLoginSuccess(userData);
      }
    } catch (error) {
      setIsLoading(false);
      const msg = error.message || 'Authentication failed';
      setErrorMessage(msg);
      if (showToast) showToast({ type: 'error', title: 'Authentication Error', message: msg });
    }
  };

  // Submit OTP Email Verification Code
  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setErrorMessage('');

    if (!otpCode.trim() || otpCode.trim().length !== 6) {
      const msg = 'Please enter the complete 6-digit verification code.';
      setErrorMessage(msg);
      if (showToast) showToast({ type: 'error', title: 'Invalid Code', message: msg });
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch('http://127.0.0.1:8000/auth/verify-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: pendingUserData?.email || email.trim(),
          code: otpCode.trim()
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(extractErrorMessage(data, 'Invalid verification code'));
      }

      setIsLoading(false);
      const verifiedUser = {
        email: data.email,
        name: data.full_name || pendingUserData?.name || 'Employee User',
        role: 'Employee'
      };

      saveUserSession(verifiedUser, rememberMe);
      if (showToast) {
        showToast({
          type: 'success',
          title: 'Email Verified!',
          message: 'Your work email has been verified successfully.'
        });
      }
      onLoginSuccess(verifiedUser);

    } catch (error) {
      setIsLoading(false);
      const msg = error.message || 'Verification failed';
      setErrorMessage(msg);
      if (showToast) showToast({ type: 'error', title: 'Verification Error', message: msg });
    }
  };

  const handleDemoLogin = () => {
    setErrorMessage('');
    setEmail('demo.user@acmecorp.com');
    setPassword('demoPass123!');
    setIsLoading(true);

    setTimeout(() => {
      setIsLoading(false);
      const userData = {
        email: 'demo.user@acmecorp.com',
        name: 'Demo User',
        role: 'Demo User'
      };
      saveUserSession(userData, rememberMe);
      onLoginSuccess(userData);
    }, 700);
  };

  return (
    <div className="login-page-container">
      {/* LEFT HERO SECTION: DocuQuery SME Showcase */}
      <section className="login-hero-section">
        <div className="hero-pill-badge">
          <Sparkles size={14} />
          Multi-Format Knowledge Assistant
        </div>

        <h1 className="hero-heading">
          Ask questions. <br />
          Find <span className="highlight-text">trusted answers</span> fast.
        </h1>

        <p className="hero-subtext">
          DocuQuery retrieves exact evidence across scattered SME business policies, 
          Excel spreadsheets, and customer email threads—with zero manual file searching.
        </p>

        {/* Feature Cards Grid */}
        <div className="feature-cards-row">
          <div className="feature-mini-card pdf">
            <div className="icon-box">
              <FileText size={20} />
            </div>
            <span className="feature-title">PDF Policies</span>
            <span className="feature-desc">Extract exact clauses and page numbers.</span>
          </div>

          <div className="feature-mini-card excel">
            <div className="icon-box">
              <FileSpreadsheet size={20} />
            </div>
            <span className="feature-title">Excel Data</span>
            <span className="feature-desc">Query pricing, rows & quotation sheets.</span>
          </div>

          <div className="feature-mini-card email">
            <div className="icon-box">
              <MailCheck size={20} />
            </div>
            <span className="feature-title">Email Threads</span>
            <span className="feature-desc">Compare customer history & dates.</span>
          </div>
        </div>

        {/* Live RAG Citation Sample Preview */}
        <div className="sample-query-box">
          <div className="query-header">
            <Sparkles size={14} />
            Example Live Query & Citation Retrieval
          </div>

          <p className="query-text">
            “What is our refund policy for bulk orders quoted to Acme Corp last month?”
          </p>

          <div className="citation-pills-row">
            <span className="citation-label">Evidence Retrieved:</span>
            <span className="citation-pill pdf">
              <FileText size={12} /> Refund_Policy_2026.pdf (p. 4)
            </span>
            <span className="citation-pill excel">
              <FileSpreadsheet size={12} /> Acme_Quotes.xlsx (Row 14)
            </span>
            <span className="citation-pill email">
              <MailCheck size={12} /> Email Thread #892
            </span>
          </div>
        </div>
      </section>

      {/* RIGHT AUTH SECTION: Employee Auth Card */}
      <section className="login-auth-section">
        <div className="auth-card">

          {/* SCREEN A: 6-DIGIT EMAIL OTP VERIFICATION STEP */}
          {isVerifyingEmail ? (
            <>
              <div className="auth-card-header">
                <div style={{ width: 48, height: 48, borderRadius: '50%', background: 'rgba(16,185,129,0.15)', color: '#10b981', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 0.75rem auto' }}>
                  <KeyRound size={24} />
                </div>
                <h2 className="auth-card-title">Verify Work Email</h2>
                <p className="auth-card-subtitle">
                  We sent a 6-digit OTP code to <strong style={{ color: 'var(--text-primary)' }}>{pendingUserData?.email || email}</strong>.
                </p>
              </div>

              {errorMessage && (
                <div className="error-banner">
                  <AlertCircle size={16} />
                  <span>{errorMessage}</span>
                </div>
              )}

              <form className="auth-form" onSubmit={handleVerifyOtp} noValidate>
                <div className="form-group">
                  <label className="form-label">6-Digit Verification Code</label>
                  <div className="input-wrapper">
                    <KeyRound size={16} className="input-icon" />
                    <input
                      type="text"
                      className="form-input"
                      placeholder="e.g. 849201"
                      maxLength={6}
                      value={otpCode}
                      onChange={(e) => setOtpCode(e.target.value)}
                      style={{ letterSpacing: '0.2em', fontSize: '1.1rem', fontWeight: '800' }}
                      required
                    />
                  </div>
                </div>

                <button type="submit" className="btn-primary-submit" disabled={isLoading}>
                  {isLoading ? (
                    <div className="spinner"></div>
                  ) : (
                    <>
                      Verify & Activate Account
                      <CheckCircle2 size={18} />
                    </>
                  )}
                </button>

                <button 
                  type="button" 
                  className="btn-demo-quick" 
                  style={{ background: 'transparent', border: '1px solid var(--border-color)', color: 'var(--text-secondary)' }}
                  onClick={() => setIsVerifyingEmail(false)}
                >
                  ← Back to Sign In
                </button>
              </form>
            </>
          ) : isForgotPassword ? (
            /* SCREEN B: FORGOT PASSWORD SCREEN */
            <>
          <div className="auth-card-header">
            <div
              style={{
                width: 48,
                height: 48,
                borderRadius: '50%',
                background: 'rgba(99,102,241,0.15)',
                color: 'var(--primary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 0.75rem auto'
              }}
            >
              <KeyRound size={24} />
            </div>

            <h2 className="auth-card-title">
              {isResettingPassword ? 'Create New Password' : 'Reset Password'}
            </h2>

            <p className="auth-card-subtitle">
              {isResettingPassword
                ? 'Enter the reset code sent to your email and choose a new password.'
                : 'Enter your email to receive a password reset code.'}
            </p>
          </div>

          {errorMessage && (
            <div className="error-banner">
              <AlertCircle size={16} />
              <span>{errorMessage}</span>
            </div>
          )}

          {!isResettingPassword ? (
    <form
      className="auth-form"
      onSubmit={async (e) => {
        e.preventDefault();
        setErrorMessage('');
        setIsLoading(true);
        try {
          const response = await fetch(
            'http://127.0.0.1:8000/auth/forgot-password',
            {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json'
              },
              body: JSON.stringify({
                email: email.trim()
              })
            }
          );

          const data = await response.json();

          if (!response.ok) {
            throw new Error(
              extractErrorMessage(data, 'Unable to send reset code')
            );
          }

          setIsResettingPassword(true);

          if (showToast) {
            showToast({
              type: 'info',
              title: 'Reset Code Sent',
              message: 'Check your email for the password reset code.'
            });
          }
        } catch (error) {
          setErrorMessage(error.message || 'Unable to send reset code');
        } finally {
          setIsLoading(false);
        }
      }}
      noValidate
    >
      <div className="form-group">
        <label className="form-label">Email Address</label>

        <div className="input-wrapper">
          <Mail size={16} className="input-icon" />

          <input
            type="email"
            className="form-input"
            placeholder="employee@company.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
      </div>

      <button
        type="submit"
        className="btn-primary-submit"
        disabled={isLoading}
      >
        {isLoading ? (
          <div className="spinner"></div>
        ) : (
          <>
            Send Reset Code
            <ArrowRight size={18} />
          </>
        )}
      </button>
    </form>
  ) : (
    <form
      className="auth-form"
      onSubmit={async (e) => {
        e.preventDefault();
        setErrorMessage('');

        if (!/^\d{6}$/.test(resetCode.trim())) {
          setErrorMessage('Please enter a valid 6-digit reset code.');
          return;
        }

        if (newPassword.length < 6) {
          setErrorMessage(
            'New password must be at least 6 characters long.'
          );
          return;
        }

        setIsLoading(true);

        try {
          const response = await fetch(
            'http://127.0.0.1:8000/auth/reset-password',
            {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json'
              },
              body: JSON.stringify({
                email: email.trim(),
                code: resetCode.trim(),
                new_password: newPassword
              })
            }
          );

          const data = await response.json();

          if (!response.ok) {
            throw new Error(
              extractErrorMessage(data, 'Password reset failed')
            );
          }

          setIsForgotPassword(false);
          setIsResettingPassword(false);
          setResetCode('');
          setNewPassword('');
          setPassword('');
          setErrorMessage('');

          if (showToast) {
            showToast({
              type: 'success',
              title: 'Password Reset',
              message: 'Your password has been changed successfully.'
            });
          }
        } catch (error) {
          setErrorMessage(error.message || 'Password reset failed');
        } finally {
          setIsLoading(false);
        }
      }}
      noValidate
    >
      <div className="form-group">
        <label className="form-label">6-Digit Reset Code</label>

        <div className="input-wrapper">
          <KeyRound size={16} className="input-icon" />

          <input
            type="text"
            className="form-input"
            placeholder="e.g. 849201"
            maxLength={6}
            inputMode="numeric"
            value={resetCode}
            onChange={(e) =>
              setResetCode(e.target.value.replace(/\D/g, ''))
            }
            style={{
              letterSpacing: '0.2em',
              fontSize: '1.1rem',
              fontWeight: '800'
            }}
            required
          />
        </div>
      </div>

      <div className="form-group">
        <label className="form-label">New Password</label>

        <div className="input-wrapper">
          <Lock size={16} className="input-icon" />

          <input
            type="password"
            className="form-input"
            placeholder="Enter your new password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            required
          />
        </div>
      </div>

      <button
        type="submit"
        className="btn-primary-submit"
        disabled={isLoading}
      >
        {isLoading ? (
          <div className="spinner"></div>
        ) : (
          <>
            Reset Password
            <CheckCircle2 size={18} />
          </>
        )}
      </button>
    </form>
  )}

  <button
    type="button"
    className="btn-demo-quick"
    style={{
      background: 'transparent',
      border: '1px solid var(--border-color)',
      color: 'var(--text-secondary)'
    }}
    onClick={() => {
      setIsForgotPassword(false);
      setIsResettingPassword(false);
      setResetCode('');
      setNewPassword('');
      setErrorMessage('');
    }}
  >
    ← Back to Sign In
  </button>
</>
          ):
          (
            /* SCREEN C: STANDARD SIGN IN & REGISTER TABS */
            <>
              <div className="auth-card-header">
                <h2 className="auth-card-title">
                  {isSignUp ? 'Employee Registration' : 'Employee Sign In'}
                </h2>
                <p className="auth-card-subtitle">
                  {isSignUp 
                    ? 'Create your employee account to start querying documents'
                    : 'Access your company workspace and document history'
                  }
                </p>
              </div>

              {/* Mode Switcher Tabs */}
              <div className="auth-tabs">
                <button 
                  type="button"
                  className={`tab-btn ${!isSignUp ? 'active' : ''}`}
                  onClick={() => { setIsSignUp(false); setErrorMessage(''); }}
                >
                  Sign In
                </button>
                <button 
                  type="button"
                  className={`tab-btn ${isSignUp ? 'active' : ''}`}
                  onClick={() => { setIsSignUp(true); setErrorMessage(''); }}
                >
                  Register
                </button>
              </div>

              {/* Form Error Banner */}
              {errorMessage && (
                <div className="error-banner">
                  <AlertCircle size={16} />
                  <span>{errorMessage}</span>
                </div>
              )}

              {/* Authentication Form */}
              <form className="auth-form" onSubmit={handleSubmit} noValidate>
                {isSignUp && (
                  <div className="form-group">
                    <label className="form-label">Full Name</label>
                    <div className="input-wrapper">
                      <span className="input-icon">👤</span>
                      <input
                        type="text"
                        className="form-input"
                        placeholder="Jane Doe"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        required
                      />
                    </div>
                  </div>
                )}

                <div className="form-group">
                  <label className="form-label">Work Email</label>
                  <div className="input-wrapper">
                    <Mail size={16} className="input-icon" />
                    <input
                      type="email"
                      className="form-input"
                      placeholder="employee@company.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Password</label>
                  <div className="input-wrapper">
                    <Lock size={16} className="input-icon" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      className="form-input"
                      placeholder="••••••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                    <button
                      type="button"
                      className="toggle-password-btn"
                      onClick={() => setShowPassword(!showPassword)}
                      aria-label="Toggle password visibility"
                    >
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>

                {!isSignUp && (
                  <div className="form-options-row">
                    <label className="remember-label">
                      <input
                        type="checkbox"
                        className="remember-checkbox"
                        checked={rememberMe}
                        onChange={(e) => setRememberMe(e.target.checked)}
                      />
                      Remember me
                    </label>
                    <a href="#forgot" className="forgot-link" onClick={(e) => {
                      e.preventDefault();
                      setIsForgotPassword(true);
                      setErrorMessage('');
                    }}>
                      Forgot password?
                    </a>
                  </div>
                )}

                <button type="submit" className="btn-primary-submit" disabled={isLoading}>
                  {isLoading ? (
                    <div className="spinner"></div>
                  ) : (
                    <>
                      {isSignUp ? 'Create Employee Account' : 'Sign In to Workspace'}
                      <ArrowRight size={18} />
                    </>
                  )}
                </button>

                {/* Quick Demo Login Button */}
                {!isSignUp && (
                  <button 
                    type="button" 
                    className="btn-demo-quick" 
                    onClick={handleDemoLogin}
                    disabled={isLoading}
                  >
                    <Zap size={16} />
                    ⚡ One-Click Demo Employee Login
                  </button>
                )}
              </form>

              {/* Security footnote */}
              <div className="security-footnote">
                End-to-end 256-bit encrypted document security
              </div>
            </>
          )}
        </div>
      </section>
    </div>
  );
};

export default LoginPage;
