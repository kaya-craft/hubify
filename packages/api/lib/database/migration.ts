import type { Knex } from 'knex'
import type { TableNames, FieldDefinition, Schema, TableDefinition, ColumnDefinition } from './types'
import { getDataTypeCreator, type DataTypes } from './data-types'
import { getRelationForeignKey, isColumn, isManyToManyRelation, isRelation, isOneToManyRelation } from './helpers'
import { SchemaInspector } from 'knex-schema-inspector'
import type { Table as TableInfo } from 'knex-schema-inspector/dist/types/table'
import type { Column } from 'knex-schema-inspector/dist/types/column'

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
export function createMigrations<S extends Schema>(knex: Knex, fromSchema: Schema | null, toSchema: S) {
  const migrations: (() => Knex.SchemaBuilder)[] = []

  const entries = Object.entries(toSchema) as [TableNames<S>, TableDefinition][]

  if (!fromSchema) {
    entries.forEach(([tableName, tableDef]) => {
      migrations.push(() => createTable(knex, toSchema, tableName, tableDef))
    })
  }
  else {
    // Identify new tables to create
    entries.forEach(([tableName, tableDef]) => {
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
    entries.forEach(([tableName, toTableDef]) => {
      const fromTableDef = fromSchema[tableName as TableNames<typeof fromSchema>]
      if (!fromTableDef) return

      const columns = Object.entries(fromTableDef).filter(([_, def]) => !isManyToManyRelation(def)) as [string, FieldDefinition][]

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
function createTable<S extends Schema, T extends TableNames<S>>(knex: Knex, schema: S, name: T, definition: TableDefinition) {
  return knex.schema.createTable(name, (table) => {
    Object.entries(definition).forEach(([fieldName, fieldDef]) => {
      createColumn(knex, schema, table, name, fieldName, fieldDef)
    })
  })
}

/**
 * Create a column.
 */
function createColumn<S extends Schema, T extends TableNames<S>>(knex: Knex, schema: S, table: Knex.CreateTableBuilder, tableName: T, name: string, definition: FieldDefinition) {
  // Many-to-many relations are handled via join tables, so we skip them here.
  if (isManyToManyRelation(definition) || isOneToManyRelation(definition)) return
  // For one-to-one, one-to-many, and many-to-one relations, we add a foreign key column.
  if (isRelation<S>(definition)) {
    const foreignKey = getRelationForeignKey(schema, tableName, definition)
    if (!foreignKey) throw new Error(`Foreign key not found for relation: ${tableName}.${name}`)

    const foreignKeyDef = schema[definition.table][foreignKey as keyof TableDefinition] as ColumnDefinition | undefined
    if (!foreignKeyDef || isRelation(foreignKeyDef)) throw new Error(`Foreign key definition not found or invalid for relation: ${name}.${name}`)

    const column = getDataTypeCreator(foreignKeyDef.type)(table, name, foreignKeyDef, knex, true)
    if (!definition.nullable) column.notNullable()
    if (definition.unique) column.unique()
    setColumnDefault(knex, column, definition)

    table.foreign(name).references(foreignKey).inTable(definition.table).onDelete(definition.onDelete || 'CASCADE').onUpdate(definition.onUpdate || 'CASCADE')
  }
  else if (isColumn<S>(definition)) {
    const column = getDataTypeCreator(definition.type)(table, name, definition, knex, false)
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

  if (shouldSkipColumnComparison(newDef)) {
    return false
  }

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
      || oldDef.options?.toString() !== newDef.options?.toString()
  }

  return true
}

/**
 * Determine if column comparison should be skipped.
 */
export function shouldSkipColumnComparison(def: FieldDefinition) {
  const skipTypes = ['enum-array', 'one-to-many', 'many-to-many']
  return skipTypes.includes(def.type)
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
    const info = await inspector.tableInfo(table)

    for (const column of columnsInfo) {
      if (column.foreign_key_column) {
        const relation = relations.find(r => r.column === column.name)
        if (!relation) throw new Error(`Relation not found for foreign key column: ${table}.${column.name}`)
        fields[column.name] = {
          table: column.foreign_key_table!,
          foreignKey: column.foreign_key_column!,
          type: 'many-to-one',
          onDelete: relation.on_delete,
          onUpdate: relation.on_update,
          nullable: column.is_nullable,
          unique: isUnique(knex, info, column),
          default: getDefaultValue(knex, info, column)
        }
      }
      else {
        fields[column.name] = {
          type: getDataType(knex, info, column),
          nullable: column.is_nullable,
          unique: isUnique(knex, info, column),
          default: getDefaultValue(knex, info, column),
          length: column.max_length || undefined,
          precision: column.numeric_precision || undefined,
          scale: column.numeric_scale || undefined,
          primary: column.is_primary_key ?? false,
          autoIncrement: column.has_auto_increment ?? false,
          options: getEnumOptions(knex, info, column)
        }
      }
    }

    Object.assign(schema, { [table]: fields })
  }

  return schema
}

/**
 * Get data type from database column type.
 */
function getDataType(knex: Knex, table: TableInfo, column: Column) {
  if (isUuid(knex, table, column)) {
    return 'uuid'
  }

  if (isEnum(knex, table, column)) {
    return 'enum'
  }

  return column.data_type.toLowerCase() as DataTypes
}

/**
 * Get enum options from database column.
 */
function getEnumOptions(_knex: Knex, table: TableInfo, column: Column) {
  const regexp = new RegExp(`check \\(\`${column.name}\` in \\(([^)]+)\\)\\)`)
  const match = table.sql?.match(regexp)
  if (!match) return undefined

  return match[1]!.split(',').map(opt => opt.trim().replace(/^'/, '').replace(/'$/, ''))
}

/**
 * Get default value from database column.
 */
function getDefaultValue(knex: Knex, table: TableInfo, column: Column) {
  if (isUuid(knex, table, column) || column.default_value === null || column.default_value === undefined) {
    return undefined
  }

  if (column.default_value === knex.fn.now().toQuery()) {
    return `{${column.default_value}}`
  }

  if (column.default_value === '0') {
    return false
  }

  if (column.default_value === '1') {
    return true
  }

  return column.default_value
}

/**
 * Check if a column is of enum type.
 */
function isEnum(knex: Knex, table: TableInfo, column: Column) {
  return column.data_type.toLowerCase() === 'enum' || getEnumOptions(knex, table, column)?.length
}

/**
 * Get data uniqueness from database column.
 */
function isUnique(knex: Knex, table: TableInfo, column: Column) {
  if (isUuid(knex, table, column)) {
    return true
  }

  return column.is_unique || false
}

/**
 * Check if a column is of UUID type.
 */
function isUuid(knex: Knex, _table: TableInfo, column: Column) {
  return column.data_type.toLowerCase() === 'uuid' || column.default_value === knex.fn.uuid().toQuery().replace(/^\(/, '').replace(/\)$/, '')
}
