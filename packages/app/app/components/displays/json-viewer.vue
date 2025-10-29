<script setup lang="ts" generic="T extends TableNames, C extends TableColumnNames<T>">
interface Props {
  collection: T
  column: C
  value: string
}

const { value } = defineProps<Props>()

defineFieldDataTypes('json', 'text', 'jsonb')
defineOptions({ inheritAttrs: false })

const json = normalizeJSONValue(() => value)

const { t } = useI18n()
</script>

<template>
  <UModal
    :title="column"
    :ui="{ body: '!p-0' }"
  >
    <UButton
      size="sm"
      :label="t('app.view-json')"
    />

    <template #body>
      <pre class="whitespace-pre-wrap bg-black p-6 text-white">{{ JSON.stringify(json, null, 2) }}</pre>
    </template>
  </UModal>
</template>
