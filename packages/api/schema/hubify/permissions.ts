import { withUuid } from '@hubify/api/collections'

export default defineCollection(withUuid({
  name: {
    type: 'varchar'
  },
  action: {
    type: 'enum',
    options: ['create', 'read', 'update', 'delete', 'view'],
    nullable: true
  },
  collection: {
    type: 'one-to-many',
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
