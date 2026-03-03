export type FieldType =
  | 'text'
  | 'email'
  | 'number'
  | 'date'
  | 'checkbox'
  | 'select'
  | 'textarea'
  | 'hidden'

export interface SelectOption {
  label: string
  value: string | number | boolean
}

export interface BaseField {
  name: string
  label?: string
  type: FieldType
  placeholder?: string
  required?: boolean
  options?: SelectOption[] // solo para select
}
