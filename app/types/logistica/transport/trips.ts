// types/trip.ts

export type TripStatus = 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED'

export interface Trip {
  id: string
  companyId: string

  vehicleId?: string | null
  driverId?: string | null

  originWarehouseId?: string | null
  destinationWarehouseId?: string | null

  originLocationId?: string | null
  destinationLocationId?: string | null

  notes?: string | null

  status: TripStatus

  createdAt: string
  startedAt?: string | null
  completedAt?: string | null

  cargo?: TripCargo[]
}

export interface TripCargo {
  id: string
  tripId: string
  palletId?: string | null
  deliveryNoteId?: string | null
}

export interface CreateTripInput {
  companyId: string
  vehicleId?: string
  driverId?: string
  originWarehouseId?: string
  destinationWarehouseId?: string
  originLocationId?: string
  destinationLocationId?: string
  notes?: string
}

export interface AddTripCargoInput {
  tripId: string
  palletId?: string
  deliveryNoteId?: string
}
