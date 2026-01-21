<script setup lang="ts">
import { ref, watch } from "vue";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2, ImagePlus, X } from "lucide-vue-next";

const props = defineProps<{
  open: boolean;
  lat: number;
  lng: number;
  isLoading: boolean;
}>();

const emit = defineEmits<{
  (e: "update:open", value: boolean): void;
  (e: "submit", formData: any, file: File | null): void;
}>();

const form = ref({
  name: "",
  category: "Public",
  address: "",
  notes: "",
});

const selectedFile = ref<File | null>(null);
const previewUrl = ref<string | null>(null);

const categories = [
  { value: "Public", label: "🏫 Trường Công (Ninka)" },
  { value: "Private", label: "🏢 Trường Tư/Quốc tế" },
  { value: "SmallScale", label: "🏠 Quy mô nhỏ (Shokibo)" },
  { value: "Home", label: "🏡 Nhà riêng" },
  { value: "Work", label: "💼 Công ty" },
  { value: "Company", label: "🏭 Doanh nghiệp (Chủ đạo)" },
];

watch(
  () => props.open,
  (val) => {
    if (val) {
      // Reset form khi mở (chế độ Add mới)
      form.value = { name: "", category: "Public", address: "", notes: "" };
      selectedFile.value = null;
      previewUrl.value = null;
    }
  },
);

const onFileChange = (event: Event) => {
  const input = event.target as HTMLInputElement;
  if (input.files && input.files[0]) {
    selectedFile.value = input.files[0];
    previewUrl.value = URL.createObjectURL(input.files[0]);
  }
};

const removeImage = () => {
  selectedFile.value = null;
  previewUrl.value = null;
};

const handleSubmit = () => {
  // Chỉ gửi thông tin cơ bản
  emit(
    "submit",
    {
      name: form.value.name,
      category: form.value.category,
      address: form.value.address,
      notes: form.value.notes,
      lat: props.lat,
      lng: props.lng,
    },
    selectedFile.value,
  );
};
</script>

<template>
  <Dialog :open="open" @update:open="$emit('update:open', $event)">
    <DialogContent class="sm:max-w-md">
      <DialogHeader>
        <DialogTitle>Thêm địa điểm mới</DialogTitle>
        <DialogDescription
          >Nhập thông tin cơ bản cho địa điểm này.</DialogDescription
        >
      </DialogHeader>

      <div class="grid gap-4 py-4">
        <div class="grid gap-2">
          <Label>Tên địa điểm <span class="text-red-500">*</span></Label>
          <Input v-model="form.name" placeholder="VD: Hoikuen ABC..." />
        </div>

        <div class="grid gap-2">
          <Label>Phân loại</Label>
          <Select v-model="form.category">
            <SelectTrigger><SelectValue /></SelectTrigger>
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

        <div class="grid gap-2">
          <Label>Địa chỉ</Label>
          <Input v-model="form.address" placeholder="Nhập địa chỉ..." />
        </div>

        <div class="grid gap-2">
          <Label>Hình ảnh</Label>
          <div
            v-if="!previewUrl"
            class="w-full h-32 border-2 border-dashed rounded-lg flex items-center justify-center bg-gray-50 cursor-pointer hover:bg-gray-100 relative"
          >
            <input
              type="file"
              accept="image/*"
              class="absolute inset-0 opacity-0 cursor-pointer"
              @change="onFileChange"
            />
            <div class="text-center text-gray-400">
              <ImagePlus class="w-6 h-6 mx-auto mb-1" />
              <span class="text-xs">Tải ảnh lên</span>
            </div>
          </div>
          <div
            v-else
            class="relative w-full h-40 rounded-lg overflow-hidden border"
          >
            <img :src="previewUrl" class="w-full h-full object-cover" />
            <button
              @click="removeImage"
              class="absolute top-1 right-1 bg-black/50 text-white rounded-full p-1"
            >
              <X class="w-4 h-4" />
            </button>
          </div>
        </div>

        <div class="grid gap-2">
          <Label>Ghi chú</Label>
          <Textarea v-model="form.notes" placeholder="Ghi chú thêm..." />
        </div>
      </div>

      <DialogFooter>
        <Button variant="outline" @click="$emit('update:open', false)"
          >Hủy</Button
        >
        <Button @click="handleSubmit" :disabled="isLoading || !form.name">
          <Loader2 v-if="isLoading" class="mr-2 h-4 w-4 animate-spin" /> Lưu
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
</template>
