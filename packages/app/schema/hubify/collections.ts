import { columns } from '@hubify/api/schema/hubify/collections'

export const fields = defineColumnOptions(columns, {
  id: false,
  createdAt: {
    display: {
      component: 'date-display'
    }
  },
  updatedAt: {
    display: {
      component: 'date-display'
    }
  },
  color: {
    field: {
      component: 'color-picker',
      label: 'Color',
      class: 'col-span-6'
    },
    display: {
      component: 'color-display'
    }
  },
  description: {
    field: {
      component: 'input-text',
      label: 'Description',
      class: 'col-span-6',
      props: {
        placeholder: 'Description',
        type: 'text'
      }
    }
  },
  hidden: {
    field: {
      component: 'switch',
      label: 'Hidden',
      class: 'col-span-6',
      props: {
        description: 'If true, the collection will not be displayed in the UI.'
      }
    },
    display: {
      component: 'checkbox-display'
    }
  },
  icon: {
    field: {
      component: 'icon-picker',
      label: 'Icon',
      class: 'col-span-6'
    },
    display: {
      component: 'icon-display'
    }
  },
  name: {
    field: {
      component: 'input-text',
      label: 'Name',
      class: 'col-span-6',
      props: {
        placeholder: 'Name',
        type: 'text'
      }
    },
    display: {
      class: 'text-red-600'
    }
  },
  singleton: {
    field: {
      component: 'switch',
      label: 'Singleton',
      class: 'col-span-6',
      props: {
        description: 'If true, only one instance of this collection can exist.'
      }
    },
    display: {
      component: 'checkbox-display'
    }
  }
})
