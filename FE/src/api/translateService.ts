import { api } from "./axiosInstance";

export type TranslateRequest = {
  message: string;
  language: string;
};

export type TranslateResponse = {
  translatedMessage: string;
};

export async function translateMessage(
  message: string,
  language: string = "ko"
): Promise<string> {
  const { data } = await api.post<TranslateResponse>(
    "/translate",
    { message, language } satisfies TranslateRequest
    // timeout 옵션 제거 — 인터셉터에서 /translate만 50s로 설정됨
  );

  if (!data?.translatedMessage) {
    throw new Error("번역 결과가 없습니다.");
  }
  return data.translatedMessage;
}
