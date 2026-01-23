<script setup lang="ts">
import {
  type ComboboxContentEmits,
  type ComboboxContentProps,
  ComboboxContent,
  useForwardPropsEmits,
} from "radix-vue";
import { computed } from "vue";
import { cn } from "@/lib/utils";

const props = withDefaults(
  defineProps<ComboboxContentProps & { class?: string }>(),
  {
    dismissable: false,
  },
);
const emits = defineEmits<ComboboxContentEmits>();
const delegatedProps = computed(() => {
  const { class: _, ...delegated } = props;
  return delegated;
});
const forwarded = useForwardPropsEmits(delegatedProps, emits);
</script>

<template>
  <ComboboxContent
    v-bind="forwarded"
    :class="cn('max-h-75 overflow-y-auto overflow-x-hidden', props.class)"
  >
    <div role="presentation">
      <slot />
    </div>
  </ComboboxContent>
</template>
