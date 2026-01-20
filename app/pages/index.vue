<script setup lang="ts">
import { ref, watch } from "vue"; // Import thêm watch
import { GoogleMap, AdvancedMarker } from "vue3-google-map";
import { ScrollArea } from "@/components/ui/scroll-area";
import { PanelLeftClose, PanelLeftOpen, MapPinIcon } from "lucide-vue-next"; // Import MapPinIcon
import { Button } from "@/components/ui/button";

// Imports Components
import SearchFloatingBar from "~/components/map/SearchFloatingBar.vue";
import LocationConfirm from "~/components/map/LocationConfirm.vue";
import SchoolList from "~/components/school/SchoolList.vue";

// Imports Composables
import { useSchools } from "~/composables/useSchools";
import type { School } from "~/types/school";

// Config
const config = useRuntimeConfig();
const mapRef = ref<InstanceType<typeof GoogleMap> | null>(null);
const center = ref({ lat: 35.9063, lng: 139.624 });

// State
const tempLocation = ref<{ lat: number; lng: number } | null>(null);
const isSidebarOpen = ref(true);
const isMapMoving = ref(false); // Trạng thái nhấc ghim

// Data Hook
const { schools, pending } = useSchools();

// --- Event Handlers ---
const onSearchSelect = (lat: number, lng: number) => {
  // Khi search: Pan map đến đó + bật chế độ thêm
  mapRef.value?.map?.panTo({ lat, lng });
  mapRef.value?.map?.setZoom(17);
  tempLocation.value = { lat, lng };
};

const handleMapClick = (event: google.maps.MapMouseEvent) => {
  if (event.latLng) {
    const lat = event.latLng.lat();
    const lng = event.latLng.lng();

    // UX QUAN TRỌNG: Pan map mượt mà để đưa điểm click vào giữa màn hình
    // Người dùng sẽ thấy ghim "trượt" tới đúng chỗ họ click
    mapRef.value?.map?.panTo({ lat, lng });

    // Bật chế độ thêm
    tempLocation.value = { lat, lng };
  }
};

// UX MỚI: Xử lý khi map di chuyển
const handleCenterChanged = () => {
  if (!tempLocation.value || !mapRef.value?.map) return;

  // Khi map di chuyển, ghim "nhấc lên"
  isMapMoving.value = true;

  // Cập nhật toạ độ tempLocation theo tâm màn hình
  const newCenter = mapRef.value.map.getCenter();
  if (newCenter) {
    tempLocation.value = {
      lat: newCenter.lat(),
      lng: newCenter.lng(),
    };
  }
};

// Khi map dừng di chuyển (idle) thì tắt hiệu ứng "đang bay"
const handleIdle = () => {
  // Khi map dừng, ghim "hạ xuống"
  isMapMoving.value = false;
};

const focusLocation = (school: School) => {
  center.value = { lat: school.lat, lng: school.lng };
  mapRef.value?.map?.setZoom(16);
  tempLocation.value = null; // Tắt chế độ thêm mới khi đang xem trường cũ
};

const cancelAdd = () => {
  tempLocation.value = null;
};

const openAddForm = () => {
  alert(`Lưu tọa độ: ${tempLocation.value?.lat}, ${tempLocation.value?.lng}`);
};
</script>

<template>
  <div class="flex w-full h-dvh overflow-hidden bg-background">
    <transition name="slide">
      <div
        v-if="isSidebarOpen"
        class="hidden md:flex w-87.5 border-r bg-white flex-col shrink-0"
      >
        <div class="p-4 border-b bg-slate-50 flex justify-between items-center">
          <h1 class="font-bold text-lg text-slate-800">🗺️ Hokatsu Map</h1>
          <Button variant="ghost" size="icon" @click="isSidebarOpen = false"
            ><PanelLeftClose class="w-4 h-4"
          /></Button>
        </div>
        <ScrollArea class="flex-1 p-4">
          <SchoolList
            :schools="schools"
            :pending="pending"
            @select="focusLocation"
          />
        </ScrollArea>
      </div>
    </transition>

    <div class="flex-1 relative h-full w-full">
      <client-only>
        <GoogleMap
          ref="mapRef"
          :api-key="config.public.googleMapsApiKey"
          map-id="DEMO_MAP_ID"
          class="w-full h-full"
          :center="center"
          :zoom="15"
          :disable-default-ui="true"
          @click="handleMapClick"
          @center_changed="handleCenterChanged"
          @idle="handleIdle"
        >
          <AdvancedMarker
            v-for="school in schools"
            :key="school.id"
            :options="{
              position: { lat: school.lat, lng: school.lng },
              title: school.name,
            }"
          >
            <div
              class="p-2 bg-blue-500 rounded-full border-2 border-white shadow-lg"
            >
              <div class="w-2 h-2 bg-white rounded-full"></div>
            </div>
          </AdvancedMarker>
        </GoogleMap>
      </client-only>

      <div
        v-if="tempLocation"
        class="absolute inset-0 pointer-events-none z-10 flex items-center justify-center pb-8"
      >
        <div class="relative flex flex-col items-center">
          <div
            class="relative z-10 transition-transform duration-200 ease-out origin-bottom"
            :class="{ '-translate-y-4': isMapMoving }"
          >
            <MapPinIcon
              class="w-10 h-10 text-red-600 drop-shadow-md filter"
              fill="currentColor"
              :stroke-width="1.5"
            />
            <div
              class="absolute top-3 left-1/2 -translate-x-1/2 w-3 h-3 bg-white rounded-full shadow-inner"
            ></div>
          </div>

          <div
            class="z-0 -mt-1 w-4 h-1.5 bg-neutral-800 rounded-[100%] blur-[1px] transition-all duration-200 ease-out"
            :class="
              isMapMoving ? 'scale-50 opacity-30' : 'scale-100 opacity-60'
            "
          ></div>
        </div>
      </div>

      <LocationConfirm
        v-if="tempLocation"
        @cancel="cancelAdd"
        @confirm="openAddForm"
      />

      <div
        v-if="!isSidebarOpen"
        class="hidden md:block absolute top-4 left-4 z-20"
      >
        <Button variant="secondary" size="icon" @click="isSidebarOpen = true"
          ><PanelLeftOpen class="w-5 h-5"
        /></Button>
      </div>

      <div
        class="absolute top-4 z-20 w-auto transition-all duration-300"
        :class="[
          'left-4 right-4 md:right-auto md:w-100',
          !isSidebarOpen && 'md:left-16',
        ]"
      >
        <SearchFloatingBar @place-selected="onSearchSelect">
          <template #drawer-content
            ><SchoolList
              :schools="schools"
              :pending="pending"
              @select="focusLocation"
          /></template>
        </SearchFloatingBar>
      </div>
    </div>
  </div>
</template>
