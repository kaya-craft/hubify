import type { Schema } from '@hubify/restql'
import type { NitroApp } from 'nitropack'
/**
 * Update schema upon modification.
 */
export default defineNitroPlugin(async (nitroApp) => {
  const { schema, updateSchema, retrieveSchema } = useDb()

  const currentSchema = await retrieveSchema()

  await updateSchema(schema)

  if (needsInitialSeed(currentSchema)) {
    await seedDatabase()
  }

  await updateHubifyCollections(nitroApp)
})

/**
 * Update Hubify collections based on the current schema.
 * @returns {Promise<void>}
 */
async function updateHubifyCollections(nitroApp: NitroApp) {
  const { schema, find } = useDb()

  const collections = await find('hubify_collections', {
    columns: ['name']
  })

  const collectionsNames = collections.map(c => c.name)

  const schemaTablesNames = Object.keys(schema)

  const diff = schemaTablesNames.filter(name => !collectionsNames.includes(name))

  if (diff.length === 0) return

  for await (const table of diff) {
    await nitroApp.hooks.callHook('hubify:table:created', { table })
  }
}

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
        firstname: 'Admin',
        email: 'admin@example.com',
        password: await hashPassword('password'),
        role: role.id
      })

      console.info('Database seeded with initial data')
    })
  }
  catch (error) {
    console.error('Failed to seed the database:', error)
  }
}
