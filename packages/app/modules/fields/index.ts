import { addImportsDir, addServerImportsDir, addTemplate, createResolver, defineNuxtModule, useLogger } from 'nuxt/kit'
import { listDirFiles, getDirectories } from '@hubify/api/modules/schema/index'
import { join } from 'node:path'
import { writeFileSync } from 'node:fs'

export interface FieldsModuleOptions {
  fields: string[]
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
    fields: [join(nuxt.options.dir.app, 'components', 'fields')]
  }),
  setup(options, nuxt) {
    const logger = useLogger('@hubify/fields')
    const fieldsDirs = getDirectories(options.fields)

    if (fieldsDirs.length > 0) {
      logger.info(`Fields directories: ${fieldsDirs.join(', ')}`)
    }

    addImportsDir(localResolve('./runtime/utils'))
    addServerImportsDir(localResolve('./runtime/utils'))

    const { dst: fieldsPath } = addTemplate({
      filename: 'hubify/fields.ts',
      getContents: () => createFieldsContent(fieldsDirs),
      write: true
    })

    nuxt.hook('builder:watch', (event, path) => {
      if (event === 'add' || event === 'addDir' || event === 'unlink' || event === 'unlinkDir') {
        const dirs = getDirectories(options.fields)
        const isFieldsFile = dirs.some(dir => path.startsWith(dir))
        if (isFieldsFile) {
          writeFileSync(fieldsPath, createFieldsContent(fieldsDirs))
        }
      }
    })

    nuxt.options.nitro.alias ??= {}
    nuxt.options.nitro.alias['#hubify/fields'] = fieldsPath
    nuxt.options.alias['#hubify/fields'] = fieldsPath
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
