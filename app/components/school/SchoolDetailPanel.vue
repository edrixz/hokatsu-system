<script setup lang="ts">
import { ref, reactive, watch } from "vue";
import ScrollArea from "@/components/ui/scroll-area/ScrollArea.vue";
import SchoolHeader from "./detail/SchoolHeader.vue";
import SchoolInfo from "./detail/SchoolInfo.vue";
import SchoolRouting from "./detail/SchoolRouting.vue";
import type { School } from "~/types/school";
import { useSchools } from "~/composables/useSchools";

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

const { updateSchool, deleteSchool } = useSchools();

// --- STATE ---
const isEditing = ref(false);
const isSaving = ref(false);
const isDeleting = ref(false);
const formData = reactive<any>({});
const imageFile = ref<File | null>(null);

// --- WATCHERS ---
watch(
  () => props.school,
  (newVal) => {
    if (!newVal) return;
    isEditing.value = false;
    imageFile.value = null;
    // Deep copy data
    Object.assign(formData, JSON.parse(JSON.stringify(newVal)));
  },
  { immediate: true },
);

// --- LOGIC ---
const handleSave = async () => {
  isSaving.value = true;
  try {
    await updateSchool(
      props.school.id,
      formData,
      imageFile.value,
      props.school.image_url,
    );
    isEditing.value = false;
  } catch (e: any) {
    alert("Lỗi cập nhật: " + e.message);
  } finally {
    isSaving.value = false;
  }
};

const handleDelete = async () => {
  if (!confirm("Xóa địa điểm này?")) return;
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
</script>

<template>
  <div
    class="w-100 border-l bg-white h-full shadow-2xl z-30 flex flex-col overflow-hidden"
  >
    <SchoolHeader
      :school="school"
      :is-editing="isEditing"
      :is-saving="isSaving"
      :is-deleting="isDeleting"
      :form-data="formData"
      @close="$emit('close')"
      @edit="isEditing = true"
      @cancel="isEditing = false"
      @save="handleSave"
      @delete="handleDelete"
      @open-map="$emit('openGoogleMaps')"
    />

    <div class="flex-1 min-h-0 relative bg-white">
      <ScrollArea class="h-full w-full p-6">
        <SchoolInfo
          :school="school"
          :is-editing="isEditing"
          :form-data="formData"
          @file-change="(f) => (imageFile = f)"
        />

        <SchoolRouting
          :has-calculated="hasCalculated"
          @calculate="$emit('calculate')"
          @switch-mode="(m) => $emit('switchMode', m)"
        />

        <div class="h-10"></div>
      </ScrollArea>
    </div>
  </div>
</template>
