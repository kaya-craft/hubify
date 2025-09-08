/**
 * Migration for creating the `hubify_credentials` table.
 */
export default defineTable((table, knex) => {
  table.increments('id').primary()
  table.text('publicKey').notNullable()
  table.integer('counter').notNullable()
  table.boolean('backedUp').notNullable().defaultTo(false)
  table.text('transports').notNullable()
  table
    .integer('userId')
    .unsigned()
    .references('id')
    .inTable('hubify_users')
    .onDelete('CASCADE')
    .onUpdate('CASCADE')
    .notNullable()
  table.timestamp('createdAt').defaultTo(knex.fn.now())
  table.timestamp('updatedAt').defaultTo(knex.fn.now())
})
