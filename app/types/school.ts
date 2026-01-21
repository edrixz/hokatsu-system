// app/types/school.ts

export type SchoolCategory =
  | "Home"
  | "Work"
  | "Public"
  | "Private"
  | "Certified" // 認可
  | "Unlicensed" // 認可外
  | "SmallScale"
  | "Company";

// D. Định viên theo độ tuổi
export interface AgeCapacity {
  age_0?: number;
  age_1?: number;
  age_2?: number;
  age_3?: number;
  age_4?: number;
  age_5?: number;
  total?: number;
}

// E. Chất lượng & Đặc điểm (Cơ sở vật chất)
export interface FacilityInfo {
  total_area_m2?: number;
  has_hall?: boolean;
  has_kitchen?: boolean;
  floors?: number;
  playground_desc?: string; // outdoor_environment
}

// F. Nhân sự
export interface StaffInfo {
  director?: number;
  childcare_staff?: number;
  nurses?: number;
  nutritionists?: number;
  others?: string[]; // Cooks, clerks...
}

// F. Y tế
export interface MedicalInfo {
  internal_checkup?: string; // Khám nội khoa
  dental_checkup?: string; // Khám nha khoa
}

export interface School {
  id: string; // UUID của Supabase
  school_id?: string; // ID nội bộ (toda-shimotoda-01)

  // A. Thông tin cơ bản
  name: string;
  category: SchoolCategory; // Logic App (Màu marker)
  school_type?: string; // Hiển thị (認可保育園, 公立...)
  operator?: string; // Đơn vị vận hành
  established_year?: number;
  capacity_total?: number;

  // B. Vị trí & Giao thông
  address: string;
  area?: string; // Khu vực (Hạ tiền, Bijogi...)
  lat: number;
  lng: number;
  nearest_station?: string;
  walk_minutes_station?: number;
  bus_access?: string;

  // C. Thời gian
  open_time_weekday?: string;
  open_time_saturday?: string;
  has_extended_care?: boolean;
  extended_hours?: string; // Chi tiết giờ làm thêm (dữ liệu cũ)
  latest_pickup_time?: string;

  // D. Định viên (Chi tiết)
  age_capacity?: AgeCapacity; // JSONB

  // E. Cơ sở vật chất
  facility_info?: FacilityInfo; // JSONB
  special_support?: string; // Hỗ trợ trẻ đặc biệt (Text)

  // F. Triết lý & Hoạt động
  philosophy?: string;
  annual_events?: string[]; // Array Text
  community_programs?: string[]; // Array Text
  medical_info?: MedicalInfo; // JSONB
  staff_info?: StaffInfo; // JSONB

  // Các trường cũ giữ lại
  tags: string[];
  image_url?: string;
  website_url?: string;
  notes?: string;
  ranking?: number | null;
  marker_color?: string;

  created_at?: string;

  // Routing (Frontend only)
  routing?: {
    distanceText: string;
    durationText: string;
    durationValue: number;
  };
}
