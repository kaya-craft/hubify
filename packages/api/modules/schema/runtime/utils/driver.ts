import schema from '#hubify/schema'
import { createDatabaseInstance } from '../../utils/database'

const instance = createDatabaseInstance(useRuntimeConfig().hubify?.db, schema)

export const useDatabase = () => instance
