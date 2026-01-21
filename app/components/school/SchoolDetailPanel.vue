<script setup lang="ts">
import { ref, reactive, watch, computed } from "vue";
import {
  X,
  MapPin,
  Navigation,
  Info,
  Car,
  Bike,
  Loader2,
  Route,
  Trash2,
  Edit,
  Save,
  Globe,
  Clock,
  Baby,
  Users,
  Star,
  Tag,
} from "lucide-vue-next";
import Button from "@/components/ui/button/Button.vue";
import Badge from "@/components/ui/badge/Badge.vue";
import Input from "@/components/ui/input/Input.vue";
import Textarea from "@/components/ui/textarea/Textarea.vue";
import ScrollArea from "@/components/ui/scroll-area/ScrollArea.vue";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import type { School } from "~/types/school";
import { useSchools } from "~/composables/useSchools";
import { useRouteStore } from "~/stores/route-store";

const props = defineProps<{
  school: School;
  hasCalculated: boolean;
}>();

const emit = defineEmits<{
  (e: "close"): void;
  (e: "calculate"): void;
  (e: "switchMode", mode: "DRIVING" | "BICYCLING"): void;
  (e: "openGoogleMaps"): void;
}>();

const routeStore = useRouteStore();
const { updateSchool, deleteSchool } = useSchools();

// --- STATE ---
const isEditing = ref(false);
const isSaving = ref(false);
const isDeleting = ref(false);

const formData = reactive<any>({});
const imageFile = ref<File | null>(null);
const previewUrl = ref<string | null>(null);
// Tag input riêng vì cần xử lý join/split array
const tagsInput = ref("");

const categories = [
  { value: "Public", label: "Trường Công" },
  { value: "Private", label: "Trường Tư" },
  { value: "SmallScale", label: "Quy mô nhỏ" },
  { value: "Home", label: "Nhà riêng" },
  { value: "Work", label: "Công ty" },
  { value: "Company", label: "Doanh nghiệp" },
];

const rankings = [
  { value: 1, label: "Nguyện vọng 1" },
  { value: 2, label: "Nguyện vọng 2" },
  { value: 3, label: "Nguyện vọng 3" },
  { value: 4, label: "Nguyện vọng 4" },
  { value: 5, label: "Nguyện vọng 5" },
];

// --- WATCHERS ---
watch(
  () => props.school,
  (newVal) => {
    isEditing.value = false;
    imageFile.value = null;
    previewUrl.value = newVal.image_url || null;
    Object.assign(formData, JSON.parse(JSON.stringify(newVal)));
    // Chuyển tags array thành string cho input
    tagsInput.value = (newVal.tags || []).join(", ");
  },
  { immediate: true },
);

// --- HANDLERS ---
const handleFileChange = (e: Event) => {
  const input = e.target as HTMLInputElement;
  if (input.files && input.files[0]) {
    imageFile.value = input.files[0];
    previewUrl.value = URL.createObjectURL(input.files[0]);
  }
};

const handleSave = async () => {
  isSaving.value = true;
  try {
    // Chuyển tags string về array
    const tagsArray = tagsInput.value
      .split(",")
      .map((t) => t.trim())
      .filter((t) => t !== "");
    formData.tags = tagsArray;

    await updateSchool(
      props.school.id,
      formData,
      imageFile.value,
      props.school.image_url,
    );
    isEditing.value = false;
    // Không cần alert vì dữ liệu sẽ tự cập nhật nhờ computed ở index.vue
  } catch (e: any) {
    alert("Lỗi cập nhật: " + e.message);
  } finally {
    isSaving.value = false;
  }
};

const handleDelete = async () => {
  if (!confirm("Bạn có chắc chắn muốn xóa địa điểm này không?")) return;
  isDeleting.value = true;
  try {
    await deleteSchool(props.school.id, props.school.image_url);
    emit("close");
  } catch (e: any) {
    alert("Lỗi xóa: " + e.message);
  } finally {
    isDeleting.value = false;
  }
};

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
    class="w-100 border-l bg-white h-full shadow-2xl z-30 flex flex-col overflow-hidden"
  >
    <div
      class="p-4 border-b flex justify-between items-start bg-slate-50 shrink-0 z-10"
    >
      <div v-if="!isEditing" class="flex-1 pr-2">
        <h2 class="font-bold text-xl text-slate-800 wrap-break-word">
          {{ school.name }}
        </h2>
        <div class="flex flex-wrap gap-2 mt-2">
          <Badge :variant="getBadgeVariant(school.category)">{{
            school.category
          }}</Badge>
          <div
            v-if="school.ranking"
            class="flex items-center gap-1 bg-yellow-100 text-yellow-700 text-[10px] px-2 py-0.5 rounded-full font-bold border border-yellow-200"
          >
            <Star class="w-3 h-3 fill-yellow-500 text-yellow-500" />
            NV{{ school.ranking }}
          </div>
        </div>
      </div>
      <div v-else class="flex-1 mr-4 space-y-2">
        <Input
          v-model="formData.name"
          placeholder="Tên địa điểm"
          class="font-bold"
        />
        <div class="flex gap-2">
          <Select v-model="formData.category">
            <SelectTrigger class="h-8 text-xs"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem
                v-for="c in categories"
                :key="c.value"
                :value="c.value"
                >{{ c.label }}</SelectItem
              >
            </SelectContent>
          </Select>
          <Select v-model="formData.ranking">
            <SelectTrigger class="h-8 text-xs w-24">
              <SelectValue placeholder="NV..." />
            </SelectTrigger>
            <SelectContent>
              <SelectItem :value="null">Không xếp hạng</SelectItem>
              <SelectItem
                v-for="r in rankings"
                :key="r.value"
                :value="r.value"
                >{{ r.label }}</SelectItem
              >
            </SelectContent>
          </Select>
        </div>
      </div>

      <div class="flex gap-1 shrink-0">
        <Button
          v-if="!isEditing"
          variant="ghost"
          size="icon"
          @click="isEditing = true"
          title="Chỉnh sửa"
        >
          <Edit class="w-4 h-4 text-slate-600" />
        </Button>
        <div v-else class="flex gap-1">
          <Button
            variant="default"
            size="sm"
            @click="handleSave"
            :disabled="isSaving"
          >
            <Loader2 v-if="isSaving" class="w-4 h-4 animate-spin" />
            <Save v-else class="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            @click="isEditing = false"
            :disabled="isSaving"
            ><X class="w-4 h-4"
          /></Button>
        </div>
        <Button
          variant="ghost"
          size="icon"
          @click="$emit('close')"
          class="-mr-2"
          ><X class="w-5 h-5 text-slate-500"
        /></Button>
      </div>
    </div>

    <ScrollArea class="flex-1 p-6 h-full">
      <div
        class="aspect-video bg-slate-100 rounded-lg mb-6 flex items-center justify-center border overflow-hidden relative group shrink-0"
      >
        <img
          v-if="previewUrl"
          :src="previewUrl"
          class="w-full h-full object-cover"
        />
        <MapPin v-else class="w-10 h-10 text-slate-300" />

        <label
          v-if="isEditing"
          class="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 cursor-pointer transition-opacity"
        >
          <span class="text-white text-sm font-bold">Thay đổi ảnh</span>
          <input
            type="file"
            accept="image/*"
            class="hidden"
            @change="handleFileChange"
          />
        </label>
      </div>

      <div class="space-y-6">
        <div class="space-y-4">
          <div class="space-y-2">
            <div
              class="flex items-center gap-2 font-medium text-slate-700 text-sm"
            >
              <Tag class="w-4 h-4" /> Tiện ích / Cơ sở vật chất
            </div>
            <div v-if="!isEditing" class="flex flex-wrap gap-1.5">
              <Badge
                v-for="tag in school.tags"
                :key="tag"
                variant="secondary"
                class="font-normal text-xs bg-slate-100 hover:bg-slate-200"
              >
                {{ tag }}
              </Badge>
              <span
                v-if="!school.tags?.length"
                class="text-xs text-slate-400 italic"
                >Chưa có thông tin</span
              >
            </div>
            <Input
              v-else
              v-model="tagsInput"
              placeholder="VD: Sân chơi, Camera, Tiếng Anh (ngăn cách dấu phẩy)"
              class="text-sm"
            />
          </div>

          <div class="flex items-start gap-3">
            <MapPin class="w-5 h-5 text-slate-400 shrink-0 mt-0.5" />
            <div class="flex-1">
              <div class="font-medium text-slate-700">Địa chỉ</div>
              <div v-if="!isEditing" class="text-sm text-slate-500">
                {{ school.address }}
              </div>
              <Input
                v-else
                v-model="formData.address"
                class="mt-1 h-8 text-sm"
              />
            </div>
          </div>

          <div class="flex items-start gap-3">
            <Globe class="w-5 h-5 text-slate-400 shrink-0 mt-0.5" />
            <div class="flex-1">
              <div class="font-medium text-slate-700">Website</div>
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
                placeholder="https://..."
                class="mt-1 h-8 text-sm"
              />
            </div>
          </div>

          <div class="flex items-start gap-3">
            <Info class="w-5 h-5 text-slate-400 shrink-0 mt-0.5" />
            <div class="flex-1">
              <div class="font-medium text-slate-700">Ghi chú</div>
              <p
                v-if="!isEditing"
                class="text-sm text-slate-600 whitespace-pre-line"
              >
                {{ school.notes || "---" }}
              </p>
              <Textarea
                v-else
                v-model="formData.notes"
                class="mt-1 text-sm"
                rows="3"
              />
            </div>
          </div>
        </div>

        <div class="border-t border-dashed my-4"></div>

        <div class="space-y-4">
          <h3 class="font-bold text-slate-800 flex items-center gap-2">
            <Clock class="w-4 h-4" /> Vận hành
          </h3>
          <div class="grid grid-cols-2 gap-4 text-sm">
            <div>
              <div class="text-slate-500 text-xs">Giờ mở cửa</div>
              <div v-if="!isEditing">{{ school.opening_hours || "---" }}</div>
              <Input
                v-else
                v-model="formData.opening_hours"
                placeholder="VD: 7:00 - 18:00"
                class="h-7 mt-1"
              />
            </div>
            <div>
              <div class="text-slate-500 text-xs">Giờ làm thêm</div>
              <div v-if="!isEditing">{{ school.extended_hours || "---" }}</div>
              <Input
                v-else
                v-model="formData.extended_hours"
                placeholder="VD: tới 20:00"
                class="h-7 mt-1"
              />
            </div>
            <div class="col-span-2">
              <div class="text-slate-500 text-xs">Độ tuổi nhận (tháng)</div>
              <div v-if="!isEditing" class="flex items-center gap-1">
                <Baby class="w-3 h-3" /> Từ
                {{ school.min_age_months || 0 }} tháng
              </div>
              <Input
                v-else
                type="number"
                v-model="formData.min_age_months"
                class="h-7 mt-1 w-32"
              />
            </div>
          </div>
        </div>

        <div class="border-t border-dashed my-4"></div>

        <div class="space-y-4">
          <h3 class="font-bold text-slate-800 flex items-center gap-2">
            <Users class="w-4 h-4" /> Số liệu
          </h3>

          <div class="bg-slate-50 p-3 rounded-lg border">
            <div class="text-xs font-bold text-slate-500 mb-2 uppercase">
              Chỉ tiêu (Capacity)
            </div>
            <div class="grid grid-cols-3 gap-2 text-sm text-center">
              <div>
                <span class="text-[10px] text-slate-400 block">Tổng</span>
                <span v-if="!isEditing" class="font-bold text-lg">{{
                  school.capacity_info?.total || 0
                }}</span>
                <Input
                  v-else
                  type="number"
                  v-model="formData.capacity_info.total"
                  class="h-7 text-center"
                />
              </div>
              <div>
                <span class="text-[10px] text-slate-400 block">0 tuổi</span>
                <span v-if="!isEditing">{{
                  school.capacity_info?.age_0 || 0
                }}</span>
                <Input
                  v-else
                  type="number"
                  v-model="formData.capacity_info.age_0"
                  class="h-7 text-center"
                />
              </div>
              <div>
                <span class="text-[10px] text-slate-400 block">1 tuổi</span>
                <span v-if="!isEditing">{{
                  school.capacity_info?.age_1 || 0
                }}</span>
                <Input
                  v-else
                  type="number"
                  v-model="formData.capacity_info.age_1"
                  class="h-7 text-center"
                />
              </div>
            </div>
          </div>

          <div class="bg-red-50 p-3 rounded-lg border border-red-100">
            <div class="text-xs font-bold text-red-500 mb-2 uppercase">
              Chỗ trống (Vacancy)
            </div>
            <div class="grid grid-cols-3 gap-2 text-sm text-center">
              <div>
                <span class="text-[10px] text-red-400 block">Tổng</span>
                <span
                  v-if="!isEditing"
                  class="font-bold text-lg text-red-700"
                  >{{ school.vacancy_info?.total || 0 }}</span
                >
                <Input
                  v-else
                  type="number"
                  v-model="formData.vacancy_info.total"
                  class="h-7 text-center border-red-200"
                />
              </div>
              <div>
                <span class="text-[10px] text-red-400 block">0 tuổi</span>
                <span v-if="!isEditing" class="text-red-700">{{
                  school.vacancy_info?.age_0 || 0
                }}</span>
                <Input
                  v-else
                  type="number"
                  v-model="formData.vacancy_info.age_0"
                  class="h-7 text-center border-red-200"
                />
              </div>
              <div>
                <span class="text-[10px] text-red-400 block">1 tuổi</span>
                <span v-if="!isEditing" class="text-red-700">{{
                  school.vacancy_info?.age_1 || 0
                }}</span>
                <Input
                  v-else
                  type="number"
                  v-model="formData.vacancy_info.age_1"
                  class="h-7 text-center border-red-200"
                />
              </div>
            </div>
          </div>
        </div>

        <div class="border-t pt-4">
          <div class="font-medium text-slate-800 mb-3 flex items-center gap-2">
            <Navigation class="w-4 h-4" /> Ước tính di chuyển (Từ Nhà)
          </div>

          <div
            v-if="routeStore.isRouting"
            class="flex items-center justify-center py-4 text-slate-400 gap-2 text-sm"
          >
            <Loader2 class="w-4 h-4 animate-spin" /> Đang tính toán...
          </div>
          <div v-else-if="!hasCalculated" class="text-center py-2">
            <Button
              variant="secondary"
              class="w-full gap-2 border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100"
              @click="$emit('calculate')"
            >
              <Route class="w-4 h-4" /> Xem đường đi từ Nhà
            </Button>
          </div>

          <div
            v-else
            class="grid grid-cols-2 gap-3 animate-in fade-in slide-in-from-bottom-2"
          >
            <div
              class="p-3 rounded-lg border cursor-pointer transition-all"
              :class="
                routeStore.selectedMode === 'BICYCLING'
                  ? 'bg-green-100 border-green-300 ring-1 ring-green-300 shadow-sm'
                  : 'bg-green-50 border-green-100 hover:bg-green-100 opacity-70 hover:opacity-100'
              "
              @click="$emit('switchMode', 'BICYCLING')"
            >
              <div class="flex items-center gap-2 text-green-700 mb-1">
                <Bike class="w-4 h-4" /><span
                  class="text-xs font-bold uppercase"
                  >Xe đạp</span
                >
              </div>
              <div v-if="routeStore.routeInfo.bicycling" class="text-slate-800">
                <div class="font-bold text-lg">
                  {{ routeStore.routeInfo.bicycling.duration }}
                </div>
                <div class="text-xs text-slate-500">
                  {{ routeStore.routeInfo.bicycling.distance }}
                </div>
              </div>
              <div v-else class="text-xs text-slate-400 italic">N/A</div>
            </div>
            <div
              class="p-3 rounded-lg border cursor-pointer transition-all"
              :class="
                routeStore.selectedMode === 'DRIVING'
                  ? 'bg-blue-100 border-blue-300 ring-1 ring-blue-300 shadow-sm'
                  : 'bg-blue-50 border-blue-100 hover:bg-blue-100 opacity-70 hover:opacity-100'
              "
              @click="$emit('switchMode', 'DRIVING')"
            >
              <div class="flex items-center gap-2 text-blue-700 mb-1">
                <Car class="w-4 h-4" /><span class="text-xs font-bold uppercase"
                  >Ô tô</span
                >
              </div>
              <div v-if="routeStore.routeInfo.driving" class="text-slate-800">
                <div class="font-bold text-lg">
                  {{ routeStore.routeInfo.driving.duration }}
                </div>
                <div class="text-xs text-slate-500">
                  {{ routeStore.routeInfo.driving.distance }}
                </div>
              </div>
              <div v-else class="text-xs text-slate-400 italic">N/A</div>
            </div>
          </div>
        </div>
      </div>
    </ScrollArea>

    <div class="p-4 border-t bg-slate-50 space-y-2 shrink-0">
      <Button class="w-full gap-2" @click="$emit('openGoogleMaps')">
        <Navigation class="w-4 h-4" />
        Mở Google Maps
      </Button>
      <Button
        variant="outline"
        class="w-full text-red-600 hover:text-red-700 hover:bg-red-50 gap-2"
        @click="handleDelete"
        :disabled="isDeleting"
      >
        <Loader2 v-if="isDeleting" class="w-4 h-4 animate-spin" />
        <Trash2 v-else class="w-4 h-4" />
        {{ isDeleting ? "Đang xóa..." : "Xóa địa điểm" }}
      </Button>
    </div>
  </div>
</template>
