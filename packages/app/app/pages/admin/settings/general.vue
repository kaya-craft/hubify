<script setup lang="ts">
const { t } = useI18n()

useSeoMeta({
    title: () => t('app.admin.settings.general.title'),
    description: () => t('app.admin.settings.general.description'),
})
</script>

<template>
    <UCard>
        <template #header>
            <p class="text-sm">{{ t('app.admin.settings.general.description') }}</p>
        </template>
    </UCard>
</template>
