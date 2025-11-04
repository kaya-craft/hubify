<script setup lang="ts" generic="T extends TableNames">
definePageMeta({
  validate: to => isString(to.query.items) || isArray(to.query.items),
  props: (to) => {
    const items = isArray(to.query.items) ? to.query.items : to.query.items?.split(',') || []
    return { ...to.params, items }
  }
})

interface Props {
  collection: T
  items: TablePrimaryKeyValue<T>[]
}

const { collection, items } = defineProps<Props>()

/**
 * Router instance
 */
const router = useRouter()

/**
 * Collection.
 */
const { remove, loading } = useCollection(collection)

/**
 * On close.
 */
async function close() {
  await router.back()
}

/**
 * Translation
 */
const { t } = useI18n()
</script>

<template>
  <UModal
    :close="{ onClick: close }"
    :title="t('app.form.actions.delete')"
    default-open
    @after:leave="close"
  >
    <template #body>
      <p>{{ t('app.items.remove.confirmation', { count: items.length }) }}</p>
    </template>

    <template #footer>
      <div class="flex justify-end w-full gap-2">
        <UButton
          color="neutral"
          variant="soft"
          :label="t('app.back')"
          @click="close"
        />
        <UButton
          color="error"
          variant="outline"
          :label="t('app.form.actions.delete')"
          :loading="loading"
          @click="remove(items).then(close)"
        />
      </div>
    </template>
  </UModal>
</template>
