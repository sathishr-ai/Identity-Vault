import { AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';


const tooltipStyle = {
  backgroundColor: '#fff',
  border: '1px solid #E2E8F0',
  borderRadius: '12px',
  boxShadow: '0 4px 24px rgba(0,0,0,0.08)',
  fontSize: '12px',
  padding: '8px 12px',
};

export function VerificationAreaChart({ data }: { data?: any[] }) {
  const chartData = data || [];
  return (
    <ResponsiveContainer width="100%" height={220}>
      <AreaChart data={chartData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
        <defs>
          <linearGradient id="colorVer" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#1D4ED8" stopOpacity={0.15} />
            <stop offset="95%" stopColor="#1D4ED8" stopOpacity={0} />
          </linearGradient>
          <linearGradient id="colorReg" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#06B6D4" stopOpacity={0.15} />
            <stop offset="95%" stopColor="#06B6D4" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
        <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#94A3B8' }} axisLine={false} tickLine={false} />
        <YAxis tick={{ fontSize: 11, fill: '#94A3B8' }} axisLine={false} tickLine={false} />
        <Tooltip contentStyle={tooltipStyle} />
        <Area type="monotone" dataKey="registrations" name="Registrations" stroke="#06B6D4" strokeWidth={2} fill="url(#colorReg)" />
        <Area type="monotone" dataKey="verifications" name="Verifications" stroke="#1D4ED8" strokeWidth={2} fill="url(#colorVer)" />
      </AreaChart>
    </ResponsiveContainer>
  );
}

export function ApprovalBarChart({ data }: { data?: any[] }) {
  const chartData = data || [];
  return (
    <ResponsiveContainer width="100%" height={220}>
      <BarChart data={chartData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }} barSize={14}>
        <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
        <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#94A3B8' }} axisLine={false} tickLine={false} />
        <YAxis tick={{ fontSize: 11, fill: '#94A3B8' }} axisLine={false} tickLine={false} />
        <Tooltip contentStyle={tooltipStyle} />
        <Bar dataKey="approved" name="Approved" fill="#10B981" radius={[4, 4, 0, 0]} />
        <Bar dataKey="rejected" name="Rejected" fill="#EF4444" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}

export function StatusPieChart({ data }: { data?: any[] }) {
  const chartData = data || [];
  return (
    <ResponsiveContainer width="100%" height={200}>
      <PieChart>
        <Pie data={chartData} cx="50%" cy="50%" innerRadius={55} outerRadius={80} paddingAngle={3} dataKey="value">
          {chartData.map((entry: any, i: number) => <Cell key={i} fill={entry.color} strokeWidth={0} />)}
        </Pie>
        <Tooltip contentStyle={tooltipStyle} formatter={(val) => typeof val === 'number' ? val.toLocaleString() : val} />
        <Legend iconType="circle" iconSize={8} formatter={(val: string) => <span style={{ fontSize: 11, color: '#64748B' }}>{val}</span>} />
      </PieChart>
    </ResponsiveContainer>
  );
}

export function UserGrowthLine({ data }: { data?: any[] }) {
  const growth = data && data.length > 0 ? data.map(d => ({ month: d.month, users: d.registrations })) : [];
  return (
    <ResponsiveContainer width="100%" height={180}>
      <LineChart data={growth} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
        <defs>
          <linearGradient id="lineGrad" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#1D4ED8" />
            <stop offset="100%" stopColor="#06B6D4" />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
        <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#94A3B8' }} axisLine={false} tickLine={false} />
        <YAxis tick={{ fontSize: 11, fill: '#94A3B8' }} axisLine={false} tickLine={false} />
        <Tooltip contentStyle={tooltipStyle} formatter={(v) => typeof v === 'number' ? v.toLocaleString() : v} />
        <Line type="monotone" dataKey="users" name="Total Users" stroke="url(#lineGrad)" strokeWidth={2.5} dot={{ fill: '#1D4ED8', r: 3 }} activeDot={{ r: 5 }} />
      </LineChart>
    </ResponsiveContainer>
  );
}

export function MiniSparkline({ color = '#1D4ED8', data }: { color?: string, data?: any[] }) {
  const chartData = data && data.length > 0 ? data : [];
  return (
    <ResponsiveContainer width="100%" height={40}>
      <LineChart data={data}>
        <Line type="monotone" dataKey="v" stroke={color} strokeWidth={2} dot={false} />
      </LineChart>
    </ResponsiveContainer>
  );
}

export function UserDocumentBarChart({ data }: { data?: any[] }) {
  const chartData = data || [];
  return (
    <ResponsiveContainer width="100%" height={220}>
      <BarChart data={chartData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }} barSize={10}>
        <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
        <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#94A3B8' }} axisLine={false} tickLine={false} />
        <YAxis tick={{ fontSize: 11, fill: '#94A3B8' }} axisLine={false} tickLine={false} allowDecimals={false} />
        <Tooltip contentStyle={tooltipStyle} />
        <Bar dataKey="verified" name="Verified" fill="#10B981" radius={[4, 4, 0, 0]} />
        <Bar dataKey="pending" name="Pending" fill="#F59E0B" radius={[4, 4, 0, 0]} />
        <Bar dataKey="rejected" name="Rejected" fill="#EF4444" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}
