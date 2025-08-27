import { columns } from '@hubify/api/schema/hubify/collections'

export const fields = defineColumnFields(columns, {
  id: false,
  createdAt: false,
  updatedAt: false,
  color: {
    component: 'color-picker',
    label: 'Color',
    class: 'col-span-6'
  },
  description: {
    component: 'input-text',
    label: 'Description',
    class: 'col-span-6',
    props: {
      placeholder: 'Description',
      type: 'text'
    }
  },
  hidden: {
    component: 'switch',
    label: 'Hidden',
    class: 'col-span-6',
    props: {
      description: 'If true, the collection will not be displayed in the UI.'
    }
  },
  icon: {
    component: 'icon-selector',
    label: 'Icon',
    class: 'col-span-6',
    props: {
      placeholder: 'Icon',
      type: 'text'
    }
  },
  name: {
    component: 'input-text',
    label: 'Name',
    class: 'col-span-6',
    props: {
      placeholder: 'Name',
      type: 'text'
    }
  },
  singleton: {
    component: 'switch',
    label: 'Singleton',
    class: 'col-span-6',
    props: {
      description: 'If true, only one instance of this collection can exist.'
    }
  }
})
