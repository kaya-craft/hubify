import type { Knex } from 'knex'
import type { FieldDefinition, Schema, TableDefinition } from './types'
import { getDataTypeCreator, type DataTypes } from './data-types'
import { getRelationForeignKey, isManyToManyRelation, isOneToManyRelation, isRelation } from './helpers'
import { SchemaInspector } from 'knex-schema-inspector'

/**
 * Run all migration steps sequentially.
 */
export async function runMigrations(knex: Knex, toSchema: Schema) {
  const migrations = createMigrations(knex, await getCurrentSchema(knex), toSchema)

  for (const migrate of migrations) {
    await migrate()
  }

  return migrations.length
}

/**
 * Create migration steps to transform the database schema from one version to another.
 */
export function createMigrations(knex: Knex, fromSchema: Schema | null, toSchema: Schema) {
  const migrations: (() => Knex.SchemaBuilder)[] = []

  if (!fromSchema) {
    Object.entries(toSchema).forEach(([tableName, tableDef]) => {
      migrations.push(() => createTable(knex, toSchema, tableName, tableDef))
    })
  }
  else {
    // Identify new tables to create
    Object.entries(toSchema).forEach(([tableName, tableDef]) => {
      if (!(tableName in fromSchema)) {
        migrations.push(() => createTable(knex, toSchema, tableName, tableDef))
      }
    })

    // Identify removed tables to drop
    Object.keys(fromSchema).forEach((tableName) => {
      if (!(tableName in toSchema)) {
        migrations.push(() => knex.schema.dropTableIfExists(tableName))
      }
    })

    // Identify modified tables (add/remove columns)
    Object.entries(toSchema).forEach(([tableName, toTableDef]) => {
      const fromTableDef = fromSchema[tableName]
      if (!fromTableDef) return

      const columns = Object.entries(fromTableDef).filter(([_, def]) => !isManyToManyRelation(def))

      // Identify new columns to add
      columns.forEach(([fieldName, fieldDef]) => {
        if (!(fieldName in fromTableDef)) {
          migrations.push(() => knex.schema.alterTable(tableName, (table) => {
            createColumn(knex, toSchema, table, tableName, fieldName, fieldDef)
          }))
        }
        else if (columnHasChanged(fromTableDef[fieldName], fieldDef)) {
          migrations.push(() => knex.schema.alterTable(tableName, (table) => {
            table.dropColumn(fieldName)
            createColumn(knex, toSchema, table, tableName, fieldName, fieldDef)
          }))
        }
      })

      // Identify removed columns to drop
      Object.keys(fromTableDef).forEach((fieldName) => {
        if (!(fieldName in toTableDef)) {
          migrations.push(() => knex.schema.alterTable(tableName, (table) => {
            table.dropColumn(fieldName)
          }))
        }
      })
    })
  }

  return migrations
}

/**
 * Create a table based on its definition.
 */
function createTable(knex: Knex, schema: Schema, name: string, definition: TableDefinition) {
  return knex.schema.createTable(name, (table) => {
    Object.entries(definition).forEach(([fieldName, fieldDef]) => {
      createColumn(knex, schema, table, name, fieldName, fieldDef)
    })
  })
}

/**
 * Create a column.
 */
function createColumn(knex: Knex, schema: Schema, table: Knex.CreateTableBuilder, tableName: string, name: string, definition: FieldDefinition) {
  // Many-to-many relations are handled via join tables, so we skip them here.
  if (isManyToManyRelation(definition) || isOneToManyRelation(definition)) return

  // For one-to-one, one-to-many, and many-to-one relations, we add a foreign key column.
  if (isRelation(definition)) {
    const foreignKey = getRelationForeignKey(schema, tableName, definition)
    if (!foreignKey) throw new Error(`Foreign key not found for relation: ${tableName}.${name}`)

    const foreignKeyDef = schema[definition.table]?.[foreignKey]
    if (!foreignKeyDef || 'table' in foreignKeyDef) throw new Error(`Foreign key definition not found or invalid for relation: ${name}.${name}`)

    const column = getDataTypeCreator(foreignKeyDef.type)(table, name, foreignKeyDef, true)
    if (!definition.nullable) column.notNullable()
    if (definition.unique) column.unique()
    setColumnDefault(knex, column, definition)

    table.foreign(name).references(foreignKey).inTable(definition.table).onDelete(definition.onDelete || 'CASCADE').onUpdate(definition.onUpdate || 'CASCADE')
  }
  else {
    const column = getDataTypeCreator(definition.type)(table, name, definition)
    if (!definition.nullable) column.notNullable()
    if (definition.unique) column.unique()
    if (definition.primary) {
      column.primary()
      if (definition.type === 'uuid' && definition.default === undefined) {
        column.defaultTo(knex.fn.uuid())
      }
    }
    setColumnDefault(knex, column, definition)
  }
}

/**
 * Set set the column default falue.
 */
function setColumnDefault(knex: Knex, column: Knex.ColumnBuilder, def: FieldDefinition) {
  if (typeof def.default === 'undefined') return
  if (def.default === null) return column.defaultTo(null)
  const match = String(def.default).match(/^{(\w+)}$/)
  if (match) return column.defaultTo(knex.raw(match[1]!))
  return column.defaultTo(def.default)
}

/**
 * Check if a column definition has changed.
 */
function columnHasChanged(oldDef: FieldDefinition | undefined, newDef: FieldDefinition) {
  if (!oldDef) return true

  if (isRelation(oldDef) && isRelation(newDef)) {
    return oldDef.table !== newDef.table
      || oldDef.type !== newDef.type
      || oldDef.onDelete !== newDef.onDelete
      || oldDef.onUpdate !== newDef.onUpdate
      || oldDef.nullable !== newDef.nullable
      || oldDef.unique !== newDef.unique
      /**
       * For now, we don't support changing default values via migrations.
       */
    // || oldDef.default !== newDef.default
      || ('foreignKey' in oldDef ? oldDef.foreignKey : undefined) !== ('foreignKey' in newDef ? newDef.foreignKey : undefined)
  }
  else if (!isRelation(oldDef) && !isRelation(newDef)) {
    return oldDef.type !== newDef.type
      || oldDef.nullable !== newDef.nullable
      || oldDef.unique !== newDef.unique
      /**
       * For now, we don't support changing default values via migrations.
       */
    // || oldDef.default !== newDef.default
      || oldDef.length !== newDef.length
      || oldDef.precision !== newDef.precision
      || oldDef.scale !== newDef.scale
  }

  return true
}

/**
 * Retrieve current schema from the database.
 */
export async function getCurrentSchema(knex: Knex) {
  const inspector = SchemaInspector(knex)
  const tables = await inspector.tables()
  const schema: Schema = {}

  for (const table of tables) {
    const columnsInfo = await inspector.columnInfo(table)
    const relations = await inspector.foreignKeys(table)
    const fields: Record<string, FieldDefinition> = {}

    for (const column of columnsInfo) {
      if (column.foreign_key_column) {
        const relation = relations.find(r => r.column === column.name)
        if (!relation) throw new Error(`Relation not found for foreign key column: ${table}.${column.name}`)
        fields[column.name] = {
          table: column.foreign_key_table!,
          foreignKey: column.foreign_key_column!,
          type: 'one-to-many',
          onDelete: relation.on_delete,
          onUpdate: relation.on_update,
          nullable: column.is_nullable,
          unique: column.is_unique,
          default: column.default_value ?? (!column.default_value && column.is_nullable ? null : undefined)
        }
      }
      else {
        fields[column.name] = {
          type: column.data_type as DataTypes,
          nullable: column.is_nullable,
          unique: column.is_unique,
          default: column.default_value ?? (!column.default_value && column.is_nullable ? null : undefined),
          length: column.max_length || undefined,
          precision: column.numeric_precision || undefined,
          scale: column.numeric_scale || undefined,
          primary: column.is_primary_key ?? false,
          autoIncrement: column.has_auto_increment ?? false
        }
      }
    }

    schema[table] = fields
  }

  return schema
}
