// Stops dentro de una ruta dinámica
export interface CorridorStop {
  location_id: string
  stop_order: number
}

// Ruta dinámica (corredor inline)
export interface Route {
  origin_location_id: string
  destination_location_id: string
  stops: CorridorStop[]
}

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
  }
}

export interface Trip {
  id: string
  company_id: string
  reference_number?: string | null
  vehicle_combination_id?: string | null
  origin_location_id?: string | null
  destination_location_id?: string | null
  corridor_id?: string | null // ✅ NUEVO
  route?: Route | null // ✅ NUEVO corredor dinámico
  departure_time?: string
  arrival_time?: string
  status: string
  kilometers?: number | null
  business_party_id?: string | null // ✅ NUEVO
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
  corridor_id?: string // ✅ NUEVO
  route?: Route // ✅ NUEVO corredor dinámico
  departure_time?: string
  arrival_time?: string
  status: string
  kilometers?: number
  business_party_id?: string // ✅ NUEVO
}

export interface UpdateTripInput extends Partial<CreateTripInput> {}

export interface CreateTripRateInput {
  rate_id: string
  value: number
}

export interface UpdateTripRateInput {
  value: number
}
