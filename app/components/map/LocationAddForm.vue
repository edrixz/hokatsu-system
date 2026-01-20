<script setup lang="ts">
import { ref, computed } from "vue";
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

// Props
const props = defineProps<{
  open: boolean;
  lat: number;
  lng: number;
  isLoading: boolean;
}>();

// Emits
const emit = defineEmits<{
  (e: "update:open", value: boolean): void;
  (e: "submit", formData: any, file: File | null): void;
}>();

// Form State
const form = ref({
  name: "",
  category: "Public", // Mặc định là trường Công
  address: "",
  notes: "",
});

// Image State
const selectedFile = ref<File | null>(null);
const previewUrl = ref<string | null>(null);

// Categories
const categories = [
  { value: "Public", label: "🏫 Trường Công (Ninka)" },
  { value: "Private", label: "🏢 Trường Tư/Quốc tế" },
  { value: "SmallScale", label: "🏠 Quy mô nhỏ (Shokibo)" },
  { value: "Home", label: "🏡 Nhà riêng" },
  { value: "Work", label: "💼 Công ty" },
  { value: "Company", label: "🏭 Doanh nghiệp (Chủ đạo)" },
];

// Handle File Change
const onFileChange = (event: Event) => {
  const input = event.target as HTMLInputElement;
  if (input.files && input.files[0]) {
    const file = input.files[0];
    selectedFile.value = file;
    // Tạo URL preview
    previewUrl.value = URL.createObjectURL(file);
  }
};

const removeImage = () => {
  selectedFile.value = null;
  previewUrl.value = null;
};

// Submit
const handleSubmit = () => {
  // Gửi dữ liệu ra ngoài cho index.vue xử lý
  emit(
    "submit",
    {
      ...form.value,
      lat: props.lat,
      lng: props.lng,
    },
    selectedFile.value,
  );
};

// Reset form khi đóng mở (Optional)
</script>

<template>
  <Dialog :open="open" @update:open="$emit('update:open', $event)">
    <DialogContent class="sm:max-w-106.25 max-h-[90vh] overflow-y-auto">
      <DialogHeader>
        <DialogTitle>Thêm địa điểm mới</DialogTitle>
        <DialogDescription>
          Nhập thông tin cho toạ độ {{ lat.toFixed(4) }}, {{ lng.toFixed(4) }}
        </DialogDescription>
      </DialogHeader>

      <div class="grid gap-4 py-4">
        <div class="grid gap-2">
          <Label for="name"
            >Tên địa điểm <span class="text-red-500">*</span></Label
          >
          <Input
            id="name"
            v-model="form.name"
            placeholder="VD: Hoikuen ABC..."
          />
        </div>

        <div class="grid gap-2">
          <Label for="address">Địa chỉ</Label>
          <Input
            id="address"
            v-model="form.address"
            placeholder="VD: 1-2-3 Omiya, Saitama..."
          />
        </div>

        <div class="grid gap-2">
          <Label>Phân loại</Label>
          <Select v-model="form.category">
            <SelectTrigger>
              <SelectValue placeholder="Chọn loại" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem
                v-for="c in categories"
                :key="c.value"
                :value="c.value"
              >
                {{ c.label }}
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div class="grid gap-2">
          <Label>Hình ảnh (Tùy chọn)</Label>

          <div
            v-if="!previewUrl"
            class="flex items-center justify-center w-full"
          >
            <label
              for="dropzone-file"
              class="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 border-gray-300"
            >
              <div class="flex flex-col items-center justify-center pt-5 pb-6">
                <ImagePlus class="w-8 h-8 mb-2 text-gray-400" />
                <p class="text-xs text-gray-500">Bấm để tải ảnh lên</p>
              </div>
              <input
                id="dropzone-file"
                type="file"
                accept="image/*"
                class="hidden"
                @change="onFileChange"
              />
            </label>
          </div>

          <div
            v-else
            class="relative w-full h-40 rounded-lg overflow-hidden border"
          >
            <img :src="previewUrl" class="w-full h-full object-cover" />
            <button
              @click="removeImage"
              class="absolute top-1 right-1 bg-black/50 hover:bg-black/70 text-white rounded-full p-1"
            >
              <X class="w-4 h-4" />
            </button>
          </div>
        </div>

        <div class="grid gap-2">
          <Label for="notes">Ghi chú</Label>
          <Textarea
            id="notes"
            v-model="form.notes"
            placeholder="Ghi chú thêm về giờ giấc, bãi xe..."
          />
        </div>
      </div>

      <DialogFooter>
        <Button variant="outline" @click="$emit('update:open', false)"
          >Hủy</Button
        >
        <Button @click="handleSubmit" :disabled="isLoading || !form.name">
          <Loader2 v-if="isLoading" class="mr-2 h-4 w-4 animate-spin" />
          Lưu địa điểm
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
</template>
