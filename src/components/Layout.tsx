import { useState, useEffect } from 'react';
import {
  LayoutDashboard, Shield, FileText, Upload, CreditCard, QrCode, Link, History,
  Bell, User, Settings, Users, Search, Activity, BarChart3, ClipboardList,
  FileBarChart, Lock, ScanLine, Download, ChevronRight, LogOut, Moon, Sun,
  Menu, CheckCircle
} from 'lucide-react';
import { Avatar } from './UIComponents';
import { getSavedUser, userApi, adminApi } from '../service/api';

type Role = 'user' | 'admin' | 'verifier';

interface NavItem {
  id: string;
  label: string;
  icon: typeof LayoutDashboard;
  badge?: number;
  section?: string;
}

const userNav: NavItem[] = [
  { id: 'user-dashboard', label: 'Dashboard', icon: LayoutDashboard, section: 'Overview' },
  { id: 'identity-overview', label: 'Identity Overview', icon: Shield, section: 'Identity' },
  { id: 'upload-documents', label: 'Upload Documents', icon: Upload },
  { id: 'my-documents', label: 'My Documents', icon: FileText },
  { id: 'digital-id-card', label: 'Digital ID Card', icon: CreditCard, section: 'Assets' },
  { id: 'qr-code', label: 'QR Code Verification', icon: QrCode },
  { id: 'blockchain-status', label: 'Blockchain Status', icon: Link, section: 'Security' },
  { id: 'verification-history', label: 'Verification History', icon: History, section: 'Activity' },
  { id: 'notifications', label: 'Notifications', icon: Bell },
  { id: 'profile', label: 'Profile', icon: User, section: 'Account' },
  { id: 'settings', label: 'Settings', icon: Settings },
];

const adminNav: NavItem[] = [
  { id: 'admin-dashboard', label: 'Dashboard', icon: LayoutDashboard, section: 'Overview' },
  { id: 'pending-requests', label: 'Pending Requests', icon: ClipboardList, section: 'Identity' },
  { id: 'approve-reject', label: 'Approve / Reject', icon: CheckCircle },
  { id: 'user-management', label: 'User Management', icon: Users },
  { id: 'blockchain-explorer', label: 'Blockchain Explorer', icon: Link, section: 'Blockchain' },
  { id: 'identity-details', label: 'Identity Details', icon: Shield },
  { id: 'analytics', label: 'Analytics Dashboard', icon: BarChart3, section: 'Insights' },
  { id: 'audit-logs', label: 'Audit Logs', icon: Activity },
  { id: 'reports', label: 'Reports', icon: FileBarChart },
  { id: 'security-settings', label: 'Security Settings', icon: Lock, section: 'Security' },
];

const verifierNav: NavItem[] = [
  { id: 'search-identity', label: 'Search Identity', icon: Search, section: 'Verification' },
  { id: 'qr-scanner', label: 'QR Scanner', icon: ScanLine },
  { id: 'verification-result', label: 'Verification Result', icon: CheckCircle },
  { id: 'verifier-history', label: 'Verification History', icon: History, section: 'Activity' },
  { id: 'download-report', label: 'Download Report', icon: Download },
];

const navMap: Record<Role, NavItem[]> = { user: userNav, admin: adminNav, verifier: verifierNav };

const roleLabels: Record<Role, string> = { user: 'Identity Holder', admin: 'Administrator', verifier: 'Verifier Agent' };
const roleColors: Record<Role, string> = { user: 'bg-blue-500', admin: 'bg-violet-500', verifier: 'bg-cyan-500' };

interface LayoutProps {
  role: Role;
  screen: string;
  onNav: (screen: string) => void;
  onLogout: () => void;
  darkMode: boolean;
  onToggleDark: () => void;
  children: React.ReactNode;
}

export default function Layout({ role, screen, onNav, onLogout, darkMode, onToggleDark, children }: LayoutProps) {
  const [collapsed, setCollapsed] = useState(false);
  const [unreadNotifications, setUnreadNotifications] = useState(0);
  const [pendingRequests, setPendingRequests] = useState(0);
  const nav = navMap[role];
  let prevSection = '';

  useEffect(() => {
    // Dynamic Notifications
    const fetchNotifs = () => {
      const apiCall = role === 'admin' ? adminApi.getAdminNotifications() : userApi.getNotifications();
      apiCall.then((data: any) => {
        if (data && Array.isArray(data)) {
          setUnreadNotifications(data.filter((n: any) => !n.read).length);
        }
      }).catch(console.error);
    };
    fetchNotifs();

    // Dynamic Pending Requests (Only for Admin)
    if (role === 'admin') {
      adminApi.getStats()
        .then(stats => setPendingRequests(stats.pendingVerification))
        .catch(console.error);
    }
  }, [role]);

  const savedUser = getSavedUser() || { name: 'User', email: '', avatar: 'U' };
  const initials = savedUser.name?.charAt(0).toUpperCase() || 'U';

  return (
    <div className={`flex h-screen overflow-hidden ${darkMode ? 'dark' : ''}`} style={{ background: 'var(--background)' }}>
      {/* Sidebar */}
      <aside
        className={`flex-shrink-0 flex flex-col transition-all duration-300 ${collapsed ? 'w-16' : 'w-60'}`}
        style={{ background: 'var(--sidebar)', borderRight: '1px solid var(--sidebar-border)' }}
      >
        {/* Logo */}
        <div className="flex items-center gap-3 px-4 py-4 border-b border-slate-800">
          <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg shadow-blue-500/30">
            <Shield size={16} className="text-white" />
          </div>
          {!collapsed && (
            <div>
              <p className="text-white font-bold text-sm leading-none">Identity Vault</p>
              <p className="text-slate-500 text-[10px] mt-0.5">Digital Identity Platform</p>
            </div>
          )}
          <button onClick={() => setCollapsed(!collapsed)} className="ml-auto text-slate-500 hover:text-slate-300 transition-colors">
            {collapsed ? <ChevronRight size={14} /> : <Menu size={14} />}
          </button>
        </div>

        {/* Role badge */}
        {!collapsed && (
          <div className="mx-3 mt-3 mb-2 px-3 py-2 rounded-xl" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)' }}>
            <div className="flex items-center gap-2">
              <div className={`w-5 h-5 ${roleColors[role]} rounded-md flex items-center justify-center`}>
                <Shield size={10} className="text-white" />
              </div>
              <div>
                <p className="text-[10px] text-slate-500 uppercase tracking-wider">Role</p>
                <p className="text-xs text-slate-300 font-medium capitalize">{roleLabels[role]}</p>
              </div>
            </div>
          </div>
        )}

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-2 px-2">
          {nav.map((item) => {
            const showSection = item.section && item.section !== prevSection;
            if (item.section) prevSection = item.section;
            const active = screen === item.id;
            const Icon = item.icon;

            let displayBadge = item.badge;
            if (item.id === 'notifications') displayBadge = unreadNotifications > 0 ? unreadNotifications : undefined;
            if (item.id === 'pending-requests') displayBadge = pendingRequests > 0 ? pendingRequests : undefined;

            return (
              <div key={item.id}>
                {showSection && !collapsed && (
                  <p className="text-[10px] font-semibold text-slate-600 uppercase tracking-widest px-3 pt-4 pb-1">{item.section}</p>
                )}
                <button
                  onClick={() => onNav(item.id)}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-left transition-all duration-150 group mb-0.5 ${active
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30'
                    : 'text-slate-400 hover:bg-white/5 hover:text-slate-200'
                    }`}
                  title={collapsed ? item.label : undefined}
                >
                  <Icon size={15} className="flex-shrink-0" />
                  {!collapsed && (
                    <>
                      <span className="text-xs font-medium flex-1">{item.label}</span>
                      {displayBadge !== undefined && (
                        <span className="bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[18px] text-center leading-none">
                          {displayBadge}
                        </span>
                      )}
                    </>
                  )}
                </button>
              </div>
            );
          })}
        </nav>

        {/* Bottom user */}
        <div className="p-2 border-t border-slate-800">
          {!collapsed ? (
            <div className="px-2 py-2">
              <div className="flex items-center gap-2 mb-2">
                <Avatar initials={initials} size="sm" />
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-slate-300 truncate">{savedUser.name}</p>
                  <p className="text-[10px] text-slate-500 truncate">{savedUser.email}</p>
                </div>
              </div>
              <div className="flex gap-1">
                <button onClick={onToggleDark} className="flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-slate-400 hover:bg-white/5 hover:text-slate-200 text-xs transition-all">
                  {darkMode ? <Sun size={12} /> : <Moon size={12} />}
                  {darkMode ? 'Light' : 'Dark'}
                </button>
                <button onClick={onLogout} className="flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-slate-400 hover:bg-red-500/10 hover:text-red-400 text-xs transition-all">
                  <LogOut size={12} /> Logout
                </button>
              </div>
            </div>
          ) : (
            <div className="flex flex-col gap-1 items-center">
              <button onClick={onToggleDark} className="p-2 text-slate-400 hover:text-slate-200 hover:bg-white/5 rounded-lg">
                {darkMode ? <Sun size={14} /> : <Moon size={14} />}
              </button>
              <button onClick={onLogout} className="p-2 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg">
                <LogOut size={14} />
              </button>
            </div>
          )}
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top bar */}
        <header className="flex-shrink-0 flex items-center justify-between px-6 py-3 bg-white border-b border-slate-200 shadow-sm">
          <div>
            <h2 className="text-sm font-semibold text-slate-800">
              {nav.find(n => n.id === screen)?.label || 'Dashboard'}
            </h2>
            <p className="text-xs text-slate-400">Identity Vault Platform · {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
          </div>
          <div className="flex items-center gap-3">
            {/* Network status */}
            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 rounded-xl border border-emerald-200">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-xs font-medium text-emerald-700">Ethereum Mainnet</span>
            </div>
            {/* Block */}
            <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 rounded-xl border border-blue-200">
              <Link size={11} className="text-blue-600" />
              <span className="font-mono text-xs text-blue-700">#19,847,234</span>
            </div>
            {/* Notifications */}
            <button onClick={() => onNav('notifications')} className="relative w-9 h-9 bg-slate-100 rounded-xl flex items-center justify-center text-slate-600 hover:bg-slate-200 transition-all">
              <Bell size={16} />
              {unreadNotifications > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-red-500 rounded-full text-[9px] text-white font-bold flex items-center justify-center">
                  {unreadNotifications}
                </span>
              )}
            </button>
            {/* Avatar */}
            <button onClick={() => onNav('profile')} className="flex items-center gap-2 hover:opacity-80 transition-opacity">
              <Avatar initials={initials} size="sm" />
            </button>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-6 animate-fade-in" style={{ background: 'var(--background)' }}>
          {children}
        </main>
      </div>
    </div>
  );
}
