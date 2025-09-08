import { addImportsDir, addServerImportsDir, addTemplate, addTypeTemplate, createResolver, defineNuxtModule, useLogger, useNuxt } from 'nuxt/kit'
import { resolve, isAbsolute, join } from 'node:path'
import { existsSync, writeFileSync } from 'node:fs'
import type { Knex } from 'knex'
import type { Column } from 'knex-schema-inspector/dist/types/column'
import { MigrationSource } from './utils/migration'
import { generateSchemaTypes } from './utils/schema/types'
import { generateSchemaContent } from './utils/schema/content'
import { createDatabaseInstance } from './utils/database'

export interface HubifyModuleOptions extends Knex.Config {
  schema: string[]
}

const { resolve: localResolve } = createResolver(import.meta.url)

export default defineNuxtModule<HubifyModuleOptions>({
  meta: {
    name: '@hubify/schema',
    configKey: 'hubify'
  },
  defaults: nuxt => ({
    schema: [localResolve('../../schema'), join(nuxt.options.rootDir, 'schema')],
    client: 'better-sqlite3',
    useNullAsDefault: true,
    connection: {
      filename: join(nuxt.options.buildDir, 'hubify.sqlite')
    }
  }),
  async setup(options, nuxt) {
    const logger = useLogger('@hubify/schema')
    const schemaDirs = getDirectories(options.schema)

    if (schemaDirs.length > 0) {
      logger.info(`Schema directories: ${schemaDirs.join(',')}`)
    }

    addImportsDir(localResolve('./runtime/utils'))
    addServerImportsDir(localResolve('./runtime/utils'))

    const schema = await updateDatabaseSchema(schemaDirs, options)

    const { dst: schemaFile } = addTemplate({
      filename: 'hubify/schema.mjs',
      getContents: async () => generateSchemaContent(schema)
    })

    const { dst: schemaTypesFile } = addTypeTemplate({
      filename: 'hubify/schema.d.ts',
      getContents: async () => generateSchemaTypes(schema)
    })

    nuxt.options.nitro.alias ??= {}
    nuxt.options.nitro.alias['#hubify/schema'] = schemaTypesFile
    nuxt.options.alias['#hubify/schema'] = schemaTypesFile

    nuxt.hook('builder:watch', async (event, path) => {
      if (event === 'add' || event === 'addDir' || event === 'unlink' || event === 'unlinkDir') {
        const schemaDirs = getDirectories(options.schema)
        const isSchemaFile = schemaDirs.some(dir => path.startsWith(dir))
        if (isSchemaFile) {
          const schema = await updateDatabaseSchema(schemaDirs, options)
          writeFileSync(schemaFile, generateSchemaContent(schema))
          writeFileSync(schemaTypesFile, generateSchemaTypes(schema))
        }
      }
    })

    nuxt.options.runtimeConfig.hubify = {
      db: options,
      systemCollections: getSystemCollections(schema)
    }

    nuxt.options.runtimeConfig.public.hubify = {
      systemCollections: getSystemCollections(schema)
    }
  }
})

/**
 * Update the database schema by running migrations and return the current schema.
 */
async function updateDatabaseSchema(dirs: string[], dbConfig: Knex.Config) {
  const { db, getSchema } = createDatabaseInstance(dbConfig)

  await db.migrate.latest({
    tableName: 'hubify_migrations',
    migrationSource: new MigrationSource(dirs)
  })

  console.log('Database migrated to the latest version.')

  return await getSchema()
}

/**
 * Get the list of system collections.
 */
function getSystemCollections(schema: Record<string, Record<string, Column>>) {
  return Object.keys(schema).filter(name => name.startsWith('hubify_'))
}

/**
 * Get schema directories from the Nuxt options.
 */
export function getDirectories(schema: string[]) {
  const layers = useNuxt().options._layers.map(layer => layer.cwd)
  return [...new Set(schema.flatMap(dir => isAbsolute(dir) ? dir : layers.map(layer => resolve(layer, dir))).filter(dir => existsSync(dir)))]
}
