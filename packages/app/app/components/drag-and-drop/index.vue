<script setup lang="ts" generic="T">
import { extractClosestEdge, type Edge } from '@atlaskit/pragmatic-drag-and-drop-hitbox/closest-edge'
import { getReorderDestinationIndex } from '@atlaskit/pragmatic-drag-and-drop-hitbox/util/get-reorder-destination-index'
import { reorder } from '@atlaskit/pragmatic-drag-and-drop/reorder'
import { dropTargetForElements } from '@atlaskit/pragmatic-drag-and-drop/element/adapter'
import type { ItemData } from './child.vue'

interface Props {
  dropIndicatorColor?: string
  dropIndicatorHeight?: number
  dropIndicatorPadding?: number
}

const { dropIndicatorColor = 'black', dropIndicatorHeight = 2, dropIndicatorPadding = 4 } = defineProps<Props>()

type GroupData<T> = {
  list: T[]
  type: 'group'
  groupId: string
}

const list = defineModel<T[]>()

/**
 * Get the root element.
 */
const el = useTemplateRef('el')

/**
 * Is item data.
 */
function isItemData(data: unknown): data is ItemData<T> {
  return !!data && typeof data === 'object' && 'type' in data && data.type === 'item'
}

/**
 * Is group data.
 */
function isGroupData(data: unknown): data is GroupData<T> {
  return !!data && typeof data === 'object' && 'type' in data && data.type === 'group'
}

/**
 * Is dragging inside.
 */
const isDraggingInside = ref(false)

/**
 * Group id.
 */
const id = useId()

/**
 * Move item to new group.
 */
async function moveItemIntoGroup(itemData: ItemData<T>, at = 0) {
  if (itemData.groupId === id) return
  list.value ??= []
  await nextTick()
  list.value.splice(at, 0, itemData.item)
  itemData.list.splice(itemData.index, 1)
}

/**
 * Reorder the list.
 */
function reorderGroup(startIndex: number, indexOfTarget: number, closestEdgeOfTarget: Edge | null) {
  const finishIndex = getReorderDestinationIndex({
    axis: 'vertical',
    startIndex,
    indexOfTarget,
    closestEdgeOfTarget
  })

  if (startIndex === finishIndex) return

  list.value = reorder({
    list: list.value || [],
    startIndex,
    finishIndex
  })
}

/**
 * Set the drop target on the given element.
 */
function setDropTarget(element: HTMLElement) {
  dropTargetForElements({
    element,
    canDrop: ({ source }) => isItemData(source.data),
    getData: () => ({ list: list.value, groupId: id, type: 'group' } as GroupData<T>),
    onDragEnter({ source, self }) {
      isDraggingInside.value = !source.element.contains(self.element)
    },
    onDragLeave() {
      isDraggingInside.value = false
    },
    async onDrop({ location, source }) {
      isDraggingInside.value = false
      const destination = location.current.dropTargets?.at(0)

      if (!isItemData(source.data)) return

      if (isGroupData(destination?.data) && destination.data.groupId === id) {
        await moveItemIntoGroup(source.data)
      }
      else if (isItemData(destination?.data) && destination.data.groupId === id) {
        if (source.data.groupId === id) {
          reorderGroup(source.data.index, destination.data.index, extractClosestEdge(destination.data))
        }
        else {
          await moveItemIntoGroup(source.data, destination.data.index)
        }
      }
    }
  })
}

/**
 * Initialize the drop target functionality.
 */
function initialize() {
  const element = el.value
  if (!element) return
  setDropTarget(element)
}

/**
 * Drop indicator properties.
 */
const dropIndicatorProps = shallowRef<ItemData<T> & {
  edge: Edge | null
  container: HTMLElement
  rect: DOMRect
}>()

/**
 * Handle drag enter event.
 */
function onDragEnter(data: ItemData<T>, container: HTMLElement, edge: Edge | null) {
  dropIndicatorProps.value = {
    ...data,
    edge,
    container,
    rect: container.getBoundingClientRect()
  }
}

/**
 * Handle drag leave event.
 */
function onDragLeave() {
  dropIndicatorProps.value = undefined
  itemPreviewProps.value = undefined
}

/**
 * Item preview properties.
 */
const itemPreviewProps = shallowRef<ItemData<T> & {
  container: HTMLElement
}>()

/**
 * Handle preview event.
 */
function onPreview(data: ItemData<T>, container: HTMLElement) {
  itemPreviewProps.value = {
    ...data,
    container
  }
}

watchEffect(initialize)
</script>

<template>
  <div
    ref="el"
  >
    <template v-if="list && list.length > 0">
      <DragAndDropChild
        v-for="(item, index) of list"
        :key="index"
        v-slot="{ edge }"
        :group-id="id"
        :has-preview="!!$slots['item-preview']"
        :list
        :index
        :item
        @dragenter="onDragEnter"
        @dragleave="onDragLeave"
        @preview="onPreview"
      >
        <slot
          :item
          :list
          :index
          :edge
        />
      </DragAndDropChild>
    </template>

    <slot
      v-else
      name="empty"
      :active="isDraggingInside"
    />

    <slot
      v-if="!isDraggingInside && dropIndicatorProps"
      name="drop-indicator"
      v-bind="dropIndicatorProps"
    >
      <div
        :style="{
          left: `${dropIndicatorProps.rect.x}px`,
          top: dropIndicatorProps.edge === 'top' ? `${dropIndicatorProps.rect.y - dropIndicatorPadding}px` : `${dropIndicatorProps.rect.y + dropIndicatorProps.rect.height + dropIndicatorPadding}px`,
          width: `${dropIndicatorProps.rect.width}px`,
          height: `${dropIndicatorHeight}px`,
          backgroundColor: dropIndicatorColor,
          position: 'absolute'
        }"
      />
    </slot>

    <Teleport
      v-if="itemPreviewProps"
      :to="itemPreviewProps.container"
    >
      <slot
        name="item-preview"
        v-bind="itemPreviewProps"
      />
    </Teleport>
  </div>
</template>
