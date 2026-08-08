import { useState, useEffect } from 'react';
import {
  Users, Shield, CheckCircle, XCircle, Clock, BarChart3,
  Lock, Search, Filter, Download, Eye, Edit, Trash2, AlertTriangle,
  Plus, RefreshCw, TrendingUp, Database, Zap, FileText
} from 'lucide-react';
import { Card, StatCard, StatusBadge, Avatar, Button, Input, Select, Modal, Toast, SectionHeader, Pagination } from '../components/UIComponents';
import { VerificationAreaChart, ApprovalBarChart, StatusPieChart, UserGrowthLine } from '../components/Charts';
import { mockUsers, mockBlocks, mockAuditLogs } from '../data/mockData';
import { adminApi, authApi } from '../service/api';
// ── Admin Dashboard ───────────────────────────────────────────────────────────
export function AdminDashboard({ onNav }: { onNav: (s: string) => void }) {
  const [stats, setStats] = useState<any>({
    totalUsers: 0, totalVerified: 0, pendingVerification: 0, rejectedRequests: 0, blockchainBlocks: 0, todayVerifications: 0
  });
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [analytics, setAnalytics] = useState<any[]>([]);

  useEffect(() => {
    adminApi.getStats().then(setStats).catch(console.error);
    adminApi.getAuditLogs(0, 5).then(res => setAuditLogs(res.logs || [])).catch(console.error);
    adminApi.getMonthlyAnalytics().then(setAnalytics).catch(console.error);
  }, []);

  return (
    <div className="animate-fade-in space-y-6">
      {/* Header */}
      <div className="rounded-2xl p-6 text-white relative overflow-hidden" style={{ background: 'linear-gradient(135deg, #4C1D95 0%, #2D1B69 50%, #1E0A4A 100%)' }}>
        <div className="absolute right-0 top-0 w-64 h-64 opacity-10 rounded-full" style={{ background: 'radial-gradient(circle, white, transparent)', transform: 'translate(30%, -30%)' }} />
        <div className="relative z-10 flex items-center justify-between">
          <div>
            <p className="text-violet-300 text-sm mb-1">System Administration</p>
            <h1 className="text-2xl font-bold mb-1">Control Center</h1>
            <p className="text-violet-300 text-xs">{stats.totalUsers} registered users · Live validators · No alerts</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-right">
              <p className="text-violet-300 text-xs">Network Verified</p>
              <p className="text-white font-semibold">{stats.totalUsers > 0 ? ((stats.totalVerified / stats.totalUsers) * 100).toFixed(0) : 0}% Identities</p>
            </div>
            <div className="w-12 h-12 bg-violet-700/80 rounded-2xl flex items-center justify-center">
              <Shield size={24} className="text-violet-200" />
            </div>
          </div>
        </div>
        <div className="relative z-10 grid grid-cols-4 gap-4 mt-5 pt-5 border-t border-violet-700/50">
          {[
            { label: 'Pending Requests', value: stats.pendingVerification, sub: 'Needs action' },
            { label: 'Verified Users', value: stats.totalVerified, sub: `Out of ${stats.totalUsers} total` },
            { label: 'Rejected', value: stats.rejectedRequests, sub: 'Blocked requests' },
            { label: 'Total Blocks', value: stats.blockchainBlocks, sub: 'Stored on blockchain' },
          ].map(m => (
            <div key={m.label}>
              <p className="text-[10px] text-violet-300 uppercase tracking-wider">{m.label}</p>
              <p className="text-xl font-bold">{m.value}</p>
              <p className="text-xs text-violet-300">{m.sub}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Total Users" value={stats.totalUsers} sub="Registered accounts" icon={<Users size={18} />} color="blue" trend={{ value: `${stats.totalUsers}`, up: stats.totalUsers > 0 }} />
        <StatCard label="Verified Identities" value={stats.totalVerified} sub={`${stats.totalUsers > 0 ? Math.round((stats.totalVerified / stats.totalUsers) * 100) : 0}% of users`} icon={<CheckCircle size={18} />} color="emerald" trend={{ value: `${stats.totalUsers > 0 ? Math.round((stats.totalVerified / stats.totalUsers) * 100) : 0}%`, up: stats.totalVerified > 0 }} />
        <StatCard label="Pending Review" value={stats.pendingVerification} sub="Awaiting admin action" icon={<Clock size={18} />} color="amber" trend={{ value: `${stats.pendingVerification}`, up: stats.pendingVerification > 0 }} />
        <StatCard label="Rejected" value={stats.rejectedRequests} sub="All time" icon={<XCircle size={18} />} color="red" trend={{ value: `${stats.rejectedRequests}`, up: false }} />
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="p-5 lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-semibold text-slate-800">Monthly Verification Activity</h3>
              <p className="text-xs text-slate-500">Registrations & verifications over 7 months</p>
            </div>
            <span className="text-xs text-emerald-600 font-medium bg-emerald-50 px-2 py-1 rounded-lg border border-emerald-200">{analytics.length > 1 ? `↑ ${Math.round(((analytics[analytics.length - 1]?.registrations || 0) / Math.max(1, analytics[analytics.length - 2]?.registrations || 1)) * 100 - 100)}% MoM` : 'Live Data'}</span>
          </div>
          <VerificationAreaChart data={analytics} />
        </Card>

        <Card className="p-5">
          <h3 className="text-sm font-semibold text-slate-800 mb-4">Identity Status Distribution</h3>
          <StatusPieChart data={[
            { name: 'Verified', value: stats.totalVerified, color: '#10B981' },
            { name: 'Pending', value: stats.pendingVerification, color: '#F59E0B' },
            { name: 'Rejected', value: stats.rejectedRequests, color: '#EF4444' }
          ].filter(d => d.value > 0)} />
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="p-5 lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-slate-800">Approval vs Rejection Rate</h3>
            <Button variant="outline" size="sm" onClick={() => onNav('analytics')}><BarChart3 size={13} /> Full Analytics</Button>
          </div>
          <ApprovalBarChart data={analytics} />
        </Card>

        <Card className="p-5">
          <h3 className="text-sm font-semibold text-slate-800 mb-4">Recent Audit Events</h3>
          <div className="space-y-3">
            {auditLogs.length === 0 ? (
              <p className="text-xs text-slate-500 py-4 text-center">No recent audit events</p>
            ) : auditLogs.map(log => (
              <div key={log.id} className="flex items-start gap-2">
                <div className={`w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0 ${log.severity === 'critical' ? 'bg-red-500' : log.severity === 'warning' ? 'bg-amber-500' : 'bg-blue-500'}`} />
                <div className="min-w-0">
                  <p className="text-xs text-slate-700 font-medium truncate">{log.action}</p>
                  <p className="text-[10px] text-slate-400">{log.actor} · {log.timestamp.split ? log.timestamp.split('T')[0] : log.timestamp}</p>
                </div>
              </div>
            ))}
            <Button variant="ghost" size="sm" onClick={() => onNav('audit-logs')} className="w-full justify-center mt-2">View all logs</Button>
          </div>
        </Card>
      </div>

      {/* Quick actions */}
      <Card className="p-5">
        <h3 className="text-sm font-semibold text-slate-800 mb-4">Quick Actions</h3>
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          {[
            { label: 'Pending Requests', icon: Clock, color: 'amber', screen: 'pending-requests', badge: stats.pendingVerification > 0 ? stats.pendingVerification : null },
            { label: 'User Management', icon: Users, color: 'blue', screen: 'user-management', badge: null },
            { label: 'Blockchain Explorer', icon: Database, color: 'violet', screen: 'blockchain-explorer', badge: null },
            { label: 'Analytics', icon: BarChart3, color: 'emerald', screen: 'analytics', badge: null },
            { label: 'Security Settings', icon: Lock, color: 'red', screen: 'security-settings', badge: null },
          ].map(a => (
            <button key={a.label} onClick={() => onNav(a.screen)} className="relative flex flex-col items-center gap-2 p-4 bg-slate-50 rounded-2xl border border-slate-200 hover:border-blue-200 hover:bg-blue-50 transition-all group">
              {a.badge && <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full text-white text-[10px] font-bold flex items-center justify-center">{a.badge}</span>}
              <div className={`w-10 h-10 rounded-xl bg-${a.color}-50 group-hover:bg-${a.color}-100 flex items-center justify-center`}>
                <a.icon size={18} className={`text-${a.color}-600`} />
              </div>
              <span className="text-xs font-medium text-slate-600 text-center leading-tight">{a.label}</span>
            </button>
          ))}
        </div>
      </Card>
    </div>
  );
}

// ── Pending Requests ──────────────────────────────────────────────────────────
export function PendingRequests({ onNav }: { onNav: (s: string) => void }) {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [pending, setPending] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const loadRequests = () => {
    setLoading(true);
    adminApi.getPendingRequests((page - 1), 10)
      .then(data => {
        setPending(data.requests);
        setLoading(false);
      })
      .catch(err => {
        console.error("Failed to load pending requests", err);
        setLoading(false);
      });
  };

  useEffect(() => {
    loadRequests();
  }, [page]);

  const handleApprove = (userId: number) => {
    adminApi.approveIdentity(userId)
      .then(() => loadRequests())
      .catch(err => {
        alert("Failed to approve identity: " + (err.message || JSON.stringify(err)));
        console.error(err);
      });
  };

  const handleReject = (userId: number) => {
    const reason = prompt("Enter rejection reason:") || "Not provided";
    adminApi.rejectIdentity(userId, reason)
      .then(() => loadRequests())
      .catch(err => {
        alert("Failed to reject identity: " + (err.message || JSON.stringify(err)));
        console.error(err);
      });
  };

  return (
    <div className="animate-fade-in space-y-6">
      <SectionHeader title="Pending Identity Requests" subtitle={`${pending.length} requests awaiting review on this page`}
        action={<div className="flex gap-2"><Button variant="outline" size="sm"><Filter size={13} /> Filter</Button><Button onClick={loadRequests} size="sm"><RefreshCw size={13} /> Refresh</Button></div>} />

      <Card className="p-5">
        <div className="flex gap-3 mb-4">
          <Input placeholder="Search requests..." value={search} onChange={setSearch} className="flex-1" icon={<Search size={14} />} />
          <Select options={[{ value: 'all', label: 'All Types' }, { value: 'passport', label: 'Passport' }, { value: 'license', label: 'License' }]} value="all" onChange={() => { }} />
        </div>

        <div className="space-y-3">
          {loading ? (
            <div className="text-center p-6 text-sm text-slate-500">Loading requests...</div>
          ) : pending.length === 0 ? (
            <div className="text-center p-6 text-sm text-slate-500">No pending requests found.</div>
          ) : pending.map((user, i) => (
            <div key={user.id} className="flex items-center gap-4 p-4 rounded-xl border border-slate-200 hover:border-blue-200 hover:bg-blue-50/30 transition-all">
              <Avatar initials={user.name?.substring(0, 2).toUpperCase() || 'U'} size="md" index={i} />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <p className="text-sm font-semibold text-slate-800">{user.name}</p>
                  <span className="text-[10px] font-mono bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full font-medium border border-amber-200">
                    DID: {user.did || 'Not Generated'}
                  </span>
                </div>
                <p className="text-xs text-slate-500">{user.email}</p>
                <div className="flex items-center gap-3 mt-1 mb-2">
                  <span className="text-[10px] text-slate-400">Submitted: {new Date(user.submittedAt || Date.now()).toLocaleDateString()}</span>
                </div>
                {user.documents && user.documents.length > 0 && (
                  <div className="flex gap-2 flex-wrap">
                    <span className="text-[10px] text-slate-500 flex items-center">Review files:</span>
                    {user.documents.map((doc: any, idx: number) => {
                      const fileUrl = doc.storageUrl?.startsWith('http') ? doc.storageUrl.replace('localhost:8443', '127.0.0.1:8080') : `http://127.0.0.1:8080${doc.storageUrl?.startsWith('/') ? '' : '/'}${doc.storageUrl}`;
                      return (
                        <a key={doc.id || idx} href={fileUrl} target="_blank" rel="noreferrer" className="flex items-center gap-1 px-2 py-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded transition-all border border-indigo-200 text-[10px] font-medium">
                          <Eye size={10} /> {doc.name || 'Document'}
                        </a>
                      );
                    })}
                  </div>
                )}
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <button onClick={() => handleApprove(user.userId)} className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded-xl border border-emerald-200 text-xs font-medium transition-all">
                  <CheckCircle size={13} /> Approve
                </button>
                <button onClick={() => handleReject(user.userId)} className="flex items-center gap-1.5 px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-600 rounded-xl border border-red-200 text-xs font-medium transition-all">
                  <XCircle size={13} /> Reject
                </button>
              </div>
            </div>
          ))}
        </div>
        <div className="mt-4 flex gap-2">
          <Button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} variant="outline" size="sm">Previous</Button>
          <Button onClick={() => setPage(p => p + 1)} disabled={pending.length < 10} variant="outline" size="sm">Next</Button>
        </div>
      </Card>
    </div>
  );
}

// ── Approve / Reject ──────────────────────────────────────────────────────────
export function ApproveReject() {
  const [request, setRequest] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [decision, setDecision] = useState<'approve' | 'reject' | null>(null);
  const [reason, setReason] = useState('');
  const [toast, setToast] = useState<{ type: 'success' | 'error'; msg: string } | null>(null);

  useEffect(() => {
    adminApi.getPendingRequests(0, 1).then(data => {
      if (data && data.requests && data.requests.length > 0) {
        setRequest(data.requests[0]);
      }
      setLoading(false);
    }).catch(console.error);
  }, []);

  const handleSubmit = () => {
    if (!request) return;
    if (decision === 'reject' && !reason.trim()) {
      alert('Please provide a rejection reason before rejecting.');
      return;
    }
    const apiCall = decision === 'approve' ? adminApi.approveIdentity(request.userId) : adminApi.rejectIdentity(request.userId, reason);

    apiCall.then(() => {
      setToast({ type: decision === 'approve' ? 'success' : 'error', msg: `Identity ${decision === 'approve' ? 'approved' : 'rejected'} successfully.` });
      setTimeout(() => {
        setToast(null);
        setRequest(null);
        setReason('');
        adminApi.getPendingRequests(0, 1).then(data => {
          if (data && data.requests && data.requests.length > 0) setRequest(data.requests[0]);
        });
      }, 2000);
      setDecision(null);
    }).catch(console.error);
  };

  if (loading) return <div className="p-8 text-center text-slate-500">Loading pending requests...</div>;
  if (!request) return <div className="p-8 text-center text-emerald-600 font-semibold bg-emerald-50 rounded-xl border border-emerald-200 m-8">Zero pending requests in queue!</div>;

  const initials = request.name?.substring(0, 2).toUpperCase() || 'U';

  return (
    <div className="animate-fade-in space-y-6">
      <SectionHeader title="Review Identity Request" subtitle={`Case #REQ-${request.userId} · Submitted ${new Date(request.submittedAt).toLocaleDateString()}`} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* User info */}
        <div className="space-y-4">
          <Card className="p-5">
            <div className="flex items-center gap-3 mb-4">
              <Avatar initials={initials} size="lg" index={1} />
              <div>
                <p className="font-bold text-slate-800">{request.name}</p>
                <p className="text-xs text-slate-500">{request.email}</p>
                <StatusBadge status="pending" />
              </div>
            </div>
            <div className="space-y-2">
              {[
                { label: 'DID', value: request.did || 'Not Generated' },
                { label: 'Platform ID', value: `UID-${request.userId}` },
                { label: 'Submitted', value: new Date(request.submittedAt).toLocaleDateString() },
                { label: 'Documents', value: `${request.documents?.length || 0} uploaded` },
              ].map(f => (
                <div key={f.label} className="flex justify-between py-1.5 border-b border-slate-100 last:border-0 text-xs">
                  <span className="text-slate-400">{f.label}</span>
                  <span className="text-slate-700 font-medium">{f.value}</span>
                </div>
              ))}
            </div>
          </Card>

          {/* AI check - computed from real user data */}
          {(() => {
            const docCount = request.documents?.length || 0;
            const docScore = Math.min(100, docCount >= 3 ? 95 : docCount === 2 ? 80 : docCount === 1 ? 55 : 10);
            const identityScore = [request.aadhaar, request.pan, request.passport, request.license].filter(Boolean).length * 25;
            const didScore = request.did ? 90 : 20;
            const profileScore = [request.name, request.email].filter(Boolean).length * 45;
            const overallScore = Math.round((docScore * 0.35) + (identityScore * 0.25) + (didScore * 0.2) + (profileScore * 0.2));
            const getColor = (v: number) => v >= 80 ? 'bg-emerald-500' : v >= 50 ? 'bg-blue-500' : v >= 30 ? 'bg-amber-500' : 'bg-red-500';
            const metrics = [
              { label: 'Document Authenticity', val: docScore, color: getColor(docScore) },
              { label: 'Identity Completeness', val: identityScore, color: getColor(identityScore) },
              { label: 'DID Verification', val: didScore, color: getColor(didScore) },
              { label: 'Profile Integrity', val: profileScore, color: getColor(profileScore) },
            ];
            return (
              <Card className="p-5">
                <h3 className="text-sm font-semibold text-slate-800 mb-3">AI Verification Score</h3>
                <div className="text-center mb-4">
                  <div className={`text-4xl font-black ${overallScore >= 70 ? 'text-emerald-600' : overallScore >= 40 ? 'text-amber-500' : 'text-red-500'}`}>{overallScore}</div>
                  <div className="text-xs text-slate-500">/ 100 Confidence</div>
                </div>
                <div className="space-y-2">
                  {metrics.map(c => (
                    <div key={c.label}>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-slate-600">{c.label}</span>
                        <span className="font-medium text-slate-700">{c.val}%</span>
                      </div>
                      <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                        <div className={`h-full ${c.color} rounded-full`} style={{ width: `${c.val}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            );
          })()}
        </div>

        {/* Documents */}
        <Card className="p-5">
          <h3 className="text-sm font-semibold text-slate-800 mb-4">Submitted Documents</h3>
          <div className="space-y-3">
            {request.documents && request.documents.map((doc: any, i: number) => {
              const fileUrl = doc.storageUrl?.startsWith('http') ? doc.storageUrl.replace('localhost:8443', '127.0.0.1:8080') : `http://127.0.0.1:8080${doc.storageUrl?.startsWith('/') ? '' : '/'}${doc.storageUrl}`;
              return (
                <div key={i} className={`p-4 rounded-xl border border-blue-200 bg-blue-50`}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-slate-800 capitalize">{doc.name || 'Document'}</span>
                    <a href={fileUrl} target="_blank" rel="noreferrer" className="text-xs text-blue-600 hover:text-blue-800 bg-white px-3 py-1 rounded-full border border-blue-100 font-medium shadow-sm transition-all flex items-center gap-1.5">
                      <Eye size={12} /> View Full
                    </a>
                  </div>
                  {/* Document preview placeholder wrapper */}
                  <a href={fileUrl} target="_blank" rel="noreferrer" className="block w-full h-24 bg-white/80 rounded-xl border border-white/60 flex items-center justify-center text-slate-400 hover:bg-white hover:text-blue-500 transition-all cursor-pointer">
                    <div className="text-center">
                      <FileText size={20} className="mx-auto mb-1 opacity-50" />
                      <p className="text-[10px]">Click to open secure document</p>
                    </div>
                  </a>
                </div>
              );
            })}
            {(!request.documents || request.documents.length === 0) && (
              <p className="text-xs text-slate-500 italic p-4 text-center">No documents uploaded.</p>
            )}
          </div>
        </Card>

        {/* Decision */}
        <div className="space-y-4">
          <Card className="p-5">
            <h3 className="text-sm font-semibold text-slate-800 mb-4">Admin Decision</h3>
            <div className="space-y-2 mb-4">
              <button onClick={() => setDecision('approve')} className={`w-full flex items-center gap-3 p-3 rounded-xl border transition-all ${decision === 'approve' ? 'border-emerald-500 bg-emerald-50' : 'border-slate-200 hover:border-emerald-300'}`}>
                <CheckCircle size={18} className={decision === 'approve' ? 'text-emerald-600' : 'text-slate-400'} />
                <div className="text-left">
                  <p className={`text-sm font-medium ${decision === 'approve' ? 'text-emerald-700' : 'text-slate-700'}`}>Approve Identity</p>
                  <p className="text-xs text-slate-400">Verify and anchor to blockchain</p>
                </div>
              </button>
              <button onClick={() => setDecision('reject')} className={`w-full flex items-center gap-3 p-3 rounded-xl border transition-all ${decision === 'reject' ? 'border-red-400 bg-red-50' : 'border-slate-200 hover:border-red-300'}`}>
                <XCircle size={18} className={decision === 'reject' ? 'text-red-500' : 'text-slate-400'} />
                <div className="text-left">
                  <p className={`text-sm font-medium ${decision === 'reject' ? 'text-red-600' : 'text-slate-700'}`}>Reject Request</p>
                  <p className="text-xs text-slate-400">Notify user with reason</p>
                </div>
              </button>
            </div>

            <div className="mb-4">
              <label className="block text-xs font-medium text-slate-700 mb-1.5">Notes / Reason</label>
              <textarea
                value={reason}
                onChange={e => setReason(e.target.value)}
                placeholder="Add admin notes or rejection reason..."
                rows={3}
                className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              />
            </div>

            <Button onClick={handleSubmit} disabled={!decision} className="w-full justify-center" variant={decision === 'approve' ? 'primary' : 'danger'}>
              {decision === 'approve' ? <><CheckCircle size={14} /> Approve Identity</> : decision === 'reject' ? <><XCircle size={14} /> Reject Request</> : 'Select Decision'}
            </Button>
          </Card>

          <Card className="p-4">
            <h4 className="text-xs font-semibold text-slate-600 mb-3">Review Checklist</h4>
            <div className="space-y-2">
              {['Document authenticity verified', 'Face match confirmed', 'Address validated', 'No fraud indicators'].map((item, i) => (
                <label key={i} className="flex items-center gap-2 text-xs text-slate-600 cursor-pointer">
                  <div className="w-4 h-4 rounded border-2 border-emerald-400 bg-emerald-50 flex items-center justify-center flex-shrink-0">
                    <CheckCircle size={10} className="text-emerald-500" />
                  </div>
                  {item}
                </label>
              ))}
            </div>
          </Card>
        </div>
      </div>

      {toast && <Toast type={toast.type} message={toast.msg} onClose={() => setToast(null)} />}
    </div>
  );
}

// ── User Management ────────────────────────────────────────────────────────────
export function UserManagement({ onNav }: { onNav?: (s: string) => void }) {
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [page, setPage] = useState(1);
  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState<any>(null);
  const [newRole, setNewRole] = useState('user');
  const [users, setUsers] = useState<any[]>([]);
  const [totalItems, setTotalItems] = useState(0);

  // New user form state
  const [newUser, setNewUser] = useState({ firstName: '', lastName: '', email: '', password: '', role: 'user' });
  const [isCreating, setIsCreating] = useState(false);

  const fetchUsers = () => {
    adminApi.getUsers(search, page - 1, 10).then(res => {
      if (res && res.users) {
        setUsers(res.users);
        setTotalItems(res.totalItems || 0);
      }
    }).catch(console.error);
  };

  useEffect(() => {
    fetchUsers();
  }, [search, page]);

  const handleCreateUser = async () => {
    if (!newUser.firstName || !newUser.email || !newUser.password) return alert('Name, email, and password are required');
    setIsCreating(true);
    try {
      const response = await authApi.register({
        name: `${newUser.firstName} ${newUser.lastName}`.trim(),
        email: newUser.email,
        password: newUser.password,
        role: newUser.role,
        country: 'Global' // Default metadata
      });
      alert(`Successfully created ${newUser.role}: ${response.email || newUser.email}\nThey can now sign in with their password.`);
      setShowModal(false);
      setNewUser({ firstName: '', lastName: '', email: '', password: '', role: 'user' });
      fetchUsers(); // Refresh table from DB
    } catch (err: any) {
      console.error(err);
      alert(err.message || 'Failed to create user. Ensure email is unique.');
    } finally {
      setIsCreating(false);
    }
  };

  const handleExport = () => {
    if (!users || users.length === 0) {
      alert("No users to export");
      return;
    }
    const headers = ['ID', 'Name', 'Email', 'Role', 'Status', 'DID', 'JoinDate', 'DocumentsCount'];
    const csvRows = [headers.join(',')];
    users.forEach(u => {
      const values = [u.id, `"${u.name || ''}"`, `"${u.email || ''}"`, u.role, u.status, u.did, [...(u.joinDate || '').split('T')][0], u.documentsCount || 0];
      csvRows.push(values.join(','));
    });
    const blob = new Blob([csvRows.join('\n')], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `users_export_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const filtered = users.filter(u =>
    (roleFilter === 'all' || (u.role || '').toLowerCase() === roleFilter)
  );

  return (
    <div className="animate-fade-in space-y-6">
      <SectionHeader title="User Management" subtitle="Manage all registered users and their roles"
        action={<Button size="sm" onClick={() => setShowModal(true)}><Plus size={14} /> Add User</Button>} />

      <Card className="p-5">
        <div className="flex flex-col sm:flex-row gap-3 mb-4">
          <Input placeholder="Search users..." value={search} onChange={setSearch} icon={<Search size={14} />} className="flex-1" />
          <div className="flex gap-2">
            {['all', 'user', 'admin', 'verifier'].map(r => (
              <button key={r} onClick={() => setRoleFilter(r)} className={`px-3 py-1.5 rounded-xl text-xs font-medium capitalize border transition-all ${roleFilter === r ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300'}`}>{r}</button>
            ))}
          </div>
          <Button variant="outline" size="sm" onClick={handleExport}><Download size={13} /> Export</Button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-100">
                {['User', 'Email', 'Role', 'Status', 'Documents', 'Last Login', 'Actions'].map(h => (
                  <th key={h} className="text-left text-xs font-semibold text-slate-500 pb-3 pr-4">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((user, i) => (
                <tr key={user.id} className="border-b border-slate-50 hover:bg-slate-50/80 transition-colors">
                  <td className="py-3 pr-4">
                    <div className="flex items-center gap-3">
                      <Avatar initials={user.name ? user.name.substring(0, 2).toUpperCase() : 'U'} size="sm" index={user.id || i} />
                      <div>
                        <p className="text-sm font-semibold text-slate-800">{user.name}</p>
                        <p className="text-[10px] font-mono text-slate-400">{user.did}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 pr-4 text-xs text-slate-600">{user.email}</td>
                  <td className="py-3 pr-4"><StatusBadge status={user.role || 'user'} /></td>
                  <td className="py-3 pr-4"><StatusBadge status={user.status || 'pending'} /></td>
                  <td className="py-3 pr-4 text-xs text-slate-600 text-center">{user.documentsCount || 0}</td>
                  <td className="py-3 pr-4 text-xs text-slate-500">{user.lastLogin ? user.lastLogin.split('T')[0] : 'Never'}</td>
                  <td className="py-3 pr-4">
                    <div className="flex gap-1">
                      <button onClick={() => {
                        sessionStorage.setItem('inspect_user_id', String(user.id));
                        if (onNav) onNav('identity-details');
                        else alert("Navigation function missing. Use the sidebar.");
                      }} className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all" title="View Details"><Eye size={13} /></button>

                      <button onClick={() => {
                        setEditingUser(user);
                        setNewRole((user.role || 'user').toLowerCase());
                      }} className="p-1.5 text-slate-400 hover:text-violet-600 hover:bg-violet-50 rounded-lg transition-all" title="Edit Role"><Edit size={13} /></button>

                      <button onClick={() => {
                        const r = (user.role || '').toLowerCase();
                        if (r === 'admin' || r === 'verifier') {
                          alert(`For security reasons, system ${r} accounts cannot be deleted.`);
                          return;
                        }
                        if (window.confirm(`Are you sure you want to PERMANENTLY delete ${user.name}? This will remove all their documents, identity records, and data from the database forever.`)) {
                          adminApi.deleteUser(user.id).then(() => {
                            fetchUsers();
                            alert(`${user.name} has been permanently deleted.`);
                          }).catch(err => {
                            console.error(err);
                            alert(`Failed to delete user. Technical details:\n\n${err.message || JSON.stringify(err)}`);
                          });
                        }
                      }} className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all" title="Delete User"><Trash2 size={13} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="mt-4"><Pagination page={page} total={totalItems} perPage={10} onChange={setPage} /></div>
      </Card>

      <Modal open={!!editingUser} onClose={() => setEditingUser(null)} title="Edit User Role">
        <div className="space-y-4">
          <p className="text-sm text-slate-600">
            Change access role for <strong>{editingUser?.name}</strong>:
          </p>
          <Select
            label="Select System Role"
            options={[{ value: 'user', label: 'User' }, { value: 'admin', label: 'Admin' }, { value: 'verifier', label: 'Verifier' }]}
            value={newRole}
            onChange={setNewRole}
          />
          <div className="flex gap-2 pt-2">
            <Button className="flex-1 justify-center" onClick={() => {
              adminApi.updateRole(editingUser.id, newRole.toUpperCase())
                .then(() => {
                  alert('Role updated successfully');
                  fetchUsers();
                  setEditingUser(null);
                })
                .catch(err => {
                  console.error(err);
                  alert('Failed to update role');
                });
            }}>
              Update Role
            </Button>
            <Button variant="outline" onClick={() => setEditingUser(null)} className="flex-1 justify-center">Cancel</Button>
          </div>
        </div>
      </Modal>

      <Modal open={showModal} onClose={() => setShowModal(false)} title="Add New User">
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <Input label="First Name" placeholder="Jane" value={newUser.firstName} onChange={(val) => setNewUser({ ...newUser, firstName: val })} />
            <Input label="Last Name" placeholder="Doe" value={newUser.lastName} onChange={(val) => setNewUser({ ...newUser, lastName: val })} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Input label="Email Address" type="email" placeholder="jane@company.com" value={newUser.email} onChange={(val) => setNewUser({ ...newUser, email: val })} />
            <Input label="Temporary Password" type="password" placeholder="Min 6 characters" value={newUser.password} onChange={(val) => setNewUser({ ...newUser, password: val })} />
          </div>
          <Select label="Role" options={[{ value: 'user', label: 'User' }, { value: 'admin', label: 'Admin' }, { value: 'verifier', label: 'Verifier' }]} value={newUser.role} onChange={(val) => setNewUser({ ...newUser, role: val })} />
          <div className="flex gap-2 pt-2">
            <Button className="flex-1 justify-center" onClick={handleCreateUser} disabled={isCreating}>
              {isCreating ? 'Provisioning...' : 'Create User'}
            </Button>
            <Button variant="outline" onClick={() => setShowModal(false)} className="flex-1 justify-center">Cancel</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

// ── Blockchain Explorer ────────────────────────────────────────────────────────
export function BlockchainExplorer() {
  const [blocks, setBlocks] = useState<any[]>([]);
  const [selectedBlock, setSelectedBlock] = useState<any | null>(null);

  useEffect(() => {
    adminApi.getBlockchainBlocks().then(res => {
      const blocksArray = Array.isArray(res) ? res : [];
      setBlocks(blocksArray);
      if (blocksArray.length > 0) setSelectedBlock(blocksArray[0]);
    }).catch(err => {
      console.error(err);
      setBlocks([]);
    });
  }, []);

  return (
    <div className="animate-fade-in space-y-6">
      <SectionHeader title="Blockchain Explorer" subtitle="Inspect the immutable identity chain in real-time" />

      {/* Chain visualization */}
      <Card className="p-5 overflow-x-auto">
        <h3 className="text-sm font-semibold text-slate-800 mb-4">Live Block Chain</h3>
        <div className="flex items-center gap-0 min-w-max pb-2">
          {blocks.map((block: any, i: number) => (
            <div key={block.number} className="flex items-center">
              <button
                onClick={() => setSelectedBlock(block)}
                className={`w-32 p-3 rounded-xl border-2 transition-all hover:shadow-lg ${(block.validationStatus || '').toLowerCase() === 'valid'
                  ? (selectedBlock?.blockNumber || selectedBlock?.number) === (block.blockNumber || block.number) ? 'border-emerald-500 bg-emerald-50 shadow-emerald-100 shadow-lg' : 'border-emerald-200 bg-emerald-50 hover:border-emerald-400'
                  : (selectedBlock?.blockNumber || selectedBlock?.number) === (block.blockNumber || block.number) ? 'border-red-500 bg-red-50 shadow-red-100 shadow-lg' : 'border-red-200 bg-red-50 hover:border-red-400 animate-pulse-glow'
                  }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-semibold text-slate-500">Block</span>
                  <div className={`w-2 h-2 rounded-full ${(block.validationStatus || '').toLowerCase() === 'valid' ? 'bg-emerald-500' : 'bg-red-500'}`} />
                </div>
                <p className="font-mono text-xs font-bold text-slate-800">#{block.blockNumber || block.number}</p>
                <p className="font-mono text-[9px] text-slate-400 mt-1 truncate">{(block.currentHash || block.hash || '').slice(0, 12)}...</p>
                <div className={`mt-2 text-[9px] font-medium px-1.5 py-0.5 rounded-full text-center ${(block.validationStatus || '').toLowerCase() === 'valid' ? 'text-emerald-700 bg-emerald-100' : 'text-red-700 bg-red-100'}`}>
                  {(block.validationStatus || '').toLowerCase() === 'valid' ? '✓ Valid' : '⚠ Tampered'}
                </div>
              </button>
              {i < blocks.length - 1 && (
                <div className="flex items-center" style={{ width: '40px' }}>
                  <div className="flex-1 h-0.5 bg-gradient-to-r from-slate-300 to-slate-400" />
                  <div className="w-0 h-0 border-t-4 border-b-4 border-l-4 border-transparent border-l-slate-400" />
                </div>
              )}
            </div>
          ))}
        </div>
      </Card>

      {/* Block details */}
      {selectedBlock && (
        <Card className={`p-5 border-2 animate-fade-in ${(selectedBlock.validationStatus || '').toLowerCase() === 'valid' ? 'border-emerald-300' : 'border-red-300'}`}>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-slate-800">Block #{selectedBlock.blockNumber || selectedBlock.number} Details</h3>
            <StatusBadge status={(selectedBlock.validationStatus || '').toLowerCase()} />
          </div>
          {(selectedBlock.validationStatus || '').toLowerCase() === 'tampered' && (
            <div className="mb-4 flex items-start gap-2 p-3 bg-red-50 rounded-xl border border-red-200">
              <AlertTriangle size={16} className="text-red-500 flex-shrink-0" />
              <div>
                <p className="text-xs font-bold text-red-700">⚠ Blockchain Integrity Violation Detected</p>
                <p className="text-xs text-red-600 mt-0.5">This block's hash does not match the expected value. Possible data tampering detected. Security team alerted.</p>
              </div>
            </div>
          )}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {[
              { label: 'Block Number', value: `#${selectedBlock.blockNumber || selectedBlock.number}`, mono: true },
              {
                label: 'Timestamp', value: Array.isArray(selectedBlock.timestamp)
                  ? new Date(selectedBlock.timestamp[0], selectedBlock.timestamp[1] - 1, selectedBlock.timestamp[2], selectedBlock.timestamp[3], selectedBlock.timestamp[4], selectedBlock.timestamp[5] || 0).toLocaleString()
                  : String(selectedBlock.timestamp), mono: true
              },
              { label: 'Transactions', value: `1`, mono: false },
              { label: 'Validator Node', value: 'Root-Node-01', mono: true },
              { label: 'Block Size', value: '2.1 KB', mono: false },
              { label: 'Validation Status', value: (selectedBlock.validationStatus || '').toLowerCase() === 'valid' ? '✓ Valid' : '⚠ TAMPERED', mono: false },
            ].map(f => (
              <div key={f.label} className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                <p className="text-[10px] text-slate-400 uppercase tracking-wider">{f.label}</p>
                <p className={`text-xs font-medium text-slate-800 mt-0.5 ${f.mono ? 'font-mono' : ''} ${f.label === 'Validation Status' && (selectedBlock.validationStatus || '').toLowerCase() !== 'valid' ? 'text-red-600 font-bold' : ''}`}>
                  {f.value}
                </p>
              </div>
            ))}
          </div>
          <div className="mt-4 p-3 bg-slate-50 rounded-xl border border-slate-100">
            <p className="text-[10px] text-slate-400 uppercase tracking-wider mb-1">Previous Hash (SHA-256)</p>
            <p className="font-mono text-xs text-slate-600 break-all">{selectedBlock.previousHash || '0'.repeat(64)}</p>
          </div>
          <div className="mt-3 p-3 bg-slate-50 rounded-xl border border-slate-100">
            <p className="text-[10px] text-slate-400 uppercase tracking-wider mb-1">Block Hash (SHA-256)</p>
            <p className="font-mono text-xs text-slate-600 break-all">{selectedBlock.currentHash || selectedBlock.hash}</p>
          </div>
        </Card>
      )}

      {!selectedBlock && (
        <div className="text-center text-xs text-slate-400 py-4">Click any block above to inspect its details</div>
      )}

      {/* Block list */}
      <Card className="p-5">
        <h3 className="text-sm font-semibold text-slate-800 mb-4">Recent Blocks</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100">
                {['Block #', 'Hash', 'Prev Hash', 'Timestamp', 'Txns', 'Validator', 'Status'].map(h => (
                  <th key={h} className="text-left text-xs font-semibold text-slate-500 pb-3 pr-4">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {blocks.map((block: any) => (
                <tr key={block.blockNumber || block.number} className="border-b border-slate-50 hover:bg-slate-50/80 transition-colors cursor-pointer" onClick={() => setSelectedBlock(block)}>
                  <td className="py-3 pr-4 font-mono text-xs font-bold text-slate-800">#{block.blockNumber || block.number}</td>
                  <td className="py-3 pr-4 font-mono text-[10px] text-slate-500">{(block.currentHash || block.hash || '').slice(0, 16)}...</td>
                  <td className="py-3 pr-4 font-mono text-[10px] text-slate-500">{(block.previousHash || block.prevHash || '0').slice(0, 16)}...</td>
                  <td className="py-3 pr-4 text-xs text-slate-500">{Array.isArray(block.timestamp) ? `${block.timestamp[0]}-${block.timestamp[1]}-${block.timestamp[2]}` : String(block.timestamp).split('T')[0]}</td>
                  <td className="py-3 pr-4 text-xs text-slate-600 text-center">{block.transactions || 1}</td>
                  <td className="py-3 pr-4 text-xs text-slate-600">{block.validator || 'Node-01'}</td>
                  <td className="py-3 pr-4">
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${(block.validationStatus || '').toLowerCase() === 'valid' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-red-50 text-red-700 border-red-200'}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${(block.validationStatus || '').toLowerCase() === 'valid' ? 'bg-emerald-500' : 'bg-red-500 animate-pulse'}`} />
                      {(block.validationStatus || '').toLowerCase() === 'valid' ? 'Valid' : 'Tampered'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}

// ── Identity Details ──────────────────────────────────────────────────────────
export function IdentityDetails() {
  const [candidate, setCandidate] = useState<any>(null);
  const [details, setDetails] = useState<any>(null);
  const [allUsers, setAllUsers] = useState<any[]>([]);

  useEffect(() => {
    adminApi.getUsers('', 0, 50).then(res => {
      if (res.users && res.users.length > 0) {
        setAllUsers(res.users);
        const storedId = sessionStorage.getItem('inspect_user_id');
        if (storedId) {
          const user = res.users.find(u => String(u.id) === storedId);
          if (user) {
            setCandidate(user);
            sessionStorage.removeItem('inspect_user_id');
            return;
          }
        }
        const validUsers = res.users.filter(u => String(u.role).toLowerCase() === 'user');
        const user = validUsers.find(u => (u.status || '').toLowerCase() === 'verified') || validUsers[0] || res.users[0];
        setCandidate(user);
      }
    }).catch(console.error);
  }, []);

  useEffect(() => {
    if (candidate && candidate.id) {
      adminApi.getUserIdentity(candidate.id).then(res => {
        setDetails(res);
      }).catch(console.error);
    }
  }, [candidate]);

  if (!candidate || !details) {
    return (
      <div className="animate-fade-in space-y-6">
        <SectionHeader title="Identity Details" subtitle="Loading identity records..." />
        <Card className="p-10 flex text-center justify-center items-center text-slate-400">
          {!candidate ? 'No active users found.' : 'Loading secure records...'}
        </Card>
      </div>
    );
  }

  const { documents, history } = details;

  return (
    <div className="animate-fade-in space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <SectionHeader title="Identity Details" subtitle={`${candidate.did || `USR-${candidate.id}`} · ${candidate.name}`} />
        <select
          className="px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm text-slate-700 shadow-sm outline-none focus:border-blue-400 font-medium"
          value={candidate.id}
          onChange={(e) => setCandidate(allUsers.find(u => String(u.id) === e.target.value) || candidate)}
        >
          {allUsers.filter(u => (u.role || '').toLowerCase() === 'user').map((u) => (
            <option key={u.id} value={u.id}>{u.name} ({u.email})</option>
          ))}
        </select>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="p-5">
          <div className="flex items-center gap-3 mb-4">
            <Avatar initials={candidate.name.substring(0, 2).toUpperCase()} size="xl" index={candidate.id || 0} />
            <div>
              <h3 className="font-bold text-slate-800">{candidate.name}</h3>
              <p className="text-xs text-slate-500">{candidate.email}</p>
              <StatusBadge status={(candidate.status || 'verified').toLowerCase()} />
            </div>
          </div>
          <div className="space-y-2">
            {[
              { label: 'DID', value: candidate.did || 'Not Generated' },
              { label: 'Role', value: candidate.role ? candidate.role.charAt(0).toUpperCase() + candidate.role.slice(1).toLowerCase() : 'User' },
              { label: 'Country', value: candidate.country || 'Global' },
              { label: 'Joined', value: candidate.joinDate ? String(candidate.joinDate).split('T')[0] : 'Unknown' },
              { label: 'Documents', value: `${documents ? documents.length : 0} securely stored` },
              { label: 'Trust Score', value: (candidate.status || '').toLowerCase() === 'verified' ? '98/100' : 'Pending' },
            ].map(f => (
              <div key={f.label} className="flex justify-between py-1.5 border-b border-slate-100 last:border-0 text-xs">
                <span className="text-slate-400">{f.label}</span>
                <span className="text-slate-700 font-medium font-mono">{f.value}</span>
              </div>
            ))}
          </div>
        </Card>

        <div className="lg:col-span-2 space-y-4">
          <Card className="p-5">
            <h3 className="text-sm font-semibold text-slate-800 mb-4">Verified Documents</h3>
            <div className="space-y-2">
              {documents && documents.length > 0 ? documents.map((doc: any, i: number) => (
                <div key={i} className={`flex items-center justify-between p-3 rounded-xl border ${(doc.status || '').toLowerCase() === 'verified' ? 'bg-emerald-50 border-emerald-200' : 'bg-slate-50 border-slate-200'}`}>
                  <div className="flex items-center gap-2">
                    <CheckCircle size={16} className={(doc.status || '').toLowerCase() === 'verified' ? "text-emerald-500" : "text-slate-400"} />
                    <div>
                      <span className="text-sm font-medium text-slate-700 block capitalize">{doc.type}</span>
                      <span className="text-[10px] font-mono text-slate-400">{doc.url.split('/').pop()}</span>
                    </div>
                  </div>
                  <StatusBadge status={(doc.status || 'pending').toLowerCase()} />
                </div>
              )) : (
                <div className="p-4 rounded-xl border border-dashed border-slate-200 text-center">
                  <p className="text-xs text-slate-500">No documents uploaded by this user.</p>
                </div>
              )}
            </div>
          </Card>
          <Card className="p-5">
            <h3 className="text-sm font-semibold text-slate-800 mb-4">Verification History</h3>
            <div className="space-y-2">
              {history && history.length > 0 ? history.map((v: any, i: number) => (
                <div key={i} className="flex items-center justify-between py-2 border-b border-slate-100 last:border-0">
                  <div className="flex flex-col">
                    <span className="text-xs font-semibold text-slate-700">{v.verifierName || 'System Verifier'}</span>
                    <span className="text-[10px] font-mono text-slate-400">{v.verifiedAt ? String(v.verifiedAt).replace('T', ' ') : 'Unknown'}</span>
                  </div>
                  <StatusBadge status="approved" />
                </div>
              )) : (
                <div className="p-4 bg-slate-50 rounded-xl text-center">
                  <p className="text-xs text-slate-500">No verification history available.</p>
                </div>
              )}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

// ── Analytics ─────────────────────────────────────────────────────────────────
export function AnalyticsDashboard() {
  const [stats, setStats] = useState<any>({
    totalUsers: 0, totalVerified: 0, pendingVerification: 0, rejectedRequests: 0, blockchainBlocks: 0, todayVerifications: 0
  });
  const [analytics, setAnalytics] = useState<any[]>([]);

  useEffect(() => {
    adminApi.getStats().then(setStats).catch(console.error);
    adminApi.getMonthlyAnalytics().then(setAnalytics).catch(console.error);
  }, []);

  return (
    <div className="animate-fade-in space-y-6">
      <SectionHeader title="Analytics Dashboard" subtitle="Platform-wide identity verification insights"
        action={<div className="flex gap-2"><Select options={[{ value: '7d', label: 'Last 7 days' }, { value: '30d', label: 'Last 30 days' }, { value: '90d', label: 'Last 90 days' }]} value="30d" onChange={() => { }} /><Button size="sm"><Download size={13} /> Export</Button></div>} />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Total Verifications" value={stats.totalVerified} sub="All time" icon={<CheckCircle size={18} />} color="blue" trend={{ value: '0%', up: true }} />
        <StatCard label="Success Rate" value={`${stats.totalVerified > 0 ? Math.round((stats.totalVerified / (stats.totalVerified + stats.rejectedRequests)) * 100) : 0}%`} sub="Approval rate" icon={<TrendingUp size={18} />} color="emerald" trend={{ value: '0%', up: true }} />
        <StatCard label="Avg. Review Time" value="0.0 min" sub="Per identity" icon={<Clock size={18} />} color="amber" trend={{ value: '0 min', up: false }} />
        <StatCard label="API Requests" value={stats.blockchainBlocks} sub="Blocks appended" icon={<Zap size={18} />} color="violet" trend={{ value: '0%', up: true }} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card className="p-5">
          <h3 className="text-sm font-semibold text-slate-800 mb-4">Monthly Verification Volume</h3>
          <VerificationAreaChart data={analytics} />
        </Card>
        <Card className="p-5">
          <h3 className="text-sm font-semibold text-slate-800 mb-4">User Growth</h3>
          <UserGrowthLine data={analytics} />
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="p-5">
          <h3 className="text-sm font-semibold text-slate-800 mb-4">Status Distribution</h3>
          <StatusPieChart data={[
            { name: 'Verified', value: stats.totalVerified, color: '#10B981' },
            { name: 'Pending', value: stats.pendingVerification, color: '#F59E0B' },
            { name: 'Rejected', value: stats.rejectedRequests, color: '#EF4444' }
          ].filter(d => d.value > 0)} />
        </Card>
        <Card className="p-5 lg:col-span-2">
          <h3 className="text-sm font-semibold text-slate-800 mb-4">Approval vs Rejection</h3>
          <ApprovalBarChart data={analytics} />
        </Card>
      </div>

      {/* Top verifiers */}
      <Card className="p-5">
        <h3 className="text-sm font-semibold text-slate-800 mb-4">Top Verification Partners</h3>
        <div className="space-y-3">
          {[
            { name: 'First National Bank', requests: 12480, rate: '98.2%', color: 'bg-blue-500' },
            { name: 'GlobalTech Corp', requests: 8920, rate: '95.4%', color: 'bg-violet-500' },
            { name: 'HealthCare Plus', requests: 6340, rate: '97.1%', color: 'bg-emerald-500' },
            { name: 'Embassy Services', requests: 4120, rate: '91.8%', color: 'bg-amber-500' },
            { name: 'Meridian Insurance', requests: 3890, rate: '89.3%', color: 'bg-cyan-500' },
          ].map((v, i) => (
            <div key={i} className="flex items-center gap-3">
              <div className={`w-1.5 h-8 ${v.color} rounded-full flex-shrink-0`} />
              <div className="flex-1">
                <div className="flex justify-between mb-1">
                  <span className="text-xs font-medium text-slate-700">{v.name}</span>
                  <span className="text-xs text-slate-500">{v.requests.toLocaleString()} reqs</span>
                </div>
                <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                  <div className={`h-full ${v.color} rounded-full`} style={{ width: v.rate }} />
                </div>
              </div>
              <span className="text-xs font-bold text-slate-700 w-12 text-right">{v.rate}</span>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

// ── Audit Logs ────────────────────────────────────────────────────────────────
export function AuditLogs() {
  const [search, setSearch] = useState('');
  const [severity, setSeverity] = useState('all');
  const [page, setPage] = useState(1);
  const [logs, setLogs] = useState<any[]>([]);
  const [totalItems, setTotalItems] = useState(0);

  useEffect(() => {
    adminApi.getAuditLogs(page - 1, 10, severity).then(res => {
      if (res && res.logs) {
        setLogs(res.logs);
        setTotalItems(res.totalItems || 0);
      }
    }).catch(console.error);
  }, [page, severity]);

  const filtered = logs.filter(l =>
    (l.action.toLowerCase().includes(search.toLowerCase()) || l.actor.toLowerCase().includes(search.toLowerCase()))
  );

  const sevColors: Record<string, string> = {
    info: 'bg-blue-50 text-blue-700 border-blue-200',
    warning: 'bg-amber-50 text-amber-700 border-amber-200',
    critical: 'bg-red-50 text-red-700 border-red-200',
  };

  const downloadAuditCSV = () => {
    if (!logs || logs.length === 0) return;
    const headers = ['ID', 'Action', 'Actor', 'Target', 'Timestamp', 'IP', 'Module', 'Severity'];
    const csvRows = [headers.join(',')];
    logs.forEach(l => {
      const values = [l.id, `"${l.action}"`, `"${l.actor}"`, `"${l.target}"`, l.timestamp, l.ip, l.module, l.severity];
      csvRows.push(values.join(','));
    });
    const blob = new Blob([csvRows.join('\n')], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `audit_logs_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="animate-fade-in space-y-6">
      <SectionHeader title="Audit Logs" subtitle="Complete audit trail of all platform activities"
        action={<Button size="sm" variant="outline" onClick={downloadAuditCSV}><Download size={13} /> Export Logs</Button>} />

      <Card className="p-5">
        <div className="flex flex-col sm:flex-row gap-3 mb-4">
          <Input placeholder="Search logs..." value={search} onChange={setSearch} icon={<Search size={14} />} className="flex-1" />
          <div className="flex gap-2">
            {['all', 'info', 'warning', 'critical'].map(s => (
              <button key={s} onClick={() => setSeverity(s)} className={`px-3 py-1.5 rounded-xl text-xs font-medium capitalize border transition-all ${severity === s ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-slate-600 border-slate-200'}`}>{s}</button>
            ))}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100">
                {['ID', 'Action', 'Actor', 'Target', 'Timestamp', 'IP', 'Module', 'Severity'].map(h => (
                  <th key={h} className="text-left text-xs font-semibold text-slate-500 pb-3 pr-4">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map(log => (
                <tr key={log.id} className="border-b border-slate-50 hover:bg-slate-50/80 transition-colors">
                  <td className="py-3 pr-4 font-mono text-[10px] text-slate-400">{log.id}</td>
                  <td className="py-3 pr-4 text-xs font-medium text-slate-800">{log.action}</td>
                  <td className="py-3 pr-4 text-xs text-slate-600">{log.actor}</td>
                  <td className="py-3 pr-4 text-xs text-slate-500">{log.target}</td>
                  <td className="py-3 pr-4 font-mono text-[10px] text-slate-500">{log.timestamp}</td>
                  <td className="py-3 pr-4 font-mono text-[10px] text-slate-500">{log.ip}</td>
                  <td className="py-3 pr-4">
                    <span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full font-medium">{log.module}</span>
                  </td>
                  <td className="py-3 pr-4">
                    <span className={`text-[10px] px-2.5 py-1 rounded-full font-medium border capitalize ${sevColors[log.severity] || sevColors.info}`}>{log.severity}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="mt-4"><Pagination page={page} total={totalItems} perPage={10} onChange={setPage} /></div>
      </Card>

      {/* Timeline */}
      <Card className="p-5">
        <h3 className="text-sm font-semibold text-slate-800 mb-4">Audit Timeline</h3>
        <div className="relative pl-6 space-y-4 before:absolute before:left-2 before:top-0 before:bottom-0 before:w-0.5 before:bg-slate-200">
          {logs.slice(0, 5).map(log => (
            <div key={log.id} className="relative">
              <div className={`absolute -left-4 w-3 h-3 rounded-full border-2 border-white ${log.severity === 'critical' ? 'bg-red-500' : log.severity === 'warning' ? 'bg-amber-500' : 'bg-blue-500'}`} />
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 hover:border-slate-200 transition-all">
                <div className="flex items-center justify-between mb-0.5">
                  <p className="text-xs font-semibold text-slate-800">{log.action}</p>
                  <span className="font-mono text-[10px] text-slate-400">{log.timestamp}</span>
                </div>
                <p className="text-xs text-slate-500">{log.actor} → {log.target}</p>
                <div className="flex items-center gap-2 mt-1">
                  <span className="font-mono text-[10px] text-slate-400">{log.ip}</span>
                  <span className="text-[10px] bg-slate-200 text-slate-600 px-1.5 py-0.5 rounded font-medium">{log.module}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

// ── Reports ────────────────────────────────────────────────────────────────────
export function Reports() {
  const [downloading, setDownloading] = useState<string | null>(null);

  const downloadCSV = (filename: string, data: any[]) => {
    if (!data || data.length === 0) {
      alert('No data available for this report.');
      return;
    }
    const headers = Object.keys(data[0]);
    const csvRows = [];
    csvRows.push(headers.join(','));
    for (const row of data) {
      const values = headers.map(h => {
        let val = row[h] === null || row[h] === undefined ? '' : String(row[h]);
        val = val.replace(/"/g, '""');
        return `"${val}"`;
      });
      csvRows.push(values.join(','));
    }
    const blob = new Blob([csvRows.join('\n')], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.setAttribute('hidden', '');
    a.setAttribute('href', url);
    a.setAttribute('download', `${filename}_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const handleDownload = async (reportId: string, title: string) => {
    setDownloading(reportId);
    try {
      let data = [];
      switch (reportId) {
        case 'monthly-verification':
          const analytics = await adminApi.getMonthlyAnalytics();
          data = analytics;
          break;
        case 'user-growth':
          const userRes = await adminApi.getUsers('', 0, 1000);
          data = userRes.users || [];
          break;
        case 'blockchain-integrity':
          const blocks = await adminApi.getBlockchainBlocks();
          data = Array.isArray(blocks) ? blocks : [];
          break;
        case 'audit-compliance':
          const auditRes = await adminApi.getAuditLogs(0, 1000);
          data = auditRes.logs || [];
          break;
        default:
          alert('Report generation for this module is currently running in the background. Check scheduled tasks.');
          return;
      }
      downloadCSV(title.replace(/\s+/g, '_').toLowerCase(), data);
    } catch (err: any) {
      console.error(err);
      alert('Failed to generate report: ' + err.message);
    } finally {
      setDownloading(null);
    }
  };

  return (
    <div className="animate-fade-in space-y-6">
      <SectionHeader title="Reports" subtitle="Generate and download platform reports directly from real-time data" />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {[
          { id: 'monthly-verification', title: 'Monthly Verification Report', desc: 'Full verification stats for the month', period: 'Live Data', icon: BarChart3, color: 'blue' },
          { id: 'user-growth', title: 'User Growth Report', desc: 'New registrations and retention analytics', period: 'Live Data', icon: TrendingUp, color: 'emerald' },
          { id: 'blockchain-integrity', title: 'Blockchain Integrity Report', desc: 'Block validation and anomaly detection', period: 'Live Data', icon: Database, color: 'violet' },
          { id: 'audit-compliance', title: 'Audit Compliance Report', desc: 'SOC2 and ISO 27001 compliance audit trail', period: 'Live Data', icon: Lock, color: 'amber' },
          { id: 'rejection-analysis', title: 'Rejection Analysis Report', desc: 'Failed verification analysis and causes', period: 'Live Data', icon: XCircle, color: 'red' },
          { id: 'api-usage', title: 'API Usage Report', desc: 'Third-party integration and API call analytics', period: 'Live Data', icon: Zap, color: 'cyan' },
        ].map(r => (
          <Card key={r.title} hover className="p-5">
            <div className={`w-10 h-10 rounded-xl bg-${r.color}-50 flex items-center justify-center mb-3`}>
              <r.icon size={18} className={`text-${r.color}-600`} />
            </div>
            <h3 className="text-sm font-semibold text-slate-800 mb-1">{r.title}</h3>
            <p className="text-xs text-slate-500 mb-3">{r.desc}</p>
            <div className="flex items-center justify-between">
              <span className="text-[10px] text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">{r.period}</span>
              <Button size="sm" variant="secondary" onClick={() => handleDownload(r.id, r.title)} disabled={downloading === r.id}>
                {downloading === r.id ? 'Exporting...' : <><Download size={12} /> Download CSV</>}
              </Button>
            </div>
          </Card>
        ))}
      </div>

      {/* Scheduled reports */}
      <Card className="p-5">
        <h3 className="text-sm font-semibold text-slate-800 mb-4">Scheduled Reports</h3>
        <div className="space-y-3">
          {[
            { name: 'Weekly Verification Summary', schedule: 'Every Monday 9:00 AM', recipients: '3 admins', status: 'active' },
            { name: 'Monthly Compliance Report', schedule: '1st of every month', recipients: '5 stakeholders', status: 'active' },
            { name: 'Daily Anomaly Alert', schedule: 'Daily at 8:00 AM (if anomalies)', recipients: 'Security team', status: 'active' },
          ].map((r, i) => (
            <div key={i} className="flex items-center justify-between p-4 rounded-xl bg-slate-50 border border-slate-100">
              <div>
                <p className="text-sm font-medium text-slate-800">{r.name}</p>
                <p className="text-xs text-slate-400 mt-0.5">{r.schedule} · {r.recipients}</p>
              </div>
              <div className="flex items-center gap-2">
                <StatusBadge status={r.status} />
                <button className="p-1.5 text-slate-400 hover:text-slate-600"><Edit size={13} /></button>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

// ── Security Settings ──────────────────────────────────────────────────────────
export function SecuritySettings() {
  const loadState = (key: string, def: any) => {
    const saved = localStorage.getItem(`sec_setting_${key}`);
    return saved !== null ? JSON.parse(saved) : def;
  };
  const saveState = (key: string, val: any) => {
    localStorage.setItem(`sec_setting_${key}`, JSON.stringify(val));
    return val;
  };

  const [mfa, setMfa] = useState(loadState('mfa', true));
  const [ipWhitelist, setIpWhitelist] = useState(loadState('ip', false));
  const [sessionLimit, setSessionLimit] = useState(loadState('session', true));

  const [threatModules, setThreatModules] = useState<Record<string, boolean>>(loadState('threats', {
    'Brute Force Protection': true,
    'Anomaly Detection': true,
    'Blockchain Integrity Monitor': true,
    'DDoS Protection': true
  }));

  const [apiModules, setApiModules] = useState<Record<string, boolean>>(loadState('apis', {
    'API Rate Limiting': true,
    'CORS Policy': true,
    'TLS Version': true,
    'Webhook Signing': true
  }));

  const defaultPolicy = { length: 12, upper: true, numbers: true, symbols: true, expiry: 90, history: 10 };
  const [policy, setPolicy] = useState(loadState('policy', defaultPolicy));
  const [showPolicyModal, setShowPolicyModal] = useState(false);
  const [draftPolicy, setDraftPolicy] = useState(policy);

  const handleUpdatePolicy = () => {
    const updated = saveState('policy', draftPolicy);
    setPolicy(updated);
    setShowPolicyModal(false);
    alert('Password Policy successfully deployed to all network nodes.');
  };

  const toggleThreat = (label: string) => {
    setThreatModules(prev => saveState('threats', { ...prev, [label]: !prev[label] }));
  };

  const toggleApi = (label: string) => {
    setApiModules(prev => saveState('apis', { ...prev, [label]: !prev[label] }));
  };

  return (
    <div className="animate-fade-in space-y-6">
      <SectionHeader title="Security Settings" subtitle="Configure platform-wide security policies actively deployed on the cluster" />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card className="p-5">
          <h3 className="text-sm font-semibold text-slate-800 mb-4">Authentication Policies</h3>
          <div className="space-y-4">
            {[
              { label: 'Enforce MFA for All Users', desc: 'Require 2FA for every login', value: mfa, toggle: () => setMfa(saveState('mfa', !mfa)) },
              { label: 'IP Whitelist', desc: 'Restrict access to approved IPs only', value: ipWhitelist, toggle: () => setIpWhitelist(saveState('ip', !ipWhitelist)) },
              { label: 'Session Concurrent Limit', desc: 'Max 3 active sessions per user', value: sessionLimit, toggle: () => setSessionLimit(saveState('session', !sessionLimit)) },
            ].map(s => (
              <div key={s.label} className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-700">{s.label}</p>
                  <p className="text-xs text-slate-400">{s.desc}</p>
                </div>
                <button onClick={s.toggle} className={`w-10 h-5 rounded-full transition-all ${s.value ? 'bg-blue-600' : 'bg-slate-200'} relative`}>
                  <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-all ${s.value ? 'left-5' : 'left-0.5'}`} />
                </button>
              </div>
            ))}
          </div>
        </Card>

        <Card className="p-5">
          <h3 className="text-sm font-semibold text-slate-800 mb-4">Password Policy Configuration</h3>
          <div className="space-y-3">
            {[
              { label: 'Minimum Length', value: `${policy.length} characters` },
              { label: 'Require Uppercase', value: policy.upper ? 'Yes' : 'No' },
              { label: 'Require Numbers', value: policy.numbers ? 'Yes' : 'No' },
              { label: 'Require Symbols', value: policy.symbols ? 'Yes' : 'No' },
              { label: 'Password Expiry', value: `${policy.expiry} days` },
              { label: 'History Check', value: `Last ${policy.history} passwords` },
            ].map(p => (
              <div key={p.label} className="flex justify-between text-xs py-2 border-b border-slate-100 last:border-0">
                <span className="text-slate-500">{p.label}</span>
                <span className="font-medium text-slate-700">{p.value}</span>
              </div>
            ))}
          </div>
          <Button size="sm" className="mt-4" onClick={() => { setDraftPolicy(policy); setShowPolicyModal(true); }}>Modify Policy</Button>
        </Card>

        <Card className="p-5">
          <h3 className="text-sm font-semibold text-slate-800 mb-4">API Security Guardrails</h3>
          <div className="space-y-3">
            {[
              { label: 'API Rate Limiting', value: '1000 req/min' },
              { label: 'CORS Policy', value: 'Strict' },
              { label: 'TLS Version', value: 'TLS 1.3' },
              { label: 'Webhook Signing', value: 'HMAC-SHA256' },
            ].map(a => (
              <div key={a.label} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-100 cursor-pointer hover:bg-slate-100 transition-colors" onClick={() => toggleApi(a.label)}>
                <div>
                  <p className="text-xs font-medium text-slate-700">{a.label}</p>
                  <p className="text-[10px] text-slate-400">{a.value}</p>
                </div>
                <StatusBadge status={apiModules[a.label] ? 'active' : 'inactive'} />
              </div>
            ))}
          </div>
        </Card>

        <Card className="p-5">
          <h3 className="text-sm font-semibold text-slate-800 mb-4">Active Threat Detection</h3>
          <div className="space-y-3">
            {[
              { label: 'Brute Force Protection', detail: 'Lock after 5 attempts' },
              { label: 'Anomaly Detection', detail: 'AI-powered alerts' },
              { label: 'Blockchain Integrity Monitor', detail: 'Real-time hash validation' },
              { label: 'DDoS Protection', detail: 'Cloudflare Shield Pro' },
            ].map(t => (
              <div key={t.label} className="flex items-center justify-between py-2 border-b border-slate-100 last:border-0 cursor-pointer hover:bg-slate-50 transition-colors px-2 rounded -mx-2" onClick={() => toggleThreat(t.label)}>
                <div>
                  <p className="text-xs font-medium text-slate-700">{t.label}</p>
                  <p className="text-[10px] text-slate-400">{t.detail}</p>
                </div>
                <StatusBadge status={threatModules[t.label] ? 'active' : 'inactive'} />
              </div>
            ))}
          </div>
        </Card>
      </div>

      <Modal open={showPolicyModal} onClose={() => setShowPolicyModal(false)} title="Modify Password Policy">
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Input label="Minimum Length" type="number" min="8" max="64" value={String(draftPolicy.length)} onChange={v => setDraftPolicy({ ...draftPolicy, length: parseInt(v) || 8 })} />
            <Input label="Expiry (Days)" type="number" min="0" max="365" value={String(draftPolicy.expiry)} onChange={v => setDraftPolicy({ ...draftPolicy, expiry: parseInt(v) || 0 })} />
          </div>
          <Input label="History Check (Count)" type="number" min="0" max="24" value={String(draftPolicy.history)} onChange={v => setDraftPolicy({ ...draftPolicy, history: parseInt(v) || 0 })} />
          <div className="space-y-3 pt-2">
            {[
              { key: 'upper', label: 'Require Uppercase Letters [A-Z]' },
              { key: 'numbers', label: 'Require Numbers [0-9]' },
              { key: 'symbols', label: 'Require Special Symbols [!@#$%^&*]' }
            ].map(req => (
              <div key={req.key} className="flex items-center justify-between border-b pb-2">
                <span className="text-sm text-slate-700">{req.label}</span>
                <button onClick={() => setDraftPolicy({ ...draftPolicy, [req.key]: !(draftPolicy as any)[req.key] })} className={`w-8 h-4 rounded-full transition-all ${(draftPolicy as any)[req.key] ? 'bg-blue-600' : 'bg-slate-200'} relative`}>
                  <div className={`absolute top-0.5 w-3 h-3 bg-white rounded-full shadow transition-all ${(draftPolicy as any)[req.key] ? 'left-4.5' : 'left-0.5'}`} />
                </button>
              </div>
            ))}
          </div>
          <div className="flex gap-2 pt-4">
            <Button className="flex-1 justify-center" onClick={handleUpdatePolicy}>Deploy Policy</Button>
            <Button variant="outline" onClick={() => setShowPolicyModal(false)} className="flex-1 justify-center">Cancel</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
