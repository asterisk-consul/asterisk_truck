// src/composables/useFileParser.ts
import * as XLSX from 'xlsx'
import Papa from 'papaparse'

type FileType = 'excel' | 'csv' | 'json' | 'unknown'

interface ParseOptions {
  header?: boolean
}

export function useFileParser() {
  const detectFileType = (file: File): FileType => {
    const ext = file.name.split('.').pop()?.toLowerCase() || ''
    if (['xls', 'xlsx'].includes(ext)) return 'excel'
    if (ext === 'csv') return 'csv'
    if (ext === 'json') return 'json'
    return 'unknown'
  }

  const parseFile = async (file: File, options: ParseOptions = {}): Promise<any[]> => {
    const type = detectFileType(file)

    switch (type) {
      case 'excel':
        return await parseExcel(file)
      case 'csv':
        return await parseCSV(file, options)
      case 'json':
        return await parseJSON(file)
      default:
        throw new Error(`Tipo de archivo no soportado: ${file.name}`)
    }
  }

const parseExcel = (file: File): Promise<any[]> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = (e: ProgressEvent<FileReader>) => {
      try {
        if (!e.target?.result) {
          reject(new Error('No se pudo leer el archivo Excel'))
          return
        }

        const data = new Uint8Array(e.target.result as ArrayBuffer)
        const workbook = XLSX.read(data, { type: 'array' })

        const sheetName = workbook.SheetNames[0]
        if (!sheetName) {
          reject(new Error('El archivo Excel no contiene hojas'))
          return
        }

        const firstSheet = workbook.Sheets[sheetName]
        if (!firstSheet) {
          reject(new Error('No se pudo acceder a la primera hoja del Excel'))
          return
        }

        const json = XLSX.utils.sheet_to_json(firstSheet, {
          header: 1,
          defval: ''
        })

        resolve(json)
      } catch (err) {
        reject(err)
      }
    }

    reader.onerror = (err) => reject(err)
    reader.readAsArrayBuffer(file)
  })
}


  const parseCSV = (file: File, options: ParseOptions = {}): Promise<any[]> => {
    return new Promise((resolve, reject) => {
      Papa.parse(file, {
        header: options.header ?? false,
        skipEmptyLines: true,
        encoding: 'UTF-8',
        dynamicTyping: false,
        complete: (results) => {
          console.log('📊 CSV parseado:', {
            filas: results.data.length,
            errores: results.errors
          })
          resolve(results.data as any[])
        },
        error: (err) => reject(err)
      })
    })
  }

  const parseJSON = (file: File): Promise<any> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = (e: ProgressEvent<FileReader>) => {
        try {
          if (!e.target?.result) {
            reject(new Error('No se pudo leer el archivo JSON'))
            return
          }
          const json = JSON.parse(e.target.result as string)
          resolve(json)
        } catch (err) {
          reject(err)
        }
      }
      reader.onerror = (err) => reject(err)
      reader.readAsText(file)
    })
  }

  return {
    detectFileType,
    parseFile
  }
}
