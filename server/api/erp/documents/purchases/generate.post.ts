import { apiProxy } from '~~/server/utils/api-proxy'

export default defineEventHandler(async (event) => {
  return apiProxy(
    event,
    `/documents/purchases-documents/generate-from-all-completed-trips`,
    {
      method: 'POST'
    }
  )
})
