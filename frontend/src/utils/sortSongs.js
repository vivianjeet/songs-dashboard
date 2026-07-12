export function compareSongs(a, b, column, direction) {
  const aVal = a[column]
  const bVal = b[column]

  let result
  if (typeof aVal === 'string') {
    result = aVal.localeCompare(bVal)
  } else {
    result = aVal - bVal
  }

  return direction === 'desc' ? -result : result
}