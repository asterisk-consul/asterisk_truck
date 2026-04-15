import { apiProxy } from '~~/server/utils/api-proxy'

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')

  const query = getQuery(event)
  const params = new URLSearchParams(query as any).toString()
  const qs = params ? `?${params}` : ''

  return apiProxy(event, `/purchases/products/${id}${qs}`)
})
