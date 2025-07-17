<script setup lang="ts">
import type { FormSubmitEvent } from '@nuxt/ui'
import * as z from 'zod'

definePageMeta({
  layout: 'auth'
})

const { t } = useI18n()

useSeoMeta({
  title: t('app.auth.login.meta.title'),
  description: t('app.auth.login.meta.description')
})

const toast = useToast()

const fields = [{
  name: 'email',
  type: 'text' as const,
  label: t('app.form.email'),
  placeholder: t('app.form.email.placeholder'),
  required: true
}, {
  name: 'password',
  label: t('app.form.password'),
  type: 'password' as const,
  placeholder: t('app.form.password.placeholder')
}]

const providers = [{
  label: 'Google',
  icon: 'i-simple-icons-google',
  onClick: () => {
    toast.add({ title: 'Google', description: 'Login with Google' })
  }
}, {
  label: 'GitHub',
  icon: 'i-simple-icons-github',
  onClick: () => {
    toast.add({ title: 'GitHub', description: 'Login with GitHub' })
  }
}]

const schema = z.object({
  email: z.email(t('validations.email.invalid')),
  password: z.string().min(8, t('validations.password.min'))
})

type Schema = z.output<typeof schema>

function onSubmit(payload: FormSubmitEvent<Schema>) {
  console.log('Submitted', payload)
}
</script>

<template>
  <UAuthForm
    :fields="fields"
    :schema="schema"
    :providers="providers"
    :title="$t('app.auth.login.form.title')"
    :description="$t('app.auth.login.form.description')"
    :submit="{ label: $t('app.login.form.submit') }"
    icon="i-lucide-lock"
    @submit="onSubmit"
  >
    <template #description>
      {{ $t('app.auth.login.form.description') }}
      <ULink
        to="/auth/register"
        class="text-primary font-medium"
      >{{ $t('app.auth.login.form.register') }}</ULink>.
    </template>

    <template #password-hint>
      <ULink
        to="/"
        class="text-primary font-medium"
        tabindex="-1"
      >{{ $t('app.auth.login.form.forgotpassword') }}</ULink>
    </template>
  </UAuthForm>
</template>
