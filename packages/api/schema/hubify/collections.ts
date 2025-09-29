import { withDefaults } from '@hubify/api/collections'

/**
 * Collection schema definition for "collections" table.
 */
export default defineCollection(withDefaults({
  name: {
    type: 'varchar'
  },
  description: {
    type: 'text',
    nullable: true
  },
  color: {
    type: 'varchar',
    nullable: true
  },
  icon: {
    type: 'varchar',
    nullable: true
  },
  displayTemplate: {
    type: 'text',
    nullable: true
  },
  hidden: {
    type: 'boolean',
    default: false
  },
  singleton: {
    type: 'boolean',
    default: false
  }
}))
