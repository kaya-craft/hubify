import { columns } from '@hubify/api/schema/hubify/settings'

export const fields = defineFieldOptions(columns, {
  id: false,
  createdAt: false,
  updatedAt: false,

  name: {
    order: 1,
    input: {
      component: 'text',
      label: 'Project Name',
      class: 'col-span-6',
      props: {
        placeholder: 'Project Name'
      }
    },
    display: {
      class: 'text-lg'
    }
  },

  logo: {
    order: 2,
    input: {
      component: 'file-upload',
      class: 'col-span-6 w-96 min-h-48',
      props: {
        label: 'Drop your image here',
        description: 'SVG, PNG, JPG or GIF (max. 2MB)'
      }
    },
    display: {
      component: 'color'
    }
  },

  description: {
    order: 3,
    input: {
      component: 'textarea',
      label: 'Project Description',
      class: 'col-span-6'
    }
  },

  primaryColor: {
    order: 4,
    input: {
      component: 'color-picker',
      label: 'Color',
      class: 'col-span-6 max-w-64'
    },
    display: {
      component: 'color'
    }
  }
})
