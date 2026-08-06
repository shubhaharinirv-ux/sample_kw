// Centralized backend DTO and frontend view model definitions.
// DTOs mirror the FastAPI/Pydantic schemas exactly; view models preserve the
// shapes currently consumed by the React components.

// (Removed AssetMetadataDto, AssetCameraInfoDto, AssetInferencesDto)

export interface AssetDto {
  id: string;
  brand_id: string;
  product_id?: string | null;
  shoot_id?: string | null;
  model_ids?: string[] | null;
  filename: string;
  file_path: string;
  original_path?: string | null; // Original folder path where file was uploaded from
  thumbnail_url?: string | null;
  lowres_preview_url?: string | null;
  custom_attributes?: Record<string, string> | null;
  inferences_text?: string | null;
  is_archived: boolean;
  original_brand_id?: string | null;
  created_at: string;
  updated_at: string;
}

export interface AssetViewModel {
  id: string;
  title: string;
  type: "video" | "image";
  url: string; // Preview/display URL (thumbnail for images, lowres for videos)
  thumbnailUrl?: string; // Static thumbnail image URL (for video initial display)
  filePath?: string; // Download URL (endpoint that serves original file)
  originalPath?: string; // Original folder path for copy path button
  shoot?: string;
  product?: string;
  brandId?: string;
  shootId?: string;
  productId?: string;
  modelIds?: string[];
  inferencesText?: string;
  dto?: AssetDto;
}

export interface AssetFormValues {
  id?: string;
  title?: string;
  filename?: string;
  file_path?: string;
  brandId: string;
  productId?: string | null;
  shootId?: string | null;
  modelIds?: string[] | null;
  url?: string;
  type?: "video" | "image";
  isArchived?: boolean;
  customAttributes?: Record<string, string> | null;
  inferencesText?: string | null;
}

export interface AssetWritePayload {
  brand_id: string;
  product_id?: string | null;
  shoot_id?: string | null;
  model_ids?: string[] | null;
  filename: string;
  file_path: string;
  thumbnail_url?: string | null;
  lowres_preview_url?: string | null;
  custom_attributes?: Record<string, string> | null;
  inferences_text?: string | null;
  is_archived?: boolean;
  original_brand_id?: string | null;
}

// ---------- Board ----------
export interface BoardDto {
  id?: string;
  _id?: string;
  name: string;
  brand_id: string;
  asset_ids: string[];
  asset_count?: number;
  created_at?: string;
  updated_at?: string;
}

export interface BoardViewModel {
  id: string;
  name: string;
  brandId: string;
  assetIds: string[];
  assetCount?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface BoardFormValues {
  id?: string;
  name: string;
  brandId: string;
  assetIds?: string[];
}

export interface BoardWritePayload {
  name: string;
  brand_id: string;
  asset_ids?: string[];
}

// ---------- Brand ----------
export interface BrandDto {
  id: string;
  name: string;
  icon?: string | null;
  description?: string | null;
  is_deleted: boolean;
  created_at: string;
  updated_at: string;
}

export interface BrandViewModel {
  id: string;
  name: string;
  icon?: string;
  description?: string;
  createdAt?: string;
  updatedAt?: string;
  dto?: BrandDto;
}

export interface BrandFormValues {
  id?: string;
  name: string;
  description?: string;
  icon?: string;
}

export interface BrandWritePayload {
  name: string;
  description?: string | null;
  icon?: string | null;
}

// ---------- Model / Person ----------
export interface ModelPersonDto {
  id: string;
  name: string;
  location?: string | null;
  brand_id: string;
  asset_count?: number;
  asset_counts_breakdown?: { image: number; video: number };
  created_at: string;
  updated_at: string;
}

export interface ModelPersonViewModel {
  id: string;
  name: string;
  location?: string;
  brandId: string;
  product?: string;
  assetsCount?: number;
  assetsBreakdown?: { image: number; video: number };
  createdAt?: string;
  updatedAt?: string;
  dto?: ModelPersonDto;
}

export interface ModelPersonFormValues {
  id?: string;
  name: string;
  location?: string;
  brandId: string;
  product?: string;
}

export interface ModelPersonWritePayload {
  name: string;
  location?: string | null;
  brand_id: string;
}

// ---------- Product ----------
export interface ProductDto {
  id: string;
  brand_id: string;
  name: string;
  description?: string | null;
  shopify_url?: string | null;
  asset_count?: number;
  asset_counts_breakdown?: { image: number; video: number };
  created_at: string;
  updated_at: string;
}

export interface ProductViewModel {
  id: string;
  name: string;
  brandId: string;
  url?: string;
  description?: string;
  assetsCount?: number;
  assetsBreakdown?: { image: number; video: number };
  createdAt?: string;
  updatedAt?: string;
  dto?: ProductDto;
}

export interface ProductFormValues {
  id?: string;
  name: string;
  brandId: string;
  url?: string;
  description?: string;
}

export interface ProductWritePayload {
  name: string;
  brand_id: string;
  description?: string | null;
  shopify_url?: string | null;
}

// ---------- Shoot ----------
export interface ShootDto {
  id: string;
  _id?: string;
  brand_id: string;
  name: string;
  location?: string | null;
  shot_by?: string | null;
  asset_count?: number;
  asset_counts_breakdown?: { image: number; video: number };
  created_at: string;
  updated_at: string;
}

export interface ShootViewModel {
  id: string;
  details: string;
  location?: string;
  shotBy?: string;
  brandId: string;
  assetsCount?: number;
  assetsBreakdown?: { image: number; video: number };
  createdAt?: string;
  updatedAt?: string;
  dto?: ShootDto;
}

export interface ShootFormValues {
  id?: string;
  details: string;
  location?: string;
  shotBy?: string;
  brandId: string;
}

export interface ShootWritePayload {
  name: string;
  brand_id: string;
  location?: string | null;
  shot_by?: string | null;
}

// ---------- User / Auth ----------
export type Role = "admin" | "manager" | "user";

export interface UserDto {
  id: string;
  email: string;
  role: Role;
  name?: string;
  created_at: string;
  updated_at: string;
}

export interface UserViewModel {
  id: string;
  email: string;
  role: Role;
  name?: string;
  createdAt?: string;
  updatedAt?: string;
  dto?: UserDto;
}

export interface UserFormValues {
  id?: string;
  email: string;
  password?: string;
  role: Role;
  name?: string;
}

export interface UserWritePayload {
  email: string;
  password: string;
  role: Role;
  name?: string;
}

export interface AuthResponseDto {
  access_token: string;
  token_type: string;
  refresh_token: string;
  user: UserDto;
}

export interface AuthCredentials {
  email: string;
  password: string;
}
