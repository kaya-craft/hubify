import { createConfigForNuxt } from '@nuxt/eslint-config'

export default createConfigForNuxt({
    features: {
        typescript: true,
    }
})
.overrideRules({
    'vue/multi-word-component-names': 'off',
    '@typescript-eslint/no-empty-object-type': 'off'
})