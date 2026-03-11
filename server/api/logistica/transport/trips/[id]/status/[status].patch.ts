import { apiProxy } from '~~/server/utils/api-proxy'

export default defineEventHandler(async (event) => {
  const { id, status } = event.context.params!

  return apiProxy(event, `/trips/${id}/status/${status}`, { method: 'PATCH' })
})
