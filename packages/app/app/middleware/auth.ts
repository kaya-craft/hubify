export default defineNuxtRouteMiddleware(() => {
  const { loggedIn } = useUserSession()
  if (!loggedIn.value) {
    return navigateToLocaleRoute('auth-login')
  }
})
