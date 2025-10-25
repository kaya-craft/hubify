import { Trim } from 'type-fest';
import { S as Schema, a as TableName, F as FieldName, g as ConditionTree, c as CleanJoin, P as PrimaryKeyValue, W as WhereWithPrimaryKey, I as Item, q as PrimaryKey } from '../../shared/restql.BvbKE3f7.js';
import { Select, From, Joins, Where, GroupBy, OrderBy, Limit, Offset, Update, Set, Returning, Insert, Values, Remove } from '../../utils/statements.js';
import 'type-fest/source/union-to-tuple';
import 'type-fest/source/join';

/**
 * Write a SQL query to find a single record in a table with specified parameters.
 */
declare function findOneRaw<const S extends Schema>(schema: S): <T extends TableName<S>, const K extends PrimaryKeyValue<S, T>, const P extends FindOneParams<S, T>>(table: T, key: K, params: P) => FindOneRaw<S, T, K, P>;
/**
 * Write a SQL query to find records in a table with specified parameters.
 */
declare function findRaw<const S extends Schema>(schema: S): <T extends TableName<S>, const P extends FindParams<S, T>>(table: T, params: P) => FindRaw<S, T, P>;
/**
 * Write a SQL query to remove records from a table with specified parameters.
 */
declare function removeRaw<const S extends Schema>(schema: S): <T extends TableName<S>, const P extends RemoveParams<S, T>>(table: T, params: P) => RemoveRaw<S, T, P>;
/**
 * Write a SQL query to remove a single record from a table with specified parameters.
 */
declare function removeOneRaw<const S extends Schema>(schema: S): <T extends TableName<S>, const K extends PrimaryKeyValue<S, T>, const P extends RemoveOneParams<S, T>>(table: T, key: K, params?: P) => RemoveOneRaw<S, T, K, P>;
/**
 * Write a SQL query to update records in a table with specified parameters.
 */
declare function updateRaw<const S extends Schema>(schema: S): <T extends TableName<S>, const I extends Partial<Item<S, T>>, const P extends UpdateParams<S, T>>(table: T, item: I, params: P) => UpdateRaw<S, T, I, P>;
/**
 * Write a SQL query to update a single record in a table with specified parameters.
 */
declare function updateOneRaw<const S extends Schema>(schema: S): <T extends TableName<S>, const K extends PrimaryKeyValue<S, T>, const I extends Partial<Item<S, T>>, const P extends UpdateOneParams<S, T>>(table: T, key: K, item: I, params?: P) => UpdateOneRaw<S, T, K, I, P>;
/**
 * Write a SQL query to create a single record in a table.
 */
declare function createOneRaw<const S extends Schema>(schema: S): <T extends TableName<S>, const I extends Partial<Item<S, T>>>(table: T, item: I) => CreateOneRaw<S, T, I>;
/**
 * Write a SQL query to get the SQLite database schema.
 */
declare function schemaRaw(): string;
interface FindParams<S extends Schema = Schema, T extends TableName<S> = TableName<S>> {
    columns?: FieldName<S, T>[];
    where?: ConditionTree<S, T>;
    orderBy?: `${'' | '-'}${FieldName<S, T>}`[];
    groupBy?: FieldName<S, T>[];
    limit?: number;
    offset?: number;
}
type FindOneParams<S extends Schema = Schema, T extends TableName<S> = TableName<S>> = Pick<FindParams<S, T>, 'columns' | 'where'>;
type RemoveParams<S extends Schema = Schema, T extends TableName<S> = TableName<S>> = Pick<FindParams<S, T>, 'where'>;
type RemoveOneParams<S extends Schema = Schema, T extends TableName<S> = TableName<S>> = Pick<FindParams<S, T>, 'where'>;
type UpdateParams<S extends Schema = Schema, T extends TableName<S> = TableName<S>> = Pick<FindParams<S, T>, 'where'>;
type UpdateOneParams<S extends Schema = Schema, T extends TableName<S> = TableName<S>> = Pick<FindParams<S, T>, 'where'>;
type CreateOneRaw<S extends Schema, T extends TableName<S>, I extends Partial<Item<S, T>>> = Trim<CleanJoin<[
    Insert<T>,
    Values<S, T, I>,
    Returning<['*']>
], ' '>>;
type UpdateOneRaw<S extends Schema, T extends TableName<S>, K extends PrimaryKeyValue<S, T>, I extends Partial<Item<S, T>>, P extends UpdateOneParams<S, T>> = Trim<CleanJoin<[
    Update<T>,
    Set<S, T, I>,
    Where<S, T, WhereWithPrimaryKey<S, T, K, P>>,
    Returning<['*']>
], ' '>>;
type UpdateRaw<S extends Schema, T extends TableName<S>, I extends Partial<Item<S, T>>, P extends UpdateParams<S, T>> = Trim<CleanJoin<[
    Update<T>,
    Set<S, T, I>,
    Where<S, T, P['where']>,
    Returning<['*']>
], ' '>>;
type RemoveRaw<S extends Schema, T extends TableName<S>, P extends RemoveParams<S, T>> = Trim<CleanJoin<[
    Remove<T>,
    Where<S, T, P['where']>,
    Returning<[PrimaryKey<S, T>]>
], ' '>>;
type RemoveOneRaw<S extends Schema, T extends TableName<S>, K extends PrimaryKeyValue<S, T>, P extends RemoveOneParams<S, T>> = Trim<CleanJoin<[
    Remove<T>,
    Where<S, T, WhereWithPrimaryKey<S, T, K, P>>,
    Returning<[PrimaryKey<S, T>]>
], ' '>>;
type FindRaw<S extends Schema, T extends TableName<S>, P extends FindParams<S, T>> = Trim<CleanJoin<[
    Select<S, T, P['columns']>,
    From<S, T>,
    Joins<S, T, P>,
    Where<S, T, P['where']>,
    GroupBy<S, T, P['groupBy']>,
    OrderBy<S, T, P['orderBy']>,
    Limit<P['limit']>,
    Offset<P['offset']>
], ' '>>;
type FindOneRaw<S extends Schema, T extends TableName<S>, K extends PrimaryKeyValue<S, T>, P extends FindOneParams<S, T>> = Trim<CleanJoin<[
    Select<S, T, P['columns']>,
    From<S, T>,
    Joins<S, T, P>,
    Where<S, T, WhereWithPrimaryKey<S, T, K, P>>
], ' '>>;
type FindRawFn<S extends Schema> = <T extends TableName<S>, const P extends FindParams<S, T>>(table: T, params: P) => FindRaw<S, T, P>;
type FindOneRawFn<S extends Schema> = <T extends TableName<S>, const K extends PrimaryKeyValue<S, T>, const P extends FindOneParams<S, T>>(table: T, key: K, params?: P) => FindOneRaw<S, T, K, P>;
type RemoveRawFn<S extends Schema> = <T extends TableName<S>, const P extends RemoveParams<S, T>>(table: T, params: P) => RemoveRaw<S, T, P>;
type RemoveOneRawFn<S extends Schema> = <T extends TableName<S>, const K extends PrimaryKeyValue<S, T>, const P extends RemoveOneParams<S, T>>(table: T, key: K, params?: P) => RemoveOneRaw<S, T, K, P>;
type UpdateRawFn<S extends Schema> = <T extends TableName<S>, const I extends Partial<Item<S, T>>, const P extends UpdateParams<S, T>>(table: T, item: I, params: P) => UpdateRaw<S, T, I, P>;
type UpdateOneRawFn<S extends Schema> = <T extends TableName<S>, const K extends PrimaryKeyValue<S, T>, const I extends Partial<Item<S, T>>, const P extends UpdateOneParams<S, T>>(table: T, key: K, item: I, params?: P) => UpdateOneRaw<S, T, K, I, P>;
type CreateOneRawFn<S extends Schema> = <T extends TableName<S>, const I extends Partial<Item<S, T>>>(table: T, item: I) => CreateOneRaw<S, T, I>;

export { createOneRaw, findOneRaw, findRaw, removeOneRaw, removeRaw, schemaRaw, updateOneRaw, updateRaw };
export type { CreateOneRaw, CreateOneRawFn, FindOneParams, FindOneRaw, FindOneRawFn, FindParams, FindRaw, FindRawFn, RemoveOneParams, RemoveOneRaw, RemoveOneRawFn, RemoveParams, RemoveRaw, RemoveRawFn, UpdateOneParams, UpdateOneRaw, UpdateOneRawFn, UpdateParams, UpdateRaw, UpdateRawFn };
