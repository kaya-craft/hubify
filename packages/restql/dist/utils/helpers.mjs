const OPERATORS = {
  $eq: (value, type) => `= ${normalizeOperationValue(value, type)}`,
  $neq: (value, type) => `!= ${normalizeOperationValue(value, type)}`,
  $gt: (value, type) => `> ${normalizeOperationValue(value, type)}`,
  $gte: (value, type) => `>= ${normalizeOperationValue(value, type)}`,
  $lt: (value, type) => `< ${normalizeOperationValue(value, type)}`,
  $lte: (value, type) => `<= ${normalizeOperationValue(value, type)}`,
  $contains: (value) => `LIKE '${normalizeOperationValue("%" + value + "%")}'`,
  $ncontains: (value) => `NOT LIKE '${normalizeOperationValue("%" + value + "%")}'`,
  $startsWith: (value) => `LIKE '${normalizeOperationValue(value + "%")}'`,
  $nstartsWith: (value) => `NOT LIKE '${normalizeOperationValue(value + "%")}'`,
  $endsWith: (value) => `LIKE '${normalizeOperationValue("%" + value)}'`,
  $nendsWith: (value) => `NOT LIKE '${normalizeOperationValue("%" + value)}'`,
  $in: (value, type) => `IN (${join(value.map((value2) => normalizeOperationValue(value2, type)), ", ")})`,
  $nin: (value, type) => `NOT IN (${join(value.map((value2) => normalizeOperationValue(value2, type)), ", ")})`,
  $between: (value, type) => `BETWEEN ${normalizeOperationValue(value[0], type)} AND ${normalizeOperationValue(value[1], type)}`,
  $nbetween: (value, type) => `NOT BETWEEN ${normalizeOperationValue(value[0], type)} AND ${normalizeOperationValue(value[1], type)}`,
  $null: () => "IS NULL",
  $nnull: () => "IS NOT NULL"
};
function getPrimaryKey(schema, table) {
  return Object.entries(schema[table].columns).find(([_, v]) => v.primaryKey)?.[0];
}
function addPrimaryKeyCondition(schema, table, key, params = {}) {
  const primaryKey = getPrimaryKey(schema, table);
  if (!primaryKey) throw new Error(`Primary key not found for table ${table}`);
  params.where ??= {};
  Object.assign(params.where, { [primaryKey]: { $eq: key } });
  return params.where;
}
function wrap(value) {
  return value;
}
function unique(arr) {
  return [...new Set(arr)];
}
function join(arr, separator = ", ") {
  return arr.join(separator);
}
function trim(value) {
  return value.trim();
}
function prepend(value, prefix) {
  return `${prefix}${value}`;
}
function unprepend(value, prefix) {
  return value.startsWith(prefix) ? value.slice(prefix.length) : value;
}
function normalizeColumn(schema, table, col) {
  return col.split(".").reduce((_, part, index, array) => {
    if (schema[table]?.relations?.[part] && index < array.length - 1) {
      table = schema[table].relations?.[part].table;
    }
    return `${wrap(table)}.${wrap(part)}`;
  }, "");
}
function addColumnModifier(column, type) {
  if (type === "date" || type === "timestamp" || type === "timestamptz") {
    return `DATE(${column})`;
  }
  return column;
}
function normalizeColumns(schema, table, columns) {
  return join(columns?.map((col) => normalizeColumn(schema, table, col)) ?? ["*"]);
}
function getRelationInfo(schema, table, col) {
  const parts = col.split(".");
  const relationInfo = [];
  for (let i = 0; i < parts.length; i++) {
    const part = parts[i];
    const info = relationInfo[relationInfo.length - 1];
    const fromTable = info?.toTable ?? table;
    const relation = schema[fromTable]?.relations?.[part];
    if (!relation) break;
    relationInfo.push({
      fromTable,
      fromKey: relation.fromKey,
      toTable: relation.table,
      toKey: relation.toKey
    });
  }
  return relationInfo;
}
function getJoinClause(relation) {
  const toTable = relation.toTable;
  const fromTable = relation.fromTable;
  const fromKey = relation.fromKey;
  const toKey = relation.toKey;
  return `INNER JOIN ${wrap(toTable)} ON ${wrap(toTable)}.${wrap(toKey)} = ${wrap(fromTable)}.${wrap(fromKey)}`;
}
function getJoinClauses(schema, table, col) {
  const info = getRelationInfo(schema, table, col);
  if (!info) return "";
  return unique(info.map(getJoinClause));
}
function getAllFields(_schema, _table, params) {
  return unique([
    ...params.columns ?? [],
    ...params.groupBy ?? [],
    ...(params.orderBy ?? []).map((col) => unprepend(col, "-"))
  ]);
}
function getAllJoinClauses(schema, table, params) {
  const fields = getAllFields(schema, table, params);
  return unique(fields.flatMap((col) => getJoinClauses(schema, table, col)));
}
function getOrderByClauses(schema, table, columns) {
  if (!columns?.length) return "";
  return columns.map((col) => {
    const normalizedCol = normalizeColumn(schema, table, col);
    return col.startsWith("-") ? `${normalizedCol} DESC` : `${normalizedCol} ASC`;
  });
}
function getWhereClauses(schema, table, condition) {
  return join(Object.entries(condition).flatMap(([key, value]) => {
    if (key === "$and" && Array.isArray(value)) {
      return `(${join(value.flatMap((v) => getWhereClauses(schema, table, v)), " AND ")})`;
    } else if (key === "$or" && Array.isArray(value)) {
      return `(${join(value.flatMap((v) => getWhereClauses(schema, table, v)), " OR ")})`;
    } else if (!Array.isArray(value) && typeof value === "object") {
      const column = normalizeColumn(schema, table, key);
      const type = schema[table]?.columns?.[key]?.type;
      return Object.entries(value).flatMap(([operator, val]) => {
        if (operator in OPERATORS) {
          const fn = OPERATORS[operator];
          return `${addColumnModifier(column, type)} ${fn(val, type)}`;
        }
        return getWhereClauses(schema, table, { [operator]: val });
      });
    }
    return [];
  }), " AND ");
}
function normalizeOperationValue(value, type) {
  switch (type) {
    case "text":
    case "varchar":
      return `'${String(value).replace("'", "''")}'`;
    case "boolean":
      return value ? "TRUE" : "FALSE";
    case "date":
      return `DATE('${value}')`;
    default:
      return value;
  }
}
function getSchemaDiff(current, newSchema) {
  const diff = {
    added: {},
    updated: {},
    removed: {}
  };
  for (const tableName in newSchema) {
    if (current[tableName]) {
      const { columns: columns1, relations: relations1 } = current[tableName];
      const { columns: columns2, relations: relations2 } = newSchema[tableName];
      for (const name in columns2) {
        if (name in columns1) {
          if (columnHasChanged(columns1[name], columns2[name], relations1?.[name], relations2?.[name])) {
            diff.updated[tableName] ??= {};
            diff.updated[tableName].updated ??= {};
            diff.updated[tableName].updated[name] = {
              column: columns2[name],
              relation: relations2?.[name]
            };
          }
        } else {
          diff.updated[tableName] ??= {};
          diff.updated[tableName].added ??= {};
          diff.updated[tableName].added[name] = {
            column: columns2[name],
            relation: relations2?.[name]
          };
        }
      }
      for (const name in columns1) {
        if (name in columns2) continue;
        diff.updated[tableName] ??= {};
        diff.updated[tableName].removed ??= {};
        diff.updated[tableName].removed[name] = true;
      }
    } else {
      diff.added[tableName] = newSchema[tableName];
    }
  }
  for (const tableName in current) {
    if (newSchema[tableName]) continue;
    diff.removed[tableName] = true;
  }
  return diff;
}
function columnHasChanged(column1, column2, relations1, relations2) {
  return column1.type?.toLowerCase() !== column2.type?.toLowerCase() || Boolean(column1.primaryKey) !== Boolean(column2.primaryKey) || Boolean(column1.unique) !== Boolean(column2.unique) || Boolean(column1.notNull) !== Boolean(column2.notNull) || column1.default?.toString() !== column2.default?.toString() || relations1?.table !== relations2?.table || relations1?.fromKey !== relations2?.fromKey || relations1?.toKey !== relations2?.toKey || relations1?.onDelete !== relations2?.onDelete || relations1?.onUpdate !== relations2?.onUpdate;
}

export { OPERATORS, addColumnModifier, addPrimaryKeyCondition, getAllFields, getAllJoinClauses, getJoinClause, getJoinClauses, getOrderByClauses, getPrimaryKey, getRelationInfo, getSchemaDiff, getWhereClauses, join, normalizeColumn, normalizeColumns, normalizeOperationValue, prepend, trim, unique, unprepend, wrap };
