<script setup lang="ts">
const params = {
  statusid: 1640,
  flowid: 10987,
  pattern: '',
  offset: 0,
  max: 20,
  sort: 'referenciatexto',
  descending: false
}

const { data } = await postData<Partial<ApiRegistroCabList>>(
  '/workspace/getRegistroCabList',
  params
)
console.log(data)
</script>

<template></template>
