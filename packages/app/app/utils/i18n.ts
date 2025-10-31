import type { RouteLocationAsRelativeI18n } from 'vue-router'

export function navigateToLocaleRoute(routeName: string | RouteLocationAsRelativeI18n) {
  const localeRoute = useLocaleRoute()
  return navigateTo(localeRoute(routeName))
}
