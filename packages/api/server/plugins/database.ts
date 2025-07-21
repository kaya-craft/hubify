/**
 * Update schema upon modification.
 */
export default defineNitroPlugin(async () => {
  const { schema, updateSchema } = useDb()
  await updateSchema(schema)
})
