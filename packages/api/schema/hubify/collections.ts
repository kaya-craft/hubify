import { withDefaults } from '@hubify/api/collections'

/**
 * Collection schema definition for "collections" table.
 */
export default defineCollection(withDefaults({
  name: {
    type: 'varchar'
  },
  description: {
    type: 'text'
  },
  color: {
    type: 'varchar'
  },
  icon: {
    type: 'varchar'
  },
  displayTemplate: {
    type: 'text'
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
