// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  modules: [
    '@nuxt/ui',
    '@vueuse/nuxt',
    ['@pinia/nuxt', { autoImports: ['defineStore', 'storeToRefs'] }] // 👈 así se pasan las opciones
  ],
  devServer: {
    host: '0.0.0.0', // <- debe estar así
    port: 3000
  },
  experimental: {
    watcher: 'chokidar',
    componentIslands: false
  },
  typescript: {
    typeCheck: false // Desactivar temporalmente durante build
  },
  ssr: false,
  imports: {
    dirs: [
      'composables',
      'utils/**', // Incluye subcarpetas
      'helpers', // Carpeta adicional
      'stores' // Si tienes helpers en stores
    ]
  },
  devtools: {
    enabled: true
  },
  app: {
    baseURL: '/', // Ajusta si está en subdirectorio
    buildAssetsDir: 'assets'
  },

  css: ['~/assets/css/main.css'],
  runtimeConfig: {
    apiBase: process.env.API_BASE, // solo server
    public: {
      apiBase: process.env.PUBLIC_API_BASE // visible en cliente
    }
  },
  alias: {
    '@types': './types'
  },
  routeRules: {
    '/api/**': {
      cors: true
    }
  },

  compatibilityDate: '2024-07-11',

  // ← Esto lo hace SPA
  nitro: {
    preset: 'static' // Para generar archivos estáticos
  }
})
