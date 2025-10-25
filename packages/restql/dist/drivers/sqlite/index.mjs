import { createDatabase } from 'db0';
import connector from 'db0/connectors/node-sqlite';
import { defineDriver } from '../../index.mjs';
import { getSchemaDiff } from '../../utils/helpers.mjs';
import { dropTable, updateTable, createTable } from '../../utils/statements.mjs';
import { removeRaw, removeOneRaw, createOneRaw, updateOneRaw, updateRaw, findOneRaw, findRaw, schemaRaw } from './queries.mjs';

const sqlite = defineDriver((schema) => ({
  findRaw: findRaw(schema),
  findOneRaw: findOneRaw(schema),
  updateRaw: updateRaw(schema),
  updateOneRaw: updateOneRaw(schema),
  createOneRaw: createOneRaw(schema),
  removeOneRaw: removeOneRaw(schema),
  removeRaw: removeRaw(schema),
  runTransaction,
  retrieveSchema,
  updateSchema,
  createTableRaw: createTable,
  updateTableRaw: updateTable,
  dropTableRaw: dropTable
}), () => createDatabase(connector({ cwd: process.cwd() })));
async function updateSchema(db, newSchema) {
  const current = await retrieveSchema(db);
  const diff = getSchemaDiff(current, newSchema);
  return runTransaction(db, async () => {
    await Promise.all([
      ...Object.entries(diff.added || {}).map(([table, def]) => db.exec(createTable(table, def))),
      ...Object.entries(diff.updated || {}).map(([table, def]) => db.exec(updateTable(table, def))),
      ...Object.entries(diff.removed || {}).map(([table]) => db.exec(dropTable(table)))
    ]);
  });
}
async function retrieveSchema(db) {
  const query = schemaRaw();
  const { rows } = await db.sql`{${query}}`;
  const schema = {};
  for (const row of rows) {
    const current = schema[row.table] ??= { columns: {} };
    current.columns[row.column] = {
      type: row.type,
      notNull: row.notNull === 1,
      default: row.default || void 0,
      primaryKey: row.primaryKey === 1,
      unique: row.primaryKey === 1 ? void 0 : row.unique === 1
    };
    if (!row.relationTable) continue;
    current.relations ??= {};
    current.relations[row.column] = {
      table: row.relationTable,
      fromKey: row.relationFrom,
      toKey: row.relationTo,
      onDelete: row.relationOnDelete || "NO ACTION",
      onUpdate: row.relationOnUpdate || "NO ACTION"
    };
  }
  return schema;
}
async function runTransaction(db, cb) {
  await db.exec(`BEGIN TRANSACTION`);
  try {
    await cb();
    await db.exec(`COMMIT`);
  } catch (error) {
    await db.exec(`ROLLBACK`);
    throw error;
  }
}

export { sqlite as default, retrieveSchema, runTransaction, updateSchema };
