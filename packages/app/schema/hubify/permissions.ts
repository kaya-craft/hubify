export const fields = defineCollectionFields('hubify_permissions', {
  name: {
    order: 1,
    input: {
      class: 'col-span-4'
    }
  },
  collection: {
    order: 2,
    input: {
      component: '',
      class: 'col-span-4'
    }
  },
  action: {
    order: 3,
    input: {
      class: 'col-span-4',
      component: 'toggle-group'
    }
  },
  where: {
    order: 4,
    input: {
      component: '',
      props: {
        collectionKey: 'collection'
      }
    }
  }
})
