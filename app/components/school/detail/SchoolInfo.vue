<script setup lang="ts">
import { ref, watch } from "vue";
import {
  MapPin,
  Clock,
  Users,
  Building,
  HeartHandshake,
  Calendar,
  Train,
  Bus,
  UserCheck,
  Stethoscope,
  ImagePlus,
  Wallet,
  ShieldAlert,
  Briefcase,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Baby,
  Utensils,
  Megaphone,
} from "lucide-vue-next";
import Input from "@/components/ui/input/Input.vue";
import Textarea from "@/components/ui/textarea/Textarea.vue";
import Badge from "@/components/ui/badge/Badge.vue";
import type { School, CapacityInfo } from "~/types/school";

const props = defineProps<{
  school: School;
  isEditing: boolean;
  formData: any;
}>();

const emit = defineEmits<{
  (e: "file-change", file: File): void;
}>();

const previewUrl = ref<string | null>(null);
// Helper chuyển đổi Array <-> String cho input
const eventsInput = ref("");
const communityInput = ref("");

// Helper để truy cập key an toàn cho TypeScript
const getAgeKey = (age: number): keyof CapacityInfo => {
  return `age_${age}` as keyof CapacityInfo;
};

watch(
  () => props.school,
  (val) => {
    if (val) {
      previewUrl.value = val.image_url || null;
      eventsInput.value = (val.annual_events || []).join(", ");
      communityInput.value = (val.community_programs || []).join(", ");
    }
  },
  { immediate: true, deep: true },
);

// Sync inputs back to formData khi edit
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
  <div class="space-y-8 pb-10 font-sans">
    <div class="space-y-4">
      <div
        class="aspect-video bg-slate-100 rounded-xl flex items-center justify-center border overflow-hidden relative group shadow-sm"
      >
        <img
          v-if="previewUrl"
          :src="previewUrl"
          class="w-full h-full object-cover transition-transform duration-700 hover:scale-105"
        />
        <div v-else class="text-slate-400 text-xs flex flex-col items-center">
          <ImagePlus class="w-8 h-8 mb-2 opacity-50" />
          <span>Chưa có ảnh minh họa</span>
        </div>

        <label
          v-if="isEditing"
          class="absolute inset-0 bg-black/50 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 cursor-pointer text-white font-bold transition-opacity"
        >
          <ImagePlus class="w-8 h-8 mb-1" />
          <span>Thay đổi ảnh</span>
          <input
            type="file"
            accept="image/*"
            class="hidden"
            @change="handleFile"
          />
        </label>
      </div>

      <div
        v-if="school.capacity_info?.notes"
        class="bg-amber-50 border-l-4 border-amber-500 p-3 rounded-r-md flex gap-3 items-start animate-in fade-in slide-in-from-top-2"
      >
        <AlertTriangle class="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
        <div class="flex-1">
          <span class="font-bold text-amber-800 text-xs block mb-1"
            >LƯU Ý QUAN TRỌNG</span
          >
          <p v-if="!isEditing" class="text-xs text-amber-900 leading-relaxed">
            {{ school.capacity_info.notes }}
          </p>
          <Textarea
            v-else
            v-model="formData.capacity_info.notes"
            class="text-xs bg-white border-amber-200"
          />
        </div>
      </div>
    </div>

    <section>
      <h3
        class="font-bold text-slate-800 flex items-center gap-2 mb-3 text-sm uppercase tracking-wider border-b pb-2"
      >
        <Building class="w-4 h-4 text-blue-600" /> Tổng quan & Vị trí
      </h3>
      <div
        class="bg-white rounded-lg border border-slate-200 p-4 space-y-4 shadow-sm"
      >
        <div class="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span
              class="text-[10px] text-slate-400 uppercase font-bold block mb-1"
              >Loại hình / Vận hành</span
            >
            <span v-if="!isEditing" class="font-medium text-slate-700">{{
              school.operator || "---"
            }}</span>
            <Input
              v-else
              v-model="formData.operator"
              class="h-7 text-xs"
              placeholder="VD: Toda City"
            />
          </div>
          <div>
            <span
              class="text-[10px] text-slate-400 uppercase font-bold block mb-1"
              >Thành lập</span
            >
            <span v-if="!isEditing" class="font-medium text-slate-700">{{
              school.established_date || "---"
            }}</span>
            <Input
              v-else
              v-model="formData.established_date"
              class="h-7 text-xs"
            />
          </div>
          <div class="col-span-2">
            <span
              class="text-[10px] text-slate-400 uppercase font-bold block mb-1"
              >Hiệu trưởng</span
            >
            <span v-if="!isEditing" class="font-medium text-slate-700">{{
              school.director_name || "---"
            }}</span>
            <Input
              v-else
              v-model="formData.director_name"
              class="h-7 text-xs"
            />
          </div>
        </div>

        <div class="h-px bg-slate-100"></div>

        <div class="space-y-3 text-sm">
          <div>
            <span
              class="text-[10px] text-slate-400 uppercase font-bold block mb-1"
              >Địa chỉ</span
            >
            <div
              v-if="!isEditing"
              class="flex items-start gap-2 text-slate-700"
            >
              <MapPin class="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
              {{ school.address }}
            </div>
            <Input v-else v-model="formData.address" class="h-8 text-xs" />
          </div>

          <div
            class="grid grid-cols-1 gap-2 bg-slate-50 p-3 rounded-md border border-slate-100"
          >
            <div class="flex items-center gap-2">
              <Train class="w-4 h-4 text-slate-400" />
              <div class="flex-1">
                <span class="text-[10px] text-slate-400 block"
                  >Ga gần nhất</span
                >
                <div v-if="!isEditing" class="font-medium text-xs">
                  {{ school.nearest_station || "---" }}
                </div>
                <Input
                  v-else
                  v-model="formData.nearest_station"
                  class="h-6 text-xs mt-1"
                />
              </div>
              <div class="text-right">
                <span class="text-[10px] text-slate-400 block">Đi bộ</span>
                <span
                  v-if="!isEditing"
                  class="font-bold text-slate-700 text-xs"
                  >{{
                    school.walk_minutes_station
                      ? school.walk_minutes_station + " phút"
                      : "--"
                  }}</span
                >
                <Input
                  v-else
                  type="number"
                  v-model="formData.walk_minutes_station"
                  class="h-6 w-16 text-xs mt-1"
                  placeholder="Phút"
                />
              </div>
            </div>
            <div
              class="flex items-center gap-2 pt-2 border-t border-slate-200 border-dashed"
            >
              <Bus class="w-4 h-4 text-slate-400" />
              <div class="flex-1">
                <span class="text-[10px] text-slate-400 block">Xe Bus</span>
                <div v-if="!isEditing" class="text-xs text-slate-600">
                  {{ school.bus_access || "---" }}
                </div>
                <Input
                  v-else
                  v-model="formData.bus_access"
                  class="h-6 text-xs mt-1"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <section>
      <div class="flex items-center justify-between mb-3 border-b pb-2">
        <h3
          class="font-bold text-slate-800 flex items-center gap-2 text-sm uppercase tracking-wider"
        >
          <Users class="w-4 h-4 text-indigo-600" /> Định viên theo tuổi
        </h3>
        <Badge variant="secondary" class="font-mono text-xs"
          >Tổng: {{ school.capacity_info?.total || 0 }}</Badge
        >
      </div>

      <div
        class="bg-white rounded-lg border border-slate-200 overflow-hidden shadow-sm"
      >
        <div class="grid grid-cols-6 divide-x divide-slate-100">
          <div
            v-for="age in [0, 1, 2, 3, 4, 5]"
            :key="age"
            class="p-2 text-center group hover:bg-slate-50 transition-colors"
          >
            <span
              class="block text-[10px] text-slate-400 font-bold mb-1 uppercase"
              >{{ age }} tuổi</span
            >
            <div
              v-if="!isEditing"
              class="font-bold text-slate-700 text-sm group-hover:text-indigo-600"
            >
              {{ school.capacity_info?.[getAgeKey(age)] || "-" }}
            </div>
            <Input
              v-else
              type="number"
              v-model="formData.capacity_info[getAgeKey(age)]"
              class="h-6 text-center text-xs p-0 border-transparent focus:border-indigo-200 bg-transparent"
            />
          </div>
        </div>
      </div>
    </section>

    <section>
      <h3
        class="font-bold text-slate-800 flex items-center gap-2 mb-3 text-sm uppercase tracking-wider border-b pb-2"
      >
        <Clock class="w-4 h-4 text-green-600" /> Thời gian & Dịch vụ
      </h3>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div
          class="bg-white p-3 rounded-lg border border-slate-200 shadow-sm space-y-2"
        >
          <div class="text-[10px] font-bold text-slate-400 uppercase mb-1">
            Giờ hoạt động
          </div>
          <div
            class="flex justify-between items-center py-1 border-b border-slate-50"
          >
            <span class="text-xs text-slate-600 font-medium"
              >Thứ 2 - Thứ 6</span
            >
            <span
              v-if="!isEditing"
              class="text-xs font-mono bg-green-50 text-green-700 px-2 py-0.5 rounded"
              >{{ school.operating_hours?.standard_hours || "---" }}</span
            >
            <Input
              v-else
              v-model="formData.operating_hours.standard_hours"
              class="h-6 w-24 text-xs"
            />
          </div>
          <div
            class="flex justify-between items-center py-1 border-b border-slate-50"
          >
            <span class="text-xs text-slate-600">Giờ ngắn</span>
            <span v-if="!isEditing" class="text-xs font-mono text-slate-500">{{
              school.operating_hours?.short_hours || "---"
            }}</span>
            <Input
              v-else
              v-model="formData.operating_hours.short_hours"
              class="h-6 w-24 text-xs"
            />
          </div>
          <div class="flex justify-between items-center py-1">
            <span class="text-xs text-slate-600 font-medium">Thứ 7</span>
            <span v-if="!isEditing" class="text-xs font-mono text-slate-700">{{
              school.operating_hours?.saturday_hours || "Nghỉ"
            }}</span>
            <Input
              v-else
              v-model="formData.operating_hours.saturday_hours"
              class="h-6 w-24 text-xs"
            />
          </div>
        </div>

        <div
          class="bg-white p-3 rounded-lg border border-slate-200 shadow-sm space-y-3"
        >
          <div>
            <div class="flex items-center justify-between mb-1">
              <span
                class="text-xs font-bold text-orange-600 flex items-center gap-1"
                ><Clock class="w-3 h-3" /> Giữ muộn (Extended)</span
              >
              <div v-if="isEditing" class="flex items-center gap-1">
                <input
                  type="checkbox"
                  v-model="formData.special_services.has_extended_care"
                  class="h-3 w-3 accent-orange-500"
                />
              </div>
            </div>
            <div
              v-if="school.special_services?.has_extended_care || isEditing"
              class="text-xs bg-orange-50 p-2 rounded text-orange-800 border border-orange-100"
            >
              <span v-if="!isEditing"
                >⏰
                {{
                  school.special_services?.extended_care_hours || "Có hỗ trợ"
                }}</span
              >
              <Input
                v-else
                v-model="formData.special_services.extended_care_hours"
                class="h-6 text-xs bg-white"
                placeholder="VD: 18:00 - 19:00"
              />
              <div class="text-[10px] mt-1 opacity-80" v-if="!isEditing">
                Đón muộn nhất: {{ school.latest_pickup_time }}
              </div>
            </div>
            <div v-else class="text-xs text-slate-400 italic">
              Không có dịch vụ này
            </div>
          </div>

          <div class="space-y-2 pt-2 border-t border-slate-100">
            <div class="flex items-center justify-between">
              <span class="text-xs text-slate-600">Hỗ trợ khuyết tật</span>
              <span v-if="!isEditing"
                ><CheckCircle2
                  v-if="school.special_services?.has_special_needs_care"
                  class="w-4 h-4 text-green-500" /><XCircle
                  v-else
                  class="w-4 h-4 text-slate-200"
              /></span>
              <input
                v-else
                type="checkbox"
                v-model="formData.special_services.has_special_needs_care"
                class="h-4 w-4 accent-green-600"
              />
            </div>
            <div class="flex items-center justify-between">
              <span class="text-xs text-slate-600">Giữ trẻ tạm thời</span>
              <span v-if="!isEditing"
                ><CheckCircle2
                  v-if="school.special_services?.has_temporary_care"
                  class="w-4 h-4 text-green-500" /><XCircle
                  v-else
                  class="w-4 h-4 text-slate-200"
              /></span>
              <input
                v-else
                type="checkbox"
                v-model="formData.special_services.has_temporary_care"
                class="h-4 w-4 accent-green-600"
              />
            </div>
            <div
              class="flex items-center justify-between bg-blue-50 p-1 rounded -mx-1"
            >
              <span class="text-xs font-bold text-blue-700 pl-1"
                >TT Hỗ trợ nuôi dạy trẻ</span
              >
              <span v-if="!isEditing"
                ><CheckCircle2
                  v-if="school.special_services?.has_support_center"
                  class="w-4 h-4 text-blue-500" /><XCircle
                  v-else
                  class="w-4 h-4 text-slate-300"
              /></span>
              <input
                v-else
                type="checkbox"
                v-model="formData.special_services.has_support_center"
                class="h-4 w-4 accent-blue-600"
              />
            </div>
          </div>
        </div>
      </div>
    </section>

    <section>
      <h3
        class="font-bold text-slate-800 flex items-center gap-2 mb-3 text-sm uppercase tracking-wider border-b pb-2"
      >
        <Wallet class="w-4 h-4 text-yellow-600" /> Chi phí (Ước tính)
      </h3>
      <div class="bg-slate-50 rounded-lg border border-slate-200 p-4 space-y-3">
        <div class="grid grid-cols-1 gap-2">
          <div
            class="flex justify-between items-center text-xs pb-1 border-b border-slate-200 border-dashed"
          >
            <span class="text-slate-500">Giữ muộn (Tháng)</span>
            <span v-if="!isEditing" class="font-medium text-slate-700">{{
              school.fee_info?.extended_care_fee_monthly || "---"
            }}</span>
            <Input
              v-else
              v-model="formData.fee_info.extended_care_fee_monthly"
              class="h-6 w-32 text-right text-xs"
            />
          </div>
          <div
            class="flex justify-between items-center text-xs pb-1 border-b border-slate-200 border-dashed"
          >
            <span class="text-slate-500">Giữ muộn (Giờ/KC)</span>
            <span v-if="!isEditing" class="font-medium text-slate-700">{{
              school.fee_info?.extended_care_fee_hourly || "---"
            }}</span>
            <Input
              v-else
              v-model="formData.fee_info.extended_care_fee_hourly"
              class="h-6 w-32 text-right text-xs"
            />
          </div>
          <div
            class="flex justify-between items-center text-xs pb-1 border-b border-slate-200 border-dashed"
          >
            <span class="text-slate-500">Ăn uống (Món chính)</span>
            <span v-if="!isEditing" class="font-medium text-slate-700">{{
              school.fee_info?.food_fee_main || "---"
            }}</span>
            <Input
              v-else
              v-model="formData.fee_info.food_fee_main"
              class="h-6 w-32 text-right text-xs"
            />
          </div>

          <div class="mt-2 pt-2">
            <span
              class="text-[10px] text-slate-400 uppercase font-bold block mb-1"
              >Vật dụng phải mua</span
            >
            <p
              v-if="!isEditing"
              class="text-xs text-slate-600 bg-white p-2 rounded border border-slate-200 leading-relaxed"
            >
              {{ school.fee_info?.supplies_fee || "Không có thông tin" }}
            </p>
            <Textarea
              v-else
              v-model="formData.fee_info.supplies_fee"
              class="text-xs bg-white"
              rows="2"
            />
          </div>
        </div>
      </div>
    </section>

    <section>
      <h3
        class="font-bold text-slate-800 flex items-center gap-2 mb-3 text-sm uppercase tracking-wider border-b pb-2"
      >
        <ShieldAlert class="w-4 h-4 text-red-500" /> An toàn & Nhân sự
      </h3>
      <div class="grid grid-cols-1 gap-4">
        <div class="bg-white rounded-lg border border-slate-200 p-3 shadow-sm">
          <div
            class="flex items-center gap-2 mb-3 pb-2 border-b border-slate-100"
          >
            <UserCheck class="w-4 h-4 text-teal-600" />
            <span class="text-xs font-bold text-slate-700"
              >Đội ngũ nhân viên</span
            >
          </div>
          <div class="grid grid-cols-4 gap-2 text-center">
            <div class="bg-teal-50 rounded p-1.5 flex flex-col items-center">
              <span class="text-[9px] text-teal-600 font-bold uppercase mb-1"
                >Giáo viên</span
              >
              <span
                v-if="!isEditing"
                class="text-sm font-black text-slate-700"
                >{{ school.staff_info?.teacher_count || 0 }}</span
              >
              <Input
                v-else
                type="number"
                v-model="formData.staff_info.teacher_count"
                class="h-6 w-full text-center text-xs p-0"
              />
            </div>
            <div class="bg-teal-50 rounded p-1.5 flex flex-col items-center">
              <span class="text-[9px] text-teal-600 font-bold uppercase mb-1"
                >Y tá</span
              >
              <span
                v-if="!isEditing"
                class="text-sm font-black text-slate-700"
                >{{ school.staff_info?.nurse_count || 0 }}</span
              >
              <Input
                v-else
                type="number"
                v-model="formData.staff_info.nurse_count"
                class="h-6 w-full text-center text-xs p-0"
              />
            </div>
            <div class="bg-teal-50 rounded p-1.5 flex flex-col items-center">
              <span class="text-[9px] text-teal-600 font-bold uppercase mb-1"
                >Dinh dưỡng</span
              >
              <span
                v-if="!isEditing"
                class="text-sm font-black text-slate-700"
                >{{ school.staff_info?.nutritionist_count || 0 }}</span
              >
              <Input
                v-else
                type="number"
                v-model="formData.staff_info.nutritionist_count"
                class="h-6 w-full text-center text-xs p-0"
              />
            </div>
            <div class="bg-teal-50 rounded p-1.5 flex flex-col items-center">
              <span class="text-[9px] text-teal-600 font-bold uppercase mb-1"
                >Đầu bếp</span
              >
              <span
                v-if="!isEditing"
                class="text-sm font-black text-slate-700"
                >{{ school.staff_info?.cook_count || 0 }}</span
              >
              <Input
                v-else
                type="number"
                v-model="formData.staff_info.cook_count"
                class="h-6 w-full text-center text-xs p-0"
              />
            </div>
          </div>
        </div>

        <div
          class="bg-white rounded-lg border border-slate-200 p-3 shadow-sm space-y-3"
        >
          <div>
            <div class="flex items-center gap-2 mb-1">
              <ShieldAlert class="w-3.5 h-3.5 text-red-500" />
              <span class="text-xs font-bold text-slate-700"
                >Địa điểm sơ tán</span
              >
            </div>
            <div
              v-if="!isEditing"
              class="text-xs font-bold text-red-600 bg-red-50 p-2 rounded border border-red-100 flex items-center gap-2"
            >
              <MapPin class="w-3 h-3" />
              {{
                school.medical_safety_info?.evacuation_site || "Chưa cập nhật"
              }}
            </div>
            <Input
              v-else
              v-model="formData.medical_safety_info.evacuation_site"
              class="h-8 text-xs border-red-200"
            />
          </div>

          <div
            class="flex items-center justify-between text-xs pt-2 border-t border-slate-100"
          >
            <span class="text-slate-500 flex items-center gap-1"
              ><HeartHandshake class="w-3 h-3" /> Trang bị máy AED</span
            >
            <span
              v-if="!isEditing"
              class="font-bold px-2 py-0.5 rounded text-[10px]"
              :class="
                school.medical_safety_info?.has_aed
                  ? 'bg-green-100 text-green-700'
                  : 'bg-slate-100 text-slate-400'
              "
            >
              {{ school.medical_safety_info?.has_aed ? "CÓ" : "KHÔNG" }}
            </span>
            <input
              v-else
              type="checkbox"
              v-model="formData.medical_safety_info.has_aed"
              class="h-4 w-4 accent-green-600"
            />
          </div>

          <div class="text-xs space-y-1 bg-slate-50 p-2 rounded">
            <div class="flex gap-2 items-center">
              <Stethoscope class="w-3 h-3 text-slate-400 shrink-0" />
              <span class="text-slate-500 w-10 shrink-0">Bác sĩ</span>
              <span
                v-if="!isEditing"
                class="text-slate-700 font-medium truncate"
                >{{ school.medical_safety_info?.school_doctor || "---" }}</span
              >
              <Input
                v-else
                v-model="formData.medical_safety_info.school_doctor"
                class="h-6 flex-1 text-xs"
              />
            </div>
            <div class="flex gap-2 items-center">
              <span class="w-3 h-3 shrink-0">🦷</span>
              <span class="text-slate-500 w-10 shrink-0">Nha sĩ</span>
              <span
                v-if="!isEditing"
                class="text-slate-700 font-medium truncate"
                >{{ school.medical_safety_info?.school_dentist || "---" }}</span
              >
              <Input
                v-else
                v-model="formData.medical_safety_info.school_dentist"
                class="h-6 flex-1 text-xs"
              />
            </div>
          </div>
        </div>
      </div>
    </section>

    <section>
      <h3
        class="font-bold text-slate-800 flex items-center gap-2 mb-3 text-sm uppercase tracking-wider border-b pb-2"
      >
        <Briefcase class="w-4 h-4 text-stone-600" /> Cơ sở vật chất
      </h3>
      <div
        class="bg-white rounded-lg border border-slate-200 p-4 space-y-4 shadow-sm"
      >
        <div class="grid grid-cols-2 gap-4 text-xs">
          <div>
            <span class="text-slate-400 block mb-1">Diện tích sàn</span>
            <span v-if="!isEditing" class="font-medium text-sm">{{
              school.facility_info?.total_floor_area || "---"
            }}</span>
            <Input
              v-else
              v-model="formData.facility_info.total_floor_area"
              class="h-7 text-xs"
            />
          </div>
          <div>
            <span class="text-slate-400 block mb-1">Kết cấu</span>
            <span v-if="!isEditing" class="font-medium text-sm">{{
              school.facility_info?.building_structure || "---"
            }}</span>
            <Input
              v-else
              v-model="formData.facility_info.building_structure"
              class="h-7 text-xs"
            />
          </div>
        </div>

        <div>
          <span
            class="text-[10px] text-slate-400 uppercase font-bold block mb-1"
            >Bãi đậu xe</span
          >
          <div
            v-if="!isEditing"
            class="flex items-start gap-2 text-xs text-slate-600 bg-slate-50 p-2 rounded"
          >
            <span class="text-lg">🅿️</span>
            {{ school.facility_info?.parking_info || "---" }}
          </div>
          <Input
            v-else
            v-model="formData.facility_info.parking_info"
            class="h-8 text-xs"
          />
        </div>

        <div class="pt-2 border-t border-slate-100">
          <span
            class="text-[10px] text-slate-400 uppercase font-bold block mb-1 items-center gap-1"
            ><Baby class="w-3 h-3" /> Đồ dùng ngủ trưa</span
          >
          <p
            v-if="!isEditing"
            class="text-xs text-stone-600 italic bg-amber-50 p-2 rounded border border-amber-100"
          >
            "{{ school.facility_info?.preparation_list || "---" }}"
          </p>
          <Textarea
            v-else
            v-model="formData.facility_info.preparation_list"
            class="text-xs"
            rows="2"
          />
        </div>
      </div>
    </section>

    <section>
      <h3
        class="font-bold text-slate-800 flex items-center gap-2 mb-3 text-sm uppercase tracking-wider border-b pb-2"
      >
        <Calendar class="w-4 h-4 text-pink-500" /> Hoạt động & Triết lý
      </h3>
      <div
        class="space-y-3 text-sm bg-white p-4 rounded-lg border border-slate-200"
      >
        <div>
          <span
            class="text-[10px] text-slate-400 uppercase font-bold block mb-1"
            >Triết lý giáo dục</span
          >
          <p
            v-if="!isEditing"
            class="italic text-slate-600 bg-slate-50 p-3 rounded-tr-xl rounded-bl-xl border-l-4 border-pink-400 leading-relaxed"
          >
            {{ school.philosophy || "Chưa cập nhật triết lý." }}
          </p>
          <Textarea
            v-else
            v-model="formData.philosophy"
            class="text-xs"
            rows="3"
          />
        </div>

        <div class="pt-2">
          <span
            class="text-[10px] text-slate-400 uppercase font-bold block mb-2 items-center gap-1"
            ><Megaphone class="w-3 h-3" /> Sự kiện hàng năm</span
          >
          <div v-if="!isEditing" class="flex flex-wrap gap-1.5">
            <Badge
              v-for="ev in school.annual_events"
              :key="ev"
              variant="outline"
              class="text-[10px] bg-pink-50 text-pink-700 border-pink-200 hover:bg-pink-100"
            >
              {{ ev }}
            </Badge>
            <span
              v-if="!school.annual_events?.length"
              class="text-xs text-slate-400 italic"
              >---</span
            >
          </div>
          <Textarea
            v-else
            v-model="eventsInput"
            placeholder="Sự kiện 1, Sự kiện 2... (ngăn cách dấu phẩy)"
            class="text-xs"
          />
        </div>

        <div class="pt-2">
          <span
            class="text-[10px] text-slate-400 uppercase font-bold block mb-2 items-center gap-1"
            ><HeartHandshake class="w-3 h-3" /> Hoạt động cộng đồng</span
          >
          <div v-if="!isEditing" class="flex flex-wrap gap-1.5">
            <Badge
              v-for="prog in school.community_programs"
              :key="prog"
              variant="outline"
              class="text-[10px] bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100"
            >
              {{ prog }}
            </Badge>
            <span
              v-if="!school.community_programs?.length"
              class="text-xs text-slate-400 italic"
              >---</span
            >
          </div>
          <Textarea
            v-else
            v-model="communityInput"
            placeholder="Hoạt động 1, Hoạt động 2... (ngăn cách dấu phẩy)"
            class="text-xs"
          />
        </div>
      </div>
    </section>
  </div>
</template>
