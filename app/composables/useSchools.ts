import { ref } from "vue";
import type { School } from "~/types/school";

const DEFAULT_IMAGE = "https://placehold.co/600x400?text=No+Image";

export const useSchools = () => {
  // [FIX] Dùng <any> thay vì <School> để tránh lỗi "parameter of type never"
  // Nguyên nhân: useSupabaseClient cần Database Definition, không phải Row Interface.
  const supabase = useSupabaseClient<any>();

  // Fetch Data
  const {
    data: schools,
    pending,
    refresh,
    error,
  } = useAsyncData("schools", async () => {
    const { data, error } = await supabase
      .from("schools")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) throw error;

    // Map dữ liệu để đảm bảo JSONB không bị null
    return (data as any[]).map((item) => ({
      ...item,
      capacity_info: item.capacity_info || { total: 0 },
      vacancy_info: item.vacancy_info || { total: 0 },
      tags: item.tags || [],
    })) as School[];
  });

  // Helper Upload
  const uploadImage = async (file: File): Promise<string | null> => {
    try {
      const fileExt = file.name.split(".").pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
      const filePath = `${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from("school-images")
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data } = supabase.storage
        .from("school-images")
        .getPublicUrl(filePath);

      return data.publicUrl;
    } catch (e) {
      console.error("Upload error:", e);
      return null;
    }
  };

  // 1. Thêm Mới (Chỉ thông tin cơ bản)
  const addSchool = async (formData: any, file: File | null) => {
    let imageUrl = DEFAULT_IMAGE;
    if (file) {
      const uploadedUrl = await uploadImage(file);
      if (uploadedUrl) imageUrl = uploadedUrl;
    }

    const { data, error } = await supabase
      .from("schools")
      .insert({
        ...formData,
        image_url: imageUrl,
        // Các trường khác để mặc định null/empty
        ranking: null,
        capacity_info: {},
        vacancy_info: {},
        tags: [],
      })
      .select()
      .single();

    if (error) throw error;
    await refresh();
    return data;
  };

  // 2. Cập Nhật (Full thông tin)
  const updateSchool = async (
    id: string,
    formData: any,
    file: File | null,
    oldImageUrl?: string,
  ) => {
    let imageUrl = oldImageUrl;

    if (file) {
      const uploadedUrl = await uploadImage(file);
      if (uploadedUrl) imageUrl = uploadedUrl;
    }

    // [FIX] Update đầy đủ các trường
    const { data, error } = await supabase
      .from("schools")
      .update({
        ...formData,
        image_url: imageUrl,
        // Chuyển null ranking nếu cần thiết
        ranking: formData.ranking === "" ? null : formData.ranking,
      })
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;
    await refresh();
    return data;
  };

  // 3. Xóa
  const deleteSchool = async (id: string, imageUrl?: string) => {
    const { error } = await supabase.from("schools").delete().eq("id", id);
    if (error) throw error;

    if (imageUrl && imageUrl !== DEFAULT_IMAGE) {
      try {
        const path = imageUrl.split("/school-images/").pop();
        if (path) await supabase.storage.from("school-images").remove([path]);
      } catch (e) {
        console.error(e);
      }
    }
    await refresh();
  };

  return {
    schools,
    pending,
    error,
    refresh,
    addSchool,
    updateSchool,
    deleteSchool,
  };
};
