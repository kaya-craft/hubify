import fields from '#hubify/fields'
import tables from '#hubify/schema'
import type { Field, Fields } from '@@/modules/fields/runtime/utils/define'
import type { ColumnTypeToTsType, TableColumn } from '@hubify/restql'
import type { FormSubmitEvent } from '@nuxt/ui'
import type { AsyncComponentLoader } from 'vue'
import type { ZodType } from 'zod'
import z from 'zod'
import InputText from '~/components/fields/input-text.vue'

export type TableFormTables = keyof typeof tables & string
export type TableFormTable<T extends TableFormTables> = typeof tables[T]
export type TableFormColumns<T extends TableFormTables> = keyof typeof tables[T]['columns'] & string
export type TableFormColumn<T extends TableFormTables, C extends TableFormColumns<T>> = typeof tables[T]['columns'][C] extends infer U extends TableColumn ? U : never
export type TableFormFields<T extends TableFormTables> = Fields<TableFormTable<T>['columns']>
export type TableFormField<T extends TableFormTables, C extends TableFormColumns<T>> = TableFormFields<T>[C] extends infer U extends Field ? U : never
export type TableFormFieldValue<T extends TableFormTables, C extends TableFormColumns<T>> = ColumnTypeToTsType<TableFormColumn<T, C>['type']>

export type TableFormState<T extends TableFormTables> = {
  [C in TableFormColumns<T>]: TableFormFieldValue<T, C> | undefined
} extends infer U extends object ? U : never

export type TableFormSchema<T extends TableFormTables> = z.ZodObject<{
  [C in TableFormColumns<T>]: z.ZodType<TableFormFieldValue<T, C> | undefined>
}>

export function useTableForm<T extends TableFormTables>(table: T, intialState?: MaybeRef<Partial<TableFormState<T>>>) {
  /**
   * Columns of the table.
   */
  const columns = computed(() => {
    return Object.keys(tables[table]?.columns || {}) as TableFormColumns<T>[]
  })

  /**
   * Get the column with the specified name.
   */
  function getColumn<C extends TableFormColumns<T>>(name: C) {
    if (!tables[table]) throw new Error(`Table "${table}" does not exist.`)
    if (!(name in tables[table].columns)) throw new Error(`Column "${name}" does not exist in table "${table}".`)
    const columns = tables[table].columns
    return columns[name as keyof typeof columns] as TableFormColumn<T, C> | undefined
  }

  /**
   * Get the field for the specified column.
   */
  function getField<C extends TableFormColumns<T>>(column: C) {
    const tableFields = tables[table]?.fields as TableFormFields<T> | undefined
    return tableFields?.[column] as TableFormField<T, C>
  }

  /**
   * Get the field component for the specified column.
   */
  function getFieldComponent<C extends TableFormColumns<T>>(column: C) {
    const field = getField(column)

    if (field === false) return

    if (!field?.component) return InputText

    return defineAsyncComponent(fields[field.component as keyof typeof fields] as AsyncComponentLoader)
  }

  /**
   * Submit handler for the form.
   */
  async function submit(event: FormSubmitEvent<z.Infer<TableFormSchema<T>>>) {
    // Implement form submission logic here
    console.log('Form submitted with state:', event)
  }

  /**
   * Create zod schema for the table.
   */
  function createTableSchema() {
    const schema: Record<string, ZodType> = {}

    for (const name of toValue(columns)) {
      const column = getColumn(name)
      if (!column) continue
      const field = getField(name)
      if (field === false) continue
      const defaultRules = defaultFieldRules(column)
      const rules = field?.rules?.(defaultRules) ?? defaultRules

      schema[name] = column.notNull ? rules : rules.optional()
    }

    return z.object(schema) as TableFormSchema<T>
  }

  /**
   * Create default state.
   */
  function createTableState() {
    const state: Record<string, unknown> = {}

    for (const name of toValue(columns)) {
      const column = getColumn(name)
      if (!column) continue
      const field = getField(name)
      if (field === false) continue
      if (intialState && name in toValue(intialState)) {
        state[name] = toValue(intialState)[name as keyof Partial<TableFormState<T>>]
      }
      else {
        state[name] = column.default ?? undefined
      }
    }

    return state as TableFormState<T>
  }

  /**
   * Base state for the form.
   */
  const state = reactive(createTableState())

  /**
     * ZOD Schema for the table.
     */
  const schema = createTableSchema()

  return {
    columns,
    getField,
    getFieldComponent,
    state,
    schema,
    submit
  }
}

/**
 * Default field rules based on the column type.
 */
function defaultFieldRules(column: TableColumn) {
  switch (column.type) {
    case 'int8':
    case 'int4':
    case 'numeric':
      return z.number().int()
    case 'float4':
      return z.number()
    case 'text':
    case 'varchar':
      return z.string()
    case 'uuid':
      return z.uuid()
    case 'timestamp':
    case 'timestamptz':
      return z.iso.datetime()
    case 'date':
      return z.date()
    case 'boolean':
      return z.boolean()
    case 'json':
    default:
      return z.any() // Fallback for unsupported types
  }
}
