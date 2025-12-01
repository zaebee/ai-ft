

export enum RoleEnum {
  AUTO = "AUTO",
  ADMIN = "ADMIN",
  OWNER = "OWNER",
  RIDER = "RIDER"
}

export enum VehicleStatus {
  FREE = 0,
  COLLECTED = 1,
  ARCHIVED = 2,
  MAINTENANCE = 3,
  DRAFT = 4
}

export interface Token {
  access_token: string;
  token_type: string;
  refresh_token?: string | null;
}

export interface UserPublic {
  id: string;
  email: string;
  full_name?: string | null;
  role: RoleEnum;
  avatar?: string | null;
}

export interface ImagePreviews {
  xs?: string;
  s?: string;
  m?: string;
  l?: string;
  [key: string]: string | undefined;
}

export interface Picture {
  cover?: string;
  extra?: string[];
  cover_previews?: ImagePreviews;
  extra_previews?: Record<string, { previews: ImagePreviews }>;
}

export interface PriceConversion {
  amount: number;
  currency: string;
  rate: number;
  valid_until: string;
}

export interface Vehicle {
  id: string;
  name: string;
  owner_id: string;
  status: VehicleStatus;
  price: number;
  currency: string;
  
  // Detailed pricing fields
  minimal_price?: number;
  price_conversions?: Record<string, PriceConversion>;
  minimal_price_conversions?: Record<string, PriceConversion>;
  price_template_id?: string;
  created_at?: string;
  updated_at?: string;
  extra_option_ids?: string[];

  picture?: Picture;
  general_info?: {
    brand?: string;
    model?: string;
    year?: number;
    color?: string;
  };
  specification_info?: {
    transmission?: string;
    fuel_type?: string;
    number_of_seats?: number;
  };
}

export interface Reservation {
  id: string;
  vehicle_id: string;
  date_from: string;
  date_to: string;
  total_price: number;
  status: number; // Simplified for this demo
  vehicle?: Vehicle;
}

export interface Currency {
  currency: string;
  symbol: string;
  name: string;
}

export interface Rate {
  base_currency: string;
  target_currency: string;
  rate: number;
  inverse_rate: number;
  timestamp: string;
  symbol: string;
  name: string;
}

export interface RateResponse {
  rates: Rate[];
}

export interface SelectedExtraOptions {
  ids: string[];
}

export interface CreateReservationRequest {
  vehicle_id: string;
  rider_id: string;
  date_from: string;
  date_to: string;
  pick_up_time?: string;
  drop_off_time?: string;
  selected_extra_options?: SelectedExtraOptions;
}

export interface LoginResponse extends Token {}

export interface ApiError {
  detail: string | Array<{ msg: string; loc: any[] }>;
}

export enum ExtraOptionPriceType {
  PER_RENTAL = 0,
  PER_DAY = 1
}

export interface ExtraOption {
  id: string;
  name: string;
  description?: string;
  price: number;
  currency: string; // The currency this price is defined in
  price_type: ExtraOptionPriceType;
  owner_id: string;
  vehicle_ids?: string[];
}

export interface ListExtraOptionsResponse {
  extra_options: ExtraOption[];
}

export interface BookedDateRange {
  start: string; // ISO Date
  end: string;   // ISO Date
  status: 'booked' | 'maintenance';
}

export interface AvailabilityResponse {
  blocked_dates: BookedDateRange[];
}