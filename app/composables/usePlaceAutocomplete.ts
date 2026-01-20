import { ref, onMounted } from "vue";

export const usePlaceAutocomplete = (
  inputRef: Ref<HTMLInputElement | null>,
  onPlaceSelected: (lat: number, lng: number) => void,
) => {
  const isReady = ref(false);

  const initAutocomplete = () => {
    if (!inputRef.value || !window.google) return;

    const autocomplete = new google.maps.places.Autocomplete(inputRef.value, {
      fields: ["geometry", "name"],
      componentRestrictions: { country: "jp" },
    });

    autocomplete.addListener("place_changed", () => {
      const place = autocomplete.getPlace();
      if (!place.geometry || !place.geometry.location) return;

      onPlaceSelected(
        place.geometry.location.lat(),
        place.geometry.location.lng(),
      );
    });

    isReady.value = true;
  };

  onMounted(() => {
    // Retry check cho đến khi Google Maps SDK load xong
    const interval = setInterval(() => {
      if (window.google && inputRef.value) {
        clearInterval(interval);
        initAutocomplete();
      }
    }, 500);
  });

  return { isReady };
};
