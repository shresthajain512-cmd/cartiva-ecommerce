import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  User,
  Store,
  Lock,
  Mail,
  Eye,
  EyeOff,
  AlertCircle,
  CheckCircle2,
  ArrowRight,
  ShieldCheck,
  Sparkles
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

export const AuthModal = ({
  isOpen,
  onClose,
  onNavigate,
  onSuccess,
  returnTo = null,
  initialTab = 'customer_login'
}) => {
  const { login, register, logout, isLoading: authLoading } = useAuth();
  const { addToast } = useToast();

  const [activeTab, setActiveTab] = useState(initialTab); // 'customer_login' | 'customer_register' | 'seller_login'
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: ''
  });

  const emailInputRef = useRef(null);

  // Sync initialTab when modal opens
  useEffect(() => {
    if (isOpen) {
      setActiveTab(initialTab);
      setErrorMsg('');
      setSuccessMsg('');
      setShowPassword(false);
      setFormData({ name: '', email: '', password: '' });
      setTimeout(() => {
        if (emailInputRef.current) {
          emailInputRef.current.focus();
        }
      }, 100);
    }
  }, [isOpen, initialTab]);

  // Handle ESC key press
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errorMsg) setErrorMsg('');
    if (successMsg) setSuccessMsg('');
  };

  const switchTab = (tab) => {
    setActiveTab(tab);
    setErrorMsg('');
    setSuccessMsg('');
    setFormData((prev) => ({ ...prev, password: '' }));
  };

  const validate = () => {
    const emailRegex = /^\S+@\S+\.\S+$/;
    const cleanEmail = formData.email.trim();

    if (!cleanEmail) {
      return 'Please enter your email address.';
    }
    if (!emailRegex.test(cleanEmail)) {
      return 'Please enter a valid email address.';
    }

    if (activeTab === 'customer_register') {
      const cleanName = formData.name.trim();
      if (!cleanName || cleanName.length < 2) {
        return 'Please enter your full name (at least 2 characters).';
      }
    }

    if (!formData.password) {
      return 'Please enter your account password.';
    }
    if (formData.password.length < 6) {
      return 'Password must be at least 6 characters.';
    }

    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationError = validate();
    if (validationError) {
      setErrorMsg(validationError);
      return;
    }

    setSubmitting(true);
    setErrorMsg('');
    setSuccessMsg('');

    const cleanEmail = formData.email.trim().toLowerCase();
    const cleanPassword = formData.password;

    try {
      if (activeTab === 'customer_login') {
        const res = await login(cleanEmail, cleanPassword);
        setSuccessMsg(`Welcome back, ${res.user?.name || 'Patron'}!`);
        addToast(`Signed in as ${res.user?.name || cleanEmail}`, 'success');
        setTimeout(() => {
          onClose();
          if (onSuccess) {
            onSuccess(res.user, returnTo);
          } else if (returnTo === 'checkout') {
            if (onNavigate) onNavigate('checkout');
          } else {
            if (onNavigate) onNavigate('account');
          }
        }, 600);
      } else if (activeTab === 'customer_register') {
        const res = await register({
          name: formData.name.trim(),
          email: cleanEmail,
          password: cleanPassword,
          role: 'customer'
        });
        setSuccessMsg(`Welcome to Cartiva, ${res.user?.name}! Your patron account is active.`);
        addToast(`Account created for ${res.user?.name}`, 'success');
        setTimeout(() => {
          onClose();
          if (onSuccess) {
            onSuccess(res.user, returnTo);
          } else if (returnTo === 'checkout') {
            if (onNavigate) onNavigate('checkout');
          } else {
            if (onNavigate) onNavigate('account');
          }
        }, 600);
      } else if (activeTab === 'seller_login') {
        const res = await login(cleanEmail, cleanPassword);
        const loggedUser = res.user;

        if (loggedUser?.role !== 'seller') {
          if (logout) logout();
          setErrorMsg('This account is registered as a Patron (Customer). Please use the Customer Sign In tab.');
          addToast('Account is registered as Patron, not Artisan Studio', 'warning');
          return;
        }

        // Enforce seller approval status and immediately clear established session if unapproved
        if (loggedUser?.sellerApprovalStatus === 'pending') {
          if (logout) logout();
          setErrorMsg('Your artisan studio application is currently under review by Cartiva curators. You will have access once approved.');
          addToast('Artisan Studio account pending curation approval', 'warning');
          return;
        }

        if (loggedUser?.sellerApprovalStatus === 'rejected') {
          if (logout) logout();
          setErrorMsg('Your artisan studio application has been rejected. Please contact Cartiva administration.');
          addToast('Artisan Studio account rejected', 'error');
          return;
        }

        if (loggedUser?.sellerApprovalStatus === 'suspended') {
          if (logout) logout();
          setErrorMsg('Your artisan studio account has been suspended by marketplace administration.');
          addToast('Artisan Studio account suspended', 'error');
          return;
        }

        if (loggedUser?.sellerApprovalStatus !== 'approved') {
          if (logout) logout();
          setErrorMsg(`Your artisan studio application is currently ${loggedUser?.sellerApprovalStatus || 'pending'}. Access is restricted until approved.`);
          addToast('Artisan Studio account not approved', 'error');
          return;
        }

        // Approved seller login
        setSuccessMsg(`Studio access verified for ${loggedUser.businessName || loggedUser.name}!`);
        addToast(`Welcome back, ${loggedUser.businessName || loggedUser.name}`, 'success');
        setTimeout(() => {
          onClose();
          if (onNavigate) onNavigate('seller-dashboard');
        }, 600);
      }
    } catch (err) {
      console.warn('Authentication error:', err.message);
      setErrorMsg(err.message || 'Authentication failed. Please verify your credentials.');
    } finally {
      setSubmitting(false);
    }
  };

  const isBusy = submitting || authLoading;

  return (
    <div
      className="auth-modal-backdrop"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="auth-modal-title"
    >
      <div className="auth-modal-card" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="auth-modal-header">
          <div className="auth-header-title-group">
            <span className="auth-brand-badge">
              <Sparkles size={13} />
              <span>Cartiva Sanctuary</span>
            </span>
            <h2 id="auth-modal-title" className="auth-title">
              {activeTab === 'customer_login' && 'Patron Sign In'}
              {activeTab === 'customer_register' && 'Join the Sanctuary'}
              {activeTab === 'seller_login' && 'Artisan Studio Sign In'}
            </h2>
            <p className="auth-subtitle">
              {activeTab === 'customer_login' && 'Access your private acquisitions, saved wishlists, and studio orders.'}
              {activeTab === 'customer_register' && 'Create your patron profile to acquire handcrafted limited edition works.'}
              {activeTab === 'seller_login' && 'Direct portal for verified makers, workshops, and independent ateliers.'}
            </p>
          </div>
          <button
            type="button"
            className="auth-modal-close-btn"
            onClick={onClose}
            aria-label="Close authentication window"
          >
            <X size={20} />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="auth-tabs-nav" role="tablist">
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'customer_login'}
            className={`auth-tab-btn ${activeTab === 'customer_login' ? 'active' : ''}`}
            onClick={() => switchTab('customer_login')}
          >
            <User size={15} />
            <span>Customer Login</span>
          </button>

          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'customer_register'}
            className={`auth-tab-btn ${activeTab === 'customer_register' ? 'active' : ''}`}
            onClick={() => switchTab('customer_register')}
          >
            <Sparkles size={15} />
            <span>Create Account</span>
          </button>

          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'seller_login'}
            className={`auth-tab-btn ${activeTab === 'seller_login' ? 'active' : ''}`}
            onClick={() => switchTab('seller_login')}
          >
            <Store size={15} />
            <span>Seller Studio</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="auth-modal-body">
          {/* Status Banners */}
          {errorMsg && (
            <div className="auth-alert-banner error" role="alert">
              <AlertCircle size={18} className="alert-icon" />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="auth-alert-banner success" role="status">
              <CheckCircle2 size={18} className="alert-icon" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="auth-form" noValidate>
            {activeTab === 'customer_register' && (
              <div className="auth-field-group">
                <label htmlFor="auth-name" className="auth-label">
                  Full Name *
                </label>
                <div className="auth-input-wrapper">
                  <User size={16} className="auth-input-icon" />
                  <input
                    id="auth-name"
                    type="text"
                    required
                    disabled={isBusy}
                    placeholder="e.g. Priya Sharma"
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    className="auth-input"
                  />
                </div>
              </div>
            )}

            <div className="auth-field-group">
              <label htmlFor="auth-email" className="auth-label">
                {activeTab === 'seller_login' ? 'Studio Email Address *' : 'Email Address *'}
              </label>
              <div className="auth-input-wrapper">
                <Mail size={16} className="auth-input-icon" />
                <input
                  id="auth-email"
                  ref={emailInputRef}
                  type="email"
                  required
                  disabled={isBusy}
                  placeholder={activeTab === 'seller_login' ? 'artisan@studio.com' : 'patron@example.com'}
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  className="auth-input"
                />
              </div>
            </div>

            <div className="auth-field-group">
              <div className="auth-label-row">
                <label htmlFor="auth-password" className="auth-label">
                  Password *
                </label>
                <span className="auth-hint">At least 6 characters</span>
              </div>
              <div className="auth-input-wrapper">
                <Lock size={16} className="auth-input-icon" />
                <input
                  id="auth-password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  disabled={isBusy}
                  placeholder="Enter your password"
                  value={formData.password}
                  onChange={(e) => handleInputChange('password', e.target.value)}
                  className="auth-input has-toggle"
                />
                <button
                  type="button"
                  className="auth-toggle-pwd-btn"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isBusy}
              className="btn-primary auth-submit-btn"
            >
              {isBusy ? (
                <span>Verifying credentials...</span>
              ) : (
                <>
                  <span>
                    {activeTab === 'customer_login' && 'Sign In as Patron'}
                    {activeTab === 'customer_register' && 'Create Patron Profile'}
                    {activeTab === 'seller_login' && 'Sign In to Studio Portal'}
                  </span>
                  <ArrowRight size={16} />
                </>
              )}
            </button>
          </form>

          {/* Bottom Switcher Links */}
          <div className="auth-footer-links">
            {activeTab === 'customer_login' && (
              <>
                <p>
                  New to Cartiva?{' '}
                  <button
                    type="button"
                    className="auth-link-btn"
                    onClick={() => switchTab('customer_register')}
                  >
                    Create a Patron Account
                  </button>
                </p>
                <p className="auth-sub-link">
                  Are you an independent creator?{' '}
                  <button
                    type="button"
                    className="auth-link-btn"
                    onClick={() => switchTab('seller_login')}
                  >
                    Artisan Studio Login
                  </button>
                </p>
              </>
            )}

            {activeTab === 'customer_register' && (
              <>
                <p>
                  Already have an account?{' '}
                  <button
                    type="button"
                    className="auth-link-btn"
                    onClick={() => switchTab('customer_login')}
                  >
                    Sign In Here
                  </button>
                </p>
                <div className="auth-guarantee-note">
                  <ShieldCheck size={14} />
                  <span>Cartiva guarantees complete privacy. No marketing spam.</span>
                </div>
              </>
            )}

            {activeTab === 'seller_login' && (
              <>
                <p>
                  Looking for patron acquisitions?{' '}
                  <button
                    type="button"
                    className="auth-link-btn"
                    onClick={() => switchTab('customer_login')}
                  >
                    Customer Sign In
                  </button>
                </p>
                <div className="auth-guarantee-note">
                  <Store size={14} />
                  <span>Verified independent ateliers only. Curatorial vetting enforced.</span>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      <style>{`
        .auth-modal-backdrop {
          position: fixed;
          inset: 0;
          z-index: 850;
          background: rgba(37, 37, 34, 0.65);
          backdrop-filter: blur(5px);
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 1.25rem;
          animation: fadeIn 0.25s ease forwards;
        }

        .auth-modal-card {
          width: 100%;
          max-width: 480px;
          background-color: var(--color-white, #FFFFFF);
          border-radius: var(--radius-md, 8px);
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.22);
          border: 1px solid var(--color-beige, #EFECE6);
          overflow: hidden;
          display: flex;
          flex-direction: column;
          animation: slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }

        .auth-modal-header {
          position: relative;
          padding: 1.75rem 2rem 1.25rem;
          background-color: var(--color-cream, #FAF8F5);
          border-bottom: 1px solid var(--color-beige, #EFECE6);
        }

        .auth-header-title-group {
          display: flex;
          flex-direction: column;
          gap: 0.35rem;
        }

        .auth-brand-badge {
          display: inline-flex;
          align-items: center;
          gap: 0.35rem;
          font-size: 0.72rem;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.08em;
          color: #8C6D3B;
          margin-bottom: 0.15rem;
        }

        .auth-title {
          font-family: var(--font-serif, 'Playfair Display', serif);
          font-size: 1.65rem;
          font-weight: 600;
          color: var(--color-charcoal, #252522);
          margin: 0;
          letter-spacing: -0.01em;
        }

        .auth-subtitle {
          font-size: 0.85rem;
          line-height: 1.45;
          color: var(--color-charcoal-muted, #6B6964);
          margin: 0;
        }

        .auth-modal-close-btn {
          position: absolute;
          top: 1.25rem;
          right: 1.25rem;
          background: transparent;
          border: none;
          color: var(--color-charcoal-muted, #6B6964);
          cursor: pointer;
          padding: 0.4rem;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.2s ease;
        }

        .auth-modal-close-btn:hover {
          color: var(--color-charcoal, #252522);
          background-color: var(--color-beige, #EFECE6);
        }

        .auth-tabs-nav {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          background-color: var(--color-beige, #EFECE6);
          padding: 0.35rem;
          gap: 0.35rem;
          border-bottom: 1px solid rgba(0, 0, 0, 0.05);
        }

        .auth-tab-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.4rem;
          padding: 0.65rem 0.5rem;
          background: transparent;
          border: none;
          border-radius: var(--radius-sm, 4px);
          font-size: 0.82rem;
          font-weight: 500;
          color: var(--color-charcoal-muted, #6B6964);
          cursor: pointer;
          transition: all 0.2s ease;
          white-space: nowrap;
        }

        .auth-tab-btn:hover {
          color: var(--color-charcoal, #252522);
        }

        .auth-tab-btn.active {
          background-color: var(--color-white, #FFFFFF);
          color: var(--color-charcoal, #252522);
          font-weight: 600;
          box-shadow: 0 2px 6px rgba(0, 0, 0, 0.06);
        }

        .auth-modal-body {
          padding: 1.75rem 2rem;
          display: flex;
          flex-direction: column;
          gap: 1.25rem;
        }

        .auth-alert-banner {
          display: flex;
          align-items: flex-start;
          gap: 0.65rem;
          padding: 0.85rem 1rem;
          border-radius: var(--radius-sm, 4px);
          font-size: 0.84rem;
          line-height: 1.45;
        }

        .auth-alert-banner.error {
          background-color: #FDF2F2;
          border: 1px solid #F8B4B4;
          color: #9B1C1C;
        }

        .auth-alert-banner.success {
          background-color: #F3FAF7;
          border: 1px solid #BCF0DA;
          color: #03543F;
        }

        .auth-alert-banner .alert-icon {
          flex-shrink: 0;
          margin-top: 0.1rem;
        }

        .auth-form {
          display: flex;
          flex-direction: column;
          gap: 1.1rem;
        }

        .auth-field-group {
          display: flex;
          flex-direction: column;
          gap: 0.4rem;
        }

        .auth-label-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .auth-label {
          font-size: 0.82rem;
          font-weight: 600;
          color: var(--color-charcoal, #252522);
          letter-spacing: 0.01em;
        }

        .auth-hint {
          font-size: 0.74rem;
          color: var(--color-charcoal-muted, #6B6964);
        }

        .auth-input-wrapper {
          position: relative;
          display: flex;
          align-items: center;
        }

        .auth-input-icon {
          position: absolute;
          left: 0.85rem;
          color: var(--color-charcoal-muted, #6B6964);
          pointer-events: none;
        }

        .auth-input {
          width: 100%;
          padding: 0.75rem 1rem 0.75rem 2.4rem;
          font-size: 0.92rem;
          color: var(--color-charcoal, #252522);
          background-color: var(--color-white, #FFFFFF);
          border: 1px solid var(--color-beige, #EFECE6);
          border-radius: var(--radius-sm, 4px);
          outline: none;
          transition: border-color 0.2s, box-shadow 0.2s;
        }

        .auth-input:focus {
          border-color: #8C6D3B;
          box-shadow: 0 0 0 3px rgba(140, 109, 59, 0.12);
        }

        .auth-input.has-toggle {
          padding-right: 2.6rem;
        }

        .auth-toggle-pwd-btn {
          position: absolute;
          right: 0.75rem;
          background: transparent;
          border: none;
          color: var(--color-charcoal-muted, #6B6964);
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 0.35rem;
          border-radius: 4px;
        }

        .auth-toggle-pwd-btn:hover {
          color: var(--color-charcoal, #252522);
        }

        .auth-submit-btn {
          width: 100%;
          padding: 0.85rem 1.5rem;
          font-size: 0.92rem;
          font-weight: 600;
          letter-spacing: 0.02em;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          margin-top: 0.4rem;
          cursor: pointer;
        }

        .auth-submit-btn:disabled {
          opacity: 0.65;
          cursor: not-allowed;
        }

        .auth-footer-links {
          text-align: center;
          font-size: 0.84rem;
          color: var(--color-charcoal-muted, #6B6964);
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
          padding-top: 0.5rem;
          border-top: 1px dashed var(--color-beige, #EFECE6);
        }

        .auth-footer-links p {
          margin: 0;
        }

        .auth-link-btn {
          background: none;
          border: none;
          padding: 0;
          font-size: 0.84rem;
          font-weight: 600;
          color: #8C6D3B;
          cursor: pointer;
          text-decoration: underline;
        }

        .auth-link-btn:hover {
          color: var(--color-charcoal, #252522);
        }

        .auth-sub-link {
          font-size: 0.78rem;
        }

        .auth-guarantee-note {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 0.4rem;
          font-size: 0.76rem;
          color: var(--color-charcoal-muted, #6B6964);
          margin-top: 0.25rem;
        }

        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        @keyframes slideUp {
          from { opacity: 0; transform: translateY(16px); }
          to { opacity: 1; transform: translateY(0); }
        }

        @media (max-width: 480px) {
          .auth-modal-card {
            max-width: 100%;
          }
          .auth-modal-header,
          .auth-modal-body {
            padding: 1.25rem 1.25rem;
          }
          .auth-tab-btn {
            font-size: 0.75rem;
            padding: 0.5rem 0.25rem;
          }
        }
      `}</style>
    </div>
  );
};

