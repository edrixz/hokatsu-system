<script setup lang="ts">
import { ref, watch, computed } from "vue";
import {
  MapPin,
  Globe,
  Info,
  Clock,
  Baby,
  Users,
  Tag,
  ImagePlus,
} from "lucide-vue-next";
import Input from "@/components/ui/input/Input.vue";
import Textarea from "@/components/ui/textarea/Textarea.vue";
import Badge from "@/components/ui/badge/Badge.vue";
import type { School, AgeGroupData } from "~/types/school";

const props = defineProps<{
  school: School;
  isEditing: boolean;
  formData: any;
}>();

const emit = defineEmits<{
  (e: "file-change", file: File): void;
}>();

const tagsInput = ref("");
const previewUrl = ref<string | null>(null);
const statsKeys: (keyof AgeGroupData)[] = ["total", "age_0", "age_1"];

// [LOGIC MỚI] Kiểm tra xem có phải là Nhà riêng không
const isHome = computed(() => props.school.category === "Home");

// Sync tags & image preview
watch(
  () => props.school,
  (val) => {
    if (val) {
      tagsInput.value = (val.tags || []).join(", ");
      previewUrl.value = val.image_url || null;
    }
  },
  { immediate: true },
);

watch(tagsInput, (val) => {
  if (props.isEditing) {
    props.formData.tags = val
      .split(",")
      .map((t) => t.trim())
      .filter((t) => t !== "");
  }
});

const handleFile = (e: Event) => {
  const input = e.target as HTMLInputElement;
  if (input.files?.[0]) {
    previewUrl.value = URL.createObjectURL(input.files[0]);
    emit("file-change", input.files[0]);
  }
};
</script>

<template>
  <div class="space-y-6">
    <div
      class="aspect-video bg-slate-100 rounded-lg flex items-center justify-center border overflow-hidden relative group"
    >
      <img
        v-if="previewUrl"
        :src="previewUrl"
        class="w-full h-full object-cover"
      />
      <MapPin v-else class="w-10 h-10 text-slate-300" />

      <label
        v-if="isEditing"
        class="absolute inset-0 bg-black/40 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 cursor-pointer transition-opacity text-white"
      >
        <ImagePlus class="w-8 h-8 mb-1" />
        <span class="text-xs font-bold">Thay đổi ảnh</span>
        <input
          type="file"
          accept="image/*"
          class="hidden"
          @change="handleFile"
        />
      </label>
    </div>

    <div class="space-y-4">
      <div v-if="!isHome" class="space-y-2">
        <div class="flex items-center gap-2 font-medium text-slate-700 text-sm">
          <Tag class="w-4 h-4" /> Tiện ích
        </div>
        <div v-if="!isEditing" class="flex flex-wrap gap-1.5">
          <Badge
            v-for="tag in school.tags"
            :key="tag"
            variant="secondary"
            class="font-normal text-xs bg-slate-100"
          >
            {{ tag }}
          </Badge>
          <span
            v-if="!school.tags?.length"
            class="text-xs text-slate-400 italic"
            >---</span
          >
        </div>
        <Input
          v-else
          v-model="tagsInput"
          placeholder="Sân chơi, Camera... (ngăn cách dấu phẩy)"
          class="text-sm"
        />
      </div>

      <div class="flex gap-3">
        <MapPin class="w-5 h-5 text-slate-400 shrink-0" />
        <div class="flex-1 space-y-1">
          <div class="font-medium text-sm text-slate-700">Địa chỉ</div>
          <div v-if="!isEditing" class="text-sm text-slate-500">
            {{ school.address }}
          </div>
          <Input v-else v-model="formData.address" class="h-8 text-sm" />
        </div>
      </div>

      <div v-if="!isHome" class="flex gap-3">
        <Globe class="w-5 h-5 text-slate-400 shrink-0" />
        <div class="flex-1 space-y-1">
          <div class="font-medium text-sm text-slate-700">Website</div>
          <a
            v-if="!isEditing"
            :href="school.website_url"
            target="_blank"
            class="text-sm text-blue-600 hover:underline truncate block"
          >
            {{ school.website_url || "---" }}
          </a>
          <Input
            v-else
            v-model="formData.website_url"
            class="h-8 text-sm"
            placeholder="https://"
          />
        </div>
      </div>

      <div class="flex gap-3">
        <Info class="w-5 h-5 text-slate-400 shrink-0" />
        <div class="flex-1 space-y-1">
          <div class="font-medium text-sm text-slate-700">Ghi chú</div>
          <p
            v-if="!isEditing"
            class="text-sm text-slate-600 whitespace-pre-line"
          >
            {{ school.notes || "---" }}
          </p>
          <Textarea v-else v-model="formData.notes" class="text-sm" rows="3" />
        </div>
      </div>
    </div>

    <template v-if="!isHome">
      <div class="border-t border-dashed"></div>

      <div class="space-y-4">
        <h3 class="font-bold text-slate-800 flex items-center gap-2 text-sm">
          <Clock class="w-4 h-4" /> Vận hành
        </h3>
        <div class="grid grid-cols-2 gap-4 text-sm">
          <div>
            <div class="text-slate-500 text-xs mb-1">Giờ mở cửa</div>
            <div v-if="!isEditing">{{ school.opening_hours || "---" }}</div>
            <Input
              v-else
              v-model="formData.opening_hours"
              class="h-7"
              placeholder="7:00 - 18:00"
            />
          </div>
          <div>
            <div class="text-slate-500 text-xs mb-1">Giờ làm thêm</div>
            <div v-if="!isEditing">{{ school.extended_hours || "---" }}</div>
            <Input
              v-else
              v-model="formData.extended_hours"
              class="h-7"
              placeholder="tới 20:00"
            />
          </div>
          <div class="col-span-2">
            <div class="text-slate-500 text-xs mb-1">Độ tuổi nhận (tháng)</div>
            <div v-if="!isEditing" class="flex items-center gap-1">
              <Baby class="w-3 h-3" /> Từ {{ school.min_age_months || 0 }} tháng
            </div>
            <Input
              v-else
              type="number"
              v-model="formData.min_age_months"
              class="h-7 w-32"
            />
          </div>
        </div>
      </div>

      <div class="border-t border-dashed"></div>

      <div class="space-y-4">
        <h3 class="font-bold text-slate-800 flex items-center gap-2 text-sm">
          <Users class="w-4 h-4" /> Số liệu
        </h3>

        <div class="bg-slate-50 p-3 rounded-lg border">
          <div class="text-xs font-bold text-slate-500 mb-2 uppercase">
            Chỉ tiêu
          </div>
          <div class="grid grid-cols-3 gap-2 text-sm text-center">
            <div v-for="key in statsKeys" :key="key">
              <span class="text-[10px] text-slate-400 block capitalize">{{
                key === "total" ? "Tổng" : key.replace("_", " ")
              }}</span>
              <span v-if="!isEditing" class="font-bold text-lg">{{
                school.capacity_info?.[key] || 0
              }}</span>
              <Input
                v-else
                type="number"
                v-model="formData.capacity_info[key]"
                class="h-7 text-center"
              />
            </div>
          </div>
        </div>

        <div class="bg-red-50 p-3 rounded-lg border border-red-100">
          <div class="text-xs font-bold text-red-500 mb-2 uppercase">
            Chỗ trống
          </div>
          <div class="grid grid-cols-3 gap-2 text-sm text-center">
            <div v-for="key in statsKeys" :key="key">
              <span class="text-[10px] text-red-400 block capitalize">{{
                key === "total" ? "Tổng" : key.replace("_", " ")
              }}</span>
              <span v-if="!isEditing" class="font-bold text-lg text-red-700">{{
                school.vacancy_info?.[key] || 0
              }}</span>
              <Input
                v-else
                type="number"
                v-model="formData.vacancy_info[key]"
                class="h-7 text-center border-red-200"
              />
            </div>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>
