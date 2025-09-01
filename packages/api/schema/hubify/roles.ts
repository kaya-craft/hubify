export const columns = defineTableColumns({
  /**
   * Primary key for the table.
   */
  id: {
    type: 'integer',
    primaryKey: true
  },

  /**
   * Name of the role.
   */
  name: {
    type: 'varchar',
    notNull: true
  },

  /**
   * Description of the role.
   */
  description: {
    type: 'text'
  },

  /**
   * Icon representing the role.
   */
  icon: {
    type: 'varchar',
    default: 'heroicons:user-circle'
  }
})

export const relations = defineTableRelations({
  /**
     * Relation to the users table.
     * A role can have many users.
     */
  users: {
    table: 'users',
    fromKey: 'id',
    toKey: 'role',
    onDelete: 'SET NULL',
    onUpdate: 'CASCADE'
  }
})
