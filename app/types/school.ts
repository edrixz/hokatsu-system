// app/types/school.ts

export type SchoolCategory =
  | "Home"
  | "Work"
  | "Public"
  | "Private"
  | "Certified"
  | "Unlicensed"
  | "SmallScale"
  | "Company";

// B. Quy mô và Định biên (Capacity)
export interface CapacityInfo {
  total?: number;
  age_0?: number;
  age_1?: number;
  age_2?: number;
  age_3?: number;
  age_4?: number;
  age_5?: number;
  notes?: string;
}

// C. Nhân sự (Staffing)
export interface StaffInfo {
  director_count?: number;
  chief_count?: number;
  teacher_count?: number;
  nurse_count?: number;
  support_staff_count?: number;
  nutritionist_count?: number;
  cook_count?: number;
  admin_count?: number;
  utility_staff_count?: number;
  others?: string[];
}

// D. Thời gian hoạt động
export interface OperatingHours {
  open_days?: string;
  closed_days?: string;
  standard_hours?: string;
  short_hours?: string;
  saturday_hours?: string;
}

// E. Dịch vụ đặc biệt
export interface SpecialServices {
  has_extended_care?: boolean;
  extended_care_hours?: string;
  has_special_needs_care?: boolean;
  has_temporary_care?: boolean;
  has_support_center?: boolean;
  notes?: string;
}

// F. Chi phí
export interface FeeInfo {
  basic_fee?: string;
  extended_care_fee_monthly?: string;
  extended_care_fee_hourly?: string;
  food_fee_main?: string;
  food_fee_snack?: string;
  supplies_fee?: string;
}

// G. Y tế & An toàn
export interface MedicalSafetyInfo {
  school_doctor?: string;
  school_dentist?: string;
  insurance_info?: string;
  evacuation_site?: string;
  has_aed?: boolean;
  internal_checkup?: string; // Dùng cho hiển thị nhanh
}

// H. Tiện ích & Cơ sở vật chất
export interface FacilityInfo {
  building_structure?: string;
  total_floor_area?: string;
  parking_info?: string;
  preparation_list?: string;
  has_hall?: boolean;
  has_kitchen?: boolean;
  playground_desc?: string;
}

// === MAIN SCHOOL INTERFACE ===
export interface School {
  id: string;

  // A. Thông tin cơ bản
  name: string;
  category: SchoolCategory;
  school_type?: string;
  operator?: string;
  established_year?: number;
  established_date?: string; // Có thể dùng string cho ngày tháng năm đầy đủ
  director_name: string;

  // B. Vị trí & Giao thông
  address: string;
  lat: number;
  lng: number;
  nearest_station?: string; // [FIX LỖI] Đã thêm trường này
  walk_minutes_station?: number; // [FIX LỖI] Đã thêm trường này
  bus_access?: string;

  // C. Thời gian (Flatten fields nếu cần thiết, hoặc dùng trong JSONB)
  open_time_weekday?: string;
  open_time_saturday?: string;
  has_extended_care?: boolean;
  latest_pickup_time?: string;

  // JSONB Data
  capacity_info: CapacityInfo;
  staff_info: StaffInfo;
  operating_hours: OperatingHours;
  special_services: SpecialServices;
  fee_info: FeeInfo;
  medical_safety_info: MedicalSafetyInfo; // [FIX] Dùng medical_safety_info thay vì medical_info
  facility_info: FacilityInfo;

  // Metadata khác
  philosophy?: string;
  annual_events?: string[];
  community_programs?: string[];

  // Trường cũ
  image_url?: string;
  website_url?: string;
  notes?: string;
  tags: string[];
  ranking: number | null;
  marker_color?: string;
  created_at?: string;

  // Routing
  routing?: {
    distanceText: string;
    durationText: string;
    durationValue: number;
  };
}
