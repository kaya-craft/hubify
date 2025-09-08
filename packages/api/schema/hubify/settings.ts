/**
 * Migration for creating the `hubify_settings` table.
 */
export default defineTable((table, knex) => {
  table.increments('id').primary()
  table.text('projectName').notNullable()
  table.text('projectDescription').notNullable()
  table.timestamp('createdAt').defaultTo(knex.fn.now())
  table.timestamp('updatedAt').defaultTo(knex.fn.now())
})
