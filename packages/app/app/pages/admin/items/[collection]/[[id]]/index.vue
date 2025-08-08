<script setup lang="ts" generic="T extends TableNames, I extends PrimaryKeyValue<typeof schema, T>">
import type { PrimaryKeyValue } from '@hubify/restql'
import type schema from '#hubify/schema'

interface Props {
  table: T
  id?: I
}

const { table } = defineProps<Props>()

const { t } = useI18n()

const localeRoute = useLocaleRoute()
</script>

<template>
  <UCard>
    <template #header>
      <div class="flex items-center justify-between">
        <h2 class="text-lg font-semibold">
          {{ table }}
        </h2>
        <UButton
          :to="localeRoute({ name: 'admin-items-collection-id-create', params: { collection: table } })"
          variant="soft"
          color="secondary"
          leading-icon="heroicons:plus"
        >
          {{ t('app.admin.items.create') }}
        </UButton>
      </div>
    </template>

    <Table
      :table
    />
  </UCard>

  <NuxtPage
    :id
    :table
  />
</template>
