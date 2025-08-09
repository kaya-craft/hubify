/* eslint-disable @typescript-eslint/no-explicit-any */
import type { SchemaColumns } from '@hubify/api/modules/schema/runtime/utils/define'
import type { ColumnTypes, ColumnTypeToTsType, PrimaryKey } from '@hubify/restql'
import type { AllowedComponentProps, Component, VNodeProps } from 'vue'
import type { ZodType } from 'zod'

export function defineColumnFields<C extends SchemaColumns, const F extends Fields<C>>(_columns: C, fields: F): F {
  return fields
}

/**
 * Define the current field accepted data types.
 * This is used to define the field data types in the `defineExpose` function.
 * It is used to provide type information for the field data types in the Vue SFC.
 */
export function defineFieldDataTypes(..._dataTypes: ColumnTypes[]) {
  // return defineExpose({ dataTypes })
}

export type Field = false | {
  component: string
  props?: Record<string, any>
  class?: string
  label?: string
  rules?: (defaultRules: ZodType<any>) => ZodType<any>
}

export type Fields<C extends SchemaColumns> = {
  [K in keyof C]?: C[K]['type'] extends keyof FieldByDataTypes ? FieldByDataTypes[C[K]['type']] : false
}

export type TableFields<T extends TableNames> = Fields<TableColumns<T>>
export type TableField<T extends TableNames, C extends TableColumnNames<T>> = TableFields<T>[C] extends infer U extends Field ? U : never
export type TableFieldValue<T extends TableNames, C extends TableColumnNames<T>> = ColumnTypeToTsType<TableColumn<T, C>['type']>
export type TablePrimaryKey<T extends TableNames> = Extract<PrimaryKey<Schema, T>, string | number>
export type TablePrimaryKeyValue<T extends TableNames> = Extract<TablePrimaryKey<T> extends keyof TableItem<T> ? TableItem<T>[TablePrimaryKey<T>] : never, string | number>

type ComponentProps<C extends Component> = C extends new (...args: any) => any
  ? Omit<InstanceType<C>['$props'], keyof VNodeProps | keyof AllowedComponentProps>
  : never

type ComponentDataTypes<C extends Component> = C extends new (...args: any) => any
  ? InstanceType<C>['dataTypes'] extends readonly (infer T)[]
    ? T
    : never
  : never

type FieldComponents = {
  [K in keyof typeof import('#hubify/fields').default]: typeof import('#hubify/fields').default[K] extends () => Promise<infer C extends Component> ? C : never
}

type FieldComponentDataTypes = {
  [K in keyof FieldComponents]: ComponentDataTypes<FieldComponents[K]>
}[keyof FieldComponents]

type FieldByDataTypes = {
  [K in FieldComponentDataTypes]: {
    [P in keyof FieldComponents]: K extends ComponentDataTypes<FieldComponents[P]> ? false | {
      component: P
      props?: Simplify<ComponentProps<FieldComponents[P]>>
      class?: string
      label?: string
      rules?: (defaultRules: ZodType<any>) => ZodType<any>
    } : never
  }[keyof FieldComponents]
}

type Simplify<T> = { [K in keyof T]: T[K] } & {}
