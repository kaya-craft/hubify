import { createConfigForNuxt } from '@nuxt/eslint-config'

export default createConfigForNuxt({
  features: {
    typescript: true,
    stylistic: {
      quotes: 'single',
      semi: false,
      commaDangle: 'never',
      indent: 2
    }
  }
})
  .append({
    rules: {
      'prefer-template': 'error',
      'vue/prefer-template': 'error'
    }
  })
  .overrideRules({
    'vue/multi-word-component-names': 'off',
    '@typescript-eslint/no-empty-object-type': 'off'

  })
