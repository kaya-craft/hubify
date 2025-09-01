/**
 * Update schema upon modification.
 */
export default defineNitroPlugin(async (nitroApp) => {
  const { schema, updateSchema, find } = useDb()
  await updateSchema(schema)

  /**
   * Add to hubify_collections new tables created using schema definition
   */
  const collections = await find('hubify_collections', {
    columns: ['name'],
    where: {
      name: {
        $nlike: 'hubify_'
      }
    }
  })

  const schemaTablesNames = Object.keys(schema).filter(t => !t.startsWith('hubify_'))
  const collectionsNames = collections.map(c => c.name)

  const diff = schemaTablesNames.filter(name => !collectionsNames.includes(name))

  if (diff.length === 0) return

  for await (const table of diff) {
    await nitroApp.hooks.callHook('hubify:table:created', { table })
  }
})
