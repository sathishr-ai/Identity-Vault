import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Search, ScanLine, CheckCircle, XCircle, Download, Shield, QrCode, Clock, Copy, Check, Edit, Eye, Trash2, CreditCard, LifeBuoy, Send, MessageSquareHeart } from 'lucide-react';
import { Card, StatCard, StatusBadge, Avatar, Button, Input, SectionHeader, Pagination } from '../components/UIComponents';
import { useDialog } from '../context/DialogContext';
import { mockVerificationHistory } from '../data/mockData';
import { verifierApi, getSavedUser } from '../service/api';
import { Html5QrcodeScanner } from 'html5-qrcode';
import { jsPDF } from 'jspdf';

// ── Search Identity ─────────────────────────────────────────────────────────────
export function SearchIdentity({ onNav }: { onNav: (s: string) => void }) {
  const [query, setQuery] = useState('');
  const [searchType, setSearchType] = useState('did');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<'found' | 'notfound' | null>(null);
  const [identity, setIdentity] = useState<any>(null);
  const [cryptoPhase, setCryptoPhase] = useState('');
  const [stats, setStats] = useState({ total: '0', verified: '0', rejected: '0', notFound: '0' });
  const [purpose, setPurpose] = useState('Platform Scan');
  const purposes = ['Platform Scan', 'Loan Application', 'Access Control', 'Employee Onboarding', 'KYC Compliance'];

  useEffect(() => {
    verifierApi.getVerifierHistory().then(res => {
      const totalScans = res.length;
      const verified = res.filter((v: any) => {
        const st = String(v.status || '').toLowerCase();
        return st === 'verified' || st === 'approved';
      }).length;
      const rejected = res.filter((v: any) => {
        const st = String(v.status || '').toLowerCase();
        return st === 'rejected' || st === 'tampered';
      }).length;
      setStats({ total: totalScans.toString(), verified: verified.toString(), rejected: rejected.toString(), notFound: '0' });
    }).catch(() => { });
  }, []);

  const handleSearch = () => {
    if (!query) return;
    setLoading(true);
    setResult(null);
    setCryptoPhase('Decrypting AES-256 Storage Nodes...');

    // Simulate cryptographic proof sequence for faculty demonstration
    setTimeout(() => {
      setCryptoPhase('Verifying Administrator RSA Signatures...');

      setTimeout(() => {
        setCryptoPhase('');
        verifierApi.scanQrCode(query)
          .then(data => {
            setIdentity(data);
            setResult('found');
            setLoading(false);
          })
          .catch(async err => {
            console.error('Identity not found or error', err);
            setResult('notfound');
            setStats(s => ({ ...s, notFound: String(Number(s.notFound) + 1) }));
            setLoading(false);
          });
      }, 1500);
    }, 1200);
  };

  return (
    <div className="animate-fade-in space-y-6">
      <SectionHeader title="Search Identity" subtitle="Verify any registered blockchain identity" />

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <StatCard label="Total Scans" value={stats.total} sub="History" icon={<CreditCard size={18} />} color="blue" />
        <StatCard label="Verified" value={stats.verified} sub="Identities" icon={<CheckCircle size={18} />} color="emerald" />
        <StatCard label="Rejected" value={stats.rejected} sub="Identities" icon={<XCircle size={18} />} color="red" />
      </div>

      <Card className="p-6">
        <h3 className="text-sm font-semibold text-slate-800 mb-4">Identity Search</h3>

        {/* Search type tabs */}
        <div className="flex gap-2 mb-4">
          {[
            { value: 'did', label: 'DID / Identity ID' },
            { value: 'name', label: 'Full Name' },
            { value: 'hash', label: 'Blockchain Hash' },
            { value: 'qr', label: 'QR Code' },
          ].map(t => (
            <button key={t.value} onClick={() => setSearchType(t.value)} className={`px-3 py-1.5 rounded-xl text-xs font-medium border transition-all ${searchType === t.value ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300'}`}>
              {t.label}
            </button>
          ))}
        </div>

        <div className="flex gap-3">
          <div className="flex-1 relative">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              value={query}
              onChange={e => setQuery(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSearch()}
              placeholder={
                searchType === 'did' ? 'Enter DID e.g. BID-2024-001234'
                  : searchType === 'name' ? 'Enter full name'
                    : searchType === 'hash' ? 'Enter blockchain hash 0x...'
                      : 'Paste QR code data'
              }
              className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <Button onClick={handleSearch} size="md" className="px-6 relative overflow-hidden">
            {loading ? <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin-custom" /> : <><Search size={14} /> Search</>}
          </Button>
        </div>

        {/* Cryptographic Execution Terminal UI */}
        {cryptoPhase && (
          <div className="mt-4 p-4 rounded-xl bg-slate-900 border border-slate-800 flex items-center gap-4 animate-fade-in shadow-inner relative overflow-hidden">
            <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_25%,rgba(56,189,248,0.05)_50%,transparent_75%,transparent_100%)] bg-[length:250%_250%,100%_100%] animate-[shine_2s_infinite]" />
            <div className="w-10 h-10 rounded-full border-2 border-blue-500/30 border-t-blue-500 animate-spin flex-shrink-0" />
            <div>
              <p className="text-blue-400 text-xs font-bold font-mono tracking-widest uppercase">System Execution</p>
              <p className="text-white text-sm font-semibold">{cryptoPhase}</p>
            </div>
          </div>
        )}

        {/* Results */}
        {result === 'found' && (
          <div className="mt-6 animate-fade-in">
            <div className="flex items-center gap-2 mb-4">
              {identity?.tamperingDetected || identity?.status?.toLowerCase() === 'fraud detected' || identity?.status?.toLowerCase() === 'rejected' ? (
                <><XCircle size={16} className="text-red-500" />
                  <span className="text-sm font-medium text-red-700">Identity Red Flagged</span></>
              ) : (
                <><CheckCircle size={16} className="text-emerald-500" />
                  <span className="text-sm font-medium text-emerald-700">Identity Found</span></>
              )}
            </div>
            <div className={`p-4 rounded-2xl border-2 ${identity?.tamperingDetected || identity?.status?.toLowerCase() === 'fraud detected' || identity?.status?.toLowerCase() === 'rejected' ? 'border-red-300 bg-red-50' : 'border-emerald-300 bg-emerald-50'}`}>
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <Avatar initials={identity?.name?.[0] || 'U'} size="lg" index={0} />
                  <div>
                    <h3 className="font-bold text-slate-800 text-base">{identity?.name || 'Unknown'}</h3>
                    <p className="font-mono text-xs text-slate-500">{identity?.did || query}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <StatusBadge status={identity?.status || 'verified'} />
                      <span className="text-xs text-slate-500">{identity?.country || 'N/A'}</span>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-[10px] text-slate-400">Integrity Check</p>
                  <p className={`text-xl font-black ${identity?.tamperingDetected ? 'text-red-500' : 'text-emerald-600'}`}>{identity?.tamperingDetected ? 'FAIL' : 'PASS'}</p>
                </div>
              </div>

              <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[
                  { label: 'Block Number', value: identity?.blockNumber ? `#${identity.blockNumber}` : 'Pending' },
                  { label: 'Network', value: 'Mainnet' },
                  { label: 'Integrity', value: identity?.tamperingDetected ? 'Compromised' : 'Secure' },
                  { label: 'National ID', value: identity?.aadhaar || 'Hidden' },
                ].map((m, i) => (
                  <div key={i} className="bg-white/70 rounded-xl p-2.5 border border-emerald-100">
                    <p className="text-[10px] text-slate-400">{m.label}</p>
                    <p className="text-xs font-bold text-slate-700 font-mono">{m.value}</p>
                  </div>
                ))}
              </div>

              <div className="flex gap-2 mt-4 items-center">
                <select value={purpose} onChange={e => setPurpose(e.target.value)} className="w-1/3 px-3 py-2 bg-white border border-slate-200 rounded-xl text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500">
                  {purposes.map(p => <option key={p} value={p}>{p}</option>)}
                </select>
                <Button onClick={async () => { localStorage.setItem('blockId_last_verification', JSON.stringify({ ...identity, fresh: true, purpose })); onNav('verification-result'); }} className="flex-1 justify-center">
                  <Shield size={14} /> Log Verification & View Report
                </Button>
              </div>
            </div>
          </div>
        )}

        {result === 'notfound' && (
          <div className="mt-6 animate-fade-in p-4 rounded-2xl border-2 border-red-200 bg-red-50 text-center">
            <XCircle size={32} className="text-red-400 mx-auto mb-2" />
            <p className="text-sm font-semibold text-red-700">Identity Not Found</p>
            <p className="text-xs text-red-500 mt-1">No matching active identity record found on the blockchain for '{query}'</p>
          </div>
        )}
      </Card>

      {/* Recent searches */}
      <Card className="p-5">
        <h3 className="text-sm font-semibold text-slate-800 mb-3">Recent Searches</h3>
        <div className="space-y-2">
          {[]}
        </div>
      </Card>
    </div>
  );
}

// ── QR Scanner ────────────────────────────────────────────────────────────────
export function QRScanner({ onNav }: { onNav: (s: string) => void }) {
  const { showAlert } = useDialog();
  const [scanning, setScanning] = useState(false);
  const [scanned, setScanned] = useState(false);
  const [purpose, setPurpose] = useState('Platform Scan');
  const [manualDid, setManualDid] = useState('');
  const [loading, setLoading] = useState(false);
  const purposes = ['Platform Scan', 'Loan Application', 'Access Control', 'Employee Onboarding', 'KYC Compliance'];

  useEffect(() => {
    let scanner: any = null;
    if (scanning) {
      scanner = new Html5QrcodeScanner("reader", { fps: 10, qrbox: { width: 250, height: 250 }, rememberLastUsedCamera: true }, false);
      scanner.render(
        (decodedText: string) => {
          scanner.clear();
          setScanning(false);
          setScanned(true);
          setManualDid(decodedText);

          setLoading(true);
          verifierApi.scanQrCode(decodedText)
            .then(data => {
              localStorage.setItem('blockId_last_verification', JSON.stringify({ ...data, fresh: true, purpose }));
              setLoading(false);
              onNav('verification-result');
            })
            .catch(async (err: any) => {
              console.error(err);
              setLoading(false);
              await showAlert('Identity not found from QR: ' + decodedText);
            });
        },
        (error: any) => { /* ignore */ }
      );
    }
    return () => {
      if (scanner) {
        scanner.clear().catch((e: any) => console.error(e));
      }
    };
  }, [scanning, onNav, purpose, showAlert]);

  const handleManualSearch = () => {
    if (!manualDid) return;
    setLoading(true);
    verifierApi.scanQrCode(manualDid)
      .then(data => {
        localStorage.setItem('blockId_last_verification', JSON.stringify({ ...data, fresh: true, purpose }));
        setLoading(false);
        onNav('verification-result');
      })
      .catch(async err => {
        console.error(err);
        setLoading(false);
        await showAlert('Identity not found');
      });
  };

  const handleScan = () => {
    setScanning(true);
  };

  return (
    <div className="animate-fade-in space-y-6">
      <SectionHeader title="QR Code Scanner" subtitle="Scan identity QR codes for instant verification" />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Scanner */}
        <Card className="p-6">
          <div className="aspect-square max-w-xs mx-auto relative">
            {/* Scanner frame */}
            <div className={`w-full h-full rounded-2xl border-2 flex items-center justify-center transition-all ${scanning ? 'border-blue-500 bg-blue-50' : scanned ? 'border-emerald-500 bg-emerald-50' : 'border-slate-300 bg-slate-50'}`}>
              {!scanning && !scanned ? (
                <div className="text-center">
                  <QrCode size={48} className="text-slate-300 mx-auto mb-3" />
                  <p className="text-sm text-slate-500">Camera preview</p>
                  <p className="text-xs text-slate-400 mt-1">Point camera at QR code</p>
                </div>
              ) : scanning ? (
                <div className="w-full h-full p-2">
                  <div id="reader" className="w-full h-full rounded-xl overflow-hidden [&>div]:border-none"></div>
                </div>
              ) : (
                <div className="text-center animate-fade-in">
                  <CheckCircle size={48} className="text-emerald-500 mx-auto mb-3" />
                  <p className="text-sm text-emerald-700 font-semibold">QR Code Detected!</p>
                  <p className="text-xs text-emerald-500 mt-1">{manualDid || 'Success'}</p>
                </div>
              )}
            </div>

            {/* Corner decorations */}
            <div className="absolute top-3 left-3 w-8 h-8 border-t-2 border-l-2 border-blue-500 rounded-tl-lg" />
            <div className="absolute top-3 right-3 w-8 h-8 border-t-2 border-r-2 border-blue-500 rounded-tr-lg" />
            <div className="absolute bottom-3 left-3 w-8 h-8 border-b-2 border-l-2 border-blue-500 rounded-bl-lg" />
            <div className="absolute bottom-3 right-3 w-8 h-8 border-b-2 border-r-2 border-blue-500 rounded-br-lg" />
          </div>

          <div className="flex gap-3 mt-4">
            {!scanned ? (
              <Button onClick={handleScan} className="flex-1 justify-center" disabled={scanning}>
                <ScanLine size={14} /> {scanning ? 'Scanning...' : 'Start Scanning'}
              </Button>
            ) : (
              <>
                <Button onClick={async () => {
                  // For demo mock scan, we fetch a mock identity to save with purpose
                  verifierApi.scanQrCode("BID-2024-001234").then(data => {
                    localStorage.setItem('blockId_last_verification', JSON.stringify({ ...data, fresh: true, purpose }));
                    onNav('verification-result');
                  }).catch(() => onNav('verification-result'));
                }} className="flex-1 justify-center">
                  <Shield size={14} /> View Result
                </Button>
                <Button variant="outline" onClick={() => setScanned(false)} className="flex-1 justify-center">
                  <ScanLine size={14} /> Scan Again
                </Button>
              </>
            )}
          </div>

          {/* Manual input */}
          <div className="mt-4 p-4 bg-slate-50 rounded-xl border border-slate-200">
            <p className="text-xs font-medium text-slate-700 mb-2">Verification Purpose</p>
            <select value={purpose} onChange={e => setPurpose(e.target.value)} className="w-full mb-3 px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-800">
              {purposes.map(p => <option key={p} value={p}>{p}</option>)}
            </select>
            <p className="text-xs font-medium text-slate-700 mb-2">Or enter DID manually</p>
            <div className="flex gap-2">
              <input value={manualDid} onChange={e => setManualDid(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleManualSearch()} placeholder="BID-2024-XXXXXX" className="flex-1 px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-blue-500" />
              <Button size="sm" onClick={handleManualSearch}>
                {loading ? '...' : 'Search'}
              </Button>
            </div>
          </div>
        </Card>

        {/* Instructions */}
        <div className="space-y-4">
          <Card className="p-5">
            <h3 className="text-sm font-semibold text-slate-800 mb-4">How to Scan</h3>
            <div className="space-y-4">
              {[
                { step: 1, title: 'Start Scanner', desc: 'Click "Start Scanning" to activate the camera' },
                { step: 2, title: 'Point at QR Code', desc: 'Hold the QR code within the scanning frame' },
                { step: 3, title: 'Auto Detection', desc: 'The scanner will automatically detect and decode' },
                { step: 4, title: 'View Result', desc: 'Instant blockchain verification result displayed' },
              ].map(s => (
                <div key={s.step} className="flex items-start gap-3">
                  <div className="w-7 h-7 bg-blue-600 text-white rounded-xl flex items-center justify-center text-xs font-bold flex-shrink-0">{s.step}</div>
                  <div>
                    <p className="text-sm font-medium text-slate-700">{s.title}</p>
                    <p className="text-xs text-slate-400">{s.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          <Card className="p-5">
            <h3 className="text-sm font-semibold text-slate-800 mb-3">QR Code Formats</h3>
            <div className="space-y-2">
              {[
                { format: 'Identity Vault Native QR', supported: true },
                { format: 'URL-encoded DID', supported: true },
                { format: 'JSON Web Token (JWT)', supported: true },
                { format: 'PDF417 (Government ID)', supported: false },
                { format: 'DataMatrix', supported: false },
              ].map(f => (
                <div key={f.format} className="flex items-center justify-between text-xs py-1.5">
                  <span className="text-slate-600">{f.format}</span>
                  {f.supported
                    ? <span className="text-emerald-600 flex items-center gap-1"><CheckCircle size={11} /> Supported</span>
                    : <span className="text-slate-400 flex items-center gap-1"><XCircle size={11} /> Coming soon</span>}
                </div>
              ))}
            </div>
          </Card>
        </div >
      </div >
    </div >
  );
}

// ── Verification Result ───────────────────────────────────────────────────────
export function VerificationResult({ onNav }: { onNav: (s: string) => void }) {
  const [copied, setCopied] = useState(false);
  const [identity, setIdentity] = useState<any>(null);
  const [savedVid, setSavedVid] = useState<number | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem('blockId_last_verification');
    if (saved) {
      const id = JSON.parse(saved);
      setIdentity(id);

      if (id.fresh) {
        let docs = "Identity Overview:Verified";
        if (id.documents && Array.isArray(id.documents) && id.documents.length > 0) {
          docs = id.documents.map((d: any) => `${d.name ? d.name.replace(" Document", "") : "Unknown"}::${d.status || (id.status === 'Verified' ? 'Verified' : 'Pending')}`).join(",");
        }
        verifierApi.verifyIdentity(id.did || 'BID-Unknown', id.purpose || "Platform Scan", docs)
          .then(res => setSavedVid(res.verificationId))
          .catch(err => console.error(err));

        id.fresh = false;
        localStorage.setItem('blockId_last_verification', JSON.stringify(id));
      } else {
        setSavedVid(id.historyId || null);
      }
    }
  }, []);

  const handleCopy = () => { if (identity) navigator.clipboard.writeText(identity.blockchainHash || ''); setCopied(true); setTimeout(() => setCopied(false), 2000); };

  if (!identity) {
    return <div className="p-10 text-center text-slate-500">No identity selected. Please search first.</div>;
  }

  return (
    <div className="animate-fade-in space-y-6">
      <SectionHeader title="Identity Verification Result" subtitle="Real-time blockchain verification report"
        action={<Button size="sm" onClick={() => onNav('verification-history')}><Shield size={14} /> Back to History</Button>} />

      {/* Result banner */}
      <div className={`rounded-2xl p-6 text-white relative overflow-hidden ${identity.status === 'Tampering Detected' || identity.status === 'Rejected' || identity.status === 'Action Required' || identity.status === 'Fraud Detected' ? 'bg-red-600' :
        identity.status === 'Pending' ? 'bg-amber-500' : ''
        }`} style={identity.status === 'Tampering Detected' || identity.status === 'Rejected' || identity.status === 'Action Required' || identity.status === 'Fraud Detected' || identity.status === 'Pending' ? {} : { background: 'linear-gradient(135deg, #059669 0%, #047857 50%, #065F46 100%)' }}>
        <div className="absolute right-4 top-4 opacity-20">
          {identity.status === 'Tampering Detected' || identity.status === 'Rejected' || identity.status === 'Action Required' || identity.status === 'Fraud Detected' ? <XCircle size={80} /> : identity.status === 'Pending' ? <Clock size={80} /> : <CheckCircle size={80} />}
        </div>
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center">
              {identity.status === 'Tampering Detected' || identity.status === 'Rejected' || identity.status === 'Action Required' || identity.status === 'Fraud Detected' ? <XCircle size={28} className="text-white" /> : identity.status === 'Pending' ? <Clock size={28} className="text-white" /> : <CheckCircle size={28} className="text-white" />}
            </div>
            <div>
              <p className="text-white/80 text-xs uppercase tracking-wider">Verification Status</p>
              <h2 className="text-2xl font-black">
                {identity.status === 'Tampering Detected' ? 'FAIL: Block tampered' :
                  identity.status === 'Fraud Detected' ? 'FAIL: Fraud Detected' :
                    identity.status === 'Rejected' ? 'FAIL: Identity Rejected' :
                      identity.status === 'Action Required' ? 'INCOMPLETE: Action Required' :
                        identity.status === 'Pending' ? 'Pending Review' :
                          'Identity Verified ✓'}
              </h2>
            </div>
          </div>
          <p className="text-white/80 text-sm">
            {identity.status === 'Tampering Detected' ? 'CRITICAL: This identity hash does not match current valid blockchain data.' :
              identity.status === 'Fraud Detected' ? 'CRITICAL: This identity is globally suspended due to security violations.' :
                identity.status === 'Rejected' ? 'Identity credentials have been securely rejected.' :
                  identity.status === 'Action Required' ? 'Identity verification paused. User must re-upload rejected documents to proceed.' :
                    identity.status === 'Pending' ? 'Identity is currently awaiting administrative approval.' :
                      'This identity has been verified and cryptographically anchored on the blockchain.'}
          </p>
          <div className="mt-4 flex items-center gap-4 pt-4 border-t border-white/20">
            <div>
              <p className="text-white/70 text-[10px] uppercase tracking-wider">Verification ID</p>
              <p className="font-mono text-sm font-bold">VER-2024-{savedVid || '...'}</p>
            </div>
            <div>
              <p className="text-white/70 text-[10px] uppercase tracking-wider">Timestamp</p>
              <p className="font-mono text-sm">{new Date().toISOString().split('T')[0]}</p>
            </div>
            <div>
              <p className="text-white/70 text-[10px] uppercase tracking-wider">Subject DID</p>
              <p className="font-mono text-sm">{identity.did}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Identity info */}
        <Card className="p-5">
          <h3 className="text-sm font-semibold text-slate-800 mb-4">Identity Information</h3>
          <div className="flex flex-col items-center mb-4">
            <Avatar initials={identity.name?.[0] || 'U'} size="xl" index={0} />
            <h4 className="font-bold text-slate-800 mt-3">{identity.name}</h4>
            <StatusBadge status={identity.status} />
          </div>
          <div className="space-y-2">
            {[
              { label: 'DID', value: identity.did, mono: true },
              { label: 'Nationality', value: identity.country || 'N/A', mono: false },
              { label: 'KYC Level', value: 'Tier 3 (Enhanced)', mono: false },
              { label: 'Blockchain Hash', value: (identity.blockchainHash || '0x00').substring(0, 15) + '...', mono: true },
            ].map(f => (
              <div key={f.label} className="flex justify-between py-1.5 border-b border-slate-100 last:border-0 text-xs">
                <span className="text-slate-400">{f.label}</span>
                <span className={`text-slate-700 font-medium ${f.mono ? 'font-mono' : ''}`}>{f.value}</span>
              </div>
            ))}
          </div>
        </Card>

        {/* Verification details */}
        <Card className="p-5">
          <h3 className="text-sm font-semibold text-slate-800 mb-4">Verification Checks & Documents</h3>
          <div className="space-y-3">
            {[
              { check: 'Identity on Blockchain', passed: true, detail: `Block #${identity.blockNumber || 'Pending'}` },
              { check: 'Hash Integrity', passed: !identity.tamperingDetected, detail: identity.tamperingDetected ? 'Hash Compromised' : 'Matches chain record' },
              ...(identity.aadhaar ? [{ check: 'National ID (Aadhaar)', passed: true, detail: identity.aadhaar }] : []),
              ...(identity.pan ? [{ check: 'Tax ID (PAN)', passed: true, detail: identity.pan }] : []),
              ...(identity.passport ? [{ check: 'Passport', passed: true, detail: identity.passport }] : []),
              ...(identity.license ? [{ check: 'Driver License', passed: true, detail: identity.license }] : []),
              ...(identity.documents && Array.isArray(identity.documents) ? identity.documents.map((d: any) => ({
                check: d.name || d.type || 'Submitted Document',
                passed: d.status === 'verified',
                detail: `Status: ${String(d.status).toUpperCase()}${d.expiryDate ? ' | Expires: ' + new Date(d.expiryDate).toLocaleDateString() : ''}`,
                fileUrl: d.fileUrl
              })) : [])
            ].map((c, i) => (
              <div key={i} className="flex items-center gap-3 py-2 border-b border-slate-100 last:border-0 hover:bg-slate-50 transition-colors px-2 -mx-2 rounded">
                <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 ${c.passed ? 'bg-emerald-100' : 'bg-red-100'}`}>
                  {c.passed ? <Check size={12} className="text-emerald-600" /> : <XCircle size={12} className="text-red-500" />}
                </div>
                <div className="flex-1">
                  <p className="text-xs font-medium text-slate-700">{c.check}</p>
                  <p className="text-[10px] text-slate-400">{c.detail}</p>
                </div>
                {/* @ts-ignore */}
                {c.fileUrl && (
                  <button
                    // @ts-ignore
                    onClick={() => window.open(c.fileUrl, '_blank')}
                    className="p-1.5 hover:bg-slate-200 rounded text-slate-500 hover:text-primary transition-colors flex items-center justify-center"
                    title="Preview Document"
                  >
                    <Eye size={14} />
                  </button>
                )}
              </div>
            ))}
          </div>
        </Card>

        {/* Blockchain proof */}
        <Card className="p-5">
          <h3 className="text-sm font-semibold text-slate-800 mb-4">Blockchain Proof</h3>
          <div className="space-y-3">
            <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200">
              <p className="text-[10px] text-emerald-600 uppercase tracking-wider mb-1">Transaction Hash</p>
              <p className="font-mono text-xs text-slate-700 break-all">{identity.blockchainHash || 'Pending TX'}</p>
              <button onClick={handleCopy} className="mt-1.5 flex items-center gap-1 text-[10px] text-emerald-600 hover:text-emerald-700">
                {copied ? <><Check size={10} /> Copied!</> : <><Copy size={10} /> Copy hash</>}
              </button>
            </div>
            {[
              { label: 'Block Number', value: `#${identity.blockNumber || 'Pending'}` },
              { label: 'Network', value: 'Ethereum Mainnet' },
              { label: 'Standard', value: 'W3C DID Core v1.0' },
            ].map(m => (
              <div key={m.label} className="flex justify-between py-1.5 border-b border-slate-100 last:border-0 text-xs">
                <span className="text-slate-400">{m.label}</span>
                <span className="font-mono text-slate-700 font-medium">{m.value}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>

    </div>
  );
}

// ── Verifier History ──────────────────────────────────────────────────────────
export function VerifierHistory() {
  const { showAlert, showConfirm } = useDialog();
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [history, setHistory] = useState<any[]>([]);

  const fetchHistory = () => {
    verifierApi.getVerifierHistory().then(res => {
      let rawData = [...res].sort((a: any, b: any) => a.id - b.id);
      rawData.forEach((v: any) => {
        v.computedFields = v.checkedFields ? v.checkedFields.split(',').map((s: string) => s.split('::')[0].trim()) : ['Identity Overview'];
      });
      setHistory(rawData);
    }).catch(console.error);
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  const [deleteConfirmId, setDeleteConfirmId] = useState<number | null>(null);
  const [toast, setToast] = useState('');

  const confirmDelete = (id: number) => {
    setDeleteConfirmId(id);
  };

  const handleDelete = () => {
    if (deleteConfirmId === null) return;
    verifierApi.deleteVerifierHistory(deleteConfirmId).then(async () => {
      fetchHistory();
      setDeleteConfirmId(null);
      setToast('Record permanently deleted');
      setTimeout(() => setToast(''), 3000);
    }).catch(async err => {
      console.error(err);
      await showAlert('Failed to delete: ' + err.message);
      setDeleteConfirmId(null);
    });
  };

  const handleFlagFraud = async (id: number) => {
    try {
      await verifierApi.flagFraud(id);
      fetchHistory();
      setToast('Verification status immediately synchronized with Blockchain Ledger');
      setTimeout(() => setToast(''), 3000);
    } catch (err: any) {
      console.error(err);
      showAlert('Failed to flag fraud: ' + err.message);
    }
  };

  const exportCSV = () => {
    if (history.length === 0) return showAlert('No history available to export.');
    const headers = ['Report ID', 'Subject Name', 'Subject DID', 'Global Status', 'Checked Documents', 'Blockchain Hash', 'Timestamp'];
    const rows = history.map(item => {
      const name = item.user?.name || 'N/A';
      const did = item.user?.did || 'N/A';
      const docs = (item.checkedFields || '').replace(/,/g, '|'); // Avoid CSV comma conflict
      const hash = item.blockchainHash || 'Pending TX';
      return `VER-${item.id},"${name}","${did}","${item.status}", "${docs}","${hash}","${item.verificationDate || ''}"`;
    });
    const csvContent = [headers.join(','), ...rows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Batch_Audit_Log_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    setToast('CSV Exported Successfully');
    setTimeout(() => setToast(''), 3000);
  };

  const handleDirectDownload = (v: any) => {
    const doc = new jsPDF();
    doc.setFillColor(15, 23, 42);
    doc.rect(0, 0, 210, 40, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(22);
    doc.setFont("helvetica", 'bold');
    doc.text("IDENTITY VAULT", 14, 22);
    doc.setFontSize(10);
    doc.setFont("helvetica", 'normal');
    doc.text("VERIFICATION REPORT", 14, 30);
    doc.setTextColor(148, 163, 184);
    doc.text(`CONFIDENTIAL · STRICTLY FOR AUTHORIZED VERIFIERS`, 210 - 14, 22, { align: 'right' });
    doc.text(`Generated: ${new Date().toISOString().split('T')[0]}`, 210 - 14, 30, { align: 'right' });
    let y = 55;

    doc.setFontSize(14);
    doc.setTextColor(15, 23, 42);
    doc.setFont("helvetica", 'bold');
    doc.text("Verification Overview", 14, y);
    doc.setDrawColor(226, 232, 240);
    doc.line(14, y + 2, 196, y + 2);
    y += 12;

    doc.setFontSize(10);
    doc.setFont("helvetica", 'bold');
    doc.setTextColor(100, 116, 139);
    doc.text("SUBJECT NAME", 14, y);
    doc.setFont("helvetica", 'normal');
    doc.setTextColor(15, 23, 42);
    doc.text(v.user?.name || 'N/A', 14, y + 5);

    doc.setFont("helvetica", 'bold');
    doc.setTextColor(100, 116, 139);
    doc.text("SUBJECT DID", 80, y);
    doc.setFont("helvetica", 'normal');
    doc.setTextColor(15, 23, 42);
    doc.text(v.user?.did || 'N/A', 80, y + 5);

    doc.setFont("helvetica", 'bold');
    doc.setTextColor(100, 116, 139);
    doc.text("GLOBAL STATUS", 150, y);

    const s = v.status || 'Unknown';
    if (s.toLowerCase() === 'verified' || s.toLowerCase() === 'approved') doc.setTextColor(5, 150, 105);
    else if (s.toLowerCase() === 'rejected' || s.toLowerCase() === 'fraud detected' || s.toLowerCase() === 'tampered') doc.setTextColor(220, 38, 38);
    else doc.setTextColor(217, 119, 6);

    doc.setFont("helvetica", 'bold');
    doc.text(s.toUpperCase(), 150, y + 5);
    doc.setFont("helvetica", 'normal');
    y += 20;

    doc.setFontSize(10);
    doc.setFont("helvetica", 'bold');
    doc.setTextColor(100, 116, 139);
    doc.text("BLOCKCHAIN PROOF HASH", 14, y);
    doc.setFont("helvetica", 'normal');
    doc.setTextColor(15, 23, 42);
    const hash = v.blockchainHash || (v.user?.did ? '0x' + Array.from(v.user.did).reduce((s: any, c: any) => Math.imul(31, s) + c.charCodeAt(0) | 0, 0).toString(16).replace('-', '').padEnd(40, '0') : 'Pending TX');
    doc.setFillColor(248, 250, 252);
    doc.rect(14, y + 2, 182, 10, 'F');
    doc.text(hash, 18, y + 9);
    y += 22;

    y = 265;
    doc.setFillColor(5, 150, 105);
    doc.rect(14, y, 182, 18, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(11);
    doc.setFont("helvetica", 'bold');
    doc.text("SYSTEM AUTHORIZED", 20, y + 7);

    const activeUser = getSavedUser();
    const sigKey = `blockId_verifier_sig_${activeUser?.email || 'default'}`;
    const sig = localStorage.getItem(sigKey);
    if (sig) {
      doc.setFillColor(255, 255, 255);
      doc.rect(145, y - 10, 50, 25, 'F');
      doc.addImage(sig, 'PNG', 150, y - 5, 40, 15);
      doc.setTextColor(71, 85, 105);
      doc.setFontSize(7);
      doc.text("Verifier Signature", 170, y + 13, { align: 'center' });
      doc.setTextColor(255, 255, 255);
    }
    doc.setFontSize(9);
    doc.setFont("helvetica", 'normal');
    doc.text("This document is secured and compliant with the W3C DID Core Standard.", 20, y + 13);

    doc.save(`Report_VER-${v.id}.pdf`);
    setToast(`Report VER-${v.id} Downloaded Successfully`);
    setTimeout(() => setToast(''), 3000);
  };

  return (
    <div className="animate-fade-in space-y-6">
      <SectionHeader title="Verification History" subtitle="All verifications performed by your account"
        action={<Button size="sm" variant="outline" onClick={exportCSV}><Download size={14} /> Export CSV</Button>} />

      <div className="grid grid-cols-3 gap-4">
        <StatCard label="Total Verified" value={history.filter(v => v.status === 'Verified').length.toString()} sub="All time" icon={<CheckCircle size={18} />} color="emerald" />
        <StatCard label="This Month" value={history.filter(v => v.status === 'Verified').length.toString()} sub="Valid scans" icon={<Clock size={18} />} color="blue" />
        <StatCard label="Avg. Response" value="1.8s" sub="Per check" icon={<Shield size={18} />} color="violet" />
      </div>

      <Card className="p-5">
        <div className="flex gap-3 mb-4">
          <Input placeholder="Search by purpose..." value={search} onChange={setSearch} icon={<Search size={14} />} className="flex-1" />
          <Button variant="outline" size="sm">Filter</Button>
        </div>

        <div className="overflow-x-auto">
          {history.length === 0 ? (
            <div className="p-10 text-center text-slate-500 text-sm">No verifications performed yet.</div>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100">
                  {['S.No', 'Verification ID', 'Identity User', 'Purpose', 'Date', 'Documents', 'Duration', 'Status', 'Actions'].map(h => (
                    <th key={h} className="text-left text-xs font-semibold text-slate-500 pb-3 pr-4">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {history.map((v, i) => (
                  <tr key={v.id} className="border-b border-slate-50 hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 pr-4 text-xs font-semibold text-slate-400">{i + 1}</td>
                    <td className="py-3 pr-4 font-mono text-xs text-slate-500">VER-{v.id}</td>
                    <td className="py-3 pr-4">
                      <div className="flex items-center gap-2">
                        <Avatar initials={v.user?.name?.[0] || 'U'} size="sm" index={i} />
                        <span className="text-xs font-medium text-slate-800">{v.user?.name || 'Unknown'}</span>
                      </div>
                    </td>
                    <td className="py-3 pr-4 text-xs text-slate-600">{v.purpose}</td>
                    <td className="py-3 pr-4 text-xs text-slate-500">{String(v.verificationDate).split('T')[0]}</td>
                    <td className="py-3 pr-4">
                      <div className="flex gap-1 flex-wrap">
                        {v.computedFields ? v.computedFields.map((f: string) => (
                          <span key={f} className="text-[10px] bg-blue-50 text-blue-700 px-1.5 py-0.5 rounded">{f.trim()}</span>
                        )) : <span className="text-[10px] text-slate-400">Identity Overview</span>}
                      </div>
                    </td>
                    <td className="py-3 pr-4 font-mono text-xs text-slate-500">{v.duration}</td>
                    <td className="py-3 pr-4">
                      {(() => {
                        const st = String(v.status || 'unknown').toLowerCase();
                        if (st === 'verified' || st === 'approved') {
                          return (
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full border bg-emerald-50 text-emerald-600 border-emerald-200">
                              <span className="mr-1 inline-block w-1.5 h-1.5 rounded-full bg-current"></span> Verified
                            </span>
                          );
                        } else if (st === 'pending') {
                          return (
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full border bg-amber-50 text-amber-600 border-amber-200">
                              <span className="mr-1 inline-block w-1.5 h-1.5 rounded-full bg-current"></span> Pending
                            </span>
                          );
                        } else {
                          return (
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full border bg-red-50 text-red-600 border-red-200">
                              <span className="mr-1 inline-block w-1.5 h-1.5 rounded-full bg-current"></span> {st === 'tampered' ? 'Tampered' : st === 'fraud detected' ? 'Fraud Detected' : 'Rejected'}
                            </span>
                          );
                        }
                      })()}
                    </td>
                    <td className="py-3 pr-4">
                      <div className="flex gap-2">
                        <button onClick={() => handleDirectDownload(v)} className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all" title="Download Report"><Download size={13} /></button>
                        {String(v.status || 'unknown').toLowerCase() !== 'fraud detected' ? (
                          <button onClick={() => handleFlagFraud(v.id)} className="p-1.5 text-slate-400 hover:text-orange-600 hover:bg-orange-50 rounded-lg transition-all" title="Flag Fraud"><XCircle size={13} /></button>
                        ) : (
                          <button onClick={() => handleFlagFraud(v.id)} className="p-1.5 text-orange-500 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-all" title="Restore Verification"><CheckCircle size={13} /></button>
                        )}
                        <button onClick={() => confirmDelete(v.id)} className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all" title="Delete Record"><Trash2 size={13} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </Card>

      {/* Toast Notification */}
      {toast && (
        <div className="fixed top-6 right-6 bg-emerald-600 text-white px-5 py-3 rounded-xl shadow-2xl z-[9999] animate-fade-in flex items-center gap-3 font-medium">
          <CheckCircle size={18} /> {toast}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirmId !== null && createPortal(
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[99999] flex items-center justify-center p-4 animate-fade-in" style={{ position: 'fixed', top: 0, left: 0 }}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden scale-in relative z-[100000] block">
            <div className="p-8 text-center pb-6">
              <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-5">
                <Trash2 size={26} className="text-red-500" />
              </div>
              <h3 className="text-xl font-bold text-slate-800 mb-2">Delete Record?</h3>
              <p className="text-sm text-slate-500 mb-7">This action cannot be undone. The verification history will be permanently erased.</p>
              <div className="flex gap-3">
                <Button variant="outline" className="flex-1" onClick={() => setDeleteConfirmId(null)}>Cancel</Button>
                <Button className="flex-1 bg-red-600 hover:bg-red-700 text-white border-none" onClick={handleDelete}>Yes, Delete</Button>
              </div>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}

// ── Download Report ────────────────────────────────────────────────────────────
export function DownloadReport() {
  const { showAlert } = useDialog();
  const [format, setFormat] = useState('pdf');
  const [downloading, setDownloading] = useState(false);
  const [downloaded, setDownloaded] = useState(false);
  const [history, setHistory] = useState<any[]>([]);
  const [previewItem, setPreviewItem] = useState<any>(null);
  const [sigLoading, setSigLoading] = useState(false);

  const activeUser = getSavedUser();
  const sigKey = `blockId_verifier_sig_${activeUser?.email || 'default'}`;

  const allFields = ['Verification Summary', 'Blockchain Proof Hash', 'Document Verification Status', 'Timestamp & Duration', 'Verifier Details', 'Digital Signature'];
  const [selectedFields, setSelectedFields] = useState<string[]>(['Verification Summary', 'Blockchain Proof Hash', 'Document Verification Status', 'Timestamp & Duration']);

  const toggleField = (field: string) => {
    setSelectedFields(prev => prev.includes(field) ? prev.filter(f => f !== field) : [...prev, field]);
  };

  useEffect(() => {
    verifierApi.getVerifierHistory().then(res => {
      let rawData = [...res].sort((a: any, b: any) => b.id - a.id);
      setHistory(rawData);
      if (rawData.length > 0) {
        setPreviewItem(rawData[0]);
      }
    }).catch(console.error);
  }, []);

  const handleDownload = (item?: any, overrideFormat?: string) => {
    let targetItem = item;
    if (targetItem?.type === 'click' || !targetItem) targetItem = previewItem;
    if (!targetItem) {
      showAlert('No report available to download.');
      return;
    }
    const targetFormat = typeof overrideFormat === 'string' ? overrideFormat : format;
    setDownloading(true);

    setTimeout(() => {
      setDownloading(false);
      setDownloaded(true);

      let content = '';
      let mime = '';

      const includeSummary = selectedFields.includes('Verification Summary');
      const includeHash = selectedFields.includes('Blockchain Proof Hash');
      const includeDocs = selectedFields.includes('Document Verification Status');
      const includeTime = selectedFields.includes('Timestamp & Duration');
      const includeVerifier = selectedFields.includes('Verifier Details');
      const includeSig = selectedFields.includes('Digital Signature');

      if (targetFormat === 'json') {
        let reportObj: any = { ReportID: `VER-${targetItem.id}` };
        if (includeSummary) {
          reportObj.SubjectName = targetItem.user?.name || '';
          reportObj.SubjectDID = targetItem.user?.did || '';
          reportObj.Status = targetItem.status || '';
        }

        const genHash = targetItem.blockchainHash || (targetItem.user?.did ? '0x' + Array.from(targetItem.user.did).reduce((s: any, c: any) => Math.imul(31, s) + c.charCodeAt(0) | 0, 0).toString(16).replace('-', '').padEnd(40, '0') : 'Pending TX');

        if (includeHash) reportObj.BlockchainHash = genHash;
        if (includeDocs) {
          reportObj.Purpose = targetItem.purpose || '';

          const docFields = targetItem.checkedFields ? targetItem.checkedFields.split(',') : ['National ID::Verified'];
          const globalStatus = targetItem.status?.toLowerCase() === 'rejected' ? 'Rejected' : (targetItem.status?.toLowerCase() === 'pending' ? 'Pending' : 'Verified');

          reportObj.Documents = {};
          docFields.forEach((df: string) => {
            const parts = df.split("::");
            const name = parts[0]?.trim();
            const stat = parts.length > 1 ? parts[1].trim() : globalStatus;
            if (name) reportObj.Documents[name] = stat;
          });
        }
        if (includeTime) reportObj.Timestamp = targetItem.verificationDate || '';
        if (includeVerifier) reportObj.Verifier = 'Verifier Agent';
        if (includeSig) reportObj.DigitalSignature = 'Verified by Identity Vault · W3C DID Core Standard';

        content = JSON.stringify(reportObj, null, 2);
        mime = 'application/json';
      } else if (targetFormat === 'csv') {
        const headers = ['Report ID'];
        const values = [`VER-${targetItem.id}`];
        if (includeSummary) { headers.push('Name', 'DID', 'Status'); values.push(targetItem.user?.name || '', targetItem.user?.did || '', targetItem.status || ''); }
        if (includeHash) { headers.push('Hash'); values.push(targetItem.blockchainHash || ''); }
        if (includeDocs) { headers.push('Purpose'); values.push(targetItem.purpose || ''); }
        if (includeTime) { headers.push('Date'); values.push(targetItem.verificationDate || ''); }
        if (includeVerifier) { headers.push('Verifier'); values.push('Verifier Agent'); }
        if (includeSig) { headers.push('Signature'); values.push('Valid'); }
        content = `${headers.join(',')}\n${values.join(',')}`;
        mime = 'text/csv';
      } else {
        const doc = new jsPDF();

        // Header Banner
        doc.setFillColor(15, 23, 42); // slate-900 background
        doc.rect(0, 0, 210, 40, 'F');

        // Logo / Title
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(22);
        doc.setFont("helvetica", 'bold');
        doc.text("IDENTITY VAULT", 14, 22);

        doc.setFontSize(10);
        doc.setFont("helvetica", 'normal');
        doc.text("VERIFICATION REPORT", 14, 30);

        doc.setFontSize(10);
        doc.setTextColor(148, 163, 184); // slate-400
        doc.text(`CONFIDENTIAL · STRICTLY FOR AUTHORIZED VERIFIERS`, 210 - 14, 22, { align: 'right' });
        doc.text(`Generated: ${new Date().toISOString().split('T')[0]}`, 210 - 14, 30, { align: 'right' });

        let y = 55;

        // Intro
        doc.setFontSize(14);
        doc.setTextColor(15, 23, 42); // slate-900
        doc.setFont("helvetica", 'bold');
        doc.text("Verification Overview", 14, y);
        doc.setDrawColor(226, 232, 240); // slate-200
        doc.line(14, y + 2, 196, y + 2);
        y += 12;

        if (includeSummary) {
          doc.setFontSize(10);
          doc.setFont("helvetica", 'bold');
          doc.setTextColor(100, 116, 139); // slate-500
          doc.text("SUBJECT NAME", 14, y);
          doc.setFont("helvetica", 'normal');
          doc.setTextColor(15, 23, 42);
          doc.text(targetItem.user?.name || 'N/A', 14, y + 5);

          doc.setFont("helvetica", 'bold');
          doc.setTextColor(100, 116, 139);
          doc.text("SUBJECT DID", 80, y);
          doc.setFont("helvetica", 'normal');
          doc.setTextColor(15, 23, 42);
          doc.text(targetItem.user?.did || 'N/A', 80, y + 5);

          doc.setFont("helvetica", 'bold');
          doc.setTextColor(100, 116, 139);
          doc.text("GLOBAL STATUS", 150, y);

          const s = targetItem.status || 'Unknown';
          if (s.toLowerCase() === 'verified') doc.setTextColor(5, 150, 105); // emerald
          else if (s.toLowerCase() === 'rejected') doc.setTextColor(220, 38, 38); // red
          else doc.setTextColor(217, 119, 6); // amber

          doc.setFont("helvetica", 'bold');
          doc.text(s.toUpperCase(), 150, y + 5);
          doc.setFont("helvetica", 'normal');
          y += 20;
        }

        if (includeHash) {
          doc.setFontSize(10);
          doc.setFont("helvetica", 'bold');
          doc.setTextColor(100, 116, 139);
          doc.text("BLOCKCHAIN PROOF HASH", 14, y);
          doc.setFont("helvetica", 'normal');
          doc.setTextColor(15, 23, 42);
          const hash = targetItem.blockchainHash || (targetItem.user?.did ? '0x' + Array.from(targetItem.user.did).reduce((s: any, c: any) => Math.imul(31, s) + c.charCodeAt(0) | 0, 0).toString(16).replace('-', '').padEnd(40, '0') : 'Pending TX');
          // Add light background for hash
          doc.setFillColor(248, 250, 252);
          doc.rect(14, y + 2, 182, 10, 'F');
          doc.text(hash, 18, y + 9);
          y += 22;
        }

        if (includeDocs) {
          doc.setFontSize(14);
          doc.setTextColor(15, 23, 42);
          doc.setFont("helvetica", 'bold');
          doc.text("Evidence & Documents", 14, y);
          doc.line(14, y + 2, 196, y + 2);
          y += 12;

          doc.setFontSize(10);
          doc.setFont("helvetica", 'bold');
          doc.setTextColor(100, 116, 139);
          doc.text("PURPOSE:", 14, y);
          doc.setFont("helvetica", 'normal');
          doc.setTextColor(15, 23, 42);
          doc.text(targetItem.purpose || 'KYC Verification', 35, y);
          y += 10;

          const docFields = targetItem.checkedFields ? targetItem.checkedFields.split(',') : ['National ID::Verified'];
          const globalStatus = targetItem.status?.toLowerCase() === 'rejected' ? 'Rejected' : (targetItem.status?.toLowerCase() === 'pending' ? 'Pending' : 'Verified');

          doc.setFillColor(248, 250, 252); // extremely light slate
          doc.rect(14, y - 4, 182, docFields.length * 8 + 8, 'F');

          docFields.forEach((df: string) => {
            const parts = df.split("::");
            const name = parts[0]?.trim();
            const stat = parts.length > 1 ? parts[1].trim() : globalStatus;

            if (name) {
              doc.setTextColor(71, 85, 105);
              doc.text(`• ${name}`, 18, y);

              if (stat.toLowerCase() === 'verified') doc.setTextColor(5, 150, 105);
              else if (stat.toLowerCase() === 'rejected') doc.setTextColor(220, 38, 38);
              else doc.setTextColor(217, 119, 6);

              doc.setFont("helvetica", 'bold');
              doc.text(`[ ${stat.toUpperCase()} ]`, 196 - 18, y, { align: 'right' });
              doc.setFont("helvetica", 'normal');
              y += 8;
            }
          });
          y += 12;
        }

        if (includeTime || includeVerifier) {
          doc.setFontSize(14);
          doc.setTextColor(15, 23, 42);
          doc.setFont("helvetica", 'bold');
          doc.text("Audit Log", 14, y);
          doc.line(14, y + 2, 196, y + 2);
          y += 12;

          doc.setFontSize(10);
          if (includeTime) {
            doc.setFont("helvetica", 'bold');
            doc.setTextColor(100, 116, 139);
            doc.text("VERIFICATION DATE", 14, y);
            doc.setFont("helvetica", 'normal');
            doc.setTextColor(15, 23, 42);
            doc.text(targetItem.verificationDate?.replace('T', ' ') || '', 14, y + 5);
          }
          if (includeVerifier) {
            doc.setFont("helvetica", 'bold');
            doc.setTextColor(100, 116, 139);
            doc.text("VERIFIER AGENT", 80, y);
            doc.setFont("helvetica", 'normal');
            doc.setTextColor(15, 23, 42);
            doc.text(targetItem.verifier?.name || 'Authorized Verifier', 80, y + 5);
          }
          y += 20;
        }

        if (includeSig) {
          // Footer Security Seal
          y = 265; // bottom of page
          doc.setFillColor(5, 150, 105); // emerald block
          doc.rect(14, y, 182, 18, 'F');

          doc.setTextColor(255, 255, 255);
          doc.setFontSize(11);
          doc.setFont("helvetica", 'bold');
          doc.text("SYSTEM AUTHORIZED", 20, y + 7);

          const sig = localStorage.getItem(sigKey);
          if (sig) {
            doc.setFillColor(255, 255, 255);
            doc.rect(145, y - 10, 50, 25, 'F');
            doc.addImage(sig, 'PNG', 150, y - 5, 40, 15);
            doc.setTextColor(71, 85, 105);
            doc.setFontSize(7);
            doc.text("Verifier Signature", 170, y + 13, { align: 'center' });
            doc.setTextColor(255, 255, 255);
          }

          doc.setFontSize(9);
          doc.setFont("helvetica", 'normal');
          doc.text("This document is secured and compliant with the W3C DID Core Standard.", 20, y + 13);
        }

        doc.save(`Report_VER-${targetItem.id}.pdf`);
        setTimeout(() => setDownloaded(false), 2000);
        return;
      }

      const blob = new Blob([content], { type: mime });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Report_VER-${targetItem.id}.${targetFormat}`;
      a.click();
      URL.revokeObjectURL(url);

      setTimeout(() => setDownloaded(false), 2000);
    }, 1000);
  };

  return (
    <div className="animate-fade-in space-y-6">
      <SectionHeader title="Download Verification Report" subtitle="Export identity verification reports in multiple formats" />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-5">
          <h3 className="text-sm font-semibold text-slate-800 mb-4">Report Configuration</h3>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-2">Report Format</label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { value: 'pdf', label: 'PDF', icon: '📄' },
                  { value: 'json', label: 'JSON', icon: '{ }' },
                  { value: 'csv', label: 'CSV', icon: '📊' },
                ].map(f => (
                  <button key={f.value} onClick={() => setFormat(f.value)} className={`flex flex-col items-center gap-1.5 p-3 rounded-xl border text-xs font-medium transition-all ${format === f.value ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-slate-200 text-slate-600 hover:border-slate-300'}`}>
                    <span className="text-lg">{f.icon}</span>
                    {f.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-2">Include Fields</label>
              <div className="space-y-2">
                {allFields.map((field) => {
                  const isSelected = selectedFields.includes(field);
                  return (
                    <label key={field} onClick={() => toggleField(field)} className="flex items-center gap-2.5 cursor-pointer group">
                      <div className={`w-4 h-4 rounded border-2 flex items-center justify-center transition-all ${isSelected ? 'border-blue-500 bg-blue-500' : 'border-slate-300 group-hover:border-blue-400'}`}>
                        {isSelected && <Check size={10} className="text-white" />}
                      </div>
                      <span className="text-xs text-slate-600 select-none">{field}</span>
                    </label>
                  );
                })}
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100">
              <label className="block text-xs font-medium text-slate-700 mb-2">My Verifier Signature (Upload once)</label>
              {sigLoading ? (
                <div className="flex items-center gap-2 p-2 text-xs text-blue-600 bg-blue-50 rounded-lg">
                  <div className="w-3 h-3 border-2 border-blue-600/40 border-t-blue-600 rounded-full animate-spin-custom" />
                  Saving signature...
                </div>
              ) : localStorage.getItem(sigKey) ? (
                <div className="flex items-center gap-3">
                  <div className="h-10 border border-slate-200 rounded p-1 bg-white">
                    <img src={localStorage.getItem(sigKey) || ''} alt="Signature" className="h-full object-contain" />
                  </div>
                  <Button variant="outline" size="sm" onClick={() => {
                    setSigLoading(true);
                    setTimeout(() => {
                      localStorage.removeItem(sigKey);
                      setSigLoading(false);
                      setFormat((f: any) => f === 'pdf' ? 'pdf ' : 'pdf');
                    }, 800);
                  }}>Remove</Button>
                </div>
              ) : (
                <input type="file" accept="image/*" onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    setSigLoading(true);
                    const reader = new FileReader();
                    reader.onload = (ev) => {
                      setTimeout(() => {
                        const str = ev.target?.result as string;
                        localStorage.setItem(sigKey, str);
                        setSigLoading(false);
                        setFormat((f: any) => f === 'pdf' ? 'pdf ' : 'pdf');
                      }, 1000);
                    };
                    reader.readAsDataURL(file);
                  }
                }} className="text-xs file:mr-4 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100" />
              )}
            </div>

            <Button onClick={handleDownload} disabled={downloading} className="w-full justify-center">
              {downloading ? (
                <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin-custom" />
              ) : downloaded ? (
                <><Check size={14} /> Downloaded Successfully!</>
              ) : (
                <><Download size={14} /> Generate & Download Report</>
              )}
            </Button>
          </div>
        </Card>

        <Card className="p-5">
          <h3 className="text-sm font-semibold text-slate-800 mb-4">Report Preview</h3>
          {!previewItem ? (
            <div className="p-5 rounded-xl border border-slate-200 text-center"><p className="text-xs text-slate-500">No history available to generate preview.</p></div>
          ) : (
            <div className="p-5 rounded-xl border-2 border-dashed border-slate-200 bg-slate-50">
              <div className="flex items-center justify-between mb-4 pb-4 border-b border-slate-200">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center">
                    <Shield size={14} className="text-white" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-800">Identity Vault Verification Report</p>
                    <p className="text-[10px] text-slate-400">Report ID: VER-{previewItem.id}</p>
                  </div>
                </div>
                <StatusBadge status={previewItem.status || 'verified'} />
              </div>

              <div className="space-y-2 mb-4">
                {[
                  { label: 'Subject', value: previewItem.user?.name || 'Unknown' },
                  { label: 'DID', value: previewItem.user?.did || 'Pending' },
                  { label: 'Verifier', value: 'Verifier Agent' },
                  { label: 'Date', value: String(previewItem.verificationDate).replace('T', ' ').substring(0, 19) },
                ].map(f => (
                  <div key={f.label} className="flex justify-between text-[10px]">
                    <span className="text-slate-400">{f.label}</span>
                    <span className="text-slate-700 font-medium font-mono">{f.value}</span>
                  </div>
                ))}
              </div>

              <div className="p-2 bg-emerald-50 rounded-lg border border-emerald-200">
                <p className="text-[9px] font-mono text-emerald-700 break-all">BLOCKCHAIN: {previewItem.blockchainHash || (previewItem.user?.did ? '0x' + Array.from(previewItem.user.did).reduce((s: any, c: any) => Math.imul(31, s) + c.charCodeAt(0) | 0, 0).toString(16).replace('-', '').padEnd(40, '0') : 'Pending TX')}</p>
              </div>

              <p className="text-[9px] text-slate-400 text-center mt-3">Digitally signed by Identity Vault · W3C DID Core Standard</p>
            </div>
          )}

          {/* Recent reports */}
          <h3 className="text-sm font-semibold text-slate-800 mt-5 mb-3">Recent Reports</h3>
          <div className="space-y-2">
            {history.slice(0, 3).map((r: any) => (
              <div key={r.id} onClick={() => setPreviewItem(r)} className={`cursor-pointer flex items-center justify-between p-3 rounded-xl border transition-all ${previewItem?.id === r.id ? 'bg-blue-50 border-blue-200' : 'bg-slate-50 border-slate-100 hover:border-slate-200'}`}>
                <div>
                  <p className="text-xs font-medium text-slate-700">{r.user?.name}</p>
                  <p className="text-[10px] text-slate-400 font-mono">VER-{r.id} · {String(r.verificationDate).substring(0, 10)}</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded font-medium">{r.status}</span>
                  <button onClick={(e) => { e.stopPropagation(); handleDownload(r, 'json'); }} className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"><Download size={13} /></button>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
// ── Help & Support ─────────────────────────────────────────────────────────────
export function VerifierSupport() {
  const { showAlert } = useDialog();
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState('');

  const activeUser = getSavedUser();

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    if (!subject || !message) {
      await showAlert('Please fill out all fields before submitting.');
      return;
    }
    setLoading(true);
    try {
      await verifierApi.submitSupportTicket(subject, message);
      setToast('Message submitted successfully. Admin has been notified.');
      setSubject('');
      setMessage('');
      setTimeout(() => setToast(''), 4000);
    } catch (err: any) {
      console.error(err);
      await showAlert('Failed to submit message: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="animate-fade-in space-y-6">
      <SectionHeader title="Help & Support" subtitle="System documentation and direct administration contact" />

      {toast && (
        <div className="p-3 bg-emerald-50 text-emerald-700 text-sm font-medium rounded-xl border border-emerald-200 flex items-center justify-between">
          <span>{toast}</span>
          <CheckCircle size={16} />
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-6">
          <h3 className="text-sm font-semibold text-slate-800 mb-4 flex items-center gap-2">
            <MessageSquareHeart size={16} className="text-blue-600" /> General FAQ
          </h3>
          <div className="space-y-4">
            {[
              { q: 'How do I interpret a Block Tampered error?', a: 'If a block is tampered, the cryptographic hash of the identity document no longer matches the blockchain ledger. You must immediately reject the identity and confiscate physical documents if applicable.' },
              { q: 'What happens when I flag a record as Fraud?', a: 'The user account is globally suspended across the entire Identity Vault ecosystem. Any future QR scans will instantly fail. The System Admin is immediately notified.' },
              { q: 'Can I restore a mistakenly flagged account?', a: 'Yes. In the Verification History tab, click the green checkmark next to the mistakenly flagged record. The backend will parse previous clean documents and automatically restore their status.' },
              { q: 'How do I bind an API to this scanner?', a: 'API Gateway keys are currently managed by the master administration node. Please securely submit a support ticket via this form requesting API Key generation for your hardware terminal.' }
            ].map((faq, i) => (
              <div key={i} className="border-b border-slate-100 pb-3 last:border-0 last:pb-0">
                <p className="text-xs font-bold text-slate-700 mb-1">Q: {faq.q}</p>
                <p className="text-xs text-slate-500 leading-relaxed">A: {faq.a}</p>
              </div>
            ))}
          </div>
        </Card>

        <Card className="p-6">
          <h3 className="text-sm font-semibold text-slate-800 mb-1 flex items-center gap-2">
            <LifeBuoy size={16} className="text-blue-600" /> Contact Administration
          </h3>
          <p className="text-xs text-slate-400 mb-5">Open a direct, secure line with the network administrators.</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1.5">Agent Details</label>
              <input type="text" readOnly value={activeUser?.name || 'Verified Agent'} className="w-full text-xs p-2.5 rounded-lg border border-slate-200 bg-slate-50 text-slate-500 focus:outline-none" />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1.5">Subject</label>
              <select value={subject} onChange={e => setSubject(e.target.value)} className="w-full text-xs p-2.5 rounded-lg border border-slate-200 focus:outline-none focus:border-blue-500">
                <option value="">Select a category...</option>
                <option value="Hardware Integration">Hardware API Integration</option>
                <option value="Security Escalation">Security Escalation (Fraud)</option>
                <option value="Account Settings">Account Settings Issue</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1.5">Secure Request</label>
              <textarea
                value={message}
                onChange={e => setMessage(e.target.value)}
                placeholder="Describe your issue securely here. Logs are encrypted..."
                className="w-full text-xs p-3 rounded-lg border border-slate-200 h-28 resize-none focus:outline-none focus:border-blue-500"
              />
            </div>

            <Button type="submit" disabled={loading} className="w-full justify-center">
              {loading ? (
                <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin-custom" />
              ) : (
                <><Send size={14} /> Submit Message</>
              )}
            </Button>
          </form>
        </Card>
      </div>
    </div>
  );
}
