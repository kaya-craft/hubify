/**
 * Migration for creating the `hubify_collections` table.
 */
export default defineTable((table, knex) => {
  table.increments('id').primary()
  table.text('name').notNullable()
  table.text('description').nullable()
  table.text('color').nullable()
  table.text('icon').nullable()
  table.boolean('hidden').defaultTo(false)
  table.boolean('singleton').defaultTo(false)
  table.timestamp('createdAt').defaultTo(knex.fn.now())
  table.timestamp('updatedAt').defaultTo(knex.fn.now())
})
