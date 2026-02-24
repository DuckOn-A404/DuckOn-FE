import { api } from "../api/axiosInstance";

export type UploadPurpose =
  | "ARTIST_CHANGE"
  | "ARTIST_IMAGE_TEMP"
  | "REPORT"
  | "FEEDBACK";

export async function uploadImage({
  file,
  purpose,
  refId,
}: {
  file: File;
  purpose: UploadPurpose;
  refId?: number | null;
}): Promise<{ fileUrl: string; key: string }> {
  // 1) Presigned URL 발급
  const presignRes = await api.post("/uploads/presign", {
    purpose,
    refId,
    contentType: file.type,
    filename: file.name,
  });

  const { uploadUrl, fileUrl, key } = presignRes.data.data;

  // 2) S3로 직접 PUT
  const putRes = await fetch(uploadUrl, {
    method: "PUT",
    headers: { "Content-Type": file.type },
    body: file,
  });

  if (!putRes.ok) throw new Error(`S3 업로드 실패: ${putRes.status}`);

  return { fileUrl, key };
}