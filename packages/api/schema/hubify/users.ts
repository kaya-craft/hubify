export const columns = defineTableColumns({
  id: {
    type: 'integer',
    primaryKey: true
  },
  email: {
    type: 'text',
    unique: true,
    notNull: true
  },
  password: {
    type: 'text',
    notNull: false
  },
  firstname: {
    type: 'text',
    notNull: false
  },
  lastname: {
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
