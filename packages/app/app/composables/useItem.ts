export function useItem<T extends TableNames>(collection: T, id: MaybeRef<string | number>) {
  return useFetch(`/api/items/${collection}/${toValue(id)}` as `/api/items/:collection/:id`)
}
