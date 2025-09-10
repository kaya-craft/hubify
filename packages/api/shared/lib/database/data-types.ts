export const DATA_TYPES = {
  string: ['string', 'text', 'varchar', 'char', 'uuid', 'enum'],
  number: ['integer', 'bigInteger', 'float', 'decimal', 'double', 'real', 'smallint', 'mediumint'],
  boolean: ['boolean', 'bool', 'tinyint'],
  date: ['date', 'datetime', 'timestamp', 'time', 'year'],
  json: ['json', 'jsonb'],
  binary: ['binary', 'blob']
} as const
