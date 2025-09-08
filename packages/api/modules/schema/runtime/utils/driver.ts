import { createDatabaseInstance } from '../../utils/database'

const instance = createDatabaseInstance(useRuntimeConfig().hubify?.db)

export const useDatabase = () => instance
