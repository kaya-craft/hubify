import type { NitroApp } from 'nitropack'
import schema from '#hubify/schema'
import type { Schema } from '@hubify/api/types/database'

/**
 * Update schema upon modification.
 */
export default defineNitroPlugin(async (nitroApp) => {
  if (needsInitialSeed(schema)) {
    await seedDatabase()
  }

  await updateHubifyCollections(nitroApp)
})

/**
 * Update Hubify collections based on the current schema.
 */
async function updateHubifyCollections(nitroApp: NitroApp) {
  const { find } = useDatabase()

  const collections = await find('hubify_collections', {
    columns: ['name'],
    where: {
      name: {
        $nstartsWith: 'hubify_'
      }
    }
  })

  const collectionsNames = collections.map(c => c.name)

  const schemaTablesNames = Object.keys(schema).filter(t => !t.startsWith('hubify_'))

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
  const { db } = useDatabase()

  try {
    await db.transaction(async () => {
      const role = await db('hubify_roles').insert({
        name: 'Administrator',
        admin: true,
        description: 'Full access to the system',
        icon: 'heroicons:shield-check'
      }).first()

      if (!role) throw new Error('Failed to create the Administrator role')

      await db('hubify_users').insert({
        firstname: 'Admin',
        email: 'admin@example.com',
        password: await hashPassword('password'),
        role: role
      })

      console.info('Database seeded with initial data')
    })
  }
  catch (error) {
    console.error('Failed to seed the database:', error)
  }
}
