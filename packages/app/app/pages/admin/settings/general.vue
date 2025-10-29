<script setup lang="ts">
const { t } = useI18n()

usePageTitle({
  title: t('app.admin.settings.general.title'),
  icon: 'heroicons:cog-6-tooth-solid'
})

const { data } = await useItems('hubify_settings', { id: 1 })

const initialState = computed(() => data.value)

const { columnNames } = useCollection('hubify_settings')
</script>

<template>
  <UContainer class="py-4 lg:py-8">
    <Displays
      v-for="column in columnNames"
      :key="column"
      collection="hubify_settings"
      :column
      :value="initialState[column]"
    />
  </UContainer>
</template>
