export const fields = defineCollectionFields('hubify_users', {
  id: false,
  password: false,
  email: {
    input: {
      component: 'text',
      label: 'Email',
      class: 'col-span-6',
      props: {
        placeholder: 'Email',
        type: 'email',
        disabled: true
      }
    }
  },
  firstname: {
    input: {
      component: 'text',
      label: 'First Name',
      class: 'col-span-6',
      props: {
        placeholder: 'First Name',
        type: 'text'
      }
    }
  },
  lastname: {
    input: {
      component: 'text',
      label: 'Last Name',
      class: 'col-span-6',
      props: {
        placeholder: 'Last Name',
        type: 'text'
      }
    }
  },
  role: {
    input: {
      class: 'col-span-6'
    }
  },
  createdAt: false,
  updatedAt: false
})
