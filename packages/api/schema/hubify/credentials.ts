import { withDefaults } from '@hubify/api/collections'

/**
 * Migration for creating the `hubify_credentials` table.
 */
export default defineCollection(withDefaults({
  publicKey: {
    type: 'text'
  },
  counter: {
    type: 'integer'
  },
  backedUp: {
    type: 'boolean',
    default: false
  },
  transports: {
    type: 'text'
  },
  user: {
    type: 'many-to-one',
    table: 'hubify_users',
    foreignKey: 'id',
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
    nullable: true
  }
}))
