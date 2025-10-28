import { withDefaults } from '@hubify/api/collections'

/**
 * Migration for creating the `hubify_settings` table.
 */
export default defineCollection(withDefaults({
  projectName: {
    type: 'varchar'
  },
  projectDescription: {
    type: 'text',
    nullable: true
  }
}))
