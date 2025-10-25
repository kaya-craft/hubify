import { S as Schema, a as TableName, Q as QueryParams, I as Item, P as PrimaryKeyValue, k as TableDefinition, C as ColumnTypeToTsType, b as ColumnTypes, j as RelationOnAction } from '../../shared/restql.BvbKE3f7.js';
import * as db0 from 'db0';
import { Database } from 'db0';
import { FindRawFn, FindOneRawFn, UpdateRawFn, UpdateOneRawFn, CreateOneRawFn, RemoveRawFn, RemoveOneRawFn } from './queries.js';
import 'type-fest/source/union-to-tuple';
import 'type-fest';
import 'type-fest/source/join';
import '../../utils/statements.js';

declare const _default: <S extends Schema>(schema: S, db?: Database<db0.Connector<unknown>>) => {
    find: (<T extends TableName<S>, const P extends QueryParams<S, T>>(table: T, params: P) => Promise<Item<S, T, P["columns"]>[]>) & {
        raw: FindRawFn<S>;
    };
    findOne: (<T extends TableName<S>, const K extends PrimaryKeyValue<S, T>, const P_1 extends QueryParams<S, T>>(table: T, primaryKey: K, params?: P_1 | undefined) => Promise<Item<S, T, P_1["columns"]>>) & {
        raw: FindOneRawFn<S>;
    };
    update: (<T extends TableName<S>, const P_2 extends QueryParams<S, T>>(table: T, item: Partial<Item<S, T, P_2["columns"]>>, params?: P_2 | undefined) => Promise<Item<S, T, P_2["columns"]>[]>) & {
        raw: UpdateRawFn<S>;
    };
    updateOne: (<T extends TableName<S>, const K_1 extends PrimaryKeyValue<S, T>, const P_3 extends QueryParams<S, T>>(table: T, primaryKey: K_1, item: Partial<Item<S, T, P_3["columns"]>>, params?: P_3 | undefined) => Promise<Item<S, T, P_3["columns"]>>) & {
        raw: UpdateOneRawFn<S>;
    };
    createOne: (<T extends TableName<S>>(table: T, item: Partial<TableDefinition<S, T, false>>) => Promise<ColumnTypeToTsType<S[T]["columns"][string]["type"]>>) & {
        raw: CreateOneRawFn<S>;
    };
    remove: (<T extends TableName<S>, const P_4 extends QueryParams<S, T>>(table: T, params: P_4) => Promise<PrimaryKeyValue<S, T>[]>) & {
        raw: RemoveRawFn<S>;
    };
    removeOne: (<T extends TableName<S>, const K_2 extends PrimaryKeyValue<S, T>, const P_5 extends QueryParams<S, T>>(table: T, primaryKey: K_2, params?: P_5 | undefined) => Promise<PrimaryKeyValue<S, T>>) & {
        raw: RemoveOneRawFn<S>;
    };
    retrieveSchema: () => Promise<Schema<ColumnTypes>>;
    updateSchema: (newSchema: Schema) => Promise<void>;
    db: Database<db0.Connector<unknown>>;
    schema: S;
    setDatabase: (newDb: Database) => /*elided*/ any;
    transaction: (cb: () => Promise<void>) => Promise<void>;
};

/**
 * Update the SQLite database schema.
 */
declare function updateSchema(db: Database, newSchema: Schema): Promise<void>;
/**
 * Retrieve the Sqlite database schema.
 */
declare function retrieveSchema(db: Database): Promise<Schema<ColumnTypes>>;
/**
 * Run a transaction.
 */
declare function runTransaction<T>(db: Database, cb: () => Promise<T>): Promise<void>;
interface SchemaRow {
    table: string;
    column: string;
    type: ColumnTypes;
    notNull?: number;
    default?: string | null;
    primaryKey?: number;
    unique?: number;
    relationTable: string;
    relationFrom: string;
    relationTo: string;
    relationOnUpdate?: RelationOnAction;
    relationOnDelete?: RelationOnAction;
}

export { _default as default, retrieveSchema, runTransaction, updateSchema };
export type { SchemaRow };
