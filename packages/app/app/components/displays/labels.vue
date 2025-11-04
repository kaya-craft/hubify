<script setup lang="ts" generic="T extends TableNames, C extends TableColumnNames<T>">
interface Props {
  collection: T
  column: C
  value: string | string[]
}

defineFieldDataTypes('enum', 'enum-array', 'varchar', 'text', 'json', 'jsonb')
defineOptions({ inheritAttrs: false })

const { value } = defineProps<Props>()

/**
 * Translation.
 */
const { t } = useI18n()

/**
 * JSON value.
 */
const array = normalizeJSONValue(value)
</script>

<template>
  <div class="flex items-center gap-2">
    <UBadge
      v-for="item of array"
      :key="item"
      :label="t(`options.${item}`, item)"
    />
  </div>
</template>
