import { beforeEach, describe, expect, it, vi } from 'vitest'
import { useCollection } from '~/composables/useCollection'

// Mock the dependencies that aren't handled by the setup file
vi.mock('#hubify/displays', () => ({
  default: {
    text: () => Promise.resolve({ name: 'TextDisplay' }),
    'system-one-to-many': () => Promise.resolve({ name: 'SystemOneToManyDisplay' })
  }
}))

vi.mock('#hubify/inputs', () => ({
  default: {
    text: () => Promise.resolve({ name: 'TextInput' }),
    'system-one-to-many': () => Promise.resolve({ name: 'SystemOneToManyInput' })
  }
}))

vi.mock('#hubify/fields', () => ({
  default: {
    countries: {
      id: { order: 0, label: 'ID' },
      name: { order: 1, label: 'Country Name', input: { component: 'text' }, display: { component: 'text' } }
    }
  }
}))

vi.mock('@hubify/api/database/helpers', () => ({
  getPrimaryKeyColumn: vi.fn(() => 'id'),
  isOneToManyRelation: vi.fn(() => false),
  isRelation: vi.fn(() => false)
}))

vi.mock('~/composables/useCustomToast', () => ({
  useCustomToast: () => ({
    alert: vi.fn(),
    success: vi.fn()
  })
}))

beforeEach(() => {
  vi.clearAllMocks()
})

describe('basic functionality', () => {
  it('should return the correct collection name', () => {
    const { name } = useCollection('countries')
    
    expect(name.value).toBe('countries')
  })
})

// describe('column functionality', () => {
//   it('should return the correct column definition', () => {
//     const { getColumn } = useCollection('countries')
    
//     expect(getColumn('id')).toEqual({ type: 'integer', primary: true })
//     expect(getColumn('name')).toEqual({ type: 'text' })
//   })

//   it('should throw error for non-existent column', () => {
//     const { getColumn } = useCollection('countries')
    
//     expect(() => {
//       getColumn('non-existent' as any)
//     }).toThrow('Column "non-existent" does not exist in collection "countries".')
//   })

//   it('should return correct column names', () => {
//     const { columnNames } = useCollection('countries')
    
//     expect(columnNames.value).toEqual(['id', 'name'])
//   })

//   it('should return correct primary key', () => {
//     const { primaryKey } = useCollection('countries')
    
//     expect(primaryKey.value).toBe('id')
//   })

//   it('should return correct primary key value from item', () => {
//     const { getPrimaryKeyValue } = useCollection('countries')
//     const item = { id: 1, name: 'France' }
    
//     expect(getPrimaryKeyValue(item)).toBe(1)
//   })

//   it('should return correct column label', () => {
//     const { getColumnLabel } = useCollection('countries')
    
//     expect(getColumnLabel('id')).toBe('ID')
//     expect(getColumnLabel('name')).toBe('Country Name')
//   })

//   it('should return title case for columns without custom label', () => {
//     const { getColumnLabel } = useCollection('countries')
    
//     // This would test a column without a custom label
//     // Since our mock only has id and name with labels, we'll test the fallback behavior
//     expect(getColumnLabel('id')).toBe('ID')
//   })
// })
