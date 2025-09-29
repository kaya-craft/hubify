const pageTitle = () => useState<{ title: string, icon?: string }>('page-title', () => ({
  title: 'Hubify',
  icon: undefined
}))

export function usePageTitle(options?: { title?: MaybeRef<string>, icon?: MaybeRef<string> }) {
  if (!options) return pageTitle()

  if (toValue(options.title)) {
    pageTitle().value.title = toValue(options.title!)
  }

  if (toValue(options.icon)) {
    pageTitle().value.icon = toValue(options.icon!)
  }

  return pageTitle()
}
