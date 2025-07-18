import type { RouteLocationAsRelativeI18n } from 'vue-router'
import type { RouteNamedMapI18n } from 'vue-router/auto-routes'

export function navigateToLocaleRoute(routeName: keyof RouteNamedMapI18n | RouteLocationAsRelativeI18n) {
  const localeRoute = useLocaleRoute()
  return navigateTo(localeRoute(routeName))
}
