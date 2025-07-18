<script setup lang="ts">
const { t } = useI18n()

useSeoMeta({
  title: () => t('app.admin.settings.security.title'),
  description: () => t('app.admin.settings.security.description')
})
</script>

<template>
  <UCard>
    <template #header>
      <p class="text-sm">
        {{ t('app.admin.settings.security.description') }}
      </p>
    </template>
  </UCard>
</template>
