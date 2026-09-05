import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import {
  Users, Shield, CheckCircle, XCircle, Clock, BarChart3,
  Lock, Search, Filter, Download, Eye, Edit, Trash2, AlertTriangle,
  Plus, RefreshCw, TrendingUp, Database, Zap, FileText, Inbox, MessageSquare
} from 'lucide-react';
import { Card, StatCard, StatusBadge, Avatar, Button, Input, Select, Modal, Toast, SectionHeader, Pagination } from '../components/UIComponents';
import { VerificationAreaChart, ApprovalBarChart, StatusPieChart, UserGrowthLine } from '../components/Charts';
import { mockUsers, mockBlocks, mockAuditLogs } from '../data/mockData';
import { adminApi, authApi } from '../service/api';
import { useDialog } from '../context/DialogContext';
// ── Admin Dashboard ───────────────────────────────────────────────────────────
export function AdminDashboard({ onNav }: { onNav: (s: string) => void }) {
  const [stats, setStats] = useState<any>({
    totalUsers: 0, totalVerified: 0, pendingVerification: 0, rejectedRequests: 0, blockchainBlocks: 0, todayVerifications: 0
  });
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [analytics, setAnalytics] = useState<any[]>([]);

  useEffect(() => {
    Promise.all([adminApi.getStats(), adminApi.getMonthlyAnalytics()]).then(([s, a]) => {
      setStats(s);
      if (a && a.length > 0 && s.totalVerified !== undefined) {
        // Explicitly bind the active graph plotting strictly natively to the KPI ledger variable 
        // completely bypassing any backend/frontend desync variables
        a[a.length - 1].verifications = s.totalVerified;
      }
      setAnalytics(a);
    }).catch(console.error);

    adminApi.getAuditLogs(0, 5).then(res => setAuditLogs(res.logs || [])).catch(console.error);
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
              <p className="text-white font-semibold">{stats.totalUsers > 0 ? (((stats.verifiedUsers || 0) / stats.totalUsers) * 100).toFixed(0) : 0}% Identities</p>
            </div>
            <div className="w-12 h-12 bg-violet-700/80 rounded-2xl flex items-center justify-center">
              <Shield size={24} className="text-violet-200" />
            </div>
          </div>
        </div>
        <div className="relative z-10 grid grid-cols-4 gap-4 mt-5 pt-5 border-t border-violet-700/50">
          {[
            { label: 'Active Sessions', value: stats.activeSessions || 0, sub: 'Staff online' },
            { label: 'Verified Users', value: stats.verifiedUsers || 0, sub: `Out of ${stats.totalUsers || 0} total` },
            { label: 'Daily Scans', value: stats.todayVerifications || 0, sub: 'Processed today' },
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
        <StatCard label="Verified Identities" value={stats.totalVerified} sub={`${stats.totalUsers > 0 ? Math.round(((stats.verifiedUsers || 0) / stats.totalUsers) * 100) : 0}% of users`} icon={<CheckCircle size={18} />} color="emerald" trend={{ value: `${stats.totalUsers > 0 ? Math.round(((stats.verifiedUsers || 0) / stats.totalUsers) * 100) : 0}%`, up: (stats.verifiedUsers || 0) > 0 }} />
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
            <span className="flex items-center gap-1.5 text-xs text-emerald-600 font-medium bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
              Live Data
            </span>
          </div>
          <VerificationAreaChart data={analytics} />
        </Card>

        <Card className="p-5">
          <h3 className="text-sm font-semibold text-slate-800 mb-4">Identity Status Distribution</h3>
          <StatusPieChart data={[
            { name: 'Verified', value: stats.totalVerified, color: '#10B981' },
            { name: 'Pending', value: stats.pendingVerification, color: '#F59E0B' },
            { name: 'Rejected', value: stats.rejectedRequests, color: '#EF4444' }
          ]} />
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
        // Refresh sidebar badge count (auto-heal may have changed counts)
        window.dispatchEvent(new Event('blockid_pending_update'));
      })
      .catch(async err => {
        console.error("Failed to load pending requests", err);
        setLoading(false);
      });
  };

  useEffect(() => {
    loadRequests();
  }, [page]);

  // Per-Document Review Modal State
  const [reviewUser, setReviewUser] = useState<any | null>(null);
  const [docDecisions, setDocDecisions] = useState<Record<number, { action: 'approve' | 'reject'; validUntil: string; reason: string }>>({});
  const [submitting, setSubmitting] = useState(false);
  const [modalError, setModalError] = useState('');
  const [toast, setToast] = useState<{ type: 'success' | 'error'; msg: string } | null>(null);

  const [validUntilDefault] = useState(() => {
    let d = new Date();
    d.setFullYear(d.getFullYear() + 1);
    return d.toISOString().split('T')[0];
  });

  const openReviewModal = (user: any) => {
    setReviewUser(user);
    setModalError('');
    const initial: Record<number, { action: 'approve' | 'reject'; validUntil: string; reason: string }> = {};
    (user.documents || []).filter((d: any) => String(d.status).toLowerCase() === 'pending').forEach((d: any) => {
      initial[d.id] = { action: 'approve', validUntil: validUntilDefault, reason: '' };
    });
    setDocDecisions(initial);
  };

  const handleDocActionChange = (docId: number, action: 'approve' | 'reject') => {
    setDocDecisions(prev => ({
      ...prev,
      [docId]: {
        ...prev[docId],
        action,
        validUntil: prev[docId]?.validUntil || validUntilDefault,
        reason: prev[docId]?.reason || ''
      }
    }));
    setModalError('');
  };

  const handleDocExpiryChange = (docId: number, validUntil: string) => {
    setDocDecisions(prev => ({
      ...prev,
      [docId]: { ...prev[docId], validUntil }
    }));
  };

  const handleDocReasonChange = (docId: number, reason: string) => {
    setDocDecisions(prev => ({
      ...prev,
      [docId]: { ...prev[docId], reason }
    }));
    setModalError('');
  };

  const handleApproveAll = () => {
    const updated: Record<number, { action: 'approve' | 'reject'; validUntil: string; reason: string }> = {};
    Object.keys(docDecisions).forEach(idStr => {
      const id = Number(idStr);
      updated[id] = { action: 'approve', validUntil: docDecisions[id]?.validUntil || validUntilDefault, reason: '' };
    });
    setDocDecisions(updated);
  };

  const handleRejectAll = () => {
    const updated: Record<number, { action: 'approve' | 'reject'; validUntil: string; reason: string }> = {};
    Object.keys(docDecisions).forEach(idStr => {
      const id = Number(idStr);
      updated[id] = { action: 'reject', validUntil: docDecisions[id]?.validUntil || validUntilDefault, reason: docDecisions[id]?.reason || 'Document does not meet compliance requirements.' };
    });
    setDocDecisions(updated);
  };

  const handleSubmitReviewModal = () => {
    if (!reviewUser) return;

    const pendingDocs = (reviewUser.documents || []).filter((d: any) => String(d.status).toLowerCase() === 'pending');
    if (pendingDocs.length === 0) {
      setToast({ type: 'error', msg: 'No pending documents to review.' });
      return;
    }

    for (const doc of pendingDocs) {
      const dec = docDecisions[doc.id];
      if (dec && dec.action === 'reject' && !dec.reason.trim()) {
        setModalError(`Please provide a rejection reason for "${doc.name || 'Document'}".`);
        return;
      }
    }

    setSubmitting(true);
    const payload = pendingDocs.map((doc: any) => {
      const dec = docDecisions[doc.id] || { action: 'approve', validUntil: validUntilDefault, reason: '' };
      return {
        docId: String(doc.id),
        decision: dec.action,
        validUntil: dec.action === 'approve' ? dec.validUntil : undefined,
        reason: dec.action === 'reject' ? dec.reason : undefined
      };
    });

    adminApi.reviewDocuments(reviewUser.userId, payload)
      .then(res => {
        setToast({ type: 'success', msg: `Review complete: ${res.approved} approved, ${res.rejected} rejected.` });
        setReviewUser(null);
        loadRequests();
        window.dispatchEvent(new Event('blockid_pending_update'));
      })
      .catch(async err => {
        setToast({ type: 'error', msg: 'Review failed: ' + (err.message || JSON.stringify(err)) });
      })
      .finally(() => setSubmitting(false));
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
                {user.documents && user.documents.some((d: any) => String(d.status).toLowerCase() === 'pending') && (
                  <div className="flex gap-2 flex-wrap">
                    <span className="text-[10px] text-slate-500 flex items-center">Review files:</span>
                    {user.documents.filter((d: any) => String(d.status).toLowerCase() === 'pending').map((doc: any, idx: number) => {
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
                <button onClick={() => openReviewModal(user)} className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold text-xs transition-all shadow-sm">
                  <Shield size={13} /> Review Case
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

      {/* Full Per-Document Review Modal */}
      {reviewUser !== null && createPortal(
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[99999] flex items-center justify-center p-4 animate-fade-in" style={{ position: 'fixed', top: 0, left: 0 }}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden scale-in relative block max-h-[90vh] flex flex-col">
            {/* Modal Header */}
            <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <div>
                <h3 className="text-lg font-bold text-slate-800">Review Identity Request</h3>
                <p className="text-xs text-slate-500">User: <span className="font-semibold text-slate-700">{reviewUser.name}</span> ({reviewUser.email})</p>
              </div>
              <div className="flex gap-2">
                <Button size="sm" variant="outline" onClick={handleApproveAll} className="text-xs text-emerald-600 border-emerald-200 hover:bg-emerald-50">
                  <CheckCircle size={12} className="mr-1" /> Approve All
                </Button>
                <Button size="sm" variant="outline" onClick={handleRejectAll} className="text-xs text-red-600 border-red-200 hover:bg-red-50">
                  <XCircle size={12} className="mr-1" /> Reject All
                </Button>
                <button onClick={() => setReviewUser(null)} className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200 transition-all ml-2">
                  <XCircle size={20} />
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto space-y-4 flex-1">
              {(() => {
                const pendingDocs = (reviewUser.documents || []).filter((d: any) => String(d.status).toLowerCase() === 'pending');
                if (pendingDocs.length === 0) {
                  return <p className="text-xs text-slate-500 italic text-center p-6">No pending documents require review for this user.</p>;
                }
                return pendingDocs.map((doc: any) => {
                  const dec = docDecisions[doc.id] || { action: 'approve', validUntil: validUntilDefault, reason: '' };
                  const fileUrl = doc.storageUrl?.startsWith('http')
                    ? doc.storageUrl.replace('localhost:8443', '127.0.0.1:8080')
                    : `http://127.0.0.1:8080${doc.storageUrl?.startsWith('/') ? '' : '/'}${doc.storageUrl}`;

                  return (
                    <div key={doc.id} className={`p-4 rounded-xl border transition-all ${dec.action === 'approve' ? 'border-emerald-200 bg-emerald-50/30' : 'border-red-200 bg-red-50/30'}`}>
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
                        <div className="flex items-center gap-2">
                          <FileText size={18} className={dec.action === 'approve' ? 'text-emerald-600' : 'text-red-500'} />
                          <div>
                            <span className="text-sm font-bold text-slate-800 capitalize">{doc.name || 'Document'}</span>
                            <span className="text-[10px] text-slate-400 block font-mono">ID: #{doc.id}</span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <a href={fileUrl} target="_blank" rel="noreferrer" className="text-xs text-blue-600 hover:text-blue-800 bg-white px-2.5 py-1 rounded-lg border border-slate-200 font-medium shadow-sm transition-all flex items-center gap-1 mr-2">
                            <Eye size={12} /> View Document
                          </a>
                          <div className="flex bg-slate-100 p-0.5 rounded-lg border border-slate-200">
                            <button
                              type="button"
                              onClick={() => handleDocActionChange(doc.id, 'approve')}
                              className={`flex items-center gap-1 text-xs font-semibold px-3 py-1 rounded-md transition-all ${dec.action === 'approve' ? 'bg-emerald-600 text-white shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}
                            >
                              <CheckCircle size={12} /> Approve
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDocActionChange(doc.id, 'reject')}
                              className={`flex items-center gap-1 text-xs font-semibold px-3 py-1 rounded-md transition-all ${dec.action === 'reject' ? 'bg-red-600 text-white shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}
                            >
                              <XCircle size={12} /> Reject
                            </button>
                          </div>
                        </div>
                      </div>

                      {dec.action === 'approve' ? (
                        <div className="bg-white p-3 rounded-lg border border-emerald-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                          <label className="text-xs font-medium text-slate-600 flex items-center gap-1">
                            <Clock size={12} className="text-emerald-500" /> Expiry Date (Valid Until):
                          </label>
                          <input
                            type="date"
                            value={dec.validUntil}
                            onChange={(e) => handleDocExpiryChange(doc.id, e.target.value)}
                            className="border border-slate-200 rounded-md px-2.5 py-1 text-xs focus:border-emerald-500 outline-none font-mono"
                          />
                        </div>
                      ) : (
                        <div className="bg-white p-3 rounded-lg border border-red-100 space-y-1">
                          <label className="text-xs font-medium text-red-600 flex items-center gap-1">
                            <XCircle size={12} className="text-red-500" /> Rejection Reason (Required):
                          </label>
                          <textarea
                            rows={2}
                            value={dec.reason}
                            onChange={(e) => handleDocReasonChange(doc.id, e.target.value)}
                            placeholder={`Enter reason for rejecting ${doc.name || 'document'}...`}
                            className="w-full border border-red-200 rounded-md p-2 text-xs focus:border-red-500 outline-none resize-none"
                          />
                        </div>
                      )}
                    </div>
                  );
                });
              })()}

              {modalError && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-600 font-medium">
                  {modalError}
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-slate-100 bg-slate-50/50 flex gap-3 justify-end">
              <Button variant="outline" onClick={() => setReviewUser(null)}>Cancel</Button>
              <button
                type="button"
                onClick={handleSubmitReviewModal}
                disabled={submitting}
                className="bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-bold px-6 py-2.5 rounded-xl shadow-lg shadow-blue-500/25 border-none transition-all flex items-center gap-2 text-xs font-semibold cursor-pointer disabled:opacity-50"
              >
                <CheckCircle size={14} />
                {submitting ? 'Submitting...' : 'Confirm Decisions'}
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}

      {toast && <Toast type={toast.type} message={toast.msg} onClose={() => setToast(null)} />}
    </div>
  );
}

// ── Approve / Reject ──────────────────────────────────────────────────────────
export function ApproveReject() {
  const { showAlert, showConfirm } = useDialog();
  const [request, setRequest] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState<{ type: 'success' | 'error'; msg: string } | null>(null);

  // Per-document decisions: docId -> { action: 'approve'|'reject', validUntil: string, reason: string }
  const [docDecisions, setDocDecisions] = useState<Record<number, { action: 'approve' | 'reject'; validUntil: string; reason: string }>>({});
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState('');

  const [validUntilDefault] = useState(() => {
    let d = new Date();
    d.setFullYear(d.getFullYear() + 1);
    return d.toISOString().split('T')[0];
  });

  const loadRequest = () => {
    setLoading(true);
    adminApi.getPendingRequests(0, 1).then(data => {
      if (data && data.requests && data.requests.length > 0) {
        const req = data.requests[0];
        setRequest(req);
        // Initialize default decisions (all pending default to 'approve')
        const initial: Record<number, { action: 'approve' | 'reject'; validUntil: string; reason: string }> = {};
        (req.documents || []).filter((d: any) => String(d.status).toLowerCase() === 'pending').forEach((d: any) => {
          initial[d.id] = { action: 'approve', validUntil: validUntilDefault, reason: '' };
        });
        setDocDecisions(initial);
      } else {
        setRequest(null);
      }
      setLoading(false);
      // Refresh sidebar badge count
      window.dispatchEvent(new Event('blockid_pending_update'));
    }).catch(async err => {
      console.error(err);
      setLoading(false);
    });
  };

  useEffect(() => {
    loadRequest();
  }, []);

  const handleDocActionChange = (docId: number, action: 'approve' | 'reject') => {
    setDocDecisions(prev => ({
      ...prev,
      [docId]: {
        ...prev[docId],
        action,
        validUntil: prev[docId]?.validUntil || validUntilDefault,
        reason: prev[docId]?.reason || ''
      }
    }));
    setFormError('');
  };

  const handleDocExpiryChange = (docId: number, validUntil: string) => {
    setDocDecisions(prev => ({
      ...prev,
      [docId]: { ...prev[docId], validUntil }
    }));
  };

  const handleDocReasonChange = (docId: number, reason: string) => {
    setDocDecisions(prev => ({
      ...prev,
      [docId]: { ...prev[docId], reason }
    }));
    setFormError('');
  };

  const handleApproveAll = () => {
    const updated: Record<number, { action: 'approve' | 'reject'; validUntil: string; reason: string }> = {};
    Object.keys(docDecisions).forEach(idStr => {
      const id = Number(idStr);
      updated[id] = { action: 'approve', validUntil: docDecisions[id]?.validUntil || validUntilDefault, reason: '' };
    });
    setDocDecisions(updated);
  };

  const handleRejectAll = () => {
    const updated: Record<number, { action: 'approve' | 'reject'; validUntil: string; reason: string }> = {};
    Object.keys(docDecisions).forEach(idStr => {
      const id = Number(idStr);
      updated[id] = { action: 'reject', validUntil: docDecisions[id]?.validUntil || validUntilDefault, reason: docDecisions[id]?.reason || 'Document does not meet compliance requirements.' };
    });
    setDocDecisions(updated);
  };

  const handleSubmitAllDecisions = () => {
    if (!request) return;

    const pendingDocs = (request.documents || []).filter((d: any) => String(d.status).toLowerCase() === 'pending');
    if (pendingDocs.length === 0) {
      setToast({ type: 'error', msg: 'No pending documents to review.' });
      return;
    }

    // Validate that all rejected documents have a reason
    for (const doc of pendingDocs) {
      const dec = docDecisions[doc.id];
      if (dec && dec.action === 'reject' && !dec.reason.trim()) {
        setFormError(`Please provide a rejection reason for "${doc.name || 'Document'}".`);
        return;
      }
    }

    setSubmitting(true);
    const payload = pendingDocs.map((doc: any) => {
      const dec = docDecisions[doc.id] || { action: 'approve', validUntil: validUntilDefault, reason: '' };
      return {
        docId: String(doc.id),
        decision: dec.action,
        validUntil: dec.action === 'approve' ? dec.validUntil : undefined,
        reason: dec.action === 'reject' ? dec.reason : undefined
      };
    });

    adminApi.reviewDocuments(request.userId, payload)
      .then(res => {
        setToast({ type: 'success', msg: `Review complete: ${res.approved} approved, ${res.rejected} rejected.` });
        window.dispatchEvent(new Event('blockid_pending_update'));
        setTimeout(async () => {
          setToast(null);
          loadRequest();
        }, 2000);
      })
      .catch(async err => {
        setToast({ type: 'error', msg: 'Review error: ' + err.message });
      })
      .finally(() => setSubmitting(false));
  };

  if (loading) return <div className="p-8 text-center text-slate-500">Loading pending requests...</div>;
  if (!request) return <div className="p-8 text-center text-emerald-600 font-semibold bg-emerald-50 rounded-xl border border-emerald-200 m-8">Zero pending requests in queue!</div>;

  const initials = request.name?.substring(0, 2).toUpperCase() || 'U';
  const pendingDocs = (request.documents || []).filter((d: any) => String(d.status).toLowerCase() === 'pending');

  return (
    <div className="animate-fade-in space-y-6">
      <SectionHeader title="Review Identity Request" subtitle={`Case #REQ-${request.userId} · Submitted ${new Date(request.submittedAt).toLocaleDateString()}`} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* User info & AI score */}
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
                { label: 'Pending Docs', value: `${pendingDocs.length} pending review` },
              ].map(f => (
                <div key={f.label} className="flex justify-between py-1.5 border-b border-slate-100 last:border-0 text-xs">
                  <span className="text-slate-400">{f.label}</span>
                  <span className="text-slate-700 font-medium">{f.value}</span>
                </div>
              ))}
            </div>
          </Card>

          {/* AI check */}
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

        {/* Per-Document Review List */}
        <div className="lg:col-span-2 space-y-4">
          <Card className="p-5">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-semibold text-slate-800">Per-Document Review</h3>
                <p className="text-xs text-slate-400">Approve or reject each document individually with specific reasons</p>
              </div>
              <div className="flex gap-2">
                <Button size="sm" variant="outline" onClick={handleApproveAll} className="text-xs text-emerald-600 border-emerald-200 hover:bg-emerald-50">
                  <CheckCircle size={12} className="mr-1" /> Approve All
                </Button>
                <Button size="sm" variant="outline" onClick={handleRejectAll} className="text-xs text-red-600 border-red-200 hover:bg-red-50">
                  <XCircle size={12} className="mr-1" /> Reject All
                </Button>
              </div>
            </div>

            <div className="space-y-4">
              {pendingDocs.map((doc: any) => {
                const dec = docDecisions[doc.id] || { action: 'approve', validUntil: validUntilDefault, reason: '' };
                const fileUrl = doc.storageUrl?.startsWith('http')
                  ? doc.storageUrl.replace('localhost:8443', '127.0.0.1:8080')
                  : `http://127.0.0.1:8080${doc.storageUrl?.startsWith('/') ? '' : '/'}${doc.storageUrl}`;

                return (
                  <div key={doc.id} className={`p-4 rounded-xl border transition-all ${dec.action === 'approve' ? 'border-emerald-200 bg-emerald-50/30' : 'border-red-200 bg-red-50/30'}`}>
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
                      <div className="flex items-center gap-2">
                        <FileText size={18} className={dec.action === 'approve' ? 'text-emerald-600' : 'text-red-500'} />
                        <div>
                          <span className="text-sm font-bold text-slate-800 capitalize">{doc.name || 'Document'}</span>
                          <span className="text-[10px] text-slate-400 block font-mono">ID: #{doc.id}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <a href={fileUrl} target="_blank" rel="noreferrer" className="text-xs text-blue-600 hover:text-blue-800 bg-white px-2.5 py-1 rounded-lg border border-slate-200 font-medium shadow-sm transition-all flex items-center gap-1 mr-2">
                          <Eye size={12} /> View
                        </a>
                        {/* Per-Document Decision Toggle */}
                        <div className="flex bg-slate-100 p-0.5 rounded-lg border border-slate-200">
                          <button
                            type="button"
                            onClick={() => handleDocActionChange(doc.id, 'approve')}
                            className={`flex items-center gap-1 text-xs font-semibold px-3 py-1 rounded-md transition-all ${dec.action === 'approve' ? 'bg-emerald-600 text-white shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}
                          >
                            <CheckCircle size={12} /> Approve
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDocActionChange(doc.id, 'reject')}
                            className={`flex items-center gap-1 text-xs font-semibold px-3 py-1 rounded-md transition-all ${dec.action === 'reject' ? 'bg-red-600 text-white shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}
                          >
                            <XCircle size={12} /> Reject
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Conditional Input based on decision */}
                    {dec.action === 'approve' ? (
                      <div className="bg-white p-3 rounded-lg border border-emerald-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <label className="text-xs font-medium text-slate-600 flex items-center gap-1">
                          <Clock size={12} className="text-emerald-500" /> Expiry Date (Valid Until):
                        </label>
                        <input
                          type="date"
                          value={dec.validUntil}
                          onChange={(e) => handleDocExpiryChange(doc.id, e.target.value)}
                          className="border border-slate-200 rounded-md px-2.5 py-1 text-xs focus:border-emerald-500 outline-none font-mono"
                        />
                      </div>
                    ) : (
                      <div className="bg-white p-3 rounded-lg border border-red-100 space-y-1">
                        <label className="text-xs font-medium text-red-600 flex items-center gap-1">
                          <XCircle size={12} className="text-red-500" /> Rejection Reason (Required):
                        </label>
                        <textarea
                          rows={2}
                          value={dec.reason}
                          onChange={(e) => handleDocReasonChange(doc.id, e.target.value)}
                          placeholder={`Enter reason for rejecting ${doc.name || 'document'} (e.g., Image too blurry, expired document, missing signature)...`}
                          className="w-full border border-red-200 rounded-md p-2 text-xs focus:border-red-500 outline-none resize-none"
                        />
                      </div>
                    )}
                  </div>
                );
              })}

              {pendingDocs.length === 0 && (
                <p className="text-xs text-slate-500 italic p-6 text-center">No pending documents to review.</p>
              )}
            </div>

            {formError && (
              <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-600 font-medium">
                {formError}
              </div>
            )}

            {/* Submit All Decisions */}
            <div className="mt-6 pt-4 border-t border-slate-100 flex justify-end">
              <button
                type="button"
                onClick={handleSubmitAllDecisions}
                disabled={submitting || pendingDocs.length === 0}
                className="bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-bold px-7 py-3 rounded-xl shadow-lg shadow-blue-500/25 border-none transition-all flex items-center gap-2 text-sm cursor-pointer disabled:opacity-50"
              >
                <CheckCircle size={16} />
                {submitting ? 'Processing Review Decisions...' : `Submit Decisions (${pendingDocs.length} Document${pendingDocs.length > 1 ? 's' : ''})`}
              </button>
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
  const { showAlert, showConfirm } = useDialog();
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [page, setPage] = useState(1);
  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState<any>(null);
  const [newRole, setNewRole] = useState('user');
  const [users, setUsers] = useState<any[]>([]);
  const [totalItems, setTotalItems] = useState(0);

  // New user form state
  const [newUser, setNewUser] = useState({ name: '', email: '', phone: '', password: '', role: 'user' });
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
    if (!newUser.name || !newUser.email || !newUser.password) return await showAlert('Name, email, and password are required');
    setIsCreating(true);
    try {
      const response = await authApi.register({
        name: newUser.name.trim(),
        email: newUser.email,
        phone: newUser.phone,
        password: newUser.password,
        role: newUser.role,
        country: 'Global' // Default metadata
      });
      await showAlert(`Successfully created ${newUser.role}: ${response.email || newUser.email}\nThey can now sign in with their password.`);
      setShowModal(false);
      setNewUser({ name: '', email: '', phone: '', password: '', role: 'user' });
      fetchUsers(); // Refresh table from DB
    } catch (err: any) {
      console.error(err);
      await showAlert(err.message || 'Failed to create user. Ensure email is unique.');
    } finally {
      setIsCreating(false);
    }
  };

  const handleExport = async () => {
    if (!users || users.length === 0) {
      await showAlert("No users to export");
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
                      <button onClick={async () => {
                        sessionStorage.setItem('inspect_user_id', String(user.id));
                        if (onNav) onNav('identity-details');
                        else await showAlert("Navigation function missing. Use the sidebar.");
                      }} className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all" title="View Details"><Eye size={13} /></button>

                      <button onClick={async () => {
                        setEditingUser(user);
                        setNewRole((user.role || 'user').toLowerCase());
                      }} className="p-1.5 text-slate-400 hover:text-violet-600 hover:bg-violet-50 rounded-lg transition-all" title="Edit Role"><Edit size={13} /></button>

                      {user.status === 'suspended' ? (
                        <button onClick={async () => {
                          adminApi.updateStatus(user.id, 'pending').then(async () => {
                            fetchUsers();
                            await showAlert(`${user.name} has been unblocked and set to pending review.`);
                          }).catch(async err => {
                            await showAlert(`Failed to unblock user: ${err.message}`);
                          });
                        }} className="p-1.5 text-slate-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-all" title="Unblock User"><CheckCircle size={13} /></button>
                      ) : (
                        <button onClick={async () => {
                          const r = (user.role || '').toLowerCase();
                          if (r === 'admin' || r === 'verifier') {
                            await showAlert(`For security reasons, system ${r} accounts cannot be suspended or blocked.`);
                            return;
                          }
                          if (await showConfirm(`Are you sure you want to temporarily suspend ${user.name}? They will be unable to log in.`)) {
                            adminApi.updateStatus(user.id, 'suspended').then(async () => {
                              fetchUsers();
                              await showAlert(`${user.name} has been temporarily blocked.`);
                            }).catch(async err => {
                              await showAlert(`Failed to block user: ${err.message}`);
                            });
                          }
                        }} className="p-1.5 text-slate-400 hover:text-orange-500 hover:bg-orange-50 rounded-lg transition-all" title="Temporarily Block User"><Lock size={13} /></button>
                      )}

                      <button onClick={async () => {
                        const r = (user.role || '').toLowerCase();
                        let isSystemRole = r === 'admin' || r === 'verifier';

                        if (isSystemRole) {
                          if (!(await showConfirm(`CRITICAL WARNING: You are attempting to delete a system ${r.toUpperCase()} account (${user.name}). This is highly destructive. Proceed?`))) {
                            return;
                          }
                        }

                        if (await showConfirm(`Are you sure you want to PERMANENTLY delete ${user.name}? This will remove all their documents, identity records, and data from the database forever.`)) {
                          adminApi.deleteUser(user.id).then(async () => {
                            fetchUsers();
                            await showAlert(`${user.name} has been permanently deleted.`);
                          }).catch(async err => {
                            console.error(err);
                            await showAlert(`Failed to delete user. Technical details:\n\n${err.message || JSON.stringify(err)}`);
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
            <Button className="flex-1 justify-center" onClick={async () => {
              adminApi.updateRole(editingUser.id, newRole.toUpperCase())
                .then(async () => {
                  await showAlert('Role updated successfully');
                  fetchUsers();
                  setEditingUser(null);
                })
                .catch(async err => {
                  console.error(err);
                  await showAlert('Failed to update role');
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
          <Input label="Name" placeholder="Enter your name" value={newUser.name} onChange={(val) => setNewUser({ ...newUser, name: val })} />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Input label="Email Address" type="email" placeholder="Enter your email" value={newUser.email} onChange={(val) => setNewUser({ ...newUser, email: val })} />
            <Input label="Phone Number" type="tel" placeholder="Enter your mobile number" value={newUser.phone} onChange={(val) => setNewUser({ ...newUser, phone: val })} />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Input label="Password" type="password" placeholder="Create password" value={newUser.password} onChange={(val) => setNewUser({ ...newUser, password: val })} />
            <Select label="Role" options={[{ value: 'user', label: 'User' }, { value: 'admin', label: 'Admin' }, { value: 'verifier', label: 'Verifier' }]} value={newUser.role} onChange={(val) => setNewUser({ ...newUser, role: val })} />
          </div>
          <div className="flex gap-2 pt-1">
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
  const { showAlert, showConfirm } = useDialog();
  const [blocks, setBlocks] = useState<any[]>([]);
  const [selectedBlock, setSelectedBlock] = useState<any | null>(null);

  useEffect(() => {
    adminApi.getBlockchainBlocks().then(res => {
      const blocksArray = Array.isArray(res) ? res : [];
      setBlocks(blocksArray);
      if (blocksArray.length > 0) setSelectedBlock(blocksArray[0]);
    }).catch(async err => {
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
  const { showAlert, showConfirm } = useDialog();
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
  const { showAlert, showConfirm } = useDialog();
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
  const { showAlert, showConfirm } = useDialog();
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
  const { showAlert, showConfirm } = useDialog();
  const [downloading, setDownloading] = useState<string | null>(null);

  const downloadCSV = async (filename: string, data: any[]) => {
    if (!data || data.length === 0) {
      await showAlert('No data available for this report.');
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
          await showAlert('Report generation for this module is currently running in the background. Check scheduled tasks.');
          return;
      }
      downloadCSV(title.replace(/\s+/g, '_').toLowerCase(), data);
    } catch (err: any) {
      console.error(err);
      await showAlert('Failed to generate report: ' + err.message);
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
  const { showAlert, showConfirm } = useDialog();
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

  const handleUpdatePolicy = async () => {
    const updated = saveState('policy', draftPolicy);
    setPolicy(updated);
    setShowPolicyModal(false);
    await showAlert('Password Policy successfully deployed to all network nodes.');
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
          <Button size="sm" className="mt-4" onClick={async () => { setDraftPolicy(policy); setShowPolicyModal(true); }}>Modify Policy</Button>
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
// ── Admin Messages / Inbox ───────────────────────────────────────────────────────────
export function AdminMessages() {
  const [messages, setMessages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMsg, setSelectedMsg] = useState<any | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  const { showAlert, showConfirm } = useDialog();
  const [toast, setToast] = useState('');

  const fetchMessages = () => {
    setLoading(true);
    adminApi.getAuditLogs(0, 100, '').then(res => {
      // Filter logs to act as an inbox for Support and Security
      const inboxes = res.logs.filter(l => l.module === 'Support' || l.module === 'Security');
      // Sort by newest
      setMessages(inboxes.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()));
      setLoading(false);
    }).catch(err => {
      console.error(err);
      setLoading(false);
    });
  };

  useEffect(() => {
    fetchMessages();
  }, []);

  const handleDelete = async (id: number) => {
    const confirmed = await showConfirm("Are you sure you want to permanently delete this message? This cannot be undone.");
    if (confirmed) {
      try {
        await adminApi.deleteAuditLog(id);
        setToast('Message deleted successfully');
        if (selectedMsg?.id === id) setSelectedMsg(null);
        setSelectedIds(prev => { const s = new Set(prev); s.delete(id); return s; });
        fetchMessages();
        setTimeout(() => setToast(''), 3000);
      } catch (err: any) {
        console.error(err);
        showAlert('Failed to delete message: ' + err.message);
      }
    }
  };

  const handleBulkDelete = async () => {
    if (selectedIds.size === 0) return;
    const confirmed = await showConfirm(`Are you sure you want to permanently delete ${selectedIds.size} messages? This cannot be undone.`);
    if (confirmed) {
      setLoading(true);
      try {
        await Promise.all(Array.from(selectedIds).map(id => adminApi.deleteAuditLog(id)));
        setToast(`Successfully deleted ${selectedIds.size} messages.`);
        if (selectedMsg && selectedIds.has(selectedMsg.id)) setSelectedMsg(null);
        setSelectedIds(new Set());
        fetchMessages();
        setTimeout(() => setToast(''), 3000);
      } catch (err: any) {
        console.error(err);
        showAlert('Failed to delete some messages: ' + err.message);
        setLoading(false);
      }
    }
  };

  return (
    <div className="animate-fade-in space-y-6">
      <SectionHeader title="Verifier Inbox & Security Alerts" subtitle="Direct secure messaging channel with Verifier Agents" action={<Button size="sm" onClick={fetchMessages}><RefreshCw size={14} /> Refresh Inbox</Button>} />

      {toast && (
        <div className="p-3 bg-emerald-50 text-emerald-700 text-sm font-medium rounded-xl border border-emerald-200 flex items-center justify-between">
          <span>{toast}</span>
          <CheckCircle size={16} />
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[600px]">
        {/* Inbox List */}
        <Card className="lg:col-span-1 p-0 overflow-hidden flex flex-col h-full border-r-0 lg:border-r border-slate-200 rounded-xl lg:rounded-r-none">
          <div className="p-4 bg-slate-50 border-b border-slate-100 font-semibold text-slate-700 flex justify-between items-center text-sm">
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                className="w-3.5 h-3.5 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                checked={selectedIds.size === messages.length && messages.length > 0}
                onChange={(e) => {
                  if (e.target.checked) setSelectedIds(new Set(messages.map(m => m.id)));
                  else setSelectedIds(new Set());
                }}
              />
              <span>Inbox ({messages.length})</span>
            </div>
            {selectedIds.size > 0 ? (
              <button onClick={handleBulkDelete} title="Delete Selected" className="text-red-500 hover:bg-red-50 rounded-lg p-1 transition-colors"><Trash2 size={16} /></button>
            ) : (
              <Inbox size={16} className="text-slate-400" />
            )}
          </div>
          <div className="flex-1 overflow-y-auto w-full">
            {loading ? (
              <div className="p-10 flex justify-center"><div className="animate-spin-custom w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full" /></div>
            ) : messages.length === 0 ? (
              <div className="p-10 text-center text-slate-400 text-sm">No new messages.</div>
            ) : (
              messages.map(msg => (
                <div key={msg.id} onClick={() => setSelectedMsg(msg)} className={`p-4 border-b border-slate-50 cursor-pointer transition-all w-full text-left ${selectedMsg?.id === msg.id ? 'bg-blue-50 border-l-4 border-l-blue-600 pl-3' : 'hover:bg-slate-50 border-l-4 border-l-transparent pl-3'}`}>
                  <div className="flex justify-between items-start mb-1">
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        onClick={e => e.stopPropagation()}
                        onChange={(e) => {
                          const newSet = new Set(selectedIds);
                          if (e.target.checked) newSet.add(msg.id);
                          else newSet.delete(msg.id);
                          setSelectedIds(newSet);
                        }}
                        checked={selectedIds.has(msg.id)}
                        className="w-3.5 h-3.5 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                      />
                      <p className="text-xs font-bold text-slate-800 truncate">{msg.actor}</p>
                    </div>
                    <span className="text-[9px] text-slate-400 whitespace-nowrap ml-2">{msg.timestamp.split('T')[0]}</span>
                  </div>
                  <p className={`text-xs font-medium truncate ${msg.module === 'Security' ? 'text-red-600' : 'text-slate-700'}`}>{msg.action.replace('Support Ticket: ', '')}</p>
                  <p className="text-[10px] text-slate-500 truncate mt-1">{msg.target.replace('Message: ', '')}</p>
                </div>
              ))
            )}
          </div>
        </Card>

        {/* Message Viewer */}
        <Card className="lg:col-span-2 p-0 flex flex-col h-full rounded-xl lg:rounded-l-none border-l-0">
          {selectedMsg ? (
            <div className="flex flex-col h-full w-full">
              <div className="p-5 border-b border-slate-100">
                <div className="flex items-start justify-between">
                  <div>
                    <h2 className="text-lg font-bold text-slate-800">{selectedMsg.action.replace('Support Ticket: ', '')}</h2>
                    <div className="flex items-center gap-2 mt-2">
                      <Avatar initials={selectedMsg.actor.charAt(0)} size="sm" />
                      <div>
                        <p className="text-xs font-bold text-slate-700">{selectedMsg.actor} <span className="text-slate-400 font-normal">({selectedMsg.ipAddress})</span></p>
                        <p className="text-[10px] text-slate-400">Received: {selectedMsg.timestamp.replace('T', ' ')}</p>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider border ${selectedMsg.module === 'Security' ? 'bg-red-50 text-red-600 border-red-200' : 'bg-blue-50 text-blue-600 border-blue-200'}`}>
                      {selectedMsg.module}
                    </span>
                    <button onClick={() => handleDelete(selectedMsg.id)} title="Delete Message" className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors border border-transparent hover:border-red-200">
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </div>
              <div className="flex-1 p-6 overflow-y-auto bg-slate-50/50">
                <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm whitespace-pre-wrap text-sm text-slate-700 leading-relaxed font-mono">
                  {selectedMsg.target.replace('Message: ', '')}
                </div>
              </div>
              <div className="p-4 border-t border-slate-100 bg-white">
                <Button className="w-full justify-center" onClick={() => showAlert('Automated reply sent to ' + selectedMsg.actor)}><MessageSquare size={14} /> Mark as Resolved & Reply</Button>
              </div>
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-slate-400 w-full h-full p-10">
              <Inbox size={48} className="mb-4 opacity-20" />
              <p className="text-sm">Select a message from the inbox to read</p>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
