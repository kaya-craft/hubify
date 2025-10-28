export const fields = defineCollectionFields({
  admin: {
    input: {
      component: 'switch'
    }
  },
  icon: {
    input: {
      component: 'icon-picker'
    },
    display: {
      component: 'icon'
    }
  }
})
