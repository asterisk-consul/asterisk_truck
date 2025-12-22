export type TipoMovimiento = 'carga' | 'descarga' | 'ajuste'
export type AjusteSigno = 'plus' | 'minus'

export interface CombustibleForm {
  tipoMovimiento: TipoMovimiento
  fecha: string

  camionId?: string
  choferId?: string
  cargadorId?: string

  litros: number | null
  km?: number | null
  horas?: number | null

  estacion?: string
  ajusteSigno?: AjusteSigno
}
