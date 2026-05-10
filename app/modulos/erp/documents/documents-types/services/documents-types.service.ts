import type {
  DocumentsType,
  CreateDocumentsTypeDto,
  UpdateDocumentsTypeDto
} from '~/modulos/erp/documents/documents-types/types/documents-types.types'

export const useDocumentsTypesService = () => {
  const urlBase = '/api/erp/documents/documents-types'

  const fetch = useRequestFetch()

  const create = (data: CreateDocumentsTypeDto) =>
    fetch<DocumentsType>(`${urlBase}`, {
      method: 'POST',
      body: data
    })

  const findAll = () => fetch<DocumentsType[]>(`${urlBase}`)

  const findOne = (id: string) => fetch<DocumentsType>(`${urlBase}/${id}`)

  const update = (id: string, data: UpdateDocumentsTypeDto) =>
    fetch<DocumentsType>(`${urlBase}/${id}`, {
      method: 'PATCH',
      body: data
    })

  return {
    create,
    findAll,
    findOne,
    update
  }
}
