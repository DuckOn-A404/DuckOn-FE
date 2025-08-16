import axios from "axios";
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
  try {
    const { data } = await api.post<TranslateResponse>(
      "/translate",
      { message, language } satisfies TranslateRequest
      // timeout 옵션은 인터셉터에서 /translate만 50s로 설정됨
    );

    if (!data?.translatedMessage) {
      throw new Error("NO_RESULT");
    }
    return data.translatedMessage;
  } catch (err: any) {
    if (axios.isAxiosError(err)) {
      // 요청 타임아웃 (ECONNABORTED)
      if (err.code === "ECONNABORTED") {
        throw new Error("TIMEOUT");
      }
      // 인증 실패 (리프레시까지 실패했을 때 여기로 떨어짐)
      if (err.response?.status === 401) {
        throw new Error("UNAUTHORIZED");
      }
    }
    // 그 외 알 수 없는 오류
    throw new Error("UNKNOWN");
  }
}
