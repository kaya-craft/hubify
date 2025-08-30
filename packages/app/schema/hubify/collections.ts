import { columns } from '@hubify/api/schema/hubify/collections'

export const fields = defineFieldOptions(columns, {
  id: false,
  createdAt: {
    display: {
      component: 'date'
    }
  },
  updatedAt: {
    display: {
      component: 'date'
    }
  },
  color: {
    input: {
      component: 'color-picker',
      label: 'Color',
      class: 'col-span-6'
    },
    display: {
      component: 'color'
    }
  },
  description: {
    input: {
      component: 'text',
      label: 'Description',
      class: 'col-span-6',
      props: {
        placeholder: 'Description',
        type: 'text'
      }
    }
  },
  hidden: {
    input: {
      component: 'switch',
      label: 'Hidden',
      class: 'col-span-6',
      props: {
        description: 'If true, the collection will not be displayed in the UI.'
      }
    },
    display: {
      component: 'checkbox'
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
    input: {
      component: 'switch',
      label: 'Singleton',
      class: 'col-span-6',
      props: {
        description: 'If true, only one instance of this collection can exist.'
      }
    },
    display: {
      component: 'checkbox'
    }
  }
})
