import type { QueryParams, TableName } from '@hubify/restql'
import type tables from '#hubify/schema'
import type { NitroFetchRequest, AvailableRouterMethod } from 'nitropack/types'
import type { FetchOptions } from 'ofetch'
import type { Item } from '@hubify/restql/utils/helpers'

type InternalApiBody = {
  [K in TableName<typeof tables> as `/api/items/${K}`]: {
    post: {
      body: Item<typeof tables, K>
    }
    put: {
      body: Partial<Item<typeof tables, K>>
      params: QueryParams<typeof tables, K>
    }
    delete: {
      params: QueryParams<typeof tables, K>
    }
    get: {
      params: QueryParams<typeof tables, K>
    }
  }
} & {
  [K in TableName<typeof tables> as `/api/items/${K}/:id`]: {
    put: {
      body: Partial<Item<typeof tables, K>>
      params: QueryParams<typeof tables, K>
    }
    delete: {
      params: QueryParams<typeof tables, K>
    }
    get: {
      params: QueryParams<typeof tables, K>
    }
  }
}

type GenericEndpoints = {
  [K in TableName<typeof tables> as `/api/items/${K}`]: {
    post: Awaited<Item<typeof tables, K>>
    put: Awaited<Item<typeof tables, K>[]>
    delete: Awaited<Item<typeof tables, K>[]>
    get: Awaited<Item<typeof tables, K>[]>
  }
} & {
  [K in TableName<typeof tables> as `/api/items/${K}/:id`]: {
    put: Awaited<Item<typeof tables, K>>
    delete: Awaited<Item<typeof tables, K>>
    get: Awaited<Item<typeof tables, K>>
  }
}

declare module 'nitropack/types' {
  interface InternalApi extends GenericEndpoints {}

  interface NitroFetchOptions<R extends NitroFetchRequest, M extends AvailableRouterMethod<R> = AvailableRouterMethod<R>> extends FetchOptions {
    method?: Uppercase<M> | M
    body?: R extends keyof InternalApiBody
      ? M extends keyof InternalApiBody[R]
        ? InternalApiBody[R][M] extends infer U
          ? U extends { body: infer B }
            ? B
            : never
          : unknown
        : unknown
      : unknown
    params?: R extends keyof InternalApiBody
      ? M extends keyof InternalApiBody[R]
        ? InternalApiBody[R][M] extends infer U
          ? U extends { params: infer P }
            ? P
            : never
          : unknown
        : unknown
      : unknown
  }
}
