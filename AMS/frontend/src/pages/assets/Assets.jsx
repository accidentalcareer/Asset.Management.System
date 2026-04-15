import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { assetService } from '../../services/apiService'
import { formatCurrency, formatPct, assetTypeLabel, assetTypeColor } from '../../utils/formatters'
import { Drawer, ConfirmModal, EmptyState, FormField } from '../../components/common/index.jsx'
import { Briefcase, Plus, MoreVertical, TrendingUp, TrendingDown } from 'lucide-react'
import toast from 'react-hot-toast'

const ASSET_TYPES = ['MUTUAL_FUND','SIP','FIXED_DEPOSIT','SAVINGS','OTHER']
const TABS = ['ALL', ...ASSET_TYPES]

export default function Assets() {
  const [assets, setAssets]         = useState([])
  const [activeTab, setActiveTab]   = useState('ALL')
  const [loading, setLoading]       = useState(true)
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [editing, setEditing]       = useState(null)
  const [deleting, setDeleting]     = useState(null)
  const [delLoading, setDelLoading] = useState(false)

  const { register, handleSubmit, reset, setValue, formState: { errors, isSubmitting } } = useForm()

  const load = async (type) => {
    setLoading(true)
    try {
      const res = await assetService.getAll(type === 'ALL' ? '' : type)
      setAssets(res.data.data)
    } catch { toast.error('Failed to load assets') }
    finally { setLoading(false) }
  }

  useEffect(() => { load(activeTab) }, [activeTab])

  const openCreate = () => { setEditing(null); reset({}); setDrawerOpen(true) }
  const openEdit   = (a) => {
    setEditing(a)
    setValue('assetName',        a.assetName)
    setValue('assetType',        a.assetType)
    setValue('investmentAmount', a.investmentAmount)
    setValue('currentValue',     a.currentValue)
    setValue('purchaseDate',     a.purchaseDate)
    setDrawerOpen(true)
  }

  const onSubmit = async (data) => {
    try {
      if (editing) {
        await assetService.update(editing.assetId, data)
        toast.success('Asset updated')
      } else {
        await assetService.create(data)
        toast.success('Asset added')
      }
      setDrawerOpen(false)
      load(activeTab)
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save asset')
    }
  }

  const confirmDelete = async () => {
    setDelLoading(true)
    try {
      await assetService.remove(deleting.assetId)
      toast.success('Asset deleted')
      setDeleting(null)
      load(activeTab)
    } catch { toast.error('Failed to delete') }
    finally { setDelLoading(false) }
  }

  // Totals
  const totalInvested = assets.reduce((s, a) => s + Number(a.investmentAmount), 0)
  const totalValue    = assets.reduce((s, a) => s + Number(a.currentValue), 0)
  const totalGain     = totalValue - totalInvested

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-800">Asset Portfolio</h1>
        <button onClick={openCreate} className="btn-primary flex items-center gap-2">
          <Plus size={16} /> Add Asset
        </button>
      </div>

      {/* Summary strip */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Total Assets',     value: assets.length },
          { label: 'Total Invested',   value: formatCurrency(totalInvested) },
          { label: 'Portfolio Value',  value: formatCurrency(totalValue),
            sub: `${totalGain >= 0 ? '+' : ''}${formatCurrency(totalGain)}`,
            pos: totalGain >= 0 },
        ].map(s => (
          <div key={s.label} className="card">
            <p className="text-sm text-gray-500">{s.label}</p>
            <p className="text-xl font-bold text-gray-800 mt-1">{s.value}</p>
            {s.sub && <p className={`text-sm font-medium mt-0.5 ${s.pos ? 'text-green-600' : 'text-red-500'}`}>{s.sub}</p>}
          </div>
        ))}
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2 flex-wrap">
        {TABS.map(tab => (
          <button key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors
              ${activeTab === tab ? 'bg-navy text-white' : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'}`}>
            {tab === 'ALL' ? 'All' : assetTypeLabel(tab)}
          </button>
        ))}
      </div>

      {/* Asset Grid */}
      {loading ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_,i) => (
            <div key={i} className="card animate-pulse space-y-3">
              <div className="h-4 bg-gray-200 rounded w-1/2" />
              <div className="h-6 bg-gray-200 rounded w-1/3" />
              <div className="h-4 bg-gray-200 rounded w-2/3" />
            </div>
          ))}
        </div>
      ) : assets.length === 0 ? (
        <div className="card">
          <EmptyState icon={Briefcase} message="No assets found. Add your first asset to get started."
            action="Add Asset" onAction={openCreate} />
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {assets.map(a => {
            const gain    = Number(a.gainLoss)
            const gainPos = gain >= 0
            return (
              <div key={a.assetId} className="card hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <p className="font-semibold text-gray-800">{a.assetName}</p>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium mt-1 inline-block ${assetTypeColor(a.assetType)}`}>
                      {assetTypeLabel(a.assetType)}
                    </span>
                  </div>
                  <div className="relative group">
                    <button className="text-gray-400 hover:text-gray-600 p-1"><MoreVertical size={16} /></button>
                    <div className="absolute right-0 top-7 bg-white border border-gray-100 rounded-lg shadow-lg z-10 hidden group-hover:block min-w-[100px]">
                      <button onClick={() => openEdit(a)}       className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50">Edit</button>
                      <button onClick={() => setDeleting(a)}    className="w-full text-left px-4 py-2 text-sm text-red-500 hover:bg-gray-50">Delete</button>
                    </div>
                  </div>
                </div>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between text-gray-500">
                    <span>Invested</span><span className="font-medium text-gray-700">{formatCurrency(a.investmentAmount)}</span>
                  </div>
                  <div className="flex justify-between text-gray-500">
                    <span>Current Value</span><span className="font-medium text-gray-700">{formatCurrency(a.currentValue)}</span>
                  </div>
                </div>
                <div className={`flex items-center gap-1 mt-3 text-sm font-semibold ${gainPos ? 'text-green-600' : 'text-red-500'}`}>
                  {gainPos ? <TrendingUp size={14}/> : <TrendingDown size={14}/>}
                  {gainPos ? '+' : ''}{formatCurrency(gain)} ({formatPct(a.gainLossPct)})
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* ── Drawer Form ── */}
      <Drawer open={drawerOpen} onClose={() => setDrawerOpen(false)}
              title={editing ? 'Edit Asset' : 'Add New Asset'}>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <FormField label="Asset Name" required error={errors.assetName?.message}>
            <input className="input" placeholder="e.g. HDFC Flexi Cap Fund"
              {...register('assetName', { required: 'Required' })} />
          </FormField>

          <FormField label="Asset Type" required error={errors.assetType?.message}>
            <select className="input" {...register('assetType', { required: 'Required' })}>
              <option value="">Select type</option>
              {ASSET_TYPES.map(t => <option key={t} value={t}>{assetTypeLabel(t)}</option>)}
            </select>
          </FormField>

          <FormField label="Investment Amount (₹)" required error={errors.investmentAmount?.message}>
            <input className="input" type="number" step="0.01" placeholder="50000"
              {...register('investmentAmount', { required: 'Required', min: { value: 1, message: 'Must be positive' } })} />
          </FormField>

          <FormField label="Current Value (₹)" required error={errors.currentValue?.message}>
            <input className="input" type="number" step="0.01" placeholder="55000"
              {...register('currentValue', { required: 'Required', min: { value: 0, message: 'Must be ≥ 0' } })} />
          </FormField>

          <FormField label="Purchase Date" required error={errors.purchaseDate?.message}>
            <input className="input" type="date"
              {...register('purchaseDate', { required: 'Required' })} />
          </FormField>

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={() => setDrawerOpen(false)} className="btn-outline flex-1">Cancel</button>
            <button type="submit" disabled={isSubmitting} className="btn-primary flex-1">
              {isSubmitting ? 'Saving…' : editing ? 'Update Asset' : 'Add Asset'}
            </button>
          </div>
        </form>
      </Drawer>

      {/* ── Confirm Delete ── */}
      <ConfirmModal
        open={!!deleting} loading={delLoading}
        onClose={() => setDeleting(null)} onConfirm={confirmDelete}
        message={`Delete "${deleting?.assetName}"? This will mark it as inactive.`}
      />
    </div>
  )
}
