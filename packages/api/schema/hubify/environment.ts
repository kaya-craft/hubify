export const columns = defineTableColumns({
  id: {
    type: 'uuid',
    primaryKey: true
  },
  key: {
    type: 'varchar',
    notNull: true
  },
  value: {
    type: 'varchar',
    notNull: false
  },
  created_at: {
    type: 'timestamp',
    default: 'CURRENT_TIMESTAMP'
  },
  updated_at: {
    type: 'timestamp',
    default: 'CURRENT_TIMESTAMP'
  }
})
