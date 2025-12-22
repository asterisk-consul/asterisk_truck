<script setup lang="ts">
import { ref, computed } from 'vue'

const totalLitros = 5000
const litrosActuales = ref(3500) // Cambiá dinámicamente

const porcentaje = computed(() => (litrosActuales.value / totalLitros) * 100)
</script>

<template>
  <div class="w-32 h-64 relative">
    <svg viewBox="0 0 100 200" class="w-full h-full">
      <!-- Contorno del tanque -->
      <rect
        x="10"
        y="10"
        width="80"
        height="180"
        rx="12"
        ry="12"
        fill="none"
        stroke="#555"
        stroke-width="4"
      />

      <!-- Clip del líquido con bordes redondeados -->
      <clipPath id="liquidClip">
        <rect
          x="10"
          :y="10 + 180 * (1 - porcentaje / 100)"
          width="80"
          :height="180 * (porcentaje / 100)"
          rx="12"
          ry="12"
        />
      </clipPath>

      <!-- Líquido estático con curva superior -->
      <g clip-path="url(#liquidClip)">
        <path
          :d="`
            M10 ${200 - 180 * (porcentaje / 100)}
            Q50 ${190 - 180 * (porcentaje / 100)} 90 ${200 - 180 * (porcentaje / 100)}
            V200 H10 Z
          `"
          fill="url(#gradient)"
        />
      </g>

      <!-- Gradiente del líquido -->
      <defs>
        <linearGradient id="gradient" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#3b82f6" />
          <stop offset="100%" stop-color="#2563eb" />
        </linearGradient>
      </defs>

      <!-- Texto litros -->
      <text
        x="50"
        y="100"
        fill="white"
        font-size="16"
        font-weight="bold"
        text-anchor="middle"
      >
        {{ litrosActuales }} L
      </text>
    </svg>
  </div>
</template>
