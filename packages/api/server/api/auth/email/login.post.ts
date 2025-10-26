import { z } from 'zod'

declare module '#auth' {
  interface AuthProviders {
    email: {
      email: string
      password: string
    }
  }
}

const invalidCredentialsError = createError({
  statusCode: 401,
  message: 'Invalid credentials'
})

export default defineEventHandler(async (event) => {
  const { find } = useDatabase()

  const { email, password } = await readValidatedBody(event, z.object({
    email: z.email(),
    password: z.string().min(8)
  }).parse)

  const [user] = await find('hubify_users', {
    where: {
      email: {
        $eq: email
      }
    },
    limit: 1
  })

  if (!user) {
    throw invalidCredentialsError
  }

  if (!(await verifyPassword(user.password, password))) {
    throw invalidCredentialsError
  }

  await setUserSession(event, {
    user: {
      email,
      id: user.id,
      firstname: user.firstname || '',
      lastname: user.lastname || ''
    },
    loggedInAt: Date.now()
  })

  return setResponseStatus(event, 201)
})
