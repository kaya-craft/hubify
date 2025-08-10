import type { FormSubmitEvent } from '@nuxt/ui'
import type { ZodType } from 'zod'
import z from 'zod'

export type TableFormState<T extends TableNames> = {
  [C in TableColumnNames<T>]: TableFieldValue<T, C> | undefined
} extends infer U extends object ? U : never

export type TableFormSchema<T extends TableNames> = z.ZodObject<{
  [C in TableColumnNames<T>]: z.ZodType<TableFieldValue<T, C> | undefined>
}>

export type TableFormSubmitEvent<T extends TableNames> = FormSubmitEvent<z.Infer<TableFormSchema<T>>>

export function useTableForm<T extends TableNames>(collection: T, initialState?: MaybeRef<Partial<TableFormState<T>>>) {
  /**
   * Table definition.
   */
  const { primaryKey, columnNames, getField, getColumn, getFieldComponent } = useTable(collection)

  /**
   * Toast.
   */
  const { add } = useToast()

  /**
   * Loading state.
   */
  const loading = ref(false)

  /**
   * Primary key value.
   */
  const primaryKeyValue = computed(() => {
    const item = toValue(initialState)
    if (!item) return
    const pk = toValue(primaryKey) as keyof TableFormState<T>
    if (!pk) return
    return item[pk]
  })

  /**
   * Update an existing item to the database.
   */
  async function save(data: TableFormSubmitEvent<T>['data'], id: string) {
    try {
      await $fetch('/api/items/' + collection + '/' + id, {
        method: 'put',
        body: data
      })

      add({
        title: 'Item updated successfully',
        color: 'success',
        description: 'The item has been successfully updated.'
      })
    }
    catch (error) {
      add({
        title: 'Failed to update item',
        color: 'error',
        description: 'There was an error updating the item. ' + String(error)
      })
      throw error
    }
  }

  /**
   * Create a new item in the database.
   */
  async function create(data: TableFormSubmitEvent<T>['data']) {
    try {
      const id = await $fetch('/api/items/' + collection, {
        method: 'post',
        body: data
      })

      add({
        title: 'Item created successfully',
        color: 'success',
        description: 'The item has been successfully created.'
      })

      Object.assign(state, createTableState())
    }
    catch (error) {
      add({
        title: 'Failed to create item',
        color: 'error',
        description: 'There was an error creating the item. ' + String(error)
      })
      throw error
    }
  }

  /**
   * Submit handler for the form.
   */
  async function submit(event: TableFormSubmitEvent<T>) {
    try {
      loading.value = true

      const id = toValue(primaryKeyValue)

      if (typeof id !== 'undefined') {
        await save(event.data, String(id))
      }
      else {
        await create(event.data)
      }
    }
    finally {
      loading.value = false
    }
  }

  /**
   * Create zod schema for the table.
   */
  function createTableSchema() {
    const schema: Record<string, ZodType> = {}

    for (const name of toValue(columnNames)) {
      const column = getColumn(name)
      if (!column) continue
      const field = getField(name)
      if (field === false) continue
      const defaultRules = columnTypeToZod(column)
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

    for (const name of toValue(columnNames)) {
      const column = getColumn(name)
      if (!column) continue
      const field = getField(name)
      if (field === false) continue
      if (initialState && name in toValue(initialState)) {
        state[name] = toValue(initialState)[name as keyof Partial<TableFormState<T>>]
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
    loading,
    columnNames,
    getField,
    getFieldComponent,
    state,
    schema,
    submit
  }
}
