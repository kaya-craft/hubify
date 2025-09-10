import { defineCollection, withDefaults } from '#hubify'

/**
 * Collection schema definition for "collections" table.
 */
export default defineCollection({
  columns: withDefaults({
    name: {
      type: 'string'
    },
    description: {
      type: 'text'
    },
    color: {
      type: 'string'
    },
    icon: {
      type: 'string'
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
