import { describe, expect, expectTypeOf, it } from 'vitest'
import { getAllJoinClauses, getJoinClauses, getWhereClauses, normalizeColumn } from './helpers'
import { defineSchema } from '..'

const schema = defineSchema({
  countries: {
    columns: {
      id: { type: 'uuid', primaryKey: true, notNull: true },
      name: { type: 'text', notNull: true },
      region: { type: 'text', notNull: true }
    },
    relations: {
      region: {
        table: 'regions',
        fromKey: 'region',
        toKey: 'id',
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE'
      },
      cities: {
        table: 'cities',
        fromKey: 'id',
        toKey: 'country',
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE'
      }
    }
  },
  regions: {
    columns: {
      id: { type: 'uuid', primaryKey: true, notNull: true },
      name: { type: 'text', notNull: true },
      planet: { type: 'text', notNull: true }
    },
    relations: {
      planet: {
        table: 'planets',
        fromKey: 'planet',
        toKey: 'id',
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE'
      }
    }
  },
  planets: {
    columns: {
      id: { type: 'uuid', primaryKey: true, notNull: true },
      name: { type: 'text', notNull: true },
      type: { type: 'text', notNull: true }
    }
  },
  cities: {
    columns: {
      id: { type: 'uuid', primaryKey: true, notNull: true },
      name: { type: 'text', notNull: true },
      country: { type: 'uuid', notNull: true }
    }
  }
})

describe('sqlite', () => {
  it ('should normalize columns', () => {
    const result = normalizeColumn(schema, 'countries', 'cities.name')
    expect(result).toBe('cities.name')
  })

  it('should create a where clause with a single condition', () => {
    const result = getWhereClauses(schema, 'countries', {
      'cities.name': {
        $like: '%some-city-name%'
      }
    })

    expect(result).toBe('cities.name LIKE \'%some-city-name%\'')
  })

  it('should create a where clause with multiple conditions', () => {
    const result = getWhereClauses(schema, 'countries', {
      'cities.name': {
        $like: '%some-city-name%'
      },
      'region.name': {
        $eq: 'Asia'
      }
    })

    expect(result).toBe('cities.name LIKE \'%some-city-name%\' AND regions.name = \'Asia\'')
  })

  it('should create a where clause with nested conditions', () => {
    const result = getWhereClauses(schema, 'countries', {
      $and: [
        { 'cities.name': { $like: '%some-city-name%' } },
        { 'region.name': { $eq: 'Asia' } }
      ]
    })

    expect(result).toBe('(cities.name LIKE \'%some-city-name%\' AND regions.name = \'Asia\')')
  })

  it('should create a where clause with OR conditions', () => {
    const result = getWhereClauses(schema, 'countries', {
      $or: [
        { 'cities.name': { $like: '%some-city-name%' } },
        { 'region.name': { $eq: 'Asia' } }
      ]
    })

    expect(result).toBe('(cities.name LIKE \'%some-city-name%\' OR regions.name = \'Asia\')')
  })

  it('should create a where clause with complex conditions', () => {
    const result = getWhereClauses(schema, 'countries', {
      'id': { $eq: 'some-uuid' },
      'region.planet.type': {
        $nin: ['terrestrial', 'gas giant']
      },
      '$and': [
        { 'cities.name': { $like: '%some-city-name%' } },
        {
          $or: [
            { 'region.name': { $eq: 'Asia' } },
            { 'region.name': { $eq: 'Europe' } }
          ]
        }
      ]
    })

    expect(result).toBe(
      'countries.id = \'some-uuid\' AND planets.type NOT IN (\'terrestrial\', \'gas giant\') AND (cities.name LIKE \'%some-city-name%\' AND (regions.name = \'Asia\' OR regions.name = \'Europe\'))'
    )

    expectTypeOf(result).toEqualTypeOf<'countries.id = \'some-uuid\' AND planets.type NOT IN (\'terrestrial\', \'gas giant\') AND (cities.name LIKE \'%some-city-name%\' AND (regions.name = \'Asia\' OR regions.name = \'Europe\'))'>()
  })

  it('should create a join clauses', () => {
    const result = getJoinClauses(schema, 'countries', 'cities.name')
    expect(result).toEqual(['INNER JOIN cities ON cities.country = countries.id'])
  })

  it('should create a join clauses with multiple relations', () => {
    const result = getJoinClauses(schema, 'countries', 'region.planet.name')
    expect(result).toEqual([
      'INNER JOIN regions ON regions.id = countries.region',
      'INNER JOIN planets ON planets.id = regions.planet'
    ])
  })

  it ('should not create join clauses for non-existing relations', () => {
    const result = getJoinClauses(schema, 'countries', 'name')
    expect(result).toEqual([])
  })

  it ('should create unique join clauses for given parameters', () => {
    const result = getAllJoinClauses(schema, 'countries', {
      columns: ['name', 'region.name', 'cities.name'],
      orderBy: ['-region.id', 'cities.name'],
      groupBy: ['region.name']
    })

    expect(result).toEqual([
      'INNER JOIN regions ON regions.id = countries.region',
      'INNER JOIN cities ON cities.country = countries.id'
    ])

    const result2 = getAllJoinClauses(schema, 'countries', {
      columns: ['name'],
      orderBy: ['-region.planet.id', 'cities.name']
    })

    expect(result2).toEqual([
      'INNER JOIN regions ON regions.id = countries.region',
      'INNER JOIN planets ON planets.id = regions.planet',
      'INNER JOIN cities ON cities.country = countries.id'
    ])
  })
})
