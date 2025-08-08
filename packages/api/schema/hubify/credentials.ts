export const columns = defineTableColumns({
  id: {
    type: 'integer',
    primaryKey: true
  },
  publicKey: {
    type: 'text',
    notNull: true
  },
  counter: {
    type: 'int4',
    notNull: true
  },
  backedUp: {
    type: 'boolean',
    notNull: true,
    default: false
  },
  transports: {
    type: 'text',
    notNull: true
  }
})

export const relations = defineTableRelations({
  user: {
    table: 'hubify_users',
    fromKey: 'id',
    toKey: 'id',
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE'
  }
})
