import { withId } from '@hubify/api/collections'

export default defineCollection(withId({
  policy: {
    type: 'many-to-one',
    table: 'hubify_policies',
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE'
  },
  permission: {
    type: 'many-to-one',
    table: 'hubify_permissions',
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE'
  }
}))
