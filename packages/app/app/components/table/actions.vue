<script setup lang="ts" generic="T extends TableNames">
import schema from '#hubify/schema'
import { getPrimaryKey } from '@hubify/restql/utils/helpers'
import type { Item } from '@hubify/restql/utils/helpers'
import type { DropdownMenuItem } from '@nuxt/ui'

interface Props {
  table: T
  item: Item<typeof schema, T>
}

const { table, item } = defineProps<Props>()

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
        params: { collection: table, id: item[getPrimaryKey(schema, table) as keyof typeof item].toString() }
      }),
      icon: 'heroicons:pencil-square'
    },
    {
      label: t('app.form.actions.delete'),
      to: localeRoute({
        name: 'admin-items-collection-id-index-remove',
        params: { collection: table, id: item[getPrimaryKey(schema, table) as keyof typeof item].toString() }
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
