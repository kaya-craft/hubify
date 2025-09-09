export const fields = defineFields({
  id: false,
  createdAt: false,
  updatedAt: false,

  projectDescription: {
    input: {
      component: 'text',
      label: 'Project Description',
      class: 'col-span-6',
      props: {
        placeholder: 'Project Description',
        type: 'text'
      }
    }
  },

  projectName: {
    input: {
      component: 'text',
      label: 'Project Name',
      class: 'col-span-6',
      props: {
        placeholder: 'Project Name',
        type: 'text'
      }
    }
  }
})
