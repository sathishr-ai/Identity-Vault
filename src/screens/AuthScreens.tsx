import React, { useState, useRef, useEffect } from 'react';
import { Shield, Eye, EyeOff, ArrowRight, Mail, Lock, User, Phone, Check, ChevronLeft, Fingerprint, Zap } from 'lucide-react';
import { Button, Spinner } from '../components/UIComponents';
import { useDialog } from '../context/DialogContext';
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
    <div className="min-h-screen flex relative overflow-hidden" style={{ backgroundColor: '#030712' }}>

      {/* Cinematic Ambient Background (Shared with Splash) */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] w-[600px] h-[600px] bg-blue-600/10 rounded-full blur-[120px] animate-pulse" style={{ animationDuration: '6s' }} />
        <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-cyan-600/10 rounded-full blur-[100px] animate-pulse" style={{ animationDuration: '8s', animationDelay: '2s' }} />

        {/* Slanted "Blade" Divider matching user reference */}
        <div className="hidden lg:block absolute top-[-25%] bottom-[-25%] left-1/2 w-[1px] bg-gradient-to-b from-transparent via-cyan-500/40 to-transparent shadow-[0_0_20px_rgba(6,182,212,0.4)] transform -rotate-12 pointer-events-none z-10" />

        <div className="absolute inset-0 opacity-[0.02]" style={{
          backgroundImage: 'radial-gradient(circle, #ffffff 1px, transparent 1px)',
          backgroundSize: '24px 24px'
        }} />
      </div>

      {/* Left panel (Branding) */}
      <div className="hidden lg:flex lg:w-1/2 flex-col justify-center p-12 lg:pl-20 relative z-10">

        <div className="relative z-10 flex-1 flex flex-col justify-center">
          <div className="flex items-center gap-4 mb-12">
            <div className="w-16 h-16 rounded-2xl overflow-hidden shadow-2xl shadow-cyan-500/20 drop-shadow-xl border border-white/10 shrink-0">
              <img src="/app-logo.png" alt="Identity Vault Box" className="w-full h-full object-cover" />
            </div>
            <div>
              <p className="text-white font-extrabold text-2xl leading-none tracking-wide">Identity Vault</p>
              <p className="text-slate-400 text-sm mt-1.5 font-medium">Secure Identity</p>
            </div>
          </div>

          <h1 className="text-3xl md:text-4xl font-black text-white leading-tight mb-4 tracking-tight">
            Verify Once,{' '}
            <span style={{ background: 'linear-gradient(135deg, #38BDF8 0%, #818CF8 50%, #C084FC 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              Trust Forever
            </span>
          </h1>
          <p className="text-slate-400 text-lg font-medium leading-relaxed max-w-lg mb-10">
            Your digital footprint is secured against an unbreakable ledger, giving you total peace of mind.
          </p>

          {/* Feature pills */}
          <div className="relative z-10 space-y-3">
            {[
              { icon: <Shield size={14} />, text: 'Unbreakable Encryption' },
              { icon: <Zap size={14} />, text: 'Instant Verification' },
              { icon: <Fingerprint size={14} />, text: '100% Privacy Guaranteed' },
            ].map((f, i) => (
              <div key={i} className="flex items-center gap-3 py-2">
                <div className="flex items-center justify-center text-cyan-400">{f.icon}</div>
                <span className="text-sm font-medium text-slate-300 tracking-wide">{f.text}</span>
                <Check size={16} className="text-emerald-400 ml-2 drop-shadow-md" strokeWidth={3} />
              </div>
            ))}
          </div>
        </div>

        <p className="relative z-10 text-xs text-slate-600 font-medium mt-auto pt-8">© 2026 Identity Vault Inc. · End-to-end Encrypted</p>
      </div>

      {/* Right panel (Forms) */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 relative z-10">
        {/* Form specific ambient glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] bg-cyan-500/10 rounded-full blur-[100px] rounded-full pointer-events-none" />

        <div className="w-full max-w-md relative z-10">
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
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden" style={{ backgroundColor: '#030712' }}>

      {/* Cinematic Ambient Background */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-[20%] left-[20%] w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-[120px] animate-pulse" style={{ animationDuration: '4s' }} />
        <div className="absolute bottom-[20%] right-[20%] w-[400px] h-[400px] bg-cyan-600/10 rounded-full blur-[100px] animate-pulse" style={{ animationDuration: '6s', animationDelay: '1s' }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[300px] bg-indigo-500/5 rounded-full blur-[100px] -rotate-45" />
        <div className="absolute inset-0 opacity-[0.03]" style={{
          backgroundImage: 'radial-gradient(circle, #ffffff 1px, transparent 1px)',
          backgroundSize: '24px 24px'
        }} />
      </div>

      <div className={`relative z-10 text-center transition-all duration-1000 flex flex-col items-center ${loaded ? 'opacity-100 translate-y-0 filter-none' : 'opacity-0 translate-y-12 blur-sm'}`}>

        {/* Premium Glassmorphic Logo */}
        <div className="flex justify-center mb-8 relative group mt-4">
          {/* Ambient Glow */}
          <div className="absolute inset-0 bg-blue-500/30 blur-2xl rounded-full transition-opacity duration-500 group-hover:opacity-100 opacity-60" />

          <div className="relative w-24 h-24 rounded-[2rem] overflow-hidden flex items-center justify-center shadow-[0_12px_44px_rgba(0,0,0,0.6)] border border-white/10">
            <img src="/app-logo.png" alt="Identity Vault Box" className="w-full h-full object-cover" />
          </div>
        </div>

        {/* Cinematic Typography */}
        <h1 className="text-4xl md:text-5xl font-black mb-3 tracking-tight flex gap-2.5 justify-center">
          <span className="text-white drop-shadow-lg">Identity</span>
          <span style={{
            background: 'linear-gradient(135deg, #38BDF8 0%, #818CF8 50%, #C084FC 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            filter: 'drop-shadow(0 4px 12px rgba(56,189,248,0.2))'
          }}>Vault</span>
        </h1>
        <p className="text-slate-400 text-lg md:text-xl font-medium tracking-wide mb-8">
          Secure & Verified Digital Identity
        </p>

        {/* Security Pills */}
        <div className="flex items-center justify-center gap-3 mb-14 flex-wrap max-w-2xl mx-auto">
          {['Bank-Grade', 'Privacy-First', 'E2E Encrypted', 'Immutable'].map(b => (
            <div key={b} className="flex items-center gap-2 text-xs text-slate-300 font-medium px-3.5 py-1.5 rounded-full backdrop-blur-md bg-white/[0.04] border border-white/[0.08] shadow-sm">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)] animate-pulse" />
              {b}
            </div>
          ))}
        </div>

        {/* Biometric Node Pulse Animation */}
        <div className="flex items-center justify-center mb-14 relative w-64 h-8 mx-auto">
          {/* Laser Track */}
          <div className="absolute top-1/2 -translate-y-1/2 left-0 right-0 h-[1px] bg-slate-800" />

          {/* Animated Laser Pulse */}
          <div className="absolute top-1/2 -translate-y-1/2 left-0 h-[2px] w-24 bg-gradient-to-r from-transparent via-blue-400 to-transparent opacity-70 animate-[pulse_3s_linear_infinite]"
            style={{ marginLeft: '-20%', animation: 'slideRight 2s infinite' }} />

          {/* Nodes */}
          <style>{`@keyframes slideRight { 0% { transform: translateX(0); opacity: 0; } 20% { opacity: 1; } 80% { opacity: 1; } 100% { transform: translateX(350px); opacity: 0; } }`}</style>

          <div className="flex justify-between w-full relative z-10">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="w-6 h-6 rounded-full flex items-center justify-center backdrop-blur-md bg-[#030712] border border-blue-500/20 shadow-[0_0_15px_rgba(59,130,246,0.15)] transition-all">
                <div className="w-1.5 h-1.5 bg-blue-400 rounded-full shadow-[0_0_8px_rgba(96,165,250,0.8)]" />
              </div>
            ))}
          </div>
        </div>

        {/* Premium Action Area */}
        <div className="flex flex-col gap-3 items-center w-full max-w-[260px]">
          <button
            onClick={() => onNav('login')}
            className="group relative w-full h-12 rounded-xl font-bold text-white text-base transition-all duration-300 hover:scale-[1.02] active:scale-95 flex items-center justify-center gap-2 overflow-hidden"
            style={{
              background: 'linear-gradient(135deg, #1D4ED8 0%, #06B6D4 100%)',
              boxShadow: '0 6px 24px rgba(29, 78, 216, 0.25), inset 0 1px 1px rgba(255,255,255,0.2)'
            }}
          >
            <div className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity" />
            <span className="relative z-10 tracking-wide">Enter the Vault</span>
            <ArrowRight size={16} className="relative z-10 group-hover:translate-x-1 transition-transform" />
          </button>

          <p className="text-[11px] text-slate-500 flex items-center gap-1.5 font-medium">
            <Lock size={10} className="text-slate-600" /> End-to-end encrypted
          </p>
        </div>
      </div>
    </div>
  );
}

// ── Login ─────────────────────────────────────────────────────────────────────
export function LoginScreen({ onAuth, onNav }: AuthProps) {
  const { showToast, showConfirm } = useDialog();
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
          showToast('Logged in successfully', 'success');
          onAuth(res.user.role as Role);
        } else {
          setError('Login failed. Please check your credentials.');
        }
      })
      .catch(async err => {
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
          <h2 className="text-3xl font-bold text-white mb-2 tracking-tight">Welcome back</h2>
          <div className="w-12 h-1 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full mb-4"></div>
          <p className="text-slate-400 text-sm">Sign in to your identity dashboard</p>
        </div>

        <div className="space-y-4">
          {error && <div className="flex items-center gap-2 p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-xs">{error}</div>}

          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1.5">Email / Mobile Number</label>
            <div className="relative group isolate transform-gpu">
              <User size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-cyan-400 transition-colors" />
              <input
                type="text"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="Enter your email or mobile number"
                className="w-full pl-10 pr-4 py-3.5 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 backdrop-blur-md transition-all"
                style={{ backgroundColor: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)' }}
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-medium text-slate-400 block mb-1.5 flex justify-between items-center">
              <span>Password</span>
            </label>
            <div className="relative mb-2 group isolate transform-gpu">
              <Lock size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-cyan-400 transition-colors" />
              <input
                type={showPw ? 'text' : 'password'}
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="Enter your password"
                className="w-full pl-10 pr-10 py-3.5 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 backdrop-blur-md transition-all"
                style={{ backgroundColor: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)' }}
              />
              <button onClick={() => setShowPw(!showPw)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white transition-colors">
                {showPw ? <EyeOff size={14} /> : <Eye size={14} />}
              </button>
            </div>
            <div className="flex justify-end mt-2">
              <button onClick={() => onNav('forgot-password')} className="text-[11px] text-cyan-400 hover:text-cyan-300 font-medium tracking-wide">Forgot password?</button>
            </div>
          </div>

          <button
            onClick={handleLogin}
            disabled={loading}
            className="group relative isolate transform-gpu w-full h-12 rounded-xl font-bold text-white text-sm transition-all duration-300 hover:scale-[1.02] active:scale-95 flex items-center justify-center gap-2 overflow-hidden mt-2 disabled:opacity-50 disabled:hover:scale-100"
            style={{
              background: 'linear-gradient(135deg, #1D4ED8 0%, #06B6D4 100%)',
              boxShadow: '0 6px 24px rgba(29, 78, 216, 0.25), inset 0 1px 1px rgba(255,255,255,0.2)'
            }}
          >
            <div className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity" />
            <span className="relative z-10 tracking-wide">{loading ? 'Verifying Credentials...' : 'Login'}</span>
            {!loading && <ArrowRight size={16} className="relative z-10 group-hover:translate-x-1 transition-transform" />}
          </button>

          <div className="flex items-center gap-3 my-6">
            <div className="h-px bg-white/10 flex-1"></div>
            <span className="text-xs text-slate-500 font-medium uppercase tracking-wider">or continue with</span>
            <div className="h-px bg-white/10 flex-1"></div>
          </div>

          <button
            onClick={() => window.location.href = 'http://localhost:8080/oauth2/authorization/google'}
            className="group relative isolate transform-gpu w-full h-12 rounded-xl text-sm font-medium text-white transition-all duration-300 hover:scale-[1.02] active:scale-95 flex items-center justify-center gap-3 border border-white/10 hover:bg-white/[0.05]"
            style={{ backgroundColor: 'rgba(255,255,255,0.03)' }}
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
            </svg>
            Google
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
  const { showAlert, showConfirm } = useDialog();
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '', confirm: '', role: 'user' as Role });
  const [loading, setLoading] = useState(false);

  const [error, setError] = useState('');

  const handleContinue = async () => {
    if (!form.name.trim() || !form.email.trim() || !form.phone.trim()) {
      setError('Please fill out all fields to continue.');
      return;
    }
    setError('');
    setLoading(true);
    try {
      await authApi.check(form.email, form.phone);
      setLoading(false);
      setStep(2);
    } catch (err: any) {
      setLoading(false);
      setError(err.message || 'Validation failed.');
    }
  };

  const handleSubmit = () => {
    if (!form.password.trim() || !form.confirm.trim()) { setError('Please enter your new password.'); return; }
    if (form.password.length < 6) { setError('Password must be at least 6 characters long.'); return; }
    if (form.password !== form.confirm) { setError('Passwords do not match.'); return; }
    setLoading(true);
    setError('');
    authApi.register({
      name: form.name,
      email: form.email,
      phone: form.phone,
      role: 'user',
      password: form.password,
    })
      .then(res => {
        setLoading(false);
        sessionStorage.setItem('auth_email', form.email);
        onNav('otp');
      })
      .catch(async err => {
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
        <button
          onClick={() => step === 1 ? onNav('login') : setStep(1)}
          className="group flex items-center gap-1.5 text-slate-400 hover:text-white text-xs mb-6 transition-colors font-medium"
        >
          <ChevronLeft size={14} className="group-hover:-translate-x-1 transition-transform" />
          {step === 1 ? 'Back to login' : 'Back to details'}
        </button>

        <h2 className="text-3xl font-bold text-white mb-2 tracking-tight">Create your account</h2>
        <div className="w-12 h-1 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full mb-6"></div>


        {error && <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-xs">{error}</div>}

        {/* Steps */}
        <div className="flex gap-3 mb-8">
          {[1, 2].map(s => (
            <div key={s} className={`flex-1 h-1.5 rounded-full transition-all duration-500 ${step >= s ? 'bg-blue-500 shadow-[0_0_12px_rgba(59,130,246,0.6)]' : 'bg-white/10'}`} />
          ))}
        </div>

        {step === 1 ? (
          <div className="space-y-5 animate-fade-in">
            <DarkInput label="Full Name" placeholder="Enter your name" value={form.name} onChange={v => setForm(f => ({ ...f, name: v }))} icon={<User size={14} />} />
            <DarkInput label="Email Address" placeholder="Enter your email" type="email" value={form.email} onChange={v => setForm(f => ({ ...f, email: v }))} icon={<Mail size={14} />} />
            <DarkInput label="Phone Number" placeholder="Enter your mobile number" value={form.phone} onChange={v => setForm(f => ({ ...f, phone: v }))} icon={<Phone size={14} />} prefix="+91" />

            <div className="pt-2">
              <button
                onClick={handleContinue}
                className="group relative isolate transform-gpu w-full h-12 rounded-xl font-bold text-white text-sm transition-all duration-300 hover:scale-[1.02] active:scale-95 flex items-center justify-center gap-2 overflow-hidden"
                style={{
                  background: 'linear-gradient(135deg, #1D4ED8 0%, #06B6D4 100%)',
                  boxShadow: '0 6px 24px rgba(29, 78, 216, 0.25), inset 0 1px 1px rgba(255,255,255,0.2)'
                }}
              >
                <div className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity" />
                <span className="relative z-10 tracking-wide">Continue</span>
                <ArrowRight size={16} className="relative z-10 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>

            <div className="flex items-center gap-3 mt-4 mb-2">
              <div className="h-px bg-white/10 flex-1"></div>
              <span className="text-xs text-slate-500 font-medium uppercase tracking-wider">or sign up with</span>
              <div className="h-px bg-white/10 flex-1"></div>
            </div>

            <button
              onClick={() => window.location.href = 'http://localhost:8080/oauth2/authorization/google'}
              className="group relative isolate transform-gpu w-full h-12 rounded-xl text-sm font-medium text-white transition-all duration-300 hover:scale-[1.02] active:scale-95 flex items-center justify-center gap-3 border border-white/10 hover:bg-white/[0.05]"
              style={{ backgroundColor: 'rgba(255,255,255,0.03)' }}
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
              </svg>
              Google
            </button>
          </div>
        ) : (
          <div className="space-y-5 animate-fade-in">
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

            <div className="pt-2">
              <button
                onClick={handleSubmit}
                disabled={loading}
                className="group relative isolate transform-gpu w-full h-12 rounded-xl font-bold text-white text-sm transition-all duration-300 hover:scale-[1.02] active:scale-95 flex items-center justify-center gap-2 overflow-hidden disabled:opacity-50 disabled:hover:scale-100"
                style={{
                  background: 'linear-gradient(135deg, #1D4ED8 0%, #06B6D4 100%)',
                  boxShadow: '0 6px 24px rgba(29, 78, 216, 0.25), inset 0 1px 1px rgba(255,255,255,0.2)'
                }}
              >
                <div className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity" />
                <span className="relative z-10 tracking-wide">{loading ? 'Creating...' : 'Create Account'}</span>
                {!loading && <ArrowRight size={16} className="relative z-10 group-hover:translate-x-1 transition-transform" />}
              </button>
            </div>
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
  const { showToast } = useDialog();
  const [email, setEmail] = useState('');
  const [step, setStep] = useState<'email' | 'otp' | 'password'>('email');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [timer, setTimer] = useState(45);

  const [otpArray, setOtpArray] = useState(['', '', '', '', '', '']);
  const [otpStatus, setOtpStatus] = useState<'input' | 'verifying' | 'success' | 'error'>('input');
  const refs = useRef<(HTMLInputElement | null)[]>([]);

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  useEffect(() => {
    let interval: any;
    if (step === 'otp' && timer > 0) {
      interval = setInterval(() => setTimer(t => t - 1), 1000);
    }
    return () => clearInterval(interval);
  }, [step, timer]);

  const handleSend = () => {
    if (!email) { setError('Email is required.'); return; }
    setLoading(true);
    setError('');
    authApi.forgotPassword(email)
      .then(() => {
        setLoading(false);
        setStep('otp');
        setTimer(45);
      })
      .catch(err => {
        setLoading(false);
        setError(err.message || 'Reset request failed.');
      });
  };

  const handleOtpChange = (i: number, v: string) => {
    if (!/^\d*$/.test(v)) return;
    const next = [...otpArray];
    next[i] = v.slice(-1);
    setOtpArray(next);

    // Auto focus next input
    if (v && i < 5) refs.current[i + 1]?.focus();

    // Auto verify if complete
    if (next.every(d => d !== '') && next.length === 6) {
      handleVerifyOtp(next.join(''));
    }
  };

  const handleVerifyOtp = (code: string) => {
    setOtpStatus('verifying');
    setError('');

    // Introduce a minimum 2-second animation delay so the spinning effect is securely visible
    setTimeout(() => {
      authApi.verifyResetOtp(email, code)
        .then(() => {
          setOtpStatus('success');
          // Wait 2 seconds showing success animation before moving to password screen
          setTimeout(() => {
            setStep('password');
          }, 2000);
        })
        .catch(err => {
          setOtpStatus('error');
          setError(err.message || 'Incorrect OTP code.');
        });
    }, 2000);
  };

  const handleReset = () => {
    if (!newPassword || newPassword !== confirmPassword) { setError('Passwords do not match or are blank.'); return; }
    setLoading(true);
    setError('');
    const code = otpArray.join('');
    authApi.resetPassword(email, code, newPassword)
      .then(res => {
        setLoading(false);
        showToast(res.message || 'Password reset successfully', 'success');
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

        {step === 'email' ? (
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
        ) : step === 'otp' ? (
          <>
            <div className="mb-6 text-center">
              <h2 className="text-2xl font-bold text-white mb-2">
                {otpStatus === 'success' ? 'Verified successfully' : "Let's verify your number"}
              </h2>
              <p className="text-slate-400 text-sm text-center">
                {otpStatus === 'success' ? 'Your phone number has been verified.' : (
                  <>We've sent a 6-digit code to your email.<br />It'll auto-verify once entered.</>
                )}
              </p>
            </div>

            {error && otpStatus === 'error' && (
              <div className="mb-4 text-center font-medium p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-500 text-sm animate-pulse">
                Incorrect OTP entered.
              </div>
            )}

            {(otpStatus === 'input' || otpStatus === 'error') && (
              <div className="flex gap-2 mb-8 mt-6 justify-center">
                {otpArray.map((d, i) => (
                  <input
                    key={i}
                    ref={el => { refs.current[i] = el; }}
                    type="text"
                    maxLength={1}
                    value={d}
                    onChange={e => handleOtpChange(i, e.target.value)}
                    onKeyDown={e => { if (e.key === 'Backspace' && !otpArray[i] && i > 0) refs.current[i - 1]?.focus(); }}
                    className={`w-12 h-14 text-center text-xl font-bold text-white rounded-xl outline-none transition-all duration-300 ${d ? 'border-[#D946EF] shadow-[0_0_15px_rgba(217,70,239,0.25)] scale-[1.03]' : 'focus:scale-[1.03] focus:border-[#D946EF] focus:shadow-[0_0_20px_rgba(217,70,239,0.4)]'
                      }`}
                    style={{
                      background: 'linear-gradient(145deg, #1A1A1C, #131315)',
                      borderTop: otpStatus === 'error' ? '2px solid #ef4444' : d ? '2px solid #D946EF' : '1px solid rgba(255,255,255,0.08)',
                      borderLeft: otpStatus === 'error' ? '2px solid #ef4444' : d ? '2px solid #D946EF' : '1px solid rgba(255,255,255,0.08)',
                      borderBottom: otpStatus === 'error' ? '2px solid #ef4444' : d ? '1px solid rgba(217,70,239,0.5)' : '1px solid transparent',
                      borderRight: otpStatus === 'error' ? '2px solid #ef4444' : d ? '1px solid rgba(217,70,239,0.5)' : '1px solid transparent',
                      boxShadow: !d && otpStatus !== 'error' ? '0 10px 25px rgba(0,0,0,0.5)' : undefined
                    }}
                  />
                ))}
              </div>
            )}

            {otpStatus === 'verifying' && (
              <div className="flex flex-col items-center justify-center my-10 h-32 relative">
                {/* 6 spinning blocks animation: 3x2 grid */}
                <div className="w-32 h-24 relative animate-spin duration-3000 opacity-90 transition-all scale-110">
                  {/* Top Row */}
                  <div className="absolute top-0 left-0 w-10 h-10 rounded-xl shadow-[0_0_15px_rgba(217,70,239,0.3)] flex items-center justify-center text-xl font-bold text-white"
                    style={{ background: '#161618', borderTop: '2px solid #D946EF', borderLeft: '2px solid #D946EF' }}>{otpArray[0]}</div>
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 w-10 h-10 rounded-xl shadow-[0_0_15px_rgba(217,70,239,0.3)] flex items-center justify-center text-xl font-bold text-white"
                    style={{ background: '#161618', borderTop: '2px solid #D946EF', borderLeft: '2px solid #D946EF' }}>{otpArray[1]}</div>
                  <div className="absolute top-0 right-0 w-10 h-10 rounded-xl shadow-[0_0_15px_rgba(217,70,239,0.3)] flex items-center justify-center text-xl font-bold text-white"
                    style={{ background: '#161618', borderTop: '2px solid #D946EF', borderLeft: '2px solid #D946EF' }}>{otpArray[2]}</div>

                  {/* Bottom Row */}
                  <div className="absolute bottom-0 left-0 w-10 h-10 rounded-xl shadow-[0_0_15px_rgba(217,70,239,0.3)] flex items-center justify-center text-xl font-bold text-white"
                    style={{ background: '#161618', borderTop: '2px solid #D946EF', borderLeft: '2px solid #D946EF' }}>{otpArray[3]}</div>
                  <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-10 h-10 rounded-xl shadow-[0_0_15px_rgba(217,70,239,0.3)] flex items-center justify-center text-xl font-bold text-white"
                    style={{ background: '#161618', borderTop: '2px solid #D946EF', borderLeft: '2px solid #D946EF' }}>{otpArray[4]}</div>
                  <div className="absolute bottom-0 right-0 w-10 h-10 rounded-xl shadow-[0_0_15px_rgba(217,70,239,0.3)] flex items-center justify-center text-xl font-bold text-white"
                    style={{ background: '#161618', borderTop: '2px solid #D946EF', borderLeft: '2px solid #D946EF' }}>{otpArray[5]}</div>
                </div>
              </div>
            )}

            {otpStatus === 'success' && (
              <div className="flex flex-col items-center justify-center my-10 relative animate-fade-in">
                <div className="w-16 h-16 bg-[#161618] rounded-2xl border-2 border-emerald-500 shadow-[0_0_20px_rgba(16,185,129,0.3)] flex items-center justify-center mb-6">
                  <Check className="text-white" size={32} />
                </div>
                <div className="text-center text-emerald-500 text-sm font-medium flex items-center gap-1.5">
                  Verified & Secured <Lock size={12} className="text-[#D946EF]" />
                </div>
              </div>
            )}

            {otpStatus !== 'verifying' && otpStatus !== 'success' && (
              <div className="text-center mt-3 pt-1">
                <p className="text-xs text-slate-500">
                  Didn't receive the code?{' '}
                  <button
                    onClick={() => {
                      if (timer > 0) return;
                      handleSend();
                      setOtpArray(['', '', '', '', '', '']);
                      setOtpStatus('input');
                      showToast('Requesting new OTP...', 'info');
                    }}
                    disabled={timer > 0 || loading}
                    className={`font-medium ${timer > 0 ? 'text-slate-600 cursor-not-allowed' : 'text-blue-400 hover:text-blue-300'}`}
                  >
                    Resend {timer > 0 ? `(0:${timer.toString().padStart(2, '0')})` : ''}
                  </button>
                </p>
              </div>
            )}
          </>
        ) : (
          <>
            <div className="mb-8">
              <div className="w-14 h-14 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl flex items-center justify-center mb-5">
                <Lock size={24} className="text-emerald-400" />
              </div>
              <h2 className="text-2xl font-bold text-white mb-1">Create new password</h2>
              <p className="text-slate-400 text-sm">Please enter a highly secure new password below.</p>
            </div>
            {error && <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-xs">{error}</div>}

            <div className="space-y-4">
              <div>
                <DarkInput label="New Password" placeholder="Min 6 characters" type="password" value={newPassword} onChange={setNewPassword} icon={<Lock size={14} />} />
                {newPassword && (() => {
                  const str = newPassword.length >= 12 ? 4 : newPassword.length >= 8 ? 3 : newPassword.length >= 6 ? 2 : newPassword.length > 0 ? 1 : 0;
                  const labels = ['', 'Weak', 'Fair', 'Strong', 'Very Strong'];
                  const colors = ['', 'bg-red-500', 'bg-amber-500', 'bg-blue-500', 'bg-emerald-500'];
                  return (
                    <div className="mt-2">
                      <div className="flex gap-1 mb-1">
                        {[1, 2, 3, 4].map(i => <div key={i} className={`flex-1 h-1 rounded-full border border-white/5 ${i <= str ? colors[str] : 'bg-slate-800'}`} />)}
                      </div>
                      <p className="text-[10px] text-slate-500">{labels[str]} password</p>
                    </div>
                  );
                })()}
              </div>
              <DarkInput label="Confirm Password" placeholder="Repeat your new password" type="password" value={confirmPassword} onChange={setConfirmPassword} icon={<Lock size={14} />} />

              <button onClick={handleReset} disabled={loading} className="w-full py-3 rounded-xl text-sm font-semibold text-white flex items-center justify-center gap-2 mt-2"
                style={{ background: 'linear-gradient(135deg, #10B981, #059669)', boxShadow: '0 4px 24px rgba(16,185,129,0.3)' }}>
                {loading ? <Spinner size="sm" /> : 'Set New Password'}
              </button>
            </div>
          </>
        )}
      </div>
    </AuthBg>
  );
}

// ── OTP Verification ──────────────────────────────────────────────────────────
export function OTPScreen({ onAuth, onNav }: AuthProps) {
  const { showToast } = useDialog();
  const [otpArray, setOtpArray] = useState(['', '', '', '', '', '']);
  const [otpStatus, setOtpStatus] = useState<'input' | 'verifying' | 'success' | 'error'>('input');
  const [error, setError] = useState('');
  const [timer, setTimer] = useState(45);
  const [loading, setLoading] = useState(false);
  const refs = useRef<(HTMLInputElement | null)[]>([]);
  const userEmail = sessionStorage.getItem('auth_email') || 'your registered email';

  useEffect(() => {
    let interval: any;
    if (timer > 0) {
      interval = setInterval(() => setTimer(t => t - 1), 1000);
    }
    return () => clearInterval(interval);
  }, [timer]);

  const handleResend = () => {
    if (timer > 0) return;
    setLoading(true);
    const email = sessionStorage.getItem('auth_email') || '';
    authApi.forgotPassword(email)
      .then(() => {
        setLoading(false);
        setTimer(45);
        showToast('OTP resent successfully', 'success');
      })
      .catch(err => {
        setLoading(false);
        setError(err.message || 'Failed to resend OTP.');
      });
  };

  const handleChange = (i: number, v: string) => {
    if (!/^\d*$/.test(v)) return;
    const next = [...otpArray];
    next[i] = v.slice(-1);
    setOtpArray(next);

    // Auto focus next input
    if (v && i < 5) refs.current[i + 1]?.focus();

    // Auto verify if complete
    if (next.every(d => d !== '') && next.length === 6) {
      handleVerify(next.join(''));
    }
  };

  const handleVerify = (code: string) => {
    setOtpStatus('verifying');
    setError('');

    // Introduce minimum 2-second animation delay
    setTimeout(() => {
      const email = sessionStorage.getItem('auth_email') || '';
      authApi.verifyOtp(email, code)
        .then(res => {
          if (res.token && res.user) {
            setOtpStatus('success');
            setTimeout(() => {
              setAuthToken(res.token);
              setSavedUser(res.user);
              showToast('Logged in successfully', 'success');
              onAuth(res.user.role as Role);
            }, 2000);
          } else {
            setOtpStatus('error');
            setError('Invalid authentication response.');
          }
        })
        .catch(err => {
          setOtpStatus('error');
          setError(err.message || 'MFA code verification failed.');
        });
    }, 2000);
  };

  return (
    <AuthBg>
      <div className="animate-fade-in w-full max-w-sm">
        <button
          onClick={() => onNav('login')}
          className="group flex items-center gap-1.5 text-slate-400 hover:text-white text-xs mb-6 transition-colors font-medium"
        >
          <ChevronLeft size={14} className="group-hover:-translate-x-1 transition-transform" />
          Back to login
        </button>

        <div className="mb-6 text-center">
          <h2 className="text-2xl font-bold text-white mb-2">
            {otpStatus === 'success' ? 'Verified successfully' : "Two-Factor Authentication"}
          </h2>
          <p className="text-slate-400 text-sm text-center">
            {otpStatus === 'success' ? 'Your identity has been verified.' : (
              <>Enter the 6-digit code sent to <span className="text-white font-medium">{userEmail}</span></>
            )}
          </p>
        </div>

        {error && otpStatus === 'error' && (
          <div className="mb-4 text-center font-medium p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-500 text-sm animate-pulse">
            Incorrect OTP entered.
          </div>
        )}

        {(otpStatus === 'input' || otpStatus === 'error') && (
          <div className="flex gap-2 mb-8 mt-6 justify-center">
            {otpArray.map((d, i) => (
              <input
                key={i}
                ref={el => { refs.current[i] = el; }}
                type="text"
                maxLength={1}
                value={d}
                onChange={e => handleChange(i, e.target.value)}
                onKeyDown={e => { if (e.key === 'Backspace' && !otpArray[i] && i > 0) refs.current[i - 1]?.focus(); }}
                className={`w-12 h-14 text-center text-xl font-bold text-white rounded-xl outline-none transition-all duration-300 ${d ? 'border-[#D946EF] shadow-[0_0_15px_rgba(217,70,239,0.25)] scale-[1.03]' : 'focus:scale-[1.03] focus:border-[#D946EF] focus:shadow-[0_0_20px_rgba(217,70,239,0.4)]'
                  }`}
                style={{
                  background: 'linear-gradient(145deg, #1A1A1C, #131315)',
                  borderTop: otpStatus === 'error' ? '2px solid #ef4444' : d ? '2px solid #D946EF' : '1px solid rgba(255,255,255,0.08)',
                  borderLeft: otpStatus === 'error' ? '2px solid #ef4444' : d ? '2px solid #D946EF' : '1px solid rgba(255,255,255,0.08)',
                  borderBottom: otpStatus === 'error' ? '2px solid #ef4444' : d ? '1px solid rgba(217,70,239,0.5)' : '1px solid transparent',
                  borderRight: otpStatus === 'error' ? '2px solid #ef4444' : d ? '1px solid rgba(217,70,239,0.5)' : '1px solid transparent',
                  boxShadow: !d && otpStatus !== 'error' ? '0 10px 25px rgba(0,0,0,0.5)' : undefined
                }}
              />
            ))}
          </div>
        )}

        {otpStatus === 'verifying' && (
          <div className="flex flex-col items-center justify-center my-10 h-32 relative">
            {/* 6 spinning blocks animation: 3x2 grid */}
            <div className="w-32 h-24 relative animate-spin duration-3000 opacity-90 transition-all scale-110">
              {/* Top Row */}
              <div className="absolute top-0 left-0 w-10 h-10 rounded-xl shadow-[0_0_15px_rgba(217,70,239,0.3)] flex items-center justify-center text-xl font-bold text-white"
                style={{ background: '#161618', borderTop: '2px solid #D946EF', borderLeft: '2px solid #D946EF' }}>{otpArray[0]}</div>
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-10 h-10 rounded-xl shadow-[0_0_15px_rgba(217,70,239,0.3)] flex items-center justify-center text-xl font-bold text-white"
                style={{ background: '#161618', borderTop: '2px solid #D946EF', borderLeft: '2px solid #D946EF' }}>{otpArray[1]}</div>
              <div className="absolute top-0 right-0 w-10 h-10 rounded-xl shadow-[0_0_15px_rgba(217,70,239,0.3)] flex items-center justify-center text-xl font-bold text-white"
                style={{ background: '#161618', borderTop: '2px solid #D946EF', borderLeft: '2px solid #D946EF' }}>{otpArray[2]}</div>

              {/* Bottom Row */}
              <div className="absolute bottom-0 left-0 w-10 h-10 rounded-xl shadow-[0_0_15px_rgba(217,70,239,0.3)] flex items-center justify-center text-xl font-bold text-white"
                style={{ background: '#161618', borderTop: '2px solid #D946EF', borderLeft: '2px solid #D946EF' }}>{otpArray[3]}</div>
              <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-10 h-10 rounded-xl shadow-[0_0_15px_rgba(217,70,239,0.3)] flex items-center justify-center text-xl font-bold text-white"
                style={{ background: '#161618', borderTop: '2px solid #D946EF', borderLeft: '2px solid #D946EF' }}>{otpArray[4]}</div>
              <div className="absolute bottom-0 right-0 w-10 h-10 rounded-xl shadow-[0_0_15px_rgba(217,70,239,0.3)] flex items-center justify-center text-xl font-bold text-white"
                style={{ background: '#161618', borderTop: '2px solid #D946EF', borderLeft: '2px solid #D946EF' }}>{otpArray[5]}</div>
            </div>
          </div>
        )}

        {otpStatus === 'success' && (
          <div className="flex flex-col items-center justify-center my-10 relative animate-fade-in">
            <div className="w-16 h-16 bg-[#161618] rounded-2xl border-2 border-emerald-500 shadow-[0_0_20px_rgba(16,185,129,0.3)] flex items-center justify-center mb-6">
              <Check className="text-white" size={32} />
            </div>
            <div className="text-center text-emerald-500 text-sm font-medium flex items-center gap-1.5">
              Verified & Secured <Lock size={12} className="text-[#D946EF]" />
            </div>
          </div>
        )}

        {otpStatus !== 'verifying' && otpStatus !== 'success' && (
          <div className="text-center mt-3 pt-1">
            <p className="text-xs text-slate-500">Didn't receive the code?
              <button
                onClick={() => {
                  if (timer > 0) return;
                  handleResend();
                  setOtpArray(['', '', '', '', '', '']);
                  setOtpStatus('input');
                  showToast('Requesting new OTP...', 'info');
                }}
                disabled={timer > 0 || loading}
                className={`ml-1 font-medium ${timer > 0 ? 'text-slate-600 cursor-not-allowed' : 'text-blue-400 hover:text-blue-300'}`}
              >
                Resend {timer > 0 ? `(0:${timer.toString().padStart(2, '0')})` : ''}
              </button>
            </p>

          </div>
        )}
      </div>
    </AuthBg>
  );
}

// ── Utility ───────────────────────────────────────────────────────────────────
function DarkInput({ label, placeholder, type = 'text', value, onChange, icon, prefix }: {
  label: string; placeholder?: string; type?: string; value: string; onChange: (v: string) => void; icon?: React.ReactNode; prefix?: string;
}) {
  const [show, setShow] = useState(false);
  const isPassword = type === 'password';

  return (
    <div>
      <label className="block text-xs font-medium text-slate-400 mb-1.5">{label}</label>
      <div className="relative group">
        {icon && (
          <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-cyan-400 transition-colors pointer-events-none">
            {icon}
          </div>
        )}
        {prefix && (
          <div className={`absolute ${icon ? 'left-[42px]' : 'left-3.5'} top-1/2 -translate-y-1/2 text-slate-400 text-sm pointer-events-none`}>
            {prefix}
          </div>
        )}
        <input
          type={isPassword && show ? 'text' : type}
          value={value}
          onChange={e => onChange(e.target.value)}
          placeholder={placeholder}
          className={`w-full ${prefix ? (icon ? 'pl-[70px]' : 'pl-14') : (icon ? 'pl-10' : 'pl-4')} ${isPassword ? 'pr-10' : 'pr-4'} py-3.5 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 backdrop-blur-md transition-all`}
          style={{ backgroundColor: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)' }}
        />
        {isPassword && (
          <button
            type="button"
            onClick={() => setShow(!show)}
            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-cyan-400 transition-colors cursor-pointer"
          >
            {show ? <EyeOff size={14} /> : <Eye size={14} />}
          </button>
        )}
      </div>
    </div>
  );
}
