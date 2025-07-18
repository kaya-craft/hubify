import { z } from 'zod'

export default defineEventHandler(async (event) => {
  const { createOne } = useDb()

  const { email, password } = await readValidatedBody(event, z.object({
    email: z.string().email(),
    password: z.string().min(8)
  }).parse)

  const hashedPassword = await hashPassword(password)

  await createOne('hubify_users', {
    email,
    password: hashedPassword
  })

  // @todo: Send a confirmation email to the user before logging them in.

  await setUserSession(event, {
    user: {
      email
    },
    loggedInAt: Date.now()
  })

  return setResponseStatus(event, 201)
})
