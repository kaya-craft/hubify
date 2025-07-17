import type { TableColumns, TableRelations } from '~/modules/schema/runtime/utils/define'

export default defineNitroPlugin(async () => {
  const { db, schema } = useDb()

  const queries = Object.entries(schema).map(([tableName, def]) => {
    return tableSchemaToSqlQuery(tableName, def.columns, 'relations' in def ? def.relations : {})
  })

  if (queries.length > 0) {
    await Promise.all(queries.map(query => db.sql`{${query}}`))
  }
})

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
      column.default ? `DEFAULT ${column.default}` : ''
    ].filter(Boolean).join(' ')
    return `${name} ${type} ${constraints}`.trim()
  }).join(', ')

  const relationDefinitions = Object.entries(relations).map(([name, relation]) => {
    const ref = `REFERENCES ${relation.toKey}`
    const fromType = columns[relation.fromKey]?.type.toUpperCase()
    const toType = columns[relation.toKey]?.type.toUpperCase()

    if (!fromType || !toType || fromType !== toType) {
      throw new Error(`Type mismatch for relation ${name}: ${fromType} vs ${toType}`)
    }

    return `${name} ${fromType} ${ref} ON DELETE ${relation.onDelete || 'NO ACTION'} ON UPDATE ${relation.onUpdate || 'NO ACTION'}`
  }).join(', ')

  return `CREATE TABLE IF NOT EXISTS ${tableName} (${columnDefinitions}${relationDefinitions ? `, ${relationDefinitions}` : ''})`
}
