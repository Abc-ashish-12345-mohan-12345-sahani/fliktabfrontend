import React, { useState, useEffect } from 'react';
import { Mail, Lock, User, Phone, Eye, EyeOff, AlertCircle, CheckCircle2, ArrowLeft, RefreshCw, KeyRound, AtSign } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import AppLogo from '../components/AppLogo';

// Blacklisted test/disposable/dummy email domains
const BLOCKED_EMAIL_DOMAINS = [
  'example.com',
  'example.org',
  'example.net',
  'test.com',
  'sample.com',
  'dummy.com',
  'tempmail.com',
  'mailinator.com',
  'throwawaymail.com',
  '10minutemail.com',
  'fake.com',
  'fakeemail.com',
  'dispostable.com',
  'guerrillamail.com',
];

const isAllowedEmailDomain = (val) => {
  if (!val || typeof val !== 'string') return false;
  const parts = val.trim().toLowerCase().split('@');
  if (parts.length !== 2) return false;
  const domain = parts[1];
  return !BLOCKED_EMAIL_DOMAINS.includes(domain);
};

// Strict RFC 5322 regex for valid email addresses
const isValidEmail = (val) => {
  if (!val || typeof val !== 'string') return false;
  const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/;
  if (!emailRegex.test(val.trim())) return false;
  const parts = val.trim().split('@');
  if (parts.length !== 2) return false;
  const domain = parts[1];
  if (!domain.includes('.')) return false;
  const tld = domain.split('.').pop();
  return tld && tld.length >= 2;
};

// Username validator (3-30 characters, letters, numbers, underscore)
const isValidUsername = (val) => {
  if (!val || typeof val !== 'string') return false;
  const clean = val.trim();
  if (clean.length < 3 || clean.length > 30) return false;
  return /^[a-zA-Z0-9_]+$/.test(clean);
};

export default function SignupPage({ onNavigateToLogin, onSignupSuccess }) {
  const { sendSignupOtp, verifySignupOtp } = useAuth();
  const [step, setStep] = useState(1); // 1 = Details form, 2 = 6-digit SMS OTP verification
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  
  // Password strength checks
  const passChecks = {
    length: password.length >= 8,
    upper: /[A-Z]/.test(password),
    lower: /[a-z]/.test(password),
    number: /[0-9]/.test(password),
    special: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password),
  };
  const passScore = Object.values(passChecks).filter(Boolean).length;
  const isPassStrong = passScore === 5;

  // OTP state
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [resendTimer, setResendTimer] = useState(60);
  const [isResendActive, setIsResendActive] = useState(false);
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Countdown timer for resend OTP
  useEffect(() => {
    let interval = null;
    if (step === 2 && resendTimer > 0) {
      interval = setInterval(() => {
        setResendTimer((prev) => prev - 1);
      }, 1000);
    } else if (resendTimer === 0) {
      setIsResendActive(true);
    }
    return () => clearInterval(interval);
  }, [step, resendTimer]);

  const handleSendOtp = async (e) => {
    if (e) e.preventDefault();
    if (!name || !username || !phoneNumber || !email || !password) {
      setError('Please provide your full name, username, mobile number, email address, and password.');
      return;
    }

    if (!isValidUsername(username)) {
      setError('Username must be 3-30 characters long and contain only letters, numbers, and underscores (e.g. mohan_ashish).');
      return;
    }

    const cleanPhone = phoneNumber.replace(/\D/g, '');
    if (cleanPhone.length < 10) {
      setError('Please enter a valid 10-digit mobile phone number (e.g. +91 9876543210)');
      return;
    }

    if (!isValidEmail(email)) {
      setError('Please enter a valid email address (e.g. name@domain.com)');
      return;
    }

    if (!isAllowedEmailDomain(email)) {
      setError('Test and disposable email domains (such as example.com) are not allowed. Please enter your real email address.');
      return;
    }

    if (!isPassStrong) {
      setError('Please create a strong password meeting all 5 security requirements (8+ chars, uppercase, lowercase, number, symbol).');
      return;
    }

    setIsLoading(true);
    setError('');
    setSuccessMsg('');

    try {
      const res = await sendSignupOtp({
        name: name.trim(),
        username: username.trim().toLowerCase(),
        phoneNumber: phoneNumber.trim(),
        email: email.trim().toLowerCase(),
        password,
        customData: {
          joinedPlatform: 'FlickTap React Cinema Web',
          registeredAt: new Date().toISOString(),
        },
      });

      setStep(2);
      setResendTimer(60);
      setIsResendActive(false);
      setSuccessMsg(`A 6-digit SMS verification code has been sent to ${phoneNumber}.`);
    } catch (err) {
      setError(
        err.response?.data?.message || err.message || 'Failed to send SMS verification code'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const executeVerify = async (codeToVerify) => {
    if (isLoading) return;
    if (!codeToVerify || codeToVerify.length !== 6) {
      setError('Please enter the full 6-digit verification code.');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      await verifySignupOtp({
        name: name.trim(),
        username: username.trim().toLowerCase(),
        phoneNumber: phoneNumber.trim(),
        email: email.trim().toLowerCase(),
        password,
        otp: codeToVerify,
      });
      if (onSignupSuccess) onSignupSuccess();
    } catch (err) {
      setError(
        err.response?.data?.message || err.message || 'Verification failed. Please check the code and try again.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleOtpChange = (index, value) => {
    const cleanVal = value.replace(/\D/g, '');
    if (cleanVal.length > 1) {
      // Paste handling
      const digits = cleanVal.slice(0, 6).split('');
      const newOtp = [...otp];
      digits.forEach((d, i) => {
        if (i < 6) newOtp[i] = d;
      });
      setOtp(newOtp);
      const joined = newOtp.join('');
      if (joined.length === 6) {
        executeVerify(joined);
      } else {
        const nextIndex = Math.min(digits.length, 5);
        document.getElementById(`signup-otp-${nextIndex}`)?.focus();
      }
      return;
    }

    const newOtp = [...otp];
    newOtp[index] = cleanVal;
    setOtp(newOtp);

    if (cleanVal && index < 5) {
      document.getElementById(`signup-otp-${index + 1}`)?.focus();
    }

    // Auto-verify as soon as the 6th digit is typed
    const fullCode = newOtp.join('');
    if (fullCode.length === 6) {
      executeVerify(fullCode);
    }
  };

  const handleOtpKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      document.getElementById(`signup-otp-${index - 1}`)?.focus();
    }
  };

  const handleVerifySubmit = (e) => {
    if (e) e.preventDefault();
    executeVerify(otp.join(''));
  };

  const handleResend = async () => {
    if (!isResendActive) return;
    setIsLoading(true);
    setError('');
    try {
      await sendSignupOtp({
        name: name.trim(),
        username: username.trim().toLowerCase(),
        phoneNumber: phoneNumber.trim(),
        email: email.trim().toLowerCase(),
        password,
      });
      setResendTimer(60);
      setIsResendActive(false);
      setSuccessMsg('A new SMS verification code has been sent.');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to resend code');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-8rem)] flex items-center justify-center py-12 px-4">
      <div className="w-full max-w-md space-y-6">
        {/* Brand Header */}
        <div className="text-center space-y-3 flex flex-col items-center">
          <AppLogo size="lg" showText={false} />
          <div>
            <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
              {step === 1 ? 'Create FlickTap Account' : 'Verify Mobile Number'}
            </h1>
            <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
              {step === 1
                ? 'One unified account for both Web Cinema and Flutter Mobile App.'
                : `Enter the 6-digit SMS verification code sent to ${phoneNumber}`}
            </p>
          </div>
        </div>

        {/* Card */}
        <div className="p-6 md:p-8 rounded-3xl bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-6">
          {step === 1 ? (
            /* STEP 1: Details Form */
            <form onSubmit={handleSendOtp} className="space-y-4">
              {/* Full Name */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Full Name</label>
                <div className="relative">
                  <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Mohan Ashish"
                    required
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-indigo-500 transition-all"
                  />
                </div>
              </div>

              {/* Username / Handle */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Username / Handle</label>
                <div className="relative">
                  <AtSign className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))}
                    placeholder="mohan_ashish"
                    required
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-indigo-500 transition-all font-mono"
                  />
                </div>
              </div>

              {/* Mobile Phone Number */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Mobile Phone Number</label>
                <div className="relative">
                  <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="tel"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    placeholder="+91 9876543210"
                    required
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-indigo-500 transition-all"
                  />
                </div>
              </div>

              {/* Email Address */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="streamer@example.com"
                    required
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-indigo-500 transition-all"
                  />
                </div>
              </div>

              {/* Password */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Strong Password</label>
                  {password && (
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                        passScore <= 2
                          ? 'bg-rose-500/15 text-rose-600 dark:text-rose-400'
                          : passScore <= 4
                          ? 'bg-amber-500/15 text-amber-600 dark:text-amber-400'
                          : 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400'
                      }`}
                    >
                      {passScore <= 2 ? 'Weak' : passScore <= 4 ? 'Moderate' : 'Strong & Secure 🛡️'}
                    </span>
                  )}
                </div>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="e.g. SecretPass@2026"
                    required
                    className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-indigo-500 transition-all font-mono"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((prev) => !prev)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>

                {/* Live Password Strength Progress Bar & Checklist */}
                {password.length > 0 && (
                  <div className="pt-2 space-y-2">
                    <div className="w-full bg-slate-200 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden flex gap-1">
                      <div
                        className={`h-full transition-all duration-300 rounded-full ${
                          passScore >= 1
                            ? passScore <= 2
                              ? 'bg-rose-500 w-1/4'
                              : passScore <= 4
                              ? 'bg-amber-500 w-3/4'
                              : 'bg-emerald-500 w-full'
                            : 'w-0'
                        }`}
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-1.5 pt-1 text-[10px]">
                      <div className={`flex items-center gap-1.5 font-medium ${passChecks.length ? 'text-emerald-600 dark:text-emerald-400 font-bold' : 'text-slate-400 dark:text-slate-500'}`}>
                        <span>{passChecks.length ? '✓' : '○'}</span>
                        <span>8+ Characters</span>
                      </div>
                      <div className={`flex items-center gap-1.5 font-medium ${passChecks.upper ? 'text-emerald-600 dark:text-emerald-400 font-bold' : 'text-slate-400 dark:text-slate-500'}`}>
                        <span>{passChecks.upper ? '✓' : '○'}</span>
                        <span>1 Uppercase (A-Z)</span>
                      </div>
                      <div className={`flex items-center gap-1.5 font-medium ${passChecks.number ? 'text-emerald-600 dark:text-emerald-400 font-bold' : 'text-slate-400 dark:text-slate-500'}`}>
                        <span>{passChecks.number ? '✓' : '○'}</span>
                        <span>1 Number (0-9)</span>
                      </div>
                      <div className={`flex items-center gap-1.5 font-medium ${passChecks.special ? 'text-emerald-600 dark:text-emerald-400 font-bold' : 'text-slate-400 dark:text-slate-500'}`}>
                        <span>{passChecks.special ? '✓' : '○'}</span>
                        <span>1 Symbol (!@#$)</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Error Message */}
              {error && (
                <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-700 dark:text-rose-300 text-xs flex items-center gap-2.5">
                  <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
                  <span>{error}</span>
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 hover:from-indigo-500 hover:to-pink-500 active:scale-95 text-sm font-bold text-white shadow-lg shadow-indigo-500/25 transition-all cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <KeyRound className="w-4 h-4" />
                    <span>Continue & Get SMS OTP</span>
                  </>
                )}
              </button>
            </form>
          ) : (
            /* STEP 2: OTP Verification */
            <form onSubmit={handleVerifySubmit} className="space-y-5">
              {/* Back to Edit Button */}
              <button
                type="button"
                onClick={() => {
                  setStep(1);
                  setError('');
                  setSuccessMsg('');
                }}
                className="text-xs text-indigo-600 dark:text-indigo-400 hover:text-indigo-500 flex items-center gap-1.5 font-medium transition-colors cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Edit Registration Details</span>
              </button>

              {/* Success alert */}
              {successMsg && (
                <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-700 dark:text-emerald-300 text-xs flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-500" />
                  <span>{successMsg}</span>
                </div>
              )}

              {/* 6 Digit Input Boxes */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    6-Digit SMS Verification Code
                  </label>
                  <span className="text-[10px] text-indigo-600 dark:text-indigo-400 font-medium">
                    Auto-verifies on 6th digit ✨
                  </span>
                </div>
                <div className="flex justify-between gap-2 max-w-xs mx-auto">
                  {otp.map((digit, index) => (
                    <input
                      key={index}
                      id={`signup-otp-${index}`}
                      type="text"
                      inputMode="numeric"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handleOtpChange(index, e.target.value)}
                      onKeyDown={(e) => handleOtpKeyDown(index, e)}
                      className="w-11 h-12 text-center text-xl font-bold rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/30 transition-all"
                    />
                  ))}
                </div>
              </div>

              {/* Resend Timer & Button */}
              <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 px-1">
                <span>Didn't receive SMS code?</span>
                {isResendActive ? (
                  <button
                    type="button"
                    onClick={handleResend}
                    disabled={isLoading}
                    className="text-indigo-600 dark:text-indigo-400 font-bold hover:underline cursor-pointer flex items-center gap-1"
                  >
                    <RefreshCw className="w-3 h-3" />
                    <span>Resend SMS Code</span>
                  </button>
                ) : (
                  <span className="text-slate-400 font-medium">
                    Resend in <strong className="text-slate-700 dark:text-slate-300">{resendTimer}s</strong>
                  </span>
                )}
              </div>

              {/* Error Message */}
              {error && (
                <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-700 dark:text-rose-300 text-xs flex items-center gap-2.5">
                  <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
                  <span>{error}</span>
                </div>
              )}

              {/* Verify Button */}
              <button
                type="submit"
                disabled={isLoading || otp.join('').length !== 6}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 hover:from-indigo-500 hover:to-pink-500 active:scale-95 text-sm font-bold text-white shadow-lg shadow-indigo-500/25 transition-all cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Verify Mobile & Create Account</span>
                  </>
                )}
              </button>
            </form>
          )}

          {/* Switch to Login */}
          <div className="text-center pt-1 border-t border-slate-200 dark:border-slate-800">
            <p className="text-xs text-slate-600 dark:text-slate-400">
              Already have an account?{' '}
              <button
                type="button"
                onClick={onNavigateToLogin}
                className="text-indigo-600 dark:text-indigo-400 font-bold hover:underline cursor-pointer"
              >
                Sign In
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
