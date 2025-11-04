import { withUuid } from '@hubify/api/collections'

export const PERMISSION_ACTIONS = ['create', 'read', 'update', 'remove', 'view']

export default defineCollection(withUuid({
  name: {
    type: 'varchar'
  },
  action: {
    type: 'enum-array',
    options: PERMISSION_ACTIONS,
    nullable: true
  },
  collection: {
    type: 'many-to-one',
    table: 'hubify_collections',
    onDelete: 'SET NULL',
    onUpdate: 'CASCADE'
  },
  where: {
    type: 'json',
    nullable: true
  },
  policies: {
    type: 'many-to-many',
    table: 'hubify_policies',
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
    through: 'hubify_policies_permissions',
    throughKey: 'permission'
  }
}))
