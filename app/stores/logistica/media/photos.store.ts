import { defineStore } from 'pinia'
import type { Photo, CreatePhotoDto } from '@/types/logistica/photos/photos'
import { usePhotosService } from '@/services/logistica/media/photos.service'

export const usePhotosStore = defineStore('photos', {
  state: () => ({
    photos: [] as Photo[],
    loading: false
  }),

  actions: {
    async fetchByEntity(entityType: string, entityId: string) {
      const service = usePhotosService()
      this.loading = true
      try {
        this.photos = await service.findByEntity(entityType, entityId)
      } finally {
        this.loading = false
      }
    },

    async create(payload: CreatePhotoDto) {
      const service = usePhotosService()
      const newPhoto = await service.create(payload)

      this.photos.push(newPhoto)
      return newPhoto
    },

    clear() {
      this.photos = []
    }
  }
})
