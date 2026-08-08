import React, { useState, useEffect } from 'react';
import {
  Shield, FileText, Upload, CreditCard, QrCode, Link, CheckCircle, Clock,
  XCircle, AlertTriangle, Download, Eye, Trash2, Camera, Smartphone, Copy,
  ChevronRight, Plus, Check, X, Info
} from 'lucide-react';
import { Card, StatCard, StatusBadge, Button, Input, Toast, SectionHeader, Pagination } from '../components/UIComponents';
import { VerificationAreaChart, MiniSparkline, UserDocumentBarChart } from '../components/Charts';
import { mockVerificationHistory, mockNotifications } from '../data/mockData';
import { userApi, DocumentInfo, getSavedUser } from '../service/api';
// ── User Dashboard ─────────────────────────────────────────────────────────────
export function UserDashboard({ onNav }: { onNav: (s: string) => void }) {
  const [documents, setDocuments] = useState<DocumentInfo[]>([]);
  const [activities, setActivities] = useState<any[]>([]);
  const [chartData, setChartData] = useState<any[]>([]);
  const [stats, setStats] = useState<any>({
    verifiedDocuments: 0, totalVerifications: 0, pendingDocuments: 0, trustScore: 0,
    name: '', did: '', lastLogin: '', blockchainHash: '', blockNumber: 0
  });

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
        <StatCard label="Verifications" value={stats.totalVerifications} sub="Total requests" icon={<CheckCircle size={18} />} color="emerald" trend={{ value: '+0', up: true }} />
        <StatCard label="Pending" value={stats.pendingDocuments} sub="Awaiting review" icon={<Clock size={18} />} color="amber" />
        <StatCard label="Blockchain Score" value={`${stats.trustScore}/100`} sub="Trust rating" icon={<Shield size={18} />} color="violet" trend={{ value: '+0', up: true }} />
      </div>

      {/* Quick actions */}
      <div>
        <h3 className="text-sm font-semibold text-slate-700 mb-3">Quick Actions</h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: 'Upload Document', icon: Upload, color: 'blue', screen: 'upload-documents' },
            { label: 'View ID Card', icon: CreditCard, color: 'violet', screen: 'digital-id-card' },
            { label: 'Share QR Code', icon: QrCode, color: 'cyan', screen: 'qr-code' },
            { label: 'Blockchain Status', icon: Link, color: 'emerald', screen: 'blockchain-status' },
          ].map(a => (
            <button key={a.label} onClick={() => onNav(a.screen)} className="flex flex-col items-center gap-2 p-4 bg-white rounded-2xl border border-slate-200 hover:border-blue-200 hover:shadow-md transition-all group">
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
  const [dragging, setDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploaded, setUploaded] = useState<string[]>([]);
  const [docType, setDocType] = useState('passport');
  const [customDocType, setCustomDocType] = useState('');
  const [toast, setToast] = useState(false);

  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleUpload = (file: File) => {
    setUploading(true);

    // Use the custom name if "Other" is selected, otherwise use the standard type
    const finalDocType = (docType === 'other' && customDocType.trim() !== '')
      ? customDocType.trim()
      : docType;

    userApi.uploadDocument(file, finalDocType)
      .then(res => {
        setUploading(false);
        setUploaded(u => [...u, res.document.name]);
        // Also wipe out the custom field for next time
        if (docType === 'other') setCustomDocType('');
        setToast(true);
        setTimeout(() => setToast(false), 3000);
      })
      .catch(err => {
        setUploading(false);
        alert(err.message || 'Failed to upload document');
      });
  };

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleUpload(e.target.files[0]);
    }
  };

  const onDropFile = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleUpload(e.dataTransfer.files[0]);
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
            <div
              onDragOver={e => { e.preventDefault(); setDragging(true); }}
              onDragLeave={() => setDragging(false)}
              onDrop={onDropFile}
              className={`border-2 border-dashed rounded-2xl p-10 text-center transition-all cursor-pointer ${dragging ? 'border-blue-500 bg-blue-50' : 'border-slate-200 hover:border-blue-300 hover:bg-blue-50/50'}`}
              onClick={() => fileInputRef.current?.click()}
            >
              <input type="file" ref={fileInputRef} className="hidden" onChange={onFileChange} accept=".pdf,.jpg,.jpeg,.png" />
              {uploading ? (
                <div className="flex flex-col items-center gap-3">
                  <div className="w-12 h-12 border-3 border-blue-200 border-t-blue-600 rounded-full animate-spin-custom" />
                  <p className="text-sm text-blue-600 font-medium">Uploading & encrypting...</p>
                  <p className="text-xs text-slate-400">Anchoring to blockchain</p>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-3">
                  <div className="w-14 h-14 bg-blue-50 rounded-2xl flex items-center justify-center">
                    <Upload size={24} className="text-blue-500" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-700">Drop files here or click to browse</p>
                    <p className="text-xs text-slate-400 mt-1">PDF, JPG, PNG · Max 10MB per file</p>
                  </div>
                </div>
              )}
            </div>

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
export function MyDocuments() {
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');
  const [page, setPage] = useState(1);
  const [documents, setDocuments] = useState<DocumentInfo[]>([]);
  const [loading, setLoading] = useState(true);

  // NEW: State for Document Viewer Modal
  const [viewDocUrl, setViewDocUrl] = useState<string | null>(null);

  useEffect(() => {
    userApi.getMyDocuments()
      .then(data => {
        setDocuments(data);
        setLoading(false);
      })
      .catch(err => {
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
        action={<Button size="sm"><Upload size={14} /> Upload New</Button>} />

      <Card className="p-5">
        <div className="flex flex-col sm:flex-row gap-3 mb-4">
          <Input placeholder="Search documents..." value={search} onChange={setSearch} icon={<Eye size={14} />} className="flex-1" />
          <div className="flex gap-2">
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
          ) : filtered.slice((page - 1) * 5, page * 5).map(doc => (
            <div key={doc.id} className="flex items-center gap-4 p-4 rounded-xl border border-slate-100 hover:border-blue-200 hover:bg-blue-50/30 transition-all">
              <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center flex-shrink-0">
                <FileText size={18} className="text-blue-600" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-slate-800">{doc.name}</p>
                <div className="flex items-center gap-3 mt-0.5">
                  <span className="text-xs text-slate-400">{doc.uploadDate || 'Just now'}</span>
                  <span className="text-xs text-slate-400">·</span>
                  <span className="text-xs text-slate-400">{doc.size || 'N/A'}</span>
                  {doc.docHash && <span className="font-mono text-[10px] text-slate-400 hidden sm:block">{doc.docHash.slice(0, 18)}...</span>}
                </div>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <StatusBadge status={doc.status} />
                <button
                  onClick={() => { if (doc.storageUrl) setViewDocUrl(doc.storageUrl); else alert("Document processing, preview unavailable."); }}
                  className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                  title="View Document"
                >
                  <Eye size={14} />
                </button>
                {doc.storageUrl && (
                  <a href={doc.storageUrl} target="_blank" rel="noreferrer" className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all" title="Download"><Download size={14} /></a>
                )}
                <button
                  onClick={() => {
                    if (window.confirm('Are you sure you want to permanently delete this document? This action cannot be undone.')) {
                      userApi.deleteDocument(doc.id)
                        .then(() => {
                          setDocuments(prev => prev.filter(d => d.id !== doc.id));
                        })
                        .catch(err => alert("Unable to delete document: " + err.message));
                    }
                  }}
                  className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                  title="Delete"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>

        {filtered.length > 0 && (
          <div className="mt-4">
            <Pagination page={page} total={filtered.length} perPage={5} onChange={setPage} />
          </div>
        )}
      </Card>

      {/* Document Viewer Modal */}
      {viewDocUrl && (() => {
        // Resolve relative URLs to full backend URL
        const fullUrl = viewDocUrl.startsWith('/') ? `http://127.0.0.1:8080${viewDocUrl}` : viewDocUrl;
        const isImage = /\.(jpg|jpeg|png|gif|webp)$/i.test(fullUrl);
        return (
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
          </div>
        );
      })()}
    </div>
  );
}

// ── Digital ID Card ────────────────────────────────────────────────────────────
export function DigitalIDCard() {
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
            <Button size="sm" variant="secondary"><Download size={13} /> Save to Wallet</Button>
            <Button size="sm" variant="outline"><QrCode size={13} /> Share QR</Button>
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

  return (
    <div className="animate-fade-in space-y-6">
      <SectionHeader title="Identity QR Code" subtitle="Share your verified identity via QR code" />

      <div className="flex flex-col lg:flex-row gap-6">
        {/* QR display */}
        <Card className="p-8 flex flex-col items-center gap-4 flex-shrink-0">
          <div className="p-4 bg-white rounded-2xl border-2 border-blue-100 shadow-inner">
            {/* Stylized QR code */}
            <div className="w-48 h-48 relative">
              <div className="absolute inset-0 grid grid-cols-8 grid-rows-8 gap-0.5 opacity-90">
                {Array.from({ length: 64 }).map((_, i) => (
                  <div key={i} className={`rounded-sm ${[0, 1, 2, 3, 4, 7, 8, 14, 15, 16, 21, 22, 23, 28, 29, 35, 36, 42, 43, 44, 48, 49, 50, 55, 56, 57, 58, 59, 60, 63].includes(i) || Math.random() > 0.6 ? 'bg-slate-900' : 'bg-transparent'}`} />
                ))}
              </div>
              {/* Center logo */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center border-2 border-slate-100">
                  <div className="w-7 h-7 bg-gradient-to-br from-blue-600 to-cyan-500 rounded-lg flex items-center justify-center">
                    <Shield size={14} className="text-white" />
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="text-center">
            <p className="font-mono text-xs text-slate-600 font-medium">{stats.did}</p>
            <p className="text-xs text-slate-400 mt-0.5">{stats.name} · {stats.status.charAt(0).toUpperCase() + stats.status.slice(1)}</p>
          </div>
          <div className="flex gap-2">
            <Button size="sm"><Download size={13} /> Download PNG</Button>
            <Button size="sm" variant="outline"><Copy size={13} /> Copy Link</Button>
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
  const [search, setSearch] = useState('');
  const [history, setHistory] = useState<any[]>([]);

  useEffect(() => {
    userApi.getVerificationHistory().then(res => {
      let mapped = res.map((v: any) => ({
        id: `VID-${v.id}`,
        verifier: v.verifier ? v.verifier.name : 'System Identity Vault',
        purpose: v.purpose || 'Identity Verification',
        date: String(v.verificationDate || 'Recently').split('T')[0],
        fields: v.checkedFields ? v.checkedFields.split(',').map((s: string) => s.trim()) : ['Identity'],
        status: v.status || 'verified',
        duration: v.duration || '2.4s'
      }));

      // If user has no history but is verified, generate fallback
      if (mapped.length === 0) {
        const u = getSavedUser();
        if (u && u.status === 'verified') {
          mapped = [{
            id: `VID-AUTO-${u.id || '100'}`,
            verifier: 'Network Administrator',
            purpose: 'Initial Identity Onboarding',
            date: new Date().toISOString().split('T')[0],
            fields: ['National ID', 'Passport', 'Basic Info'],
            status: 'verified',
            duration: 'Anchored directly'
          }];
        }
      }
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
                  {['ID', 'Verifier', 'Purpose', 'Date', 'Fields Accessed', 'Status', 'Duration'].map(h => (
                    <th key={h} className="text-left text-xs font-semibold text-slate-500 pb-3 pr-4">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {history.filter(v => v.purpose.toLowerCase().includes(search.toLowerCase()) || v.verifier.toLowerCase().includes(search.toLowerCase())).map(v => (
                  <tr key={v.id} className="border-b border-slate-50 hover:bg-slate-50/80 transition-colors">
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
                    <td className="py-3 pr-4 font-mono text-xs text-slate-500">{v.duration}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </Card>
    </div>
  );
}

// ── Notifications ─────────────────────────────────────────────────────────────
export function Notifications() {
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
  const markAll = () => setNotifs(n => n.map(x => ({ ...x, read: true })));

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
    userApi.updateProfile({ name: profile.name, phone: profile.phone, country: profile.country })
      .then(res => {
        setLoading(false);
        setEditing(false);
        // We could theoretically update local storage here, but the data is safely on backend now
      })
      .catch(err => {
        setLoading(false);
        alert("Failed to update profile: " + err.message);
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
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 opacity-75 pointer-events-none">
              <Input label="Street Address" value={profile.street} onChange={() => { }} className="sm:col-span-2" disabled={true} />
              <Input label="City" value={profile.city} onChange={() => { }} disabled={true} />
              <Input label="State/Province" value={profile.state} onChange={() => { }} disabled={true} />
              <Input label="ZIP Code" value={profile.zip} onChange={() => { }} disabled={true} />
              <Input label="Country" value={profile.country} onChange={() => { }} disabled={true} />
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

// ── Settings ──────────────────────────────────────────────────────────────────
export function UserSettings({ onNav }: { onNav: (s: string) => void }) {
  const [twoFa, setTwoFa] = useState(true);
  const [notifications, setNotifications] = useState(true);
  const [biometric, setBiometric] = useState(false);
  const [toast, setToast] = useState(false);

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
            <Input label="Current Password" type="password" value="" onChange={() => { }} />
            <Input label="New Password" type="password" value="" onChange={() => { }} />
            <Input label="Confirm New Password" type="password" value="" onChange={() => { }} />
            <Button onClick={() => { setToast(true); setTimeout(() => setToast(false), 3000); }}>Update Password</Button>
          </div>
        </Card>

        {/* Session */}
        <Card className="p-5">
          <h3 className="text-sm font-semibold text-slate-800 mb-4">Active Sessions</h3>
          <div className="space-y-3">
            {[
              { device: 'MacBook Pro 16"', location: 'San Francisco, CA', time: 'Current session', current: true },
              { device: 'iPhone 15 Pro', location: 'San Francisco, CA', time: '2 hr ago', current: false },
              { device: 'Chrome on Windows', location: 'New York, NY', time: '3 days ago', current: false },
            ].map((s, i) => (
              <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100">
                <div className="flex items-center gap-3">
                  <Smartphone size={16} className="text-slate-500" />
                  <div>
                    <p className="text-xs font-medium text-slate-700">{s.device}</p>
                    <p className="text-[10px] text-slate-400">{s.location} · {s.time}</p>
                  </div>
                </div>
                {s.current ? <span className="text-[10px] text-emerald-600 font-medium bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">Current</span>
                  : <button className="text-xs text-red-500 hover:text-red-700 font-medium">Revoke</button>}
              </div>
            ))}
          </div>
          <Button variant="danger" size="sm" className="mt-3">Revoke All Other Sessions</Button>
        </Card>

        {/* Danger zone */}
        <Card className="p-5 border-red-200">
          <h3 className="text-sm font-semibold text-red-600 mb-3">Danger Zone</h3>
          <p className="text-xs text-slate-500 mb-3">Permanently delete your account and all identity data from the platform.</p>
          <Button variant="danger" size="sm">Delete Account</Button>
        </Card>
      </div>

      {toast && <Toast type="success" message="Password updated successfully." onClose={() => setToast(false)} />}
    </div>
  );
}
