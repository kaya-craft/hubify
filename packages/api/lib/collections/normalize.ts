import type { ColumnDefinition, FieldDefinition, RelationDefinition, Schema, TableDefinition } from '@hubify/api/database/types.d'
import { getRelationForeignKey, isRelation } from '@hubify/api/database/helpers'

/**
 * Normalize a schema by ensuring all optional properties are set to their default values.
 */
export function normalizeSchema<T extends Schema>(schema: T) {
  return Object.fromEntries(Object.entries(schema).map(([tableName, tableDef]) => [
    tableName,
    normalizeTableDefinition(schema, tableName, tableDef)
  ])) as NormalizedSchema<T>
}

/**
 * Normalize a table definition by ensuring all optional properties are set to their default values.
 */
export function normalizeTableDefinition<N extends string, T extends TableDefinition>(schema: Schema, tableName: N, tableDef: T) {
  return Object.fromEntries(Object.entries(tableDef).map(([fieldName, fieldDef]) => [
    fieldName,
    normalizeFieldDefinition(schema, tableName, fieldName, fieldDef)
  ]))
}

/**
 * Normalize a field definition by ensuring all optional properties are set to their default values.
 */
function normalizeFieldDefinition<N, F extends FieldDefinition>(schema: Schema, tableName: string, _fieldName: N, fieldDef: F) {
  if (isRelation(fieldDef)) {
    const baseRelation = {
      table: fieldDef.table,
      onDelete: fieldDef.onDelete || 'NO ACTION',
      onUpdate: fieldDef.onUpdate || 'NO ACTION',
      nullable: fieldDef.nullable ?? false,
      unique: fieldDef.unique ?? false,
      default: fieldDef.default
    }

    if (fieldDef.type === 'one-to-many') {
      return {
        ...baseRelation,
        type: fieldDef.type,
        foreignKey: getRelationForeignKey(schema as Schema, tableName, fieldDef)
      }
    }

    return {
      ...baseRelation,
      type: fieldDef.type,
      through: fieldDef.through,
      throughKey: fieldDef.throughKey
    }
  }

  return {
    type: fieldDef.type,
    primary: fieldDef.primary ?? false,
    autoIncrement: fieldDef.autoIncrement ?? false,
    nullable: fieldDef.nullable ?? false,
    unique: fieldDef.unique ?? false,
    default: fieldDef.default,
    length: fieldDef.length ?? (fieldDef.type === 'varchar' ? 255 : undefined),
    precision: fieldDef.precision,
    scale: fieldDef.scale
  }
}

type Prettify<T> = { [K in keyof T]: T[K] } & {}

type NormalizedSchema<T extends Schema> = Prettify<{
  [K in keyof T]: Prettify<{
    [F in keyof T[K]]: T[K][F] extends ColumnDefinition ? Prettify<T[K][F] & Omit<ColumnDefinition, keyof T[K][F]>> : T[K][F] extends RelationDefinition ? Prettify<T[K][F] & Omit<RelationDefinition, keyof T[K][F]>> : never
  }>
}>
