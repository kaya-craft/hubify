import { withUuid } from '@hubify/api/collections'

export default defineCollection(withUuid({
  name: {
    type: 'varchar'
  },
  description: {
    type: 'text',
    nullable: true
  },
  permissions: {
    type: 'many-to-many',
    table: 'hubify_permissions',
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
    through: 'hubify_policies_permissions',
    throughKey: 'policy'
  },
  roles: {
    type: 'many-to-many',
    table: 'hubify_roles',
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
    through: 'hubify_policies_roles',
    throughKey: 'policy'
  }
}))
