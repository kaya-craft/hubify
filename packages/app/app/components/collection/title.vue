<script lang="ts" setup generic="T extends TableNames">
const { collection } = defineProps<{
  collection: T
}>()

/**
 * Get collection meta to display collection name, icon and color
 */
const { getCollectionMeta } = useCollections()
const collectionMeta = computed(() => getCollectionMeta(collection))
const { getDisplayComponent: getHubifyDisplayComponent } = useCollection('hubify_collections')
const collectionIconComponent = computed(() => h(getHubifyDisplayComponent('icon'), { value: collectionMeta.value?.icon }))
</script>

<template>
  <div
    class="flex gap-6"
    data-testid="collection-title"
  >
    <component
      :is="collectionIconComponent"
      v-if="collectionIconComponent"
      :key="collectionMeta?.name"
      :style="`color: ${collectionMeta?.color}`"
    />
    <h2
      :style="`color: ${collectionMeta?.color}`"
      class="text-lg font-semibold capitalize"
    >
      {{ collection?.replaceAll('_', ' ') }}
    </h2>
  </div>
</template>
