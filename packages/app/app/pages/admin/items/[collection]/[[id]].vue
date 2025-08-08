<script setup lang="ts" generic="T extends TableNames">
import type schema from '#hubify/schema'
import type { PrimaryKeyValue } from '@hubify/restql'

interface Props {
  table: T
  id?: PrimaryKeyValue<typeof schema, T>
}

definePageMeta({
  props: to => ({
    table: String(to.params.collection) as T,
    id: to.params.id?.toString()
  })
})

const { table, id } = defineProps<Props>()
</script>

<template>
  <NuxtPage
    :id
    :table
  />
</template>
