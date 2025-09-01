import type { RouteLocationAsRelativeI18n, RouteNamedMapI18n } from 'vue-router'

export function navigateToLocaleRoute(routeName: keyof RouteNamedMapI18n | RouteLocationAsRelativeI18n) {
  const localeRoute = useLocaleRoute()
  return navigateTo(localeRoute(routeName))
}
