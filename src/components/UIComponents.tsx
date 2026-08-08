import { type ReactNode } from 'react';
import { CheckCircle, AlertCircle, Info, AlertTriangle, X } from 'lucide-react';

// ── Badge ────────────────────────────────────────────────────────────────────
const statusConfig = {
  verified: { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200', dot: 'bg-emerald-500', label: 'Verified' },
  pending: { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200', dot: 'bg-amber-500', label: 'Pending' },
  rejected: { bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-200', dot: 'bg-red-500', label: 'Rejected' },
  active: { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200', dot: 'bg-emerald-500', label: 'Active' },
  inactive: { bg: 'bg-slate-100', text: 'text-slate-600', border: 'border-slate-200', dot: 'bg-slate-400', label: 'Inactive' },
  valid: { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200', dot: 'bg-emerald-500', label: 'Valid' },
  tampered: { bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-200', dot: 'bg-red-500', label: 'Tampered' },
  approved: { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200', dot: 'bg-emerald-500', label: 'Approved' },
  info: { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200', dot: 'bg-blue-500', label: 'Info' },
  warning: { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200', dot: 'bg-amber-500', label: 'Warning' },
  critical: { bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-200', dot: 'bg-red-500', label: 'Critical' },
  user: { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200', dot: 'bg-blue-500', label: 'User' },
  admin: { bg: 'bg-purple-50', text: 'text-purple-700', border: 'border-purple-200', dot: 'bg-purple-500', label: 'Admin' },
  verifier: { bg: 'bg-cyan-50', text: 'text-cyan-700', border: 'border-cyan-200', dot: 'bg-cyan-500', label: 'Verifier' },
};

export function StatusBadge({ status }: { status: string }) {
  const normStatus = (status || '').toLowerCase();
  const cfg = statusConfig[normStatus as keyof typeof statusConfig] || statusConfig.info;
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${cfg.bg} ${cfg.text} ${cfg.border}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot} ${status === 'active' || status === 'verified' ? 'animate-pulse' : ''}`} />
      {cfg.label}
    </span>
  );
}

// ── Avatar ───────────────────────────────────────────────────────────────────
const avatarColors = ['bg-blue-500', 'bg-violet-500', 'bg-emerald-500', 'bg-cyan-500', 'bg-rose-500', 'bg-amber-500', 'bg-indigo-500'];
export function Avatar({ initials, size = 'md', index = 0 }: { initials: string; size?: 'sm' | 'md' | 'lg' | 'xl'; index?: number }) {
  const sizes = { sm: 'w-7 h-7 text-xs', md: 'w-9 h-9 text-sm', lg: 'w-11 h-11 text-base', xl: 'w-16 h-16 text-xl' };
  return (
    <div className={`${sizes[size]} ${avatarColors[index % avatarColors.length]} rounded-full flex items-center justify-center text-white font-semibold flex-shrink-0`}>
      {initials}
    </div>
  );
}

// ── Card ─────────────────────────────────────────────────────────────────────
export function Card({ children, className = '', hover = false, onClick }: { children: ReactNode; className?: string; hover?: boolean; onClick?: () => void }) {
  return (
    <div
      onClick={onClick}
      className={`bg-white rounded-2xl border border-slate-200 shadow-sm ${hover ? 'card-hover cursor-pointer' : ''} ${onClick ? 'cursor-pointer' : ''} ${className}`}
    >
      {children}
    </div>
  );
}

// ── Stat Card ─────────────────────────────────────────────────────────────────
export function StatCard({ label, value, sub, icon, color = 'blue', trend }: {
  label: string; value: string; sub?: string; icon: ReactNode; color?: string; trend?: { value: string; up: boolean };
}) {
  const colors: Record<string, string> = {
    blue: 'from-blue-500 to-blue-600',
    emerald: 'from-emerald-500 to-emerald-600',
    amber: 'from-amber-500 to-amber-600',
    red: 'from-red-500 to-red-600',
    violet: 'from-violet-500 to-violet-600',
    cyan: 'from-cyan-500 to-cyan-600',
  };
  return (
    <Card hover className="p-5">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">{label}</p>
          <p className="text-2xl font-bold text-slate-800 mt-1">{value}</p>
          {sub && <p className="text-xs text-slate-500 mt-0.5">{sub}</p>}
          {trend && (
            <div className={`flex items-center gap-1 mt-2 text-xs font-medium ${trend.up ? 'text-emerald-600' : 'text-red-500'}`}>
              <span>{trend.up ? '↑' : '↓'} {trend.value}</span>
              <span className="text-slate-400 font-normal">vs last month</span>
            </div>
          )}
        </div>
        <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${colors[color]} flex items-center justify-center text-white shadow-lg`}>
          {icon}
        </div>
      </div>
    </Card>
  );
}

// ── Button ────────────────────────────────────────────────────────────────────
export function Button({ children, variant = 'primary', size = 'md', onClick, className = '', disabled = false, type = 'button' }: {
  children: ReactNode; variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger'; size?: 'sm' | 'md' | 'lg';
  onClick?: () => void; className?: string; disabled?: boolean; type?: 'button' | 'submit';
}) {
  const variants = {
    primary: 'bg-blue-600 hover:bg-blue-700 text-white shadow-sm shadow-blue-200 border border-blue-600',
    secondary: 'bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200',
    outline: 'bg-white hover:bg-slate-50 text-slate-700 border border-slate-300',
    ghost: 'bg-transparent hover:bg-slate-100 text-slate-600 border border-transparent',
    danger: 'bg-red-600 hover:bg-red-700 text-white border border-red-600 shadow-sm shadow-red-200',
  };
  const sizes = { sm: 'px-3 py-1.5 text-xs', md: 'px-4 py-2 text-sm', lg: 'px-6 py-3 text-sm' };
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`inline-flex items-center gap-2 font-medium rounded-xl transition-all duration-150 ${variants[variant]} ${sizes[size]} ${disabled ? 'opacity-50 cursor-not-allowed' : ''} ${className}`}
    >
      {children}
    </button>
  );
}

// ── Input ─────────────────────────────────────────────────────────────────────
export function Input({ label, placeholder, type = 'text', value, onChange, icon, min, max, disabled, className = '' }: {
  label?: string; placeholder?: string; type?: string; value?: string; onChange?: (v: string) => void; icon?: ReactNode; className?: string; min?: string | number; max?: string | number; disabled?: boolean;
}) {
  return (
    <div className={className}>
      {label && <label className="block text-sm font-medium text-slate-700 mb-1.5">{label}</label>}
      <div className="relative">
        {icon && <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">{icon}</div>}
        <input
          type={type}
          placeholder={placeholder}
          value={value}
          min={min}
          max={max}
          disabled={disabled}
          onChange={e => onChange?.(e.target.value)}
          className={`w-full bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${icon ? 'pl-10 pr-4 py-2.5' : 'px-4 py-2.5'} ${disabled ? 'opacity-60 cursor-not-allowed' : ''}`}
        />
      </div>
    </div>
  );
}

// ── Select ────────────────────────────────────────────────────────────────────
export function Select({ label, options, value, onChange }: {
  label?: string; options: { value: string; label: string }[]; value: string; onChange: (v: string) => void;
}) {
  return (
    <div>
      {label && <label className="block text-sm font-medium text-slate-700 mb-1.5">{label}</label>}
      <select
        value={value}
        onChange={e => onChange(e.target.value)}
        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
      >
        {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
    </div>
  );
}

// ── Toast ─────────────────────────────────────────────────────────────────────
const toastIcons = {
  success: <CheckCircle size={16} className="text-emerald-500 flex-shrink-0" />,
  error: <AlertCircle size={16} className="text-red-500 flex-shrink-0" />,
  info: <Info size={16} className="text-blue-500 flex-shrink-0" />,
  warning: <AlertTriangle size={16} className="text-amber-500 flex-shrink-0" />,
};
export function Toast({ type, message, onClose }: { type: keyof typeof toastIcons; message: string; onClose: () => void }) {
  return (
    <div className="fixed bottom-6 right-6 z-50 animate-fade-in">
      <div className="flex items-center gap-3 bg-white border border-slate-200 rounded-2xl shadow-xl px-4 py-3 max-w-sm">
        {toastIcons[type]}
        <p className="text-sm text-slate-700 flex-1">{message}</p>
        <button onClick={onClose} className="text-slate-400 hover:text-slate-600"><X size={14} /></button>
      </div>
    </div>
  );
}

// ── Modal ─────────────────────────────────────────────────────────────────────
export function Modal({ open, onClose, title, children, size = 'md' }: {
  open: boolean; onClose: () => void; title: string; children: ReactNode; size?: 'sm' | 'md' | 'lg';
}) {
  if (!open) return null;
  const sizes = { sm: 'max-w-md', md: 'max-w-lg', lg: 'max-w-2xl' };
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={onClose} />
      <div className={`relative bg-white rounded-2xl shadow-2xl w-full ${sizes[size]} animate-fade-in border border-slate-200`}>
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <h3 className="text-base font-semibold text-slate-800">{title}</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100"><X size={18} /></button>
        </div>
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
}

// ── Empty State ───────────────────────────────────────────────────────────────
export function EmptyState({ icon, title, description, action }: { icon: ReactNode; title: string; description: string; action?: ReactNode }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center text-slate-400 mb-4">{icon}</div>
      <h3 className="text-base font-semibold text-slate-700 mb-1">{title}</h3>
      <p className="text-sm text-slate-500 max-w-xs">{description}</p>
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}

// ── Pagination ────────────────────────────────────────────────────────────────
export function Pagination({ page, total, perPage, onChange }: { page: number; total: number; perPage: number; onChange: (p: number) => void }) {
  const pages = Math.ceil(total / perPage);
  return (
    <div className="flex items-center justify-between text-sm text-slate-500">
      <span>Showing {Math.min((page - 1) * perPage + 1, total)}–{Math.min(page * perPage, total)} of {total.toLocaleString()} entries</span>
      <div className="flex gap-1">
        {[...Array(Math.min(pages, 5))].map((_, i) => (
          <button key={i} onClick={() => onChange(i + 1)} className={`w-8 h-8 rounded-lg text-xs font-medium transition-all ${page === i + 1 ? 'bg-blue-600 text-white' : 'hover:bg-slate-100 text-slate-600'}`}>{i + 1}</button>
        ))}
      </div>
    </div>
  );
}

// ── Section Header ────────────────────────────────────────────────────────────
export function SectionHeader({ title, subtitle, action }: { title: string; subtitle?: string; action?: ReactNode }) {
  return (
    <div className="flex items-start justify-between mb-6">
      <div>
        <h1 className="text-xl font-bold text-slate-800">{title}</h1>
        {subtitle && <p className="text-sm text-slate-500 mt-0.5">{subtitle}</p>}
      </div>
      {action && <div className="flex items-center gap-2">{action}</div>}
    </div>
  );
}

// ── Loading spinner ───────────────────────────────────────────────────────────
export function Spinner({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) {
  const s = { sm: 'w-4 h-4', md: 'w-6 h-6', lg: 'w-8 h-8' }[size];
  return <div className={`${s} border-2 border-blue-200 border-t-blue-600 rounded-full animate-spin-custom`} />;
}
