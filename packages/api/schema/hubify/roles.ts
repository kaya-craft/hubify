import { defineCollection, withDefaults } from '#hubify'

/**
 * Migration for creating the `hubify_roles` table.
 */
export default defineCollection({
  fields: withDefaults({
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
  })
})
