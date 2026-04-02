import { apiProxy } from '~~/server/utils/api-proxy'

export default defineEventHandler(async (event) => {
  const query = getQuery(event)

  const documentTypeId = query.document_type_id

  return apiProxy(event, `/documents?document_type_id=${documentTypeId}`)
})
