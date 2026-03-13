export interface BusinessParty {
  id: string
  company_id: string
  type: 'client' | 'supplier'
  name: string
  tax_id?: string
  phone?: string
  email?: string
  active?: boolean
  created_at?: string
  updated_at?: string
}

export type CreateBusinessPartyInput = Omit<
  BusinessParty,
  'id' | 'created_at' | 'updated_at'
>

export type UpdateBusinessPartyInput = Partial<CreateBusinessPartyInput>
