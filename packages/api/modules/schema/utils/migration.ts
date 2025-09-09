import { readFileSync } from 'node:fs'
import type { Knex } from 'knex'
import { createJiti } from 'jiti'
import { createUnimport } from 'unimport'
import { createResolver } from 'nuxt/kit'
import { listDirFiles } from './../index'

const jiti = createJiti(import.meta.url)

const { resolve } = createResolver(import.meta.url)

const unimport = createUnimport({
  imports: [{
    from: resolve('./../runtime/utils/define'),
    name: 'defineTable'
  }, {
    from: resolve('./../../../../app/modules/fields/runtime/utils/define'),
    name: 'defineFields'
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
        if (!(typeof mod.default === 'function')) {
          console.warn(`[hubify/schema] Migration ${migration.name} does not have a default export function.`)
          return knex.schema
        }

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
