import type { AllowedComponentProps, Component, VNodeProps } from 'vue'
import type { TableNames, TableColumnNames, TableColumn, TableColumnType } from '@hubify/api/types/schema'
import type { DataTypes, DataTypeValidator } from '@hubify/api/database/data-types'

type ColumnToZod<T extends TableNames, C extends TableColumnNames<T>> = TableColumn<T, C>['type'] extends infer U extends DataTypes ? DataTypeValidator<U> : never

/* eslint-disable @typescript-eslint/no-explicit-any */
export type Input<T extends TableNames, C extends TableColumnNames<T>> = {
  component?: string
  props?: Record<string, any>
  class?: string
  label?: string
  rules?: (rules: ColumnToZod<T, C>) => ZodType<any>
}

export type Display = {
  component?: string
  props?: Record<string, any>
  class?: string
  label?: string
}

export type FieldOption<T extends TableNames, C extends TableColumnNames<T>> = false | {
  order?: number
  label?: string
  input?: Input<T, C> | false
  display?: Display | false
}

export type FieldOptions<T extends TableNames> = {
  [K in TableColumnNames<T>]?: TableColumn<T, K>['type'] extends infer U extends keyof FieldOptionByDataTypes<T, K>
    ? FieldOptionByDataTypes<T, K>[U] extends infer I ? I extends boolean ? I : I & Omit<Exclude<FieldOption<T, K>, boolean>, keyof I> : never
    : FieldOption<T, K>
}

export type TableFieldOptions<T extends TableNames> = FieldOptions<T>

export type TableFieldOption<T extends TableNames, C extends TableColumnNames<T>> = TableFieldOptions<T>[C] extends infer U extends FieldOption<T, C> ? U : never

export type TableFieldOptionValue<T extends TableNames, C extends TableColumnNames<T>> = TableColumnType<T, C>

type ComponentProps<C extends Component> = C extends new (...args: any) => any
  ? Omit<InstanceType<C>['$props'], keyof VNodeProps | keyof AllowedComponentProps>
  : C extends (...args: any) => any ? NonNullable<ReturnType<C>['__ctx']>['props'] : never

export type ComponentDataTypes<C extends Component> = C extends new (...args: any) => any
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

type DisplayByDataTypes = {
  [K in DisplayComponentDataTypes]: {
    [P in keyof DisplayComponents]: K extends ComponentDataTypes<DisplayComponents[P]> ? false | {
      component?: P
      props?: Simplify<ComponentProps<DisplayComponents[P]>>
      class?: string
      label?: string
    } : never
  }[keyof DisplayComponents]
}

type InputByDataTypes<T extends TableNames, C extends TableColumnNames<T>> = {
  [K in InputComponentDataTypes]: {
    [P in keyof InputComponents]: K extends ComponentDataTypes<InputComponents[P]> ? false | {
      component: P
      props?: Simplify<ComponentProps<InputComponents[P]>>
      class?: string
      label?: string
      rules?: (defaultRules: ColumnToZod<T, C>) => ZodType<any>
    } : never
  }[keyof InputComponents]
}

type FieldOptionByDataTypes<T extends TableNames, C extends TableColumnNames<T>> = {
  [K in InputComponentDataTypes | DisplayComponentDataTypes]: false | {
    input?: K extends InputComponentDataTypes ? InputByDataTypes<T, C>[K] : Input | false
    display?: K extends DisplayComponentDataTypes ? DisplayByDataTypes[K] : Display | false
  }
}

type Simplify<T> = { [K in keyof T]: T[K] } & {}
