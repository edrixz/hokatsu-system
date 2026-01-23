<script setup lang="ts">
import {
  type ComboboxGroupProps,
  ComboboxGroup,
  ComboboxLabel,
} from "radix-vue";
import { computed } from "vue";
import { cn } from "@/lib/utils";

const props = defineProps<
  ComboboxGroupProps & { class?: string; heading?: string }
>();
const delegatedProps = computed(() => {
  const { class: _, ...delegated } = props;
  return delegated;
});
</script>

<template>
  <ComboboxGroup
    v-bind="delegatedProps"
    :class="cn('overflow-hidden p-1 text-foreground', props.class)"
  >
    <ComboboxLabel
      v-if="heading"
      class="px-2 py-1.5 text-xs font-medium text-muted-foreground"
    >
      {{ heading }}
    </ComboboxLabel>
    <slot />
  </ComboboxGroup>
</template>
