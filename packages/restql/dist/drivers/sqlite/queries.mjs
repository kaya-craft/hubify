import { addPrimaryKeyCondition, trim, join, getPrimaryKey } from '../../utils/helpers.mjs';
import { select, from, joins, where, groupBy, orderBy, limit, offset, remove, returning, update, set, insert, values } from '../../utils/statements.mjs';

function findOneRaw(schema) {
  return (table, key, params) => {
    const whereClause = addPrimaryKeyCondition(schema, table, key, params);
    return trim(join([
      select(schema, table, params.columns),
      from(table),
      joins(schema, table, params),
      where(schema, table, whereClause)
    ], " "));
  };
}
function findRaw(schema) {
  return (table, params) => {
    return trim(join([
      select(schema, table, params.columns),
      from(table),
      joins(schema, table, params),
      where(schema, table, params.where),
      groupBy(schema, table, params.groupBy),
      orderBy(schema, table, params.orderBy),
      limit(params.limit),
      offset(params.offset)
    ], " "));
  };
}
function removeRaw(schema) {
  return (table, params) => {
    return trim(join([
      remove(table),
      where(schema, table, params.where),
      returning(getPrimaryKey(schema, table))
    ], " "));
  };
}
function removeOneRaw(schema) {
  return (table, key, params) => {
    const whereClause = addPrimaryKeyCondition(schema, table, key, params);
    return trim(join([
      remove(table),
      where(schema, table, whereClause),
      returning(getPrimaryKey(schema, table))
    ], " "));
  };
}
function updateRaw(schema) {
  return (table, item, params) => {
    return trim(join([
      update(table),
      set(schema, table, item),
      where(schema, table, params.where),
      returning("*")
    ], " "));
  };
}
function updateOneRaw(schema) {
  return (table, key, item, params) => {
    const whereClause = addPrimaryKeyCondition(schema, table, key, params);
    return trim(join([
      update(table),
      set(schema, table, item),
      where(schema, table, whereClause),
      returning("*")
    ], " "));
  };
}
function createOneRaw(schema) {
  return (table, item) => {
    return trim(join([
      insert(table),
      values(schema, table, item),
      returning("*")
    ], " "));
  };
}
function schemaRaw() {
  return `
    SELECT
      sqlite_master.name AS "table",
      meta.name AS "column",
      meta.type AS "type",
      meta."notnull" AS "notNull",
      meta.dflt_value AS "default",
      meta.pk AS "primaryKey",
      relation."table" AS "relationTable",
      relation."from" AS "relationFrom",
      relation."to" AS "relationTo",
      relation."on_update" AS "relationOnUpdate",
      relation."on_delete" AS "relationOnDelete",
      (
        SELECT
          1
        FROM
          pragma_index_list(sqlite_master.name) AS idx
          JOIN pragma_index_info(idx.name) AS idxinfo ON idxinfo.name = meta.name
        WHERE
          idx."unique" = 1
        LIMIT 1
      ) AS "unique"
    FROM
      sqlite_master
      JOIN pragma_table_info(sqlite_master.name) as meta
      LEFT JOIN pragma_foreign_key_list(sqlite_master.name) as relation ON meta.name = relation."from"
    WHERE
      sqlite_master.type = 'table'
      AND meta.name NOT LIKE 'sqlite_%';
  `;
}

export { createOneRaw, findOneRaw, findRaw, removeOneRaw, removeRaw, schemaRaw, updateOneRaw, updateRaw };
