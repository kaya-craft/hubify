/* eslint-disable @typescript-eslint/no-explicit-any */
import type { TableColumns } from '@hubify/api/modules/schema/runtime/utils/define.js'
import type { AllowedComponentProps, Component, VNodeProps } from 'vue'

export function defineColumnFields<C extends TableColumns, const F extends Fields<C>>(_columns: C, fields: F): F {
  return fields
}

type Fields<C extends TableColumns> = {
  [K in keyof C]?: C[K]['type'] extends keyof FieldByDataTypes ? FieldByDataTypes[C[K]['type']] : {
    component: null
  }
}

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
    [P in keyof FieldComponents]: K extends ComponentDataTypes<FieldComponents[P]> ? {
      component: P
      props?: Simplify<ComponentProps<FieldComponents[P]>>
      class?: string
    } : never
  }[keyof FieldComponents]
}

type Simplify<T> = { [K in keyof T]: T[K] } & {}
