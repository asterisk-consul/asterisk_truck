/**
 * Modelo principal de Driver basado en el schema de Prisma
 */
export interface Driver {
  id: string
  companyId: string
  first_name: string
  last_name: string
  document: string | null
  phone: string | null
  licenseNumber: string | null
  license_expiration: Date | null
  active: boolean
  createdAt: string

  // Relaciones (opcionales - solo si se incluyen en la consulta)
  company?: {
    id: string
    name: string
    // otras propiedades mínimas de company
  }
  trips?: Array<{
    id: string
    // propiedades mínimas de trip
  }>
}

// ============================================
// DTOS E INPUTS
// ============================================

/**
 * DTO para crear un driver (usado con class-validator)
 * Las fechas vienen como strings ISO por validación
 */
export interface CreateDriverDto {
  companyId: string
  firstName: string
  lastName: string
  document?: string
  phone?: string
  licenseNumber?: string
  licenseExpiration?: string // ISO date string (YYYY-MM-DD)
}

/**
 * Input para crear driver (versión más flexible)
 * Acepta tanto Date como string para fechas
 */
export interface CreateDriverInput {
  companyId: string
  firstName: string
  lastName: string
  document?: string | null
  phone?: string | null
  licenseNumber?: string | null
  licenseExpiration?: Date | string | null
}

/**
 * Input para actualizar driver (todos los campos opcionales)
 */
export type UpdateDriverInput = Partial<CreateDriverInput>
