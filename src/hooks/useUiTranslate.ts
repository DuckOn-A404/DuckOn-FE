// src/hooks/useUiTranslate.ts
import { useUserStore } from "../store/useUserStore";
import { UI_STRINGS, type LangCode } from "../i18n/uiStrings";

/** language 문자열을 LangCode로 정규화 */
function normalizeLang(raw?: string): LangCode {
  if (!raw) return "ko";

  const lower = raw.toLowerCase();

  if (lower.startsWith("en")) return "en";
  if (lower.startsWith("ja")) return "ja";
  if (lower.startsWith("zh")) return "zh";
  if (lower.startsWith("es")) return "es";
  if (lower.startsWith("fr")) return "fr";
  if (lower.startsWith("ko")) return "ko";

  // 모르면 기본 한국어
  return "ko";
}

export function useUiTranslate() {
  const myUser = useUserStore((s) => s.myUser);

  // 1순위: 로그인 유저의 주언어
  // 2순위: 브라우저 언어
  // 3순위: ko
  const lang: LangCode = normalizeLang(
    myUser?.language ?? (typeof navigator !== "undefined" ? navigator.language : "ko"),
  );

  const t = (key: string, fallback?: string): string => {
    const dict = UI_STRINGS[lang] || UI_STRINGS.ko;
    const koDict = UI_STRINGS.ko;

    // 1) 현재 언어에 해당 key가 있으면 그거 사용
    if (dict && dict[key]) return dict[key];

    // 2) 없으면 한국어 기본값 있나 확인
    if (koDict && koDict[key]) return koDict[key];

    // 3) 호출부에서 넘겨준 fallback 있으면 그거 사용
    if (fallback) return fallback;

    // 4) 그래도 없으면 key 그대로 노출 (디버깅용)
    return key;
  };

  return { t, lang };
}
