import type { TableColumn } from '@hubify/restql'
import z from 'zod'

/**
 * Default field rules based on the column type.
 */
export function columnTypeToZod(column: TableColumn) {
  switch (column.type) {
    case 'int8':
    case 'int4':
    case 'numeric':
    case 'integer':
      return z.coerce.number().int()
    case 'float4':
      return z.coerce.number()
    case 'text':
    case 'varchar':
      return z.string()
    case 'uuid':
      return z.uuid()
    case 'timestamp':
    case 'timestamptz':
      return z.iso.datetime()
    case 'date':
      return z.date()
    case 'boolean':
      return z.boolean()
    case 'json':
    default:
      return z.any() // Fallback for unsupported types
  }
}
