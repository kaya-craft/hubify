import { columns } from '@hubify/api/schema/hubify/environment'
import type { ZodString } from 'zod'

export const fields = defineColumnOptions(columns, {
  id: false,
  created_at: false,
  updated_at: false,
  key: {
    component: 'input-text',
    label: 'Key',
    class: 'col-span-6',
    rules: rules => (rules as ZodString).regex(/^[a-zA-Z0-9_]+$/, 'Key can only contain letters, numbers, and underscores'),
    props: {
      placeholder: 'Enter key here'
    }
  },
  value: {
    component: 'input-text',
    label: 'Value',
    class: 'col-span-6',
    props: {
      placeholder: 'Enter value here'
    }
  }
})
