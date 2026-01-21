<script setup lang="ts">
import { computed } from "vue";
import { X, Edit, Save, Trash2, Map, Loader2 } from "lucide-vue-next";
import Button from "@/components/ui/button/Button.vue";
import Badge from "@/components/ui/badge/Badge.vue";
import Input from "@/components/ui/input/Input.vue";
import StarRating from "@/components/ui/StarRating.vue";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { School } from "~/types/school";

const props = defineProps<{
  school: School;
  isEditing: boolean;
  isSaving: boolean;
  isDeleting: boolean;
  formData: any; // Dữ liệu đang edit
}>();

const emit = defineEmits<{
  (e: "close"): void;
  (e: "edit"): void;
  (e: "cancel"): void;
  (e: "save"): void;
  (e: "delete"): void;
  (e: "openMap"): void;
}>();

const categories = [
  { value: "Public", label: "Trường Công" },
  { value: "Private", label: "Trường Tư" },
  { value: "SmallScale", label: "Quy mô nhỏ" },
  { value: "Home", label: "Nhà riêng" },
  { value: "Work", label: "Công ty" },
  { value: "Company", label: "Doanh nghiệp" },
];

const getBadgeVariant = (cat: string) => {
  switch (cat) {
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
</script>

<template>
  <div
    class="p-4 border-b bg-slate-50 flex flex-col gap-3 shrink-0 z-10 shadow-sm"
  >
    <div class="flex justify-between items-start gap-2">
      <div class="flex-1 min-w-0">
        <div v-if="!isEditing">
          <h2
            class="font-bold text-xl text-slate-800 wrap-break-word leading-tight"
          >
            {{ school.name }}
          </h2>
          <div class="flex flex-wrap items-center gap-2 mt-2">
            <Badge :variant="getBadgeVariant(school.category)">{{
              school.category
            }}</Badge>
            <div
              v-if="school.ranking"
              class="flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-yellow-50 border border-yellow-100"
            >
              <StarRating :model-value="school.ranking" readonly />
            </div>
          </div>
        </div>

        <div v-else class="space-y-2">
          <Input
            v-model="formData.name"
            class="font-bold h-9"
            placeholder="Tên địa điểm"
          />
          <div class="flex gap-2">
            <Select v-model="formData.category">
              <SelectTrigger class="h-8 text-xs flex-1"
                ><SelectValue
              /></SelectTrigger>
              <SelectContent>
                <SelectItem
                  v-for="c in categories"
                  :key="c.value"
                  :value="c.value"
                  >{{ c.label }}</SelectItem
                >
              </SelectContent>
            </Select>
            <div class="flex items-center px-2 border rounded-md bg-white h-8">
              <StarRating v-model="formData.ranking" />
            </div>
          </div>
        </div>
      </div>

      <div class="flex gap-1 shrink-0">
        <Button
          variant="outline"
          size="icon"
          @click="$emit('openMap')"
          title="Mở Google Maps"
        >
          <Map class="w-4 h-4 text-blue-600" />
        </Button>

        <Button
          variant="outline"
          size="icon"
          class="text-red-600 hover:bg-red-50 hover:text-red-700 border-red-200"
          @click="$emit('delete')"
          :disabled="isDeleting"
          title="Xóa địa điểm"
        >
          <Loader2 v-if="isDeleting" class="w-4 h-4 animate-spin" />
          <Trash2 v-else class="w-4 h-4" />
        </Button>

        <Button
          v-if="!isEditing"
          variant="ghost"
          size="icon"
          @click="$emit('edit')"
          title="Chỉnh sửa"
        >
          <Edit class="w-4 h-4 text-slate-600" />
        </Button>
        <div v-else class="flex gap-1">
          <Button
            variant="default"
            size="icon"
            @click="$emit('save')"
            :disabled="isSaving"
            class="bg-green-600 hover:bg-green-700 text-white"
          >
            <Loader2 v-if="isSaving" class="w-4 h-4 animate-spin" />
            <Save v-else class="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            @click="$emit('cancel')"
            :disabled="isSaving"
            ><X class="w-4 h-4"
          /></Button>
        </div>

        <Button
          variant="ghost"
          size="icon"
          @click="$emit('close')"
          class="-mr-2 text-slate-400"
          ><X class="w-5 h-5"
        /></Button>
      </div>
    </div>
  </div>
</template>
