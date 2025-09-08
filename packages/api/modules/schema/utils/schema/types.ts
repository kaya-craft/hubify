import type { Column } from 'knex-schema-inspector/dist/types/column'
import { generateSchemaContent } from './content'
import { singularize, classify } from 'inflection'

/**
 * Generate types from the database schema.
 */
export function generateSchemaTypes(schema: Record<string, Record<string, Column>>) {
  const collections = Object.entries(schema).map(([table, columns]) => generateTableType(table, columns)).join('\n\n')

  return [
    collections,
    '\n',
    'declare module \'knex/types/tables\' {',
    '\tinterface Tables extends Schema {',
    ...Object.keys(schema).map(table => `\t\t${table}: ${toInterfaceName(table)}`),
    '\t}',
    '}',
    '\n',
    generateSchemaContent(schema)
  ].join('\n')
}

/**
 * Generate table types.
 */
function generateTableType(table: string, columns: Record<string, Column>) {
  const fields = Object.values(columns).map((column) => {
    return `\t${column.name}${column.is_nullable ? '?' : ''}: ${mapColumnType(column)}`
  }).join('\n')

  return `export interface ${toInterfaceName(table)} {\n${fields}\n}`
}

/**
 * Map database column types to TypeScript types.
 */
function mapColumnType(column: Column) {
  let baseType

  switch (column.data_type) {
    case 'int':
    case 'integer':
    case 'bigint':
    case 'decimal':
    case 'float':
    case 'double':
      baseType = 'number'
      break
    case 'boolean':
      baseType = 'boolean'
      break
    case 'date':
    case 'datetime':
    case 'timestamp':
      baseType = 'Date'
      break
    case 'json':
    case 'jsonb':
      baseType = 'any'
      break
    default:
      baseType = 'string'
  }

  return column.foreign_key_table ? [baseType, toInterfaceName(column.foreign_key_table)].join(' | ') : baseType
}

/**
 * Convert a string to interface name.
 */
function toInterfaceName(name: string) {
  return classify(singularize(name))
}
