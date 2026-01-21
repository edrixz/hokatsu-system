<script setup lang="ts">
import { computed } from "vue";
import {
  X,
  Edit,
  Save,
  Trash2,
  Map,
  Loader2,
  Trophy,
  Medal,
  Circle,
} from "lucide-vue-next";
import Button from "@/components/ui/button/Button.vue";
import Badge from "@/components/ui/badge/Badge.vue";
import Input from "@/components/ui/input/Input.vue";
import RankingInput from "@/components/ui/RankingInput.vue"; // [MỚI] Import
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
  formData: any;
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

// [MỚI] Helper để lấy style hiển thị khi KHÔNG Edit
const getRankingBadge = (rank: number) => {
  if (rank === 1)
    return {
      label: "Nguyện vọng 1",
      icon: Trophy,
      class: "bg-yellow-100 text-yellow-800 border-yellow-200",
      iconColor: "text-yellow-600",
    };
  if (rank === 2)
    return {
      label: "Nguyện vọng 2",
      icon: Medal,
      class: "bg-slate-100 text-slate-700 border-slate-200",
      iconColor: "text-slate-500",
    };
  if (rank === 3)
    return {
      label: "Nguyện vọng 3",
      icon: Medal,
      class: "bg-orange-100 text-orange-800 border-orange-200",
      iconColor: "text-orange-600",
    };
  return {
    label: `Nguyện vọng ${rank}`,
    icon: Circle,
    class: "bg-blue-50 text-blue-700 border-blue-100",
    iconColor: "text-blue-500",
  };
};
</script>

<template>
  <div
    class="p-4 border-b bg-slate-50 flex flex-col gap-3 shrink-0 z-10 shadow-sm transition-all duration-300"
  >
    <div class="flex justify-between items-start gap-2">
      <div class="flex-1 min-w-0 space-y-2">
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
              class="flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-bold border shadow-sm"
              :class="getRankingBadge(school.ranking).class"
            >
              <component
                :is="getRankingBadge(school.ranking).icon"
                class="w-3 h-3"
                :class="getRankingBadge(school.ranking).iconColor"
              />
              {{ getRankingBadge(school.ranking).label }}
            </div>
          </div>
        </div>

        <div
          v-else
          class="space-y-3 animate-in fade-in slide-in-from-top-1 duration-200"
        >
          <Input
            v-model="formData.name"
            class="font-bold h-9 bg-white"
            placeholder="Tên địa điểm"
          />

          <div class="flex flex-col gap-2">
            <div class="flex gap-2">
              <Select v-model="formData.category">
                <SelectTrigger class="h-9 text-xs flex-1 bg-white"
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
            </div>

            <div>
              <div
                class="text-[10px] uppercase font-bold text-slate-400 mb-1 ml-1"
              >
                Xếp hạng ưu tiên
              </div>
              <RankingInput v-model="formData.ranking" />
            </div>
          </div>
        </div>
      </div>

      <div class="flex gap-1 shrink-0 ml-2">
        <Button
          variant="outline"
          size="icon"
          @click="$emit('openMap')"
          title="Mở Google Maps"
          class="bg-white"
        >
          <Map class="w-4 h-4 text-blue-600" />
        </Button>

        <Button
          variant="outline"
          size="icon"
          class="bg-white text-red-600 hover:bg-red-50 hover:text-red-700 border-red-200"
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
            class="bg-green-600 hover:bg-green-700 text-white shadow-sm"
          >
            <Loader2 v-if="isSaving" class="w-4 h-4 animate-spin" />
            <Save v-else class="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            @click="$emit('cancel')"
            :disabled="isSaving"
            class="bg-white border"
            ><X class="w-4 h-4"
          /></Button>
        </div>

        <Button
          variant="ghost"
          size="icon"
          @click="$emit('close')"
          class="-mr-2 text-slate-400 hover:bg-slate-100"
          ><X class="w-5 h-5"
        /></Button>
      </div>
    </div>
  </div>
</template>
