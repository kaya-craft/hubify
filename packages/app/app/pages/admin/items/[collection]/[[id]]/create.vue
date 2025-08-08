<script setup lang="ts" generic="T extends TableNames">
interface Props {
  table: T
}

const { table } = defineProps<Props>()

const { t } = useI18n()

const localePath = useLocalePath()

const backRoute = localePath({
  name: 'admin-items-collection',
  params: { collection: table }
})

const router = useRouter()

function onSuccess(_event: TableFormSubmitEvent<T>, stay: boolean) {
  if (!stay && backRoute) {
    router.push(backRoute)
  }
}
</script>

<template>
  <UCard>
    <template #header>
      <div class="flex items-center gap-4">
        <UButton
          :to="backRoute"
          variant="ghost"
          color="secondary"
          icon="heroicons:arrow-left"
          :aria-label="t('app.back')"
        />
        <h2 class="text-lg font-semibold">
          {{ table }}
        </h2>
      </div>
    </template>

    <FormTable
      :table
      @success="onSuccess"
    />
  </UCard>
</template>
