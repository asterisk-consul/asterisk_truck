export type ExpirationStatus = 'expired' | 'warning' | 'valid' | 'none'

export function daysUntil(dateString?: string | null): number | null {
  if (!dateString) return null

  const today = new Date()
  const expiration = new Date(dateString)

  today.setHours(0, 0, 0, 0)
  expiration.setHours(0, 0, 0, 0)

  const diffMs = expiration.getTime() - today.getTime()
  return Math.floor(diffMs / (1000 * 60 * 60 * 24))
}

export function getExpirationStatus(
  dateString?: string | null,
  warningDays = 30
): ExpirationStatus {
  const days = daysUntil(dateString)

  if (days === null) return 'none'
  if (days < 0) return 'expired'
  if (days <= warningDays) return 'warning'
  return 'valid'
}
