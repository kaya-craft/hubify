/**
 * Migration for creating the `hubify_roles` table.
 */
export default defineTable((table, knex) => {
  table.increments('id').primary()
  table.text('name').notNullable()
  table.text('description').nullable()
  table.text('icon').defaultTo('heroicons:user-circle')
  table.boolean('admin').defaultTo(false)
  table.timestamp('createdAt').defaultTo(knex.fn.now())
  table.timestamp('updatedAt').defaultTo(knex.fn.now())
})
