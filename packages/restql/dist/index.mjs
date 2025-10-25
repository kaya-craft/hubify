function defineSchema(schema) {
  return schema;
}
function defineTable(table) {
  return table;
}
function defineDriver(create, defautlDb) {
  return (schema, db = defautlDb()) => {
    const driver = create(schema);
    const findRaw = driver.findRaw;
    const findOneRaw = driver.findOneRaw;
    const updateRaw = driver.updateRaw;
    const updateOneRaw = driver.updateOneRaw;
    const createOneRaw = driver.createOneRaw;
    const removeRaw = driver.removeRaw;
    const removeOneRaw = driver.removeOneRaw;
    const retrieveSchema = driver.retrieveSchema;
    const updateSchema = driver.updateSchema;
    const runTransaction = driver.runTransaction;
    async function exec(query) {
      const result2 = await db.sql`{${query}}`;
      return result2.rows;
    }
    const find = (table, params) => {
      return exec(findRaw(table, params));
    };
    const findOne = (table, primaryKey, params) => {
      return exec(findOneRaw(table, primaryKey, params || {})).then((rows) => rows[0]);
    };
    const update = (table, item, params) => {
      return exec(updateRaw(table, item, params || {}));
    };
    const updateOne = (table, primaryKey, item, params) => {
      return exec(updateOneRaw(table, primaryKey, item, params || {})).then((rows) => rows[0]);
    };
    const createOne = (table, item) => {
      return exec(createOneRaw(table, item)).then((rows) => rows[0]);
    };
    const remove = (table, params) => {
      return exec(removeRaw(table, params)).then((rows) => rows);
    };
    const removeOne = (table, primaryKey, params) => {
      return exec(removeOneRaw(table, primaryKey, params || {})).then((rows) => rows[0]);
    };
    const setDatabase = (newDb) => {
      db = newDb;
      return result;
    };
    const transaction = (cb) => runTransaction(db, cb);
    const result = {
      find: Object.assign(find, { raw: findRaw }),
      findOne: Object.assign(findOne, { raw: findOneRaw }),
      update: Object.assign(update, { raw: updateRaw }),
      updateOne: Object.assign(updateOne, { raw: updateOneRaw }),
      createOne: Object.assign(createOne, { raw: createOneRaw }),
      remove: Object.assign(remove, { raw: removeRaw }),
      removeOne: Object.assign(removeOne, { raw: removeOneRaw }),
      retrieveSchema: () => retrieveSchema(db),
      updateSchema: (newSchema) => updateSchema(db, newSchema),
      db,
      schema,
      setDatabase,
      transaction
    };
    return result;
  };
}

export { defineDriver, defineSchema, defineTable };
