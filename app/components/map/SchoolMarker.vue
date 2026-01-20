<script setup lang="ts">
import { CustomMarker } from "vue3-google-map";
import {
  MapPin,
  HomeIcon,
  BriefcaseIcon,
  SchoolIcon,
  BuildingIcon,
} from "lucide-vue-next";
import type { School } from "~/types/school";

const props = defineProps<{
  school: School;
}>();

const emit = defineEmits<{
  (e: "click", school: School): void;
}>();

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
</script>

<template>
  <CustomMarker
    :options="{
      position: { lat: school.lat, lng: school.lng },
      zIndex: 1,
      anchorPoint: 'CENTER',
    }"
  >
    <div
      class="relative w-0 h-0 flex justify-center items-end overflow-visible"
    >
      <div
        class="flex flex-col items-center cursor-pointer group -translate-y-px`"
        @click.stop="emit('click', school)"
      >
        <div
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
            class="w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-14 -mt-px"
            :style="{ borderTopColor: getCategoryColorHex(school.category) }"
          ></div>
        </div>
      </div>
    </div>
  </CustomMarker>
</template>
