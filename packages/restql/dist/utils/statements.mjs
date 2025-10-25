import { normalizeColumns, wrap, join, normalizeOperationValue, getAllJoinClauses, getOrderByClauses, getWhereClauses } from './helpers.mjs';

function select(schema, table, columns) {
  return `SELECT ${normalizeColumns(schema, table, columns)}`;
}
function update(table) {
  return `UPDATE ${wrap(table)}`;
}
function remove(table) {
  return `DELETE FROM ${wrap(table)}`;
}
function insert(table) {
  return `INSERT INTO ${wrap(table)}`;
}
function createTable(name, definition) {
  return join([
    `CREATE TABLE IF NOT EXISTS ${name} (`,
    join(Object.entries(definition.columns).map(([name2, column]) => defineTableColumn(name2, column, definition.relations?.[name2])), ", "),
    ")"
  ], "");
}
function defineTableColumn(name, column, relation) {
  const constraints = [
    column.primaryKey ? "PRIMARY KEY" : "",
    column.unique ? "UNIQUE" : "",
    column.notNull ? "NOT NULL" : "",
    typeof column.default !== "undefined" ? `DEFAULT ${normalizeOperationValue(column.default, column.type)}` : "",
    relation ? `REFERENCES ${relation.table}(${relation.toKey}) ON DELETE ${relation.onDelete || "NO ACTION"} ON UPDATE ${relation.onUpdate || "NO ACTION"}` : ""
  ].filter(Boolean).join(" ");
  return `${name} ${column.type.toUpperCase()} ${constraints}`.trim();
}
function updateTable(tableName, diff) {
  return join([
    ...Object.entries(diff.added || {}).map(([colName, def]) => addTableColumn(tableName, colName, def.column, def.relation)),
    ...Object.entries(diff.updated || {}).map(([colName, def]) => updateTableColumn(tableName, colName, def.column, def.relation)),
    ...Object.entries(diff.removed || {}).map(([colName]) => dropTableColumn(tableName, colName))
  ], "; ");
}
function addTableColumn(table, colName, definition, relation) {
  return `ALTER TABLE ${wrap(table)} ADD COLUMN ${defineTableColumn(colName, definition, relation)}`;
}
function updateTableColumn(table, colName, definition, relation) {
  return join([
    dropTableColumn(table, colName),
    `ALTER TABLE ${wrap(table)} ADD COLUMN ${defineTableColumn(colName, definition, relation)}`
  ], "; ");
}
function dropTableColumn(table, colName) {
  return `ALTER TABLE ${wrap(table)} DROP COLUMN ${colName}`;
}
function dropTable(table) {
  return `DROP TABLE IF EXISTS ${wrap(table)}`;
}
function values(schema, table, item) {
  return `(${join(Object.keys(item), ", ")}) VALUES (${join(Object.entries(item).map(([column, value]) => {
    return normalizeOperationValue(value, schema[table].columns[column]?.type);
  }), ", ")})`;
}
function set(schema, table, item) {
  return `SET ${join(Object.entries(item).map(([column, value]) => {
    return `${wrap(column)} = ${normalizeOperationValue(value, schema[table].columns[column]?.type)}`;
  }), ", ")}`;
}
function from(table) {
  return `FROM ${wrap(table)}`;
}
function limit(limit2) {
  return limit2 !== void 0 ? `LIMIT ${limit2}` : "";
}
function offset(offset2) {
  return offset2 !== void 0 ? `OFFSET ${offset2}` : "";
}
function joins(schema, table, params) {
  return join(getAllJoinClauses(schema, table, params), " ");
}
function groupBy(schema, table, columns) {
  return !columns?.length ? "" : `GROUP BY ${normalizeColumns(schema, table, columns)}`;
}
function orderBy(schema, table, columns) {
  return !columns?.length ? "" : `ORDER BY ${getOrderByClauses(schema, table, columns)}`;
}
function where(schema, table, where2) {
  return where2 ? `WHERE ${getWhereClauses(schema, table, where2)}` : "";
}
function returning(...columns) {
  return `RETURNING ${columns.join(", ")}`;
}

export { addTableColumn, createTable, dropTable, dropTableColumn, from, groupBy, insert, joins, limit, offset, orderBy, remove, returning, select, set, update, updateTable, updateTableColumn, values, where };
