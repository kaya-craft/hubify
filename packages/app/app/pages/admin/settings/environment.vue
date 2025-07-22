<script setup lang="ts">
const { t } = useI18n()

useSeoMeta({
  title: () => t('app.admin.settings.environment.title'),
  description: () => t('app.admin.settings.environment.description')
})
</script>

<template>
  <UCard>
    <template #header>
      <p class="text-sm">
        {{ t('app.admin.settings.environment.description') }}
      </p>
    </template>

    <FormTable table="hubify_environment" />
  </UCard>
</template>
