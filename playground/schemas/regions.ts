export const columns = defineTableColumns({
  id: {
    type: 'integer',
    primaryKey: true
  },
  name: {
    type: 'text',
    notNull: true
  },
  icon: {
    type: 'text',
    notNull: false
  },
  createdAt: {
    type: 'timestamp',
    default: 'CURRENT_TIMESTAMP'
  },
  updatedAt: {
    type: 'timestamp',
    default: 'CURRENT_TIMESTAMP'
  }
})

export const fields = defineFieldOptions(columns, {
  id: {
    input: false,
    display: {
      component: 'text'
    }
  },
  icon: {
    input: {
      component: 'icon-picker',
      label: 'Icon',
      class: 'col-span-6'
    },
    display: {
      component: 'icon'
    }
  },
  name: {
    input: {
      component: 'text',
      label: 'Name'
    },
    display: {
      component: 'text'
    }
  },
  createdAt: {
    input: false,
    display: {
      component: 'date'
    }
  },
  updatedAt: {
    input: false,
    display: {
      component: 'date'
    }
  }
})

export const relations = defineTableRelations({
  countries: {
    table: 'countries',
    fromKey: 'region',
    toKey: 'id'
  }
})
