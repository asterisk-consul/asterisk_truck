import { apiProxy } from '~~/server/utils/api-proxy'

export default defineEventHandler(async (event) => {
  const query = getQuery(event)

  const searchParams = new URLSearchParams()

  if (query.days) searchParams.append('days', String(query.days))
  if (query.table) searchParams.append('table', String(query.table))

  const qs = searchParams.toString()
  const url = qs ? `/trash?${qs}` : '/trash'

  return apiProxy(event, url, { method: 'GET' })
})
