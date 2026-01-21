<script setup lang="ts">
import { Navigation, Loader2, Route, Bike, Car } from "lucide-vue-next";
import Button from "@/components/ui/button/Button.vue";
import { useRouteStore } from "~/stores/route-store";

const props = defineProps<{
  hasCalculated: boolean;
}>();

const emit = defineEmits<{
  (e: "calculate"): void;
  (e: "switchMode", mode: "DRIVING" | "BICYCLING"): void;
}>();

const routeStore = useRouteStore();
</script>

<template>
  <div class="border-t pt-4 mt-6">
    <div class="font-medium text-slate-800 mb-3 flex items-center gap-2">
      <Navigation class="w-4 h-4" /> Ước tính di chuyển (Từ Nhà)
    </div>

    <div
      v-if="routeStore.isRouting"
      class="flex items-center justify-center py-4 text-slate-400 gap-2 text-sm"
    >
      <Loader2 class="w-4 h-4 animate-spin" /> Đang tính toán...
    </div>

    <div v-else-if="!hasCalculated" class="text-center py-2">
      <Button
        variant="secondary"
        class="w-full gap-2 border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100"
        @click="$emit('calculate')"
      >
        <Route class="w-4 h-4" /> Xem đường đi từ Nhà
      </Button>
    </div>

    <div
      v-else
      class="grid grid-cols-2 gap-3 animate-in fade-in slide-in-from-bottom-2"
    >
      <div
        class="p-3 rounded-lg border cursor-pointer transition-all"
        :class="
          routeStore.selectedMode === 'BICYCLING'
            ? 'bg-green-100 border-green-300 ring-1 ring-green-300 shadow-sm'
            : 'bg-green-50 border-green-100 hover:bg-green-100 opacity-70 hover:opacity-100'
        "
        @click="$emit('switchMode', 'BICYCLING')"
      >
        <div class="flex items-center gap-2 text-green-700 mb-1">
          <Bike class="w-4 h-4" /><span class="text-xs font-bold uppercase"
            >Xe đạp</span
          >
        </div>
        <div v-if="routeStore.routeInfo.bicycling" class="text-slate-800">
          <div class="font-bold text-lg">
            {{ routeStore.routeInfo.bicycling.duration }}
          </div>
          <div class="text-xs text-slate-500">
            {{ routeStore.routeInfo.bicycling.distance }}
          </div>
        </div>
        <div v-else class="text-xs text-slate-400 italic">N/A</div>
      </div>

      <div
        class="p-3 rounded-lg border cursor-pointer transition-all"
        :class="
          routeStore.selectedMode === 'DRIVING'
            ? 'bg-blue-100 border-blue-300 ring-1 ring-blue-300 shadow-sm'
            : 'bg-blue-50 border-blue-100 hover:bg-blue-100 opacity-70 hover:opacity-100'
        "
        @click="$emit('switchMode', 'DRIVING')"
      >
        <div class="flex items-center gap-2 text-blue-700 mb-1">
          <Car class="w-4 h-4" /><span class="text-xs font-bold uppercase"
            >Ô tô</span
          >
        </div>
        <div v-if="routeStore.routeInfo.driving" class="text-slate-800">
          <div class="font-bold text-lg">
            {{ routeStore.routeInfo.driving.duration }}
          </div>
          <div class="text-xs text-slate-500">
            {{ routeStore.routeInfo.driving.distance }}
          </div>
        </div>
        <div v-else class="text-xs text-slate-400 italic">N/A</div>
      </div>
    </div>
  </div>
</template>
