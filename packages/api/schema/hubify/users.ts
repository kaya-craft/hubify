export const columns = defineTableColumns({
  id: {
    type: 'int4',
    primaryKey: true
  },
  email: {
    type: 'text',
    unique: true,
    notNull: true
  },
  password: {
    type: 'int8',
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
