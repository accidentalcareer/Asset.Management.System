import { useEffect, useState } from 'react'
import { useForm, useWatch } from 'react-hook-form'
import { sipService } from '../../services/apiService'
import { formatCurrency, formatDate } from '../../utils/formatters'
import { Drawer, ConfirmModal, EmptyState, FormField } from '../../components/common/index.jsx'
import { TrendingUp, Plus, ChevronDown, ChevronUp } from 'lucide-react'
import toast from 'react-hot-toast'

// SIP FV formula (client-side preview)
const sipFV = (P, annualRate, months) => {
  if (!P || !annualRate || !months) return 0
  const r = annualRate / 12 / 100
  return P * ((Math.pow(1 + r, months) - 1) / r) * (1 + r)
}

const STATUS_BADGE = {
  ACTIVE:    'badge-green',
  PAUSED:    'badge-amber',
  COMPLETED: 'badge-blue',
}

export default function Sips() {
  const [sips, setSips]             = useState([])
  const [loading, setLoading]       = useState(true)
  const [expanded, setExpanded]     = useState(null)
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [editing, setEditing]       = useState(null)
  const [deleting, setDeleting]     = useState(null)
  const [delLoading, setDelLoading] = useState(false)

  const { register, handleSubmit, reset, setValue, control, formState: { errors, isSubmitting } } = useForm()

  // Live preview values
  const watchAmount   = useWatch({ control, name: 'monthlyAmount' })
  const watchReturn   = useWatch({ control, name: 'expectedReturn' })
  const watchDuration = useWatch({ control, name: 'duration' })
  const previewFV = sipFV(Number(watchAmount), Number(watchReturn), Number(watchDuration))

  const load = async () => {
    setLoading(true)
    try {
      const res = await sipService.getAll()
      setSips(res.data.data)
    } catch { toast.error('Failed to load SIPs') }
    finally { setLoading(false) }
  }

  useEffect(() => { load() }, [])

  const openCreate = () => { setEditing(null); reset({}); setDrawerOpen(true) }
  const openEdit   = (s) => {
    setEditing(s)
    setValue('fundName',       s.fundName)
    setValue('monthlyAmount',  s.monthlyAmount)
    setValue('expectedReturn', s.expectedReturn)
    setValue('duration',       s.duration)
    setValue('startDate',      s.startDate)
    setValue('status',         s.status)
    setDrawerOpen(true)
  }

  const onSubmit = async (data) => {
    try {
      if (editing) {
        await sipService.update(editing.sipId, data)
        toast.success('SIP updated')
      } else {
        await sipService.create(data)
        toast.success('SIP created')
      }
      setDrawerOpen(false)
      load()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save SIP')
    }
  }

  const confirmDelete = async () => {
    setDelLoading(true)
    try {
      await sipService.remove(deleting.sipId)
      toast.success('SIP deleted')
      setDeleting(null)
      load()
    } catch { toast.error('Failed to delete') }
    finally { setDelLoading(false) }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-800">SIP Management</h1>
        <button onClick={openCreate} className="btn-primary flex items-center gap-2">
          <Plus size={16} /> Add SIP
        </button>
      </div>

      {loading ? (
        <div className="card animate-pulse space-y-4">
          {[...Array(3)].map((_,i) => <div key={i} className="h-12 bg-gray-100 rounded" />)}
        </div>
      ) : sips.length === 0 ? (
        <div className="card">
          <EmptyState icon={TrendingUp} message="No SIPs yet. Add your first SIP." action="Add SIP" onAction={openCreate} />
        </div>
      ) : (
        <div className="card p-0 overflow-hidden">
          {/* Table header */}
          <div className="hidden md:grid grid-cols-7 gap-4 px-6 py-3 bg-gray-50 text-xs font-semibold text-gray-500 uppercase tracking-wide">
            <span className="col-span-2">Fund Name</span>
            <span>Monthly</span>
            <span>Start Date</span>
            <span>Duration</span>
            <span>Return %</span>
            <span>Status / Actions</span>
          </div>

          <div className="divide-y divide-gray-50">
            {sips.map(sip => (
              <div key={sip.sipId}>
                {/* Row */}
                <div className="grid md:grid-cols-7 gap-4 px-6 py-4 items-center hover:bg-gray-50/50 cursor-pointer"
                     onClick={() => setExpanded(expanded === sip.sipId ? null : sip.sipId)}>
                  <div className="col-span-2">
                    <p className="font-medium text-gray-800">{sip.fundName}</p>
                    {/* mobile only */}
                    <p className="text-xs text-gray-400 md:hidden">{formatCurrency(sip.monthlyAmount)}/mo · {sip.duration} mo</p>
                  </div>
                  <span className="hidden md:block text-gray-700 font-medium">{formatCurrency(sip.monthlyAmount)}</span>
                  <span className="hidden md:block text-gray-500 text-sm">{formatDate(sip.startDate)}</span>
                  <span className="hidden md:block text-gray-500 text-sm">{sip.duration} mo</span>
                  <span className="hidden md:block text-gray-500 text-sm">{sip.expectedReturn}%</span>
                  <div className="flex items-center gap-2 justify-between">
                    <span className={`${STATUS_BADGE[sip.status] || 'badge-blue'}`}>{sip.status}</span>
                    <div className="flex items-center gap-1">
                      <button onClick={(e) => { e.stopPropagation(); openEdit(sip) }}
                        className="text-xs text-navy hover:underline">Edit</button>
                      <span className="text-gray-300">|</span>
                      <button onClick={(e) => { e.stopPropagation(); setDeleting(sip) }}
                        className="text-xs text-red-400 hover:underline">Del</button>
                      {expanded === sip.sipId ? <ChevronUp size={14} className="text-gray-400" /> : <ChevronDown size={14} className="text-gray-400" />}
                    </div>
                  </div>
                </div>

                {/* Expanded detail */}
                {expanded === sip.sipId && (
                  <div className="bg-blue-50/40 px-6 py-4 grid md:grid-cols-4 gap-4 text-sm border-t border-blue-100">
                    {[
                      { label: 'Months Completed', value: `${sip.monthsCompleted} / ${sip.duration}` },
                      { label: 'Total Invested',   value: formatCurrency(sip.totalInvested) },
                      { label: 'Est. Current Value', value: formatCurrency(sip.estimatedValue) },
                      { label: 'Returns Earned',   value: formatCurrency(sip.returnsEarned) },
                    ].map(item => (
                      <div key={item.label}>
                        <p className="text-gray-400 text-xs">{item.label}</p>
                        <p className="font-semibold text-gray-700 mt-0.5">{item.value}</p>
                      </div>
                    ))}
                    {/* Progress bar */}
                    <div className="md:col-span-4">
                      <div className="flex justify-between text-xs text-gray-400 mb-1">
                        <span>Progress</span><span>{sip.completionPct?.toFixed(1)}%</span>
                      </div>
                      <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div className="h-full bg-navy rounded-full transition-all"
                             style={{ width: `${sip.completionPct ?? 0}%` }} />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Drawer ── */}
      <Drawer open={drawerOpen} onClose={() => setDrawerOpen(false)}
              title={editing ? 'Edit SIP' : 'Add New SIP'}>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <FormField label="Fund Name" required error={errors.fundName?.message}>
            <input className="input" placeholder="e.g. SBI Bluechip Fund"
              {...register('fundName', { required: 'Required' })} />
          </FormField>

          <FormField label="Monthly Amount (₹)" required error={errors.monthlyAmount?.message}>
            <input className="input" type="number" step="0.01" placeholder="5000"
              {...register('monthlyAmount', { required: 'Required', min: { value: 1, message: 'Must be positive' } })} />
          </FormField>

          <FormField label="Expected Annual Return (%)" required error={errors.expectedReturn?.message}>
            <input className="input" type="number" step="0.01" placeholder="12"
              {...register('expectedReturn', { required: 'Required', min: { value: 0.1, message: 'Must be positive' } })} />
          </FormField>

          <FormField label="Duration (months)" required error={errors.duration?.message}>
            <input className="input" type="number" placeholder="120"
              {...register('duration', { required: 'Required', min: { value: 1, message: 'Min 1 month' } })} />
          </FormField>

          <FormField label="Start Date" required error={errors.startDate?.message}>
            <input className="input" type="date"
              {...register('startDate', { required: 'Required' })} />
          </FormField>

          {editing && (
            <FormField label="Status">
              <select className="input" {...register('status')}>
                <option value="ACTIVE">Active</option>
                <option value="PAUSED">Paused</option>
                <option value="COMPLETED">Completed</option>
              </select>
            </FormField>
          )}

          {/* Live preview */}
          {previewFV > 0 && (
            <div className="bg-green-50 border border-green-100 rounded-lg p-4 text-sm">
              <p className="text-gray-500 text-xs mb-1">Projected Maturity Value</p>
              <p className="text-2xl font-bold text-green-700">{formatCurrency(previewFV)}</p>
              <p className="text-xs text-gray-400 mt-1">
                Invested: {formatCurrency(Number(watchAmount) * Number(watchDuration))} ·
                Profit: {formatCurrency(previewFV - Number(watchAmount) * Number(watchDuration))}
              </p>
            </div>
          )}

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={() => setDrawerOpen(false)} className="btn-outline flex-1">Cancel</button>
            <button type="submit" disabled={isSubmitting} className="btn-primary flex-1">
              {isSubmitting ? 'Saving…' : editing ? 'Update SIP' : 'Create SIP'}
            </button>
          </div>
        </form>
      </Drawer>

      <ConfirmModal open={!!deleting} loading={delLoading}
        onClose={() => setDeleting(null)} onConfirm={confirmDelete}
        message={`Delete SIP "${deleting?.fundName}"?`} />
    </div>
  )
}
