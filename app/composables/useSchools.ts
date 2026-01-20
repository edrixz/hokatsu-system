import type { School } from "~/types/school";

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

  return {
    schools,
    pending,
    error,
    refresh,
  };
};
