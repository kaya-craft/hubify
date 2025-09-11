/* eslint-disable @typescript-eslint/no-explicit-any */
import type { Knex } from 'knex'
import type { FieldDefinition } from './types'
import { z } from 'zod'

export const DATA_TYPES = {
  string: {
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
    }
  },
  number: {
    integer: {
      create: (knex, name, def, isRelational) => !isRelational && 'autoIncrement' in def && def.autoIncrement ? knex.increments(name, { primaryKey: false }) : knex.integer(name),
      validate: () => z.number().int()
    },
    bigInteger: {
      create: (knex, name) => knex.bigInteger(name),
      validate: () => z.bigint().or(z.string().regex(/^\d+$/).transform(BigInt))
    },
    float: {
      create: (knex, name, def) => knex.float(name, def.precision, def.scale),
      validate: (def) => {
        let schema = z.number()
        if (def.precision) {
          schema = schema.refine((val) => {
            const [integerPart, decimalPart] = val.toString().split('.')
            return integerPart && integerPart.length <= (def.precision! - (def.scale || 0)) && (!decimalPart || decimalPart.length <= (def.scale || 0))
          }, {
            message: `Number exceeds defined precision of ${def.precision} and scale of ${def.scale || 0}`
          })
        }
        return schema
      }
    },
    decimal: {
      create: (knex, name, def) => knex.decimal(name, def.precision, def.scale),
      validate: (def) => {
        let schema = z.number()
        if (def.precision) {
          schema = schema.refine((val) => {
            const [integerPart, decimalPart] = val.toString().split('.')
            return integerPart && integerPart.length <= (def.precision! - (def.scale || 0)) && (!decimalPart || decimalPart.length <= (def.scale || 0))
          }, {
            message: `Number exceeds defined precision of ${def.precision} and scale of ${def.scale || 0}`
          })
        }
        return schema
      }
    },
    double: {
      create: (knex, name) => knex.double(name),
      validate: () => z.number()
    },
    real: {
      create: (knex, name) => knex.float(name),
      validate: () => z.number()
    },
    smallint: {
      create: (knex, name) => knex.specificType(name, 'smallint'),
      validate: () => z.number().int().refine(val => val >= -32768 && val <= 32767, { message: 'Value must be between -32768 and 32767' })
    },
    mediumint: {
      create: (knex, name) => knex.specificType(name, 'mediumint'),
      validate: () => z.number().int().refine(val => val >= -8388608 && val <= 8388607, { message: 'Value must be between -8388608 and 8388607' })
    }
  },
  boolean: {
    boolean: {
      create: (knex, name) => knex.boolean(name),
      validate: () => z.boolean()
    },
    bool: {
      create: (knex, name) => knex.boolean(name),
      validate: () => z.boolean()
    },
    tinyint: {
      create: (knex, name) => knex.specificType(name, 'tinyint'),
      validate: () => z.number().int().refine(val => val === 0 || val === 1, { message: 'Value must be 0 or 1' })
    }
  },
  date: {
    date: {
      create: (knex, name) => knex.date(name),
      validate: () => z.preprocess((arg) => {
        if (typeof arg === 'string' || arg instanceof Date) return new Date(arg)
      }, z.date())
    },
    datetime: {
      create: (knex, name) => knex.dateTime(name),
      validate: () => z.preprocess((arg) => {
        if (typeof arg === 'string' || arg instanceof Date) return new Date(arg)
      }, z.date())
    },
    timestamp: {
      create: (knex, name) => knex.timestamp(name),
      validate: () => z.preprocess((arg) => {
        if (typeof arg === 'string' || arg instanceof Date) return new Date(arg)
      }, z.date())
    },
    time: {
      create: (knex, name) => knex.time(name),
      validate: () => z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9](:[0-5][0-9])?$/, { message: 'Invalid time format' })
    },
    year: {
      create: (knex, name) => knex.specificType(name, 'year'),
      validate: () => z.number().int().refine(val => val >= 1901 && val <= 2155, { message: 'Year must be between 1901 and 2155' })
    }
  },
  json: {
    json: {
      create: (knex, name) => knex.json(name),
      validate: () => z.any()
    },
    jsonb: {
      create: (knex, name) => knex.jsonb(name),
      validate: () => z.any()
    }
  },
  binary: {
    binary: {
      create: (knex, name) => knex.binary(name),
      validate: () => z.instanceof(Buffer)
    },
    blob: {
      create: (knex, name) => knex.binary(name),
      validate: () => z.instanceof(Buffer)
    }
  }
} satisfies Record<string, DataTypeDefinition>

/**
 * Get the data type group for a given data type.
 */
export function getDataTypeGroup(type: DataTypes) {
  for (const group of Object.keys(DATA_TYPES)) {
    if (type in DATA_TYPES[group as keyof typeof DATA_TYPES]) {
      return group as keyof typeof DATA_TYPES
    }
  }

  throw new Error(`Unsupported data type: ${type}`)
}

/**
 * Get the data type definition for a given data type.
 */
export function getDataTypeDefinition(type: DataTypes) {
  const group = getDataTypeGroup(type)
  const def = DATA_TYPES[group] as DataTypeDefinition
  const typeDef = def[type]
  if (!typeDef) throw new Error(`Unsupported data type: ${type}`)
  return typeDef
}

/**
 * Get the data type validator for a given data type.
 */
export function getDataTypeValidator(type: DataTypes) {
  return getDataTypeDefinition(type).validate
}

/**
 * Get the data type creator for a given data type.
 */
export function getDataTypeCreator(type: DataTypes) {
  return getDataTypeDefinition(type).create
}

type DataTypeDefinition = Record<string, {
  create: (knex: Knex.CreateTableBuilder, name: string, def: FieldDefinition, isRelational?: boolean) => Knex.ColumnBuilder
  validate: (def: FieldDefinition) => z.ZodTypeAny
}>

export type DataType<T extends DataTypes> = DataTypeGroup<T> extends infer U
  ? U extends 'number' ? number
    : U extends 'string' ? string
      : U extends 'boolean' ? boolean
        : U extends 'date' ? Date | string
          : U extends 'json' ? any
            : U extends 'bigint' ? bigint | string
              : never : never

export type DataTypeGroup<T extends DataTypes> = {
  [K in keyof typeof DATA_TYPES]: T extends keyof (typeof DATA_TYPES)[K] ? K : never
}[keyof typeof DATA_TYPES]

export type DataTypes = {
  [K in keyof typeof DATA_TYPES]: keyof (typeof DATA_TYPES)[K]
}[keyof typeof DATA_TYPES]
