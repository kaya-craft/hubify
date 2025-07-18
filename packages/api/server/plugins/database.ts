import type { Schema } from '@hubify/restql'
import type { TableColumns, TableRelations } from '~/modules/schema/runtime/utils/define'

export default defineNitroPlugin(async () => {
  const { db, schema } = useDb()

  const currentSchema = await getCurrentSchema()

  const diff = getSchemaDiff(currentSchema, schema)

  // Run transactions to apply schema changes
  if (diff.length > 0) {
    await db.exec(`BEGIN TRANSACTION;`)
    try {
      for (const sql of diff) {
        await db.exec(sql)
      }
      await db.exec(`COMMIT;`)
    }
    catch (error) {
      await db.exec(`ROLLBACK;`)
      console.error('Error applying schema changes:', error)
      throw error
    }
  }
})

async function getCurrentSchema() {
  const { db } = useDb()

  const { rows } = await db.sql<{ rows: { sql: string }[] }>`select sql from sqlite_schema where sql is not null`

  return sqlToSchema(rows.map(row => row.sql))
}

function getSchemaDiff(currentSchema: Schema, newSchema: Schema) {
  const sql: string[] = []

  // Check for added and modified tables
  for (const tableName in newSchema) {
    if (!currentSchema[tableName]) {
      sql.push(tableSchemaToSqlQuery(tableName, newSchema[tableName].columns, newSchema[tableName].relations || {}))
    }
    else {
      const currentColumns = currentSchema[tableName].columns
      const newColumns = newSchema[tableName].columns

      // Check for modified columns
      for (const columnName in newColumns) {
        if (!currentColumns[columnName]) {
          sql.push(`ALTER TABLE ${tableName} ADD COLUMN ${columnName} ${newColumns[columnName].type.toUpperCase()} ${newColumns[columnName].notNull ? 'NOT NULL' : ''} ${newColumns[columnName].default ? `DEFAULT ${newColumns[columnName].default}` : ''}`.trim())
        }
        else if (!isSameType(currentColumns[columnName], newColumns[columnName]) || !isSameNotNull(currentColumns[columnName], newColumns[columnName]) || !isSameDefault(currentColumns[columnName], newColumns[columnName])) {
          sql.push(`ALTER TABLE ${tableName} DROP COLUMN ${columnName};`)
          sql.push(`ALTER TABLE ${tableName} ADD COLUMN ${columnName} ${newColumns[columnName].type.toUpperCase()} ${newColumns[columnName].notNull ? 'NOT NULL' : ''} ${newColumns[columnName].default ? `DEFAULT ${newColumns[columnName].default}` : ''}`.trim())
        }
      }

      // Check for removed columns
      for (const columnName in currentColumns) {
        if (!newColumns[columnName]) {
          sql.push(`ALTER TABLE ${tableName} DROP COLUMN ${columnName}`)
        }
      }
    }
  }

  // Check for removed tables
  for (const tableName in currentSchema) {
    if (!newSchema[tableName]) {
      sql.push(`DROP TABLE IF EXISTS ${tableName}`)
    }
  }

  return sql
}

function isSameType(col1: TableColumns[string], col2: TableColumns[string]) {
  const normalizedType1 = col1.type.toLowerCase()
  const normalizedType2 = col2.type.toLowerCase()
  return normalizedType1 === normalizedType2
}

function isSameNotNull(
  col1: TableColumns[string],
  col2: TableColumns[string]
) {
  return (col1.notNull === undefined && col2.notNull === undefined) || Boolean(col1.notNull) === Boolean(col2.notNull)
}

function isSameDefault(
  col1: TableColumns[string],
  col2: TableColumns[string]
) {
  return (col1.default === undefined && col2.default === undefined) || String(col1.default) === String(col2.default)
}

/**
 * Sql to schema
 */
function sqlToSchema(sql: string[]) {
  const schema: Schema = {}

  for (const sqlStatement of sql) {
    const table = sqlToSchemaTable(sqlStatement)
    if (table) {
      schema[table.tableName] = {
        columns: table.columns,
        relations: table.relations
      }
    }
  }

  return schema
}

/**
 * Converts a SQL schema string to a structured format.
 */
function sqlToSchemaTable(sql: string) {
  const tableMatch = sql.match(/CREATE TABLE (\w+) \(([^)]+)\)/i)
  if (!tableMatch) return null

  const tableName = tableMatch[1]
  const columns: TableColumns = {}
  const relations: TableRelations = {}

  const columnDefs = tableMatch[2].split(',').map(col => col.trim())
  for (const colDef of columnDefs) {
    const parts = colDef.split(' ')
    const name = parts[0]
    const type = (parts[1]).toLowerCase() as TableColumns[keyof TableColumns]['type']
    const constraints = parts.slice(2).join(' ')

    columns[name] = {
      type,
      primaryKey: constraints.includes('PRIMARY KEY'),
      unique: constraints.includes('UNIQUE'),
      notNull: constraints.includes('NOT NULL'),
      default: constraints.match(/DEFAULT (.+)/)?.[1] || undefined
    }
  }

  // Extract relations if any
  for (const colDef of columnDefs) {
    const relationMatch = colDef.match(/(\w+) (\w+) REFERENCES (\w+)\((\w+)\)( ON DELETE (\w+))?( ON UPDATE (\w+))?/)
    if (relationMatch) {
      const toKey = relationMatch[1]
      const table = relationMatch[3]
      const fromKey = relationMatch[4]
      const onDelete = (relationMatch[5] || 'NO ACTION') as TableRelations[keyof TableRelations]['onDelete']
      const onUpdate = (relationMatch[7] || 'NO ACTION') as TableRelations[keyof TableRelations]['onUpdate']

      if (columns[fromKey]) {
        // eslint-disable-next-line @typescript-eslint/no-dynamic-delete
        delete columns[fromKey] // Remove the column if it's a relation
      }

      relations[fromKey] = {
        table,
        fromKey,
        toKey,
        onDelete,
        onUpdate
      }
    }
  }

  return { tableName, columns, relations }
}

/**
 * Converts a table schema to a SQL CREATE TABLE query.
 */
function tableSchemaToSqlQuery(tableName: string, columns: TableColumns, relations: TableRelations = {}) {
  const columnDefinitions = Object.entries(columns).map(([name, column]) => {
    const type = column.type.toUpperCase()
    const constraints = [
      column.primaryKey ? 'PRIMARY KEY' : '',
      column.unique ? 'UNIQUE' : '',
      column.notNull ? 'NOT NULL' : '',
      typeof column.default !== 'undefined' ? `DEFAULT ${column.default}` : ''
    ].filter(Boolean).join(' ')
    return `${name} ${type} ${constraints}`.trim()
  }).join(', ')

  const relationDefinitions = Object.entries(relations).map(([name, relation]) => {
    const ref = `REFERENCES ${relation.table}(${relation.toKey})`
    const fromType = columns[relation.fromKey]?.type.toUpperCase()
    const toType = columns[relation.toKey]?.type.toUpperCase()

    if (!fromType || !toType || fromType !== toType) {
      throw new Error(`Type mismatch for relation ${name}: ${fromType} vs ${toType}`)
    }

    return `${name} ${fromType} ${ref} ON DELETE ${relation.onDelete || 'NO ACTION'} ON UPDATE ${relation.onUpdate || 'NO ACTION'}`
  }).join(', ')

  return `CREATE TABLE IF NOT EXISTS ${tableName} (${columnDefinitions}${relationDefinitions ? `, ${relationDefinitions}` : ''})`
}
