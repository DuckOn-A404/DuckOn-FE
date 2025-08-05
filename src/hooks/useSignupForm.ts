import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { type SignupData } from "../types/auth";
import {
  postSignup,
  checkEmailExists,
  checkUserIdExists,
} from "../api/authService";

/* 
- SignupFormData 
  - 백엔드로 보낼 SignupData + 비밀번호 확인 value 
  - 통신할 데이터랑 사용자에게 받을 폼 데이터를 분리하기 위함
*/
type SignupFormData = SignupData & {
  passwordConfirm: string;
};

/* 
  useSignupForm : 회원가입 폼, 중복확인 로직 관리 커스텀 훅
  1. 폼 상태 관리 (이메일, 아이디, 비밀번호 등 입력 값과 프로필 이미지)
  2. 각 입력 필드에 대한 중복 확인 (이메일, 아이디)
  3. 비밀번호 확인 유효성 검사
  4. 최종 회원가입 제출 처리
  5. 각 중복확인 결과 및 에러 메시지 상태 관리
*/
export const useSignupForm = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState<SignupFormData>({
    email: "",
    userId: "",
    password: "",
    passwordConfirm: "",
    nickname: "",
    language: "",
    profileImg: null,
  });

  // 각 필드의 에러 메시지 상태
  const [emailError, setEmailError] = useState("");
  const [userIdError, setUserIdError] = useState("");

  // 각 필드의 성공 메시지 상태
  const [emailSuccess, setEmailSuccess] = useState("");
  const [userIdSuccess, setUserIdSuccess] = useState("");

  // 각 필드의 중복확인 완료 상태
  const [emailChecked, setEmailChecked] = useState(false);
  const [userIdChecked, setUserIdChecked] = useState(false);

  // 전체 폼 전송 상태
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 비밀번호 일치 상태
  const [passwordConfirmError, setPasswordConfirmError] = useState("");
  // 비밀번호 8자리 이상
  const [passwordError, setPasswordError] = useState("");

  // 입력 값 변경 핸들러
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (name === "email") {
      setEmailError("");
    } else if (name === "userId") {
      setUserIdError("");
    } else if (name === "passwordConfirm") {
      setPasswordConfirmError(
        value !== formData.password ? "비밀번호가 일치하지 않습니다." : ""
      );
    } else if (name === "password") {
      // 8자리 미만이면 에러 메시지 설정, 이상이면 빈 문자열로 초기화
      if (value.length > 0 && value.length < 8) {
        setPasswordError("8자리 이상 입력해 주세요.");
      } else {
        setPasswordError("");
      }

      setPasswordConfirmError(
        formData.passwordConfirm && value !== formData.passwordConfirm
          ? "비밀번호가 일치하지 않습니다."
          : ""
      );
    }
  };

  // 프로필 이미지 업로드 핸들러
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFormData((prev) => ({ ...prev, profileImg: file }));
    }
  };

  // 회원가입 폼 제출 핸들러
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (formData.password.length < 8) {
      setPasswordError("비밀번호는 8자리 이상이어야 합니다.");
      setError("입력 값을 다시 확인해주세요.");
      return;
    }

    // 비밀번호 확인 검사
    if (formData.password !== formData.passwordConfirm) {
      setError(passwordConfirmError);
      setLoading(false);
      return;
    }

    try {
      const { passwordConfirm, ...rest } = formData;
      // 🔧 FormData로 변환
      const form = new FormData();
      console.log("사용자가 친 값", formData);

      Object.entries(rest).forEach(([key, value]) => {
        if (value === null || value === undefined) return;

        if (value instanceof File) {
          form.append(key, value);
        } else {
          form.append(key, String(value));
        }
      });

      // 확인용
      console.log("FormData entries 확인:", [...form.entries()]);

      await postSignup(form);
      alert("회원가입이 완료되었습니다.");
      navigate("/login");
    } catch (err: any) {
      // 확인용 콘솔
      console.error("회원가입 오류:", err);
      setError(err.response?.data?.message || "오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  };

  // 이메일 중복 확인 핸들러
  const handleCheckEmail = async () => {
    setEmailError("");
    setEmailSuccess("");

    if (!formData.email) {
      console.log(formData.email);
      setEmailError("이메일을 입력해주세요.");
      return;
    }
    try {
      const res = await checkEmailExists(formData.email);
      setEmailChecked(true);
      if (res.isDuplicate) {
        setEmailError("이미 사용 중인 이메일입니다.");
      } else {
        setEmailSuccess("사용 가능한 이메일입니다.");
      }
    } catch (err) {
      setEmailError("중복 확인 중 오류가 발생했습니다.");
    }
  };

  // 아이디 중복 확인 핸들러
  const handleCheckUserId = async () => {
    setUserIdError("");
    setUserIdSuccess("");

    if (!formData.userId) {
      setUserIdError("아이디를 입력해주세요.");
      return;
    }
    try {
      console.log("아이디 중복 확인 요청:", formData.userId);
      const res = await checkUserIdExists(formData.userId);
      setUserIdChecked(true);
      if (res.isDuplicate) {
        setUserIdError("이미 사용 중인 아이디입니다.");
      } else {
        setUserIdSuccess("사용 가능한 아이디입니다.");
      }
    } catch {
      setUserIdError("중복 확인 중 오류가 발생했습니다.");
    }
  };

  return {
    formData,
    loading,
    error,
    handleChange,
    handleFileChange,
    handleSubmit,
    emailError,
    userIdError,
    emailSuccess,
    userIdSuccess,
    handleCheckEmail,
    handleCheckUserId,
    emailChecked,
    userIdChecked,
    passwordConfirmError,
    passwordError,
  };
};
