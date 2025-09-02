import { addImportsDir, addServerImportsDir, addTemplate, createResolver, defineNuxtModule, useLogger, useNuxt } from 'nuxt/kit'
import { resolve, isAbsolute, extname, join } from 'node:path'
import { existsSync, readdirSync, writeFileSync } from 'node:fs'

export interface HubifyModuleOptions {
  schema: string[]
}

const { resolve: localResolve } = createResolver(import.meta.url)

export default defineNuxtModule<HubifyModuleOptions>({
  meta: {
    name: '@hubify/schema',
    configKey: 'hubify'
  },
  defaults: nuxt => ({
    schema: [localResolve('../../schema'), join(nuxt.options.rootDir, 'schema')]
  }),
  setup(options, nuxt) {
    const logger = useLogger('@hubify/schema')
    const schemaDirs = getDirectories(options.schema)

    if (schemaDirs.length > 0) {
      logger.info(`Schema directories: ${schemaDirs.join(',')}`)
    }

    addImportsDir(localResolve('./runtime/utils'))
    addServerImportsDir(localResolve('./runtime/utils'))

    const { dst: schemaPath } = addTemplate({
      filename: 'hubify/schema.ts',
      getContents: () => createSchemaContent(schemaDirs),
      write: true
    })

    nuxt.hook('builder:watch', (event, path) => {
      if (event === 'add' || event === 'addDir' || event === 'unlink' || event === 'unlinkDir') {
        const schemaDirs = getDirectories(options.schema)
        const isSchemaFile = schemaDirs.some(dir => path.startsWith(dir))
        if (isSchemaFile) {
          writeFileSync(schemaPath, createSchemaContent(schemaDirs))
        }
      }
    })

    nuxt.options.nitro.alias ??= {}
    nuxt.options.nitro.alias['#hubify/schema'] = schemaPath
    nuxt.options.alias['#hubify/schema'] = schemaPath

    nuxt.options.runtimeConfig.hubify = {
      systemCollections: getSystemCollections(schemaDirs)
    }

    nuxt.options.runtimeConfig.public.hubify = {
      systemCollections: getSystemCollections(schemaDirs)
    }
  }
})

/**
 * Get the list of system collections.
 */
function getSystemCollections(schemaDirs: string[]) {
  const files = schemaDirs.flatMap(dir => listDirFiles(dir, '_', ['.ts', '.js']))
  const collections = [...new Set(files.map(file => file.name))]
  return collections.filter(name => name.startsWith('hubify_'))
}

/**
 * Get schema directories from the Nuxt options.
 */
export function getDirectories(schema: string[]) {
  const layers = useNuxt().options._layers.map(layer => layer.cwd)
  return [...new Set(schema.flatMap(dir => isAbsolute(dir) ? dir : layers.map(layer => resolve(layer, dir))).filter(dir => existsSync(dir)))]
}

/**
 * Recursively lists all files in a directory and its subdirectories.
 */
export function listDirFiles(dir: string, separator: string, extensions: string[], prepend = '') {
  const files: {
    path: string
    name: string
  }[] = []

  const items = readdirSync(dir, { withFileTypes: true })

  for (const item of items) {
    const ext = extname(item.name)
    const nameWithoutExt = item.name.replace(ext, '')
    const fullPath = resolve(dir, nameWithoutExt)
    const name = prepend ? `${prepend}${separator}${nameWithoutExt}` : nameWithoutExt

    if (item.isDirectory()) {
      files.push(...listDirFiles(fullPath, separator, extensions, name))
    }
    else if (item.isFile() && extensions.includes(ext)) {
      files.push({
        path: fullPath,
        name: name
      })
    }
  }

  return files
}

/**
 * Generates the content for the schema file by importing all schema files found in the specified directories.
 */
function createSchemaContent(schemaDirs: string[]) {
  const files = schemaDirs.flatMap(dir => listDirFiles(dir, '_', ['.ts', '.js']))
  const collections = [...new Set(files.map(file => file.name))]
  const data = collections.map((collection) => {
    const collectionFiles = files.filter(f => f.name === collection)
    const hasMultipleFiles = collectionFiles.length > 1

    if (hasMultipleFiles) {
      return {
        import: collectionFiles.map((file, index) => `import * as ${file.name}_${index} from '${file.path}'`).join('\n'),
        export: `${collection}: Object.assign({}, ${collectionFiles.map((file, index) => `${file.name}_${index}`).join(', ')})`
      }
    }

    const file = collectionFiles[0]

    if (!file) return

    return {
      import: `import * as ${file.name} from '${file.path}'`,
      export: file.name
    }
  }).filter((d): d is { import: string, export: string } => !!d)

  return [
    ...data.map(d => d.import),
    '\n',
    'export default {',
    data.map(d => '\t' + d.export).join(',\n'),
    '}'
  ].join('\n')
}
