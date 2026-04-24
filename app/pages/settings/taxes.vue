<script setup lang="ts">
definePageMeta({
  layout: 'default',
  middleware: ['auth']
})

import { TaxesService, type Tax } from '~/modulos/erp/taxes/taxes.service'

const TAX_TYPES = ['IVA', 'IIBB', 'Percepción', 'Retención', 'Otro']
const CALC_LEVELS = ['LINE', 'TOTAL', 'HEADER']

// ─── Fetch ────────────────────────────────────────────────────────────────────
const {
  data: taxes,
  pending,
  error,
  refresh
} = await useAsyncData('taxes', () => TaxesService.getAll(), { server: false })

// ─── Modal ────────────────────────────────────────────────────────────────────
const isModalOpen = ref(false)
const isEditing = ref(false)
const saving = ref(false)
const saveError = ref<string | null>(null)
const selectedTax = ref<Tax | null>(null)

const emptyForm = () => ({
  code: '',
  name: '',
  tax_type: 'IVA',
  rate: 21,
  is_percentage: true,
  active: true,
  calculation_level: 'LINE'
})

const form = reactive(emptyForm())

function openCreate() {
  isEditing.value = false
  selectedTax.value = null
  Object.assign(form, emptyForm())
  saveError.value = null
  isModalOpen.value = true
}

function openEdit(tax: Tax) {
  isEditing.value = true
  selectedTax.value = tax
  Object.assign(form, {
    code: tax.code,
    name: tax.name,
    tax_type: tax.tax_type,
    rate: tax.rate,
    is_percentage: tax.is_percentage,
    active: tax.active,
    calculation_level: tax.calculation_level
  })
  saveError.value = null
  isModalOpen.value = true
}

function closeModal() {
  isModalOpen.value = false
  selectedTax.value = null
}

async function saveTax() {
  saving.value = true
  saveError.value = null
  try {
    const payload = {
      ...form,
      rate: Number(form.rate) // ← forzar número siempre
    }

    if (isEditing.value && selectedTax.value) {
      await TaxesService.update(selectedTax.value.id, payload)
    } else {
      await TaxesService.create(payload)
    }
    await refresh()
    closeModal()
  } catch (e: any) {
    saveError.value = e?.data?.message ?? e?.message ?? 'Error al guardar'
  } finally {
    saving.value = false
  }
}

async function deleteTax(tax: Tax) {
  if (!confirm(`¿Eliminár "${tax.name}"?`)) return
  try {
    await TaxesService.remove(tax.id)
    await refresh()
  } catch (e: any) {
    console.error('Error al eliminar:', e)
  }
}

async function toggleActive(tax: Tax) {
  try {
    await TaxesService.update(tax.id, { active: !tax.active })
    await refresh()
  } catch (e: any) {
    console.error('Error al actualizar estado:', e)
  }
}

// ─── Columnas (Nuxt UI v3) ────────────────────────────────────────────────────
const columns = [
  { id: 'code', header: 'Código' },
  { id: 'name', header: 'Nombre' },
  { id: 'tax_type', header: 'Tipo' },
  { id: 'rate', header: 'Tasa' },
  { id: 'calculation_level', header: 'Nivel de cálculo' },
  { id: 'active', header: 'Activo' },
  { id: 'actions', header: '' }
]
</script>

<template>
  <UDashboardPanel>
    <template #header>
      <UDashboardNavbar title="Impuestos">
        <template #trailing>
          <UButton
            label="Nuevo impuesto"
            icon="i-lucide-plus"
            color="primary"
            @click="openCreate"
          />
        </template>
      </UDashboardNavbar>
    </template>

    <template #body>
      <div class="p-4 space-y-4">
        <UAlert
          v-if="error"
          color="error"
          variant="subtle"
          icon="i-lucide-circle-alert"
          title="Error al cargar impuestos"
        />

        <UPageCard variant="subtle">
          <UTable :data="taxes ?? []" :columns="columns" :loading="pending">
            <template #code-cell="{ row }">
              {{ row.original.code }}
            </template>

            <template #name-cell="{ row }">
              {{ row.original.name }}
            </template>

            <template #rate-cell="{ row }">
              {{ row.original.rate
              }}{{ row.original.is_percentage ? '%' : ' $' }}
            </template>

            <template #tax_type-cell="{ row }">
              <UBadge
                :label="row.original.tax_type"
                variant="subtle"
                color="primary"
              />
            </template>

            <template #calculation_level-cell="{ row }">
              <UBadge
                :label="row.original.calculation_level"
                variant="outline"
                color="neutral"
              />
            </template>

            <template #active-cell="{ row }">
              <USwitch
                :model-value="row.original.active"
                @update:model-value="toggleActive(row.original)"
              />
            </template>

            <template #actions-cell="{ row }">
              <div class="flex gap-1">
                <UButton
                  icon="i-lucide-pencil"
                  variant="ghost"
                  color="neutral"
                  size="sm"
                  @click="openEdit(row.original)"
                />
                <UButton
                  icon="i-lucide-trash-2"
                  variant="ghost"
                  color="error"
                  size="sm"
                  @click="deleteTax(row.original)"
                />
              </div>
            </template>
          </UTable>
        </UPageCard>
      </div>
    </template>
  </UDashboardPanel>

  <!-- Modal -->
  <UModal
    v-model:open="isModalOpen"
    :title="isEditing ? 'Editar impuesto' : 'Nuevo impuesto'"
  >
    <template #body>
      <div class="space-y-4">
        <UAlert
          v-if="saveError"
          color="error"
          variant="subtle"
          :title="saveError"
          icon="i-lucide-circle-alert"
        />

        <div class="grid grid-cols-2 gap-4">
          <UFormField label="Código" name="code" required>
            <UInput v-model="form.code" placeholder="IVA_21" class="w-full" />
          </UFormField>

          <UFormField label="Nombre" name="name" required>
            <UInput v-model="form.name" placeholder="IVA 21%" class="w-full" />
          </UFormField>

          <UFormField label="Tipo de impuesto" name="tax_type">
            <USelect
              v-model="form.tax_type"
              :items="TAX_TYPES"
              class="w-full"
            />
          </UFormField>

          <UFormField label="Tasa" name="rate">
            <UInput
              v-model.number="form.rate"
              type="number"
              step="0.001"
              class="w-full"
            />
          </UFormField>

          <UFormField label="Nivel de cálculo" name="calculation_level">
            <USelect
              v-model="form.calculation_level"
              :items="CALC_LEVELS"
              class="w-full"
            />
          </UFormField>

          <UFormField label="Es porcentaje" name="is_percentage">
            <USwitch v-model="form.is_percentage" />
          </UFormField>

          <UFormField label="Activo" name="active">
            <USwitch v-model="form.active" />
          </UFormField>
        </div>
      </div>
    </template>

    <template #footer>
      <div class="flex justify-end gap-2">
        <UButton
          label="Cancelar"
          variant="ghost"
          color="neutral"
          @click="closeModal"
        />
        <UButton
          :label="isEditing ? 'Guardar cambios' : 'Crear impuesto'"
          :loading="saving"
          color="primary"
          @click="saveTax"
        />
      </div>
    </template>
  </UModal>
</template>
