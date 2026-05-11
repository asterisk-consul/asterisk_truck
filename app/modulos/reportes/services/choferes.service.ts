export const getReporteChoferes = (params?: {
  fechaDesde?: string
  fechaHasta?: string
  choferId?: string
  mes?: string
  cliente?: string
  numeroViaje?: string
  corredor?: string
  page?: number
  limit?: number
}) => {
  return $fetch('/api/logistica/reports/choferes', {
    query: params
  })
}
