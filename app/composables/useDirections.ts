import { ref, onUnmounted } from "vue";

export const useDirections = () => {
  const isRouting = ref(false);
  const selectedMode = ref<"DRIVING" | "BICYCLING">("BICYCLING");
  const userLocation = ref<{ lat: number; lng: number } | null>(null);

  // Dữ liệu hiển thị (Text)
  const routeInfo = ref<{
    driving: { distance: string; duration: string } | null;
    bicycling: { distance: string; duration: string } | null;
  }>({ driving: null, bicycling: null });

  // Dữ liệu Raw (để vẽ)
  const rawRoutes = {
    DRIVING: null as any,
    BICYCLING: null as any,
  };

  // Renderer của Google
  let directionsRenderer: google.maps.DirectionsRenderer | null = null;
  let currentMap: google.maps.Map | null = null; // Lưu tham chiếu map

  // Khởi tạo Renderer
  const initRenderer = (map: google.maps.Map) => {
    if (directionsRenderer) return;
    currentMap = map;
    directionsRenderer = new google.maps.DirectionsRenderer({
      map,
      suppressMarkers: true, // Tắt marker A-B mặc định
      polylineOptions: { strokeWeight: 5, strokeOpacity: 0.7 },
    });
  };

  // Vẽ đường
  const renderRoute = (mode: "DRIVING" | "BICYCLING") => {
    if (!directionsRenderer || !rawRoutes[mode]) return;

    // [QUAN TRỌNG] Gắn lại renderer vào map nếu nó đang bị gỡ
    if (currentMap && !directionsRenderer.getMap()) {
      directionsRenderer.setMap(currentMap);
    }

    // Config màu sắc
    directionsRenderer.setOptions({
      polylineOptions: {
        strokeColor: mode === "DRIVING" ? "#2563eb" : "#16a34a",
        strokeWeight: 6,
        strokeOpacity: 0.8,
      },
    });
    directionsRenderer.setDirections(rawRoutes[mode]);
  };

  // Tính toán
  const calculateRoutes = (
    map: google.maps.Map,
    origin: { lat: number; lng: number },
    destination: { lat: number; lng: number },
  ) => {
    if (!window.google) return;

    isRouting.value = true;
    routeInfo.value = { driving: null, bicycling: null };
    rawRoutes.DRIVING = null;
    rawRoutes.BICYCLING = null;
    selectedMode.value = "BICYCLING";

    initRenderer(map);

    // [FIX LỖI] Thay vì setDirections({routes: []}), ta gỡ renderer khỏi map
    if (directionsRenderer) {
      directionsRenderer.setMap(null);
    }

    const service = new google.maps.DirectionsService();
    userLocation.value = origin;

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
      routeInfo.value = {
        driving: drivingRes?.data || null,
        bicycling: bicyclingRes?.data || null,
      };
      rawRoutes.DRIVING = drivingRes?.result || null;
      rawRoutes.BICYCLING = bicyclingRes?.result || null;

      isRouting.value = false;

      // Tự động vẽ đường có sẵn (Ưu tiên Xe đạp)
      if (rawRoutes.BICYCLING) {
        selectedMode.value = "BICYCLING";
        renderRoute("BICYCLING");
      } else if (rawRoutes.DRIVING) {
        selectedMode.value = "DRIVING";
        renderRoute("DRIVING");
      }
    });
  };

  const switchMode = (mode: "DRIVING" | "BICYCLING") => {
    if (rawRoutes[mode]) {
      selectedMode.value = mode;
      renderRoute(mode);
    }
  };

  const clearRoute = () => {
    if (directionsRenderer) directionsRenderer.setMap(null);
    routeInfo.value = { driving: null, bicycling: null };
  };

  onUnmounted(() => {
    if (directionsRenderer) directionsRenderer.setMap(null);
  });

  return {
    isRouting,
    selectedMode,
    routeInfo,
    userLocation,
    calculateRoutes,
    switchMode,
    clearRoute,
  };
};
