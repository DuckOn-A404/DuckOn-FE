// 회원가입 폼 데이터 타입
export interface SignupData {
  email: string;
  userId: string;
  password: string;
  nickname: string;
  language: string;
  profileImg: File | null;
}
