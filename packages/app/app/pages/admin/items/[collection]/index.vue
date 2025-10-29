<script setup lang="ts" generic="T extends TableNames, I extends TablePrimaryKeyValue<T>">
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
    :selectable="true"
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

  <NuxtPage
    :id
    :collection
  />
</template>
