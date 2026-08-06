import {
  AssetDto,
  AssetFormValues,
  AssetViewModel,
  AssetWritePayload,
  BoardDto,
  BoardFormValues,
  BoardViewModel,
  BoardWritePayload,
  BrandDto,
  BrandFormValues,
  BrandViewModel,
  BrandWritePayload,
  ModelPersonDto,
  ModelPersonFormValues,
  ModelPersonViewModel,
  ModelPersonWritePayload,
  ProductDto,
  ProductFormValues,
  ProductViewModel,
  ProductWritePayload,
  ShootDto,
  ShootFormValues,
  ShootViewModel,
  ShootWritePayload,
  UserDto,
  UserFormValues,
  UserViewModel,
  UserWritePayload,
} from "@/shared/types/domain";
import { buildApiUrl } from "./api";

const toNullable = <T>(value: T | undefined | null): T | null =>
  value === undefined ? null : (value as T | null);

const normalizeId = (raw: any): string | undefined => {
  if (!raw) return undefined;
  if (typeof raw === "string") return raw;
  if (typeof raw === "object" && raw !== null && "$oid" in raw) {
    const oid = (raw as any).$oid;
    return typeof oid === "string" ? oid : String(oid);
  }
  return String(raw);
};

// Helper to convert relative URLs to absolute
// Also maps Linux server paths to the correct /media/* URL
function toAbsoluteUrl(url: string | null | undefined): string {
  if (!url) return "";
  
  // If already absolute (http/https), return as-is
  if (url.startsWith("http://") || url.startsWith("https://")) {
    return url;
  }

  // Map known Docker/Linux paths to the /media route
  if (url.includes("/app/media/")) {
    return url.replace(/.*\/app\/media\//, "/media/");
  }
  
  if (url.includes("/data/kalaios-upload/media/")) {
    return url.replace(/.*\/data\/kalaios-upload\/media\//, "/media/");
  }

  // If path starts with /media/, return as-is (browsers/proxies handle it)
  if (url.startsWith("/media/")) {
    return url;
  }

  // For other relative paths (API endpoints), prepend API base URL
  if (url.startsWith("/")) {
    return buildApiUrl(url);
  }
  // If no leading slash, add it (assume it's an API path)
  return buildApiUrl(`/${url}`);
}

// ---------- Asset ----------
export function mapAssetDtoToViewModel(dto: AssetDto): AssetViewModel {
  const ext = dto.filename.split(".").pop()?.toLowerCase();
  const isVideo = ["mp4", "mov", "webm", "avi", "mkv"].includes(ext || "");
  const type = isVideo ? "video" : "image";

  // Defensive check: Ensure we NEVER use thumbnail_path (backend should have converted it)
  // If thumbnail_path exists but thumbnail_url doesn't, log a warning
  if ((dto as any).thumbnail_path && !dto.thumbnail_url) {
    console.warn(
      "[Asset Mapper] Found thumbnail_path but no thumbnail_url. " +
      "Backend should normalize paths. Falling back to file_path.",
      { assetId: dto.id, thumbnail_path: (dto as any).thumbnail_path }
    );
  }

  // For videos, prioritize lowres_preview_url (the actual video file)
  // For images, prioritize thumbnail_url (the preview image)
  // IMPORTANT: Always use thumbnail_url, never thumbnail_path
  const rawUrl = isVideo
    ? dto.lowres_preview_url ?? dto.file_path ?? dto.thumbnail_url ?? ""
    : dto.thumbnail_url ?? dto.lowres_preview_url ?? dto.file_path ?? "";
  const url = toAbsoluteUrl(rawUrl);

  // Thumbnail URL for videos (static image for initial display)
  // Always use thumbnail_url field (never thumbnail_path)
  const thumbnailUrl = isVideo && dto.thumbnail_url
    ? toAbsoluteUrl(dto.thumbnail_url)
    : undefined;

  // For downloads, use original_path if available (the actual file location),
  // otherwise use file_path converted to URL
  // For copy path, use original_path (the actual filesystem path from upload)
  const originalFilePath = dto.original_path
    ? buildApiUrl(`/assets/${normalizeId(dto.id)}/download`) // Use download endpoint
    : (dto.file_path ? toAbsoluteUrl(dto.file_path) : undefined);
  // Only use original_path for the copy path button (actual filesystem path)
  // Don't fall back to file_path as that might be a URL
  const originalPathForCopy = dto.original_path || "";

  return {
    id: normalizeId(dto.id) ?? "",
    title: dto.filename ?? "",
    type,
    url,
    thumbnailUrl, // Static thumbnail for video initial display
    filePath: originalFilePath, // Download URL (endpoint that serves original file)
    originalPath: originalPathForCopy, // Original folder path for copy path button
    shootId: normalizeId(dto.shoot_id),
    productId: normalizeId(dto.product_id),
    modelIds: dto.model_ids
      ?.map((id) => normalizeId(id))
      .filter((id): id is string => Boolean(id)),
    brandId: normalizeId(dto.brand_id) ?? "",
    inferencesText: dto.inferences_text ?? undefined,
    dto,
  };
}

export function mapAssetFormToPayload(
  form: AssetFormValues
): AssetWritePayload {
  return {
    brand_id: form.brandId,
    product_id: toNullable(form.productId),
    shoot_id: toNullable(form.shootId),
    model_ids: form.modelIds?.length ? form.modelIds : null,
    filename: form.filename || form.title || "untitled",
    file_path: form.file_path || form.url || "",
    thumbnail_url: form.url,
    lowres_preview_url: form.url,
    custom_attributes: form.customAttributes ?? null,
    inferences_text: form.inferencesText ?? null,
    is_archived: form.isArchived ?? false,
    original_brand_id: null,
  };
}

// ---------- Board ----------
export function mapBoardDtoToViewModel(dto: BoardDto | any): BoardViewModel {
  const rawId = dto?.id ?? dto?._id ?? "";
  const id =
    typeof rawId === "string"
      ? rawId
      : typeof rawId === "object" && rawId !== null && "$oid" in rawId
      ? String((rawId as any).$oid)
      : String(rawId ?? "");
  return {
    id,
    name: dto.name,
    brandId: dto.brand_id,
    assetIds: dto.asset_ids ?? [],
    assetCount: dto.asset_count ?? dto.asset_ids?.length ?? 0,
    createdAt: dto.created_at,
    updatedAt: dto.updated_at,
  };
}

export function mapBoardFormToPayload(
  form: BoardFormValues
): BoardWritePayload {
  return {
    name: form.name,
    brand_id: form.brandId,
    asset_ids: form.assetIds ?? [],
  };
}

// ---------- Brand ----------
export function mapBrandDtoToViewModel(dto: BrandDto): BrandViewModel {
  return {
    id: dto.id,
    name: dto.name,
    icon: dto.icon ?? undefined,
    description: dto.description ?? undefined,
    createdAt: dto.created_at,
    updatedAt: dto.updated_at,
    dto,
  };
}

export function mapBrandFormToPayload(
  form: BrandFormValues
): BrandWritePayload {
  return {
    name: form.name,
    description: form.description ?? null,
    icon: form.icon ?? null,
  };
}

// ---------- Model / Person ----------
export function mapModelPersonDtoToViewModel(
  dto: ModelPersonDto
): ModelPersonViewModel {
  return {
    id: dto.id,
    name: dto.name,
    location: dto.location ?? undefined,
    brandId: dto.brand_id,
    assetsCount: dto.asset_count ?? 0,
    assetsBreakdown: dto.asset_counts_breakdown ?? { image: 0, video: 0 },
    createdAt: dto.created_at,
    updatedAt: dto.updated_at,
    dto,
  };
}

export function mapModelPersonFormToPayload(
  form: ModelPersonFormValues
): ModelPersonWritePayload {
  return {
    name: form.name,
    location: form.location ?? null,
    brand_id: form.brandId,
  };
}

// ---------- Product ----------
export function mapProductDtoToViewModel(dto: ProductDto): ProductViewModel {
  return {
    id: dto.id,
    name: dto.name,
    brandId: dto.brand_id,
    url: dto.shopify_url ?? undefined,
    description: dto.description ?? undefined,
    assetsCount: dto.asset_count ?? 0,
    assetsBreakdown: dto.asset_counts_breakdown ?? { image: 0, video: 0 },
    createdAt: dto.created_at,
    updatedAt: dto.updated_at,
    dto,
  };
}

export function mapProductFormToPayload(
  form: ProductFormValues
): ProductWritePayload {
  return {
    name: form.name,
    brand_id: form.brandId,
    description: form.description ?? null,
    shopify_url: form.url ?? null,
  };
}

// ---------- Shoot ----------
export function mapShootDtoToViewModel(dto: ShootDto): ShootViewModel {
  const id = normalizeId(dto.id ?? (dto as any)._id) ?? "";
  const brandId = normalizeId(dto.brand_id) ?? "";
  return {
    id,
    details: dto.name ?? "",
    location: dto.location ?? undefined,
    shotBy: dto.shot_by ?? undefined,
    brandId,
    assetsCount: dto.asset_count ?? 0,
    assetsBreakdown: dto.asset_counts_breakdown ?? { image: 0, video: 0 },
    createdAt: dto.created_at,
    updatedAt: dto.updated_at,
    dto,
  };
}

export function mapShootFormToPayload(
  form: ShootFormValues
): ShootWritePayload {
  return {
    name: form.details,
    brand_id: form.brandId,
    location: form.location ?? null,
    shot_by: form.shotBy ?? null,
  };
}

// ---------- User ----------
export function mapUserDtoToViewModel(dto: UserDto): UserViewModel {
  return {
    id: dto.id,
    username: dto.username,
    email: dto.email,
    role: dto.role,
    createdAt: dto.created_at,
    updatedAt: dto.updated_at,
    dto,
  };
}

export function mapUserFormToPayload(form: UserFormValues): UserWritePayload {
  return {
    username: form.username,
    email: form.email,
    password: form.password ?? "",
    role: form.role,
  };
}
