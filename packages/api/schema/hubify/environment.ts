/**
 * Migration for creating the `hubify_environment` table.
 */
export default defineTable((table, knex) => {
  table.increments('id').primary()
  table.text('key').notNullable().unique()
  table.text('value').nullable()
  table.timestamp('createdAt').defaultTo(knex.fn.now())
  table.timestamp('updatedAt').defaultTo(knex.fn.now())
})
