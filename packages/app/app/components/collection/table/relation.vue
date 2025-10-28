<script setup lang="ts" generic="T extends TableNames, R extends TableRelationNames<T>">
type Props = {
  collection: T
  relation: R
  id: TablePrimaryKeyValue<T>
}

const { id, collection, relation: relationName } = defineProps<Props>()

/**
 * i18n instance.
 */
const { t } = useI18n()

/**
 * Table composable.
 */
const { getRelation } = useTable(collection)

/**
 * Collection composable.
 */
const { attach, detach, loading } = useCollection(collection)

/**
 * Current relation.
 */
const relation = computed(() => {
  return getRelation(relationName)
})
</script>

<template>
  <CollectionTable
    v-if="relation.foreignKey"
    :collection="relation?.table"
    :query-router="{ where: { [relation.foreignKey]: { $eq: id } } }"
    selectable
  >
    <template #append-header="{ selected: detaching }">
      <UButton
        v-if="detaching.length"
        variant="soft"
        color="error"
        leading-icon="heroicons:trash"
        :loading
        @click="detach(relationName, ...detaching)"
      >
        {{ t('app.admin.items.detatch-items', { name: relation.table }) }}
      </UButton>

      <UModal :dismissible="false">
        <UButton
          variant="soft"
          color="secondary"
          leading-icon="heroicons:plus"
        >
          {{ t('app.admin.items.attach-items', { name: relation.table }) }}
        </UButton>

        <template #content="{ close }">
          <CollectionTable
            :collection="relation.table"
            :where="{ $or: [{ [relation.foreignKey]: { $neq: id } }, { [relation.foreignKey]: { $null: true } }] }"
            selectable
          >
            <template #footer="{ selected: attaching }">
              <div class="flex items-center gap-4 justify-end">
                <UButton
                  variant="soft"
                  color="warning"
                  @click="close"
                >
                  {{ t('app.admin.form.cancel') }}
                </UButton>

                <UButton
                  variant="solid"
                  class="ml-2"
                  :loading
                  @click="attach(id, relationName, ...attaching).then(close)"
                >
                  {{ t('app.admin.form.submit') }}
                </UButton>
              </div>
            </template>
          </CollectionTable>
        </template>
      </UModal>
    </template>
  </CollectionTable>
</template>
