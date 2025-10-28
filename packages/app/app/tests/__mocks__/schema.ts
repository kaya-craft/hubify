export default {
  countries: {
    columns: {
      id: { type: 'integer', primaryKey: true },
      name: { type: 'text' }
    },
    fields: {
      id: {},
      name: {}
    },
    relations: {}
  }
}

declare module '#hubify/schema' {
  interface HubifySchema {
    countries: typeof import('./schema').default['countries']
  }
}
