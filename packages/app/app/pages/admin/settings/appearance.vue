<script setup lang="ts">
const { t } = useI18n()

useSeoMeta({
  title: () => t('app.admin.settings.appearance.title'),
  description: () => t('app.admin.settings.appearance.description')
})
</script>

<template>
  <UCard>
    <template #header>
      <p class="text-sm">
        {{ t('app.admin.settings.appearance.description') }}
      </p>
    </template>
  </UCard>
</template>
