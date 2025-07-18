import { addImportsDir, addServerImportsDir, addTemplate, createResolver, defineNuxtModule, useLogger } from 'nuxt/kit'
import { resolve, isAbsolute, extname } from 'node:path'
import { existsSync, readdirSync, writeFileSync } from 'node:fs'

interface SchemaModuleOptions {
  folders: string[]
}

const { resolve: localResolve } = createResolver(import.meta.url)

export default defineNuxtModule<SchemaModuleOptions>({
  meta: {
    name: '@hubify/schema',
    configKey: 'schema'
  },
  defaults: () => ({
    folders: [localResolve('../../schema'), './schema']
  }),
  setup(options, nuxt) {
    const logger = useLogger('@hubify/schema')
    const folders = Array.isArray(options.folders) ? options.folders : [options.folders]
    const schemaDirs = getSchemaDirs(folders, nuxt.options.rootDir)

    if (schemaDirs.length === 0) {
      logger.warn('No schema directories found. Please check your configuration.')
      return
    }

    addImportsDir(localResolve('./runtime/utils'))
    addServerImportsDir(localResolve('./runtime/utils'))

    logger.info(`Schema directories: ${schemaDirs.join(', ')}`)

    const { dst: schemaPath } = addTemplate({
      filename: 'hubify/schema.ts',
      getContents: () => createContent(schemaDirs),
      write: true
    })

    nuxt.hook('builder:watch', (event, path) => {
      if (event === 'add' || event === 'addDir' || event === 'unlink' || event === 'unlinkDir') {
        const schemaDirs = getSchemaDirs(folders, nuxt.options.rootDir)
        const isSchemaFile = schemaDirs.some(dir => path.startsWith(dir))
        if (isSchemaFile) {
          writeFileSync(schemaPath, createContent(schemaDirs))
        }
      }
    })

    nuxt.options.nitro.alias ??= {}
    nuxt.options.nitro.alias['#hubify/schema'] = schemaPath
    nuxt.options.alias['#hubify/schema'] = schemaPath
  }
})

/**
 * Get schema directories from the Nuxt options.
 */
function getSchemaDirs(folders: string[], rootDir: string) {
  return folders.map(dir => isAbsolute(dir) ? dir : resolve(rootDir, dir)).filter(dir => existsSync(dir))
}

/**
 * Recursively lists all files in a directory and its subdirectories.
 */
function listDirFiles(dir: string, prepend = '') {
  const files: {
    path: string
    collection: string
  }[] = []

  const items = readdirSync(dir, { withFileTypes: true })

  for (const item of items) {
    const ext = extname(item.name)
    const name = item.name.replace(ext, '')
    const fullPath = resolve(dir, name)
    const collection = prepend ? `${prepend}_${name}` : name

    if (item.isDirectory()) {
      files.push(...listDirFiles(fullPath, collection))
    }
    else if (item.isFile() && ['.ts', '.js'].includes(ext)) {
      files.push({
        path: fullPath,
        collection: collection
      })
    }
  }

  return files
}

/**
 * Generates the content for the schema file by importing all schema files found in the specified directories.
 */
function createContent(schemaDirs: string[]) {
  const files = schemaDirs.flatMap(dir => listDirFiles(dir))
  const collections = [...new Set(files.map(file => file.collection))]
  const data = collections.map((collection) => {
    const collectionFiles = files.filter(f => f.collection === collection)
    const hasMultipleFiles = collectionFiles.length > 1

    if (hasMultipleFiles) {
      return {
        import: collectionFiles.map((file, index) => `import * as ${file.collection}_${index} from '${file.path}'`).join('\n'),
        export: `${collection}: Object.assign({}, ${collectionFiles.map((file, index) => `${file.collection}_${index}`).join(', ')})`
      }
    }

    const file = collectionFiles[0]

    if (!file) return

    return {
      import: `import * as ${file.collection} from '${file.path}'`,
      export: file.collection
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
