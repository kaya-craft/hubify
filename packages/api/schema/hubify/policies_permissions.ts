import { withUuid } from '@hubify/api/collections'

export default defineCollection(withUuid({
  policy: {
    type: 'one-to-many',
    table: 'hubify_policies',
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE'
  },
  permission: {
    type: 'one-to-many',
    table: 'hubify_permissions',
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE'
  }
}))
