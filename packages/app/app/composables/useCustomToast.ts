export function useCustomToast() {
  const { add } = useToast()

  function success(title: string, description?: string) {
    add({
      title,
      color: 'success',
      icon: 'lucide:badge-check',
      description
    })
  }

  function alert(title: string, description?: string) {
    add({
      title,
      color: 'error',
      icon: 'lucide:badge-alert',
      description
    })
  }

  return {
    success,
    alert
  }
}
