export interface TripRate {
  id: string
  trip_id: string
  rate_id: string
  value: number
  created_at: string
  updated_at: string
  transfer_rates: {
    name: string
    rate_type: string
  } // opcional, detalles de la tarifa de transferencia
}

export interface Trip {
  id: string
  company_id: string
  reference_number?: string | null
  vehicle_combination_id?: string | null
  origin_location_id?: string | null
  destination_location_id?: string | null
  departure_time?: string
  arrival_time?: string
  status: string
  kilometers?: number | null
  created_at: string
  updated_at: string
  vehicle_combination?: VehicleCombination
  trip_rates?: TripRate[]
}

export interface VehicleCombination {
  id: string
  unit_number?: string | null
}

export interface CreateTripInput {
  company_id: string
  reference_number?: string
  vehicle_combination_id?: string
  origin_location_id?: string
  destination_location_id?: string
  departure_time?: string
  arrival_time?: string
  status: string
  kilometers?: number
}

export interface UpdateTripInput extends Partial<CreateTripInput> {}

export interface CreateTripRateInput {
  rate_id: string
  value: number
}

export interface UpdateTripRateInput {
  value: number
}
