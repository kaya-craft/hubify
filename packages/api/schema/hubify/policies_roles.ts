import { withUuid } from '@hubify/api/collections'

export default defineCollection(withUuid({
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
