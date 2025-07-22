<script setup lang="ts" generic="T extends TableFormTables">
type Props = {
  table: T
}

const { table } = defineProps<Props>()

const { columns, state, schema, submit } = useTableForm(table)

const { t } = useI18n()
</script>

<template>
  <UForm
    :state
    :schema
    class="gap-4 grid grid-cols-12 auto-cols-auto auto-rows-auto"
    @submit="submit"
  >
    <FormField
      v-for="column in columns"
      :key="column"
      v-model="state[column]"
      :table
      :column
      :state
      class="col-span-full"
    />

    <div class="col-span-full">
      <UButton
        type="submit"
      >
        {{ t('app.admin.form.submit') }}
      </UButton>
    </div>
  </UForm>
</template>
