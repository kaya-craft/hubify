import { getDirectories, listDirFiles } from '@hubify/api/modules/schema/index'
import { writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { useNuxt, addImportsDir, addTypeTemplate, addServerImportsDir, addTemplate, createResolver, defineNuxtModule, resolveModule, useLogger } from 'nuxt/kit'
import { scanExports } from 'unimport'

export interface FieldsModuleOptions {
  inputs: string[]
  displays: string[]
}

declare module '@hubify/api/modules/schema/index' {
  interface HubifyModuleOptions extends FieldsModuleOptions {}
}

const { resolve: localResolve } = createResolver(import.meta.url)

export default defineNuxtModule<FieldsModuleOptions>({
  meta: {
    name: '@hubify/fields',
    configKey: 'hubify'
  },
  defaults: nuxt => ({
    inputs: [join(nuxt.options.dir.app, 'components', 'inputs')],
    displays: [join(nuxt.options.dir.app, 'components', 'displays')]
  }),
  setup(options, nuxt) {
    const logger = useLogger('@hubify/fields')
    const inputsDirs = getDirectories(options.inputs)
    const displaysDirs = getDirectories(options.displays)
    const schemaDirs = getDirectories(nuxt.options.hubify.schema)

    if (inputsDirs.length > 0) {
      logger.info(`Inputs directories: ${inputsDirs.join(', ')}`)
    }

    if (displaysDirs.length > 0) {
      logger.info(`Displays directories: ${displaysDirs.join(', ')}`)
    }

    addImportsDir(localResolve('./runtime/utils'))
    addServerImportsDir(localResolve('./runtime/utils'))

    const { dst: fieldsPath } = addTemplate({
      filename: 'hubify/fields.ts',
      getContents: () => createFieldsContent(schemaDirs),
      write: true
    })

    const { dst: inputsPath } = addTemplate({
      filename: 'hubify/inputs.ts',
      getContents: () => createComponentContent(inputsDirs),
      write: true
    })

    const { dst: displaysPath } = addTemplate({
      filename: 'hubify/displays.ts',
      getContents: () => createComponentContent(displaysDirs),
      write: true
    })

    nuxt.hook('builder:watch', async (event, path) => {
      if (event === 'add' || event === 'addDir' || event === 'unlink' || event === 'unlinkDir') {
        const isInputsFile = inputsDirs.some(dir => path.startsWith(dir))
        const isDisplaysFile = displaysDirs.some(dir => path.startsWith(dir))
        const isSchemaFile = schemaDirs.some(dir => path.startsWith(dir))
        if (isInputsFile) {
          writeFileSync(inputsPath, createComponentContent(inputsDirs))
        }
        if (isDisplaysFile) {
          writeFileSync(displaysPath, createComponentContent(displaysDirs))
        }
        if (isSchemaFile) {
          writeFileSync(fieldsPath, await createFieldsContent(schemaDirs))
        }
      }
    })

    generateDefineField(nuxt.options.hubify.schema)

    nuxt.options.nitro.alias ??= {}
    nuxt.options.nitro.alias['#hubify/inputs'] = inputsPath
    nuxt.options.nitro.alias['#hubify/displays'] = displaysPath
    nuxt.options.nitro.alias['#hubify/fields'] = fieldsPath

    nuxt.options.alias['#hubify/inputs'] = inputsPath
    nuxt.options.alias['#hubify/displays'] = displaysPath
    nuxt.options.alias['#hubify/fields'] = fieldsPath

    nuxt.options.typescript.tsConfig.vueCompilerOptions ??= {}
    nuxt.options.typescript.tsConfig.vueCompilerOptions.plugins ??= []
    nuxt.options.typescript.tsConfig.vueCompilerOptions.plugins.push(
      resolveModule('@hubify/vue-language-plugins')
    )
  }
})

/**
 * Generates the content for the fields file by importing all schema files and exporting their fields.
 */
async function createFieldsContent(schemaDirs: string[]) {
  const files = await Promise.all(schemaDirs.flatMap(dir => listDirFiles(dir, '_', ['.ts', '.js'])).map((file) => {
    return scanExports(file.path + file.ext, false).then((list) => {
      const fields = list.find(i => i.as === 'fields')
      return fields ? { name: file.name, path: file.path } : null
    })
  }))

  const filesWithFields = files.filter(Boolean) as { name: string, path: string }[]
  const names = [...new Set(filesWithFields.map(file => file.name))]

  const content = names.flatMap((name) => {
    const match = filesWithFields.filter(file => file.name === name)

    if (match.length > 1) {
      return [
        ...filesWithFields.filter(file => file.name === name).map((file, index) => {
          return `import { fields as ${file.name}_fields_${index} } from '${file.path}'`
        }),
        `export const ${name} = Object.assign({}, ${match.map((file, index) => `${file.name}_fields_${index}`).join(', ')})`
      ]
    }

    return [
      `import { fields as ${name}_fields } from '${match[0]!.path}'`,
      `export const ${name} = ${name}_fields`
    ]
  })

  return [
    ...content,
    '',
    'export default {',
    names.map(name => `\t'${name}': ${name}`).join(',\n'),
    '}'
  ].join('\n\n')
}

/**
 * Generates the content for the fields file by importing all field components found in the specified directories.
 */
function createComponentContent(fieldsDirs: string[]) {
  const files = fieldsDirs.flatMap(dir => listDirFiles(dir, '-', ['.vue'])).reverse().filter((file, index, array) => {
    return array.findIndex(f => f.name === file.name) === index
  })
  const exports = files.map(file => `'${file.name}': () => import('${file.path}.vue').then(m => m.default || m)`)

  return [
    'export default {',
    exports.map(e => `\t${e}`).join(',\n'),
    '}'
  ].join('\n')
}

/**
 * Generate typescript config for fields definition.
 */
function generateDefineField(fieldsDirs: string[]) {
  const files = fieldsDirs.flatMap(dir => listDirFiles(dir, '_', ['.ts', '.js'])).reverse().filter((file, index, array) => {
    return array.findIndex(f => f.name === file.name) === index
  })

  for (const file of files) {
    const content = [
      'import type { TableColumns } from \'@hubify/api/types/database\'',
      'import type { FieldOptions } from \'@hubify/app/types/fields\'',
      'import type schema from \'./schema\'',
      '',
      'declare global {',
      '\tfunction defineFields<F extends FieldOptions<\'' + file.name + '\', TableColumns<typeof schema, \'' + file.name + '\'>>>(fields: F = {} as F): F',
      '}',
      '\n',
      'export {}'
    ].join('\n')

    addTypeTemplate({
      filename: `hubify/${file.name}.imports.d.ts`,
      getContents: () => content
    })

    addTemplate({
      filename: `hubify/tsconfig.${file.name}.json`,
      write: true,
      getContents: () => JSON.stringify({
        extends: '../tsconfig.json',
        compilerOptions: {
          composite: true,
          noEmit: false
        },
        include: [
          file.path + file.ext,
          './' + file.name + '.imports.d.ts'
        ]
      }, null, 2)
    })

    const nuxt = useNuxt()
    nuxt.options.typescript.sharedTsConfig ??= {}
    nuxt.options.typescript.sharedTsConfig.references ??= []
    nuxt.options.typescript.sharedTsConfig.references.push({
      path: `./hubify/tsconfig.${file.name}.json`
    })
  }
}
