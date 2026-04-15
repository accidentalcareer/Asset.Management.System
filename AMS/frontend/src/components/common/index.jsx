import { X } from 'lucide-react'

// ── Modal ─────────────────────────────────────────────────────────
export function Modal({ open, onClose, title, children, width = 'max-w-lg' }) {
  if (!open) return null
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className={`relative bg-white rounded-xl shadow-xl w-full ${width} z-10 max-h-[90vh] overflow-y-auto`}>
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="text-lg font-semibold text-gray-800">{title}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X size={20} />
          </button>
        </div>
        <div className="px-6 py-5">{children}</div>
      </div>
    </div>
  )
}

// ── Right Drawer ──────────────────────────────────────────────────
export function Drawer({ open, onClose, title, children }) {
  return (
    <>
      {open && <div className="fixed inset-0 bg-black/30 z-40" onClick={onClose} />}
      <div className={`fixed right-0 top-0 h-full w-full max-w-md bg-white shadow-2xl z-50
                       transform transition-transform duration-300 flex flex-col
                       ${open ? 'translate-x-0' : 'translate-x-full'}`}>
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 flex-shrink-0">
          <h2 className="text-lg font-semibold text-gray-800">{title}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X size={20} />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto px-6 py-5">{children}</div>
      </div>
    </>
  )
}

// ── Confirm Modal ─────────────────────────────────────────────────
export function ConfirmModal({ open, onClose, onConfirm, message = 'Are you sure?', loading }) {
  if (!open) return null
  return (
    <Modal open={open} onClose={onClose} title="Confirm Action" width="max-w-sm">
      <p className="text-gray-600 mb-6">{message}</p>
      <div className="flex gap-3 justify-end">
        <button onClick={onClose} className="btn-outline">Cancel</button>
        <button onClick={onConfirm} disabled={loading} className="btn-danger">
          {loading ? 'Deleting…' : 'Delete'}
        </button>
      </div>
    </Modal>
  )
}

// ── Skeleton loader ───────────────────────────────────────────────
export function Skeleton({ className = '' }) {
  return <div className={`skeleton h-4 w-full ${className}`} />
}

export function CardSkeleton() {
  return (
    <div className="card space-y-3">
      <Skeleton className="h-5 w-1/3" />
      <Skeleton className="h-8 w-1/2" />
      <Skeleton className="h-4 w-2/3" />
    </div>
  )
}

// ── Empty State ───────────────────────────────────────────────────
export function EmptyState({ icon: Icon, message, action, onAction }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      {Icon && <Icon size={48} className="text-gray-300 mb-4" />}
      <p className="text-gray-500 mb-4">{message}</p>
      {action && (
        <button onClick={onAction} className="btn-primary">{action}</button>
      )}
    </div>
  )
}

// ── Stat Card ─────────────────────────────────────────────────────
export function StatCard({ label, value, sub, icon: Icon, trend, positive }) {
  return (
    <div className="card">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-gray-500 font-medium">{label}</p>
          <p className="text-2xl font-bold text-gray-800 mt-1">{value}</p>
          {sub && (
            <p className={`text-sm mt-1 font-medium ${positive === true ? 'text-green-600' : positive === false ? 'text-red-500' : 'text-gray-500'}`}>
              {sub}
            </p>
          )}
        </div>
        {Icon && (
          <div className="w-10 h-10 rounded-lg bg-navy/10 flex items-center justify-center">
            <Icon size={20} className="text-navy" />
          </div>
        )}
      </div>
    </div>
  )
}

// ── Form Field ────────────────────────────────────────────────────
export function FormField({ label, error, required, children }) {
  return (
    <div>
      {label && (
        <label className="label">
          {label}{required && <span className="text-red-500 ml-0.5">*</span>}
        </label>
      )}
      {children}
      {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
    </div>
  )
}
