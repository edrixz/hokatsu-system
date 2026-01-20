<script setup lang="ts">
import { ref } from "vue";
import { GoogleMap, CustomMarker } from "vue3-google-map"; // Import CustomMarker
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  PanelLeftClose,
  PanelLeftOpen,
  X,
  MapPin,
  Navigation,
  Info,
  MapPinIcon,
  HomeIcon,
  BriefcaseIcon,
  SchoolIcon,
  BuildingIcon,
} from "lucide-vue-next";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

// Components
import SearchFloatingBar from "~/components/map/SearchFloatingBar.vue";
import LocationConfirm from "~/components/map/LocationConfirm.vue";
import SchoolList from "~/components/school/SchoolList.vue";
import LocationAddForm from "~/components/map/LocationAddForm.vue";

// Composables
import { useSchools } from "~/composables/useSchools";
import type { School } from "~/types/school";

// Config
const config = useRuntimeConfig();
const mapRef = ref<InstanceType<typeof GoogleMap> | null>(null);
const center = ref({ lat: 35.9063, lng: 139.624 });

// --- STATE ---
const tempLocation = ref<{ lat: number; lng: number } | null>(null);
const selectedSchool = ref<School | null>(null);
const isSidebarOpen = ref(true);
const isMapMoving = ref(false);
const showAddForm = ref(false);
const isAdding = ref(false);

const { schools, pending, addSchool } = useSchools();

// --- LOGIC MÀU SẮC & ICON ---
// 1. Lấy màu HEX (cho Style inline)
const getCategoryColorHex = (category: string) => {
  switch (category) {
    case "Home":
      return "#f43f5e"; // Rose-500
    case "Work":
      return "#475569"; // Slate-600
    case "Public":
      return "#16a34a"; // Green-600
    case "Private":
      return "#9333ea"; // Purple-600
    case "SmallScale":
      return "#ea580c"; // Orange-600
    default:
      return "#2563eb"; // Blue-600
  }
};

// 2. Lấy Icon Component
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

// 3. Lấy Variant cho Badge (UI Detail)
const getCategoryBadgeVariant = (category: string) => {
  switch (category) {
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

// --- HANDLERS ---
const focusLocation = (school: School) => {
  center.value = { lat: school.lat, lng: school.lng };
  mapRef.value?.map?.setZoom(17);
  mapRef.value?.map?.panTo({ lat: school.lat, lng: school.lng });
  selectedSchool.value = school;
  tempLocation.value = null;
};

const closeDetail = () => {
  selectedSchool.value = null;
};

const onSearchSelect = (lat: number, lng: number) => {
  mapRef.value?.map?.panTo({ lat, lng });
  mapRef.value?.map?.setZoom(17);
  tempLocation.value = { lat, lng };
  selectedSchool.value = null;
};

const handleMapClick = (event: google.maps.MapMouseEvent) => {
  if (selectedSchool.value) {
    selectedSchool.value = null;
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
        class="hidden md:flex w-87.5 border-r bg-white flex-col shrink-0 z-20"
      >
        <div class="p-4 border-b bg-slate-50 flex justify-between items-center">
          <h1 class="font-bold text-lg text-slate-800">🗺️ Hokatsu Map</h1>
          <Button variant="ghost" size="icon" @click="isSidebarOpen = false">
            <PanelLeftClose class="w-4 h-4" />
          </Button>
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
              <CustomMarker
                v-for="school in schools"
                :key="school.id"
                :options="{
                  position: { lat: school.lat, lng: school.lng },
                  anchorPoint: 'BOTTOM_CENTER',
                  zIndex: 1,
                }"
              >
                <div
                  class="flex flex-col items-center cursor-pointer group"
                  @click.stop="focusLocation(school)"
                >
                  <div
                    class="bg-white/95 backdrop-blur-sm text-slate-800 text-[11px] font-bold px-2 py-1 rounded shadow-sm mb-1 whitespace-nowrap transition-transform group-hover:scale-105"
                  >
                    {{ school.name }}
                  </div>

                  <div
                    class="relative flex flex-col items-center filter drop-shadow-md transition-transform group-hover:-translate-y-2"
                  >
                    <div
                      class="w-9 h-9 rounded-full flex items-center justify-center text-white"
                      :style="{
                        backgroundColor: getCategoryColorHex(school.category),
                      }"
                    >
                      <component
                        :is="getCategoryIcon(school.category)"
                        class="w-4 h-4"
                      />
                    </div>
                    <div
                      class="w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-8 -mt-px"
                      :style="{
                        borderTopColor: getCategoryColorHex(school.category),
                      }"
                    ></div>
                  </div>
                </div>
              </CustomMarker>
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
          <Button variant="secondary" size="icon" @click="isSidebarOpen = true">
            <PanelLeftOpen class="w-5 h-5" />
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
        <div
          v-if="selectedSchool"
          class="w-100 border-l bg-white h-full shadow-2xl z-30 flex flex-col"
        >
          <div
            class="p-4 border-b flex justify-between items-start bg-slate-50"
          >
            <div>
              <h2 class="font-bold text-xl text-slate-800 wrap-break-word pr-2">
                {{ selectedSchool.name }}
              </h2>
              <div class="mt-2">
                <Badge
                  :variant="getCategoryBadgeVariant(selectedSchool.category)"
                >
                  {{ selectedSchool.category || "Địa điểm" }}
                </Badge>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              @click="closeDetail"
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
                v-if="selectedSchool.image_url"
                :src="selectedSchool.image_url"
                class="w-full h-full object-cover"
              />
              <MapPin v-else class="w-10 h-10 text-slate-300" />
            </div>
            <div class="space-y-4">
              <div class="flex items-start gap-3">
                <MapPin class="w-5 h-5 text-slate-400 shrink-0 mt-0.5" />
                <div>
                  <div class="font-medium text-slate-700">Địa chỉ</div>
                  <div class="text-sm text-slate-500">
                    {{
                      selectedSchool.address ||
                      `${selectedSchool.lat.toFixed(6)}, ${selectedSchool.lng.toFixed(6)}`
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
                    {{ selectedSchool.notes || "Chưa có ghi chú." }}
                  </p>
                </div>
              </div>
            </div>
          </ScrollArea>
          <div class="p-4 border-t bg-slate-50 space-y-2">
            <Button class="w-full gap-2">
              <Navigation class="w-4 h-4" />
              Chỉ đường
            </Button>
            <Button
              variant="outline"
              class="w-full text-red-600 hover:text-red-700 hover:bg-red-50"
            >
              Xóa địa điểm
            </Button>
          </div>
        </div>
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
