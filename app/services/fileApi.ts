// services/fileApi.ts
import { postData } from '@/composables/apiService'

const buildForm = (file: File) => {
  const formData = new FormData()
  formData.append('file', file)
  return formData
}

export const FileService = {
  async importCompras(file: File) {
    return await postData('/data-import/compras', buildForm(file))
  },
  async importNotaCredito(file: File) {
    return await postData('/data-import/nota-credito', buildForm(file))
  },
  async importNotaDebito(file: File) {
    return await postData('/data-import/nota-debito', buildForm(file))
  }
}
