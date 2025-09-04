<script setup lang="ts" generic="T extends AcceptableValue = AcceptableValue">
import type { AcceptableValue, BadgeProps, ComponentConfig, InputProps } from '@nuxt/ui'
import { tv } from '@nuxt/ui/utils/tv'
import themeInput from '#build/ui/input'
import type { AppConfig } from '@nuxt/schema'
import Tagify from '@yaireo/tagify'
import { Icon, UBadge, UTextarea } from '#components'
import { render } from 'vue'

type Input = ComponentConfig<typeof themeInput, AppConfig, 'input'>

interface Props extends /* @vue-ignore */ InputProps {
  variables?: string[]
  variant?: InputProps['variant'] & BadgeProps['variant']
}

const value = defineModel<string>()

defineFieldDataTypes('text', 'varchar')

const props = defineProps<Props>()

/**
 * Composable to access app config.
 */
const appConfig = useAppConfig() as Input['AppConfig'] & { ui: { tv: Record<string, unknown> } }

/**
 * Composable to manage form field state.
 */
const { size, color, highlight } = useFormField<InputProps>(props, {
  deferInputValidation: true
})

/**
 * Computed UI config for the input.
 */
const ui = computed(() => tv({ extend: tv(themeInput), ...(appConfig.ui?.input || {}) })({
  type: props.type as Input['variants']['type'],
  color: color.value,
  variant: props.variant,
  size: size?.value,
  loading: props.loading,
  highlight: highlight.value
}))

/**
 * Input element reference.
 */
const input = useTemplateRef('input')

/**
 * Tagify instance.
 */
const instance = shallowRef<Tagify>()

/**
 * Whether to display the select dropdown.
 */
const displaySelect = ref(false)

/**
 * Nuxt app instance.
 */
const nuxt = useNuxtApp()

/**
 * Initialize Tagify.
 */
function initialize() {
  if (!input.value) return
  console.log('initializing')
  destroy()

  instance.value = new Tagify(input.value, {
    whitelist: props.variables,
    mode: 'mix',
    mixTagsInterpolator: ['{{', '}}'],
    pattern: /{{/,
    classNames: {
      namespace: 'tagify contents',
      input: ui.value.base({ class: ['*:inline-flex inline-block'] }),
      tag: 'tag'
    },
    duplicates: true,
    dropdown: {
      enabled: 0,
      position: 'manual',
      includeSelectedTags: true
    },
    templates: {
      tag(tagData) {
        return renderBadge(tagData.value)
      }
    },
    editTags: false,
    enforceWhitelist: true,
    originalInputValueFormat(value) {
      value = Array.isArray(value) ? value : [value]
      return value.map(item => item.value).join('')
    }
  })

  instance.value.on('dropdown:show', showSelect)
  instance.value.on('dropdown:hide', hideSelect)
  instance.value.on('input', updateValue)
  instance.value.on('remove', updateValue)
  instance.value.on('add', updateValue)
  instance.value.loadOriginalValues(value.value || '')
}

/**
 * Render a badge.
 */
function renderBadge(content: string) {
  const vNode = h(UBadge, {
    'class': 'tag select-none',
    'data-tag': true,
    'as': 'tag',
    'size': props.size,
    'color': props.color,
    'variant': props.variant
  }, {
    default: () => content,
    trailing: () => h(Icon, {
      'name': 'heroicons:x-mark',
      'class': 'cursor-pointer',
      'data-tag-remove': true
    })
  })
  vNode.appContext = nuxt.vueApp._context
  const div = document.createElement('div')
  render(vNode, div)
  return div.innerHTML
}

/**
 * Show select.
 */
function showSelect() {
  displaySelect.value = true
}

/**
 * Hide select.
 */
function hideSelect() {
  displaySelect.value = false
}

/**
 * Update the value.
 */
function updateValue() {
  console.log('updated')
  value.value = instance.value?.getMixedTagsAsString()
}

/**
 * On select handler.
 */
function onSelect(variable: string) {
  instance.value?.addTags(variable)
  hideSelect()
}

/**
 * On remove icon click handler.
 */
function onRemoveClick(element: HTMLElement) {
  const tag = element.closest<HTMLElement>('tag')
  if (!tag) return
  instance.value?.removeTags(tag)
}

/**
 * On click handler.
 */
function onClick(event: Event) {
  const target = event.target
  if (!(target instanceof HTMLElement)) return

  if (target.dataset.tagRemove) {
    onRemoveClick(target)
  }
}

/**
 * Destroy instance.
 */
function destroy() {
  instance.value?.destroy()
}

useEventListener('click', onClick)
onBeforeUnmount(destroy)
watch(input, initialize, { immediate: true })

defineOptions({
  inheritAttrs: false
})
</script>

<template>
  <textarea
    ref="input"
  />
  <ClientOnly>
    <USelect
      v-if="displaySelect"
      :items="variables"
      default-open
      :ui="{ base: 'invisible h-0 overflow-hidden p-0 w-full -mt-2', content: '-mt-4' }"
      @blur="hideSelect"
      @update:model-value="onSelect"
    />
    <template #placeholder>
      <UTextarea
        :model-value="value"
        v-bind="$attrs"
      />
    </template>
  </ClientOnly>
</template>

<style scoped>
tags + textarea {
  display: none;
}
</style>
