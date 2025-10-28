import { withUuid } from '@hubify/api/collections'

export default defineCollection(withUuid({
  policy: {
    type: 'one-to-many',
    table: 'hubify_policies',
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE'
  },
  role: {
    type: 'one-to-many',
    table: 'hubify_roles',
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE'
  }
}))
