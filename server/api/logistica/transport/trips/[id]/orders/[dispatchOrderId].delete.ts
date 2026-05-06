import { apiProxy } from '~~/server/utils/api-proxy'

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')
  const dispatchOrderId = getRouterParam(event, 'dispatchOrderId')

  return apiProxy(event, `/trips/${id}/orders/${dispatchOrderId}`, {
    method: 'DELETE'
  })
})
