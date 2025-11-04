import { withId } from '@hubify/api/collections'

export default defineCollection(withId({
  policy: {
    type: 'many-to-one',
    table: 'hubify_policies',
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE'
  },
  role: {
    type: 'many-to-one',
    table: 'hubify_roles',
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE'
  }
}))
