import type { ColumnDefinition, FieldDefinition, Prettify, RelationDefinition, Schema, TableDefinition, TableFieldNames, TableNames } from '@hubify/api/database/types.d'
import { getRelationForeignKey, isColumn, isManyToManyRelation } from '@hubify/api/database/helpers'

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
      length: getLength(fieldDef),
      precision: fieldDef.precision,
      scale: fieldDef.scale,
      options: fieldDef.options,
      unique: getUnique(fieldDef),
      default: getDefault(fieldDef)
    }
  }

  const baseRelation = {
    table: fieldDef.table,
    onDelete: fieldDef.onDelete || 'NO ACTION',
    onUpdate: fieldDef.onUpdate || 'NO ACTION',
    nullable: fieldDef.nullable ?? false,
    unique: getUnique(fieldDef),
    default: getDefault(fieldDef)
  }

  if (isManyToManyRelation(fieldDef)) {
    return {
      ...baseRelation,
      type: fieldDef.type,
      through: fieldDef.through,
      throughKey: fieldDef.throughKey
    }
  }

  return {
    ...baseRelation,
    type: fieldDef.type,
    foreignKey: getRelationForeignKey(schema, tableName, fieldDef)
  }
}

/**
 * Get uniquess of field.
 */
function getUnique(def: FieldDefinition) {
  if (def.type === 'uuid') return true

  return def.unique ?? false
}

/**
 * Get default value of field.
 */
function getDefault(def: FieldDefinition) {
  if (def.type === 'enum-array') return '[]'

  return def.default
}

/**
 * Get length of field.
 */
function getLength(def: FieldDefinition) {
  if (def.type === 'varchar' || def.type === 'char') {
    return def.length || 255
  }

  if (def.type === 'uuid') {
    return 36
  }

  return def.length
}

export type NormalizedSchema<T extends Schema> = Prettify<{
  [K in keyof T]: Prettify<{
    [F in keyof T[K]]: T[K][F] extends ColumnDefinition ? Prettify<T[K][F] & Omit<ColumnDefinition, keyof T[K][F]>> : T[K][F] extends RelationDefinition ? Prettify<T[K][F] & Omit<RelationDefinition, keyof T[K][F]>> : never
  }>
}>
