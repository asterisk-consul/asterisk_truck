import { apiProxy } from '~~/server/utils/api-proxy'

export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const params = new URLSearchParams()

  if (query.startDate) params.set('startDate', String(query.startDate))
  if (query.endDate) params.set('endDate', String(query.endDate))
  if (query.supplierId) params.set('supplierId', String(query.supplierId))

  const qs = params.toString() ? `?${params.toString()}` : ''
  return apiProxy(event, `/purchases/summary${qs}`)
})
