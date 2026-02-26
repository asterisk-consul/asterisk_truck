<script setup lang="ts">
import { vehicleForm } from '@/form/vehicles.form'

const companyId = 'b8c78e68-2d33-4927-b6cb-b78ecdca3d64'

const config = vehicleForm(companyId)
</script>

<template>
  <DynamicForm :config="config" />
</template>
