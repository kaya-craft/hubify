<script setup lang="ts">
const { t } = useI18n()

useSeoMeta({
  title: () => t('app.admin.settings.general.title'),
  description: () => t('app.admin.settings.general.description')
})

const { data } = await useItems('hubify_settings')

const initialState = computed(() => data.value?.items[0])
</script>

<template>
  <UContainer class="py-4 lg:py-8">
    <CollectionForm
      collection="hubify_settings"
      :initial-state="initialState"
    />
  </UContainer>
</template>
