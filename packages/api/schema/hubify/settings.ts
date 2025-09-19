export const columns = defineTableColumns({
  /**
   * Primary key for the table.
   */
  id: {
    type: 'integer',
    primaryKey: true
  },
  /**
   * Name of the project.
   */
  name: {
    type: 'text'
  },
  /**
   * Description of the project.
   */
  description: {
    type: 'text'
  },
  /**
   * Primary color
   */
  primaryColor: {
    type: 'text'
  },
  /**
   * Project logo
   */
  logo: {
    type: 'text'
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
