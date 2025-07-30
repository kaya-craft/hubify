import { columns } from '@hubify/api/schema/hubify/users'

export const fields = defineColumnFields(columns, {
  id: false,
  email: {
    component: 'input-text',
    label: 'Email',
    class: 'col-span-6',
    props: {
      placeholder: 'Email',
      type: 'email',
      disabled: true
    }
  },
  password: {
    component: 'input-text',
    label: 'Password',
    class: 'col-span-6',
    props: {
      placeholder: 'Password',
      type: 'password'
    }
  },
  firstname: {
    component: 'input-text',
    label: 'First Name',
    class: 'col-span-6',
    props: {
      placeholder: 'First Name',
      type: 'text'
    }
  },
  lastname: {
    component: 'input-text',
    label: 'Last Name',
    class: 'col-span-6',
    props: {
      placeholder: 'Last Name',
      type: 'text'
    }
  },
  createdAt: false,
  updatedAt: false

})
