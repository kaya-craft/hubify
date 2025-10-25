import { createDatabase } from 'db0';
import connector from 'db0/connectors/postgresql';
import sqlite from '../sqlite/index.mjs';
import 'db0/connectors/node-sqlite';
import '../../index.mjs';
import '../../utils/helpers.mjs';
import '../../utils/statements.mjs';
import '../sqlite/queries.mjs';

const index = (schema) => sqlite(schema, createDatabase(connector({})));

export { index as default };
