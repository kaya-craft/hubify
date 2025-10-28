import z from 'zod'
import type { DataTypeGroupProps } from '.'

/**
 * String data types group definition.
 */
export default {
  operators: ['$eq', '$neq', '$in', '$nin', '$startsWith', '$nstartsWith', '$endsWith', '$nendsWith', '$contains', '$ncontains', '$null', '$nnull'],
  types: {
    text: {
      create: (knex, name) => knex.text(name),
      validate: () => z.string()
    },
    varchar: {
      create: (knex, name, def) => knex.string(name, def.length),
      validate: def => z.string().max(def.length || 255)
    },
    char: {
      create: (knex, name, def) => knex.string(name, def.length),
      validate: def => z.string().max(def.length || 255)
    },
    uuid: {
      create: (knex, name) => knex.uuid(name),
      validate: () => z.uuid()
    },
    enum: {
      create: (knex, name, def) => knex.enum(name, def.options || []),
      validate: def => z.enum(def.options || [])
    }
  }
} satisfies DataTypeGroupProps
