import { defineCollection, withDefaults } from '#hubify'

/**
 * Migration for creating the `hubify_environment` table.
 */
export default defineCollection({
  fields: withDefaults({
    key: {
      type: 'string',
      unique: true
    },
    value: {
      type: 'text',
      nullable: true
    }
  })
})
