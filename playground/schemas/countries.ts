export default defineTable((table, knex) => {
  table.increments('id').primary()
  table.text('name').notNullable()
  table.text('icon').nullable()
  table.timestamp('createdAt').defaultTo(knex.fn.now())
  table.timestamp('updatedAt').defaultTo(knex.fn.now())
})

export const fields = defineFields({
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
