import { withUuid } from '@hubify/api/collections'

export default defineCollection(withUuid({
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
