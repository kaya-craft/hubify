export const columns = defineTableColumns({
  /**
   * Primary key for the table.
   */
  id: {
    type: 'uuid',
    primaryKey: true
  },
  /**
   * Name of the project.
   */
  projectName: {
    type: 'text',
    notNull: true
  },
  /**
   * Description of the project.
   */
  projectDescription: {
    type: 'text',
    notNull: true
  },
  /**
   * Timestamp when the settings table was created.
   */
  createdAt: {
    type: 'timestamp',
    default: 'CURRENT_TIMESTAMP'
  },
  /**
   * Timestamp when the settings table was last updated.
   * This is automatically set to the current timestamp when the record is updated.
   */
  updatedAt: {
    type: 'timestamp',
    default: 'CURRENT_TIMESTAMP'
  }
})
