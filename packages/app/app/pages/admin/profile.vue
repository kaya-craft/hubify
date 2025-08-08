<script setup lang="ts">
const { t } = useI18n()

useSeoMeta({
  title: () => t('app.admin.profile.title'),
  description: () => t('app.admin.profile.description')
})

/**
 * Get the user session
 */
const { user } = useUserSession()
</script>

<template>
  <UCard>
    <template #header>
      <p class="text-sm">
        {{ t('app.admin.profile.description') }}
      </p>
    </template>

    <FormTable
      table="hubify_users"
      :initial-state="{
        email: user?.email,
        firstname: user?.firstname,
        lastname: user?.lastname
      }"
    />
  </UCard>
</template>
