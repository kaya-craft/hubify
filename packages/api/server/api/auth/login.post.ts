import { z } from 'zod'

interface DBUser {
  id: number
  email: string
  password: string
}

const invalidCredentialsError = createError({
  statusCode: 401,
  message: 'Invalid credentials',
})

export default defineEventHandler(async (event) => {
  const db = useDatabase()

  const { email, password } = await readValidatedBody(event, z.object({
    email: z.email(),
    password: z.string().min(8),
  }).parse)

  const user = await db.sql<{ rows: DBUser[] }>`SELECT * FROM hubify_users WHERE email = ${email}`.then(result => result.rows[0])

  if (!user) {
    throw invalidCredentialsError
  }

  if (!(await verifyPassword(user.password, password))) {
    throw invalidCredentialsError
  }

  await setUserSession(event, {
    user: {
      email,
    },
    loggedInAt: Date.now(),
  })

  return setResponseStatus(event, 201)
})