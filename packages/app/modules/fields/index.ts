import { getDirectories, listDirFiles } from '@hubify/api/modules/schema/index'
import { writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { addImportsDir, addServerImportsDir, addTemplate, createResolver, defineNuxtModule, resolveModule, useLogger } from 'nuxt/kit'

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

    if (inputsDirs.length > 0) {
      logger.info(`Inputs directories: ${inputsDirs.join(', ')}`)
    }

    if (displaysDirs.length > 0) {
      logger.info(`Displays directories: ${displaysDirs.join(', ')}`)
    }

    addImportsDir(localResolve('./runtime/utils'))
    addServerImportsDir(localResolve('./runtime/utils'))

    const { dst: inputsPath } = addTemplate({
      filename: 'hubify/inputs.ts',
      getContents: () => createFieldsContent(inputsDirs),
      write: true
    })

    const { dst: displaysPath } = addTemplate({
      filename: 'hubify/displays.ts',
      getContents: () => createFieldsContent(displaysDirs),
      write: true
    })

    nuxt.hook('builder:watch', (event, path) => {
      if (event === 'add' || event === 'addDir' || event === 'unlink' || event === 'unlinkDir') {
        const isInputsFile = inputsDirs.some(dir => path.startsWith(dir))
        const isDisplaysFile = displaysDirs.some(dir => path.startsWith(dir))
        if (isInputsFile) {
          writeFileSync(inputsPath, createFieldsContent(inputsDirs))
        }
        if (isDisplaysFile) {
          writeFileSync(displaysPath, createFieldsContent(displaysDirs))
        }
      }
    })

    nuxt.options.nitro.alias ??= {}
    nuxt.options.nitro.alias['#hubify/inputs'] ??= inputsPath
    nuxt.options.nitro.alias['#hubify/displays'] ??= displaysPath

    nuxt.options.alias['#hubify/inputs'] ??= inputsPath
    nuxt.options.alias['#hubify/displays'] ??= displaysPath

    nuxt.options.typescript.tsConfig.vueCompilerOptions ??= {}
    nuxt.options.typescript.tsConfig.vueCompilerOptions.plugins ??= []
    nuxt.options.typescript.tsConfig.vueCompilerOptions.plugins.push(
      resolveModule('@hubify/vue-language-plugins')
    )
  }
})

/**
 * Generates the content for the fields file by importing all field components found in the specified directories.
 */
function createFieldsContent(fieldsDirs: string[]) {
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
