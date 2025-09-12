import { withDefaults } from '@hubify/api/collections'

export default defineCollection(withDefaults({
  name: {
    type: 'varchar'
  }
}))

export const fields = defineCollectionFields({
  id: {
    input: false,
    display: {
      component: 'text'
    }
  },
  icon: {
    input: {
      component: 'icon-picker',
      label: 'Icon',
      class: 'col-span-6'
    },
    display: {
      component: 'icon'
    }
  },
  name: {
    input: {
      component: 'text',
      label: 'Name'
    },
    display: {
      component: 'text'
    }
  },
  createdAt: {
    input: false,
    display: {
      component: 'date'
    }
  },
  updatedAt: {
    input: false,
    display: {
      component: 'date'
    }
  }
})
