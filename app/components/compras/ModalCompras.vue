<script setup lang="ts">
const depositosStore = useDepositosStore()
const comprasStore = useComprasStore()
const { getCamionesOptionsDescrip } = storeToRefs(useDepositosStore())
const props = defineProps<{
  compras: Partial<Compra>
}>()
const emit = defineEmits<{
  (e: 'close'): void
}>()

const crearDistribucionVacia = (): Distribucion => ({
  clasificacion: null,
  porcentaje: 0,
  importes: {
    totalimpuestos: 0,
    totalprecio: 0,
    varcn0: 0,
    varcn1: 0,
    varcn2: 0,
    varcn3: 0
  }
})
const distribuciones = ref<Distribucion[]>([crearDistribucionVacia()])

const agregarDistribucion = () => {
  distribuciones.value.push(crearDistribucionVacia())
}

const eliminarDistribucion = (index: number) => {
  distribuciones.value.splice(index, 1)
}

const totalesDistribuidos = computed(() => {
  return distribuciones.value.reduce(
    (acc, dist) => {
      acc.totalimpuestos += dist.importes.totalimpuestos || 0
      acc.totalprecio += dist.importes.totalprecio || 0
      acc.varcn0 += dist.importes.varcn0 || 0
      acc.varcn1 += dist.importes.varcn1 || 0
      acc.varcn2 += dist.importes.varcn2 || 0
      acc.varcn3 += dist.importes.varcn3 || 0
      return acc
    },
    {
      totalimpuestos: 0,
      totalprecio: 0,
      varcn0: 0,
      varcn1: 0,
      varcn2: 0,
      varcn3: 0
    }
  )
})

// Redondear SIEMPRE a 2 decimales
const r2 = (n: number | null | undefined) => Math.round((n || 0) * 100) / 100

// Tolerancia de 1 centavo
const tolerance = 0.01

const isEqual = (a: number, b: number) => Math.abs(r2(a) - r2(b)) <= tolerance

const totalesCoincidenCompletamente = computed(() => {
  const original = props.compras
  const d = totalesDistribuidos.value

  if (!original) return true

  return (
    isEqual(original.totalimpuestos, d.totalimpuestos) &&
    isEqual(original.totalprecio, d.totalprecio) &&
    isEqual(original.varcn0, d.varcn0) &&
    isEqual(original.varcn1, d.varcn1) &&
    isEqual(original.varcn2, d.varcn2) &&
    isEqual(original.varcn3, d.varcn3)
  )
})

const toast = useToast()

const guardarClasificacion = async () => {
  try {
    await comprasStore.crearRegistrosClasificados(
      props.compras,
      distribuciones.value
    )

    toast.add({
      id: 'ok-clasificacion',
      title: 'Registros creados',
      description: `${distribuciones.value.length} registro(s) creado(s) correctamente`,
      color: 'success'
    })

    cerrarDialog()
  } catch (error) {
    toast.add({
      id: 'error-clasificacion',
      title: 'Error',
      description: 'Error al crear los registros clasificados',
      color: 'error'
    })
  }
}

const prorraterarEquitativamente = () => {
  const cantidad = distribuciones.value.length
  const porcentaje = 1 / cantidad // 0–1

  distribuciones.value.forEach((dist, index) => {
    dist.porcentaje = porcentaje // ejemplo: 0.25
    calcularImportesPorPorcentaje(index)
  })
}

// ✅ CORREGIDO: Removido .value de props.compras
const calcularImportesPorPorcentaje = (index) => {
  const dist = distribuciones.value[index]
  const porcentaje = dist.porcentaje

  dist.importes.totalimpuestos =
    Math.round((props.compras.totalimpuestos || 0) * porcentaje * 100) / 100
  dist.importes.totalprecio =
    Math.round((props.compras.totalprecio || 0) * porcentaje * 100) / 100
  dist.importes.varcn0 =
    Math.round((props.compras.varcn0 || 0) * porcentaje * 100) / 100
  dist.importes.varcn1 =
    Math.round((props.compras.varcn1 || 0) * porcentaje * 100) / 100
  dist.importes.varcn2 =
    Math.round((props.compras.varcn2 || 0) * porcentaje * 100) / 100
  dist.importes.varcn3 =
    Math.round((props.compras.varcn3 || 0) * porcentaje * 100) / 100
}

const cerrarDialog = () => {
  emit('close')
}

onMounted(async () => {
  await depositosStore.fetchCamiones()
})
</script>
<template>
  <!-- Información de la compra -->
  <UCard class="mb-4 w-full">
    <template #header>
      <h2 class="text-lg mb-2 font-bold">Detalle de Compra</h2>
      <USeparator size="lg" class="mb-2" />
      <div class="grid grid-cols-1 md:grid-cols-2 gap-5 pb-5">
        <div class="flex flex-col w-full gap-1">
          <p>Proveedor : {{ compras?.obsadm ? compras.obsadm : '—' }}</p>
          <p>Concepto : {{ compras?.obsinicio ? compras.obsinicio : '—' }}</p>
          <p>Motivo : {{ compras?.obsventas ? compras.obsventas : '—' }}</p>
        </div>
        <div class="flex flex-col w-full gap-1">
          <p>
            Comprobante :
            {{ compras?.referenciatexto ? compras.referenciatexto : '—' }}
          </p>
          <p>
            Fecha :
            {{
              compras?.fecha
                ? new Date(compras.fecha).toLocaleDateString('es-AR')
                : '—'
            }}
          </p>
          <p>
            Fecha Compromiso :
            {{
              compras?.fechacompromiso
                ? new Date(compras.fechacompromiso).toLocaleDateString('es-AR')
                : '—'
            }}
          </p>
        </div>
      </div>
      <USeparator size="lg" class="mb-2" />
      <div class="flex justify-center gap-8 pt-2">
        <UBadge
          variant="outline"
          color="primary"
          class="flex flex-col justify-around"
        >
          Total con Impuestos :
          <span class="text-neutral-50 text-base">
            ${{ compras?.totalimpuestos ? compras.totalimpuestos : '—' }}
          </span>
        </UBadge>
        <UBadge
          variant="outline"
          color="primary"
          class="flex flex-col justify-around"
        >
          Total :
          <span class="text-neutral-50 text-base">
            ${{ compras?.totalprecio ? compras.totalprecio : '—' }}
          </span>
        </UBadge>
        <UBadge
          variant="outline"
          color="primary"
          class="flex flex-col justify-around"
        >
          Imp excento :
          <span class="text-neutral-50 text-base">
            ${{ compras?.varcn0 ? compras.varcn0 : '—' }}
          </span>
        </UBadge>
        <UBadge
          variant="outline"
          color="primary"
          class="flex flex-col justify-around"
        >
          Gravado :
          <span class="text-neutral-50 text-base">
            ${{ compras?.varcn1 ? compras.varcn1 : '—' }}
          </span>
        </UBadge>
      </div>
    </template>
    <div class="flex justify-between items-center p-4">
      <h2 class="text-lg font-bold">Distribuciones</h2>
      <UButton
        variant="outline"
        color="primary"
        class="rounded-full hover:cursor-pointer"
        icon="i-lucide-plus"
        label="Agregar"
        @click="agregarDistribucion"
      />
    </div>
    <UCard
      v-for="(dist, index) in distribuciones"
      variant="subtle"
      :key="index"
      class="border p-1 my-3"
    >
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <!-- Encabezado -->
        <div
          class="col-span-1 md:col-span-2 flex justify-between items-center pb-2"
        >
          <span class="text-lg font-semibold">
            Distribución {{ index + 1 }}
          </span>

          <UButton
            v-if="distribuciones.length > 1"
            color="error"
            variant="ghost"
            icon="i-heroicons-trash"
            @click="eliminarDistribucion(index)"
          />
        </div>

        <!-- Clasificación -->
        <div>
          <p class="text-sm font-medium mb-1">Clasificación</p>
          <USelectMenu
            v-model="dist.clasificacion"
            :items="getCamionesOptionsDescrip"
            placeholder="Clasificación"
            icon="i-heroicons-truck"
            class="w-full"
            nullable
          />
        </div>

        <!-- Porcentaje -->
        <div>
          <p class="text-sm font-medium mb-1">Porcentaje</p>
          <UInputNumber
            v-model="dist.porcentaje"
            :min="0"
            :max="1"
            :step="0.0001"
            class="w-full"
            :format-options="{
              style: 'percent',
              minimumFractionDigits: 2,
              maximumFractionDigits: 4
            }"
            @update:model-value="calcularImportesPorPorcentaje(index)"
          />
        </div>

        <!-- Total Impuestos -->
        <div>
          <p class="text-sm font-medium mb-1">Total Impuestos</p>
          <UInputNumber
            v-model="dist.importes.totalimpuestos"
            class="w-full"
            :format-options="{
              style: 'currency',
              currency: 'ARS',
              currencyDisplay: 'narrowSymbol',
              currencySign: 'accounting'
            }"
          />
        </div>

        <!-- Total Precio -->
        <div>
          <p class="text-sm font-medium mb-1">Total Precio</p>
          <UInput
            v-model="dist.importes.totalprecio"
            type="number"
            prefix="$"
            class="w-full"
          />
        </div>

        <!-- VarCNs (fila completa, 4 columnas) -->
        <div
          class="col-span-1 md:col-span-2 grid grid-cols-2 md:grid-cols-4 gap-6"
        >
          <div>
            <p class="text-sm font-medium mb-1">Imp excento</p>
            <UInput
              v-model="dist.importes.varcn0"
              class="w-full"
              type="number"
              prefix="$"
              label="VarCN0"
            />
          </div>

          <div>
            <p class="text-sm font-medium mb-1">Gravado</p>
            <UInput
              v-model="dist.importes.varcn1"
              class="w-full"
              type="number"
              prefix="$"
              label="VarCN1"
            />
          </div>

          <div>
            <p class="text-sm font-medium mb-1">Varcn2</p>
            <UInput
              v-model="dist.importes.varcn2"
              class="w-full"
              type="number"
              prefix="$"
              label="VarCN2"
            />
          </div>

          <div>
            <p class="text-sm font-medium mb-1">Varcn3</p>
            <UInput
              v-model="dist.importes.varcn3"
              class="w-full"
              type="number"
              prefix="$"
              label="VarCN3"
            />
          </div>
        </div>
      </div>
    </UCard>
    <template #footer>
      <div class="flex flex-col gap-4">
        <h3 class="text-lg mb-2 font-bold">Totales distribuidos:</h3>
        <!-- Grid Totales -->
        <div class="grid grid-cols-2 md:grid-cols-6 gap-4">
          <div>
            <div class="text-xs text-gray-500">Total Impuestos</div>
            <div class="font-bold">
              {{ formatMoneda(totalesDistribuidos.totalimpuestos) }}
            </div>
          </div>

          <div>
            <div class="text-xs text-gray-500">Total Precio</div>
            <div class="font-bold">
              {{ formatMoneda(totalesDistribuidos.totalprecio) }}
            </div>
          </div>

          <div>
            <div class="text-xs text-gray-500">Imp exento</div>
            <div class="font-bold">
              {{ formatMoneda(totalesDistribuidos.varcn0) }}
            </div>
          </div>

          <div>
            <div class="text-xs text-gray-500">Gravado</div>
            <div class="font-bold">
              {{ formatMoneda(totalesDistribuidos.varcn1) }}
            </div>
          </div>

          <div>
            <div class="text-xs text-gray-500">VarCN2</div>
            <div class="font-bold">
              {{ formatMoneda(totalesDistribuidos.varcn2) }}
            </div>
          </div>

          <div>
            <div class="text-xs text-gray-500">VarCN3</div>
            <div class="font-bold">
              {{ formatMoneda(totalesDistribuidos.varcn3) }}
            </div>
          </div>
        </div>
        <div class="flex justify-between">
          <UButton
            color="warning"
            class="w-80 text-center justify-center hover:cursor-pointer"
            label="Prorratear Equitativamente"
            @click="prorraterarEquitativamente"
          />
          <UButton
            color="primary"
            class="w-40 text-center justify-center hover:cursor-pointer"
            label="Guardar"
            @click="guardarClasificacion"
          />
        </div>
      </div>

      <!-- Advertencia -->
      <UAlert
        v-if="!totalesCoincidenCompletamente"
        color="warning"
        variant="soft"
        class="mt-4"
        icon="i-heroicons-exclamation-triangle"
        description="Los totales distribuidos no coinciden exactamente con los importes
        originales."
      ></UAlert>
    </template>
  </UCard>

  <!-- Distribuciones -->
</template>
