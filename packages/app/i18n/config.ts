import type { ModuleOptions } from '@nuxtjs/i18n'

export default <ModuleOptions>{
  locales: [
    { code: 'en', name: 'English', file: 'en.json' },
    { code: 'fr', name: 'Français', file: 'fr.json' }
  ],
  defaultLocale: 'en'
}
