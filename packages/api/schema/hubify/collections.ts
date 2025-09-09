export const columns = defineTableColumns({
  /**
   * Primary key for the table.
   */
  id: {
    type: 'integer',
    primaryKey: true
  },
  /**
   * Name of the collection.
   */
  name: {
    type: 'text',
    notNull: true
  },
  /**
   * Description of the collection.
   */
  description: {
    type: 'text',
    notNull: false
  },
  /**
   * Color display for the collection.
   * This can be used for UI purposes to visually distinguish collections.
   */
  color: {
    type: 'text',
    notNull: false
  },
  /**
   * Icon representing the collection.
   * This can be a URL to an icon or a string representing an icon name.
   */
  icon: {
    type: 'text',
    notNull: false
  },
  /**
   * Hidden flag for the collection.
   * If true, the collection will not be displayed in the UI.
   */
  hidden: {
    type: 'boolean',
    notNull: false,
    default: false
  },
  /**
   * Singleton flag for the collection.
   * If true, only one instance of this collection can exist.
   */
  singleton: {
    type: 'boolean',
    notNull: false,
    default: false
  },

  /**
   * Display template for the collection.
   */
  displayTemplate: {
    type: 'text',
    notNull: false
  },

  /**
   * Timestamp when the collection was created.
   */
  createdAt: {
    type: 'timestamp',
    default: 'CURRENT_TIMESTAMP'
  },
  /**
   * Timestamp when the collection was last updated.
   * This is automatically set to the current timestamp when the record is updated.
   */
  updatedAt: {
    type: 'timestamp',
    default: 'CURRENT_TIMESTAMP'
  }
})
