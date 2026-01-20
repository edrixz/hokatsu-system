// types/school.ts

export type SchoolCategory =
  | "Home"
  | "Work"
  | "Public"
  | "Private"
  | "SmallScale"
  | "Unlicensed"
  | "Company";

export interface AgeGroupData {
  age_0?: number;
  age_1?: number;
  age_2?: number;
  age_3?: number;
  age_4_5?: number;
  total?: number;
  updated_at?: string;
}

export interface School {
  id: string;
  name: string;
  address: string;
  lat: number;
  lng: number;

  category: SchoolCategory;
  marker_color: string;
  ranking: number | null;

  // JSONB Data
  capacity_info: AgeGroupData;
  vacancy_info: AgeGroupData;

  // Details
  min_age_months?: number;
  opening_hours?: string;
  extended_hours?: string;
  tags: string[];
  image_url?: string;
  website_url?: string;
  notes?: string;

  created_at?: string;

  // Virtual Fields (Frontend Only - dùng sau này)
  routing?: {
    distanceText: string;
    durationText: string;
    durationValue: number;
  };
}
