import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  Legend, ResponsiveContainer
} from 'recharts'
import { projectionService } from '../../services/apiService'
import { formatCurrency, formatShort } from '../../utils/formatters'
import { ConfirmModal, FormField } from '../../components/common/index.jsx'
import { LineChart as LineChartIcon, Trash2 } from 'lucide-react'
import toast from 'react-hot-toast'

// Client-side SIP FV for instant preview
const sipFV = (P, rate, months) => {
  if (!P || !rate || !months) return 0
  const r = rate / 12 / 100
  return P * ((Math.pow(1 + r, months) - 1) / r) * (1 + r)
}

const MILESTONE_YEARS = [3, 5, 10, 20]

export default function Projections() {
  const [result, setResult]         = useState(null)
  const [saved, setSaved]           = useState([])
  const [loading, setLoading]       = useState(false)
  const [savedLoading, setSavedLoading] = useState(true)
  const [deleting, setDeleting]     = useState(null)
  const [delLoading, setDelLoading] = useState(false)

  // Compare mode
  const [compareResult, setCompareResult] = useState(null)
  const [compareMode, setCompareMode]     = useState(false)

  // Retirement planner
  const [retResult, setRetResult] = useState(null)
  const [retLoading, setRetLoading] = useState(false)

  const { register, handleSubmit, watch, formState: { errors, isSubmitting } } = useForm({ defaultValues: { years: 10 } })
  const { register: retReg, handleSubmit: retSubmit, formState: { errors: retErrors } } = useForm()
  const { register: cmpReg, handleSubmit: cmpSubmit, watch: cmpWatch } = useForm({ defaultValues: { years: 10 } })

  const watchP    = watch('monthlyAmount')
  const watchR    = watch('expectedReturn')
  const watchY    = watch('years')
  const cmpP      = cmpWatch('monthlyAmount')
  const cmpR      = cmpWatch('expectedReturn')
  const cmpY      = cmpWatch('years')

  const loadSaved = async () => {
    setSavedLoading(true)
    try {
      const res = await projectionService.getSaved()
      setSaved(res.data.data)
    } catch { toast.error('Failed to load saved projections') }
    finally { setSavedLoading(false) }
  }

  useEffect(() => { loadSaved() }, [])

  const onCalculate = async (data) => {
    setLoading(true)
    try {
      const res = await projectionService.calculate(data)
      setResult(res.data.data)
      loadSaved()
      toast.success('Projection calculated & saved')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Calculation failed')
    } finally { setLoading(false) }
  }

  const onCompare = (data) => {
    const months = data.years * 12
    const chart  = Array.from({ length: data.years + 1 }, (_, y) => ({
      year:     y,
      invested: Number(data.monthlyAmount) * y * 12,
      value:    sipFV(Number(data.monthlyAmount), Number(data.expectedReturn), y * 12)
    }))
    setCompareResult({ ...data, chart })
  }

  const onRetirement = async (data) => {
    setRetLoading(true)
    try {
      const res = await projectionService.retirement({
        currentAge:   data.currentAge,
        retirementAge: data.retirementAge,
        targetCorpus: data.targetCorpus,
        annualReturn: data.annualReturn,
      })
      setRetResult(res.data.data)
    } catch (err) {
      toast.error(err.response?.data?.message || 'Calculation failed')
    } finally { setRetLoading(false) }
  }

  const confirmDelete = async () => {
    setDelLoading(true)
    try {
      await projectionService.remove(deleting.projectionId)
      toast.success('Projection deleted')
      setDeleting(null)
      loadSaved()
    } catch { toast.error('Failed to delete') }
    finally { setDelLoading(false) }
  }

  // Live milestones (client-side, before hitting API)
  const liveMilestones = MILESTONE_YEARS.map(y => {
    const months = y * 12
    const fv     = sipFV(Number(watchP), Number(watchR), months)
    const inv    = Number(watchP) * months
    return { years: y, fv, invested: inv, profit: fv - inv }
  }).filter(m => m.years <= Number(watchY || 40))

  // Merge API growth chart with compare overlay
  const mergedChart = result?.growthChart?.map(pt => {
    const cmpPoint = compareResult?.chart?.find(c => c.year === pt.year)
    return {
      ...pt,
      cmpValue:    cmpPoint?.value    ?? null,
      cmpInvested: cmpPoint?.invested ?? null,
    }
  })

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-800">Future Projections</h1>

      {/* ── Main Calculator ── */}
      <div className="grid md:grid-cols-5 gap-6">
        {/* Input panel */}
        <div className="md:col-span-2 card space-y-4">
          <h2 className="font-semibold text-gray-700">SIP Projection Calculator</h2>
          <form onSubmit={handleSubmit(onCalculate)} className="space-y-4">
            <FormField label="Investment Type" required error={errors.investmentType?.message}>
              <input className="input" placeholder="e.g. Equity SIP"
                {...register('investmentType', { required: 'Required' })} />
            </FormField>
            <FormField label="Monthly Amount (₹)" required error={errors.monthlyAmount?.message}>
              <input className="input" type="number" placeholder="5000"
                {...register('monthlyAmount', { required: 'Required', min: { value: 1, message: 'Positive' } })} />
            </FormField>
            <FormField label="Expected Annual Return (%)" required error={errors.expectedReturn?.message}>
              <input className="input" type="number" step="0.1" placeholder="12"
                {...register('expectedReturn', { required: 'Required', min: { value: 0.1, message: 'Positive' } })} />
            </FormField>
            <FormField label={`Duration: ${watchY || 10} years`} required>
              <input type="range" min="1" max="40" className="w-full accent-navy"
                {...register('years', { required: true, valueAsNumber: true })} />
              <div className="flex justify-between text-xs text-gray-400"><span>1 yr</span><span>40 yrs</span></div>
            </FormField>
            <button type="submit" disabled={isSubmitting} className="btn-primary w-full">
              {isSubmitting ? 'Calculating…' : 'Calculate & Save'}
            </button>
          </form>
        </div>

        {/* Milestone cards */}
        <div className="md:col-span-3 space-y-4">
          <h2 className="font-semibold text-gray-700">Projected Milestones</h2>
          {liveMilestones.length > 0 ? (
            <div className="grid grid-cols-2 gap-4">
              {liveMilestones.map(m => (
                <div key={m.years} className="bg-green-50 border border-green-100 rounded-xl p-4">
                  <p className="text-xs text-gray-500 font-medium">After {m.years} Year{m.years > 1 ? 's' : ''}</p>
                  <p className="text-xl font-bold text-green-700 mt-1">{formatShort(m.fv)}</p>
                  <div className="text-xs text-gray-500 mt-2 space-y-0.5">
                    <p>Invested: {formatShort(m.invested)}</p>
                    <p className="text-green-600 font-medium">Profit: +{formatShort(Math.max(0, m.profit))}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-gray-50 rounded-xl p-8 text-center text-gray-400 text-sm">
              Enter values on the left to see projections
            </div>
          )}
        </div>
      </div>

      {/* ── Growth Chart ── */}
      {result && (
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-gray-700">Investment Growth Chart</h2>
            <button onClick={() => setCompareMode(c => !c)}
              className={`text-sm px-3 py-1 rounded-lg border transition-colors
                ${compareMode ? 'bg-navy text-white border-navy' : 'border-gray-200 text-gray-600'}`}>
              {compareMode ? 'Hide Compare' : '+ Compare Scenario'}
            </button>
          </div>

          {compareMode && (
            <form onSubmit={cmpSubmit(onCompare)}
                  className="grid md:grid-cols-4 gap-3 mb-5 p-4 bg-gray-50 rounded-lg">
              <div>
                <label className="label text-xs">Monthly (₹)</label>
                <input className="input text-sm" type="number" placeholder="8000" {...cmpReg('monthlyAmount')} />
              </div>
              <div>
                <label className="label text-xs">Return (%)</label>
                <input className="input text-sm" type="number" placeholder="15" {...cmpReg('expectedReturn')} />
              </div>
              <div>
                <label className="label text-xs">Years</label>
                <input className="input text-sm" type="number" placeholder="10" {...cmpReg('years')} />
              </div>
              <div className="flex items-end">
                <button type="submit" className="btn-outline text-sm w-full">Compare</button>
              </div>
            </form>
          )}

          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={mergedChart || result.growthChart}>
              <defs>
                <linearGradient id="gValue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#1B4F72" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#1B4F72" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="gInvest" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#27AE60" stopOpacity={0.2}/>
                  <stop offset="95%" stopColor="#27AE60" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="year" tickFormatter={y => `Y${y}`} tick={{ fontSize: 11 }} />
              <YAxis tickFormatter={v => formatShort(v)} tick={{ fontSize: 11 }} />
              <Tooltip formatter={(val, name) => [formatCurrency(val), name]} />
              <Legend />
              <Area type="monotone" dataKey="invested" stroke="#27AE60" fill="url(#gInvest)" strokeWidth={2} name="Invested" />
              <Area type="monotone" dataKey="value"    stroke="#1B4F72" fill="url(#gValue)"  strokeWidth={2} name="Projected Value" />
              {compareResult && (
                <Area type="monotone" dataKey="cmpValue" stroke="#E74C3C" fill="none"
                      strokeWidth={2} strokeDasharray="5 5" name="Compare Scenario" />
              )}
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* ── Retirement Planner ── */}
      <div className="card">
        <h2 className="font-semibold text-gray-700 mb-4">Retirement Planner</h2>
        <form onSubmit={retSubmit(onRetirement)} className="grid md:grid-cols-5 gap-4 items-end">
          <div>
            <label className="label text-xs">Current Age</label>
            <input className="input text-sm" type="number" placeholder="30" {...retReg('currentAge', { required: true })} />
          </div>
          <div>
            <label className="label text-xs">Retirement Age</label>
            <input className="input text-sm" type="number" placeholder="60" {...retReg('retirementAge', { required: true })} />
          </div>
          <div>
            <label className="label text-xs">Target Corpus (₹)</label>
            <input className="input text-sm" type="number" placeholder="20000000" {...retReg('targetCorpus', { required: true })} />
          </div>
          <div>
            <label className="label text-xs">Annual Return (%)</label>
            <input className="input text-sm" type="number" step="0.1" placeholder="12" {...retReg('annualReturn', { required: true })} />
          </div>
          <button type="submit" disabled={retLoading} className="btn-primary text-sm">
            {retLoading ? 'Calculating…' : 'Calculate'}
          </button>
        </form>

        {retResult && (
          <div className="mt-5 bg-navy/5 border border-navy/10 rounded-xl p-5">
            <div className="flex items-start gap-4 flex-wrap">
              <div>
                <p className="text-xs text-gray-500">Required Monthly SIP</p>
                <p className="text-3xl font-bold text-navy mt-1">{formatCurrency(retResult.requiredMonthlySip)}</p>
              </div>
              <div className="flex-1 min-w-[200px]">
                <p className="text-sm text-gray-600 mt-2">{retResult.explanation}</p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ── Saved Projections ── */}
      <div className="card">
        <h2 className="font-semibold text-gray-700 mb-4">Saved Projections</h2>
        {savedLoading ? (
          <div className="animate-pulse space-y-3">
            {[...Array(3)].map((_,i) => <div key={i} className="h-10 bg-gray-100 rounded" />)}
          </div>
        ) : saved.length === 0 ? (
          <p className="text-gray-400 text-sm text-center py-8">No saved projections yet. Calculate one above.</p>
        ) : (
          <div className="divide-y divide-gray-50">
            {saved.map(p => (
              <div key={p.projectionId} className="flex items-center justify-between py-3">
                <div>
                  <p className="text-sm font-medium text-gray-700">{p.investmentType}</p>
                  <p className="text-xs text-gray-400">
                    ₹{p.monthlyAmount}/mo · {p.expectedReturn}% · {p.years} yrs
                  </p>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className="text-xs text-gray-400">Future Value</p>
                    <p className="font-semibold text-green-600">{formatShort(p.futureValue)}</p>
                  </div>
                  <button onClick={() => setDeleting(p)} className="text-gray-300 hover:text-red-400 transition-colors">
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <ConfirmModal open={!!deleting} loading={delLoading}
        onClose={() => setDeleting(null)} onConfirm={confirmDelete}
        message="Delete this saved projection?" />
    </div>
  )
}
