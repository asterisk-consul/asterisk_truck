// src/composables/useCombustibleImporter.ts

export interface RegistroCombustible {
  fecha: string
  chofer: string
  tipo: 'CARGA' | 'DESCARGA'
  patente: string
  litros: number
  kmHoras: number
  usuario: string

  _key: string
  _rowIndex: number
}

interface ImportResult {
  valid: RegistroCombustible[]
  duplicated: RegistroCombustible[]
  invalid: RegistroCombustible[]
  summary: {
    total: number
    valid: number
    duplicated: number
    invalid: number
  }
}

export function useCombustibleImporter() {
  /* =========================
   * Normalización
   * ========================= */

  const normalizeText = (value: any) =>
    String(value || '')
      .trim()
      .toUpperCase()

  const normalizeDate = (value: any) => String(value || '').trim()

  const normalizeNumber = (value: any, decimals = 2) => {
    const n = Number(String(value || '0').replace(',', '.'))
    return Number.isFinite(n) ? n.toFixed(decimals) : '0.00'
  }

  /* =========================
   * Key compuesta
   * ========================= */

  const buildKey = (
    fecha: string,
    chofer: string,
    patente: string,
    litros: string
  ) => `${fecha}|${chofer}|${patente}|${litros}`

  /* =========================
   * Procesar filas
   * ========================= */

  const processRows = (
    rows: any[][],
    existingKeys: Set<string> = new Set()
  ): ImportResult => {
    const valid: RegistroCombustible[] = []
    const duplicated: RegistroCombustible[] = []
    const invalid: RegistroCombustible[] = []

    const seen = new Set<string>()

    rows.forEach((row, index) => {
      // Saltear header
      if (index === 0 && typeof row[0] === 'string') return

      const fecha = normalizeDate(row[0])
      const chofer = normalizeText(row[1])
      const tipo = normalizeText(row[2]) as 'CARGA' | 'DESCARGA'
      const patente = normalizeText(row[3])

      const litrosNormalized = normalizeNumber(row[4])
      const litros = Number(litrosNormalized)

      const kmHoras = Number(row[5] || 0)
      const usuario = normalizeText(row[6])

      /* =========================
       * Validaciones
       * ========================= */

      if (
        !fecha ||
        !chofer ||
        !patente ||
        !['CARGA', 'DESCARGA'].includes(tipo) ||
        litros <= 0
      ) {
        invalid.push({
          fecha,
          chofer,
          tipo,
          patente,
          litros,
          kmHoras,
          usuario,
          _key: '',
          _rowIndex: index + 1
        })
        return
      }

      const key = buildKey(fecha, chofer, patente, litrosNormalized)

      /* =========================
       * Duplicados
       * ========================= */

      if (seen.has(key) || existingKeys.has(key)) {
        duplicated.push({
          fecha,
          chofer,
          tipo,
          patente,
          litros,
          kmHoras,
          usuario,
          _key: key,
          _rowIndex: index + 1
        })
        return
      }

      seen.add(key)

      /* =========================
       * Válidos
       * ========================= */

      valid.push({
        fecha,
        chofer,
        tipo,
        patente,
        litros,
        kmHoras,
        usuario,
        _key: key,
        _rowIndex: index + 1
      })
    })

    return {
      valid,
      duplicated,
      invalid,
      summary: {
        total: rows.length,
        valid: valid.length,
        duplicated: duplicated.length,
        invalid: invalid.length
      }
    }
  }

  return {
    processRows
  }
}
