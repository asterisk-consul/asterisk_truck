<script setup lang="ts">
const colorMode = useColorMode()
import type { ToasterProps } from '#ui/types'
const toaster: ToasterProps = { position: 'bottom-center', duration: 3000 }
const color = computed(() => (colorMode.value === 'dark' ? '#1b1718' : 'white'))

useHead({
  meta: [
    { charset: 'utf-8' },
    { name: 'viewport', content: 'width=device-width, initial-scale=1' },
    { key: 'theme-color', name: 'theme-color', content: color }
  ],
  link: [{ rel: 'icon', href: '/donandres.ico' }],
  htmlAttrs: {
    lang: 'es'
  }
})

const title = 'Asterisk Suite'
const description =
  'Un suite de herramientas para la gestión de proyectos de Asterisk'

useSeoMeta({
  title,
  description,
  ogTitle: title,
  ogDescription: description,
  ogImage: 'https://ui.nuxt.com/assets/templates/nuxt/dashboard-light.png',
  twitterImage: 'https://ui.nuxt.com/assets/templates/nuxt/dashboard-light.png',
  twitterCard: 'summary_large_image'
})
</script>

<template>
  <UApp :toaster="toaster">
    <NuxtLoadingIndicator />

    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
  </UApp>
</template>
