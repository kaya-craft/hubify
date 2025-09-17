<script setup lang="ts">
import type { NavigationMenuItem } from '@nuxt/ui'

/**
 * Open state for the sidebars.
 */
const state = reactive({
  sidebar: false,
  notifications: false
})

/**
 * Translation.
 */
const { t } = useI18n()

/**
 * Localized routes.
 */
const localeRoute = useLocaleRoute()

/**
 * List of settings links for the admin dashboard.
 */
const settings = computed<NavigationMenuItem[]>(() =>
  [{
    label: t('app.admin.settings.title'),
    icon: 'i-lucide-settings',
    type: 'trigger',
    children: [{
      label: t('app.admin.settings.collections.title'),
      to: localeRoute({ name: 'admin-items-collection', params: { collection: 'hubify_collections' } }),
      exact: true
    }, {
      label: t('app.admin.settings.general.title'),
      to: localeRoute({ name: 'admin-settings-general' }),
      exact: true
    }, {
      label: t('app.admin.settings.appearance.title'),
      to: localeRoute({ name: 'admin-settings-appearance' })
    }, {
      label: t('app.admin.settings.environment.title'),
      to: localeRoute({ name: 'admin-settings-environment' })
    }, {
      label: t('app.admin.settings.security.title'),
      to: localeRoute({ name: 'admin-settings-security' })
    }]
  }])

/**
 * List of collections.
 */
const { collections } = useCollections()

/**
   * Locale path.
   */
const localePath = useLocalePath()

/**
 * Format collections for navigation menu.
 */
const menuItems = computed(() => {
  return toValue(collections)?.items.map(collection => ({
    label: collection.name,
    icon: collection.icon || 'i-lucide-folder',
    color: collection.color || 'bg-gray-500',
    description: collection.description,
    displayTemplate: collection.displayTemplate,
    to: localePath({ name: 'admin-items-collection', params: { collection: collection.name } })
  }) as NavigationMenuItem)
})
</script>

<template>
  <UApp>
    <UDashboardGroup unit="rem">
      <UDashboardSidebar
        id="default"
        v-model:open="state.sidebar"
        collapsible
        resizable
        class="bg-elevated/25"
        :ui="{ footer: 'lg:border-t lg:border-default' }"
      >
        <template #default="{ collapsed }">
          <UDashboardSearchButton
            :collapsed="collapsed"
            :label="t('app.search.placeholder')"
            class="bg-transparent ring-default"
          />
          <UNavigationMenu
            :collapsed="collapsed"
            :items="menuItems"
            orientation="vertical"
            tooltip
            popover
            :ui="{ list: 'flex flex-col gap-2' }"
          >
            <template #item="{ item }">
              <div
                :style="`color: ${item.color}`"
                class="flex items-center gap-2"
              >
                <UIcon
                  :name="item.icon"
                  class="size-5"
                />
                <p class="text-md capitalize">
                  {{ item.label }}
                </p>
              </div>
            </template>
          </UNavigationMenu>
          <div class="flex-1" />
          <UNavigationMenu
            :collapsed="collapsed"
            :items="settings"
            orientation="vertical"
            tooltip
            popover
          />
        </template>

        <template #footer="{ collapsed }">
          <MenuUsers :collapsed="collapsed" />
        </template>
      </UDashboardSidebar>

      <UDashboardPanel
        :ui="{ body: 'flex flex-col gap-4 sm:gap-6 flex-1 overflow-y-auto p-0 sm:p-0' }"
      >
        <template #header>
          <UDashboardNavbar title="Countries" />
        </template>
        <template #body>
          <NuxtPage />
        </template>
      </UDashboardPanel>
    </UDashboardGroup>
  </UApp>
</template>
