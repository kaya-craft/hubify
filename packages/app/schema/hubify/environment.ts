export const fields = defineCollectionFields({
  key: {
    input: {
      component: 'text',
      label: 'Key',
      class: 'col-span-6',
      rules: rules => rules.regex(/^[a-zA-Z0-9_]+$/, 'Key can only contain letters, numbers, and underscores'),
      props: {
        placeholder: 'Enter key here'
      }
    }
  },
  value: {
    input: {
      component: 'text',
      label: 'Value',
      class: 'col-span-6',
      props: {
        placeholder: 'Enter value here'
      }
    }
  }
})
