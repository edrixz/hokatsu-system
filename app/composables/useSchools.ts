import type { School } from "~/types/school";

// Ảnh mặc định nếu không upload
const DEFAULT_IMAGE = "https://placehold.co/600x400?text=No+Image";

export const useSchools = () => {
  const supabase = useSupabaseClient<School>();

  // Sử dụng useAsyncData để fetch data server-side friendly
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
    return data as School[];
  });

  // 2. Upload Image Helper
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

  // 3. Add New School
  const addSchool = async (formData: any, file: File | null) => {
    let imageUrl = DEFAULT_IMAGE;

    // Nếu có file thì upload
    if (file) {
      const uploadedUrl = await uploadImage(file);
      if (uploadedUrl) imageUrl = uploadedUrl;
    }

    // Insert vào DB
    const { data, error } = await supabase
      .from("schools")
      .insert({
        ...formData,
        image_url: imageUrl,
        ranking: null, // Mặc định chưa xếp hạng
      })
      .select()
      .single();

    if (error) throw error;

    // Refresh lại danh sách để hiện ngay lập tức
    await refresh();
    return data;
  };

  return {
    schools,
    pending,
    error,
    refresh,
    addSchool,
  };
};
