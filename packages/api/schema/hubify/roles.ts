import { withDefaults } from '@hubify/api/collections'

/**
 * Migration for creating the `hubify_roles` table.
 */
export default defineCollection(withDefaults({
  name: {
    type: 'varchar'
  },
  description: {
    type: 'text',
    nullable: true
  },
  icon: {
    type: 'varchar',
    default: 'heroicons:shield-check'
  },
  admin: {
    type: 'boolean',
    default: false
  }
}))
