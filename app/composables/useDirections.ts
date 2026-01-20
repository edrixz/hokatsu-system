// app/composables/useDirections.ts
import { onUnmounted } from "vue";
import { useRouteStore } from "~/stores/route-store";

export const useDirections = () => {
  const store = useRouteStore();

  // Renderer giữ local để thao tác DOM
  let directionsRenderer: google.maps.DirectionsRenderer | null = null;
  let currentMap: google.maps.Map | null = null;

  const initRenderer = (map: google.maps.Map) => {
    if (directionsRenderer) return;
    currentMap = map;
    directionsRenderer = new google.maps.DirectionsRenderer({
      map,
      suppressMarkers: true,
      polylineOptions: { strokeWeight: 5, strokeOpacity: 0.7 },
    });
  };

  const renderRoute = (mode: "DRIVING" | "BICYCLING") => {
    // Lấy dữ liệu từ Store để vẽ
    if (!directionsRenderer || !store.rawRoutes[mode]) return;

    // Đảm bảo renderer được gắn vào map
    if (currentMap && !directionsRenderer.getMap()) {
      directionsRenderer.setMap(currentMap);
    }

    directionsRenderer.setOptions({
      polylineOptions: {
        strokeColor: mode === "DRIVING" ? "#2563eb" : "#16a34a",
        strokeWeight: 6,
        strokeOpacity: 0.8,
      },
    });

    directionsRenderer.setDirections(store.rawRoutes[mode]);
  };

  const calculateRoutes = (
    map: google.maps.Map,
    origin: { lat: number; lng: number },
    destination: { lat: number; lng: number },
    destinationId: string,
  ) => {
    if (!window.google) return;

    store.isRouting = true;
    store.selectedMode = "BICYCLING"; // Reset về xe đạp khi tính mới

    initRenderer(map);
    // Tạm ẩn đường cũ khi đang tính toán mới
    if (directionsRenderer) directionsRenderer.setMap(null);

    const service = new google.maps.DirectionsService();

    // Helper fetch
    const fetchRoute = (mode: google.maps.TravelMode) => {
      return new Promise<{ data: any; result: any } | null>((resolve) => {
        service.route(
          {
            origin,
            destination,
            travelMode: mode,
          },
          (result, status) => {
            if (status === "OK" && result?.routes[0]?.legs[0]) {
              resolve({
                data: {
                  distance: result.routes[0].legs[0].distance?.text || "",
                  duration: result.routes[0].legs[0].duration?.text || "",
                },
                result: result,
              });
            } else {
              resolve(null);
            }
          },
        );
      });
    };

    Promise.all([
      fetchRoute(google.maps.TravelMode.DRIVING),
      fetchRoute(google.maps.TravelMode.BICYCLING),
    ]).then(([drivingRes, bicyclingRes]) => {
      // Lưu vào Store
      store.saveRoute(destinationId, origin, drivingRes, bicyclingRes);
      store.isRouting = false;

      // Vẽ lên map
      if (store.rawRoutes.BICYCLING) {
        store.selectedMode = "BICYCLING";
        renderRoute("BICYCLING");
      } else if (store.rawRoutes.DRIVING) {
        store.selectedMode = "DRIVING";
        renderRoute("DRIVING");
      }
    });
  };

  // Hàm khôi phục thông minh
  const tryRestoreRoute = (map: google.maps.Map, id: string): boolean => {
    // Kiểm tra xem ID mới có trùng ID trong Store không
    if (
      id === store.cachedId &&
      (store.rawRoutes.DRIVING || store.rawRoutes.BICYCLING)
    ) {
      // TRÙNG KHỚP -> Vẽ lại ngay từ Store (Không tốn API)
      initRenderer(map);
      renderRoute(store.selectedMode);
      return true;
    }
    // KHÁC -> Không làm gì cả (Giữ nguyên đường cũ trên map theo yêu cầu)
    return false;
  };

  const switchMode = (mode: "DRIVING" | "BICYCLING") => {
    if (store.rawRoutes[mode]) {
      store.selectedMode = mode;
      renderRoute(mode);
    }
  };

  const clearMapRoute = () => {
    if (directionsRenderer) directionsRenderer.setMap(null);
    store.clearStore();
  };

  onUnmounted(() => {
    if (directionsRenderer) directionsRenderer.setMap(null);
  });

  return {
    calculateRoutes,
    tryRestoreRoute,
    switchMode,
    clearMapRoute,
  };
};
