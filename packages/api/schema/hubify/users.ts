export const columns = defineTableColumns({
  /**
   * Primary key for the table.
   */
  id: {
    type: 'integer',
    primaryKey: true
  },
  /**
   * Email address of the user.
   * This must be unique across all users.
   */
  email: {
    type: 'text',
    unique: true,
    notNull: true
  },
  /**
   * Password for the user account.
   */
  password: {
    type: 'text',
    notNull: false
  },
  /**
   * Firstname of the user.
   */
  firstname: {
    type: 'text',
    notNull: false
  },
  /**
   * Lastname of the user.
   */
  lastname: {
    type: 'text',
    notNull: false
  },

  role: {
    type: 'integer'
  },

  /**
   * Timestamp when the user was created.
   */
  createdAt: {
    type: 'timestamp',
    default: 'CURRENT_TIMESTAMP'
  },
  /**
   * Timestamp when the user was last updated.
   * This is automatically set to the current timestamp when the record is updated.
   */
  updatedAt: {
    type: 'timestamp',
    default: 'CURRENT_TIMESTAMP'
  }
})

/**
 * Define relationships between tables.
 */
export const relations = defineTableRelations({
  role: {
    fromKey: 'id',
    toKey: 'id',
    table: 'roles'
  }
})
