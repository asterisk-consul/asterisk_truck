import { postData } from '@/composables/apiService'

export const FileService = {
  async apiPostFile(file: File) {
    // Crear FormData
    const formData = new FormData()
    formData.append('file', file)

    console.log('Enviando archivo:', {
      name: file.name,
      size: file.size,
      type: file.type
    })

    // Debug: ver qué hay en FormData
    for (let pair of formData.entries()) {
      console.log('FormData entry:', pair[0], pair[1])
    }

    const data = await postData('/data-import/compras', formData)
    return data
  }
}
