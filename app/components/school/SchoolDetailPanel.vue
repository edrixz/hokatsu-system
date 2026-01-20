<script setup lang="ts">
import {
  X,
  MapPin,
  Navigation,
  Info,
  Car,
  Bike,
  Loader2,
  Route,
} from "lucide-vue-next";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import type { School } from "~/types/school";

// Định nghĩa Props
const props = defineProps<{
  school: School;
  routeInfo: {
    driving: { distance: string; duration: string } | null;
    bicycling: { distance: string; duration: string } | null;
  };
  isRouting: boolean;
  selectedMode: "DRIVING" | "BICYCLING";
  hasCalculated: boolean; // Trạng thái đã bấm nút tính hay chưa
}>();

// Định nghĩa Emits
const emit = defineEmits<{
  (e: "close"): void;
  (e: "calculate"): void;
  (e: "switchMode", mode: "DRIVING" | "BICYCLING"): void;
  (e: "openGoogleMaps"): void;
}>();

// Helpers UI
const getBadgeVariant = (cat: string) => {
  switch (cat) {
    case "Home":
      return "destructive";
    case "Work":
      return "secondary";
    case "Public":
      return "default";
    case "Private":
      return "outline";
    default:
      return "default";
  }
};
</script>

<template>
  <div class="w-100 border-l bg-white h-full shadow-2xl z-30 flex flex-col">
    <div class="p-4 border-b flex justify-between items-start bg-slate-50">
      <div>
        <h2 class="font-bold text-xl text-slate-800 wrap-break-word pr-2">
          {{ school.name }}
        </h2>
        <div class="mt-2">
          <Badge :variant="getBadgeVariant(school.category)">
            {{ school.category || "Địa điểm" }}
          </Badge>
        </div>
      </div>
      <Button
        variant="ghost"
        size="icon"
        @click="$emit('close')"
        class="-mr-2 -mt-2"
      >
        <X class="w-5 h-5 text-slate-500" />
      </Button>
    </div>

    <ScrollArea class="flex-1 p-6">
      <div
        class="aspect-video bg-slate-100 rounded-lg mb-6 flex items-center justify-center border overflow-hidden"
      >
        <img
          v-if="school.image_url"
          :src="school.image_url"
          class="w-full h-full object-cover"
        />
        <MapPin v-else class="w-10 h-10 text-slate-300" />
      </div>

      <div class="space-y-6">
        <div class="space-y-4">
          <div class="flex items-start gap-3">
            <MapPin class="w-5 h-5 text-slate-400 shrink-0 mt-0.5" />
            <div>
              <div class="font-medium text-slate-700">Địa chỉ</div>
              <div class="text-sm text-slate-500">
                {{
                  school.address ||
                  `${school.lat.toFixed(6)}, ${school.lng.toFixed(6)}`
                }}
              </div>
            </div>
          </div>
          <div class="flex items-start gap-3">
            <Info class="w-5 h-5 text-slate-400 shrink-0 mt-0.5" />
            <div>
              <div class="font-medium text-slate-700">Ghi chú</div>
              <p
                class="text-sm text-slate-600 leading-relaxed whitespace-pre-line"
              >
                {{ school.notes || "Chưa có ghi chú." }}
              </p>
            </div>
          </div>
        </div>

        <div class="border-t pt-4">
          <div class="font-medium text-slate-800 mb-3 flex items-center gap-2">
            <Navigation class="w-4 h-4" /> Ước tính di chuyển (Từ Nhà)
          </div>

          <div
            v-if="isRouting"
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
              <Route class="w-4 h-4" />
              Xem đường đi từ Nhà
            </Button>
          </div>

          <div
            v-else
            class="grid grid-cols-2 gap-3 animate-in fade-in slide-in-from-bottom-2"
          >
            <div
              class="p-3 rounded-lg border cursor-pointer transition-all"
              :class="
                selectedMode === 'BICYCLING'
                  ? 'bg-green-100 border-green-300 ring-1 ring-green-300 shadow-sm'
                  : 'bg-green-50 border-green-100 hover:bg-green-100 opacity-70 hover:opacity-100'
              "
              @click="$emit('switchMode', 'BICYCLING')"
            >
              <div class="flex items-center gap-2 text-green-700 mb-1">
                <Bike class="w-4 h-4" />
                <span class="text-xs font-bold uppercase">Xe đạp</span>
              </div>
              <div v-if="routeInfo.bicycling" class="text-slate-800">
                <div class="font-bold text-lg">
                  {{ routeInfo.bicycling.duration }}
                </div>
                <div class="text-xs text-slate-500">
                  {{ routeInfo.bicycling.distance }}
                </div>
              </div>
              <div v-else class="text-xs text-slate-400 italic">N/A</div>
            </div>

            <div
              class="p-3 rounded-lg border cursor-pointer transition-all"
              :class="
                selectedMode === 'DRIVING'
                  ? 'bg-blue-100 border-blue-300 ring-1 ring-blue-300 shadow-sm'
                  : 'bg-blue-50 border-blue-100 hover:bg-blue-100 opacity-70 hover:opacity-100'
              "
              @click="$emit('switchMode', 'DRIVING')"
            >
              <div class="flex items-center gap-2 text-blue-700 mb-1">
                <Car class="w-4 h-4" />
                <span class="text-xs font-bold uppercase">Ô tô</span>
              </div>
              <div v-if="routeInfo.driving" class="text-slate-800">
                <div class="font-bold text-lg">
                  {{ routeInfo.driving.duration }}
                </div>
                <div class="text-xs text-slate-500">
                  {{ routeInfo.driving.distance }}
                </div>
              </div>
              <div v-else class="text-xs text-slate-400 italic">N/A</div>
            </div>
          </div>
        </div>
      </div>
    </ScrollArea>

    <div class="p-4 border-t bg-slate-50 space-y-2">
      <Button class="w-full gap-2" @click="$emit('openGoogleMaps')">
        <Navigation class="w-4 h-4" />
        Mở Google Maps
      </Button>
      <Button
        variant="outline"
        class="w-full text-red-600 hover:text-red-700 hover:bg-red-50"
      >
        Xóa địa điểm
      </Button>
    </div>
  </div>
</template>
