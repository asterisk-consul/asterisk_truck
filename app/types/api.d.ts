// types/api.d.ts
declare global {
  interface ApiResponse<T = any> {
    status: number
    data: ApiRegistroCabList | T
  }
  interface ApiRegsitroCab {
    id: number
    status: number
  }
  export interface ApiRegistroCabList {
    cols: string[]
    rows: Row[]
    total: number
  }

  export interface Row {
    id: number
    descrip: string
    fecha: string
    fechacompromiso: string
    fechavencimiento: any
    creationdate: string
    clientid: number
    clientname: string
    totalprecio: number
    totalimpuestos: number
    referenciatexto: string
    vendedor: any
    vendedorid: any
    parteinteresadatipoid: any
    procesoid: any
    puestotrabajoid: any
    auditor: any
    auditorid: any
    ejecutor: number
    ejecutorid: string
    total: number
  }
  export type TypeApiDeposito = ApiDeposito[]

  export interface ApiDeposito {
    id: number
    descrip: string
    activo: boolean
    parentid?: number
    categid: number
    categoria: Categoria
    perfilid: any
    parentDeposito?: ParentDeposito
  }

  export interface Categoria {
    id: number
    name: string
    grupo: string
    parentid: any
    orden: any
    procparentid: any
    macroparentid: any
    notas: any
    valor: any
  }

  export interface ParentDeposito {
    id: number
    descrip: string
    activo: boolean
    parentid?: number
    categid: number
    perfilid: any
  }
}

export {}
