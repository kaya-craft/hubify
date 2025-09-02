import { columns } from '@hubify/api/schema/hubify/roles'

export const fields = defineFieldOptions(columns, {
  id: false,

  name: {
    order: 1,
    input: {
      component: 'text',
      class: 'col-span-6'
    }
  },

  icon: {
    order: 2,
    input: {
      component: 'icon-picker',
      class: 'col-span-6'
    },
    display: {
      component: 'icon'
    }
  },

  description: {
    order: 3,
    input: {
      component: 'text',
      class: 'w-full'
    }
  }
})
