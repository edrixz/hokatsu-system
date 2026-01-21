<script setup lang="ts">
import { Star } from "lucide-vue-next";

const props = defineProps<{
  modelValue: number | null;
  readonly?: boolean;
}>();

const emit = defineEmits<{
  (e: "update:modelValue", value: number): void;
}>();

const updateRating = (value: number) => {
  if (props.readonly) return;
  // Nếu bấm vào sao đang chọn thì bỏ chọn (về 0/null)
  emit("update:modelValue", props.modelValue === value ? 0 : value);
};
</script>

<template>
  <div class="flex items-center gap-0.5">
    <button
      v-for="i in 5"
      :key="i"
      type="button"
      :disabled="readonly"
      @click="updateRating(i)"
      class="transition-transform hover:scale-110 focus:outline-none"
      :class="readonly ? 'cursor-default' : 'cursor-pointer'"
    >
      <Star
        class="w-4 h-4 transition-colors"
        :class="
          (modelValue || 0) >= i
            ? 'fill-yellow-400 text-yellow-400'
            : 'text-slate-300 hover:text-yellow-200'
        "
      />
    </button>
  </div>
</template>
