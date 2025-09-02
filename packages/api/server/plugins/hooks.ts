export default defineNitroPlugin((nitroApp) => {
  const { createOne } = useDb()

  nitroApp.hooks.hook('hubify:table:created', async ({ table }) => {
    try {
      await createOne('hubify_collections', { name: table })
      console.info(`Table "${table}" added to hubify_collections`)
    }
    catch (error) {
      console.error('Error adding table to hubify_collections:', error)
    }
  })
})
