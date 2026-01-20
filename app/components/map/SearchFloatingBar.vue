<script setup lang="ts">
import { ref } from "vue";
import { SearchIcon, ListIcon } from "lucide-vue-next";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { usePlaceAutocomplete } from "~/composables/usePlaceAutocomplete";

const emit = defineEmits<{
  (e: "place-selected", lat: number, lng: number): void;
}>();

const inputRef = ref<HTMLInputElement | null>(null);

// Sử dụng Composable đã tách
usePlaceAutocomplete(inputRef, (lat, lng) => {
  emit("place-selected", lat, lng);
});
</script>

<template>
  <div class="absolute top-4 left-4 right-4 z-10 flex gap-2">
    <div
      class="relative flex-1 bg-white rounded-lg shadow-lg border border-slate-200"
    >
      <SearchIcon class="absolute left-3 top-3 h-4 w-4 text-slate-400" />
      <input
        ref="inputRef"
        type="text"
        placeholder="Tìm trường, nhà, công ty..."
        class="w-full h-10 pl-9 pr-4 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
      />
    </div>

    <Sheet>
      <SheetTrigger as-child>
        <Button
          variant="secondary"
          size="icon"
          class="h-10 w-10 shadow-lg shrink-0 md:hidden bg-white border border-slate-200"
        >
          <ListIcon class="h-5 w-5 text-slate-600" />
        </Button>
      </SheetTrigger>

      <SheetContent side="bottom" class="h-[80vh] rounded-t-xl">
        <SheetHeader class="mb-4">
          <SheetTitle>Danh sách địa điểm</SheetTitle>
        </SheetHeader>
        <div class="overflow-y-auto h-full pb-10">
          <slot name="drawer-content" />
        </div>
      </SheetContent>
    </Sheet>
  </div>
</template>
