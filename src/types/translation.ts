export interface ChatTranslateRequestDTO {
  text: string;              // 번역할 원문
  senderLang?: string;       // 보낸 사람의 언어 (선택)
  targetLang?: string;       // 목표 언어 (선택, 없으면 사용자 기본 언어 사용)
}

export interface ChatTranslateResponseDTO {
  originalText: string;      // 원본 텍스트
  sourceLang: string;        // 감지된 실제 언어 (ISO 639-1)
  targetLang: string;        // 번역된 언어
  translatedText: string;    // 번역 결과
}
