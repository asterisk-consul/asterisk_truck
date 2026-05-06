import { apiProxy } from '~~/server/utils/api-proxy'

export default defineEventHandler(async (event) => {
  const { table, id } = event.context.params!

  return apiProxy(event, `/trash/${table}/${id}`, {
    method: 'DELETE'
  })
})
