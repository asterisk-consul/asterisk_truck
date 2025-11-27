<script setup lang="ts">
const depositosStore = useDepositosStore()
const comprasStore = useComprasStore()
const { getCamionesOptionsDescrip } = storeToRefs(useDepositosStore())
import z from 'zod'

import {
  distribucionSchema,
  distribucionesSchema
} from '@/schemas/distribuciones.schema'

const props = defineProps<{
  compras: Partial<Compra>
}>()
const emit = defineEmits<{
  (e: 'close'): void
  (
    e: 'progreso',
    payload: boolean | { actual: number; total: number; mensaje: string }
  ): void
}>()
const {
  distribuciones,
  totalesDistribuidos,
  totalesCoincidenCompletamente,
  agregarDistribucion,
  eliminarDistribucion,
  toggleBloqueo,
  calcularImportesPorPorcentaje,
  esDistribucionValida,
  prorraterarEquitativamente,
  distribuirTodosCamiones,
  ajustarDistribucionesNoBloquedas,
  getOpcionesDisponibles
} = useDistribuciones(toRef(props, 'compras'), getCamionesOptionsDescrip)

// ✅ CORREGIDO: Removido .value de props.compras


const toast = useToast()

const guardarClasificacion = async () => {
  try {
    // Validar con Zod
    distribucionesSchema.parse(distribuciones.value)

    // Validar que los totales coincidan
    if (!totalesCoincidenCompletamente.value) {
      toast.add({
        title: 'Error de validación',
        description:
          'Los totales distribuidos no coinciden con los importes originales',
        color: 'error'
      })
      return
    }

    emit('progreso', true)

    await comprasStore.crearRegistrosClasificados(
      props.compras,
      distribuciones.value,
      ({ actual, total, mensaje: msg }) => {
        emit('progreso', { actual, total, mensaje: msg })
      }
    )

    toast.add({
      title: 'Éxito',
      description: 'Clasificación guardada correctamente',
      color: 'success'
    })

    emit('progreso', false)
    emit('close')
  } catch (error) {
    emit('progreso', false)

    if (error instanceof z.ZodError) {
      // Cambiar 'errors' por 'issues' y tipar el parámetro
      error.issues.forEach((issue: z.ZodIssue) => {
        toast.add({
          title: 'Error de validación',
          description: issue.message,
          color: 'error'
        })
      })
    } else {
      toast.add({
        title: 'Error',
        description: 'Ocurrió un error al guardar la clasificación',
        color: 'error'
      })
    }
  }
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
      :class="[
        'border p-1 my-3',
        !esDistribucionValida(dist) ? 'border-error-500' : ''
      ]"
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
            :items="getOpcionesDisponibles(index)"
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
            :format-options="{
              style: 'currency',
              currency: 'ARS',
              currencyDisplay: 'narrowSymbol',
              currencySign: 'accounting'
            }"
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
              :format-options="{
                style: 'currency',
                currency: 'ARS',
                currencyDisplay: 'narrowSymbol',
                currencySign: 'accounting'
              }"
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
              :format-options="{
                style: 'currency',
                currency: 'ARS',
                currencyDisplay: 'narrowSymbol',
                currencySign: 'accounting'
              }"
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
