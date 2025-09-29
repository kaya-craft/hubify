import type { QueryParams } from '@hubify/restql'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { ref, type MaybeRef } from 'vue'
import type z from 'zod'
import { getFetchMock, getRelationMock, getToastMocks, setRelationResult } from './setup'

const getPrimaryKeyMock = vi.fn(() => 'id')

vi.mock('@hubify/restql/utils/helpers', () => ({
  getPrimaryKey: getPrimaryKeyMock
}))

vi.mock('#hubify/schema', () => ({
  default: {
    countries: {},
    cities: {}
  }
}))
async function useCollectionComposable() {
  const { useCollection } = await import('../../composables/useCollection')
  return useCollection('countries' as TableNames)
}

let fetchMock: ReturnType<typeof getFetchMock>
let toastSuccess: ReturnType<typeof getToastMocks>['success']
let toastAlert: ReturnType<typeof getToastMocks>['alert']
let relationMock: ReturnType<typeof getRelationMock>

beforeEach(() => {
  fetchMock = getFetchMock()
  const toasts = getToastMocks()
  toastSuccess = toasts.success
  toastAlert = toasts.alert
  relationMock = getRelationMock()
  setRelationResult({ table: 'cities' as TableNames, toKey: 'country_id' })

  getPrimaryKeyMock.mockReset()
  getPrimaryKeyMock.mockReturnValue('id')
})

describe('useCollection', () => {
  it('add an item and triggers success toast', async () => {
    const payload = { name: 'France' } as z.infer<TableFormSchema<'countries'>>
    fetchMock.mockResolvedValue({ id: 101 })

    const { add, loading } = await useCollectionComposable()

    const pending = add(payload)
    expect(loading.value).toBe(true)

    const result = await pending

    expect(result).toEqual({ id: 101 })
    expect(loading.value).toBe(false)
    expect(fetchMock).toHaveBeenCalledWith('/api/items/countries', expect.objectContaining({
      method: 'post',
      body: payload
    }))
    expect(toastSuccess).toHaveBeenCalledWith('app.toast.create-item.title', 'app.toast.create-item.success')
    expect(toastAlert).not.toHaveBeenCalled()
  })

  it('shows alert when create fails', async () => {
    const error = new Error('create exploded')
    fetchMock.mockRejectedValue(error)
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

    const { add, loading } = await useCollectionComposable()

    const pending = add({} as z.infer<TableFormSchema<'countries'>>)
    expect(loading.value).toBe(true)

    await pending

    expect(loading.value).toBe(false)
    expect(toastAlert).toHaveBeenCalledWith('app.toast.create-item.title', 'app.toast.create-item.error')
    expect(toastSuccess).not.toHaveBeenCalled()
    expect(consoleSpy).toHaveBeenCalledWith(error.message)

    consoleSpy.mockRestore()
  })

  it('skips remove when ids list is empty', async () => {
    const { remove, loading } = await useCollectionComposable()

    const result = await remove([])

    expect(result).toBeUndefined()
    expect(loading.value).toBe(false)
    expect(fetchMock).not.toHaveBeenCalled()
  })

  it('removes items by id and emits success toast', async () => {
    fetchMock.mockResolvedValue('ok')

    const { remove, loading } = await useCollectionComposable()

    const pending = remove(ref([1, 2]) as MaybeRef<(string | number)[]>)
    expect(loading.value).toBe(true)

    const response = await pending

    expect(response).toBe('ok')
    expect(loading.value).toBe(false)
    expect(fetchMock).toHaveBeenCalledWith('/api/items/countries', expect.objectContaining({
      method: 'delete',
      query: {
        where: {
          id: {
            $in: [1, 2]
          }
        }
      }
    }))
    expect(toastSuccess).toHaveBeenCalledWith('app.toast.delete-item.title', 'app.toast.delete-item.success')
  })

  it('alerts when remove fails', async () => {
    const boom = new Error('boom')
    fetchMock.mockRejectedValue(boom)
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

    const { remove, loading } = await useCollectionComposable()

    await remove([1])

    expect(loading.value).toBe(false)
    expect(toastAlert).toHaveBeenCalledWith('app.toast.create-item.title', 'app.toast.create-item.error Error: boom')
    expect(toastSuccess).not.toHaveBeenCalled()
    expect(consoleSpy).toHaveBeenCalledWith(boom)

    consoleSpy.mockRestore()
  })

  it('updates items with provided body and query', async () => {
    fetchMock.mockResolvedValue({ updated: true })

    const { update, loading } = await useCollectionComposable()
    const body = { name: 'Updated' } as z.infer<Partial<TableFormSchema<'countries'>>>
    const query = { where: { id: { $eq: 42 } } } as QueryParams<Schema, 'countries'>

    const pending = update(body, query)
    expect(loading.value).toBe(true)

    const result = await pending

    expect(result).toEqual({ updated: true })
    expect(loading.value).toBe(false)
    expect(fetchMock).toHaveBeenCalledWith('/api/items/countries', expect.objectContaining({
      method: 'put',
      body,
      query
    }))
    expect(toastSuccess).toHaveBeenCalledWith('app.toast.update-item.title', 'app.toast.update-item.success')
  })

  it('alerts when update fails', async () => {
    const failure = new Error('cannot update')
    fetchMock.mockRejectedValue(failure)
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

    const { update, loading } = await useCollectionComposable()

    await update({}, undefined)

    expect(loading.value).toBe(false)
    expect(toastAlert).toHaveBeenCalledWith('app.toast.update-item.title', 'app.toast.update-item.error Error: cannot update')
    expect(consoleSpy).toHaveBeenCalledWith(failure)

    consoleSpy.mockRestore()
  })

  it('attaches related records using relation metadata', async () => {
    fetchMock.mockResolvedValue(undefined)

    const { attach, loading } = await useCollectionComposable()

    const promise = attach(10 as TablePrimaryKeyValue<'countries'>, 'cities', { id: 1 } as TableItem<'cities'>, 2 as TablePrimaryKeyValue<'cities'>, 1 as TablePrimaryKeyValue<'cities'>)
    expect(loading.value).toBe(true)

    await promise

    expect(loading.value).toBe(false)
    expect(relationMock).toHaveBeenCalledWith('cities')
    expect(getPrimaryKeyMock).toHaveBeenCalledWith(expect.any(Object), 'cities')
    expect(fetchMock).toHaveBeenCalledWith('/api/items/cities', expect.objectContaining({
      method: 'put',
      query: {
        where: {
          id: {
            $in: [1, 2]
          }
        }
      },
      body: {
        country_id: 10
      }
    }))
    expect(toastSuccess).toHaveBeenCalledWith('app.toast.attach-item.title')
  })

  it('alerts when attach fails', async () => {
    fetchMock.mockRejectedValue(new Error('attach failed'))
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

    const { attach, loading } = await useCollectionComposable()

    await attach(5 as TablePrimaryKeyValue<'countries'>, 'cities')

    expect(loading.value).toBe(false)
    expect(toastAlert).toHaveBeenCalledWith('app.toast.detach-item.title')
    expect(toastSuccess).not.toHaveBeenCalled()
    expect(consoleSpy).toHaveBeenCalledTimes(1)

    consoleSpy.mockRestore()
  })

  it('detaches related records and confirms success toast', async () => {
    fetchMock.mockResolvedValue(undefined)

    const { detach, loading } = await useCollectionComposable()

    const promise = detach('cities', { id: 3 } as TableItem<'cities'>, 4 as TablePrimaryKeyValue<'cities'>)
    expect(loading.value).toBe(true)

    await promise

    expect(loading.value).toBe(false)
    expect(fetchMock).toHaveBeenCalledWith('/api/items/cities', expect.objectContaining({
      method: 'put',
      query: {
        where: {
          id: {
            $in: [3, 4]
          }
        }
      },
      body: {
        country_id: null
      }
    }))
    expect(toastSuccess).toHaveBeenCalledWith('app.toast.detach-item.title')
  })

  it('alerts when detach fails', async () => {
    fetchMock.mockRejectedValue(new Error('detach oops'))
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

    const { detach, loading } = await useCollectionComposable()

    await detach('cities', 1 as TablePrimaryKeyValue<'cities'>)

    expect(loading.value).toBe(false)
    expect(toastAlert).toHaveBeenCalledWith('app.toast.detach-item.title')
    expect(toastSuccess).not.toHaveBeenCalled()
    expect(consoleSpy).toHaveBeenCalledTimes(1)

    consoleSpy.mockRestore()
  })
})
