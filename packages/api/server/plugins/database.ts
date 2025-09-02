import type { Schema } from '@hubify/restql'

/**
 * Update schema upon modification.
 */
export default defineNitroPlugin(async () => {
  const { schema, updateSchema, retrieveSchema } = useDb()

  const currentSchema = await retrieveSchema()

  await updateSchema(schema)

  if (needsInitialSeed(currentSchema)) {
    await seedDatabase()
  }
})

/**
 * Check if the database needs initial seeding.
 */
function needsInitialSeed(currentSchema: Schema | null) {
  if (!currentSchema) return true

  const { hubify } = useRuntimeConfig()

  return hubify.systemCollections.some(collection => !(collection in currentSchema))
}

/**
 * Seed the database with initial data.
 */
async function seedDatabase() {
  const db = useDb()

  try {
    await db.transaction(async () => {
      const role = await db.createOne('hubify_roles', {
        name: 'Administrator',
        admin: true,
        description: 'Full access to the system',
        icon: 'heroicons:shield-check'
      }) as TableItem<'hubify_roles'>

      await db.createOne('hubify_users', {
        email: 'admin@example.com',
        password: await hashPassword('admin'),
        role: role.id
      })

      console.info('Database seeded with initial data')
    })
  }
  catch (error) {
    console.error('Failed to seed the database:', error)
  }
}
