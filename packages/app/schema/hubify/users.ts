import { columns } from '@hubify/api/schema/hubify/users'

export const fields = defineColumnFields(columns, {
  id: {
    component: 'input-number',
    props: {
      cool: 2
    }
  },
  email: {
    component: 'input-text',
    props: {
      salut: 'hello'
    }
  }
})
