import { defineCollection, withDefaults } from '#hubify'

/**
 * Collection schema definition for "collections" table.
 */
export default defineCollection({
  fields: withDefaults({
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
  })
})
