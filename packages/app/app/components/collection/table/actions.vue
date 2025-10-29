<script setup lang="ts" generic="T extends TableNames">
import type { DropdownMenuItem } from '@nuxt/ui'

interface Props {
  collection: T
  item: TableItem<T>
}

const { item, collection } = defineProps<Props>()

/**
 * Collection definition.
 */
const { getPrimaryKeyValue } = useTable(collection)

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
      to: localeRoute(`/admin/items/${collection}/${getPrimaryKeyValue(item)}/edit`),
      icon: 'heroicons:pencil-square'
    },
    {
      label: t('app.form.actions.view'),
      to: localeRoute(`/items/${collection}/${getPrimaryKeyValue(item)}`),
      icon: 'heroicons:eye'
    },
    {
      label: t('app.form.actions.duplicate'),
      onSelect: () => duplicate(item),
      icon: 'heroicons:document-duplicate'
    },
    {
      label: t('app.form.actions.delete'),
      to: localeRoute(`/admin/items/${collection}/remove?items=${getPrimaryKeyValue(item)}`),
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
