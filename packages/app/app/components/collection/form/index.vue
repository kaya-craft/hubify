<script setup lang="ts" generic="T extends TableNames">
type Props = {
  collection: T
  initialState?: MaybeRef<Partial<TableFormState<T>>>
}

const emit = defineEmits<{
  success: [event: TableFormSubmitEvent<T>, stay: boolean]
}>()

const { collection, initialState } = defineProps<Props>()

const { columnNames, state, schema, submit } = useTableForm(collection, initialState)

const { t } = useI18n()

const form = useTemplateRef('form')

async function onSubmit(event: TableFormSubmitEvent<T>) {
  await submit(event)
  emit('success', event, !event.target)
}
</script>

<template>
  <UForm
    ref="form"
    :state
    :schema
    class="gap-4 grid grid-cols-12 auto-cols-auto auto-rows-auto"
    @submit="onSubmit"
  >
    <template #default="slotProps">
      <CollectionFormField
        v-for="column in columnNames"
        :key="column"
        v-model="state[column]"
        :collection
        :column
        :state
        class="col-span-full"
      />

      <div class="col-span-full flex items-center gap-4 justify-end">
        <UButton
          type="button"
          variant="soft"
          color="secondary"
          :loading="slotProps?.loading"
          :disabled="(slotProps?.errors || []).length > 0"
          @click="form?.submit()"
        >
          {{ t('app.admin.form.submit-and-stay') }}
        </UButton>

        <UButton
          type="submit"
          :loading="slotProps?.loading"
          :disabled="(slotProps?.errors || []).length > 0"
        >
          {{ t('app.admin.form.submit') }}
        </UButton>
      </div>
    </template>
  </UForm>
</template>
