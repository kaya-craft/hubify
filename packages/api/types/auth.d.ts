declare module '#auth-utils' {
  interface User {
    id: number | string
    webauthn?: string
    email?: string
    firstname?: string
    lastname?: string
    password?: string
    github?: string
    google?: string
    auth0?: string
    microsoft?: string
    apple?: string
    slack?: string
  }

  interface UserSession {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    extended?: any
    jwt?: {
      accessToken: string
      refreshToken: string
    }
    loggedInAt: number
    user: Pick<User, 'id' | 'email' | 'firstname' | 'lastname'>
  }

  interface SecureSessionData {
  }
}
