import schema from '#hubify/schema'
import createDriver from '@hubify/restql/drivers/sqlite'

const db = createDriver(schema)
db.setDatabase(useDatabase('hubify'))

export const useDb = () => db
