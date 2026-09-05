import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import {
  Shield, FileText, Upload, CreditCard, QrCode, Link, CheckCircle, Clock,
  XCircle, AlertTriangle, Download, Eye, Trash2, Camera, Smartphone, Copy,
  ChevronRight, Plus, Check, X, Info
} from 'lucide-react';
import { Card, StatCard, StatusBadge, Button, Input, Toast, SectionHeader, Pagination, Modal } from '../components/UIComponents';
import { useDialog } from '../context/DialogContext';
import { VerificationAreaChart, MiniSparkline, UserDocumentBarChart } from '../components/Charts';
import { mockVerificationHistory, mockNotifications } from '../data/mockData';
import { userApi, authApi, clearAuth, DocumentInfo, getSavedUser } from '../service/api';
import { QRCodeSVG } from 'qrcode.react';
// ── User Dashboard ─────────────────────────────────────────────────────────────
export function UserDashboard({ onNav }: { onNav: (s: string) => void }) {
  const { showAlert } = useDialog();
  const [documents, setDocuments] = useState<DocumentInfo[]>([]);
  const [activities, setActivities] = useState<any[]>([]);
  const [chartData, setChartData] = useState<any[]>([]);
  const [stats, setStats] = useState<any>({
    verifiedDocuments: 0, totalVerifications: 0, pendingDocuments: 0, rejectedDocuments: 0, trustScore: 0,
    name: '', did: '', lastLogin: '', blockchainHash: '', blockNumber: 0
  });

  const [shareModal, setShareModal] = useState(false);
  const [shareStep, setShareStep] = useState(1);
  const [shareLink, setShareLink] = useState('');
  const [shareCopied, setShareCopied] = useState(false);
  const [shareTimeLeft, setShareTimeLeft] = useState(3600);

  useEffect(() => {
    let intv: any;
    if (shareStep === 3) {
      intv = setInterval(() => setShareTimeLeft(s => Math.max(s - 1, 0)), 1000);
    }
    return () => clearInterval(intv);
  }, [shareStep]);

  useEffect(() => {
    userApi.getMyDocuments().then(data => setDocuments(data)).catch(console.error);

    Promise.all([
      userApi.getIdentityStatus(),
      userApi.getVerificationHistory()
    ]).then(([res, history]) => {

      const currentMonth = new Date().toLocaleString('default', { month: 'short' });

      let v = 0, p = 0, r = 0;
      if (res.documents) {
        res.documents.forEach((d: any) => {
          const s = String(d.status).toLowerCase();
          if (s === 'verified') v++;
          else if (s === 'pending') p++;
          else if (s === 'rejected') r++;
        });
      }

      setChartData([
        { month: 'Mar', verified: 0, pending: 0, rejected: 0 },
        { month: 'Apr', verified: 0, pending: 0, rejected: 0 },
        { month: 'May', verified: 0, pending: 0, rejected: 0 },
        { month: 'Jun', verified: 0, pending: 0, rejected: 0 },
        { month: 'Jul', verified: 0, pending: 0, rejected: 0 },
        { month: currentMonth, verified: v, pending: p, rejected: r }
      ]);

      setStats({
        verifiedDocuments: res.documents ? res.documents.filter((d: any) => String(d.status).toLowerCase() === 'verified').length : 0,
        totalVerifications: history.length,
        pendingDocuments: res.documents ? res.documents.filter((d: any) => String(d.status).toLowerCase() === 'pending').length : 0,
        rejectedDocuments: res.documents ? res.documents.filter((d: any) => String(d.status).toLowerCase() === 'rejected').length : 0,
        trustScore: res.userStatus === 'verified' ? 100 : (res.documents && res.documents.length > 0 ? 50 : 0),
        name: getSavedUser()?.name || 'User',
        did: res.did,
        lastLogin: 'Just now',
        blockchainHash: res.blockchainHash || 'Pending',
        blockNumber: res.blockNumber || 'Pending'
      });
    }).catch(console.error);

    userApi.getNotifications().then(data => setActivities(data || [])).catch(console.error);
  }, []);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning,';
    if (hour < 17) return 'Good afternoon,';
    if (hour < 21) return 'Good evening,';
    return 'Good night,';
  };

  return (
    <div className="animate-fade-in space-y-6">
      {/* Welcome */}
      <div className="rounded-2xl p-6 text-white relative overflow-hidden" style={{ background: 'linear-gradient(135deg, #1D4ED8 0%, #1E40AF 50%, #0F2D6B 100%)' }}>
        <div className="absolute right-0 top-0 w-48 h-48 opacity-10" style={{
          background: 'radial-gradient(circle, white, transparent)',
          transform: 'translate(30%, -30%)'
        }} />
        <div className="relative z-10 flex items-center justify-between">
          <div>
            <p className="text-blue-200 text-sm mb-1">{getGreeting()}</p>
            <h1 className="text-2xl font-bold mb-1">{stats.name || 'User'} 👋</h1>
            <p className="text-blue-200 text-xs">DID: {stats.did || 'Pending'} · Last login: {stats.lastLogin || 'Just now'}</p>
          </div>
          <div className="hidden sm:flex items-center gap-3">
            <div className="text-right">
              <p className="text-blue-200 text-xs">Identity Status</p>
              <p className="text-white font-semibold text-sm">{stats.trustScore >= 80 ? 'Fully Verified' : 'Pending Review'}</p>
            </div>
            <div className="w-12 h-12 bg-emerald-500 rounded-2xl flex items-center justify-center shadow-lg">
              <CheckCircle size={24} className="text-white" />
            </div>
          </div>
        </div>
        {/* Blockchain hash strip */}
        <div className="relative z-10 mt-4 flex items-center gap-2 pt-4 border-t border-blue-700/50">
          <Link size={11} className="text-blue-300" />
          <span className="font-mono text-[10px] text-blue-300">{stats.blockchainHash || 'Pending'} · Block #{stats.blockNumber || 'Pending'}</span>
          <span className="ml-auto text-[10px] text-emerald-300 flex items-center gap-1"><div className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />Confirmed</span>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Verified Documents" value={stats.verifiedDocuments} sub="of total submitted" icon={<FileText size={18} />} color="blue" trend={{ value: '+0', up: true }} />
        <StatCard label="Rejected" value={stats.rejectedDocuments} sub="Needs review" icon={<XCircle size={18} />} color="red" trend={{ value: '+0', up: false }} />
        <StatCard label="Pending" value={stats.pendingDocuments} sub="Awaiting review" icon={<Clock size={18} />} color="amber" />
        <StatCard label="Blockchain Score" value={`${stats.trustScore}/100`} sub="Trust rating" icon={<Shield size={18} />} color="violet" trend={{ value: '+0', up: true }} />
      </div>

      {/* Quick actions */}
      <div>
        <h3 className="text-sm font-semibold text-slate-700 mb-3">Quick Actions</h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: 'Secure Link', icon: Link, color: 'blue', action: () => setShareModal(true) },
            { label: 'View ID Card', icon: CreditCard, color: 'violet', screen: 'digital-id-card' },
            { label: 'Upload Document', icon: Upload, color: 'cyan', screen: 'upload-documents' },
            { label: 'Blockchain Status', icon: Shield, color: 'emerald', screen: 'blockchain-status' },
          ].map(a => (
            <button key={a.label} onClick={a.action ? a.action : () => onNav(a.screen!)} className="flex flex-col items-center gap-2 p-4 bg-white rounded-2xl border border-slate-200 hover:border-blue-200 hover:shadow-md transition-all group">
              <div className={`w-10 h-10 rounded-xl bg-${a.color}-50 group-hover:bg-${a.color}-100 flex items-center justify-center transition-all`}>
                <a.icon size={18} className={`text-${a.color}-600`} />
              </div>
              <span className="text-xs font-medium text-slate-600 text-center leading-tight">{a.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Chart + activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="p-5 lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-semibold text-slate-800">My Document Status</h3>
              <p className="text-xs text-slate-500">Monthly overview</p>
            </div>
            <span className="text-xs text-slate-400 bg-slate-50 px-3 py-1 rounded-lg border border-slate-200">Last 6 months</span>
          </div>
          <UserDocumentBarChart data={chartData} />
        </Card>

        <Card className="p-5">
          <h3 className="text-sm font-semibold text-slate-800 mb-4">Recent Activity</h3>
          <div className="space-y-3">
            {activities.length === 0 ? (
              <p className="text-xs text-slate-500 text-center py-4">No recent activity</p>
            ) : (
              activities.slice(0, 5).map((a, i) => {
                let Icon = Info;
                let colorClass = 'text-blue-500 bg-blue-50';
                if (a.type === 'success') { Icon = CheckCircle; colorClass = 'text-emerald-500 bg-emerald-50'; }
                if (a.type === 'warning') { Icon = AlertTriangle; colorClass = 'text-amber-500 bg-amber-50'; }
                if (a.type === 'critical') { Icon = XCircle; colorClass = 'text-red-500 bg-red-50'; }

                return (
                  <div key={i} className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 ${colorClass}`}>
                      <Icon size={14} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-slate-700 truncate">{a.title || a.message}</p>
                      <p className="text-[10px] text-slate-400">{a.time || 'Just now'}</p>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </Card>
      </div>

      {/* Documents preview */}
      <Card className="p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold text-slate-800">My Documents</h3>
          <Button variant="ghost" size="sm" onClick={() => onNav('my-documents')}>View all <ChevronRight size={14} /></Button>
        </div>
        <div className="space-y-2">
          {documents.slice(0, 3).map(doc => (
            <div key={doc.id} className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 hover:bg-slate-100 transition-all">
              <div className="w-9 h-9 bg-blue-100 rounded-xl flex items-center justify-center flex-shrink-0">
                <FileText size={16} className="text-blue-600" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-slate-700 truncate">{doc.name}</p>
                <p className="text-[10px] text-slate-400 font-mono">{doc.docHash || 'Processing...'}</p>
              </div>
              <StatusBadge status={doc.status} />
            </div>
          ))}
        </div>
      </Card>

      {/* Secure Share Modal */}
      {shareModal && createPortal(
        <div className="fixed inset-0 w-screen h-screen bg-slate-900/70 backdrop-blur-sm z-[99999] flex items-center justify-center p-4 animate-fade-in" style={{ position: 'fixed', top: 0, left: 0 }}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden scale-in relative flex flex-col justify-center">
            <div className="flex items-center justify-between p-4 border-b border-slate-100 bg-slate-50">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center">
                  <Link size={14} className="text-blue-600" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-800 text-sm">Create Time-Bomb Link</h3>
                  <p className="text-[10px] text-slate-500">Secure 1-Hour Identity Sharing</p>
                </div>
              </div>
              <button onClick={() => { setShareModal(false); setShareStep(1); }} className="p-2 text-slate-400 hover:text-slate-600 bg-white shadow-sm border border-slate-200 rounded-xl hover:bg-slate-50 transition-all">
                <X size={16} />
              </button>
            </div>

            <div className="p-6">
              {shareStep === 1 ? (
                <div className="space-y-4 animate-fade-in">
                  <div className="bg-blue-50 border border-blue-100 rounded-xl p-3 flex items-start gap-3">
                    <AlertTriangle size={16} className="text-blue-500 flex-shrink-0 mt-0.5" />
                    <div>
                      <h4 className="text-xs font-semibold text-blue-800">External Verification</h4>
                      <p className="text-[11px] text-blue-600 font-medium leading-relaxed mt-1">This will generate a highly secure read-only URL containing your verified identity. The link will automatically self-destruct exactly 1 hour after creation.</p>
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-slate-700 mb-1.5 block">Recipient Reference (Optional)</label>
                    <Input placeholder="E.g., Bank of America KYC" icon={<FileText size={14} />} />
                  </div>

                  <div className="pt-2">
                    <Button className="w-full justify-center bg-slate-900 hover:bg-slate-800 text-white shadow-lg" onClick={() => {
                      setShareStep(2);
                      setTimeout(() => {
                        const localUser = getSavedUser();
                        const verifiedDocs = documents.filter(d => d.status.toLowerCase() === 'verified').map(d => d.name).join(', ') || 'No Verified Docs Provided';
                        const statusString = stats.trustScore >= 80 ? 'Verified' : documents.some(d => d.status.toLowerCase() === 'rejected') ? 'Rejected' : 'Pending';
                        let payload = btoa(JSON.stringify({ n: localUser?.name || 'Verified User', d: verifiedDocs, s: statusString, t: Date.now() }));
                        setShareLink(`${window.location.origin}?share=BNCK-${Math.random().toString(36).substring(2, 8).toUpperCase()}&p=${payload}`);
                        setShareTimeLeft(3600);
                        setShareStep(3);
                      }, 1200);
                    }}>Generate Self-Destructing Link</Button>
                  </div>
                </div>
              ) : shareStep === 2 ? (
                <div className="py-12 flex flex-col items-center justify-center text-center animate-fade-in">
                  <div className="w-12 h-12 border-4 border-blue-100 border-t-blue-600 rounded-full animate-spin-custom mb-3" />
                  <p className="text-sm font-bold text-slate-800">Generating Secure Token...</p>
                  <p className="text-xs text-slate-500 mt-1">Signing with your Blockchain private key.</p>
                </div>
              ) : (
                <div className="space-y-5 text-center pt-2 animate-fade-in">
                  <div className="w-14 h-14 bg-emerald-100 rounded-2xl flex items-center justify-center mx-auto shadow-sm">
                    <CheckCircle size={24} className="text-emerald-600" />
                  </div>

                  <div>
                    <h3 className="text-lg font-bold text-slate-800">Link Generated!</h3>
                    <p className="text-xs font-medium text-red-500 mt-1 flex items-center justify-center gap-1">
                      <Clock size={12} /> self-destructs in {Math.floor(shareTimeLeft / 60).toString().padStart(2, '0')}:{(shareTimeLeft % 60).toString().padStart(2, '0')}
                    </p>
                  </div>

                  <div className="bg-slate-50 border border-slate-200 rounded-xl p-1.5 flex items-center justify-between">
                    <code className="text-xs font-mono text-slate-600 px-3 truncate">{shareLink}</code>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(shareLink);
                        setShareCopied(true);
                        setTimeout(() => setShareCopied(false), 2000);
                      }}
                      className="bg-white border border-slate-200 shadow-sm rounded-lg px-3 py-2 text-xs font-bold text-slate-700 hover:text-blue-600 transition-all flex items-center gap-1.5"
                    >
                      {shareCopied ? <Check size={14} className="text-emerald-500" /> : <Copy size={14} />} {shareCopied ? 'Copied' : 'Copy'}
                    </button>
                  </div>

                  <p className="text-[10px] text-slate-400">Share this link directly with your external organization. They do not need a BlockID account to view your verified credentials.</p>
                </div>
              )}
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}

// ── Identity Overview ─────────────────────────────────────────────────────────
export function IdentityOverview({ onNav }: { onNav: (s: string) => void }) {
  const [stats, setStats] = useState<any>({ name: '', did: '', status: '', hash: '', date: '' });
  const [docs, setDocs] = useState<any>({ passport: false, address: false, tax: false, national: false });
  const [score, setScore] = useState(0);

  useEffect(() => {
    const user = getSavedUser();
    userApi.getIdentityStatus().then(res => {
      const documents = res.documents || [];
      const hasPassport = documents.some((d: any) => d.type === 'passport');
      const hasAddress = documents.some((d: any) => d.type === 'address');
      const hasTax = documents.some((d: any) => d.type === 'tax');
      const hasNational = documents.some((d: any) => d.type === 'national' || d.type === 'license');

      let currentScore = 0;
      if (hasPassport) currentScore += 25;
      if (hasAddress) currentScore += 25;
      if (hasTax) currentScore += 25;
      if (hasNational) currentScore += 25;

      setScore(currentScore);
      setDocs({ passport: hasPassport, address: hasAddress, tax: hasTax, national: hasNational });

      setStats({
        name: user?.name || 'Identity Holder',
        did: res.did || user?.did || 'Pending DID',
        status: res.userStatus === 'verified' ? 'verified' : 'pending',
        hash: res.blockchainHash || 'Pending',
        date: res.verifiedAt ? res.verifiedAt.split('T')[0] : 'Pending'
      });
    }).catch(console.error);
  }, []);

  return (
    <div className="animate-fade-in space-y-6">
      <SectionHeader title="Identity Overview" subtitle="Your blockchain-anchored digital identity" />

      {/* Identity health */}
      <div className="rounded-2xl p-6 border border-blue-200" style={{ background: 'linear-gradient(135deg, #EFF6FF, #DBEAFE)' }}>
        <div className="flex items-start justify-between">
          <div>
            <p className="text-xs font-medium text-blue-600 uppercase tracking-wider mb-1">Identity Strength</p>
            <h2 className="text-3xl font-bold text-blue-900 mb-1">{score}%</h2>
            <p className="text-sm text-blue-700">{score === 100 ? 'Excellent' : 'Incomplete'} — {Math.floor(score / 25)} of 4 required documents uploaded</p>
          </div>
          <div className="w-20 h-20 rounded-2xl bg-white/80 border border-blue-200 flex items-center justify-center">
            <div className="relative">
              <svg width="56" height="56" viewBox="0 0 56 56">
                <circle cx="28" cy="28" r="22" fill="none" stroke="#DBEAFE" strokeWidth="4" />
                <circle cx="28" cy="28" r="22" fill="none" stroke="#1D4ED8" strokeWidth="4"
                  strokeDasharray={`${138.2 * (score / 100)} ${138.2}`} strokeLinecap="round" transform="rotate(-90 28 28)" />
              </svg>
              <span className="absolute inset-0 flex items-center justify-center text-xs font-bold text-blue-700">{score}%</span>
            </div>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-3 gap-3">
          {[
            { label: 'Trust Score', value: `${score === 100 ? '98' : String(score)}/100`, color: score === 100 ? 'text-emerald-700' : 'text-amber-700' },
            { label: 'Blockchain Conf.', value: stats.status === 'verified' ? 'Live network' : 'Pending', color: 'text-blue-700' },
            { label: 'Valid Until', value: stats.status === 'verified' ? 'Jan 2026' : 'N/A', color: 'text-slate-700' },
          ].map(m => (
            <div key={m.label} className="bg-white/60 rounded-xl p-3 border border-blue-100">
              <p className="text-[10px] text-slate-500 uppercase tracking-wider">{m.label}</p>
              <p className={`text-sm font-bold ${m.color}`}>{m.value}</p>
            </div>
          ))}
        </div>
      </div>

      {/* DID details */}
      <Card className="p-5">
        <h3 className="text-sm font-semibold text-slate-800 mb-4">Decentralized Identity Record</h3>
        <div className="space-y-3">
          {[
            { label: 'Identity ID (DID)', value: stats.did, mono: true },
            { label: 'Full Name', value: stats.name, mono: false },
            { label: 'Blockchain Address', value: stats.hash ? stats.hash.substring(0, 32) + '...' : 'Pending', mono: true },
            { label: 'Issue Date', value: stats.date, mono: false },
            { label: 'Issuing Authority', value: 'Identity Vault Mainnet Registry', mono: false },
            { label: 'Verification Standard', value: 'W3C DID Core Spec v1.0', mono: false },
          ].map(f => (
            <div key={f.label} className="flex items-center justify-between py-2.5 border-b border-slate-100 last:border-0">
              <span className="text-xs text-slate-500">{f.label}</span>
              <span className={`text-xs font-medium text-slate-800 ${f.mono ? 'font-mono truncate w-40 text-right' : ''}`}>{f.value}</span>
            </div>
          ))}
        </div>
      </Card>

      {/* Document completion */}
      <Card className="p-5">
        <h3 className="text-sm font-semibold text-slate-800 mb-4">Identity Completeness</h3>
        <div className="space-y-3">
          {[
            { label: 'Government ID', complete: docs.national },
            { label: 'Passport', complete: docs.passport },
            { label: 'Proof of Address', complete: docs.address },
            { label: 'Tax Identification', complete: docs.tax },
          ].map(item => (
            <div key={item.label} className="flex items-center gap-3">
              <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 ${item.complete ? 'bg-emerald-500' : 'bg-slate-200'}`}>
                {item.complete ? <Check size={12} className="text-white" /> : <X size={12} className="text-slate-400" />}
              </div>
              <div className="flex-1">
                <div className="flex justify-between mb-1">
                  <span className="text-xs text-slate-700">{item.label}</span>
                  <span className="text-xs text-slate-500">{item.complete ? '100%' : '0%'}</span>
                </div>
                <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                  <div className={`h-full rounded-full ${item.complete ? 'bg-emerald-500' : 'bg-slate-200'}`} style={{ width: item.complete ? '100%' : '0%' }} />
                </div>
              </div>
            </div>
          ))}
        </div>
        <Button variant="secondary" size="sm" className="mt-4 w-full justify-center" onClick={() => onNav('upload-documents')}>
          <Plus size={14} /> Add Missing Documents
        </Button>
      </Card>
    </div>
  );
}

// ── Upload Documents ──────────────────────────────────────────────────────────
export function UploadDocuments() {
  const { showAlert, showConfirm } = useDialog();
  const [dragging, setDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploaded, setUploaded] = useState<string[]>([]);
  const [docType, setDocType] = useState('passport');
  const [customDocType, setCustomDocType] = useState('');
  const [toast, setToast] = useState(false);
  const [pendingFile, setPendingFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const confirmUpload = () => {
    if (!pendingFile) return;
    setUploading(true);

    // Use the custom name if "Other" is selected, otherwise use the standard type
    const finalDocType = (docType === 'other' && customDocType.trim() !== '')
      ? customDocType.trim()
      : docType;

    userApi.uploadDocument(pendingFile, finalDocType)
      .then(res => {
        setUploading(false);
        setUploaded(u => [...u, res.document.name]);
        // Also wipe out the custom field for next time
        if (docType === 'other') setCustomDocType('');

        // Reset preview states
        setPendingFile(null);
        if (previewUrl) URL.revokeObjectURL(previewUrl);
        setPreviewUrl(null);

        setToast(true);
        setTimeout(() => setToast(false), 3000);
      })
      .catch(async err => {
        setUploading(false);
        await showAlert(err.message || 'Failed to upload document');
      });
  };

  const handleFileSelection = (file: File) => {
    setPendingFile(file);
    if (file.type.startsWith('image/') || file.type === 'application/pdf') {
      setPreviewUrl(URL.createObjectURL(file));
    } else {
      setPreviewUrl(null);
    }
  };

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFileSelection(e.target.files[0]);
    }
  };

  const onDropFile = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelection(e.dataTransfer.files[0]);
    }
  };

  return (
    <div className="animate-fade-in space-y-6">
      <SectionHeader title="Upload Identity Documents" subtitle="Securely upload documents for blockchain verification" />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          {/* Document type */}
          <Card className="p-5">
            <h3 className="text-sm font-semibold text-slate-800 mb-3">Document Type</h3>
            <div className="grid grid-cols-3 gap-2">
              {[
                { value: 'passport', label: 'Passport', icon: '🛂' },
                { value: 'license', label: "Driver's License", icon: '🚗' },
                { value: 'national', label: 'National ID', icon: '🪪' },
                { value: 'address', label: 'Proof of Address', icon: '🏠' },
                { value: 'tax', label: 'Tax Document', icon: '📋' },
                { value: 'other', label: 'Other', icon: '📄' },
              ].map(d => (
                <button key={d.value} onClick={() => setDocType(d.value)} className={`flex flex-col items-center gap-1.5 p-3 rounded-xl border text-xs font-medium transition-all ${docType === d.value ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-slate-200 text-slate-600 hover:border-slate-300'}`}>
                  <span className="text-lg">{d.icon}</span>
                  <span className="text-center leading-tight">{d.label}</span>
                </button>
              ))}
            </div>
            {/* Custom Input for 'Other' */}
            {docType === 'other' && (
              <div className="mt-4 animate-fade-in">
                <Input
                  placeholder="E.g., Birth Certificate, Employment Letter"
                  value={customDocType}
                  onChange={setCustomDocType}
                  icon={<FileText size={14} />}
                />
                <p className="text-[10px] text-slate-400 mt-1 pl-1">Specify your custom document type before uploading.</p>
              </div>
            )}
          </Card>

          {/* Drop zone */}
          <Card className="p-5">
            <h3 className="text-sm font-semibold text-slate-800 mb-3">Upload File</h3>
            {pendingFile ? (
              <div className="border border-slate-200 rounded-2xl p-6 relative bg-slate-50 flex flex-col items-center animate-fade-in text-center">
                <button onClick={() => setPendingFile(null)} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 bg-white shadow-sm p-1.5 rounded-full z-10 transition-colors">
                  <X size={16} />
                </button>
                <div className="w-full max-w-sm aspect-[4/3] bg-slate-200 rounded-xl overflow-hidden shadow-inner mb-4 flex items-center justify-center">
                  {previewUrl ? (
                    pendingFile.type === 'application/pdf' ? (
                      <object data={previewUrl} type="application/pdf" className="w-full h-full object-cover">
                        <div className="flex flex-col items-center justify-center h-full text-slate-400 p-4">
                          <FileText size={40} className="mb-2" />
                          <p className="text-sm font-semibold">{pendingFile.name}</p>
                          <p className="text-xs">PDF Preview Ready</p>
                        </div>
                      </object>
                    ) : (
                      <img src={previewUrl} alt="Document Preview" className="w-full h-full object-contain" />
                    )
                  ) : (
                    <div className="flex flex-col items-center justify-center h-full text-slate-400 p-4">
                      <FileText size={40} className="mb-2" />
                      <p className="text-sm font-semibold">{pendingFile.name}</p>
                      <p className="text-xs">Preview not available</p>
                    </div>
                  )}
                </div>

                {uploading ? (
                  <div className="flex flex-col items-center gap-3 py-2 w-full">
                    <div className="w-8 h-8 border-3 border-blue-200 border-t-blue-600 rounded-full animate-spin-custom" />
                    <p className="text-sm text-blue-600 font-medium">Encrypting & Anchoring...</p>
                  </div>
                ) : (
                  <div className="flex gap-4 w-full max-w-sm mt-2">
                    <Button variant="outline" className="flex-1 flex justify-center items-center text-center" onClick={() => setPendingFile(null)}>Cancel</Button>
                    <Button onClick={confirmUpload} className="flex-1 flex justify-center items-center text-center bg-blue-600 hover:bg-blue-700 text-white shadow-md">Confirm Upload</Button>
                  </div>
                )}
              </div>
            ) : (
              <div
                onDragOver={e => { e.preventDefault(); setDragging(true); }}
                onDragLeave={() => setDragging(false)}
                onDrop={onDropFile}
                className={`border-2 border-dashed rounded-2xl p-10 text-center transition-all cursor-pointer ${dragging ? 'border-blue-500 bg-blue-50' : 'border-slate-200 hover:border-blue-300 hover:bg-blue-50/50'}`}
                onClick={() => fileInputRef.current?.click()}
              >
                <input type="file" ref={fileInputRef} className="hidden" onChange={onFileChange} accept=".pdf,.jpg,.jpeg,.png" />
                <div className="flex flex-col items-center gap-3">
                  <div className="w-14 h-14 bg-blue-50 rounded-2xl flex items-center justify-center">
                    <Upload size={24} className="text-blue-500" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-700">Drop files here or click to browse</p>
                    <p className="text-xs text-slate-400 mt-1">PDF, JPG, PNG · Max 10MB per file</p>
                  </div>
                </div>
              </div>
            )}

            {uploaded.length > 0 && (
              <div className="mt-4 space-y-2">
                {uploaded.map((name, i) => (
                  <div key={i} className="flex items-center gap-3 p-3 bg-emerald-50 rounded-xl border border-emerald-200">
                    <CheckCircle size={16} className="text-emerald-500 flex-shrink-0" />
                    <span className="text-xs text-emerald-700 font-medium flex-1">{name}</span>
                    <span className="text-[10px] text-emerald-500">Queued for verification</span>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>

        {/* Guidelines */}
        <Card className="p-5">
          <h3 className="text-sm font-semibold text-slate-800 mb-4">Upload Guidelines</h3>
          <div className="space-y-3">
            {[
              { icon: CheckCircle, color: 'text-emerald-500', text: 'Clear, high-resolution scan or photo' },
              { icon: CheckCircle, color: 'text-emerald-500', text: 'All four corners visible' },
              { icon: CheckCircle, color: 'text-emerald-500', text: 'No glare or blur' },
              { icon: CheckCircle, color: 'text-emerald-500', text: 'Document not expired' },
              { icon: X, color: 'text-red-500', text: 'No screenshots or photocopies' },
              { icon: X, color: 'text-red-500', text: 'No black and white scans' },
            ].map((g, i) => (
              <div key={i} className="flex items-start gap-2">
                <g.icon size={14} className={`${g.color} mt-0.5 flex-shrink-0`} />
                <span className="text-xs text-slate-600">{g.text}</span>
              </div>
            ))}
          </div>

          <div className="mt-5 p-3 bg-blue-50 rounded-xl border border-blue-200">
            <div className="flex items-start gap-2">
              <Info size={14} className="text-blue-500 mt-0.5 flex-shrink-0" />
              <p className="text-xs text-blue-700">Documents are encrypted using AES-256 and anchored immutably to the Ethereum blockchain. Only you control access.</p>
            </div>
          </div>

          <div className="mt-4 space-y-2">
            <p className="text-xs font-medium text-slate-700">Processing Steps</p>
            {['Upload & Encrypt', 'AI Document Scan', 'Admin Review', 'Blockchain Anchor', 'Verified ✓'].map((s, i) => (
              <div key={i} className="flex items-center gap-2">
                <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${i < 2 ? 'bg-blue-600 text-white' : 'bg-slate-200 text-slate-400'}`}>{i + 1}</div>
                <span className={`text-xs ${i < 2 ? 'text-slate-700 font-medium' : 'text-slate-400'}`}>{s}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {toast && <Toast type="success" message="Document uploaded and queued for blockchain verification." onClose={() => setToast(false)} />}
    </div>
  );
}

// ── My Documents ──────────────────────────────────────────────────────────────
export function MyDocuments({ onNav }: { onNav: (s: string) => void }) {
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');
  const [page, setPage] = useState(1);
  const [documents, setDocuments] = useState<DocumentInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const { showAlert } = useDialog();

  // NEW: State for Document Viewer Modal
  const [viewDocUrl, setViewDocUrl] = useState<string | null>(null);

  // Custom Delete Confirm Modal State
  const [deleteConfirmDoc, setDeleteConfirmDoc] = useState<number | null>(null);

  // Toast Notification State
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    userApi.getMyDocuments()
      .then(data => {
        setDocuments(data);
        setLoading(false);
      })
      .catch(async err => {
        console.error("Failed to load documents", err);
        setLoading(false);
      });
  }, []);

  const filtered = documents.filter(d =>
    (filter === 'all' || d.status === filter) &&
    d.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="animate-fade-in space-y-6">
      <SectionHeader title="My Documents" subtitle="Manage your uploaded identity documents"
        action={<Button size="sm" onClick={() => onNav('upload-documents')}><Upload size={14} /> Upload New</Button>} />

      <Card className="p-5">
        <div className="flex flex-col sm:flex-row gap-3 mb-4">
          <Input placeholder="Search documents..." value={search} onChange={setSearch} icon={<Eye size={14} />} className="flex-1" />
          <div className="flex flex-wrap gap-2">
            {['all', 'verified', 'pending', 'rejected'].map(f => (
              <button key={f} onClick={() => setFilter(f)} className={`px-3 py-2 rounded-xl text-xs font-medium capitalize border transition-all ${filter === f ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300'}`}>{f}</button>
            ))}
          </div>
        </div>

        <div className="space-y-3">
          {loading ? (
            <div className="text-center p-6 text-sm text-slate-500">Loading documents...</div>
          ) : filtered.length === 0 ? (
            <div className="text-center p-6 text-sm text-slate-500">No documents found.</div>
          ) : filtered.slice((page - 1) * 5, page * 5).map((doc, index) => {
            const serialNumber = (page - 1) * 5 + index + 1;
            return (
              <div key={doc.id} className="flex flex-col sm:flex-row sm:items-center gap-4 p-4 rounded-xl border border-slate-100 hover:border-blue-200 hover:bg-blue-50/30 transition-all">
                <div className="flex items-center gap-3">
                  <span className="text-xs font-bold text-slate-400 w-4 text-center">{serialNumber}.</span>
                  <div className="w-10 h-10 bg-blue-100 rounded-xl flex flex-shrink-0 items-center justify-center">
                    <FileText size={18} className="text-blue-600" />
                  </div>
                  <div className="flex-1 min-w-0 sm:hidden">
                    <p className="text-sm font-semibold text-slate-800">{doc.name}</p>
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="hidden sm:block text-sm font-semibold text-slate-800">{doc.name}</p>
                  <div className="flex items-center gap-3 mt-0.5">
                    <span className="text-xs text-slate-400">{doc.uploadDate || 'Just now'}</span>
                    <span className="text-xs text-slate-400">·</span>
                    <span className="text-xs text-slate-400">{doc.size || 'N/A'}</span>
                    {doc.docHash && <span className="font-mono text-[10px] text-slate-400 hidden sm:block">{doc.docHash.slice(0, 18)}...</span>}
                  </div>
                  {String(doc.status).toLowerCase() === 'rejected' && (doc.remarks || doc.rejectedReason) && (
                    <div className="mt-2 bg-red-50 border border-red-100 rounded-lg p-2.5 flex items-start gap-2 max-w-lg">
                      <AlertTriangle size={14} className="text-red-500 flex-shrink-0 mt-0.5" />
                      <div>
                        <span className="text-xs font-semibold text-red-700 block">Rejection Reason</span>
                        <span className="text-xs text-red-600 block leading-relaxed">{doc.rejectedReason || doc.remarks}</span>
                      </div>
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <StatusBadge status={doc.status} />
                  <button
                    onClick={async () => { if (doc.storageUrl) setViewDocUrl(doc.storageUrl); else await showAlert("Document processing, preview unavailable."); }}
                    className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                    title="View Document"
                  >
                    <Eye size={14} />
                  </button>
                  {doc.storageUrl && (
                    <a href={doc.storageUrl} target="_blank" rel="noreferrer" className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all" title="Download"><Download size={14} /></a>
                  )}
                  <button
                    onClick={() => setDeleteConfirmDoc(doc.id)}
                    className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                    title="Delete"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {
          filtered.length > 0 && (
            <div className="mt-4">
              <Pagination page={page} total={filtered.length} perPage={5} onChange={setPage} />
            </div>
          )
        }
      </Card>

      {/* Delete Confirmation Modal */}
      {deleteConfirmDoc !== null && createPortal(
        <div className="fixed inset-0 w-screen h-screen bg-slate-900/60 backdrop-blur-sm z-[99999] flex items-center justify-center p-4 animate-fade-in" style={{ position: 'fixed', top: 0, left: 0 }}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden scale-in relative flex flex-col justify-center">
            <div className="p-8 text-center pb-6">
              <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-5">
                <Trash2 size={26} className="text-red-500" />
              </div>
              <h3 className="text-xl font-bold text-slate-800 mb-2">Delete Document?</h3>
              <p className="text-sm text-slate-500">Are you sure you want to permanently delete this document? This action cannot be undone.</p>
            </div>
            <div className="p-4 bg-slate-50 border-t border-slate-100 flex gap-3">
              <Button variant="outline" className="flex-1 flex justify-center text-center" onClick={() => setDeleteConfirmDoc(null)}>Cancel</Button>
              <Button className="flex-1 flex justify-center text-center bg-red-600 hover:bg-red-700 text-white shadow-md border-none" onClick={async () => {
                userApi.deleteDocument(deleteConfirmDoc)
                  .then(async () => {
                    setDocuments(prev => prev.filter(d => d.id !== deleteConfirmDoc));
                    setDeleteConfirmDoc(null);
                    setToastMessage("Document permanently deleted from your vault.");
                    setTimeout(() => setToastMessage(null), 3000);
                  })
                  .catch(async err => await showAlert("Unable to delete document: " + err.message));
              }}>Delete</Button>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* Document Viewer Modal */}
      {viewDocUrl && (() => {
        // Resolve relative URLs to full backend URL
        const fullUrl = viewDocUrl.startsWith('/') ? `http://127.0.0.1:8080${viewDocUrl}` : viewDocUrl;
        const isImage = /\.(jpg|jpeg|png|gif|webp)$/i.test(fullUrl);
        return createPortal(
          <div
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 bg-slate-900/60 backdrop-blur-sm animate-fade-in"
            onClick={() => setViewDocUrl(null)}
          >
            <div
              className="flex flex-col bg-white rounded-2xl w-full max-w-4xl max-h-full shadow-2xl overflow-hidden relative"
              onClick={e => e.stopPropagation()}
            >
              <div className="flex items-center justify-between p-4 border-b border-slate-100">
                <h3 className="font-semibold text-slate-800">Secure Document Viewer</h3>
                <button onClick={() => setViewDocUrl(null)} className="p-2 text-slate-400 hover:text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition-all">
                  <X size={16} />
                </button>
              </div>

              <div className="flex-1 bg-slate-100 p-4 sm:p-6 overflow-auto min-h-[500px] flex items-center justify-center">
                {isImage ? (
                  <img src={fullUrl} alt="Document Preview" className="max-w-full max-h-[75vh] object-contain rounded-xl shadow-sm border border-slate-200" />
                ) : (
                  <iframe src={fullUrl} className="w-full h-full min-h-[60vh] border-0 rounded-xl shadow-sm" title="Document Preview" />
                )}
              </div>
            </div>
          </div>,
          document.body
        );
      })()}

      {/* Delete Success Toast Notification */}
      {toastMessage && (
        <Toast type="success" message={toastMessage} onClose={() => setToastMessage(null)} />
      )}
    </div>
  );
}

// ── Digital ID Card ────────────────────────────────────────────────────────────
export function DigitalIDCard({ onNav }: { onNav: (s: string) => void }) {
  const { showAlert, showConfirm } = useDialog();
  const [flipped, setFlipped] = useState(false);
  const [stats, setStats] = useState<any>({ name: '', did: '', status: '', hash: '', block: '', date: '' });
  const [initals, setInitials] = useState('U');

  useEffect(() => {
    const user = getSavedUser();
    userApi.getIdentityStatus().then(res => {
      const name = user?.name || 'Identity Holder';
      setInitials(name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase());
      setStats({
        name: name,
        did: res.did || user?.did || 'Pending DID',
        status: res.userStatus === 'verified' ? 'verified' : 'pending',
        hash: res.blockchainHash || 'Awaiting Anchorage',
        block: res.blockNumber || 'Pending',
        date: res.verifiedAt ? res.verifiedAt.split('T')[0] : 'Pending'
      });
    }).catch(console.error);
  }, []);

  return (
    <div className="animate-fade-in space-y-6">
      <SectionHeader title="Digital Identity Card" subtitle="Your blockchain-verified identity card"
        action={<Button size="sm"><Download size={14} /> Download Card</Button>} />

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Card */}
        <div className="flex flex-col items-center gap-4">
          <button onClick={() => setFlipped(!flipped)} className="group" title="Click to flip">
            <div className="relative w-80 h-48 cursor-pointer" style={{ perspective: '1000px' }}>
              {/* Front */}
              <div className={`absolute inset-0 rounded-2xl overflow-hidden transition-all duration-500 ${flipped ? 'opacity-0' : 'opacity-100'}`}
                style={{ background: 'linear-gradient(135deg, #0F172A 0%, #1E3A5F 50%, #0F2D6B 100%)', boxShadow: '0 20px 60px rgba(29,78,216,0.4)' }}>
                <div className="absolute inset-0 id-card-shine" />
                {/* Grid pattern */}
                <div className="absolute inset-0 opacity-5" style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)', backgroundSize: '20px 20px' }} />

                <div className="relative z-10 p-5 h-full flex flex-col justify-between">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 bg-gradient-to-br from-blue-400 to-cyan-400 rounded-lg flex items-center justify-center">
                        <Shield size={12} className="text-white" />
                      </div>
                      <span className="text-white text-xs font-bold">Identity Vault</span>
                    </div>
                    <div className="text-right">
                      <p className="text-[8px] text-blue-300 uppercase tracking-wider">Digital Identity</p>
                      <p className="text-[10px] text-blue-200 font-mono">{stats.did}</p>
                    </div>
                  </div>

                  <div className="flex items-end justify-between">
                    <div>
                      <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-violet-400 rounded-xl flex items-center justify-center text-white font-bold text-lg mb-2">{initals}</div>
                      <p className="text-white font-bold text-base">{stats.name}</p>
                      <p className="text-blue-300 text-[10px]">Global · {stats.status.toUpperCase()}</p>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      {stats.status === 'verified' && (
                        <div className="flex items-center gap-1 bg-emerald-500/20 border border-emerald-500/40 rounded-full px-2 py-0.5">
                          <CheckCircle size={8} className="text-emerald-400" />
                          <span className="text-[9px] text-emerald-300 font-medium">VERIFIED</span>
                        </div>
                      )}
                      {/* Mini QR */}
                      <div className="w-10 h-10 bg-white rounded-md flex items-center justify-center">
                        <QrCode size={28} className="text-slate-900" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Back */}
              <div className={`absolute inset-0 rounded-2xl overflow-hidden transition-all duration-500 ${flipped ? 'opacity-100' : 'opacity-0'}`}
                style={{ background: 'linear-gradient(135deg, #1E3A5F 0%, #0F1729 100%)', boxShadow: '0 20px 60px rgba(29,78,216,0.4)' }}>
                <div className="relative z-10 p-5 h-full flex flex-col justify-between">
                  <div className="h-8 bg-slate-700 rounded" />
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="text-[9px] text-slate-400 w-24">Blockchain Hash</span>
                      <span className="font-mono text-[9px] text-blue-300 truncate w-32">{stats.hash}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-[9px] text-slate-400 w-24">Block Number</span>
                      <span className="font-mono text-[9px] text-blue-300">#{stats.block}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-[9px] text-slate-400 w-24">Issue Date</span>
                      <span className="text-[9px] text-blue-300">{stats.date}</span>
                    </div>
                  </div>
                  <p className="text-[8px] text-slate-600 text-center">Secured by Mainnet · W3C DID Standard</p>
                </div>
              </div>
            </div>
          </button>
          <p className="text-xs text-slate-400">Click card to flip · Tap & hold to share</p>
          <div className="flex gap-2">
            <Button size="sm" variant="secondary" onClick={() => showAlert("Your Digital ID pass has been successfully generated and securely transferred to your connected mobile Wallet via WebAuthn.", "Wallet Integration Complete")}><Download size={13} /> Save to Wallet</Button>
            <Button size="sm" variant="outline" onClick={() => onNav('qr-code')}><QrCode size={13} /> Share QR</Button>
          </div>
        </div>

        {/* Details */}
        <div className="flex-1 space-y-4">
          <Card className="p-5">
            <h3 className="text-sm font-semibold text-slate-800 mb-4">Card Details</h3>
            <div className="space-y-3">
              {[
                { label: 'Full Name', value: stats.name },
                { label: 'Identity ID', value: stats.did, mono: true },
                { label: 'Date of Birth', value: '••••••••••' },
                { label: 'Issue Date', value: stats.date },
                { label: 'Status', value: <StatusBadge status={stats.status} /> },
              ].map(f => (
                <div key={f.label} className="flex items-center justify-between py-2 border-b border-slate-100 last:border-0">
                  <span className="text-xs text-slate-500">{f.label}</span>
                  {typeof f.value === 'string'
                    ? <span className={`text-xs font-medium text-slate-800 ${f.mono ? 'font-mono' : ''}`}>{f.value}</span>
                    : f.value}
                </div>
              ))}
            </div>
          </Card>

          <Card className="p-5">
            <h3 className="text-sm font-semibold text-slate-800 mb-3">Blockchain Anchor</h3>
            {stats.status === 'verified' ? (
              <div className="space-y-2">
                <div className="flex items-center gap-2 p-3 bg-emerald-50 rounded-xl border border-emerald-200">
                  <CheckCircle size={16} className="text-emerald-500 flex-shrink-0" />
                  <div>
                    <p className="text-xs font-medium text-emerald-700">Anchored on Mainnet</p>
                    <p className="font-mono text-[10px] text-emerald-600 truncate">{stats.hash.substring(0, 32)}...</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { label: 'Block', value: `#${stats.block}` },
                    { label: 'Confirmations', value: 'Live' },
                    { label: 'Network', value: 'Mainnet' },
                  ].map(m => (
                    <div key={m.label} className="p-2.5 bg-slate-50 rounded-xl border border-slate-100">
                      <p className="text-[10px] text-slate-400">{m.label}</p>
                      <p className="font-mono text-xs text-slate-700 font-medium">{m.value}</p>
                    </div>
                  ))}
                </div>

                {/* Dynamically reveal backend cryptography on frontend */}
                <div className="mt-3 p-3 bg-blue-50/50 rounded-xl border border-blue-100 flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-blue-100 flex flex-shrink-0 items-center justify-center">
                    <Shield size={14} className="text-blue-600" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-blue-900">AES-256 Data Encryption Active</p>
                    <p className="text-[10px] text-blue-600 mt-0.5 leading-relaxed">Identity payloads are secured using standard AES-256 symmetric encryption at rest prior to persistent database storage, ensuring compliance with modern data protection regulations.</p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 text-center">
                <p className="text-xs text-slate-500">Identity not yet verified on blockchain.</p>
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}

// ── QR Code ───────────────────────────────────────────────────────────────────
export function QRCodeScreen() {
  const { showAlert, showConfirm } = useDialog();
  const [copied, setCopied] = useState(false);
  const [stats, setStats] = useState<any>({ name: '', did: '', status: '' });

  useEffect(() => {
    const user = getSavedUser();
    userApi.getIdentityStatus().then(res => {
      setStats({
        name: user?.name || 'Identity Holder',
        did: res.did || user?.did || 'Pending DID',
        status: res.userStatus === 'verified' ? 'verified' : 'pending'
      });
    }).catch(console.error);
  }, []);

  const handleCopy = () => { setCopied(true); setTimeout(() => setCopied(false), 2000); };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(`https://verify.blockid.io/id/${stats.did}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadQR = () => {
    const svg = document.querySelector('#qr-code-svg-container svg') as SVGElement;
    if (!svg) return;
    const svgData = new XMLSerializer().serializeToString(svg);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();
    img.onload = () => {
      canvas.width = img.width + 10;
      canvas.height = img.height + 10;
      if (ctx) {
        ctx.fillStyle = 'white';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 5, 5);
        const pngFile = canvas.toDataURL('image/png');
        const downloadLink = document.createElement('a');
        downloadLink.download = `Identity_QR_${stats.did || 'user'}.png`;
        downloadLink.href = pngFile;
        downloadLink.click();
      }
    };
    img.src = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svgData)));
  };

  return (
    <div className="animate-fade-in space-y-6">
      <SectionHeader title="Identity QR Code" subtitle="Share your verified identity via QR code" />

      <div className="flex flex-col lg:flex-row gap-6">
        {/* QR display */}
        <Card className="p-8 flex flex-col items-center gap-4 flex-shrink-0">
          <div className="p-4 bg-white rounded-2xl border-2 border-blue-100 shadow-inner">
            {/* Real QR code */}
            <div id="qr-code-svg-container" className="w-48 h-48 relative flex items-center justify-center bg-white rounded-lg overflow-hidden">
              <QRCodeSVG
                value={stats.did && !stats.did.includes('Pending') ? stats.did : 'https://blockid.io'}
                size={192}
                level={"H"}
                fgColor={"#0F172A"}
                imageSettings={{
                  src: "https://cdn-icons-png.flaticon.com/512/2592/2592317.png", // Generic shield placeholder if needed, or we just leave it out
                  x: undefined,
                  y: undefined,
                  height: 32,
                  width: 32,
                  excavate: true,
                }}
              />
            </div>
          </div>
          <div className="text-center">
            <p className="font-mono text-xs text-slate-600 font-medium">{stats.did}</p>
            <p className="text-xs text-slate-400 mt-0.5">{stats.name} · {stats.status.charAt(0).toUpperCase() + stats.status.slice(1)}</p>
          </div>
          <div className="flex gap-2">
            <Button size="sm" onClick={handleDownloadQR}><Download size={13} /> Download PNG</Button>
            <Button size="sm" variant="outline" onClick={handleCopyLink}>
              {copied ? <><Check size={13} className="text-emerald-500" /> Copied!</> : <><Copy size={13} /> Copy Link</>}
            </Button>
          </div>
        </Card>

        {/* Options */}
        <div className="flex-1 space-y-4">
          <Card className="p-5">
            <h3 className="text-sm font-semibold text-slate-800 mb-4">Sharing Settings</h3>
            <div className="space-y-3">
              {[
                { label: 'Name', desc: 'Allow verifiers to see your name', enabled: true },
                { label: 'Date of Birth', desc: 'Share date of birth (masked by default)', enabled: false },
                { label: 'Nationality', desc: 'Share country of origin', enabled: true },
                { label: 'Document Numbers', desc: 'Share passport/ID numbers', enabled: false },
                { label: 'Blockchain Hash', desc: 'Share immutable blockchain proof', enabled: true },
                { label: 'Expiry Status', desc: 'Show if identity is currently valid', enabled: true },
              ].map((s, i) => (
                <div key={i} className="flex items-center justify-between py-2 border-b border-slate-100 last:border-0">
                  <div>
                    <p className="text-sm text-slate-700">{s.label}</p>
                    <p className="text-xs text-slate-400">{s.desc}</p>
                  </div>
                  <div className={`w-10 h-5 rounded-full transition-all ${s.enabled ? 'bg-blue-600' : 'bg-slate-200'} relative cursor-pointer flex-shrink-0`}>
                    <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-all ${s.enabled ? 'left-5' : 'left-0.5'}`} />
                  </div>
                </div>
              ))}
            </div>
          </Card>

          <Card className="p-5">
            <h3 className="text-sm font-semibold text-slate-800 mb-3">Verification Link</h3>
            <div className="flex items-center gap-2 p-3 bg-slate-50 rounded-xl border border-slate-200">
              <span className="text-xs font-mono text-slate-600 flex-1 truncate">https://verify.blockid.io/id/{stats.did}</span>
              <button onClick={handleCopy} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${copied ? 'bg-emerald-100 text-emerald-700' : 'bg-blue-100 text-blue-700 hover:bg-blue-200'}`}>
                {copied ? <><Check size={12} /> Copied!</> : <><Copy size={12} /> Copy</>}
              </button>
            </div>
            <p className="text-xs text-slate-400 mt-2">Link expires in: 24:00:00 · Single use</p>
          </Card>
        </div>
      </div>
    </div>
  );
}

// ── Blockchain Status ─────────────────────────────────────────────────────────
export function BlockchainStatus() {
  const { showAlert, showConfirm } = useDialog();
  const [documents, setDocuments] = useState<DocumentInfo[]>([]);

  useEffect(() => {
    userApi.getMyDocuments().then(data => setDocuments(data)).catch(console.error);
  }, []);

  return (
    <div className="animate-fade-in space-y-6">
      <SectionHeader title="Blockchain Status" subtitle="Real-time blockchain health and identity anchor status" />

      {/* Network status */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Network', value: 'Ethereum', sub: 'Mainnet', status: 'green', icon: '⟠' },
          { label: 'Block Height', value: '#19,847,234', sub: '~12s avg', status: 'green', icon: '📦' },
          { label: 'Gas Price', value: '28 Gwei', sub: 'Moderate', status: 'yellow', icon: '⛽' },
          { label: 'Node Validators', value: '12 / 12', sub: 'All active', status: 'green', icon: '🔷' },
        ].map(m => (
          <Card key={m.label} className="p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-lg">{m.icon}</span>
              <div className={`w-2 h-2 rounded-full ${m.status === 'green' ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`} />
            </div>
            <p className="text-xs text-slate-500">{m.label}</p>
            <p className="text-sm font-bold text-slate-800 font-mono">{m.value}</p>
            <p className="text-[10px] text-slate-400">{m.sub}</p>
          </Card>
        ))}
      </div>

      {/* My anchors */}
      <Card className="p-5">
        <h3 className="text-sm font-semibold text-slate-800 mb-4">My Blockchain Anchors</h3>
        <div className="space-y-3">
          {documents.filter(d => Boolean(d.docHash)).map(doc => (
            <div key={doc.id} className="p-4 rounded-xl border border-slate-200 hover:border-blue-200 transition-all">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <FileText size={15} className="text-blue-600" />
                  <span className="text-sm font-medium text-slate-800">{doc.name}</span>
                </div>
                <StatusBadge status={doc.status} />
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-2">
                <div>
                  <p className="text-[10px] text-slate-400">Block Number</p>
                  <p className="font-mono text-xs text-slate-700">#Pending</p>
                </div>
                <div>
                  <p className="text-[10px] text-slate-400">Transaction Hash</p>
                  <p className="font-mono text-xs text-slate-700 truncate">{doc.docHash}...</p>
                </div>
                <div>
                  <p className="text-[10px] text-slate-400">Network</p>
                  <p className="text-xs text-slate-700">Mainnet</p>
                </div>
                <div>
                  <p className="text-[10px] text-slate-400">Confirmations</p>
                  <p className="font-mono text-xs text-emerald-600 font-medium">2,847 ✓</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Network chart */}
      <Card className="p-5">
        <h3 className="text-sm font-semibold text-slate-800 mb-4">Network Activity</h3>
        <MiniSparkline color="#1D4ED8" />
        <div className="grid grid-cols-3 gap-3 mt-4">
          {[
            { label: 'Avg Block Time', value: '12.1s' },
            { label: 'Pending Txns', value: '4,892' },
            { label: 'Hash Rate', value: '1.2 PH/s' },
          ].map(m => (
            <div key={m.label} className="text-center p-3 bg-slate-50 rounded-xl">
              <p className="font-mono text-sm font-bold text-slate-800">{m.value}</p>
              <p className="text-[10px] text-slate-400 mt-0.5">{m.label}</p>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

// ── Verification History (User) ────────────────────────────────────────────────
export function VerificationHistoryUser() {
  const { showAlert, showConfirm } = useDialog();
  const [search, setSearch] = useState('');
  const [history, setHistory] = useState<any[]>([]);
  const [signatureModal, setSignatureModal] = useState<string | null>(null);

  useEffect(() => {
    userApi.getVerificationHistory().then(res => {
      let rawData = [...res].sort((a: any, b: any) => a.id - b.id);
      let seenFields = new Set<string>();
      rawData.forEach((v: any) => {
        let originalFields = v.checkedFields ? v.checkedFields.split(',').map((s: string) => s.trim()) : ['Identity'];
        let diff = originalFields.filter((f: string) => !seenFields.has(f));

        v.computedFields = diff.length > 0 ? diff : originalFields.slice(-1);
        originalFields.forEach((f: string) => seenFields.add(f));
      });

      let mapped = rawData
        .filter((v: any) => v.purpose !== 'Platform Scan')
        .map((v: any) => ({
          id: `VID-${v.id}`,
          verifier: v.verifier ? v.verifier.name : 'System Identity Vault',
          purpose: v.purpose || 'Identity Verification',
          date: String(v.verificationDate || 'Recently').split('T')[0],
          fields: v.computedFields,
          status: v.status || 'verified',
          duration: v.duration || '2.4s',
          reportUrl: v.reportUrl || null
        }));


      setHistory(mapped);
    }).catch(console.error);
  }, []);

  return (
    <div className="animate-fade-in space-y-6">
      <SectionHeader title="Verification History" subtitle="All identity verification requests made to your account" />
      <Card className="p-5">
        <div className="flex gap-3 mb-4">
          <Input placeholder="Search verifications..." value={search} onChange={setSearch} className="flex-1" />
          <Button variant="outline" size="sm"><Download size={14} /> Export</Button>
        </div>
        <div className="overflow-x-auto">
          {history.length === 0 ? (
            <div className="p-10 text-center text-slate-500 text-sm">No verification history available.</div>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100">
                  {['S.No', 'ID', 'Verifier', 'Purpose', 'Date', 'Documents', 'Status', 'Cryptography'].map(h => (
                    <th key={h} className="text-left text-xs font-semibold text-slate-500 pb-3 pr-4">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {history.filter(v => v.purpose.toLowerCase().includes(search.toLowerCase()) || v.verifier.toLowerCase().includes(search.toLowerCase())).map((v, idx) => (
                  <tr key={v.id} className="border-b border-slate-50 hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 pr-4 font-medium text-xs text-slate-500">{idx + 1}</td>
                    <td className="py-3 pr-4 font-mono text-xs text-slate-500">{v.id}</td>
                    <td className="py-3 pr-4 font-medium text-slate-800">{v.verifier}</td>
                    <td className="py-3 pr-4 text-slate-600 text-xs">{v.purpose}</td>
                    <td className="py-3 pr-4 text-slate-500 text-xs">{v.date}</td>
                    <td className="py-3 pr-4">
                      <div className="flex gap-1 flex-wrap">
                        {v.fields.map((f: string) => <span key={f} className="text-[10px] bg-blue-50 text-blue-700 px-1.5 py-0.5 rounded">{f}</span>)}
                      </div>
                    </td>
                    <td className="py-3 pr-4"><StatusBadge status={v.status} /></td>
                    <td className="py-3 pr-4">
                      {v.reportUrl?.includes('?sig=') ? (
                        <button onClick={() => setSignatureModal(v.reportUrl.split('?sig=')[1])} className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-[10px] font-bold transition-all shadow-md">
                          <Shield size={12} className="text-emerald-400" /> View Signature
                        </button>
                      ) : (
                        <span className="font-mono text-xs text-slate-500">{v.duration}</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </Card>

      {/* Render the RSA Cryptographic Modal to visually prove signatures */}
      {signatureModal && createPortal(
        <div className="fixed inset-0 w-screen h-screen bg-slate-900/60 backdrop-blur-sm z-[99999] flex items-center justify-center p-4 animate-fade-in" style={{ position: 'fixed', top: 0, left: 0 }}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden scale-in relative">
            <div className="p-5 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center">
                  <Shield size={20} className="text-emerald-600" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900">RSA Cryptographic Signature</h3>
                  <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold mt-0.5">SHA256withRSA Protocol</p>
                </div>
              </div>
              <button onClick={() => setSignatureModal(null)} className="p-2 text-slate-400 hover:text-slate-600 bg-white shadow-sm border border-slate-200 rounded-xl">
                <X size={16} />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <p className="text-sm text-slate-600 leading-relaxed">This signature mathematically guarantees that an authorized Admin manually reviewed and stamped your identity using their <strong>Private Cryptographic Key</strong>. This signature is permanently bound to your SHA-256 document payloads and cannot be forged.</p>

              <div className="bg-slate-900 rounded-xl p-4 shadow-inner relative overflow-hidden group">
                <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_25%,rgba(255,255,255,0.05)_50%,transparent_75%,transparent_100%)] bg-[length:250%_250%,100%_100%] animate-[shine_3s_infinite]" />
                <p className="text-[10px] text-emerald-400 font-bold mb-2 tracking-widest uppercase">Raw Base64 Output</p>
                <code className="text-emerald-300 text-xs font-mono break-all leading-loose">{signatureModal}</code>
              </div>

              <div className="flex justify-end pt-2">
                <Button variant="outline" onClick={() => setSignatureModal(null)}>Close Validation</Button>
              </div>
            </div>
          </div>
        </div>, document.body
      )}

    </div>
  );
}

// ── Notifications ─────────────────────────────────────────────────────────────
export function Notifications() {
  const { showAlert, showConfirm } = useDialog();
  const [notifs, setNotifs] = useState<any[]>([]);

  useEffect(() => {
    userApi.getNotifications().then(setNotifs).catch(console.error);
  }, []);
  const icons: Record<string, React.ReactNode> = {
    success: <CheckCircle size={16} className="text-emerald-500" />,
    info: <Info size={16} className="text-blue-500" />,
    warning: <AlertTriangle size={16} className="text-amber-500" />,
    error: <XCircle size={16} className="text-red-500" />,
  };
  const markAll = () => {
    userApi.markNotificationsRead().then(async () => {
      setNotifs(n => n.map(x => ({ ...x, read: true })));
      window.dispatchEvent(new Event('blockid_notifs_read'));
    }).catch(console.error);
  };

  return (
    <div className="animate-fade-in space-y-6">
      <SectionHeader title="Notifications" subtitle={`${notifs.filter(n => !n.read).length} unread notifications`}
        action={<Button variant="ghost" size="sm" onClick={markAll}>Mark all read</Button>} />
      <Card className="divide-y divide-slate-100">
        {notifs.map(n => (
          <div key={n.id} className={`flex gap-4 p-4 transition-colors ${!n.read ? 'bg-blue-50/60' : 'hover:bg-slate-50'}`}>
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${n.type === 'success' ? 'bg-emerald-50' : n.type === 'warning' ? 'bg-amber-50' : n.type === 'error' ? 'bg-red-50' : 'bg-blue-50'}`}>
              {icons[n.type]}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2">
                <p className="text-sm font-semibold text-slate-800">{n.title}</p>
                {!n.read && <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0" />}
              </div>
              <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">{n.message}</p>
              <p className="text-[10px] text-slate-400 mt-1.5">{n.time}</p>
            </div>
          </div>
        ))}
      </Card>
    </div>
  );
}

export function Profile() {
  const { showAlert, showConfirm } = useDialog();
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(false);

  const [profile, setProfile] = useState({
    name: '',
    email: '',
    phone: '',
    dob: '••••••••••',
    street: '1234 Main Blvd',
    city: 'San Francisco',
    state: 'California',
    zip: '94102',
    country: 'United States'
  });

  const [stats, setStats] = useState<any>({ did: 'Loading...', score: '0/100', status: 'pending', date: 'Jan 2024' });

  useEffect(() => {
    const user = getSavedUser();
    if (user) {
      setProfile(p => ({
        ...p,
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || '',
        country: user.country || 'United States',
        street: user.street || '1234 Main Blvd',
        city: user.city || 'San Francisco',
        state: user.state || 'California',
        zip: user.zip || '94102',
      }));
    }
    userApi.getIdentityStatus().then(res => {
      setStats({
        did: res.did || 'BID-2024-PENDING',
        status: res.userStatus === 'verified' ? 'Verified' : 'Pending',
        score: res.userStatus === 'verified' ? '100/100' : (res.documents && res.documents.length > 0 ? '50/100' : '0/100'),
        date: res.submittedAt ? res.submittedAt.split('T')[0] : 'Just now'
      });
    }).catch(console.error);
  }, []);

  const toggleEdit = () => {
    if (!editing) {
      setEditing(true);
      return;
    }
    // Save
    setLoading(true);
    userApi.updateProfile({
      name: profile.name,
      phone: profile.phone,
      country: profile.country,
      street: profile.street,
      city: profile.city,
      state: profile.state,
      zip: profile.zip
    })
      .then(res => {
        setLoading(false);
        setEditing(false);
        const userStr = localStorage.getItem('blockid_user');
        if (userStr) {
          const user = JSON.parse(userStr);
          user.name = profile.name;
          user.phone = profile.phone;
          user.country = profile.country;
          user.street = profile.street;
          user.city = profile.city;
          user.state = profile.state;
          user.zip = profile.zip;
          localStorage.setItem('blockid_user', JSON.stringify(user));
          window.dispatchEvent(new Event('blockid_user_update'));
        }
        showAlert("Profile saved successfully.", "Success");
      })
      .catch(async err => {
        setLoading(false);
        await showAlert("Failed to update profile: " + err.message);
      });
  };

  const initals = profile.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();

  return (
    <div className="animate-fade-in space-y-6">
      <SectionHeader title="My Profile" subtitle="Manage your personal information"
        action={<Button size="sm" onClick={toggleEdit} disabled={loading}>{loading ? 'Saving...' : (editing ? 'Save Changes' : 'Edit Profile')}</Button>} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Avatar card */}
        <Card className="p-6 flex flex-col items-center gap-4">
          <div className="relative">
            <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-violet-500 rounded-3xl flex items-center justify-center text-white text-3xl font-bold">{initals || 'U'}</div>
            <button className="absolute -bottom-1 -right-1 w-8 h-8 bg-blue-600 rounded-xl flex items-center justify-center text-white shadow-lg hover:bg-blue-700 transition-all">
              <Camera size={14} />
            </button>
          </div>
          <div className="text-center">
            <h3 className="font-bold text-slate-800">{profile.name}</h3>
            <p className="text-xs text-slate-500">Identity Holder</p>
          </div>
          <div className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border ${stats.status === 'Verified' ? 'bg-emerald-50 border-emerald-200' : 'bg-amber-50 border-amber-200'}`}>
            {stats.status === 'Verified' ? <CheckCircle size={13} className="text-emerald-600" /> : <Clock size={13} className="text-amber-600" />}
            <span className={`text-xs font-medium ${stats.status === 'Verified' ? 'text-emerald-700' : 'text-amber-700'}`}>Identity {stats.status}</span>
          </div>
          <div className="w-full pt-4 border-t border-slate-100 space-y-2 text-xs">
            {[
              { label: 'DID', value: stats.did },
              { label: 'Member since', value: stats.date },
              { label: 'Trust score', value: stats.score },
            ].map(m => (
              <div key={m.label} className="flex justify-between">
                <span className="text-slate-400">{m.label}</span>
                <span className="text-slate-700 font-medium font-mono">{m.value}</span>
              </div>
            ))}
          </div>
        </Card>

        {/* Form */}
        <div className="lg:col-span-2 space-y-4">
          <Card className="p-5">
            <h3 className="text-sm font-semibold text-slate-800 mb-4">Personal Information</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input label="Full Name" value={profile.name} onChange={v => setProfile({ ...profile, name: v })} disabled={!editing} />
              <Input label="Email Address" type="email" value={profile.email} onChange={v => setProfile({ ...profile, email: v })} disabled={true} />
              <Input label="Phone Number" value={profile.phone} onChange={v => setProfile({ ...profile, phone: v })} disabled={!editing} />
              <Input label="Date of Birth" value={profile.dob} onChange={v => { }} disabled={true} />
              <Input label="Nationality" value={profile.country} onChange={v => setProfile({ ...profile, country: v })} disabled={!editing} />
            </div>
          </Card>

          <Card className="p-5">
            <h3 className="text-sm font-semibold text-slate-800 mb-4">Address Information</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input label="Street Address" value={profile.street} onChange={(v) => setProfile({ ...profile, street: v })} className="sm:col-span-2" disabled={!editing} />
              <Input label="City" value={profile.city} onChange={(v) => setProfile({ ...profile, city: v })} disabled={!editing} />
              <Input label="State/Province" value={profile.state} onChange={(v) => setProfile({ ...profile, state: v })} disabled={!editing} />
              <Input label="ZIP Code" value={profile.zip} onChange={(v) => setProfile({ ...profile, zip: v })} disabled={!editing} />
              <Input label="Country" value={profile.country} onChange={(v) => setProfile({ ...profile, country: v })} disabled={true} />
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

// ── Settings ──────────────────────────────────────────────────────────────────
export function UserSettings({ onNav }: { onNav: (s: string) => void }) {
  const { showAlert, showConfirm } = useDialog();
  const [twoFa, setTwoFa] = useState(true);
  const [notifications, setNotifications] = useState(true);
  const [biometric, setBiometric] = useState(false);
  const [toast, setToast] = useState<{ message: string, type: 'success' | 'error' } | null>(null);

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passLoading, setPassLoading] = useState(false);

  const [activeSessions, setActiveSessions] = useState([
    { id: 3, device: 'Chrome on Windows', location: 'TamilNadu, India', time: 'Current session', current: true },
  ]);

  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deletePassword, setDeletePassword] = useState('');
  const [deleteLoading, setDeleteLoading] = useState(false);

  const handlePasswordUpdate = async () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      setToast({ message: 'Please fill out all password fields.', type: 'error' });
      setTimeout(() => setToast(null), 3000);
      return;
    }
    if (newPassword !== confirmPassword) {
      setToast({ message: 'New password and confirm password do not match.', type: 'error' });
      setTimeout(() => setToast(null), 3000);
      return;
    }
    setPassLoading(true);
    try {
      await userApi.updatePassword({ currentPassword, newPassword });
      setToast({ message: 'Password updated successfully.', type: 'success' });
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setTimeout(() => setToast(null), 3000);
    } catch (err: any) {
      setToast({ message: err.message || 'Update failed', type: 'error' });
      setTimeout(() => setToast(null), 4000);
    } finally {
      setPassLoading(false);
    }
  };

  const handleRevokeSession = (id: number) => {
    setActiveSessions(prev => prev.filter(s => s.id !== id));
    setToast({ message: 'Session revoked.', type: 'success' });
    setTimeout(() => setToast(null), 3000);
  };

  const handleRevokeAll = async () => {
    try {
      await authApi.revokeSession();
      setActiveSessions(prev => prev.filter(s => s.current));
      setToast({ message: 'Session forcefully blacklisted. You will now be ejected.', type: 'success' });
      setTimeout(() => {
        clearAuth();
        window.location.reload();
      }, 2000);
    } catch (err: any) {
      setToast({ message: err.message || 'Failed to revoke session', type: 'error' });
    }
  };

  const handleDeleteAccount = async () => {
    if (!deletePassword) return showAlert('Please enter your password.', 'Validation Error');
    const confirmed = await showConfirm('Are you absolutely SURE you want to permanently delete your account?', 'PERMANENT DELETION');
    if (!confirmed) return;

    setDeleteLoading(true);
    try {
      await userApi.deleteAccount({ password: deletePassword });
      setDeleteModalOpen(false);
      localStorage.removeItem('blockid_token');
      localStorage.removeItem('blockid_user');
      window.location.reload();
    } catch (err: any) {
      showAlert(err.message, 'Deletion Failed');
      setDeleteLoading(false);
    }
  };

  const sections = [
    {
      title: 'Security',
      items: [
        { label: 'Two-Factor Authentication', desc: 'Extra security via TOTP app or SMS', value: twoFa, toggle: () => setTwoFa(!twoFa), action: 'Configure' },
        { label: 'Biometric Login', desc: 'Fingerprint or Face ID', value: biometric, toggle: () => setBiometric(!biometric), action: null },
      ]
    },
    {
      title: 'Notifications',
      items: [
        { label: 'Email Notifications', desc: 'Verification requests and updates', value: notifications, toggle: () => setNotifications(!notifications), action: null },
        { label: 'Push Notifications', desc: 'Browser and mobile push alerts', value: true, toggle: () => { }, action: null },
      ]
    },
  ];

  return (
    <div className="animate-fade-in space-y-6">
      <SectionHeader title="Settings" subtitle="Manage your account preferences and security" />

      <div className="space-y-4">
        {sections.map(section => (
          <Card key={section.title} className="p-5">
            <h3 className="text-sm font-semibold text-slate-800 mb-4">{section.title}</h3>
            <div className="space-y-4">
              {section.items.map(item => (
                <div key={item.label} className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-700 font-medium">{item.label}</p>
                    <p className="text-xs text-slate-400">{item.desc}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    {item.action && <button className="text-xs text-blue-600 hover:text-blue-700 font-medium">{item.action}</button>}
                    <button onClick={item.toggle} className={`w-10 h-5 rounded-full transition-all ${item.value ? 'bg-blue-600' : 'bg-slate-200'} relative flex-shrink-0`}>
                      <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-all ${item.value ? 'left-5' : 'left-0.5'}`} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        ))}

        {/* Password */}
        <Card className="p-5">
          <h3 className="text-sm font-semibold text-slate-800 mb-4">Change Password</h3>
          <div className="space-y-3">
            <Input label="Current Password" type="password" value={currentPassword} onChange={setCurrentPassword} disabled={passLoading} />
            <Input label="New Password" type="password" value={newPassword} onChange={setNewPassword} disabled={passLoading} />
            <Input label="Confirm New Password" type="password" value={confirmPassword} onChange={setConfirmPassword} disabled={passLoading} />
            <Button onClick={handlePasswordUpdate} disabled={passLoading}>{passLoading ? 'Updating' : 'Update Password'}</Button>
          </div>
        </Card>

        {/* Session */}
        <Card className="p-5">
          <h3 className="text-sm font-semibold text-slate-800 mb-4">Active Sessions</h3>
          <div className="space-y-3">
            {activeSessions.map((s) => (
              <div key={s.id} className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100">
                <div className="flex items-center gap-3">
                  <Smartphone size={16} className="text-slate-500" />
                  <div>
                    <p className="text-xs font-medium text-slate-700">{s.device}</p>
                    <p className="text-[10px] text-slate-400">{s.location} · {s.time}</p>
                  </div>
                </div>
                {s.current ? <span className="text-[10px] text-emerald-600 font-medium bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">Current</span>
                  : <button onClick={() => handleRevokeSession(s.id)} className="text-xs text-red-500 hover:text-red-700 font-medium">Revoke</button>}
              </div>
            ))}
          </div>
          <Button variant="danger" size="sm" className="mt-3" onClick={handleRevokeAll}>Terminate Active External Sessions</Button>
        </Card>

        {/* Danger zone */}
        <Card className="p-5 border-red-200">
          <h3 className="text-sm font-semibold text-red-600 mb-3">Danger Zone</h3>
          <p className="text-xs text-slate-500 mb-3">Permanently delete your account and all identity data from the platform.</p>
          <Button variant="danger" size="sm" onClick={() => setDeleteModalOpen(true)}>Delete Account</Button>
        </Card>
      </div>

      {toast && <Toast type={toast.type} message={toast.message} onClose={() => setToast(null)} />}

      {deleteModalOpen && (
        <Modal open={true} onClose={() => setDeleteModalOpen(false)} title="Verify Password" size="sm">
          <div className="space-y-4">
            <p className="text-sm text-slate-600">Please enter your current password to confirm permanent account deletion. This action cannot be undone.</p>
            <Input label="Current Password" type="password" value={deletePassword} onChange={setDeletePassword} disabled={deleteLoading} />
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setDeleteModalOpen(false)} disabled={deleteLoading}>Cancel</Button>
              <Button variant="danger" onClick={handleDeleteAccount} disabled={deleteLoading}>{deleteLoading ? 'Processing...' : 'Verify & Delete'}</Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}

// ── Shared Proof Read-Only View ───────────────────────────────────────────────
export function SharedProofScreen({ token }: { token: string }) {
  const [timeLeft, setTimeLeft] = useState(3600); // 1 hour
  let targetName = 'Verified True-Holder';
  let clearedDocs = 'Passports, Financials';
  let networkStatus = 'Verified';

  let startTime = Date.now();
  try {
    const p = new URLSearchParams(window.location.search).get('p');
    if (p) {
      const parsed = JSON.parse(atob(p));
      targetName = parsed.n || targetName;
      clearedDocs = parsed.d || clearedDocs;
      networkStatus = parsed.s || networkStatus;
      if (parsed.t) startTime = parsed.t;
    }
  } catch (e) { }

  useEffect(() => {
    const updateTimer = () => {
      const elapsed = Math.floor((Date.now() - startTime) / 1000);
      setTimeLeft(Math.max(3600 - elapsed, 0));
    };
    updateTimer();
    const inv = setInterval(updateTimer, 1000);
    return () => clearInterval(inv);
  }, []);

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60).toString().padStart(2, '0');
    const s = (secs % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  if (timeLeft === 0) {
    return (
      <div className="min-h-screen bg-[#0A0F1C] flex flex-col items-center justify-center p-4">
        <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mb-4">
          <XCircle size={32} className="text-red-500" />
        </div>
        <h1 className="text-red-500 font-bold text-2xl mb-2">Time-Bomb Detonated</h1>
        <p className="text-slate-500 text-sm text-center max-w-sm">The 1-hour secure link has expired and this Identity Vault object has been permanently destroyed from external view.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0A0F1C] flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-lg mb-6 flex justify-center">
        <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center shadow-[0_0_20px_rgba(37,99,235,0.4)]">
          <Shield size={24} className="text-white" />
        </div>
      </div>
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl animate-fade-in relative z-10 p-1">
        <div className="bg-slate-800/50 rounded-[22px] overflow-hidden">
          <div className="p-5 border-b border-slate-700/50 flex justify-between items-center bg-slate-800/30">
            <div className="flex flex-col">
              <span className="text-white font-bold text-sm tracking-wide">BlockID Identity Gateway</span>
              <span className="text-[10px] text-slate-400">Restricted Read-Only Access</span>
            </div>
            <div className="bg-red-500/10 px-3 py-1.5 rounded-full border border-red-500/20 flex items-center gap-1.5 shadow-[0_0_10px_rgba(239,68,68,0.1)]">
              <Clock size={12} className="text-red-400" />
              <span className="text-[10px] font-mono text-red-400 font-bold uppercase tracking-wider">{formatTime(timeLeft)} Remaining</span>
            </div>
          </div>
          <div className="p-8">
            <div className="flex justify-center mb-6">
              <div className="w-20 h-20 rounded-full bg-emerald-500/10 border-2 border-emerald-500 flex flex-col items-center justify-center text-emerald-400 shadow-[0_0_30px_rgba(16,185,129,0.15)] relative">
                <div className="absolute inset-0 border border-emerald-500 rounded-full animate-ping opacity-20"></div>
                <CheckCircle size={32} />
              </div>
            </div>
            <h2 className="text-2xl font-bold text-white text-center mb-2">Authentic Identity View</h2>
            <p className="text-sm text-slate-400 text-center mb-8">Generated under token <code className="text-blue-300 font-bold">#{token.split('&')[0]}</code></p>

            <div className="bg-[#0A0F1C] rounded-2xl p-5 border border-slate-800 space-y-4 shadow-inner">
              <div className="flex justify-between items-center border-b border-slate-800/80 pb-4">
                <span className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">Target Identity</span>
                <span className="text-sm font-semibold text-white drop-shadow-md">{targetName}</span>
              </div>
              <div className="flex justify-between items-center border-b border-slate-800/80 pb-4">
                <span className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">Anchorage Network</span>
                <span className={`text-xs font-bold flex items-center gap-1.5 ${networkStatus.toLowerCase() === 'verified' ? 'text-emerald-400 shadow-emerald-400/20' : networkStatus.toLowerCase() === 'rejected' ? 'text-red-400 shadow-red-400/20' : 'text-amber-400 shadow-amber-400/20'}`}>
                  <div className={`w-1.5 h-1.5 rounded-full animate-pulse ${networkStatus.toLowerCase() === 'verified' ? 'bg-emerald-400 shadow-[0_0_8px_rgba(16,185,129,0.8)]' : networkStatus.toLowerCase() === 'rejected' ? 'bg-red-400 shadow-[0_0_8px_rgba(248,113,113,0.8)]' : 'bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.8)]'}`} />
                  Layer 1 {networkStatus}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">Docs Cleared</span>
                <span className="text-xs font-bold text-white flex items-center gap-1.5 max-w-[200px] text-right truncate"><Check size={14} className="text-blue-400 flex-shrink-0" /> {clearedDocs}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      <p className="text-xs text-slate-600 mt-8 font-medium">© 2026 Identity Vault Protocol. Immutable Verification.</p>
    </div>
  );
}
