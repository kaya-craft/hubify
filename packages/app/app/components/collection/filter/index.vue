<script setup lang="ts" generic="T extends TableNames">
import { CollectionFilterContent, UModal, UPopover } from '#components'
import type { Operator } from '@hubify/api/database/types'
import type { ComponentInstance } from 'vue'

export type Clause<T extends TableNames> = {
  type: 'clause'
  column?: TableColumnNames<T>
  operator?: Operator
  value?: unknown
}

export type AndOrClause<T extends TableNames> = {
  type: '$and' | '$or'
  children?: ConditionTreeAsArray<T>[]
}

export type ConditionTreeAsArray<T extends TableNames> = AndOrClause<T> | Clause<T>

type Props = {
  collection: T
}

const filter = defineModel<ConditionTree<T>>()

const { collection } = defineProps<Props>()

/**
 * Translation.
 */
const { t } = useI18n()

/**
 * Use a modal in fullscreen mode.
 */
const fullscreen = ref(false)

/**
 * Modal reference.
 */
const modal = useTemplateRef<ComponentInstance<typeof CollectionFilterContent>>('modal')

/**
   * Modal container.
   */
const modalContainer = computed<HTMLElement | null>(() => {
  return toValue(modal)?.$el?.parentElement ?? null
})

/**
 * Is not a dragging handle.
 */
const isDraggingHandle = ref(false)

/**
 * Allow dragging the modal when in fullscreen mode.
 */
useDraggable(modalContainer, {
  disabled: () => !toValue(fullscreen),
  onStart(_, event) {
    const el = toValue(modalContainer)
    if (!el) return
    const target = event.target as HTMLElement
    isDraggingHandle.value = !!target.dataset.handle
    el.style.userSelect = 'none'
    el.style.cursor = 'grabbing'
  },
  onEnd() {
    const el = toValue(modalContainer)
    if (!el) return
    el.style.cursor = ''
    isDraggingHandle.value = false
  },
  onMove(position) {
    const el = toValue(modalContainer)
    if (!el || toValue(isDraggingHandle)) return
    el.style.transform = el.style.translate = 'none'
    el.style.top = `${position.y}px`
    el.style.left = `${position.x}px`
  }
})

/**
 * Open state.
 */
const open = ref(false)
</script>

<template>
  <component
    :is="fullscreen ? UModal : UPopover"
    :title="t('app.admin.filters.title')"
    :description="t('app.admin.filters.description')"
    :default-open="fullscreen"
    :overlay="false"
    :open="open"
  >
    <UButton
      :label="t('app.admin.filters.label')"
      variant="soft"
      color="neutral"
      leading-icon="heroicons:funnel"
      @click.prevent="open = !open"
    />

    <template #content>
      <CollectionFilterContent
        ref="modal"
        v-model="filter"
        v-model:fullscreen="fullscreen"
        :collection
      />
    </template>
  </component>
</template>
