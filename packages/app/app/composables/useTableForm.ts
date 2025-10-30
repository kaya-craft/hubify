import type { FormSubmitEvent } from '@nuxt/ui'
import type z from 'zod'
import { itemValidation } from '@hubify/api/validation'

export type TableFormState<T extends TableNames> = {
  [C in TableFieldNames<T>]: TableFieldType<T, C> | undefined
} extends infer U extends object ? U : never

export type TableFormSchema<T extends TableNames> = z.ZodObject<{
  [C in TableFieldNames<T>]: z.ZodType<TableFieldType<T, C> | undefined>
}>

export type TableFormSubmitEvent<T extends TableNames> = FormSubmitEvent<z.Infer<TableFormSchema<T>>>

export function useTableForm<T extends TableNames>(collection: T, initialState?: MaybeRef<Partial<TableFormState<T>>>) {
  /**
   * Table definition.
   */
  const { primaryKey, getColumnLabel, columnNames, getInput, getColumn, getInputComponent } = useTable(collection)

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
      await $fetch(`/api/items/${collection}/${id}` as '/api/items/:collection/:id', {
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
        description: `There was an error updating the item. ${String(error)}`
      })
      throw error
    }
  }

  /**
   * Create a new item in the database.
   */
  async function create(data: TableFormSubmitEvent<T>['data']) {
    try {
      await $fetch(`/api/items/${collection}` as '/api/items/:collection', {
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
        description: `There was an error creating the item. ${String(error)}`
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

      if (!isUndefined(id)) {
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
    return itemValidation(collection, {
      includePrimaryKey: false
    }) as TableFormSchema<T>
  }

  /**
   * Create default state.
   */
  function createTableState() {
    const state: Record<string, unknown> = {}

    for (const name of toValue(columnNames)) {
      const column = getColumn(name)
      if (!column) continue
      const input = getInput(name)
      if (input === false) continue
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
    getColumnLabel,
    getInput,
    getInputComponent,
    state,
    schema,
    submit
  }
}
