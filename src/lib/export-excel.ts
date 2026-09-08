// Excel export.
//
// A plain comma CSV opens as a single unsplit column in Excel whenever the
// machine's regional list separator is not a comma, which is why the CSV
// exports looked broken. Writing a real .xlsx sidesteps the separator entirely
// and lets amounts stay numbers and dates stay dates, so totals and sorting
// work in the spreadsheet instead of arriving as text.

export interface ExcelColumn<T> {
  header: string
  width?: number
  /** Return a real number/Date where possible - not a pre-formatted string */
  value: (row: T) => string | number | Date | null
  numFmt?: string
  /** Sum this column into a bold totals row at the bottom */
  total?: boolean
}

export async function exportToExcel<T>(
  rows: T[],
  filename: string,
  sheetName: string,
  columns: ExcelColumn<T>[]
) {
  if (rows.length === 0) {
    alert('No data to export')
    return
  }

  // Loaded on demand so the library stays out of the initial page bundle
  const ExcelJS = (await import('exceljs')).default

  const workbook = new ExcelJS.Workbook()
  workbook.creator = 'BZ Fitness and Wellness'
  workbook.created = new Date()

  const sheet = workbook.addWorksheet(sheetName)
  sheet.columns = columns.map((c) => ({
    header: c.header,
    key: c.header,
    width: c.width ?? 18,
  }))

  const headerRow = sheet.getRow(1)
  headerRow.font = { bold: true }
  headerRow.alignment = { vertical: 'middle' }
  headerRow.eachCell((cell) => {
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFEFEFEF' } }
    cell.border = { bottom: { style: 'thin', color: { argb: 'FFBFBFBF' } } }
  })

  rows.forEach((row) => {
    sheet.addRow(columns.map((c) => c.value(row)))
  })

  columns.forEach((c, i) => {
    if (c.numFmt) sheet.getColumn(i + 1).numFmt = c.numFmt
  })

  // Totals row, using a real formula so it stays live if rows are edited
  const totalCols = columns
    .map((c, i) => ({ c, i }))
    .filter(({ c }) => c.total)

  if (totalCols.length > 0) {
    const firstDataRow = 2
    const lastDataRow = rows.length + 1
    const totalRow = sheet.addRow([])
    totalRow.getCell(1).value = 'Total'
    totalRow.font = { bold: true }

    totalCols.forEach(({ c, i }) => {
      const letter = sheet.getColumn(i + 1).letter
      const cell = totalRow.getCell(i + 1)
      cell.value = { formula: `SUM(${letter}${firstDataRow}:${letter}${lastDataRow})` }
      if (c.numFmt) cell.numFmt = c.numFmt
    })

    totalRow.eachCell((cell) => {
      cell.border = { top: { style: 'thin', color: { argb: 'FF999999' } } }
    })
  }

  // Freeze the header and add filter dropdowns
  sheet.views = [{ state: 'frozen', ySplit: 1 }]
  sheet.autoFilter = {
    from: { row: 1, column: 1 },
    to: { row: 1, column: columns.length },
  }

  const buffer = await workbook.xlsx.writeBuffer()
  const blob = new Blob([buffer], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  })

  const link = document.createElement('a')
  const url = URL.createObjectURL(blob)
  link.setAttribute('href', url)
  link.setAttribute('download', `${filename}_${new Date().toISOString().split('T')[0]}.xlsx`)
  link.style.visibility = 'hidden'
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

const packageLabel = (v: string) => {
  switch (v) {
    case 'package-1': return 'Package 1'
    case 'package-2': return 'Package 2'
    case 'package-3': return 'Package 3'
    default: return v
  }
}

const asDate = (v: any) => (v ? new Date(v) : null)

const DATE_FMT = 'dd/mm/yyyy'
const MONEY_FMT = '#,##0.00'

export function exportPayments(payments: any[], periodLabel?: string) {
  const filename = periodLabel ? `bz_fitness_payments_${periodLabel}` : 'bz_fitness_payments'
  exportToExcel(payments, filename, 'Payments', [
    { header: 'Member Name', width: 26, value: (p) => p.member?.name || '' },
    { header: 'Amount (R)', width: 14, value: (p) => p.amount ?? 0, numFmt: MONEY_FMT, total: true },
    { header: 'Package', width: 14, value: (p) => packageLabel(p.package) },
    { header: 'Status', width: 12, value: (p) => p.status },
    { header: 'Due Date', width: 14, value: (p) => asDate(p.dueDate), numFmt: DATE_FMT },
    { header: 'Paid Date', width: 14, value: (p) => asDate(p.paidDate), numFmt: DATE_FMT },
  ])
}

export function exportMembers(members: any[]) {
  exportToExcel(members, 'bz_fitness_members', 'Members', [
    { header: 'Name', width: 26, value: (m) => m.name || '' },
    { header: 'Phone', width: 16, value: (m) => m.phone || '' },
    { header: 'Email', width: 26, value: (m) => m.email || '' },
    { header: 'Package', width: 14, value: (m) => packageLabel(m.packageType) },
    { header: 'Status', width: 12, value: (m) => m.status || '' },
    { header: 'Join Date', width: 14, value: (m) => asDate(m.joinDate), numFmt: DATE_FMT },
    { header: 'Next Payment', width: 15, value: (m) => asDate(m.nextPaymentDate), numFmt: DATE_FMT },
  ])
}

export function exportAttendance(attendances: any[]) {
  exportToExcel(attendances, 'bz_fitness_attendance', 'Attendance', [
    { header: 'Member Name', width: 26, value: (a) => a.member?.name || '' },
    { header: 'Date', width: 14, value: (a) => asDate(a.date), numFmt: DATE_FMT },
    { header: 'Day', width: 14, value: (a) => a.dayOfWeek || '' },
    { header: 'Session', width: 12, value: (a) => (a.timeSlot === 'morning' ? '6:30 AM' : '5:00 PM') },
  ])
}

export function exportContacts(contacts: any[]) {
  exportToExcel(contacts, 'bz_fitness_contacts', 'Enquiries', [
    { header: 'Name', width: 24, value: (c) => c.name || '' },
    { header: 'Phone', width: 16, value: (c) => c.phone || '' },
    { header: 'Email', width: 26, value: (c) => c.email || '' },
    { header: 'Package Interest', width: 18, value: (c) => c.package || '' },
    { header: 'Message', width: 60, value: (c) => c.message || '' },
    { header: 'Status', width: 12, value: (c) => c.status || '' },
    { header: 'Submitted', width: 18, value: (c) => asDate(c.createdAt), numFmt: 'dd/mm/yyyy hh:mm' },
  ])
}
