export default {
  countries: {
    id: { type: 'integer', primary: true },
    name: { type: 'text' }
  }
}

declare module '#hubify/schema' {
  interface HubifySchema {
    countries: typeof import('./schema').default['countries']
  }
}
