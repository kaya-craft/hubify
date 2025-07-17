<script setup lang="ts">
import type { FormSubmitEvent } from '@nuxt/ui'
import { z } from 'zod'

const { t } = useI18n()

useSeoMeta({
  title: () => t('app.admin.settings.environment.title'),
  description: () => t('app.admin.settings.environment.description')
})

const environment = reactive({
  TEST: 'test',
  PRODUCTION: 'production',
  DEVELOPMENT: 'development'
})

const state = ref(Object.entries(environment))

const schema = z.array(z.tuple([z.string(), z.string()]))

function onSubmit(event: FormSubmitEvent<z.infer<typeof schema>>) {
  Object.assign(environment, Object.fromEntries(event.data))
}
</script>

<template>
  <UCard>
    <template #header>
      <p class="text-sm">
        {{ t('app.admin.settings.environment.description') }}
      </p>
    </template>

    <UForm
      :state="state"
      :schema="schema"
      @submit="onSubmit"
    >
      <div class="flex flex-col gap-4">
        <div
          v-for="(item, index) of state"
          :key="'key-' + index"
          class="flex items-center gap-4"
        >
          <UFormField
            label="Key"
          >
            <UInput
              v-model="item[0]"
              :required="true"
            />
          </UFormField>
          <UFormField
            label="Label"
          >
            <UInput
              v-model="item[1]"
              :required="true"
            />
          </UFormField>
        </div>
      </div>
      <UButton
        type="submit"
        class="mt-4"
      >
        {{ t('app.admin.save') }}
      </UButton>
    </UForm>
  </UCard>
</template>
