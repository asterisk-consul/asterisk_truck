import { apiProxy } from '~~/server/utils/api-proxy'

export default defineEventHandler(async (event) => {
  const query = getQuery(event) // lee ?companyId=xxx de la URL

  return await apiProxy(event, '/transport/drivers', {
    query
  })
})
