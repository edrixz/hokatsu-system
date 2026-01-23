// app/composables/useSchools.ts
import type { School } from "~/types/school";

const DEFAULT_IMAGE = "https://placehold.co/600x400?text=No+Image";

export const useSchools = () => {
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

    // [FIX] Map dữ liệu chuẩn theo Schema mới
    return (data as any[]).map((item) => ({
      ...item,
      // Đảm bảo các field JSONB không bị null để tránh lỗi UI
      capacity_info: item.capacity_info || {},
      staff_info: item.staff_info || {},
      operating_hours: item.operating_hours || {},
      special_services: item.special_services || {},
      fee_info: item.fee_info || {},
      medical_safety_info: item.medical_safety_info || {},
      facility_info: item.facility_info || {},
      tags: item.tags || [],
      // Loại bỏ vacancy_info cũ nếu database trả về rác
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

  // 1. Thêm Mới (ADD)
  const addSchool = async (formData: any, file: File | null) => {
    let imageUrl = DEFAULT_IMAGE;
    if (file) {
      const uploadedUrl = await uploadImage(file);
      if (uploadedUrl) imageUrl = uploadedUrl;
    }

    // [FIX] Payload INSERT chuẩn Schema mới
    const insertPayload = {
      name: formData.name,
      category: formData.category,
      address: formData.address,
      notes: formData.notes,
      lat: formData.lat,
      lng: formData.lng,
      image_url: imageUrl,

      // Khởi tạo các trường JSONB rỗng để tránh lỗi null khi Edit sau này
      capacity_info: {},
      staff_info: {},
      operating_hours: {},
      special_services: {},
      fee_info: {},
      medical_safety_info: {},
      facility_info: {},
      tags: [],
      ranking: null,
    };

    const { data, error } = await supabase
      .from("schools")
      .insert(insertPayload)
      .select()
      .single();

    if (error) throw error;
    await refresh();
    return data;
  };

  // 2. Cập Nhật (UPDATE)
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

    // Lọc bỏ các trường không tồn tại trong DB nếu formData bị dính rác
    // Tuy nhiên, Supabase thường tự bỏ qua nếu ta dùng spread ...formData cẩn thận.
    // Ở đây ta spread formData đè lên, nhưng quan trọng là formData lấy từ School type mới
    // nên sẽ không còn vacancy_info.

    const { data, error } = await supabase
      .from("schools")
      .update({
        ...formData,
        image_url: imageUrl,
        ranking: formData.ranking === "" ? null : formData.ranking,
      })
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;
    await refresh();
    return data;
  };

  // 3. Xóa (DELETE)
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
