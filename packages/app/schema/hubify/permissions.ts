export const fields = defineCollectionFields({
  where: {
    input: {
      component: 'system-filter',
      props: {
        collectionKey: 'collection'
      }
    }
  }
})
