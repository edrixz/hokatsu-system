<script setup lang="ts">
import { Medal, Trophy, Circle } from "lucide-vue-next";

const props = defineProps<{
  modelValue: number | null;
  readonly?: boolean;
}>();

const emit = defineEmits<{
  (e: "update:modelValue", value: number | null): void;
}>();

// Cấu hình hiển thị cho từng Rank
const ranks = [
  {
    value: 1,
    label: "NV1",
    icon: Trophy,
    colorClass:
      "bg-yellow-100 text-yellow-700 border-yellow-300 hover:bg-yellow-200",
    iconClass: "text-yellow-600",
  },
  {
    value: 2,
    label: "NV2",
    icon: Medal,
    colorClass:
      "bg-slate-100 text-slate-700 border-slate-300 hover:bg-slate-200",
    iconClass: "text-slate-500",
  },
  {
    value: 3,
    label: "NV3",
    icon: Medal,
    colorClass:
      "bg-orange-100 text-orange-800 border-orange-300 hover:bg-orange-200",
    iconClass: "text-orange-600",
  },
  {
    value: 4,
    label: "NV4",
    icon: Circle,
    colorClass: "bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100",
    iconClass: "text-blue-500",
  },
  {
    value: 5,
    label: "NV5",
    icon: Circle,
    colorClass: "bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100",
    iconClass: "text-blue-500",
  },
];

const handleSelect = (val: number) => {
  if (props.readonly) return;
  // Nếu bấm lại vào rank đang chọn -> Bỏ chọn (về null)
  emit("update:modelValue", props.modelValue === val ? null : val);
};
</script>

<template>
  <div class="flex items-center gap-2">
    <button
      v-for="rank in ranks"
      :key="rank.value"
      type="button"
      :disabled="readonly"
      @click="handleSelect(rank.value)"
      class="flex items-center gap-1.5 px-2.5 py-1.5 rounded-full border transition-all text-xs font-bold"
      :class="[
        // Nếu đang chọn thì hiện màu đậm, nếu không thì mờ đi
        modelValue === rank.value
          ? rank.colorClass +
            ' shadow-sm scale-105 ring-1 ring-offset-1 ring-transparent'
          : 'bg-white text-slate-500 border-slate-200 hover:border-slate-300 opacity-60 hover:opacity-100 grayscale hover:grayscale-0',
        readonly ? 'cursor-default opacity-100' : 'cursor-pointer',
      ]"
    >
      <component
        :is="rank.icon"
        class="w-3.5 h-3.5"
        :class="modelValue === rank.value ? rank.iconClass : 'text-slate-400'"
      />
      {{ rank.label }}
    </button>
  </div>
</template>
