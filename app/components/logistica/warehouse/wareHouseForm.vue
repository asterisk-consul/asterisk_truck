<script setup lang="ts">
import {
  warehouseSchema,
  type WarehouseForm
} from '@/schemas/logistica/warehouse/warehouse.schema'

const props = defineProps<{
  modelValue?: Partial<WarehouseForm>
  mode: 'create' | 'edit'
}>()

const emit = defineEmits(['submit'])

const form = reactive<WarehouseForm>({
  companyId: props.modelValue?.companyId || '',
  name: props.modelValue?.name || '',
  code: props.modelValue?.code || '',
  locationId: props.modelValue?.locationId || '',
  active: props.modelValue?.active ?? true
})

const errors = ref<Record<string, string>>({})

const validate = () => {
  const result = warehouseSchema.safeParse(form)

  if (!result.success) {
    errors.value = {}
    result.error.issues.forEach((issue) => {
      const field = issue.path[0] as string
      errors.value[field] = issue.message
    })
    return false
  }

  errors.value = {}
  return true
}

const submit = () => {
  if (!validate()) return

  emit('submit', { ...form })
}
</script>

<template>
  <div class="space-y-4">
    <div>
      <label>Company ID</label>
      <input v-model="form.companyId" class="input" />
      <p class="error" v-if="errors.companyId">{{ errors.companyId }}</p>
    </div>

    <div>
      <label>Nombre</label>
      <input v-model="form.name" class="input" />
      <p class="error" v-if="errors.name">{{ errors.name }}</p>
    </div>

    <div>
      <label>Código</label>
      <input v-model="form.code" class="input" />
      <p class="error" v-if="errors.code">{{ errors.code }}</p>
    </div>

    <div>
      <label>Location ID</label>
      <input v-model="form.locationId" class="input" />
      <p class="error" v-if="errors.locationId">{{ errors.locationId }}</p>
    </div>

    <div>
      <label>
        <input type="checkbox" v-model="form.active" />
        Activo
      </label>
    </div>

    <button @click="submit" class="btn">
      {{ mode === 'create' ? 'Crear' : 'Actualizar' }}
    </button>
  </div>
</template>

<style scoped>
.input {
  border: 1px solid #ccc;
  padding: 6px;
  width: 100%;
}

.error {
  color: red;
  font-size: 12px;
}

.btn {
  background: black;
  color: white;
  padding: 8px 12px;
}
</style>
