import { z } from 'zod'

export default defineEventHandler(async (event) => {
  const { createOne } = useDatabase()

  const { email, password } = await readValidatedBody(event, z.object({
    email: z.email(),
    password: z.string().min(8)
  }).parse)

  const hashedPassword = await hashPassword(password)

  const dbUser = await createOne('hubify_users', {
    email,
    password: hashedPassword
  })

  // @todo: Send a confirmation email to the user before logging them in.

  await setUserSession(event, {
    user: {
      email,
      id: dbUser.id,
      firstname: dbUser.firstname || '',
      lastname: dbUser.lastname || ''
    },
    loggedInAt: Date.now()
  })

  return setResponseStatus(event, 201)
})
