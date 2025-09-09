import type { ColumnDefinition } from '@hubify/api/types/database'
import type { AllowedComponentProps, Component, VNodeProps } from 'vue'
import type { ZodType } from 'zod'

/* eslint-disable @typescript-eslint/no-explicit-any */
export type Input = {
  component?: string
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
  order?: number
  label?: string
  input?: Input | false
  display?: Display | false
}

export type FieldOptions<C extends Record<string, ColumnDefinition>> = {
  [K in keyof C]?: C[K]['type'] extends keyof FieldOptionByDataTypes
    ? FieldOptionByDataTypes[C[K]['type']] extends infer I ? I extends boolean ? I : I & Omit<Exclude<FieldOption, boolean>, keyof I> : never
    : FieldOption
}

export type TableFieldOptions<T extends TableNames> = FieldOptions<TableColumns<T>>

export type TableFieldOption<T extends TableNames, C extends TableColumnNames<T>> = TableFieldOptions<T>[C] extends infer U extends FieldOption ? U : never

export type TableFieldOptionValue<T extends TableNames, C extends TableColumnNames<T>> = TableColumnType<T, C>

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
    input?: K extends InputComponentDataTypes ? InputByDataTypes[K] : Input | false
    display?: K extends DisplayComponentDataTypes ? DisplayByDataTypes[K] : Display | false
  }
}

type Simplify<T> = { [K in keyof T]: T[K] } & {}
