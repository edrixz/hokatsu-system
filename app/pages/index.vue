<script setup lang="ts">
import { ref, computed } from "vue";
import { GoogleMap } from "vue3-google-map";
import Button from "@/components/ui/button/Button.vue";
import { PanelLeftClose, PanelLeftOpen, MapPinIcon } from "lucide-vue-next";

import SearchFloatingBar from "~/components/map/SearchFloatingBar.vue";
import LocationConfirm from "~/components/map/LocationConfirm.vue";
import SchoolList from "~/components/school/SchoolList.vue";
import LocationAddForm from "~/components/map/LocationAddForm.vue";
import SchoolMarker from "~/components/map/SchoolMarker.vue";
import SchoolDetailPanel from "~/components/school/SchoolDetailPanel.vue";

import { useSchools } from "~/composables/useSchools";
import { useDirections } from "~/composables/useDirections";
import { useRouteStore } from "~/stores/route-store";
import type { School } from "~/types/school";

const config = useRuntimeConfig();
const mapRef = ref<InstanceType<typeof GoogleMap> | null>(null);
const center = ref({ lat: 35.9063, lng: 139.624 });

// State UI
const tempLocation = ref<{ lat: number; lng: number } | null>(null);
const selectedSchoolId = ref<string | null>(null);
const isSidebarOpen = ref(true);
const isMapMoving = ref(false);
const showAddForm = ref(false);
const isAdding = ref(false);
const hasCalculated = ref(false);

const { schools, pending, addSchool } = useSchools();
const { calculateRoutes, tryRestoreRoute, switchMode, clearMapRoute } =
  useDirections();
const routeStore = useRouteStore();

const selectedSchool = computed(
  () => schools.value?.find((s) => s.id === selectedSchoolId.value) || null,
);

const homeLocation = computed(() =>
  schools.value?.find((s) => s.category === "Home"),
);

// --- HANDLERS ---
const focusLocation = (school: School) => {
  center.value = { lat: school.lat, lng: school.lng };
  mapRef.value?.map?.setZoom(16);
  mapRef.value?.map?.panTo({ lat: school.lat, lng: school.lng });

  selectedSchoolId.value = school.id;
  tempLocation.value = null;

  if (mapRef.value?.map && tryRestoreRoute(mapRef.value.map, school.id)) {
    hasCalculated.value = true;
  } else {
    hasCalculated.value = false;
  }
};

const handleCalculateRoute = () => {
  if (selectedSchool.value && homeLocation.value && mapRef.value?.map) {
    calculateRoutes(
      mapRef.value.map,
      { lat: homeLocation.value.lat, lng: homeLocation.value.lng },
      { lat: selectedSchool.value.lat, lng: selectedSchool.value.lng },
      selectedSchool.value.id,
    );
    hasCalculated.value = true;
  } else if (!homeLocation.value) {
    alert("Bạn chưa lưu địa điểm nào là 'Home'!");
  }
};

const handleOpenGoogleMaps = () => {
  if (!selectedSchool.value) return;
  let url = `https://www.google.com/maps/dir/?api=1&destination=${selectedSchool.value.lat},${selectedSchool.value.lng}`;
  if (homeLocation.value) {
    url += `&origin=${homeLocation.value.lat},${homeLocation.value.lng}`;
  }
  if (routeStore.selectedMode === "BICYCLING") {
    url += `&travelmode=bicycling`;
  } else {
    url += `&travelmode=driving`;
  }
  window.open(url, "_blank");
};

const closeDetail = () => {
  selectedSchoolId.value = null;
};

const onSearchSelect = (lat: number, lng: number) => {
  mapRef.value?.map?.panTo({ lat, lng });
  mapRef.value?.map?.setZoom(17);
  tempLocation.value = { lat, lng };
  selectedSchoolId.value = null;
  clearMapRoute();
};

const handleMapClick = (event: google.maps.MapMouseEvent) => {
  if (selectedSchoolId.value) {
    closeDetail();
    return;
  }
  if (event.latLng) {
    const lat = event.latLng.lat();
    const lng = event.latLng.lng();
    mapRef.value?.map?.panTo({ lat, lng });
    tempLocation.value = { lat, lng };
  }
};

const handleCenterChanged = () => {
  if (!tempLocation.value || !mapRef.value?.map) return;
  isMapMoving.value = true;
  const newCenter = mapRef.value.map.getCenter();
  if (newCenter)
    tempLocation.value = { lat: newCenter.lat(), lng: newCenter.lng() };
};

const handleIdle = () => {
  isMapMoving.value = false;
};
const cancelAdd = () => {
  tempLocation.value = null;
};
const openAddForm = () => {
  showAddForm.value = true;
};

const handleAddSubmit = async (formData: any, file: File | null) => {
  isAdding.value = true;
  try {
    await addSchool(formData, file);
    showAddForm.value = false;
    tempLocation.value = null;
    alert("✅ Thêm địa điểm thành công!");
  } catch (e: any) {
    alert("❌ Lỗi: " + e.message);
  } finally {
    isAdding.value = false;
  }
};
</script>

<template>
  <div class="flex w-full h-dvh overflow-hidden bg-background">
    <transition name="slide">
      <div
        v-if="isSidebarOpen"
        class="hidden md:flex w-95 border-r bg-white flex-col shrink-0 z-20 shadow-xl"
      >
        <div
          class="p-4 border-b bg-white flex justify-between items-center shrink-0 z-20"
        >
          <div class="flex items-center gap-2">
            <span class="text-2xl">🗺️</span>
            <div>
              <h1 class="font-bold text-lg text-slate-800 leading-none">
                Hokatsu Map
              </h1>
              <span class="text-[10px] text-slate-400 font-medium"
                >Bản đồ trường mầm non Toda</span
              >
            </div>
          </div>
          <Button variant="ghost" size="icon" @click="isSidebarOpen = false">
            <PanelLeftClose class="w-4 h-4 text-slate-500" />
          </Button>
        </div>

        <div class="flex-1 min-h-0 relative bg-slate-50 overflow-hidden">
          <SchoolList
            :schools="schools"
            :pending="pending"
            @select="focusLocation"
            class="h-full"
          />
        </div>
      </div>
    </transition>

    <div class="flex-1 flex relative h-full w-full overflow-hidden">
      <div class="flex-1 relative h-full">
        <LocationAddForm
          v-if="tempLocation"
          v-model:open="showAddForm"
          :lat="tempLocation.lat"
          :lng="tempLocation.lng"
          :is-loading="isAdding"
          @submit="handleAddSubmit"
        />

        <client-only>
          <div class="w-full h-full" v-if="config.public.googleMapsMapId">
            <GoogleMap
              ref="mapRef"
              :api-key="config.public.googleMapsApiKey"
              :map-id="config.public.googleMapsMapId"
              class="w-full h-full"
              :center="center"
              :zoom="15"
              :disable-default-ui="true"
              @click="handleMapClick"
              @center_changed="handleCenterChanged"
              @idle="handleIdle"
            >
              <SchoolMarker
                v-for="school in schools"
                :key="school.id"
                :school="school"
                @click="focusLocation"
              />
            </GoogleMap>
          </div>
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
                class="w-12 h-12 text-red-600 drop-shadow-lg filter"
                fill="currentColor"
                :stroke-width="1.5"
              />
              <div
                class="absolute top-4 left-1/2 -translate-x-1/2 w-4 h-4 bg-white rounded-full shadow-inner"
              ></div>
            </div>
            <div
              class="z-0 -mt-1 w-5 h-2 bg-neutral-800 rounded-[100%] blur-[2px] transition-all duration-200 ease-out"
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
          <Button
            variant="secondary"
            size="icon"
            @click="isSidebarOpen = true"
            class="shadow-md bg-white hover:bg-slate-50 border border-slate-200"
          >
            <PanelLeftOpen class="w-5 h-5 text-slate-700" />
          </Button>
        </div>

        <div
          class="absolute top-4 z-20 w-auto transition-all duration-300"
          :class="[
            'left-4 right-4 md:right-auto md:w-96',
            !isSidebarOpen && 'md:left-16',
          ]"
        >
          <SearchFloatingBar @place-selected="onSearchSelect">
            <template #drawer-content>
              <SchoolList
                :schools="schools"
                :pending="pending"
                @select="focusLocation"
              />
            </template>
          </SearchFloatingBar>
        </div>
      </div>

      <transition name="slide-right">
        <SchoolDetailPanel
          v-if="selectedSchool"
          :school="selectedSchool"
          :has-calculated="hasCalculated"
          @close="closeDetail"
          @calculate="handleCalculateRoute"
          @switch-mode="switchMode"
          @open-google-maps="handleOpenGoogleMaps"
        />
      </transition>
    </div>
  </div>
</template>

<style scoped>
.slide-enter-active,
.slide-leave-active {
  transition:
    transform 0.3s ease,
    opacity 0.3s ease;
}
.slide-enter-from,
.slide-leave-to {
  transform: translateX(-100%);
  opacity: 0.5;
}
.slide-right-enter-active,
.slide-right-leave-active {
  transition:
    transform 0.3s ease,
    opacity 0.3s ease;
}
.slide-right-enter-from,
.slide-right-leave-to {
  transform: translateX(100%);
  opacity: 0.8;
}
</style>
