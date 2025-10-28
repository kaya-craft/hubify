import { withDefaults } from '@hubify/api/collections'

/**
 * Migration for creating the `hubify_environment` table.
 */
export default defineCollection(withDefaults({
  key: {
    type: 'varchar',
    unique: true
  },
  value: {
    type: 'text',
    nullable: true
  }
}))
