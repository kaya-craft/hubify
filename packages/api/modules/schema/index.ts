import { extname, resolve, isAbsolute, join } from 'node:path'
import { existsSync } from 'node:fs'
import { addTemplate, createResolver, defineNuxtModule, updateRuntimeConfig, updateTemplates, useNuxt } from 'nuxt/kit'
import type { Knex } from 'knex'
import { scanDirExports } from 'unimport'

export interface HubifyModuleOptions extends Omit<Knex.Config, 'client'> {
  client: string
  schema: string[]
}

declare module '@nuxt/schema' {
  interface NuxtHooks {
    'hubify:schema': (files: { path: string, collection: string }[]) => void
  }
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
    const { dst: schema } = addTemplate({
      filename: 'hubify/schema.ts',
      write: true,
      getContents: () => generateSchemaContent(options.schema)
    })

    setupAliases(localResolve('./utils'), schema)

    const dirs = getSchemaDirectories(options.schema)

    nuxt.hook('builder:watch', async (_, path) => {
      const isSchemaFile = dirs.some(dir => path.startsWith(dir))
      if (!isSchemaFile) return
      updateTemplates({ filter: template => template.dst === schema })
    })

    updateRuntimeConfig({
      hubify: {
        db: options
      }
    })
  }
})

/**
 * Get all collection files.
 */
function getAllCollectionFiles(dirs: string[]) {
  const uniqueDirs = Array.from(new Set(dirs))
  return Promise.all(uniqueDirs.map(getCollectionsFromDir)).then(results => results.flat())
}

/**
 * Get all collection from a directory.
 */
async function getCollectionsFromDir(dir: string) {
  const list = await scanDirExports([join(dir, '**/*')], {
    filePatterns: ['*.ts', '*.js']
  })

  return list.filter(i => i.name === 'default').map(i => ({
    path: i.from.replace(extname(i.from), ''),
    collection: i.from.replace(dir + '/', '').replace(extname(i.from), '').split('/').join('_')
  }))
}

/**
 * Set up aliases.
 */
function setupAliases(utils: string, schema: string) {
  const nuxt = useNuxt()
  nuxt.options.nitro.alias ??= {}
  nuxt.options.alias ??= {}
  nuxt.options.nitro.alias['#hubify'] = utils
  nuxt.options.alias['#hubify'] = utils
  nuxt.options.nitro.alias['#hubify/schema'] = schema
  nuxt.options.alias['#hubify/schema'] = schema
}

/**
 * Update the database schema by running migrations and return the current schema.
 */
async function generateSchemaContent(dirs: string[]) {
  const nuxt = useNuxt()

  const files = await getAllCollectionFiles(dirs)

  await nuxt.callHook('hubify:schema', files)

  const collections = Array.from(new Set(files.map(f => f.collection))).sort()

  const imports: string[] = []
  const items: string[] = []

  for (const name of collections) {
    const match = files.filter(file => file.collection === name)

    if (match.length > 1) {
      imports.push(...match.map((file, index) => `import ${name}_${index} from '${file.path}'`))
      items.push(`\t${name}: Object.assign({}, ${match.map((_, index) => `${name}_${index}`).join(', ')}))`)
    }
    else {
      imports.push(`import ${name}_base from '${match[0]!.path}'`)
      items.push(`\t${name}: ${name}_base`)
    }
  }

  return [
    'import { normalizeSchema } from \'#hubify\'',
    ...imports,
    '',
    'const schema = normalizeSchema({\n' + items.join(',\n') + '\n})',
    '',
    ...collections.map(name => `export const ${name} = schema.${name}`),
    '',
    'export default schema'
  ].join('\n')
}

/**
 * Get schema directories from the Nuxt options.
 */
function getSchemaDirectories(schema: string[]) {
  const layers = useNuxt().options._layers.map(layer => layer.cwd)
  return [...new Set(schema.flatMap(dir => isAbsolute(dir) ? dir : layers.map(layer => resolve(layer, dir))).filter(dir => existsSync(dir)))]
}
