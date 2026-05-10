import { apiProxy } from '~~/server/utils/api-proxy'

export default defineEventHandler(async (event) => {
  const { id } = getRouterParams(event)
  return apiProxy(event, `/documents/purchases-documents/${id}`, {
    method: 'GET'
  })
})
