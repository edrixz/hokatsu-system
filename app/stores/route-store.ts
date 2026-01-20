// app/stores/route.ts
import { defineStore } from "pinia";
import { ref, shallowRef } from "vue";

export const useRouteStore = defineStore("route", () => {
  // State
  const isRouting = ref(false);
  const selectedMode = ref<"DRIVING" | "BICYCLING">("BICYCLING");
  const cachedId = ref<string | null>(null); // ID của địa điểm đang được cache
  const userLocation = ref<{ lat: number; lng: number } | null>(null);

  // Info Text (Hiển thị UI)
  const routeInfo = ref<{
    driving: { distance: string; duration: string } | null;
    bicycling: { distance: string; duration: string } | null;
  }>({ driving: null, bicycling: null });

  // Raw Data (Dùng để vẽ Map - Dùng shallowRef để tối ưu hiệu năng)
  const rawRoutes = shallowRef<{
    DRIVING: any;
    BICYCLING: any;
  }>({
    DRIVING: null,
    BICYCLING: null,
  });

  // Actions
  function saveRoute(
    id: string,
    origin: { lat: number; lng: number },
    drivingRes: any,
    bicyclingRes: any,
  ) {
    cachedId.value = id;
    userLocation.value = origin;

    routeInfo.value = {
      driving: drivingRes?.data || null,
      bicycling: bicyclingRes?.data || null,
    };

    rawRoutes.value = {
      DRIVING: drivingRes?.result || null,
      BICYCLING: bicyclingRes?.result || null,
    };
  }

  function clearStore() {
    cachedId.value = null;
    rawRoutes.value = { DRIVING: null, BICYCLING: null };
    routeInfo.value = { driving: null, bicycling: null };
  }

  return {
    isRouting,
    selectedMode,
    cachedId,
    userLocation,
    routeInfo,
    rawRoutes,
    saveRoute,
    clearStore,
  };
});
