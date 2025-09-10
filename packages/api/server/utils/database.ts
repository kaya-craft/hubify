import schema from '#hubify/schema'
import { createDatabaseInstance } from '@hubify/api/lib/database/index'

const instance = createDatabaseInstance(useRuntimeConfig().hubify?.db, schema)

export const useDatabase = () => instance
