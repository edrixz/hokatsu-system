<script setup lang="ts">
import { ref, computed } from "vue";
import {
  Search,
  School as SchoolIcon,
  Home,
  Baby,
  Clock,
  ShieldCheck,
  ChevronsUpDown,
  Check,
  MapPin,
  Filter,
} from "lucide-vue-next";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command,
  CommandGroup,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import type { School, CapacityInfo } from "~/types/school";

const props = defineProps<{
  schools: School[] | null | undefined;
  pending: boolean;
}>();

const emit = defineEmits<{
  (e: "select", school: School): void;
}>();

// --- STATE ---
const searchQuery = ref("");
const selectedType = ref<string>("all");
const selectedAge = ref<string>("all");
const selectedFeature = ref<string[]>([]);

// --- CONSTANTS ---
const schoolTypes = [
  { value: "all", label: "Tất cả loại hình" },
  { value: "Public", label: "Công lập (Ninka)" },
  { value: "Private", label: "Tư thục" },
  { value: "Certified", label: "Đã cấp phép" },
  { value: "SmallScale", label: "Quy mô nhỏ" },
];

const ageOptions = [
  { value: "all", label: "Tất cả độ tuổi" },
  { value: "0", label: "0 tuổi" },
  { value: "1", label: "1 tuổi" },
  { value: "2", label: "2 tuổi" },
  { value: "3", label: "3 tuổi" },
  { value: "4", label: "4 tuổi" },
  { value: "5", label: "5 tuổi" },
];

const featureOptions = [
  { value: "extended", label: "Giữ muộn", icon: Clock },
  { value: "special", label: "Hỗ trợ ĐB", icon: Baby },
  { value: "aed", label: "Có AED", icon: ShieldCheck },
];

// --- COMPUTED ---
const homeLocation = computed(() => {
  return props.schools?.find((s) => s.category === "Home");
});

const schoolList = computed(() => {
  return props.schools?.filter((s) => s.category !== "Home") || [];
});

const filteredSchools = computed(() => {
  let result = schoolList.value;

  // 1. Search Text
  if (searchQuery.value) {
    const q = searchQuery.value.toLowerCase();
    result = result.filter(
      (s) =>
        s.name.toLowerCase().includes(q) || s.address.toLowerCase().includes(q),
    );
  }

  // 2. Filter Type
  if (selectedType.value !== "all") {
    result = result.filter((s) => s.category === selectedType.value);
  }

  // 3. Filter Age (Capacity > 0)
  if (selectedAge.value !== "all") {
    // Ép kiểu key động an toàn
    const key = `age_${selectedAge.value}` as keyof Omit<CapacityInfo, "notes">;
    result = result.filter((s) => (Number(s.capacity_info?.[key]) || 0) > 0);
  }

  // 4. Filter Features
  if (selectedFeature.value.length > 0) {
    if (selectedFeature.value.includes("extended")) {
      result = result.filter((s) => s.special_services?.has_extended_care);
    }
    if (selectedFeature.value.includes("special")) {
      result = result.filter((s) => s.special_services?.has_special_needs_care);
    }
    if (selectedFeature.value.includes("aed")) {
      result = result.filter((s) => s.medical_safety_info?.has_aed);
    }
  }

  return result;
});

// --- METHODS ---
const toggleFeature = (val: string) => {
  if (selectedFeature.value.includes(val)) {
    selectedFeature.value = selectedFeature.value.filter((f) => f !== val);
  } else {
    selectedFeature.value.push(val);
  }
};

const getBadgeVariant = (cat: string) => {
  switch (cat) {
    case "Public":
      return "default";
    case "Private":
      return "outline";
    case "SmallScale":
      return "secondary";
    default:
      return "secondary";
  }
};
</script>

<template>
  <div class="flex flex-col h-full bg-slate-50">
    <div
      class="p-3 bg-white border-b space-y-3 shrink-0 z-10 shadow-sm sticky top-0"
    >
      <div class="relative">
        <Search class="absolute left-2.5 top-2.5 h-4 w-4 text-slate-400" />
        <Input
          v-model="searchQuery"
          placeholder="Tìm tên trường, địa chỉ..."
          class="pl-9 h-9 bg-slate-50 border-slate-200 focus-visible:ring-blue-500 text-sm"
        />
      </div>

      <div class="flex gap-2 overflow-x-auto pb-1 scrollbar-hide items-center">
        <Popover>
          <PopoverTrigger as-child>
            <Button
              variant="outline"
              size="sm"
              class="h-7 border-dashed text-xs px-2 shrink-0 font-normal"
            >
              <SchoolIcon class="mr-1 h-3 w-3 text-slate-500" />
              {{
                selectedType === "all"
                  ? "Loại hình"
                  : schoolTypes.find((t) => t.value === selectedType)?.label
              }}
              <ChevronsUpDown class="ml-1 h-3 w-3 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent class="w-50 p-0" align="start">
            <Command>
              <CommandList>
                <CommandGroup>
                  <CommandItem
                    v-for="type in schoolTypes"
                    :key="type.value"
                    :value="type.value"
                    @select="selectedType = type.value"
                  >
                    <Check
                      :class="[
                        'mr-2 h-4 w-4',
                        selectedType === type.value
                          ? 'opacity-100'
                          : 'opacity-0',
                      ]"
                    />
                    {{ type.label }}
                  </CommandItem>
                </CommandGroup>
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>

        <Popover>
          <PopoverTrigger as-child>
            <Button
              variant="outline"
              size="sm"
              class="h-7 border-dashed text-xs px-2 shrink-0 font-normal"
            >
              <Baby class="mr-1 h-3 w-3 text-slate-500" />
              {{ selectedAge === "all" ? "Độ tuổi" : `${selectedAge} tuổi` }}
              <ChevronsUpDown class="ml-1 h-3 w-3 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent class="w-37.5 p-0" align="start">
            <Command>
              <CommandList>
                <CommandGroup>
                  <CommandItem
                    v-for="age in ageOptions"
                    :key="age.value"
                    :value="age.value"
                    @select="selectedAge = age.value"
                  >
                    <Check
                      :class="[
                        'mr-2 h-4 w-4',
                        selectedAge === age.value ? 'opacity-100' : 'opacity-0',
                      ]"
                    />
                    {{ age.label }}
                  </CommandItem>
                </CommandGroup>
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>

        <div class="h-4 w-px bg-slate-200 shrink-0 mx-1"></div>

        <div class="flex gap-1.5">
          <Badge
            v-for="feat in featureOptions"
            :key="feat.value"
            variant="outline"
            class="h-7 cursor-pointer text-[10px] px-2 transition-all select-none shrink-0 font-normal"
            :class="
              selectedFeature.includes(feat.value)
                ? 'bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100'
                : 'bg-white text-slate-500 hover:bg-slate-100 border-slate-200'
            "
            @click="toggleFeature(feat.value)"
          >
            <component :is="feat.icon" class="w-3 h-3 mr-1" />
            {{ feat.label }}
          </Badge>
        </div>
      </div>
    </div>

    <div class="flex-1 min-h-0 relative">
      <ScrollArea class="h-full w-full">
        <div class="p-3 space-y-4">
          <div v-if="homeLocation" class="space-y-2">
            <h3
              class="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-1 flex items-center gap-1"
            >
              <Home class="w-3 h-3" /> Nhà của bạn
            </h3>
            <div
              class="group flex items-start gap-3 p-3 bg-white rounded-xl border border-blue-200 shadow-sm hover:shadow-md hover:border-blue-400 transition-all cursor-pointer relative overflow-hidden"
              @click="$emit('select', homeLocation!)"
            >
              <div class="absolute left-0 top-0 bottom-0 w-1 bg-blue-500"></div>
              <div
                class="p-2 bg-blue-50 text-blue-600 rounded-lg shrink-0 mt-0.5"
              >
                <Home class="w-5 h-5" />
              </div>
              <div class="flex-1 min-w-0">
                <div
                  class="font-bold text-slate-800 text-sm group-hover:text-blue-700 transition-colors truncate"
                >
                  {{ homeLocation.name }}
                </div>
                <div class="text-xs text-slate-500 mt-0.5 truncate">
                  {{ homeLocation.address }}
                </div>
              </div>
            </div>
          </div>

          <div
            v-if="homeLocation && filteredSchools.length"
            class="flex items-center gap-2 px-1"
          >
            <Separator class="flex-1 bg-slate-200" />
            <span class="text-[10px] text-slate-400 font-bold uppercase"
              >Danh sách ({{ filteredSchools.length }} trường)</span
            >
            <Separator class="flex-1 bg-slate-200" />
          </div>

          <div
            v-if="pending"
            class="text-center py-10 text-sm text-slate-400 flex flex-col items-center gap-2"
          >
            <div
              class="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"
            ></div>
            Đang tải dữ liệu...
          </div>

          <div
            v-else-if="filteredSchools.length === 0"
            class="text-center py-12 px-4"
          >
            <div
              class="inline-flex items-center justify-center w-12 h-12 rounded-full bg-slate-100 mb-3"
            >
              <SchoolIcon class="w-6 h-6 text-slate-300" />
            </div>
            <p class="text-slate-600 font-medium text-sm">
              Không tìm thấy kết quả
            </p>
            <p class="text-xs text-slate-400 mt-1 max-w-50 mx-auto">
              Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm của bạn.
            </p>
            <Button
              variant="link"
              size="sm"
              class="mt-2 h-auto p-0 text-blue-600 text-xs"
              @click="
                {
                  searchQuery = '';
                  selectedType = 'all';
                  selectedAge = 'all';
                  selectedFeature = [];
                }
              "
            >
              Xóa bộ lọc
            </Button>
          </div>

          <div v-else class="space-y-2.5">
            <div
              v-for="school in filteredSchools"
              :key="school.id"
              class="group bg-white rounded-lg border border-slate-200 p-3 hover:border-blue-400 hover:shadow-md transition-all cursor-pointer relative"
              @click="$emit('select', school)"
            >
              <div class="flex justify-between items-start gap-2 mb-1.5">
                <div
                  class="font-bold text-sm text-slate-800 group-hover:text-blue-700 leading-tight line-clamp-2"
                >
                  {{ school.name }}
                </div>
                <Badge
                  :variant="getBadgeVariant(school.category)"
                  class="shrink-0 text-[9px] px-1.5 h-5 font-normal"
                >
                  {{ school.school_type || school.category }}
                </Badge>
              </div>

              <div
                class="flex items-center gap-1.5 text-xs text-slate-500 mb-2"
              >
                <MapPin class="w-3 h-3 shrink-0" />
                <span class="truncate">{{
                  school.address || "Chưa có địa chỉ"
                }}</span>
              </div>

              <div
                class="flex flex-wrap gap-1.5 mt-2 pt-2 border-t border-slate-50"
              >
                <div
                  v-if="school.capacity_info?.total"
                  class="flex items-center gap-1 text-[10px] bg-slate-50 text-slate-600 px-1.5 py-0.5 rounded border border-slate-100"
                >
                  <Baby class="w-3 h-3 text-slate-400" />
                  {{ school.capacity_info.total }} bé
                </div>
                <div
                  v-if="school.special_services?.has_extended_care"
                  class="flex items-center gap-1 text-[10px] bg-orange-50 text-orange-700 px-1.5 py-0.5 rounded border border-orange-100"
                >
                  <Clock class="w-3 h-3" />
                  {{
                    school.special_services.extended_care_hours?.split(
                      " ",
                    )[2] || "Giữ muộn"
                  }}
                </div>
                <div
                  v-if="school.medical_safety_info?.has_aed"
                  class="flex items-center gap-1 text-[10px] bg-green-50 text-green-700 px-1.5 py-0.5 rounded border border-green-100"
                >
                  <ShieldCheck class="w-3 h-3" />
                  AED
                </div>
              </div>
            </div>
          </div>
        </div>
      </ScrollArea>
    </div>
  </div>
</template>
