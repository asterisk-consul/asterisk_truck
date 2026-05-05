import type { TrashItem, TrashTable } from '~/modulos/trash/types/trash.types'

export const useTrashService = () => {
  const base = '/api/trash'

  const getAll = (params?: { days?: number; table?: TrashTable }) =>
    $fetch<TrashItem[]>(base, { params })

  const softDelete = (table: string, id: string) =>
    $fetch(`${base}/${table}/${id}`, { method: 'DELETE' })

  const restore = (table: string, id: string) =>
    $fetch(`${base}/${table}/${id}/restore`, { method: 'PATCH' })

  const softDeleteMany = (table: string, ids: string[]) =>
    $fetch(`${base}/bulk/${table}`, {
      method: 'DELETE',
      body: { ids }
    })

  const restoreMany = (table: string, ids: string[]) =>
    $fetch(`${base}/bulk/${table}/restore`, {
      method: 'PATCH',
      body: { ids }
    })

  const hardDeleteMany = (table: string, ids: string[]) =>
    $fetch(`${base}/hard/${table}`, {
      method: 'DELETE',
      body: { ids }
    })

  return {
    getAll,
    softDelete,
    restore,
    softDeleteMany,
    restoreMany,
    hardDeleteMany
  }
}
