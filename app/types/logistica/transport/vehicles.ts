export interface Vehicle {
  id: string
  companyId: string

  type: string
  plate: string

  brand?: string | null
  model?: string | null
  year?: number | null

  maxWeight?: number | null
  maxVolume?: number | null

  refrigeration?: boolean | null

  active: boolean
  createdAt: string // ← IMPORTANTE: viene como string desde backend
}

export interface CreateVehicleInput {
  companyId: string
  type: string
  plate: string
  brand?: string
  model?: string
  year?: number
  maxWeight?: number
  maxVolume?: number
  refrigeration?: boolean
}
