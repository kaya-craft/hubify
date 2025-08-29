<script setup lang="ts">
import type { ColorPickerProps } from '@nuxt/ui'

interface Props extends /* @vue-ignore */ ColorPickerProps {}

/**
 * Selected color model.
 */
const color = defineModel<string>()

/**
 * Expose the data types supported by this color picker.
 */
defineFieldDataTypes('text', 'varchar')

/**
 * Props for the color picker component.
 */
defineProps<Props>()

/**
 * Computed style for the color chip.
 */
const chip = computed(() => ({ backgroundColor: color.value }))

/**
 * Default colors to be used in the color picker.
 */
const defaultColors = [
  '#000000', // Black
  '#FFFFFF', // White
  '#A1A1A1', // Neutral gray
  '#FB2C36', // Red
  '#FD9A00', // Yellow
  '#00C16A', // Green
  '#2B7FFF', // Blue
  '#AD46FF', // Purple
  '#F6339A' // Pink
]
</script>

<template>
  <div>
    <UButtonGroup>
      <UPopover>
        <UBadge
          variant="outline"
          color="neutral"
          size="lg"
          class="w-24 relative"
          :style="chip"
        />
        <template #content>
          <UButtonGroup>
            <UButton
              v-for="(defaultColor, index) in defaultColors"
              :key="`color-${index}`"
              color="neutral"
              variant="ghost"
              @click="color = defaultColor"
            >
              <template
                #leading
              >
                <slot name="leading">
                  <span
                    class="size-4 rounded-full ring-1 ring-slate-300"
                    :style="{ backgroundColor: defaultColor }"
                  />
                </slot>
              </template>
            </UButton>
            <UPopover>
              <UButton
                color="neutral"
                variant="ghost"
                icon="mdi:plus"
              />
              <template #content>
                <UColorPicker
                  v-model="color"
                  class="p-2"
                />
              </template>
            </UPopover>
          </UButtonGroup>
        </template>
      </UPopover>
      <UInput
        v-model="color"
        placeholder="#FFFFFF"
        :ui="{ trailing: 'pe-1' }"
        class="w-full"
      >
        <template
          #trailing
        >
          <UButton
            color="neutral"
            variant="link"
            size="sm"
            icon="mdi:close"
            aria-label="Save new color"
            @click="color = ''"
          />
        </template>
      </UInput>
    </UButtonGroup>
  </div>
</template>
