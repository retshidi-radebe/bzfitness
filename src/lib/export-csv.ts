// CSV Export Utility

export function exportToCSV<T extends Record<string, any>>(
  data: T[],
  filename: string,
  columns: { key: keyof T; label: string; transform?: (value: any) => string }[]
) {
  if (data.length === 0) {
    alert('No data to export')
    return
  }

  // Create header row
  const headers = columns.map(col => col.label)

  // Create data rows
  const rows = data.map(item =>
    columns.map(col => {
      const value = item[col.key]
      if (col.transform) {
        return escapeCsvValue(col.transform(value))
      }
      return escapeCsvValue(value?.toString() ?? '')
    })
  )

  // Combine headers and rows
  const csvContent = [
    headers.join(','),
    ...rows.map(row => row.join(','))
  ].join('\n')

  // Create and download file
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
  const link = document.createElement('a')
  const url = URL.createObjectURL(blob)

  link.setAttribute('href', url)
  link.setAttribute('download', `${filename}_${new Date().toISOString().split('T')[0]}.csv`)
  link.style.visibility = 'hidden'

  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

function escapeCsvValue(value: string): string {
  // If the value contains comma, quotes, or newline, wrap in quotes and escape internal quotes
  if (value.includes(',') || value.includes('"') || value.includes('\n')) {
    return `"${value.replace(/"/g, '""')}"`
  }
  return value
}

// Pre-configured export functions for common data types
export function exportMembers(members: any[]) {
  exportToCSV(members, 'bz_fitness_members', [
    { key: 'name', label: 'Name' },
    { key: 'phone', label: 'Phone' },
    { key: 'email', label: 'Email', transform: (v) => v || '' },
    { key: 'packageType', label: 'Package', transform: (v) => {
      switch (v) {
        case 'package-1': return 'Package 1 - R50'
        case 'package-2': return 'Package 2 - R85'
        case 'package-3': return 'Package 3 - R125'
        default: return v
      }
    }},
    { key: 'status', label: 'Status' },
    { key: 'joinDate', label: 'Join Date', transform: (v) => v ? new Date(v).toLocaleDateString() : '' },
    { key: 'nextPaymentDate', label: 'Next Payment', transform: (v) => v ? new Date(v).toLocaleDateString() : '' },
  ])
}

export function exportPayments(payments: any[]) {
  exportToCSV(payments, 'bz_fitness_payments', [
    { key: 'member', label: 'Member Name', transform: (v) => v?.name || '' },
    { key: 'amount', label: 'Amount (R)', transform: (v) => v?.toFixed(2) || '0.00' },
    { key: 'package', label: 'Package', transform: (v) => {
      switch (v) {
        case 'package-1': return 'Package 1 - R50'
        case 'package-2': return 'Package 2 - R85'
        case 'package-3': return 'Package 3 - R125'
        default: return v
      }
    }},
    { key: 'status', label: 'Status' },
    { key: 'dueDate', label: 'Due Date', transform: (v) => v ? new Date(v).toLocaleDateString() : '' },
    { key: 'paidDate', label: 'Paid Date', transform: (v) => v ? new Date(v).toLocaleDateString() : '' },
  ])
}

export function exportAttendance(attendances: any[]) {
  exportToCSV(attendances, 'bz_fitness_attendance', [
    { key: 'member', label: 'Member Name', transform: (v) => v?.name || '' },
    { key: 'date', label: 'Date', transform: (v) => v ? new Date(v).toLocaleDateString() : '' },
    { key: 'dayOfWeek', label: 'Day' },
    { key: 'timeSlot', label: 'Session', transform: (v) => v === 'morning' ? '6:30 AM' : '5:00 PM' },
  ])
}

export function exportContacts(contacts: any[]) {
  exportToCSV(contacts, 'bz_fitness_contacts', [
    { key: 'name', label: 'Name' },
    { key: 'phone', label: 'Phone' },
    { key: 'email', label: 'Email', transform: (v) => v || '' },
    { key: 'package', label: 'Package Interest' },
    { key: 'message', label: 'Message' },
    { key: 'status', label: 'Status' },
    { key: 'createdAt', label: 'Submitted', transform: (v) => v ? new Date(v).toLocaleString() : '' },
  ])
}
