/**
 * Migration for creating the `hubify_users` table.
 */

export default defineTable((table, knex) => {
  table.increments('id').primary()
  table.text('email').notNullable().unique()
  table.text('password').nullable()
  table.text('firstname').nullable()
  table.text('lastname').nullable()
  table.integer('role').unsigned().references('id').inTable('hubify_roles').onDelete('SET NULL').onUpdate('CASCADE').nullable()
  table.timestamp('createdAt').defaultTo(knex.fn.now())
  table.timestamp('updatedAt').defaultTo(knex.fn.now())
})
