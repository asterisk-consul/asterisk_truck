import type {
  CreatePickingInput,
  TransferPalletInput,
  PickingResponse
} from '~/types/logistica/warehouses/picking'

export const usePickingService = () => {
  const create = (body: CreatePickingInput) =>
    $fetch<PickingResponse>('/api/logistica/picking', {
      method: 'POST',
      body
    })

  const transfer = (body: TransferPalletInput) =>
    $fetch<void>('/api/logistica/picking/transfer', {
      method: 'PATCH',
      body
    })

  return {
    create,
    transfer
  }
}
