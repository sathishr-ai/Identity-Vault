import { useState, useEffect } from 'react';
import { Search, ScanLine, CheckCircle, XCircle, Download, Shield, QrCode, Clock, Copy, Check, Edit, Eye, Trash2 } from 'lucide-react';
import { Card, StatCard, StatusBadge, Avatar, Button, Input, SectionHeader, Pagination } from '../components/UIComponents';
import { mockVerificationHistory } from '../data/mockData';
import { verifierApi } from '../service/api';

// ── Search Identity ─────────────────────────────────────────────────────────────
export function SearchIdentity({ onNav }: { onNav: (s: string) => void }) {
  const [query, setQuery] = useState('');
  const [searchType, setSearchType] = useState('did');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<'found' | 'notfound' | null>(null);
  const [identity, setIdentity] = useState<any>(null);

  const handleSearch = () => {
    if (!query) return;
    setLoading(true);
    verifierApi.scanQrCode(query)
      .then(data => {
        setIdentity(data);
        setResult('found');
        setLoading(false);
      })
      .catch(err => {
        console.error('Identity not found or error', err);
        setResult('notfound');
        setLoading(false);
      });
  };

  return (
    <div className="animate-fade-in space-y-6">
      <SectionHeader title="Search Identity" subtitle="Verify any registered blockchain identity" />

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <StatCard label="Verified Today" value="0" sub="Identities" icon={<CheckCircle size={18} />} color="emerald" />
        <StatCard label="Pending" value="0" sub="Awaiting" icon={<Clock size={18} />} color="amber" />
        <StatCard label="Not Found" value="0" sub="Today" icon={<XCircle size={18} />} color="red" />
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
          <Button onClick={handleSearch} size="md" className="px-6">
            {loading ? <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin-custom" /> : <><Search size={14} /> Search</>}
          </Button>
        </div>

        {/* Results */}
        {result === 'found' && (
          <div className="mt-6 animate-fade-in">
            <div className="flex items-center gap-2 mb-4">
              <CheckCircle size={16} className="text-emerald-500" />
              <span className="text-sm font-medium text-emerald-700">Identity Found</span>
            </div>
            <div className="p-4 rounded-2xl border-2 border-emerald-300 bg-emerald-50">
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

              <div className="flex gap-2 mt-4">
                <Button onClick={() => { localStorage.setItem('blockId_last_verification', JSON.stringify({ ...identity, fresh: true })); onNav('verification-result'); }} className="flex-1 justify-center">
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
  const [scanning, setScanning] = useState(false);
  const [scanned, setScanned] = useState(false);

  const handleScan = () => {
    setScanning(true);
    setTimeout(() => { setScanning(false); setScanned(true); }, 2500);
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
                <div className="text-center">
                  <div className="relative">
                    <QrCode size={48} className="text-blue-400 mx-auto mb-3 animate-pulse" />
                    <div className="absolute inset-0 border-t-2 border-blue-500" style={{ top: '50%', animation: 'scanLine 1.5s ease-in-out infinite' }} />
                  </div>
                  <p className="text-sm text-blue-600 font-medium">Scanning...</p>
                  <p className="text-xs text-blue-400 mt-1">Hold steady</p>
                </div>
              ) : (
                <div className="text-center animate-fade-in">
                  <CheckCircle size={48} className="text-emerald-500 mx-auto mb-3" />
                  <p className="text-sm text-emerald-700 font-semibold">QR Code Detected!</p>
                  <p className="text-xs text-emerald-500 mt-1">BID-2024-001234</p>
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
                <Button onClick={() => onNav('verification-result')} className="flex-1 justify-center">
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
            <p className="text-xs font-medium text-slate-700 mb-2">Or enter DID manually</p>
            <div className="flex gap-2">
              <input placeholder="BID-2024-XXXXXX" className="flex-1 px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-blue-500" />
              <Button size="sm">Search</Button>
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
        </div>
      </div>
    </div>
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
        verifierApi.verifyIdentity(id.did || 'BID-Unknown', "Platform Scan", "DID, Full Name, Integrity")
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
      <div className={`rounded-2xl p-6 text-white relative overflow-hidden ${identity.status === 'Tampering Detected' || identity.status === 'Rejected' ? 'bg-red-600' :
          identity.status === 'Pending' ? 'bg-amber-500' : ''
        }`} style={identity.status === 'Tampering Detected' || identity.status === 'Rejected' || identity.status === 'Pending' ? {} : { background: 'linear-gradient(135deg, #059669 0%, #047857 50%, #065F46 100%)' }}>
        <div className="absolute right-4 top-4 opacity-20">
          {identity.status === 'Tampering Detected' || identity.status === 'Rejected' ? <XCircle size={80} /> : identity.status === 'Pending' ? <Clock size={80} /> : <CheckCircle size={80} />}
        </div>
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center">
              {identity.status === 'Tampering Detected' || identity.status === 'Rejected' ? <XCircle size={28} className="text-white" /> : identity.status === 'Pending' ? <Clock size={28} className="text-white" /> : <CheckCircle size={28} className="text-white" />}
            </div>
            <div>
              <p className="text-white/80 text-xs uppercase tracking-wider">Verification Status</p>
              <h2 className="text-2xl font-black">
                {identity.status === 'Tampering Detected' ? 'FAIL: Block tampered' :
                  identity.status === 'Rejected' ? 'FAIL: Identity Rejected' :
                    identity.status === 'Pending' ? 'Pending Review' :
                      'Identity Verified ✓'}
              </h2>
            </div>
          </div>
          <p className="text-white/80 text-sm">
            {identity.status === 'Tampering Detected' ? 'CRITICAL: This identity hash does not match current valid blockchain data.' :
              identity.status === 'Rejected' ? 'Identity credentials have been securely rejected.' :
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
                detail: `Status: ${String(d.status).toUpperCase()}`,
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
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [history, setHistory] = useState<any[]>([]);

  const fetchHistory = () => {
    verifierApi.getVerifierHistory().then(res => {
      setHistory(res);
    }).catch(console.error);
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  const handleDelete = (id: number) => {
    verifierApi.deleteVerifierHistory(id).then(() => {
      fetchHistory();
    }).catch(console.error);
  };

  return (
    <div className="animate-fade-in space-y-6">
      <SectionHeader title="Verification History" subtitle="All verifications performed by your account"
        action={<Button size="sm" variant="outline"><Download size={14} /> Export CSV</Button>} />

      <div className="grid grid-cols-3 gap-4">
        <StatCard label="Total Verified" value={history.length.toString()} sub="All time" icon={<CheckCircle size={18} />} color="emerald" />
        <StatCard label="This Month" value={history.length.toString()} sub="Valid scans" icon={<Clock size={18} />} color="blue" />
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
                  {['Verification ID', 'Identity User', 'Purpose', 'Date', 'Duration', 'Status', 'Actions'].map(h => (
                    <th key={h} className="text-left text-xs font-semibold text-slate-500 pb-3 pr-4">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {history.map((v, i) => (
                  <tr key={v.id} className="border-b border-slate-50 hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 pr-4 font-mono text-xs text-slate-500">VER-{v.id}</td>
                    <td className="py-3 pr-4">
                      <div className="flex items-center gap-2">
                        <Avatar initials={v.user?.name?.[0] || 'U'} size="sm" index={i} />
                        <span className="text-xs font-medium text-slate-800">{v.user?.name || 'Unknown'}</span>
                      </div>
                    </td>
                    <td className="py-3 pr-4 text-xs text-slate-600">{v.purpose}</td>
                    <td className="py-3 pr-4 text-xs text-slate-500">{String(v.verificationDate).split('T')[0]}</td>
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
                              <span className="mr-1 inline-block w-1.5 h-1.5 rounded-full bg-current"></span> {st === 'tampered' ? 'Tampered' : 'Rejected'}
                            </span>
                          );
                        }
                      })()}
                    </td>
                    <td className="py-3 pr-4">
                      <div className="flex gap-2">
                        <button className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"><Download size={13} /></button>
                        <button onClick={() => handleDelete(v.id)} className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"><Trash2 size={13} /></button>
                      </div>
                    </td>
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

// ── Download Report ────────────────────────────────────────────────────────────
export function DownloadReport() {
  const [format, setFormat] = useState('pdf');
  const [downloading, setDownloading] = useState(false);
  const [downloaded, setDownloaded] = useState(false);

  const handleDownload = () => {
    setDownloading(true);
    setTimeout(() => { setDownloading(false); setDownloaded(true); }, 1500);
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
                {['Verification Summary', 'Blockchain Proof Hash', 'Document Verification Status', 'Timestamp & Duration', 'Verifier Details', 'Digital Signature'].map((field, i) => (
                  <label key={i} className="flex items-center gap-2.5 cursor-pointer group">
                    <div className={`w-4 h-4 rounded border-2 flex items-center justify-center transition-all ${i < 4 ? 'border-blue-500 bg-blue-500' : 'border-slate-300 group-hover:border-blue-400'}`}>
                      {i < 4 && <Check size={10} className="text-white" />}
                    </div>
                    <span className="text-xs text-slate-600">{field}</span>
                  </label>
                ))}
              </div>
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
          <div className="p-5 rounded-xl border-2 border-dashed border-slate-200 bg-slate-50">
            <div className="flex items-center justify-between mb-4 pb-4 border-b border-slate-200">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center">
                  <Shield size={14} className="text-white" />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-800">Identity Vault Verification Report</p>
                  <p className="text-[10px] text-slate-400">Report ID: VER-2024-048721</p>
                </div>
              </div>
              <StatusBadge status="verified" />
            </div>

            <div className="space-y-2 mb-4">
              {[
                { label: 'Subject', value: 'Alexandra Chen' },
                { label: 'DID', value: 'BID-2024-001234' },
                { label: 'Verifier', value: 'First National Bank' },
                { label: 'Date', value: '2024-04-15 14:32:07' },
                { label: 'Result', value: 'VERIFIED ✓' },
              ].map(f => (
                <div key={f.label} className="flex justify-between text-[10px]">
                  <span className="text-slate-400">{f.label}</span>
                  <span className="text-slate-700 font-medium font-mono">{f.value}</span>
                </div>
              ))}
            </div>

            <div className="p-2 bg-emerald-50 rounded-lg border border-emerald-200">
              <p className="text-[9px] font-mono text-emerald-700 break-all">BLOCKCHAIN: 0x3f8a7b2c9d1e4f6a8b2c9d1e4f6a8b2c</p>
            </div>

            <p className="text-[9px] text-slate-400 text-center mt-3">Digitally signed by Identity Vault · W3C DID Core Standard</p>
          </div>

          {/* Recent reports */}
          <h3 className="text-sm font-semibold text-slate-800 mt-5 mb-3">Recent Reports</h3>
          <div className="space-y-2">
            {[
              { id: 'VER-2024-048721', name: 'Alexandra Chen', date: 'Today 14:32', format: 'PDF' },
              { id: 'VER-2024-048698', name: 'James Wilson', date: 'Today 11:18', format: 'JSON' },
              { id: 'VER-2024-048512', name: 'Sarah Kim', date: 'Yesterday', format: 'PDF' },
            ].map(r => (
              <div key={r.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-100 hover:border-slate-200 transition-all">
                <div>
                  <p className="text-xs font-medium text-slate-700">{r.name}</p>
                  <p className="text-[10px] text-slate-400 font-mono">{r.id} · {r.date}</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] bg-blue-100 text-blue-700 px-2 py-0.5 rounded font-medium">{r.format}</span>
                  <button className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"><Download size={13} /></button>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
