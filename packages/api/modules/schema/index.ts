import { extname, resolve, isAbsolute, join } from 'node:path'
import { existsSync } from 'node:fs'
import { addTemplate, defineNuxtModule, updateRuntimeConfig, updateTemplates, useNuxt } from 'nuxt/kit'
import type { Knex } from 'knex'
import { scanDirExports } from 'unimport'

export interface HubifyModuleOptions extends Omit<Knex.Config, 'client'> {
  client: string
  schema: string[]
}

declare module '@nuxt/schema' {
  interface NuxtHooks {
    'hubify:schema': (files: { path: string, name: string }[]) => void
  }
}

export default defineNuxtModule<HubifyModuleOptions>({
  meta: {
    name: '@hubify/schema',
    configKey: 'hubify'
  },
  defaults: nuxt => ({
    schema: ['./schema'],
    client: 'better-sqlite3',
    useNullAsDefault: true,
    connection: {
      filename: join(nuxt.options.buildDir, 'hubify.sqlite')
    }
  }),
  async setup(options, nuxt) {
    const dirs = getDirectories(options.schema)

    const { dst: schema } = addTemplate({
      filename: 'hubify/schema.ts',
      write: true,
      getContents: () => generateSchemaContent(dirs)
    })

    nuxt.options.nitro.alias ??= {}
    nuxt.options.alias ??= {}
    nuxt.options.nitro.alias['#hubify/schema'] = schema
    nuxt.options.alias['#hubify/schema'] = schema

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
  return Promise.all(uniqueDirs.map(dir => getFilesFromDir(dir))).then(results => results.flat())
}

/**
 * Update the database schema by running migrations and return the current schema.
 */
async function generateSchemaContent(dirs: string[]) {
  const nuxt = useNuxt()

  const files = await getAllCollectionFiles(dirs)

  await nuxt.callHook('hubify:schema', files)

  const collections = Array.from(new Set(files.map(f => f.name))).sort()

  const imports: string[] = []
  const items: string[] = []

  let includeDefu = false

  for (const name of collections) {
    const match = files.filter(file => file.name === name)

    if (match.length > 1) {
      includeDefu = true
      imports.push(...match.map((file, index) => `import ${name}_${index} from '${file.path}'`))
      items.push(`\t${name}: defu(${match.map((_, index) => `${name}_${index}`).join(', ')})`)
    }
    else {
      imports.push(`import ${name}_base from '${match[0]!.path}'`)
      items.push(`\t${name}: ${name}_base`)
    }
  }

  return [
    'import { normalizeSchema } from \'@hubify/api/collections\'',
    includeDefu ? 'import { defu } from \'defu\'' : '',
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
 * Get all directories, including inside layers.
 */
export function getDirectories(schema: string[]) {
  const layers = useNuxt().options._layers.map(layer => layer.cwd)
  return [...new Set(schema.flatMap(dir => isAbsolute(dir) ? dir : layers.map(layer => resolve(layer, dir))).filter(dir => existsSync(dir)))]
}

/**
 * Get a list of default exports from a directory.
 */
export async function getFilesFromDir(dir: string, exportName: string | null = 'default', extensions = ['.ts', '.js'], delimiter = '_') {
  const list = await scanDirExports([join(dir, '**/*')], {
    filePatterns: extensions
  })

  return list.filter(i => exportName ? i.name === exportName : true).map(i => ({
    path: i.from.replace(extname(i.from), ''),
    name: i.from.replace(dir + '/', '').replace(extname(i.from), '').split('/').join(delimiter),
    ext: extname(i.from)
  }))
}
