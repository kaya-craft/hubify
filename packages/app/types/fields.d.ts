import type { AllowedComponentProps, Component, VNodeProps } from 'vue'
import type { TableNames, TableFieldNames, TableColumnNames, TableColumnType, TableField } from '@hubify/api/types/schema'
import type { DataTypeValidator } from '@hubify/api/database/data-types'
import type { ZodType } from 'zod'
import type { FieldDefinition } from '@hubify/api/database/types'

/* eslint-disable @typescript-eslint/no-explicit-any */
export type Input<D extends FieldDefinition['type'] = FieldDefinition['type']> = {
  [P in keyof InputComponents]: D extends ComponentDataTypes<InputComponents[P]> ? {
    component?: P
    props?: Partial<Simplify<ComponentProps<InputComponents[P]>>>
    class?: string
    label?: string
    rules?: (defaultRules: DataTypeValidator<D>) => ZodType<any>
  } : never
}[keyof InputComponents]

export type Display<D extends FieldDefinition['type'] = FieldDefinition['type']> = {
  [P in keyof DisplayComponents]: D extends ComponentDataTypes<DisplayComponents[P]> ? {
    component?: P
    props?: Partial<Simplify<ComponentProps<DisplayComponents[P]>>>
    class?: string
    label?: string
  } : never
}[keyof DisplayComponents]

export type FieldOption<D extends FieldDefinition['type'] = FieldDefinition['type']> = false | {
  order?: number
  label?: string
  input?: Input<D> | false
  display?: Display<D> | false
}

export type FieldOptions<T extends TableNames> = {
  [K in TableFieldNames<T>]?: FieldOption<TableField<T, K>['type']>
}

export type TableFieldOptions<T extends TableNames> = FieldOptions<T>
export type TableFieldOption<T extends TableNames, C extends TableColumnNames<T>> = TableColumnType<T, C> extends infer U ? FieldOption<U> : never
export type TableFieldOptionValue<T extends TableNames, C extends TableColumnNames<T>> = TableColumnType<T, C>

type ComponentProps<C extends Component> = C extends new (...args: any) => any
  ? Omit<InstanceType<C>['$props'], keyof VNodeProps | keyof AllowedComponentProps>
  : C extends (...args: any) => any ? NonNullable<ReturnType<C>['__ctx']>['props'] : never

type ComponentDataTypes<C extends Component> = C extends new (...args: any) => any
  ? InstanceType<C>['dataTypes'] extends readonly (infer T)[]
    ? T
    : never
  : C extends (...args: any) => any
    ? Parameters<NonNullable<ReturnType<C>['__ctx']>['expose']>[0] extends { dataTypes: readonly (infer T)[] }
      ? T
      : never
    : never

type InputComponents = {
  [K in keyof typeof import('#hubify/inputs').default]: typeof import('#hubify/inputs').default[K] extends () => Promise<infer C extends Component> ? C : never
}

type DisplayComponents = {
  [K in keyof typeof import('#hubify/displays').default]: typeof import('#hubify/displays').default[K] extends () => Promise<infer C extends Component> ? C : never
}

type InputComponentDataTypes = {
  [K in keyof InputComponents]: ComponentDataTypes<InputComponents[K]>
}[keyof InputComponents]

type DisplayComponentDataTypes = {
  [K in keyof DisplayComponents]: ComponentDataTypes<DisplayComponents[K]>
}[keyof DisplayComponents]

type Simplify<T> = { [K in keyof T]: T[K] } & {}
