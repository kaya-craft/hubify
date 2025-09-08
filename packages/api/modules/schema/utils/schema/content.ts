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
  return {}
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
