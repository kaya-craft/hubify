export default defineNitroPlugin((nitroApp) => {
  nitroApp.hooks.hook('hubify:table:created', async ({ table }) => {
    try {
      await $fetch(`/api/items/hubify_collections`, {
        method: 'POST',
        body: {
          name: table
        }
      })
      console.info('Table added to hubify_collections:', table)
      return table
    }
    catch (error) {
      console.error('Error adding table to hubify_collections:', error)
    }
  })
})
