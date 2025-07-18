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
 * Current page title.
 */
const currentPageTitle = useTitle()

/**
 * Check if there are notifications.
 */
const hasNotifications = computed(() => {
  return false
})

/**
 * List of settings links for the admin dashboard.
 */
const settings = computed<NavigationMenuItem[]>(() =>
  [{
    label: t('app.admin.settings.title'),
    icon: 'i-lucide-settings',
    type: 'trigger',
    children: [{
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
 *
 * TODO: replace with actual collections when available.
 */
const collections = computed<NavigationMenuItem[]>(() => [
  {
    label: 'Users',
    icon: 'i-lucide-users',
    to: localeRoute({ name: 'admin', params: { collection: 'users' } }),
    exact: true
  },
  {
    label: 'Projects',
    icon: 'i-lucide-folder',
    to: localeRoute({ name: 'admin', params: { collection: 'projects' } }),
    exact: true
  },
  {
    label: 'Countries',
    icon: 'i-lucide-map-pin',
    to: localeRoute({ name: 'admin', params: { collection: 'countries' } }),
    exact: true
  }
])
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
            :items="collections"
            orientation="vertical"
            tooltip
            popover
          />
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

      <UDashboardPanel>
        <template #header>
          <UDashboardNavbar
            :title="currentPageTitle || ''"
            :ui="{ right: 'gap-3' }"
          >
            <template #leading>
              <UDashboardSidebarCollapse />
            </template>

            <template #right>
              <UTooltip
                :text="t('app.notifications')"
                :shortcuts="['N']"
              >
                <UButton
                  color="neutral"
                  variant="ghost"
                  square
                  @click="state.notifications = true"
                >
                  <UChip
                    color="error"
                    :show="hasNotifications"
                    inset
                  >
                    <UIcon
                      name="i-lucide-bell"
                      class="size-5 shrink-0"
                    />
                  </UChip>
                </UButton>
              </UTooltip>
            </template>
          </UDashboardNavbar>
        </template>

        <template #body>
          <NuxtPage />
        </template>
      </UDashboardPanel>

      <NotificationsSlideover />
    </UDashboardGroup>
  </UApp>
</template>
