function escapeCsvField(value) {
  const str = value === null || value === undefined ? 'N/A' : String(value)
  if (str.includes(',') || str.includes('"') || str.includes('\n')) {
    return `"${str.replace(/"/g, '""')}"`
  }
  return str
}

export function buildCsv(columns, rows) {
  const header = columns.map((col) => escapeCsvField(col.label)).join(',')
  const lines = rows.map((row) =>
    columns.map((col) => escapeCsvField(row[col.key])).join(','),
  )
  return [header, ...lines].join('\r\n')
}

export function downloadCsv(filename, csvContent) {
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}
