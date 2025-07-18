import type { NuxtError } from '#app'
import type { AuthProviders } from '#auth'

type Provider = keyof AuthProviders

export default function () {
  const { fetch: fetchUserSession, clear } = useUserSession()

  async function login<P extends Provider>(
    provider: P,
    payload: AuthProviders[P],
    onSuccess?: () => void,
    onError?: (error: NuxtError<{ message: string }>) => void
  ) {
    try {
      await $fetch(`/api/auth/${provider}/login` as `/api/auth/${Provider}/login`, {
        method: 'post',
        body: payload
      })
      fetchUserSession()
      if (onSuccess) {
        onSuccess()
      }
    }
    catch (err) {
      if (onError) {
        onError(err as NuxtError<{ message: string }>)
      }
    }
  }

  async function register<P extends Provider>(
    provider: P,
    payload: AuthProviders[P],
    onSuccess?: () => void,
    onError?: (error: NuxtError<{ message: string }>) => void
  ) {
    try {
      await $fetch(`/api/auth/${provider}/register` as `/api/auth/${Provider}/register`, {
        method: 'post',
        body: payload
      })
      fetchUserSession()
      if (onSuccess) {
        onSuccess()
      }
    }
    catch (err) {
      if (onError) {
        onError(err as NuxtError<{ message: string }>)
      }
    }
  }

  function logout() {
    clear()
    return navigateToLocaleRoute('index')
  }

  return {
    login,
    logout,
    register
  }
}
