<script setup lang="ts" generic="T extends TableNames, I extends PrimaryKeyValue<typeof schema, T>">
import type schema from '#hubify/schema'
import type { PrimaryKeyValue } from '@hubify/restql'

interface Props {
  collection: T
  id?: I
}

const { collection } = defineProps<Props>()

const { t } = useI18n()

const localeRoute = useLocaleRoute()

const { canCreate } = useTable(collection)
</script>

<template>
  <CollectionTable
    :collection
  >
    <template #append-header>
      <UButton
        v-if="canCreate()"
        :to="localeRoute({ name: 'admin-items-collection-create', params: { collection } })"
        variant="soft"
        color="secondary"
        leading-icon="heroicons:plus"
      >
        {{ t('app.admin.items.create') }}
      </UButton>
    </template>
  </CollectionTable>
</template>
