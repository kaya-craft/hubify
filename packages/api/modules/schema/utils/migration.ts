import { extname } from 'node:path'
import { readdirSync, readFileSync } from 'node:fs'
import type { Knex } from 'knex'
import { createJiti } from 'jiti'
import { createUnimport } from 'unimport'
import { createResolver } from 'nuxt/kit'

const jiti = createJiti(import.meta.url)
const { resolve } = createResolver(import.meta.url)

const unimport = createUnimport({
  imports: [{
    from: resolve('./../runtime/utils/define'),
    name: 'defineTable'
  }]
})

/**
 * A custom migration source for Knex that loads migration files from specified directories.
 */
export class MigrationSource {
  constructor(private dirs: string[]) { }

  async importMigration({ path, ext }: { path: string, name: string, ext: string }) {
    const { code } = await unimport.injectImports(readFileSync(path + ext, 'utf-8'))

    return jiti.evalModule(code, {
      ext,
      filename: path
    }) as {
      default?: (table: Knex.CreateTableBuilder, knex: Knex) => Promise<void>
      drop?: (knex: Knex) => Promise<void>
    }
  }

  getMigrations() {
    return Promise.resolve(this.dirs.flatMap(dir => listDirFiles(dir, '_', ['.ts', '.js'])))
  }

  getMigrationName(migration: { path: string, name: string }) {
    return migration.name
  }

  async getMigration(migration: { path: string, name: string, ext: string }) {
    const mod = await this.importMigration(migration)

    return {
      up(knex: Knex) {
        if (!mod.default) console.warn(`[hubify/schema] Migration ${migration.name} does not have a default export function.`)

        return knex.schema.createTable(migration.name, table => mod.default?.(table, knex))
      },
      down(knex: Knex) {
        if (mod.drop) {
          return mod.drop(knex)
        }

        return knex.schema.dropTableIfExists(migration.name)
      }
    }
  }
}

/**
 * Recursively lists all files in a directory and its subdirectories.
 */
function listDirFiles(dir: string, separator: string, extensions: string[], prepend = '') {
  const files: {
    path: string
    ext: string
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
        ext: ext,
        name: name
      })
    }
  }

  return files
}
