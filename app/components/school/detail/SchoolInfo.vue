<script setup lang="ts">
import { ref, watch } from "vue";
import {
  MapPin,
  Clock,
  Users,
  Building,
  Heart,
  Calendar,
  Train,
  Bus,
  UserCheck,
  Stethoscope,
  ImagePlus,
} from "lucide-vue-next";
import Input from "@/components/ui/input/Input.vue";
import Textarea from "@/components/ui/textarea/Textarea.vue";
import Badge from "@/components/ui/badge/Badge.vue";
import Checkbox from "@/components/ui/checkbox/Checkbox.vue";
import type { School, AgeCapacity } from "~/types/school";

const props = defineProps<{
  school: School;
  isEditing: boolean;
  formData: any;
}>();

const emit = defineEmits<{
  (e: "file-change", file: File): void;
}>();

const previewUrl = ref<string | null>(null);
const eventsInput = ref("");
const communityInput = ref("");

// Helper để fix lỗi TypeScript indexing
const getAgeKey = (age: number): keyof AgeCapacity =>
  `age_${age}` as keyof AgeCapacity;

watch(
  () => props.school,
  (val) => {
    if (val) {
      previewUrl.value = val.image_url || null;
      eventsInput.value = (val.annual_events || []).join(", ");
      communityInput.value = (val.community_programs || []).join(", ");
    }
  },
  { immediate: true },
);

// Sync inputs back to formData
watch(eventsInput, (val) => {
  if (props.isEditing)
    props.formData.annual_events = val
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);
});
watch(communityInput, (val) => {
  if (props.isEditing)
    props.formData.community_programs = val
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);
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
  <div class="space-y-8">
    <div
      class="aspect-video bg-slate-100 rounded-lg flex items-center justify-center border overflow-hidden relative group"
    >
      <img
        v-if="previewUrl"
        :src="previewUrl"
        class="w-full h-full object-cover"
      />
      <div v-else class="text-slate-400 text-xs">Chưa có ảnh</div>
      <label
        v-if="isEditing"
        class="absolute inset-0 bg-black/40 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 cursor-pointer text-white font-bold"
      >
        <ImagePlus class="w-6 h-6 mb-1" /> Thay đổi
        <input
          type="file"
          accept="image/*"
          class="hidden"
          @change="handleFile"
        />
      </label>
    </div>

    <section class="space-y-3">
      <h3
        class="font-bold text-slate-800 flex items-center gap-2 border-b pb-1"
      >
        <Building class="w-4 h-4 text-blue-600" /> Thông tin cơ bản
      </h3>
      <div class="grid grid-cols-2 gap-4 text-sm">
        <div>
          <span class="text-slate-500 text-xs block">Loại hình</span>
          <span v-if="!isEditing" class="font-medium">{{
            school.school_type || school.category
          }}</span>
          <Input
            v-else
            v-model="formData.school_type"
            class="h-7"
            placeholder="VD: 認可保育園"
          />
        </div>
        <div>
          <span class="text-slate-500 text-xs block">Vận hành bởi</span>
          <span v-if="!isEditing" class="font-medium">{{
            school.operator || "---"
          }}</span>
          <Input
            v-else
            v-model="formData.operator"
            class="h-7"
            placeholder="VD: Toda City"
          />
        </div>
        <div>
          <span class="text-slate-500 text-xs block">Thành lập</span>
          <span v-if="!isEditing">{{ school.established_year }}</span>
          <Input
            v-else
            type="number"
            v-model="formData.established_year"
            class="h-7"
          />
        </div>
        <div>
          <span class="text-slate-500 text-xs block">Tổng định viên</span>
          <span v-if="!isEditing" class="font-bold text-blue-600"
            >{{ school.capacity_total }} bé</span
          >
          <Input
            v-else
            type="number"
            v-model="formData.capacity_total"
            class="h-7"
          />
        </div>
      </div>
    </section>

    <section class="space-y-3">
      <h3
        class="font-bold text-slate-800 flex items-center gap-2 border-b pb-1"
      >
        <MapPin class="w-4 h-4 text-red-500" /> Vị trí & Giao thông
      </h3>
      <div class="space-y-3 text-sm">
        <div>
          <span class="text-slate-500 text-xs">Địa chỉ</span>
          <div v-if="!isEditing">{{ school.address }}</div>
          <Input v-else v-model="formData.address" class="h-7" />
        </div>
        <div class="grid grid-cols-2 gap-4">
          <div>
            <span class="text-slate-500 text-xs flex items-center gap-1"
              ><Train class="w-3 h-3" /> Ga gần nhất</span
            >
            <div v-if="!isEditing">{{ school.nearest_station || "---" }}</div>
            <Input v-else v-model="formData.nearest_station" class="h-7" />
          </div>
          <div>
            <span class="text-slate-500 text-xs">Đi bộ (phút)</span>
            <div v-if="!isEditing">
              {{
                school.walk_minutes_station
                  ? school.walk_minutes_station + "p"
                  : "---"
              }}
            </div>
            <Input
              v-else
              type="number"
              v-model="formData.walk_minutes_station"
              class="h-7"
            />
          </div>
        </div>
        <div>
          <span class="text-slate-500 text-xs flex items-center gap-1"
            ><Bus class="w-3 h-3" /> Xe bus</span
          >
          <div v-if="!isEditing">{{ school.bus_access || "---" }}</div>
          <Input v-else v-model="formData.bus_access" class="h-7" />
        </div>
      </div>
    </section>

    <section class="space-y-3">
      <h3
        class="font-bold text-slate-800 flex items-center gap-2 border-b pb-1"
      >
        <Clock class="w-4 h-4 text-green-600" /> Thời gian gửi trẻ
      </h3>
      <div class="grid grid-cols-2 gap-4 text-sm">
        <div>
          <span class="text-slate-500 text-xs">Thứ 2 - Thứ 6</span>
          <div v-if="!isEditing" class="font-medium">
            {{ school.open_time_weekday || "---" }}
          </div>
          <Input v-else v-model="formData.open_time_weekday" class="h-7" />
        </div>
        <div>
          <span class="text-slate-500 text-xs">Thứ 7</span>
          <div v-if="!isEditing">{{ school.open_time_saturday || "Nghỉ" }}</div>
          <Input v-else v-model="formData.open_time_saturday" class="h-7" />
        </div>
        <div
          class="col-span-2 bg-orange-50 p-2 rounded border border-orange-100"
        >
          <div class="flex justify-between items-center mb-1">
            <span class="text-xs font-bold text-orange-700"
              >Giữ trẻ muộn (Extended Care)</span
            >
            <span
              v-if="!isEditing && school.has_extended_care"
              class="text-[10px] bg-orange-200 px-1 rounded text-orange-800"
              >CÓ</span
            >
            <div v-else-if="isEditing" class="flex items-center space-x-2">
              <Checkbox
                id="extended-care"
                :checked="formData.has_extended_care"
                @update:checked="(v) => (formData.has_extended_care = v)"
              />
              <label for="extended-care" class="text-xs cursor-pointer"
                >Kích hoạt</label
              >
            </div>
          </div>
          <div class="text-xs">
            <span class="text-slate-500">Đón muộn nhất: </span>
            <span v-if="!isEditing" class="font-bold">{{
              school.latest_pickup_time || "---"
            }}</span>
            <Input
              v-else
              v-model="formData.latest_pickup_time"
              class="h-6 w-20 inline-block ml-1"
              placeholder="19:00"
            />
          </div>
        </div>
      </div>
    </section>

    <section class="space-y-3">
      <h3
        class="font-bold text-slate-800 flex items-center gap-2 border-b pb-1"
      >
        <Users class="w-4 h-4 text-purple-600" /> Định viên theo tuổi
      </h3>
      <div class="grid grid-cols-3 gap-2 text-sm text-center">
        <div
          v-for="age in [0, 1, 2, 3, 4, 5]"
          :key="age"
          class="bg-slate-50 p-2 rounded border"
        >
          <span class="text-[10px] text-slate-400 block">{{ age }} tuổi</span>
          <span v-if="!isEditing" class="font-bold text-slate-700">
            {{ school.age_capacity?.[getAgeKey(age)] || 0 }}
          </span>
          <Input
            v-else
            type="number"
            v-model="formData.age_capacity[getAgeKey(age)]"
            class="h-6 text-center text-xs"
          />
        </div>
      </div>
    </section>

    <section class="space-y-3">
      <h3
        class="font-bold text-slate-800 flex items-center gap-2 border-b pb-1"
      >
        <Heart class="w-4 h-4 text-pink-500" /> Môi trường & Hỗ trợ
      </h3>
      <div class="space-y-2 text-sm">
        <div class="grid grid-cols-2 gap-4">
          <div>
            <span class="text-slate-500 text-xs">Diện tích sàn</span>
            <span v-if="!isEditing"
              >{{ school.facility_info?.total_area_m2 }} m²</span
            >
            <Input
              v-else
              type="number"
              v-model="formData.facility_info.total_area_m2"
              class="h-7"
            />
          </div>
          <div class="flex flex-col gap-2 pt-1 text-xs">
            <div class="flex items-center space-x-2">
              <div
                v-if="!isEditing"
                class="flex items-center gap-2"
                :class="{ 'opacity-50': !school.facility_info?.has_hall }"
              >
                <div
                  class="w-2 h-2 rounded-full"
                  :class="
                    school.facility_info?.has_hall
                      ? 'bg-green-500'
                      : 'bg-slate-300'
                  "
                ></div>
                Hội trường
              </div>
              <div v-else class="flex items-center space-x-2">
                <Checkbox
                  :checked="formData.facility_info.has_hall"
                  @update:checked="(v) => (formData.facility_info.has_hall = v)"
                />
                <span>Hội trường</span>
              </div>
            </div>

            <div class="flex items-center space-x-2">
              <div
                v-if="!isEditing"
                class="flex items-center gap-2"
                :class="{ 'opacity-50': !school.facility_info?.has_kitchen }"
              >
                <div
                  class="w-2 h-2 rounded-full"
                  :class="
                    school.facility_info?.has_kitchen
                      ? 'bg-green-500'
                      : 'bg-slate-300'
                  "
                ></div>
                Nhà bếp
              </div>
              <div v-else class="flex items-center space-x-2">
                <Checkbox
                  :checked="formData.facility_info.has_kitchen"
                  @update:checked="
                    (v) => (formData.facility_info.has_kitchen = v)
                  "
                />
                <span>Nhà bếp</span>
              </div>
            </div>
          </div>
        </div>
        <div>
          <span class="text-slate-500 text-xs block"
            >Môi trường ngoài trời</span
          >
          <p v-if="!isEditing" class="text-slate-700">
            {{ school.facility_info?.playground_desc || "---" }}
          </p>
          <Textarea
            v-else
            v-model="formData.facility_info.playground_desc"
            class="text-xs"
            rows="2"
          />
        </div>
        <div class="bg-blue-50 p-2 rounded border border-blue-100">
          <span class="text-blue-700 text-xs font-bold block mb-1"
            >Hỗ trợ đặc biệt</span
          >
          <p v-if="!isEditing" class="text-xs text-slate-700">
            {{ school.special_support || "Không có thông tin" }}
          </p>
          <Textarea
            v-else
            v-model="formData.special_support"
            class="text-xs"
            rows="2"
          />
        </div>
      </div>
    </section>

    <section class="space-y-3">
      <h3
        class="font-bold text-slate-800 flex items-center gap-2 border-b pb-1"
      >
        <Calendar class="w-4 h-4 text-orange-500" /> Hoạt động & Triết lý
      </h3>
      <div class="space-y-3 text-sm">
        <div>
          <span class="text-slate-500 text-xs block">Triết lý giáo dục</span>
          <p
            v-if="!isEditing"
            class="italic text-slate-600 bg-slate-50 p-2 rounded border"
          >
            "{{ school.philosophy || "---" }}"
          </p>
          <Textarea
            v-else
            v-model="formData.philosophy"
            class="text-xs"
            rows="2"
          />
        </div>

        <div>
          <span class="text-slate-500 text-xs block mb-1"
            >Sự kiện hàng năm</span
          >
          <div v-if="!isEditing" class="flex flex-wrap gap-1">
            <Badge
              v-for="ev in school.annual_events"
              :key="ev"
              variant="outline"
              class="text-[10px]"
              >{{ ev }}</Badge
            >
          </div>
          <Textarea
            v-else
            v-model="eventsInput"
            placeholder="Sự kiện 1, Sự kiện 2..."
            class="text-xs"
          />
        </div>

        <div class="grid grid-cols-2 gap-4 pt-2 border-t mt-2">
          <div>
            <div
              class="flex items-center gap-1 text-xs font-bold text-slate-700 mb-1"
            >
              <UserCheck class="w-3 h-3" /> Nhân sự
            </div>
            <div v-if="!isEditing" class="text-xs">
              <div>
                Giáo viên: {{ school.staff_info?.childcare_staff || 0 }}
              </div>
              <div class="text-slate-500">
                + {{ (school.staff_info?.others || []).join(", ") }}
              </div>
            </div>
            <div v-else class="text-xs space-y-1">
              <Input
                type="number"
                v-model="formData.staff_info.childcare_staff"
                placeholder="Số GV"
                class="h-6"
              />
            </div>
          </div>
          <div>
            <div
              class="flex items-center gap-1 text-xs font-bold text-slate-700 mb-1"
            >
              <Stethoscope class="w-3 h-3" /> Y tế
            </div>
            <div v-if="!isEditing" class="text-xs text-slate-600">
              {{ school.medical_info?.internal_checkup || "---" }}
            </div>
            <Input
              v-else
              v-model="formData.medical_info.internal_checkup"
              placeholder="Khám nội khoa"
              class="h-6 text-xs"
            />
          </div>
        </div>
      </div>
    </section>
  </div>
</template>
