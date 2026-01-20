<script setup lang="ts">
import { ref, computed } from "vue";
import { CustomMarker } from "vue3-google-map";
import {
  MapPin,
  HomeIcon,
  BriefcaseIcon,
  SchoolIcon,
  BuildingIcon,
  Users,
  DoorOpen,
} from "lucide-vue-next";
import type { School } from "~/types/school";

const props = defineProps<{
  school: School;
}>();

const emit = defineEmits<{
  (e: "click", school: School): void;
}>();

// [MỚI] State theo dõi Hover
const isHovered = ref(false);

// Logic màu sắc & Icon
const getCategoryColorHex = (category: string) => {
  switch (category) {
    case "Home":
      return "#f43f5e";
    case "Work":
      return "#475569";
    case "Public":
      return "#16a34a";
    case "Private":
      return "#9333ea";
    case "SmallScale":
      return "#ea580c";
    default:
      return "#2563eb";
  }
};

const getCategoryIcon = (category: string) => {
  switch (category) {
    case "Home":
      return HomeIcon;
    case "Work":
      return BriefcaseIcon;
    case "Public":
      return SchoolIcon;
    case "Private":
      return BuildingIcon;
    case "SmallScale":
      return HomeIcon;
    default:
      return MapPin;
  }
};

// [MỚI] Mock data cho số liệu (Vì DB hiện tại có thể chưa có field này)
// Bạn có thể thay bằng props.school.quota hoặc props.school.vacancy nếu đã có trong DB
const quota = computed(() => Math.floor(Math.random() * 50) + 10); // Tổng chỉ tiêu
const vacancy = computed(() => Math.floor(Math.random() * 5)); // Số chỗ trống
</script>

<template>
  <CustomMarker
    :options="{
      position: { lat: school.lat, lng: school.lng },
      // [QUAN TRỌNG] Khi hover thì đẩy zIndex lên cực cao (50) để đè lên các marker khác
      zIndex: isHovered ? 50 : 1,
      anchorPoint: 'CENTER',
    }"
  >
    <div
      class="relative w-0 h-0 flex justify-center items-end overflow-visible"
    >
      <div
        class="flex flex-col items-center cursor-pointer group -translate-y-[1px]"
        @click.stop="emit('click', school)"
        @mouseenter="isHovered = true"
        @mouseleave="isHovered = false"
      >
        <div
          v-if="isHovered"
          class="mb-2 bg-white rounded-lg shadow-xl border border-slate-200 w-[220px] overflow-hidden origin-bottom animate-in zoom-in-95 duration-200"
        >
          <div class="h-24 w-full bg-slate-100 relative">
            <img
              v-if="school.image_url"
              :src="school.image_url"
              class="w-full h-full object-cover"
            />
            <div
              v-else
              class="w-full h-full flex items-center justify-center text-slate-300"
            >
              <SchoolIcon class="w-8 h-8" />
            </div>

            <div
              class="absolute top-2 right-2 text-[10px] font-bold px-1.5 py-0.5 rounded text-white shadow-sm"
              :style="{ backgroundColor: getCategoryColorHex(school.category) }"
            >
              {{ school.category }}
            </div>
          </div>

          <div class="p-3">
            <div
              class="font-bold text-slate-800 text-sm leading-tight mb-2 line-clamp-2"
            >
              {{ school.name }}
            </div>

            <div class="grid grid-cols-2 gap-2 text-xs">
              <div
                class="bg-slate-50 p-1.5 rounded border flex flex-col items-center"
              >
                <span class="text-slate-500 flex items-center gap-1 mb-0.5">
                  <Users class="w-3 h-3" /> Chỉ tiêu
                </span>
                <span class="font-bold text-slate-700">{{ quota }}</span>
              </div>

              <div
                class="p-1.5 rounded border flex flex-col items-center"
                :class="
                  vacancy > 0
                    ? 'bg-green-50 border-green-100'
                    : 'bg-red-50 border-red-100'
                "
              >
                <span
                  class="flex items-center gap-1 mb-0.5"
                  :class="vacancy > 0 ? 'text-green-600' : 'text-red-500'"
                >
                  <DoorOpen class="w-3 h-3" /> Trống
                </span>
                <span
                  class="font-bold"
                  :class="vacancy > 0 ? 'text-green-700' : 'text-red-700'"
                >
                  {{ vacancy }}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div
          v-else
          class="bg-white/95 backdrop-blur-sm text-slate-800 text-[11px] font-bold px-2 py-1 rounded shadow-sm border border-slate-200 mb-1 whitespace-nowrap transition-transform group-hover:scale-105 origin-bottom"
        >
          {{ school.name }}
        </div>

        <div
          class="relative flex flex-col items-center filter drop-shadow-md transition-transform group-hover:-translate-y-1 origin-bottom"
        >
          <div
            class="w-8 h-8 rounded-full flex items-center justify-center text-white shadow-sm"
            :style="{ backgroundColor: getCategoryColorHex(school.category) }"
          >
            <component :is="getCategoryIcon(school.category)" class="w-4 h-4" />
          </div>
          <div
            class="w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[14px] -mt-[1px]"
            :style="{ borderTopColor: getCategoryColorHex(school.category) }"
          ></div>
        </div>
      </div>
    </div>
  </CustomMarker>
</template>
