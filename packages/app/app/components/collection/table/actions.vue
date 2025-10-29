<script setup lang="ts" generic="T extends TableNames">
import type { DropdownMenuItem } from '@nuxt/ui';

interface Props {
  collection: T
  item: TableItem<T>
}

const { item, collection } = defineProps<Props>()

/**
 * Collection definition.
 */
const { getPrimaryKeyValue } = useCollection(collection)

/**
 * Collection composable.
 */
const { duplicate } = useCollection(collection)

/**
 * Translation
 */
const { t } = useI18n()

/**
 * Locale route helper.
 */
const localeRoute = useLocaleRoute()

/**
 * Dropdown items for actions.
 */
const dropdownItems = computed(() => {
  return [
    {
      label: t('app.form.actions.edit'),
      to: localeRoute({
        name: 'admin-items-collection-id-edit',
        params: { collection: collection, id: getPrimaryKeyValue(item) }
      }),
      icon: 'heroicons:pencil-square'
    },
    {
      label: t('app.form.actions.view'),
      to: localeRoute({
        name: 'admin-items-collection-id-view',
        params: { collection: collection, id: getPrimaryKeyValue(item) }
      }),
      icon: 'heroicons:eye'
    },
    {
      label: t('app.form.actions.duplicate'),
      onSelect: () => duplicate(item),
      icon: 'heroicons:document-duplicate'
    },
    {
      label: t('app.form.actions.delete'),
      to: localeRoute({
        name: 'admin-items-collection-id-remove',
        params: { collection: collection, id: getPrimaryKeyValue(item) }
      }),
      icon: 'heroicons:trash'
    }
  ] satisfies DropdownMenuItem[]
})
</script>

<template>
  <UDropdownMenu :items="dropdownItems">
    <UButton
      variant="ghost"
      color="secondary"
      icon="heroicons:ellipsis-vertical"
      :aria-label="t('app.form.actions')"
    />
  </UDropdownMenu>
</template>
