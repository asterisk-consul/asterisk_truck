import { apiProxy } from '~~/server/utils/api-proxy'

export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const params = new URLSearchParams(query as any).toString()
  const qs = params ? `?${params}` : ''

  return apiProxy(event, `/taxes${qs}`)
})
