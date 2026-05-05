import { apiProxy } from '~~/server/utils/api-proxy'

export default defineEventHandler(async (event) => {
  const { table } = event.context.params!
  const body = await readBody(event)

  return apiProxy(event, `/trash/bulk/${table}`, {
    method: 'DELETE',
    body
  })
})
