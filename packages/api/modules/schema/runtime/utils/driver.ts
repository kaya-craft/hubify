import createDriver from '@hubify/restql/drivers/sqlite'
import schema from '#hubify/schema'

const db = createDriver(schema)
db.setDatabase(useDatabase('hubify'))

export const useDb = () => db
