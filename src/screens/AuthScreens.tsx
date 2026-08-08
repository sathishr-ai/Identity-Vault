import React, { useState, useRef, useEffect } from 'react';
import { Shield, Eye, EyeOff, ArrowRight, Mail, Lock, User, Phone, Check, ChevronLeft, Fingerprint, Zap } from 'lucide-react';
import { Button, Spinner } from '../components/UIComponents';
import { authApi, setAuthToken, setSavedUser } from '../service/api';

type AuthScreen = 'splash' | 'login' | 'register' | 'forgot-password' | 'otp';
type Role = 'user' | 'admin' | 'verifier';

interface AuthProps {
  onAuth: (role: Role) => void;
  screen: AuthScreen;
  onNav: (s: AuthScreen) => void;
}

// ── Shared background ─────────────────────────────────────────────────────────
function AuthBg({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex" style={{ background: 'linear-gradient(135deg, #0F1729 0%, #0F172A 50%, #0B1E3F 100%)' }}>
      {/* Left panel */}
      <div className="hidden lg:flex lg:w-1/2 flex-col justify-between p-12 relative overflow-hidden">
        {/* Grid lines decoration */}
        <div className="absolute inset-0 opacity-5" style={{
          backgroundImage: 'linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)',
          backgroundSize: '40px 40px'
        }} />
        {/* Glow orbs */}
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-blue-600/20 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-48 h-48 bg-cyan-500/15 rounded-full blur-3xl" />

        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-16">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-2xl flex items-center justify-center shadow-xl shadow-blue-500/40">
              <Shield size={20} className="text-white" />
            </div>
            <div>
              <p className="text-white font-bold text-lg leading-none">Identity Vault</p>
              <p className="text-slate-500 text-xs mt-0.5">Digital Identity Platform</p>
            </div>
          </div>

          <h1 className="text-4xl font-bold text-white leading-tight mb-4">
            Your Identity,<br />
            <span style={{ background: 'linear-gradient(90deg,#60A5FA,#22D3EE)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              Secured On-Chain
            </span>
          </h1>
          <p className="text-slate-400 text-base leading-relaxed max-w-sm">
            Secure blockchain identity verification trusted by 88,000+ organizations worldwide.
          </p>
        </div>

        {/* Feature pills */}
        <div className="relative z-10 space-y-3">
          {[
            { icon: <Shield size={14} />, text: 'Immutable blockchain records' },
            { icon: <Zap size={14} />, text: 'Sub-second verification speed' },
            { icon: <Fingerprint size={14} />, text: 'Zero-knowledge proofs' },
          ].map((f, i) => (
            <div key={i} className="flex items-center gap-3 px-4 py-3 rounded-xl" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
              <div className="w-7 h-7 bg-blue-500/20 rounded-lg flex items-center justify-center text-blue-400">{f.icon}</div>
              <span className="text-sm text-slate-300">{f.text}</span>
              <Check size={13} className="ml-auto text-emerald-400" />
            </div>
          ))}
        </div>

        <p className="relative z-10 text-xs text-slate-600">© 2024 Identity Vault Inc. · SOC2 Type II · ISO 27001 · GDPR Compliant</p>
      </div>

      {/* Right panel */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          {children}
        </div>
      </div>
    </div>
  );
}

// ── Splash ────────────────────────────────────────────────────────────────────
export function SplashScreen({ onNav }: { onNav: (s: AuthScreen) => void }) {
  const [loaded, setLoaded] = useState(false);
  useEffect(() => { setTimeout(() => setLoaded(true), 600); }, []);

  return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #060D1A 0%, #0F172A 50%, #0B1E3F 100%)' }}>
      {/* Animated background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/3 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-1/4 right-1/3 w-64 h-64 bg-cyan-500/8 rounded-full blur-3xl animate-float" style={{ animationDelay: '1s' }} />
        <div className="absolute inset-0 opacity-5" style={{
          backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.8) 1px, transparent 1px)',
          backgroundSize: '32px 32px'
        }} />
      </div>

      <div className={`relative z-10 text-center transition-all duration-700 ${loaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
        {/* Logo */}
        <div className="flex justify-center mb-8">
          <div className="relative">
            <div className="w-24 h-24 bg-gradient-to-br from-blue-600 to-cyan-500 rounded-3xl flex items-center justify-center shadow-2xl shadow-blue-500/40 animate-pulse-glow">
              <Shield size={44} className="text-white" />
            </div>
            <div className="absolute -bottom-1 -right-1 w-8 h-8 bg-emerald-500 rounded-xl flex items-center justify-center shadow-lg">
              <Check size={16} className="text-white" />
            </div>
          </div>
        </div>

        <h1 className="text-5xl font-black text-white mb-2 tracking-tight">Identity Vault</h1>
        <p className="text-slate-400 text-lg mb-2">Blockchain Identity Verification</p>
        <div className="flex items-center justify-center gap-2 mb-12">
          {['SOC2', 'ISO 27001', 'GDPR', 'FIPS 140-2'].map(b => (
            <span key={b} className="text-[10px] text-slate-500 px-2 py-0.5 rounded-full border border-slate-800">{b}</span>
          ))}
        </div>

        {/* Chain animation */}
        <div className="flex items-center justify-center gap-2 mb-12">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="flex items-center gap-2">
              <div className="w-8 h-8 bg-blue-900/60 border border-blue-700/50 rounded-lg flex items-center justify-center"
                style={{ animationDelay: `${i * 0.2}s` }}>
                <div className="w-2 h-2 bg-blue-400 rounded-sm" />
              </div>
              {i < 4 && <div className="w-4 h-0.5 bg-gradient-to-r from-blue-700 to-blue-600" />}
            </div>
          ))}
        </div>

        <div className="flex flex-col gap-3 items-center">
          <Button onClick={() => onNav('login')} size="lg" className="px-12 rounded-2xl">
            Get Started <ArrowRight size={16} />
          </Button>
          <p className="text-xs text-slate-600">SSO available for organizations</p>
        </div>
      </div>
    </div>
  );
}

// ── Login ─────────────────────────────────────────────────────────────────────
export function LoginScreen({ onAuth, onNav }: AuthProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [selectedRole, setSelectedRole] = useState<Role>('user');
  const [error, setError] = useState('');

  const handleLogin = () => {
    if (!email || !password) { setError('Please enter your credentials.'); return; }
    setLoading(true);
    setError('');
    authApi.login(email, password)
      .then(res => {
        setLoading(false);
        if (res.token && res.user) {
          setAuthToken(res.token);
          setSavedUser(res.user);
          onAuth(res.user.role as Role);
        } else {
          setError('Login failed. Please check your credentials.');
        }
      })
      .catch(err => {
        setLoading(false);
        setError(err.message || 'Login failed.');
      });
  };



  return (
    <AuthBg>
      <div className="animate-fade-in">
        <div className="mb-8">
          <div className="lg:hidden flex items-center gap-2 mb-6">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center">
              <Shield size={16} className="text-white" />
            </div>
            <span className="text-white font-bold">Identity Vault</span>
          </div>
          <h2 className="text-2xl font-bold text-white mb-1">Welcome back</h2>
          <p className="text-slate-400 text-sm">Sign in to your identity dashboard</p>
        </div>

        <div className="space-y-4">
          {error && <div className="flex items-center gap-2 p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-xs">{error}</div>}

          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1.5">Email address</label>
            <div className="relative">
              <Mail size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="Enter your email"
                className="w-full pl-9 pr-4 py-3 rounded-xl text-sm text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-medium text-slate-400 block mb-1.5">Password</label>
            <div className="relative mb-2">
              <Lock size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                type={showPw ? 'text' : 'password'}
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="Enter your password"
                className="w-full pl-9 pr-10 py-3 rounded-xl text-sm text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}
              />
              <button onClick={() => setShowPw(!showPw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500">
                {showPw ? <EyeOff size={14} /> : <Eye size={14} />}
              </button>
            </div>
            <div className="flex justify-end">
              <button onClick={() => onNav('forgot-password')} className="text-xs text-blue-400 hover:text-blue-300 font-medium">Forgot password?</button>
            </div>
          </div>

          <button
            onClick={handleLogin}
            disabled={loading}
            className="w-full py-3 rounded-xl text-sm font-semibold text-white flex items-center justify-center gap-2 transition-all"
            style={{ background: 'linear-gradient(135deg, #1D4ED8, #2563EB)', boxShadow: '0 4px 24px rgba(29,78,216,0.4)' }}
          >
            {loading ? <Spinner size="sm" /> : <><span>Sign In</span><ArrowRight size={16} /></>}
          </button>
        </div>



        <p className="text-center text-sm text-slate-500 mt-6">
          Don't have an account?{' '}
          <button onClick={() => onNav('register')} className="text-blue-400 hover:text-blue-300 font-medium">Create account</button>
        </p>
      </div>
    </AuthBg >
  );
}

// ── Register ──────────────────────────────────────────────────────────────────
export function RegisterScreen({ onAuth, onNav }: AuthProps) {
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '', confirm: '', role: 'user' as Role });
  const [loading, setLoading] = useState(false);

  const [error, setError] = useState('');

  const handleSubmit = () => {
    if (form.password !== form.confirm) { setError('Passwords do not match.'); return; }
    setLoading(true);
    setError('');
    authApi.register({
      name: form.name,
      email: form.email,
      phone: form.phone,
      role: form.role,
      password: form.password,
    })
      .then(res => {
        setLoading(false);
        sessionStorage.setItem('auth_email', form.email);
        onNav('otp');
      })
      .catch(err => {
        setLoading(false);
        setError(err.message || 'Registration failed.');
      });
  };

  const strength = form.password.length >= 12 ? 4 : form.password.length >= 8 ? 3 : form.password.length >= 6 ? 2 : form.password.length > 0 ? 1 : 0;
  const strengthLabels = ['', 'Weak', 'Fair', 'Strong', 'Very Strong'];
  const strengthColors = ['', 'bg-red-500', 'bg-amber-500', 'bg-blue-500', 'bg-emerald-500'];

  return (
    <AuthBg>
      <div className="animate-fade-in">
        <button onClick={() => onNav('login')} className="flex items-center gap-1.5 text-slate-400 hover:text-white text-xs mb-6 transition-colors">
          <ChevronLeft size={14} /> Back to login
        </button>

        <div className="mb-6">
          <h2 className="text-2xl font-bold text-white mb-1">Create your account</h2>
          <p className="text-slate-400 text-sm">Join 88,000+ verified identity holders</p>
        </div>

        {error && <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-xs">{error}</div>}

        {/* Steps */}
        <div className="flex gap-2 mb-6">
          {[1, 2].map(s => (
            <div key={s} className={`flex-1 h-1 rounded-full transition-all ${step >= s ? 'bg-blue-500' : 'bg-slate-800'}`} />
          ))}
        </div>

        {step === 1 ? (
          <div className="space-y-4">
            <DarkInput label="Full Name" placeholder="Enter your name" value={form.name} onChange={v => setForm(f => ({ ...f, name: v }))} icon={<User size={14} />} />
            <DarkInput label="Email Address" placeholder="Enter your email" type="email" value={form.email} onChange={v => setForm(f => ({ ...f, email: v }))} icon={<Mail size={14} />} />
            <DarkInput label="Phone Number" placeholder="Enter your mobile number" value={form.phone} onChange={v => setForm(f => ({ ...f, phone: v }))} icon={<Phone size={14} />} />

            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1.5">Account Role</label>
              <div className="grid grid-cols-3 gap-2">
                {(['user', 'admin', 'verifier'] as Role[]).map(r => (
                  <button
                    key={r}
                    onClick={() => setForm(f => ({ ...f, role: r }))}
                    className={`py-2 rounded-xl text-xs font-medium border capitalize transition-all ${form.role === r ? 'border-blue-500 bg-blue-500/10 text-blue-400' : 'border-slate-800 text-slate-500 hover:border-slate-700'}`}
                  >
                    {r}
                  </button>
                ))}
              </div>
            </div>

            <button onClick={() => setStep(2)} className="w-full py-3 rounded-xl text-sm font-semibold text-white flex items-center justify-center gap-2 mt-2"
              style={{ background: 'linear-gradient(135deg, #1D4ED8, #2563EB)', boxShadow: '0 4px 24px rgba(29,78,216,0.4)' }}>
              Continue <ArrowRight size={15} />
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            <div>
              <DarkInput label="Password" placeholder="Create a strong password" type="password" value={form.password} onChange={v => setForm(f => ({ ...f, password: v }))} icon={<Lock size={14} />} />
              {form.password && (
                <div className="mt-2">
                  <div className="flex gap-1 mb-1">
                    {[1, 2, 3, 4].map(i => <div key={i} className={`flex-1 h-1 rounded-full ${i <= strength ? strengthColors[strength] : 'bg-slate-800'}`} />)}
                  </div>
                  <p className="text-[10px] text-slate-500">{strengthLabels[strength]} password</p>
                </div>
              )}
            </div>
            <DarkInput label="Confirm Password" placeholder="Repeat your password" type="password" value={form.confirm} onChange={v => setForm(f => ({ ...f, confirm: v }))} icon={<Lock size={14} />} />

            <div className="p-3 rounded-xl space-y-2" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
              {['I agree to the Terms of Service', 'I agree to the Privacy Policy', 'Enable two-factor authentication'].map((t, i) => (
                <label key={i} className="flex items-center gap-2 text-xs text-slate-400 cursor-pointer">
                  <div className={`w-4 h-4 rounded border flex items-center justify-center ${i < 2 ? 'border-blue-500 bg-blue-500' : 'border-slate-700'}`}>
                    {i < 2 && <Check size={10} className="text-white" />}
                  </div>
                  {t}
                </label>
              ))}
            </div>

            <button onClick={handleSubmit} disabled={loading} className="w-full py-3 rounded-xl text-sm font-semibold text-white flex items-center justify-center gap-2"
              style={{ background: 'linear-gradient(135deg, #1D4ED8, #2563EB)', boxShadow: '0 4px 24px rgba(29,78,216,0.4)' }}>
              {loading ? <Spinner size="sm" /> : <><span>Create Account</span><ArrowRight size={15} /></>}
            </button>
          </div>
        )}

        <p className="text-center text-sm text-slate-500 mt-4">
          Already have an account?{' '}
          <button onClick={() => onNav('login')} className="text-blue-400 hover:text-blue-300 font-medium">Sign in</button>
        </p>
      </div>
    </AuthBg>
  );
}

// ── Forgot Password ───────────────────────────────────────────────────────────
export function ForgotPasswordScreen({ onAuth, onNav }: AuthProps) {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');

  const handleSend = () => {
    if (!email) { setError('Email is required.'); return; }
    setLoading(true);
    setError('');
    authApi.forgotPassword(email)
      .then(res => {
        setLoading(false);
        setSent(true);
      })
      .catch(err => {
        setLoading(false);
        setError(err.message || 'Reset request failed.');
      });
  };

  const handleReset = () => {
    if (!otp || !newPassword) { setError('OTP and new password are required.'); return; }
    setLoading(true);
    setError('');
    authApi.resetPassword(email, otp, newPassword)
      .then(res => {
        setLoading(false);
        alert(res.message);
        onNav('login');
      })
      .catch(err => {
        setLoading(false);
        setError(err.message || 'Failed to reset password.');
      });
  };

  return (
    <AuthBg>
      <div className="animate-fade-in">
        <button onClick={() => onNav('login')} className="flex items-center gap-1.5 text-slate-400 hover:text-white text-xs mb-6 transition-colors">
          <ChevronLeft size={14} /> Back to login
        </button>

        {!sent ? (
          <>
            <div className="mb-8">
              <div className="w-14 h-14 bg-blue-500/10 border border-blue-500/20 rounded-2xl flex items-center justify-center mb-5">
                <Mail size={24} className="text-blue-400" />
              </div>
              <h2 className="text-2xl font-bold text-white mb-1">Reset your password</h2>
              <p className="text-slate-400 text-sm">Enter the email address linked to your account and we'll send you an OTP.</p>
            </div>
            {error && <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-xs">{error}</div>}
            <div className="space-y-4">
              <DarkInput label="Email address" placeholder="Enter your email" type="email" value={email} onChange={setEmail} icon={<Mail size={14} />} />
              <button onClick={handleSend} disabled={loading} className="w-full py-3 rounded-xl text-sm font-semibold text-white flex items-center justify-center gap-2"
                style={{ background: 'linear-gradient(135deg, #1D4ED8, #2563EB)', boxShadow: '0 4px 24px rgba(29,78,216,0.4)' }}>
                {loading ? <Spinner size="sm" /> : 'Send Reset OTP'}
              </button>
            </div>
          </>
        ) : (
          <>
            <div className="mb-4 text-center">
              <div className="w-14 h-14 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl flex items-center justify-center mx-auto mb-5">
                <Check size={24} className="text-emerald-400" />
              </div>
              <h2 className="text-2xl font-bold text-white mb-1">Check your email</h2>
              <p className="text-slate-400 text-sm text-center">We've sent a 6-digit OTP to <strong>{email}</strong></p>
            </div>
            {error && <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-xs">{error}</div>}
            <div className="space-y-4">
              <DarkInput label="OTP Code" placeholder="Enter 6-digit code" type="text" value={otp} onChange={setOtp} />
              <DarkInput label="New Password" placeholder="Min 6 characters" type="password" value={newPassword} onChange={setNewPassword} />

              <button onClick={handleReset} disabled={loading} className="w-full py-3 rounded-xl text-sm font-semibold text-white flex items-center justify-center gap-2"
                style={{ background: 'linear-gradient(135deg, #10B981, #059669)', boxShadow: '0 4px 24px rgba(16,185,129,0.3)' }}>
                {loading ? <Spinner size="sm" /> : 'Update Password'}
              </button>
            </div>
          </>
        )}
      </div>
    </AuthBg>
  );
}

// ── OTP Verification ──────────────────────────────────────────────────────────
export function OTPScreen({ onAuth }: { onAuth: (role: Role) => void }) {
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const refs = useRef<(HTMLInputElement | null)[]>([]);

  const handleChange = (i: number, v: string) => {
    if (!/^\d*$/.test(v)) return;
    const next = [...otp];
    next[i] = v.slice(-1);
    setOtp(next);
    if (v && i < 5) refs.current[i + 1]?.focus();
  };

  const handleVerify = () => {
    const code = otp.join('');
    if (code.length < 6) { setError('Please enter the complete 6-digit code.'); return; }
    setLoading(true);
    setError('');
    const email = sessionStorage.getItem('auth_email') || '';
    authApi.verifyOtp(email, code)
      .then(res => {
        setLoading(false);
        if (res.token && res.user) {
          setAuthToken(res.token);
          setSavedUser(res.user);
          onAuth(res.user.role);
        } else {
          setError('Invalid authentication response.');
        }
      })
      .catch(err => {
        setLoading(false);
        setError(err.message || 'MFA code verification failed.');
      });
  };

  return (
    <AuthBg>
      <div className="animate-fade-in">
        <div className="mb-8">
          <div className="w-14 h-14 bg-blue-500/10 border border-blue-500/20 rounded-2xl flex items-center justify-center mb-5">
            <Shield size={24} className="text-blue-400" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-1">Two-Factor Authentication</h2>
          <p className="text-slate-400 text-sm">Enter the 6-digit code sent to your registered device.</p>
        </div>

        {error && <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-xs">{error}</div>}

        <div className="flex gap-3 mb-6 justify-center">
          {otp.map((d, i) => (
            <input
              key={i}
              ref={el => { refs.current[i] = el; }}
              type="text"
              maxLength={1}
              value={d}
              onChange={e => handleChange(i, e.target.value)}
              onKeyDown={e => { if (e.key === 'Backspace' && !otp[i] && i > 0) refs.current[i - 1]?.focus(); }}
              className="w-12 h-12 text-center text-xl font-bold text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
              style={{ background: 'rgba(255,255,255,0.05)', border: `1px solid ${d ? 'rgba(59,130,246,0.6)' : 'rgba(255,255,255,0.08)'}` }}
            />
          ))}
        </div>

        <button onClick={handleVerify} disabled={loading} className="w-full py-3 rounded-xl text-sm font-semibold text-white flex items-center justify-center gap-2 mb-4"
          style={{ background: 'linear-gradient(135deg, #1D4ED8, #2563EB)', boxShadow: '0 4px 24px rgba(29,78,216,0.4)' }}>
          {loading ? <Spinner size="sm" /> : <><span>Verify & Continue</span><ArrowRight size={15} /></>}
        </button>

        <div className="text-center">
          <p className="text-xs text-slate-500">Didn't receive the code? <button className="text-blue-400">Resend (0:45)</button></p>
          <p className="text-xs text-slate-600 mt-2">Also check your authenticator app</p>
        </div>
      </div>
    </AuthBg>
  );
}

// ── Utility ───────────────────────────────────────────────────────────────────
function DarkInput({ label, placeholder, type = 'text', value, onChange, icon }: {
  label: string; placeholder?: string; type?: string; value: string; onChange: (v: string) => void; icon?: React.ReactNode;
}) {
  return (
    <div>
      <label className="block text-xs font-medium text-slate-400 mb-1.5">{label}</label>
      <div className="relative">
        {icon && <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500">{icon}</div>}
        <input
          type={type}
          value={value}
          onChange={e => onChange(e.target.value)}
          placeholder={placeholder}
          className="w-full py-3 rounded-xl text-sm text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
          style={{ paddingLeft: icon ? '36px' : '16px', paddingRight: '16px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}
        />
      </div>
    </div>
  );
}
