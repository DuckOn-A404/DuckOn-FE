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
    {
      message,
      language,
    } satisfies TranslateRequest,
    { timeout: 15000 }
  );

  if (!data?.translatedMessage) {
    throw new Error("번역 결과가 없습니다.");
  }
  return data.translatedMessage;
}
