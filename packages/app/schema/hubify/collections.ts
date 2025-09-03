import { columns } from '@hubify/api/schema/hubify/collections'

export const fields = defineFieldOptions(columns, {
  id: {
    input: false
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
      component: 'textarea',
      label: 'Description',
      class: 'col-span-6',
      props: {
        placeholder: 'Description',
        type: 'text'
      }
    }
  },
  displayTemplate: {
    input: {
      component: 'system-collection-display',
      label: 'Display Template',
      class: 'col-span-6',
      props: { collectionKey: 'name' }
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
