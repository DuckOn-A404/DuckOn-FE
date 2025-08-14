export type LanguageOption = {
  langCode: string;
  langName: string;
};

// 전체 언어 목록 가져오기
export const fetchLanguages = async (): Promise<LanguageOption[]> => {
  try {
    const response = await fetch("/data/languages.json");
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("언어 데이터를 불러오지 못했습니다.", error);
    return [];
  }
};

// 특정 코드로 언어 이름 가져오기
export const getLanguageName = async (code: string): Promise<string> => {
  const languages = await fetchLanguages();
  const match = languages.find((lang) => lang.langCode === code);
  return match?.langName ?? code;
};
