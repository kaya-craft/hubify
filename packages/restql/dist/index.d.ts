import * as db0 from 'db0';
import { Database } from 'db0';
import { S as Schema, T as Table, a as TableName, Q as QueryParams, I as Item, P as PrimaryKeyValue, C as ColumnTypeToTsType, b as ColumnTypes } from './shared/restql.BvbKE3f7.js';
export { c as CleanJoin, l as ColumnName, f as Condition, g as ConditionTree, D as Definition, F as FieldName, J as JoinType, L as LogicalOperator, e as Operator, O as OrderByDirection, q as PrimaryKey, p as Relation, o as RelationDefinition, m as RelationName, j as RelationOnAction, n as RelationTableName, R as RemoveEmpty, d as Simplify, h as TableColumn, k as TableDefinition, i as TableRelation, U as UniqueArray, V as Value } from './shared/restql.BvbKE3f7.js';
import 'type-fest/source/union-to-tuple';
import 'type-fest';
import 'type-fest/source/join';

/**
 * Define a schema for the database.
 */
declare function defineSchema<const S extends Schema>(schema: S): S;
/**
 * Define a table for the schema.
 */
declare function defineTable<const T extends Table>(table: T): T;
/**
 * Define a driver for the database.
 */
declare function defineDriver<R extends DriverOptions, S extends Schema>(create: (schema: S) => R, defautlDb: () => Database): (schema: S, db?: Database<db0.Connector<unknown>>) => {
    find: (<T extends TableName<S>, const P extends QueryParams<S, T>>(table: T, params: P) => Promise<Item<S, T, P["columns"]>[]>) & {
        raw: R["findRaw"];
    };
    findOne: (<T extends TableName<S>, const K extends PrimaryKeyValue<S, T>, const P extends QueryParams<S, T>>(table: T, primaryKey: K, params?: P) => Promise<Item<S, T, P["columns"]>>) & {
        raw: R["findOneRaw"];
    };
    update: (<T extends TableName<S>, const P extends QueryParams<S, T>>(table: T, item: Partial<Item<S, T, P["columns"]>>, params?: P) => Promise<Item<S, T, P["columns"]>[]>) & {
        raw: R["updateRaw"];
    };
    updateOne: (<T extends TableName<S>, const K extends PrimaryKeyValue<S, T>, const P extends QueryParams<S, T>>(table: T, primaryKey: K, item: Partial<Item<S, T, P["columns"]>>, params?: P) => Promise<Item<S, T, P["columns"]>>) & {
        raw: R["updateOneRaw"];
    };
    createOne: (<T extends TableName<S>>(table: T, item: Partial<Item<S, T>>) => Promise<ColumnTypeToTsType<S[T]["columns"][string]["type"]>>) & {
        raw: R["createOneRaw"];
    };
    remove: (<T extends TableName<S>, const P extends QueryParams<S, T>>(table: T, params: P) => Promise<PrimaryKeyValue<S, T>[]>) & {
        raw: R["removeRaw"];
    };
    removeOne: (<T extends TableName<S>, const K extends PrimaryKeyValue<S, T>, const P extends QueryParams<S, T>>(table: T, primaryKey: K, params?: P) => Promise<PrimaryKeyValue<S, T>>) & {
        raw: R["removeOneRaw"];
    };
    retrieveSchema: () => Promise<Schema<ColumnTypes>>;
    updateSchema: (newSchema: Schema) => Promise<void>;
    db: Database<db0.Connector<unknown>>;
    schema: S;
    setDatabase: (newDb: Database) => /*elided*/ any;
    transaction: (cb: () => Promise<void>) => Promise<void>;
};
interface DriverOptions {
    findRaw: (table: string, params: object) => string;
    findOneRaw: (table: string, primaryKey: any, params: object) => string;
    updateRaw: (table: string, item: object, params: object) => string;
    updateOneRaw: (table: string, primaryKey: any, item: object, params: object) => string;
    removeRaw: (table: string, params: object) => string;
    removeOneRaw: (table: string, primaryKey: any, params: object) => string;
    createOneRaw: (table: string, item: object) => string;
    retrieveSchema: (db: Database) => Promise<Schema>;
    updateSchema: (db: Database, newSchema: Schema) => Promise<void>;
    runTransaction: (db: Database, cb: () => Promise<void>) => Promise<void>;
}

export { ColumnTypeToTsType, ColumnTypes, PrimaryKeyValue, QueryParams, Schema, Table, TableName, defineDriver, defineSchema, defineTable };
export type { DriverOptions };
