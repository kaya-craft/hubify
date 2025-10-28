import { getDirectories, getFilesFromDir } from '@hubify/api/modules/schema/index'
import { join, resolve } from 'node:path'
import { useNuxt, addTypeTemplate, addTemplate, defineNuxtModule, resolveModule, useLogger, updateTemplates } from 'nuxt/kit'
import { scanFilesFromDir } from 'unimport'

export interface FieldsModuleOptions {
  inputs?: string[]
  displays?: string[]
  schema?: string[]
}

declare module '@hubify/api/modules/schema/index' {
  interface HubifyModuleOptions extends FieldsModuleOptions {}
}

export default defineNuxtModule<FieldsModuleOptions>({
  meta: {
    name: '@hubify/fields',
    configKey: 'hubify'
  },
  defaults: () => ({
    inputs: ['./app/components/inputs'],
    displays: ['./app/components/displays'],
    schema: ['./schema']
  }),
  setup(options, nuxt) {
    const logger = useLogger('@hubify/fields')
    const inputsDirs = getDirectories(options.inputs || [])
    const displaysDirs = getDirectories(options.displays || [])
    const fieldsDirs = getDirectories(options.schema || [])

    if (inputsDirs.length > 0) {
      logger.info(`Inputs directories: ${inputsDirs.join(', ')}`)
    }

    if (displaysDirs.length > 0) {
      logger.info(`Displays directories: ${displaysDirs.join(', ')}`)
    }

    const { dst: inputsPath } = addTemplate({
      filename: 'hubify/inputs.ts',
      getContents: () => generateComponentContent(inputsDirs),
      write: true
    })

    const { dst: displaysPath } = addTemplate({
      filename: 'hubify/displays.ts',
      getContents: () => generateComponentContent(displaysDirs),
      write: true
    })

    const { dst: fieldsPath } = addTemplate({
      filename: 'hubify/fields.ts',
      getContents: () => generateFieldsContent(fieldsDirs),
      write: true
    })

    nuxt.hook('builder:watch', async (_, path) => {
      const isInputsFile = inputsDirs.some(dir => path.startsWith(dir))
      const isDisplaysFile = displaysDirs.some(dir => path.startsWith(dir))
      if (!isInputsFile && !isDisplaysFile) return
      updateTemplates({
        filter: template => template.dst === inputsPath || template.dst === displaysPath || template.dst === fieldsPath
      })
    })

    generateDefineField(fieldsDirs)

    nuxt.options.nitro.alias ??= {}
    nuxt.options.nitro.alias['#hubify/inputs'] ??= inputsPath
    nuxt.options.nitro.alias['#hubify/displays'] ??= displaysPath
    nuxt.options.nitro.alias['#hubify/fields'] ??= fieldsPath

    nuxt.options.alias['#hubify/inputs'] ??= inputsPath
    nuxt.options.alias['#hubify/displays'] ??= displaysPath
    nuxt.options.alias['#hubify/fields'] ??= fieldsPath

    nuxt.options.typescript.tsConfig.vueCompilerOptions ??= {}
    nuxt.options.typescript.tsConfig.vueCompilerOptions.plugins ??= []
    nuxt.options.typescript.tsConfig.vueCompilerOptions.plugins.push(
      resolveModule('@hubify/vue-language-plugins')
    )
  }
})

/**
 * Get all collection files.
 */
function getAllCollectionFiles(dirs: string[]) {
  const uniqueDirs = Array.from(new Set(dirs))
  return Promise.all(uniqueDirs.map(dir => getFilesFromDir(dir, 'fields'))).then(results => results.flat())
}

/**
 * Update the database schema by running migrations and return the current schema.
 */
async function generateFieldsContent(dirs: string[]) {
  const files = await getAllCollectionFiles(dirs)

  const collections = Array.from(new Set(files.map(f => f.name))).sort()
  const imports: string[] = []
  const items: string[] = []
  let includeDefu = false

  for (const name of collections) {
    const match = files.filter(file => file.name === name)

    if (match.length > 1) {
      includeDefu = true
      imports.push(...match.map((file, index) => `import { fields as ${name}_${index} } from '${file.path}'`))
      items.push(`\t${name}: defu(${match.map((_, index) => `${name}_${index}`).join(', ')})`)
    }
    else {
      imports.push(`import { fields as ${name}_base } from '${match[0]!.path}'`)
      items.push(`\t${name}: ${name}_base`)
    }
  }

  return [
    includeDefu ? 'import { defu } from \'defu\'' : '',
    'import type { TableFieldOptions } from \'@hubify/app/types/fields\'',
    ...imports,
    '',
    'const hubifyFields: { [K in TableNames]?: TableFieldOptions<K> } = {\n' + items.join(',\n') + '\n}',
    '',
    ...collections.map(name => `export const ${name} = hubifyFields.${name}`),
    '',
    'export default hubifyFields'
  ].join('\n')
}

/**
 * Generates the content for the fields file by importing all field components found in the specified directories.
 */
async function generateComponentContent(fieldsDirs: string[]) {
  const all = await Promise.all(fieldsDirs.flatMap((dir) => {
    return scanFilesFromDir({ glob: join(dir, '**/*') }, { filePatterns: ['.vue'] }).then(files => files.map(file => ({
      name: file.replace(dir, '').replace(/^\//, '').replace(/\.vue$/, ''),
      path: file
    })))
  }))

  const files = all.flat().reverse().filter((file, index, array) => {
    return array.findIndex(f => f.name === file.name) === index
  })

  const exports = files.map(file => `'${file.name}': () => import('${file.path}').then(m => m.default || m)`)

  return [
    'export default {',
    exports.map(e => `\t${e}`).join(',\n'),
    '}'
  ].join('\n')
}

/**
 * Generate typescript config for fields definition.
 */
async function generateDefineField(fieldsDirs: string[]) {
  const all = await Promise.all(fieldsDirs.flatMap(dir => getFilesFromDir(dir, 'fields')))

  const files = all.flat().reverse().filter((file, index, array) => {
    return array.findIndex(f => f.name === file.name) === index
  })

  for (const file of files) {
    const content = [
      'import type { TableColumns } from \'@hubify/api/types/schema\'',
      'import type { FieldOptions } from \'@hubify/app/types/fields\'',
      'import type schema from \'./../schema\'',
      '',
      'declare global {',
      '\texport function defineCollectionFields<const F extends FieldOptions<\'' + file.name + '\'>>(fields: F): F',
      '}',
      '\n',
      'export {}'
    ].join('\n')

    addTypeTemplate({
      filename: `hubify/types/${file.name}.imports.d.ts`,
      getContents: () => content
    })

    addTemplate({
      filename: `hubify/types/tsconfig.${file.name}.json`,
      write: true,
      getContents: () => JSON.stringify({
        extends: '../../tsconfig.json',
        compilerOptions: {
          composite: true,
          noEmit: false
        },
        include: [
          resolve('./lib/fields/index.ts'),
          file.path + file.ext,
          file.name + '.imports.d.ts'
        ]
      }, null, 2)
    })

    const nuxt = useNuxt()
    nuxt.options.typescript.sharedTsConfig ??= {}
    nuxt.options.typescript.sharedTsConfig.references ??= []
    nuxt.options.typescript.sharedTsConfig.references.push({
      path: `./hubify/types/tsconfig.${file.name}.json`
    })
  }
}
