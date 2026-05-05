export interface TrashItem<T = any> {
  id: string
  table: string
  deletedAt: string
  deletedBy?: string
  data?: T
}

export const TRASH_TABLES = [
  'users',
  'business_parties',
  'cargo_transfers',
  'companies',
  'delivery_notes',
  'drivers',
  'entity_photos',
  'files',
  'locations',
  'pallets',
  'party_locations',
  'party_contacts',
  'picking_orders',
  'products',
  'trips',
  'trip_stops',
  'trip_stop_orders',
  'corridors',
  'corridor_stops',
  'vehicles',
  'vehicle_combinations',
  'warehouses',
  'document_sequences',
  'transport_document_types',
  'documents_vehicle',
  'documents_driver',
  'transfer_rates',
  'dispatch_rates',
  'document_item_taxes',
  'document_items',
  'document_taxes',
  'document_types',
  'documents',
  'product_taxes',
  'taxes'
] as const

export type TrashTable = (typeof TRASH_TABLES)[number]
