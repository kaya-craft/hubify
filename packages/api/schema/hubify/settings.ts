import { withDefaults } from '@hubify/api/collections'

/**
 * Migration for creating the `hubify_settings` table.
 */
export default defineCollection(withDefaults({
  /**
   * Name of the project.
   */
  name: {
    type: 'varchar'
  },
  /**
   * Description of the project.
   */
  description: {
    type: 'text',
    nullable: true
  },
  /**
   * Primary color
   */
  primaryColor: {
    type: 'varchar',
    nullable: true
  },
  /**
   * Project logo
   */
  logo: {
    type: 'varchar',
    nullable: true
  }
}))
