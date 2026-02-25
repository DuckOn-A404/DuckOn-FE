import { api } from "./axiosInstance";

export interface ArtistChangeRequestCreateRequest {
  targetType: "ARTIST" | "EMERGING_ARTIST";
  targetId: number;
  content: string;
  attachment?: string;
}

export interface ArtistChangeRequestCreateResponse {
  status: number;
  message: string;
  data: string;
}

export const createArtistChangeRequest = async (
  requestData: ArtistChangeRequestCreateRequest
): Promise<ArtistChangeRequestCreateResponse> => {
  const response = await api.post("/artist-change-requests", requestData, {
    headers: {
      "Content-Type": "application/json",
    },
  });
  return response.data;
};

export interface ArtistChangeRequestItem {
  id: number;
  targetType: "ARTIST" | "EMERGING_ARTIST";
  targetId: number;
  artistNameEn: string;
  artistNameKr: string;
  content: string;
  attachment: string | null;
  status: "PENDING" | "APPROVED" | "REJECTED";
}

export interface ArtistChangeRequestListResponse {
  status: number;
  message: string;
  data: {
    page: number;
    size: number;
    totalElements: number;
    totalPages: number;
    items: ArtistChangeRequestItem[];
  };
}

export const getMyArtistChangeRequests = async (params: {
  page?: number;
  size?: number;
}): Promise<ArtistChangeRequestListResponse> => {
  const response = await api.get("/artist-change-requests/me", {
    params: {
      page: params.page ?? 1,
      size: params.size ?? 10,
    },
  });
  return response.data;
};

// 관리자용

export interface AdminArtistChangeRequestItem {
  id: number;
  targetType: "ARTIST" | "EMERGING_ARTIST";
  targetId: number;
  artistNameEn: string;
  artistNameKr: string;
  content: string;
  attachment: string | null;
  status: "PENDING" | "APPROVED" | "REJECTED" | "CANCELED" | "APPLIED";
  requestedByUserId: number;
  requestedAt: string;
}

export interface AdminArtistChangeRequestListResponse {
  status: number;
  message: string;
  data: {
    page: number;
    size: number;
    totalElements: number;
    totalPages: number;
    items: AdminArtistChangeRequestItem[];
  };
}

export interface AdminArtistChangeRequestDetailResponse {
  status: number;
  message: string;
  data: {
    id: number;
    targetType: "ARTIST" | "EMERGING_ARTIST";
    targetId: number;
    artistNameEn: string;
    artistNameKr: string;
    content: string;
    attachment: string | null;
    status: "PENDING" | "APPROVED" | "REJECTED" | "CANCELED" | "APPLIED";
    requester: {
      id: number;
      userId: string;
      nickname: string;
      role: string;
      imgUrl: string;
    };
    createdAt: string;
    updatedAt: string;
    reviewedBy: {
      id: number;
      userId: string;
      nickname: string;
      role: string;
      imgUrl: string;
    } | null;
  };
}

export interface UpdateArtistChangeRequestRequest {
  action: "APPROVE" | "REJECT";
  reviewComment: string;
}

export const getAdminArtistChangeRequests = async (params: {
  page?: number;
  size?: number;
}): Promise<AdminArtistChangeRequestListResponse> => {
  const response = await api.get("/admin/artist-change-requests", {
    params: {
      page: params.page ?? 1,
      size: params.size ?? 10,
    },
  });
  return response.data;
};

export const getAdminArtistChangeRequestDetail = async (
  requestId: number
): Promise<AdminArtistChangeRequestDetailResponse> => {
  const response = await api.get(`/admin/artist-change-requests/${requestId}`);
  return response.data;
};

export const updateArtistChangeRequestStatus = async (
  requestId: number,
  updateData: UpdateArtistChangeRequestRequest
): Promise<{ status: number; message: string; data: string }> => {
  const response = await api.patch(
    `/admin/artist-change-requests/${requestId}`,
    updateData
  );
  return response.data;
};