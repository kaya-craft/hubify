import { defineCollection, withDefaults } from '#hubify'

/**
 * Migration for creating the `hubify_settings` table.
 */
export default defineCollection({
  columns: withDefaults({
    projectName: {
      type: 'string'
    },
    projectDescription: {
      type: 'text',
      nullable: true
    }
  })
})
