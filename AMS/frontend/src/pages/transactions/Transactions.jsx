import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { transactionService } from '../../services/apiService'
import { formatCurrency, formatDate, downloadBlob } from '../../utils/formatters'
import { Modal, ConfirmModal, EmptyState, FormField } from '../../components/common/index.jsx'
import { ArrowLeftRight, Plus, Download, ChevronDown } from 'lucide-react'
import toast from 'react-hot-toast'

const CREDIT_CATEGORIES = ['Salary','Investment Returns','FD Interest','Rental Income','Gift','Other Income']
const DEBIT_CATEGORIES  = ['Rent','Utilities','Groceries','SIP','Fixed Deposit','Withdrawal','Shopping','Other Expense']

export default function Transactions() {
  const [data, setData]           = useState({ transactions: [], totalCredits: 0, totalDebits: 0, netBalance: 0 })
  const [loading, setLoading]     = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing]     = useState(null)
  const [deleting, setDeleting]   = useState(null)
  const [delLoading, setDelLoading] = useState(false)
  const [exportOpen, setExportOpen] = useState(false)
  const [txnType, setTxnType]     = useState('CREDIT')

  // Filter state
  const [filters, setFilters] = useState({ type: '', category: '', from: '', to: '', keyword: '' })

  const { register, handleSubmit, reset, setValue, formState: { errors, isSubmitting } } = useForm()

  const load = async (f = filters) => {
    setLoading(true)
    try {
      const params = { type: f.type || undefined, category: f.category || undefined,
                       from: f.from || undefined, to: f.to || undefined, keyword: f.keyword || undefined }
      const res = await transactionService.getAll(params)
      setData(res.data.data)
    } catch { toast.error('Failed to load transactions') }
    finally { setLoading(false) }
  }

  useEffect(() => { load() }, [])

  const applyFilters = (e) => { e.preventDefault(); load(filters) }
  const clearFilters = () => { const f = { type:'',category:'',from:'',to:'',keyword:'' }; setFilters(f); load(f) }

  const openCreate = () => { setEditing(null); reset({ type: 'CREDIT' }); setTxnType('CREDIT'); setModalOpen(true) }
  const openEdit   = (t) => {
    setEditing(t)
    setValue('amount',      t.amount)
    setValue('category',    t.category)
    setValue('txnDate',     t.txnDate)
    setValue('description', t.description)
    setModalOpen(true)
  }

  const onSubmit = async (formData) => {
    try {
      if (editing) {
        await transactionService.update(editing.transactionId, formData)
        toast.success('Transaction updated')
      } else {
        await transactionService.create({ ...formData, type: txnType })
        toast.success('Transaction recorded')
      }
      setModalOpen(false)
      load()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save')
    }
  }

  const confirmDelete = async () => {
    setDelLoading(true)
    try {
      await transactionService.remove(deleting.transactionId)
      toast.success('Transaction deleted')
      setDeleting(null)
      load()
    } catch { toast.error('Failed to delete') }
    finally { setDelLoading(false) }
  }

  const handleExport = async (format) => {
    setExportOpen(false)
    try {
      const res = format === 'csv' ? await transactionService.exportCsv() : await transactionService.exportPdf()
      downloadBlob(res.data, `transactions.${format}`)
      toast.success(`Exported as ${format.toUpperCase()}`)
    } catch { toast.error('Export failed') }
  }

  const categories = txnType === 'CREDIT' ? CREDIT_CATEGORIES : DEBIT_CATEGORIES

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h1 className="text-2xl font-bold text-gray-800">Transactions</h1>
        <div className="flex gap-3">
          <div className="relative">
            <button onClick={() => setExportOpen(o => !o)} className="btn-outline flex items-center gap-2 text-sm">
              <Download size={15} /> Export <ChevronDown size={14} />
            </button>
            {exportOpen && (
              <div className="absolute right-0 top-10 bg-white border border-gray-100 rounded-lg shadow-lg z-10 min-w-[140px]">
                <button onClick={() => handleExport('csv')} className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50">Export as CSV</button>
                <button onClick={() => handleExport('pdf')} className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50">Export as PDF</button>
              </div>
            )}
          </div>
          <button onClick={openCreate} className="btn-primary flex items-center gap-2 text-sm">
            <Plus size={15} /> Add Transaction
          </button>
        </div>
      </div>

      {/* Filter bar */}
      <div className="card">
        <form onSubmit={applyFilters} className="grid grid-cols-2 md:grid-cols-5 gap-3 items-end">
          <div>
            <label className="label text-xs">Type</label>
            <select className="input text-sm" value={filters.type} onChange={e => setFilters(f => ({...f, type: e.target.value}))}>
              <option value="">All</option>
              <option value="CREDIT">Credit</option>
              <option value="DEBIT">Debit</option>
            </select>
          </div>
          <div>
            <label className="label text-xs">From</label>
            <input type="date" className="input text-sm" value={filters.from}
              onChange={e => setFilters(f => ({...f, from: e.target.value}))} />
          </div>
          <div>
            <label className="label text-xs">To</label>
            <input type="date" className="input text-sm" value={filters.to}
              onChange={e => setFilters(f => ({...f, to: e.target.value}))} />
          </div>
          <div>
            <label className="label text-xs">Keyword</label>
            <input className="input text-sm" placeholder="Search description…" value={filters.keyword}
              onChange={e => setFilters(f => ({...f, keyword: e.target.value}))} />
          </div>
          <div className="flex gap-2">
            <button type="submit" className="btn-primary text-sm flex-1">Filter</button>
            <button type="button" onClick={clearFilters} className="btn-outline text-sm px-3">✕</button>
          </div>
        </form>
      </div>

      {/* Summary ribbon */}
      <div className="grid grid-cols-3 gap-4">
        <div className="card border-l-4 border-green-400">
          <p className="text-xs text-gray-500">Total Credits</p>
          <p className="text-lg font-bold text-green-600 mt-1">{formatCurrency(data.totalCredits)}</p>
        </div>
        <div className="card border-l-4 border-red-400">
          <p className="text-xs text-gray-500">Total Debits</p>
          <p className="text-lg font-bold text-red-500 mt-1">{formatCurrency(data.totalDebits)}</p>
        </div>
        <div className="card border-l-4 border-blue-400">
          <p className="text-xs text-gray-500">Net Balance</p>
          <p className={`text-lg font-bold mt-1 ${data.netBalance >= 0 ? 'text-blue-600' : 'text-red-500'}`}>
            {formatCurrency(data.netBalance)}
          </p>
        </div>
      </div>

      {/* Table */}
      {loading ? (
        <div className="card animate-pulse space-y-3">
          {[...Array(5)].map((_,i) => <div key={i} className="h-10 bg-gray-100 rounded" />)}
        </div>
      ) : data.transactions.length === 0 ? (
        <div className="card">
          <EmptyState icon={ArrowLeftRight} message="No transactions found."
            action="Add Transaction" onAction={openCreate} />
        </div>
      ) : (
        <div className="card p-0 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr className="text-left text-xs text-gray-500 uppercase tracking-wide">
                <th className="px-6 py-3">Date</th>
                <th className="px-6 py-3">Category</th>
                <th className="px-6 py-3">Description</th>
                <th className="px-6 py-3">Type</th>
                <th className="px-6 py-3 text-right">Amount</th>
                <th className="px-6 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {data.transactions.map((t, idx) => (
                <tr key={t.transactionId} className={idx % 2 === 0 ? '' : 'bg-gray-50/40'}>
                  <td className="px-6 py-3 text-gray-500">{formatDate(t.txnDate)}</td>
                  <td className="px-6 py-3 font-medium text-gray-700">{t.category}</td>
                  <td className="px-6 py-3 text-gray-500 max-w-xs truncate">{t.description || '—'}</td>
                  <td className="px-6 py-3">
                    <span className={t.type === 'CREDIT' ? 'badge-green' : 'badge-red'}>{t.type}</span>
                  </td>
                  <td className={`px-6 py-3 text-right font-semibold ${t.type === 'CREDIT' ? 'text-green-600' : 'text-red-500'}`}>
                    {t.type === 'CREDIT' ? '+' : '-'}{formatCurrency(t.amount)}
                  </td>
                  <td className="px-6 py-3">
                    <div className="flex gap-2 justify-end">
                      <button onClick={() => openEdit(t)}    className="text-navy text-xs hover:underline">Edit</button>
                      <button onClick={() => setDeleting(t)} className="text-red-400 text-xs hover:underline">Del</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* ── Add/Edit Modal ── */}
      <Modal open={modalOpen} onClose={() => setModalOpen(false)}
             title={editing ? 'Edit Transaction' : 'Add Transaction'}>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {!editing && (
            <div className="flex gap-2">
              {['CREDIT','DEBIT'].map(t => (
                <button key={t} type="button" onClick={() => setTxnType(t)}
                  className={`flex-1 py-2 rounded-lg text-sm font-medium border transition-colors
                    ${txnType === t
                      ? t === 'CREDIT' ? 'bg-green-500 text-white border-green-500' : 'bg-red-500 text-white border-red-500'
                      : 'bg-white text-gray-600 border-gray-200'}`}>
                  {t}
                </button>
              ))}
            </div>
          )}

          <FormField label="Amount (₹)" required error={errors.amount?.message}>
            <input className="input" type="number" step="0.01" placeholder="5000"
              {...register('amount', { required: 'Required', min: { value: 0.01, message: 'Must be positive' } })} />
          </FormField>

          <FormField label="Category" required error={errors.category?.message}>
            <select className="input" {...register('category', { required: 'Required' })}>
              <option value="">Select category</option>
              {(editing
                ? [...CREDIT_CATEGORIES, ...DEBIT_CATEGORIES]
                : txnType === 'CREDIT' ? CREDIT_CATEGORIES : DEBIT_CATEGORIES
              ).map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </FormField>

          <FormField label="Date" required error={errors.txnDate?.message}>
            <input className="input" type="date"
              {...register('txnDate', { required: 'Required' })} />
          </FormField>

          <FormField label="Description">
            <textarea className="input" rows={2} placeholder="Optional notes"
              {...register('description')} />
          </FormField>

          <div className="flex gap-3 pt-1">
            <button type="button" onClick={() => setModalOpen(false)} className="btn-outline flex-1">Cancel</button>
            <button type="submit" disabled={isSubmitting} className="btn-primary flex-1">
              {isSubmitting ? 'Saving…' : editing ? 'Update' : 'Add Transaction'}
            </button>
          </div>
        </form>
      </Modal>

      <ConfirmModal open={!!deleting} loading={delLoading}
        onClose={() => setDeleting(null)} onConfirm={confirmDelete}
        message="Delete this transaction?" />
    </div>
  )
}
