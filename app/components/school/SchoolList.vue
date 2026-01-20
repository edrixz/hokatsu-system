<script setup lang="ts">
import type { School } from "~/types/school";

defineProps<{
  schools: School[] | null | undefined;
  pending: boolean;
}>();

defineEmits<{
  (e: "select", school: School): void;
}>();
</script>

<template>
  <div v-if="pending" class="text-center py-4 text-sm text-muted-foreground">
    Đang tải dữ liệu...
  </div>

  <div
    v-else-if="!schools?.length"
    class="text-center py-8 text-muted-foreground"
  >
    <p>Chưa có địa điểm nào.</p>
    <p class="text-xs">Hãy tìm kiếm và thêm địa điểm mới.</p>
  </div>

  <div v-else class="space-y-2 pb-4">
    <div
      v-for="school in schools"
      :key="school.id"
      class="p-3 border rounded-lg bg-white hover:bg-slate-50 cursor-pointer transition-colors"
      @click="$emit('select', school)"
    >
      <div class="font-medium text-slate-900">{{ school.name }}</div>
      <div class="text-xs text-slate-500 truncate">
        {{ school.address || "Chưa có địa chỉ" }}
      </div>

      <div class="mt-2 flex gap-1" v-if="school.category">
        <span
          class="text-[10px] px-1.5 py-0.5 bg-blue-100 text-blue-700 rounded-full font-medium"
        >
          {{ school.category }}
        </span>
      </div>
    </div>
  </div>
</template>
