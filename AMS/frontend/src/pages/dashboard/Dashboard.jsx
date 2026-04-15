import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  LineChart, Line, Area, AreaChart
} from 'recharts'
import { dashboardService } from '../../services/apiService'
import { formatCurrency, formatShort, formatPct, formatDate } from '../../utils/formatters'
import { CardSkeleton, StatCard } from '../../components/common/index.jsx'
import { Briefcase, TrendingUp, DollarSign, Activity, Calendar } from 'lucide-react'
import toast from 'react-hot-toast'

const PIE_COLORS = ['#1B4F72','#2E86C1','#27AE60','#F39C12','#8E44AD','#E74C3C']

const ASSET_LABELS = {
  MUTUAL_FUND:'Mutual Fund', SIP:'SIP',
  FIXED_DEPOSIT:'Fixed Deposit', SAVINGS:'Savings', OTHER:'Other'
}

export default function Dashboard() {
  const [data, setData]     = useState(null)
  const [loading, setLoading] = useState(true)

  const load = async () => {
    try {
      const res = await dashboardService.get()
      setData(res.data.data)
    } catch {
      toast.error('Failed to load dashboard')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  if (loading) return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {[...Array(5)].map((_,i) => <CardSkeleton key={i} />)}
      </div>
      <div className="grid md:grid-cols-2 gap-6">
        <CardSkeleton /><CardSkeleton />
      </div>
    </div>
  )

  const profitPositive = data?.profitLoss >= 0

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-800">Portfolio Dashboard</h1>
        <button onClick={load} className="btn-outline text-sm px-3 py-1.5">↻ Refresh</button>
      </div>

      {/* ── Summary Metrics ─────────────────────────────── */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        <StatCard label="Total Assets"       value={data?.totalAssets ?? 0}                            icon={Briefcase} />
        <StatCard label="Total Invested"     value={formatShort(data?.totalInvestment)}                icon={DollarSign} />
        <StatCard label="Current Value"      value={formatShort(data?.currentValue)}                   icon={TrendingUp} />
        <StatCard
          label="Profit / Loss"
          value={formatShort(Math.abs(data?.profitLoss ?? 0))}
          sub={formatPct(data?.profitLossPct)}
          positive={profitPositive}
          icon={Activity}
        />
        <StatCard label="Monthly Investment" value={formatShort(data?.monthlyInvestment)}              icon={Calendar} />
      </div>

      {/* ── Charts Row 1 ────────────────────────────────── */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Asset Allocation Pie */}
        <div className="card">
          <h2 className="font-semibold text-gray-700 mb-4">Asset Allocation</h2>
          {data?.assetAllocation?.length > 0 ? (
            <ResponsiveContainer width="100%" height={260}>
              <PieChart>
                <Pie data={data.assetAllocation} dataKey="value" nameKey="type"
                     cx="50%" cy="50%" outerRadius={90} label={({ type, percent }) =>
                       `${ASSET_LABELS[type] || type} ${(percent*100).toFixed(0)}%`}>
                  {data.assetAllocation.map((_, i) => (
                    <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(val) => formatCurrency(val)} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-gray-400 text-sm text-center py-16">No assets yet</p>
          )}
        </div>

        {/* Monthly Investment Bar */}
        <div className="card">
          <h2 className="font-semibold text-gray-700 mb-4">Monthly Investments — Last 12 Months</h2>
          {data?.monthlyInvestments?.length > 0 ? (
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={data.monthlyInvestments}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                <YAxis tickFormatter={v => formatShort(v)} tick={{ fontSize: 11 }} />
                <Tooltip formatter={(val) => formatCurrency(val)} />
                <Bar dataKey="total" fill="#1B4F72" radius={[4,4,0,0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-gray-400 text-sm text-center py-16">No investment transactions yet</p>
          )}
        </div>
      </div>

      {/* ── Credit vs Debit Area Chart ───────────────────── */}
      <div className="card">
        <h2 className="font-semibold text-gray-700 mb-4">Credit vs Debit — Last 12 Months</h2>
        {data?.creditVsDebit?.length > 0 ? (
          <ResponsiveContainer width="100%" height={240}>
            <AreaChart data={data.creditVsDebit}>
              <defs>
                <linearGradient id="gradCredits" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#27AE60" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#27AE60" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="gradDebits" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#E74C3C" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#E74C3C" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="month" tick={{ fontSize: 11 }} />
              <YAxis tickFormatter={v => formatShort(v)} tick={{ fontSize: 11 }} />
              <Tooltip formatter={(val) => formatCurrency(val)} />
              <Legend />
              <Area type="monotone" dataKey="credits" stroke="#27AE60" fill="url(#gradCredits)" strokeWidth={2} name="Credits" />
              <Area type="monotone" dataKey="debits"  stroke="#E74C3C" fill="url(#gradDebits)"  strokeWidth={2} name="Debits" />
            </AreaChart>
          </ResponsiveContainer>
        ) : (
          <p className="text-gray-400 text-sm text-center py-10">No transaction data yet</p>
        )}
      </div>

      {/* ── Recent Transactions ──────────────────────────── */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-gray-700">Recent Transactions</h2>
          <Link to="/transactions" className="text-sm text-navy hover:underline">View All →</Link>
        </div>
        {data?.recentTransactions?.length > 0 ? (
          <div className="divide-y divide-gray-50">
            {data.recentTransactions.map(txn => (
              <div key={txn.transactionId} className="flex items-center justify-between py-3">
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold
                    ${txn.type === 'CREDIT' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                    {txn.type === 'CREDIT' ? '↑' : '↓'}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-700">{txn.category}</p>
                    <p className="text-xs text-gray-400">{formatDate(txn.txnDate)}</p>
                  </div>
                </div>
                <span className={`text-sm font-semibold ${txn.type === 'CREDIT' ? 'text-green-600' : 'text-red-500'}`}>
                  {txn.type === 'CREDIT' ? '+' : '-'}{formatCurrency(txn.amount)}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-400 text-sm text-center py-8">No transactions yet</p>
        )}
      </div>
    </div>
  )
}
