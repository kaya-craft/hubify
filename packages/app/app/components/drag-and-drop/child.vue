<script setup lang="ts" generic="T">
import { draggable, dropTargetForElements } from '@atlaskit/pragmatic-drag-and-drop/element/adapter'
import { attachClosestEdge, extractClosestEdge, type Edge } from '@atlaskit/pragmatic-drag-and-drop-hitbox/closest-edge'
import { setCustomNativeDragPreview } from '@atlaskit/pragmatic-drag-and-drop/element/set-custom-native-drag-preview'
import { pointerOutsideOfPreview } from '@atlaskit/pragmatic-drag-and-drop/element/pointer-outside-of-preview'
import type { VNode } from 'vue'

export type Props<T> = {
  list: T[]
  index: number
  item: T
  hasPreview?: boolean
  groupId?: string
}

export type ItemData<T> = Props<T> & { type: 'item' }

const { groupId, hasPreview, list, index } = defineProps<Props<T>>()

/**
 * Emits.
 */
const emit = defineEmits<{
  dragenter: [data: ItemData<T>, container: HTMLElement, edge: Edge | null]
  dragleave: []
  preview: [data: ItemData<T>, container: HTMLElement]
}>()

/**
 * Get the root element.
 */
const instance = getCurrentInstance()

/**
 * Container element reference.
 */
const container = shallowRef<HTMLElement>()

/**
 * Current dropping edge.
 */
const edge = ref<Edge | null>()

/**
 * Check if a node is a valid VNode with children.
 */
function hasChildren(node: unknown): node is VNode & { children: VNode[] } {
  return !!node && typeof node === 'object' && 'children' in node && Array.isArray(node.children) && node.children.length > 0
}

/**
 * Is item data.
 */
function isItemData(data: unknown): data is ItemData<T> {
  return !!data && typeof data === 'object' && 'type' in data && data.type === 'item'
}

/**
 * Find the draggable element within the component's subTree.
 */
function findDraggableVNode(children: VNode[]) {
  if (children.length === 1) return children[0]

  return Array.from(children).find((child) => {
    return child.el instanceof HTMLElement && child.el.hasAttribute('data-source')
  })
}

/**
 * Get the children slot elements as HTMLElements.
 */
function getDraggableElement() {
  const root = instance?.subTree?.children

  if (!Array.isArray(root) || !hasChildren(root[0])) return

  const vNode = findDraggableVNode(root[0].children)

  if (!(vNode?.el instanceof HTMLElement)) return

  return vNode.el as HTMLElement
}

/**
 * Get the data for this item.
 */
function getData(): ItemData<T> {
  return {
    groupId,
    index,
    item: list[index]!,
    list,
    type: 'item'
  }
}

/**
 * Set up draggable and drop target functionality.
 */
async function setDraggableAndDropTarget() {
  const element = container.value = getDraggableElement()

  if (!element) return

  draggable({
    element,
    getInitialData: getData,
    dragHandle: element.querySelector('[data-handle]') as HTMLElement | undefined,
    onGenerateDragPreview({ nativeSetDragImage }) {
      if (!hasPreview) return
      setCustomNativeDragPreview({
        getOffset: pointerOutsideOfPreview({ x: '0px', y: '0px' }),
        render({ container }) {
          emit('preview', getData(), container)
        },
        nativeSetDragImage
      })
    }
  })

  dropTargetForElements({
    element,
    canDrop: ({ source }) => isItemData(source.data) && (groupId !== source.data.groupId || source.data.index !== index),
    getData({ input, element }) {
      return attachClosestEdge(getData(), {
        input,
        element,
        allowedEdges: ['top', 'bottom']
      })
    },
    onDrag({ location, self }) {
      if (!isItemData(location.current.dropTargets?.at(0)?.data)) return
      edge.value = extractClosestEdge(self.data)
      emit('dragenter', getData(), element, edge.value)
    },
    onDragLeave() {
      edge.value = undefined
      emit('dragleave')
    },
    onDrop() {
      edge.value = undefined
      emit('dragleave')
    }
  })
}

onMounted(setDraggableAndDropTarget)
</script>

<template>
  <slot
    :edge
    :container
  />
</template>
