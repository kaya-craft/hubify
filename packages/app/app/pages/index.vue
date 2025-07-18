<script setup lang="ts">
const localeRoute = useLocaleRoute()
</script>

<template>
  <div class="flex flex-col gap-8 items-center">
    <div class="text-5xl font-bold text-center">
      Welcome to Hubify.
    </div>

    <UButton
      :to="localeRoute({ name: 'admin' })"
      trailing-icon="i-heroicons-arrow-right"
    >
      Go to the Admin Dashboard
    </UButton>
  </div>
</template>
