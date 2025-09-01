import { columns } from '@hubify/api/schema/hubify/users'

export const fields = defineFieldOptions(columns, {
  id: false,
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
  password: false,
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
  createdAt: false,
  updatedAt: false
})
