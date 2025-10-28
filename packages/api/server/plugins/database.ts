import type { NitroApp } from 'nitropack'
import schema from '#hubify/schema'
import { runMigrations } from '@hubify/api/database/migration'

/**
 * Update schema upon modification.
 */
export default defineNitroPlugin(async (nitroApp) => {
  const { db } = useDatabase()

  await runMigrations(db, schema)

  if (await needsAdminUser()) {
    await createAdminUser()
  }

  await updateHubifyCollections(nitroApp)
})

/**
 * Update Hubify collections based on the current schema.
 */
async function updateHubifyCollections(nitroApp: NitroApp) {
  const { find } = useDatabase()

  const collections = await find('hubify_collections', {
    fields: ['name'],
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
async function needsAdminUser() {
  const { find } = useDatabase()

  return find('hubify_users', {
    where: {
      'role.admin': {
        $eq: true
      }
    },
    limit: 1
  }).then(users => users.length === 0)
}

/**
 * Seed the database with initial data.
 */
async function createAdminUser() {
  const { db, createOne } = useDatabase()

  try {
    console.info('Seeding the database with initial data...')

    const role = await createOne('hubify_roles', {
      name: 'Administrator',
      admin: true,
      description: 'Full access to the system',
      icon: 'heroicons:shield-check'
    })

    if (!role) throw new Error('Failed to create the Administrator role')

    await db('hubify_users').insert({
      firstname: 'Admin',
      email: 'admin@example.com',
      password: await hashPassword('password'),
      role: role.id
    })

    console.info('Database seeded with initial data')
  }
  catch (error) {
    console.error('Failed to seed the database:', error)
  }
}
