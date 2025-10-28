import type { NitroFetchRequest, AvailableRouterMethod } from 'nitropack/types'
import type { FetchOptions } from 'ofetch'

type InternalApiBody = {
  [K in TableNames as `/api/items/${K}`]: {
    post: {
      body: TableItem<K>
    }
    put: {
      body: Partial<TableItem<K>>
      params: QueryParams<K>
    }
    delete: {
      params: QueryParams<K>
    }
    get: {
      params: QueryParams<K>
    }
  }
} & {
  [K in TableNames as `/api/items/${K}/:id`]: {
    put: {
      body: Partial<TableItem<K>>
      params: QueryParams<K>
    }
    delete: {
      params: QueryParams<K>
    }
    get: {
      params: QueryParams<K>
    }
  }
}

type GenericEndpoints = {
  [K in TableNames as `/api/items/${K}`]: {
    post: Awaited<TableItem<K>>
    put: Awaited<TableItem<K>[]>
    delete: Awaited<TableItem<K>[]>
    get: Awaited<TableItem<K>[]>
  }
} & {
  [K in TableNames as `/api/items/${K}/:id`]: {
    put: Awaited<TableItem<K>>
    delete: Awaited<TableItem<K>>
    get: Awaited<TableItem<K>>
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
