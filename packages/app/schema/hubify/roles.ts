export const fields = defineCollectionFields({
  admin: {
    order: 3,
    input: {
      component: 'switch',
      class: 'col-span-3'
    }
  },
  icon: {
    order: 2,
    input: {
      component: 'icon-picker',
      class: 'col-span-3'
    },
    display: {
      component: 'icon'
    }
  },
  name: {
    order: 1,
    input: {
      class: 'col-span-3'
    }
  },
  description: {
    order: 4
  }
})
