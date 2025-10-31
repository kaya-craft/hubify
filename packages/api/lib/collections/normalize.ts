import type { ColumnDefinition, FieldDefinition, Prettify, RelationDefinition, Schema, TableDefinition, TableFieldNames, TableNames } from '@hubify/api/database/types.d'
import { getRelationForeignKey, isColumn } from '@hubify/api/database/helpers'

/**
 * Normalize a schema by ensuring all optional properties are set to their default values.
 */
export function normalizeSchema<S extends Schema>(schema: S) {
  return Object.fromEntries(Object.entries(schema).map(([tableName, tableDef]) => [
    tableName,
    normalizeTableDefinition(schema, tableName as TableNames<S>, tableDef)
  ])) as NormalizedSchema<S>
}

/**
 * Normalize a table definition by ensuring all optional properties are set to their default values.
 */
export function normalizeTableDefinition<S extends Schema, T extends TableNames<S>, D extends TableDefinition>(schema: S, tableName: T, tableDef: D) {
  return Object.fromEntries(Object.entries(tableDef).map(([fieldName, fieldDef]) => [
    fieldName,
    normalizeFieldDefinition(schema, tableName, fieldName as TableFieldNames<S, T>, fieldDef)
  ]))
}

/**
 * Normalize a field definition by ensuring all optional properties are set to their default values.
 */
function normalizeFieldDefinition<S extends Schema, T extends TableNames<S>, F extends TableFieldNames<S, T>, D extends FieldDefinition>(schema: S, tableName: T, _fieldName: F, fieldDef: D) {
  if (isColumn<S>(fieldDef)) {
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
      foreignKey: getRelationForeignKey(schema, tableName, fieldDef)
    }
  }

  return {
    ...baseRelation,
    type: fieldDef.type,
    through: fieldDef.through,
    throughKey: fieldDef.throughKey
  }
}

export type NormalizedSchema<T extends Schema> = Prettify<{
  [K in keyof T]: Prettify<{
    [F in keyof T[K]]: T[K][F] extends ColumnDefinition ? Prettify<T[K][F] & Omit<ColumnDefinition, keyof T[K][F]>> : T[K][F] extends RelationDefinition ? Prettify<T[K][F] & Omit<RelationDefinition, keyof T[K][F]>> : never
  }>
}>
