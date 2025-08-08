export const columns = defineTableColumns({
  id: {
    type: 'integer',
    primaryKey: true
  },
  name: {
    type: 'text',
    notNull: true
  },
  description: {
    type: 'text',
    notNull: false
  },
  createdAt: {
    type: 'timestamp',
    default: 'CURRENT_TIMESTAMP'
  },
  updatedAt: {
    type: 'timestamp',
    default: 'CURRENT_TIMESTAMP'
  }
})
