// types/csv.d.ts
declare global {
  interface CSVRow extends Array<string | number | null | undefined> {}

  interface PairDetected {
    fechaRowIndex: number
    kmRowIndex: number
    camion: string
    patente: string
  }

  interface TransformedRow {
    id: number
    descripcion: string
    fecha: string
    kilometros: string
    patente?: string
  }

  interface SaveResult {
    exitosos: TransformedRow[]
    fallidos: (TransformedRow & { error: string })[]
    total: number
  }
}

export {}
