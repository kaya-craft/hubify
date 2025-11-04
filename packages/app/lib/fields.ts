import type { TableNames } from '@hubify/api/types/schema'
import type { FieldOption, FieldOptions, TableFieldOptions } from '@hubify/app/types/fields'
import tables from '#hubify/schema'
import type { FieldDefinition } from '@hubify/api/database/types'
import { defu } from 'defu'
import { isManyToManyRelation, isManyToOneRelation, isOneToManyRelation, isOneToOneRelation, isPrimaryColumn, isTimestampField } from '@hubify/api/database/helpers'
import { getDataTypeGroup, type DataTypes } from '@hubify/api/database/data-types/index'

/**
 * Define collection fields.
 */
export function defineCollectionFields<const F extends FieldOptions<TableNames>>(fields: F) {
  return fields
}

/**
 * Normalize fields.
 */
export function normalizeFields(fields: Record<TableNames, FieldOptions<TableNames>>) {
  return Object.fromEntries(Object.keys(tables).map(table => [
    table,
    normalizeFieldOptions(table as TableNames, fields?.[table as keyof typeof fields])
  ])) as { [K in TableNames]: TableFieldOptions<K> }
}

/**
 * Normalize field options.
 */
export function normalizeFieldOptions(table: TableNames, fields?: FieldOptions<TableNames>) {
  return Object.fromEntries(Object.entries(tables[table]).map(([column, def]) => [
    column,
    normalizeFieldOption(table, column, def, fields?.[column as keyof typeof fields])
  ]))
}

/**
 * Normalize field options.
 */
function normalizeFieldOption(collection: string, column: string, columnDef: FieldDefinition, fieldOption?: FieldOption) {
  if (fieldOption === false) return false

  return defu(fieldOption, {
    input: getDefaultInputType(collection, column, columnDef),
    display: getDefaultDisplayType(collection, column, columnDef)
  } as FieldOption)
}

/**
 * Get default input type based on column definition.
 */
function getDefaultInputType(collection: string, column: string, columnDef: FieldDefinition) {
  if (isManyToManyRelation(columnDef) || isOneToManyRelation(columnDef) || isPrimaryColumn(columnDef) || isTimestampField(columnDef)) return false

  const baseProps = {
    collection,
    column
  } as Record<string, unknown>

  if (isManyToOneRelation(columnDef) || isOneToOneRelation(columnDef)) {
    return {
      component: 'system-many-to-one',
      props: {
        ...baseProps,
        relatedTable: columnDef.table
      }
    }
  }

  if (columnDef.options && columnDef.options.length > 0) {
    return {
      component: columnDef.type === 'enum-array' ? 'checkbox' : 'select',
      props: {
        ...baseProps,
        multiple: columnDef.type.includes('array'),
        options: [...columnDef.options || []]
      }
    }
  }

  switch (getDataTypeGroup(columnDef.type as DataTypes)) {
    case 'number':
      return {
        component: 'number',
        props: baseProps
      }
    case 'date':
      return {
        component: 'date-picker',
        props: baseProps
      }
    case 'boolean':
      return {
        component: 'switch',
        props: baseProps
      }
    case 'json':
      return {
        component: 'json-editor',
        props: baseProps
      }
    case 'binary':
      return {
        component: 'file-upload',
        props: baseProps
      }
    case 'string':
    default:
      return {
        component: columnDef.type === 'text' || (columnDef.length && columnDef.length > 255) ? 'textarea' : 'text',
        props: baseProps
      }
  }
}

/**
 * Get default display type based on column definition.
 */
function getDefaultDisplayType(collection: string, column: string, columnDef: FieldDefinition) {
  if (isManyToManyRelation(columnDef) || isOneToManyRelation(columnDef) || isPrimaryColumn(columnDef)) return false

  const baseProps = {
    collection,
    column
  } as Record<string, unknown>

  if (isManyToOneRelation(columnDef) || isOneToOneRelation(columnDef)) {
    return {
      component: 'system-one-to-many',
      props: {
        ...baseProps,
        relatedTable: columnDef.table as TableNames
      }
    }
  }

  if (columnDef.options && columnDef.options.length > 0) {
    return {
      component: 'labels',
      props: baseProps
    }
  }

  switch (getDataTypeGroup(columnDef.type as DataTypes)) {
    case 'number':
      return {
        component: 'number',
        props: baseProps
      }
    case 'date':
      return {
        component: 'date',
        props: baseProps
      }
    case 'boolean':
      return {
        component: 'checkbox',
        props: baseProps
      }
    case 'json':
      return {
        component: 'json-viewer',
        props: baseProps
      }
    case 'binary':
      return {
        component: 'file-upload',
        props: baseProps
      }
    case 'string':
    default:
      return {
        component: 'text',
        props: baseProps
      }
  }
}
