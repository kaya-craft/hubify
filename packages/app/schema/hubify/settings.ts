import { columns } from '@hubify/api/schema/hubify/settings'

export const fields = defineColumnFields(columns, {
  id: false,
  createdAt: false,
  updatedAt: false,

  projectDescription: {
    component: 'input-text',
    label: 'Project Description',
    class: 'col-span-6',
    props: {
      placeholder: 'Project Description',
      type: 'text'
    }
  },
  projectName: {
    component: 'input-text',
    label: 'Project Name',
    class: 'col-span-6',
    props: {
      placeholder: 'Project Name',
      type: 'text'
    }
  }
})
