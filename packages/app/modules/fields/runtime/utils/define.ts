/* eslint-disable @typescript-eslint/no-explicit-any */
import type { SchemaColumns } from '@hubify/api/modules/schema/runtime/utils/define'
import type { ColumnTypes, ColumnTypeToTsType } from '@hubify/restql'
import type { AllowedComponentProps, Component, VNodeProps } from 'vue'
import type { ZodType } from 'zod'

/**
 * Define column options for the specified columns.
 * @param _columns The columns to define options for.
 * @param options The options to apply to the columns.
 * @returns The defined column options.
 */
export function defineFieldOptions<C extends SchemaColumns, const O extends FieldOptions<C>>(_columns: C, options: O): O {
  return options
}

/**
 * Define the current field accepted data types.
 * This is used to define the field data types in the `defineExpose` function.
 * It is used to provide type information for the field data types in the Vue SFC.
 */
export function defineFieldDataTypes(..._dataTypes: ColumnTypes[]) {
  // return defineExpose({ dataTypes })
}

export type Input = {
  component: string
  props?: Record<string, any>
  class?: string
  label?: string
  rules?: (defaultRules: ZodType<any>) => ZodType<any>
}

export type Display = {
  component?: string
  props?: Record<string, any>
  class?: string
  label?: string
}

export type FieldOption = false | {
  input?: Input | false
  display?: Display | false
}

export type FieldOptions<C extends SchemaColumns> = {
  [K in keyof C]?: C[K]['type'] extends keyof FieldOptionByDataTypes
    ? FieldOptionByDataTypes[C[K]['type']] | false
    : false | {
      input?: false
      display?: Display | false
    }
}

export type TableFieldOptions<T extends TableNames> = FieldOptions<TableColumns<T>>

export type TableFieldOption<T extends TableNames, C extends TableColumnNames<T>> = TableFieldOptions<T>[C] extends infer U extends FieldOption ? U : never

export type TableFieldOptionValue<T extends TableNames, C extends TableColumnNames<T>> = ColumnTypeToTsType<TableColumn<T, C>['type']>

type ComponentProps<C extends Component> = C extends new (...args: any) => any
  ? Omit<InstanceType<C>['$props'], keyof VNodeProps | keyof AllowedComponentProps>
  : never

export type ComponentDataTypes<C extends Component> = C extends new (...args: any) => any
  ? InstanceType<C>['dataTypes'] extends readonly (infer T)[]
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

type InputByDataTypes = {
  [K in InputComponentDataTypes]: {
    [P in keyof InputComponents]: K extends ComponentDataTypes<InputComponents[P]> ? false | {
      component: P
      props?: Simplify<ComponentProps<InputComponents[P]>>
      class?: string
      label?: string
      rules?: (defaultRules: ZodType<any>) => ZodType<any>
    } : never
  }[keyof InputComponents]
}

type FieldOptionByDataTypes = {
  [K in InputComponentDataTypes | DisplayComponentDataTypes]: false | {
    input?: K extends InputComponentDataTypes ? InputByDataTypes[K] | false : false
    display?: K extends DisplayComponentDataTypes ? DisplayByDataTypes[K] | Display | true | false : Display | true | false
  }
}

type Simplify<T> = { [K in keyof T]: T[K] } & {}
