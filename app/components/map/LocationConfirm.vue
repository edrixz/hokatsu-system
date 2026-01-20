<script setup lang="ts">
import { MapPinIcon, PlusCircleIcon } from "lucide-vue-next";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

defineEmits(["cancel", "confirm"]);
</script>

<template>
  <div
    class="absolute bottom-8 left-0 right-0 z-20 flex justify-center px-4 animate-in slide-in-from-bottom-5 fade-in"
  >
    <Card
      class="w-full max-w-sm p-3 shadow-2xl border-blue-500 border-2 bg-white/95 backdrop-blur rounded-xl"
    >
      <div class="flex flex-col gap-2">
        <div
          class="text-xs font-semibold text-center text-blue-700 flex items-center justify-center gap-1.5"
        >
          <MapPinIcon class="w-3.5 h-3.5 animate-bounce" />
          Điều chỉnh vị trí & xác nhận
        </div>

        <div class="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            class="flex-1 h-8 text-xs"
            @click="$emit('cancel')"
          >
            Hủy bỏ
          </Button>
          <Button
            size="sm"
            class="flex-1 h-8 text-xs bg-blue-600 hover:bg-blue-700 text-white"
            @click="$emit('confirm')"
          >
            <PlusCircleIcon class="mr-1.5 h-3.5 w-3.5" />
            Thêm điểm này
          </Button>
        </div>
      </div>
    </Card>
  </div>
</template>
