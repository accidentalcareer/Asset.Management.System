// Format number as Indian currency
export const formatCurrency = (amount) => {
  if (amount === null || amount === undefined) return '₹0'
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount)
}

// Format as short: 1.2L, 3.4Cr
export const formatShort = (amount) => {
  const n = Number(amount)
  if (n >= 10_000_000) return `₹${(n / 10_000_000).toFixed(2)} Cr`
  if (n >= 100_000)    return `₹${(n / 100_000).toFixed(2)} L`
  if (n >= 1_000)      return `₹${(n / 1_000).toFixed(1)} K`
  return `₹${n.toFixed(0)}`
}

export const formatDate = (dateStr) => {
  if (!dateStr) return ''
  return new Date(dateStr).toLocaleDateString('en-IN', {
    day: '2-digit', month: 'short', year: 'numeric'
  })
}

export const formatPct = (val) => {
  if (val === null || val === undefined) return '0%'
  const n = Number(val)
  return `${n >= 0 ? '+' : ''}${n.toFixed(2)}%`
}

// Download blob as file
export const downloadBlob = (blob, filename) => {
  const url = window.URL.createObjectURL(blob)
  const a   = document.createElement('a')
  a.href    = url
  a.download = filename
  a.click()
  window.URL.revokeObjectURL(url)
}

export const assetTypeLabel = (type) => {
  const map = {
    MUTUAL_FUND:   'Mutual Fund',
    SIP:           'SIP',
    FIXED_DEPOSIT: 'Fixed Deposit',
    SAVINGS:       'Savings',
    OTHER:         'Other',
  }
  return map[type] || type
}

export const assetTypeColor = (type) => {
  const map = {
    MUTUAL_FUND:   'bg-blue-100 text-blue-700',
    SIP:           'bg-purple-100 text-purple-700',
    FIXED_DEPOSIT: 'bg-green-100 text-green-700',
    SAVINGS:       'bg-amber-100 text-amber-700',
    OTHER:         'bg-gray-100 text-gray-700',
  }
  return map[type] || 'bg-gray-100 text-gray-700'
}
