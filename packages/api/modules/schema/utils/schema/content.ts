import type { Column } from 'knex-schema-inspector/dist/types/column'

/**
 * Generate schema content.
 */
export function generateSchemaContent(schema: Record<string, Record<string, Column>>) {
  const collections = Object.entries(schema).map(([table, columns]) => generateTableContent(table, columns)).join('\n\n')

  return [
    collections,
    '\n',
    'export default {',
    ...Object.keys(schema).map(table => `\t${table},`),
    '}'
  ].join('\n')
}

/**
 * Generate table content.
 */
function generateTableContent(table: string, columns: Record<string, Column>) {
  return `export const ${table} = ${JSON.stringify({
    columns: toColumnsDefinition(columns),
    relations: toRelationsDefinition(columns)
  }, null, 2)} as const`
}

/**
 * Generate relations definition (currently empty).
 */
function toRelationsDefinition(_columns: Record<string, Column>) {
  return Object.fromEntries(Object.entries(_columns).filter(([, column]) => column.foreign_key_column).map(([name, column]) => [name, toRelationDefinition(column)]))
}

/**
 * Generate a relation definition (currently empty).
 */
function toRelationDefinition(column: Column) {
  return {
    table: column.foreign_key_table,
    fromKey: column.name,
    toKey: column.foreign_key_column
  }
}

/**
 * Convert columns to a definition object.
 */
function toColumnsDefinition(columns: Record<string, Column>) {
  return Object.fromEntries(Object.entries(columns).map(([name, column]) => [name, toColumnDefinition(column)]))
}

/**
 * Convert a column to its definition.
 */
function toColumnDefinition(column: Column) {
  return {
    type: column.data_type,
    primaryKey: column.is_primary_key,
    unique: column.is_unique,
    notNull: !column.is_nullable,
    default: column.default_value ?? undefined
  }
}
