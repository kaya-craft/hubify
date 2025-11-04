<script setup lang="ts">
const { t } = useI18n()

useSeoMeta({
  title: () => t('app.admin.settings.security.title'),
  description: () => t('app.admin.settings.security.description')
})

const { data: roles } = useItems('hubify_roles')

const { data: policies } = useItems('hubify_policies')

const { data: permissions } = useItems('hubify_permissions')
</script>

<template>
  <div class="grid grid-cols-1 gap-12 p-12">
    <div class="flex flex-col gap-6">
      <h2 class="col-span-2 text-2xl font-semibold">
        {{ t('app.admin.settings.security.roles.title') }}
      </h2>
      <UPageGrid>
        <UPageCard
          :title="t('app.admin.settings.security.roles.create.title')"
          :description="t('app.admin.settings.security.roles.create.description')"
          icon="heroicons:plus-circle"
          spotlight
          highlight
          :to="$localeRoute({ name: 'admin-items-collection-create', params: { collection: 'hubify_roles' } })"
        />
        <UPageCard
          v-for="(role, index) in roles"
          :key="index"
          :title="role.name"
          :description="role.description"
          :icon="role.icon"
          spotlight
          :to="$localeRoute({ name: 'admin-items-collection-id-edit', params: { collection: 'hubify_roles', id: role.id } })"
        />
      </UPageGrid>
    </div>
    <div class="flex flex-col gap-6">
      <h2 class="col-span-2 text-2xl font-semibold">
        {{ t('app.admin.settings.security.policies.title') }}
      </h2>
      <UPageGrid>
        <UPageCard
          :title="t('app.admin.settings.security.policies.create.title')"
          :description="t('app.admin.settings.security.policies.create.description')"
          icon="heroicons:plus-circle"
          spotlight
          highlight
          :to="$localeRoute({ name: 'admin-items-collection-create', params: { collection: 'hubify_policies' } })"
        />
        <UPageCard
          v-for="(policy, index) in policies"
          :key="index"
          :title="policy.name"
          :description="policy.description"
        />
      </UPageGrid>
    </div>
    <div class="flex flex-col gap-6">
      <h2 class="col-span-2 text-2xl font-semibold">
        {{ t('app.admin.settings.security.permissions.title') }}
      </h2>
      <UPageGrid>
        <UPageCard
          :title="t('app.admin.settings.security.permissions.create.title')"
          :description="t('app.admin.settings.security.permissions.create.description')"
          icon="heroicons:plus-circle"
          spotlight
          highlight
          :to="$localeRoute({ name: 'admin-items-collection-create', params: { collection: 'hubify_permissions' } })"
        />
        <UPageCard
          v-for="(permission, index) in permissions"
          :key="index"
          :title="permission.name"
        />
      </UPageGrid>
    </div>
  </div>
</template>
