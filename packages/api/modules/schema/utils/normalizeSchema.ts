import type { FieldDefinition, Schema, TableDefinition } from '@hubify/api/lib/database/types.d'
import { getRelationForeignKey, isRelation } from '@hubify/api/lib/database/helpers'

/**
 * Normalize a schema by ensuring all optional properties are set to their default values.
 */
export function normalizeSchema<T extends Schema>(schema: T): T {
  return Object.fromEntries(Object.entries(schema).map(([tableName, tableDef]) => [
    tableName,
    normalizeTableDefinition(schema, tableName, tableDef)
  ])) as T
}

/**
 * Normalize a table definition by ensuring all optional properties are set to their default values.
 */
export function normalizeTableDefinition<N extends string, T extends TableDefinition>(schema: Schema, tableName: N, tableDef: T) {
  return {
    name: tableName,
    fields: Object.fromEntries(Object.entries(tableDef.fields).map(([fieldName, fieldDef]) => [
      fieldName,
      normalizeFieldDefinition(schema, tableName, fieldName, fieldDef)
    ]))
  } as T & { name: N }
}

/**
 * Normalize a field definition by ensuring all optional properties are set to their default values.
 */
function normalizeFieldDefinition<N extends string, F extends FieldDefinition>(schema: Schema, tableName: string, _fieldName: N, fieldDef: F): F {
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
      } as F
    }

    return {
      ...baseRelation,
      type: fieldDef.type,
      through: fieldDef.through,
      throughKey: fieldDef.throughKey
    } as F
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
  } as F
}
