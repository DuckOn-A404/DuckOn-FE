// import { useEffect, useState } from "react";
// import { LockKeyhole } from "lucide-react";

// type PasswordConfirmProps = {
//   isOpen: boolean;
//   onClose: () => void;
//   onConfirm: (password: string) => Promise<boolean>;  // 비동기 검증 결과 받기
// };

// const PasswordConfirm = ({ isOpen, onClose, onConfirm }: PasswordConfirmProps) => {
//   const [password, setPassword] = useState("");
//   const [error, setError] = useState("")

//   useEffect(() => {
//     if (isOpen) {
//       setPassword(""); 
//       setError(""); // 팝업 열릴 때 입력 초기화
//     }
//   }, [isOpen]);

//   const handleSubmit = async() => {
//     if (!password.trim()) return
    
//     const isValid = await onConfirm(password)
//     if (!isValid) {
//       setError("비밀번호가 일치하지 않습니다.")
//     }
//   };

//   const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
//     if (e.key === "Enter") {
//       handleSubmit();
//     }
//   };

//   if (!isOpen) return null;

//   return (
//     <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
//       <div className="bg-white rounded-xl p-6 w-90 text-center shadow-xl">
//         <div className="text-purple-600 mb-2">
//           <LockKeyhole className="w-8 h-8 mx-auto" />
//         </div>
//         <h2 className="text-base font-semibold mb-1">현재 비밀번호 확인</h2>
//         <p className="text-sm text-gray-500 mb-4">프로필 수정을 위해 비밀번호를 입력해주세요.</p>

//         <input
//           type="password"
//           placeholder="현재 비밀번호를 입력하세요"
//           className="w-full border border-gray-300 rounded px-3 py-2 mb-4 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400"
//           value={password}
//           onChange={(e) => setPassword(e.target.value)}
//           onKeyDown={handleKeyDown}
//         />

//         {/* 비밀번호 잘못 입력했을 시 메시지 출력 */}
//         {error && <p className="text-sm text-red-500 mb-2">{error}</p>}

//         <div className="flex justify-between gap-2">
//           <button
//             className="w-1/2 py-2 text-sm border border-gray-300 rounded hover:bg-gray-100"
//             onClick={onClose}
//           >
//             취소
//           </button>
//           <button
//             className={`w-1/2 py-2 text-sm rounded text-white ${
//               password.trim()
//                 ? "bg-purple-500 hover:bg-purple-600"
//                 : "bg-purple-300 cursor-not-allowed"
//             }`}
//             onClick={handleSubmit}
//             disabled={!password.trim()}
//           >
//             확인
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default PasswordConfirm;

import { useEffect, useState } from "react";
import { LockKeyhole } from "lucide-react";
import UIText from "./UIText";
import { useUiTranslate } from "../../hooks/useUiTranslate";

type PasswordConfirmProps = {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (password: string) => Promise<boolean>; // 비동기 검증 결과 받기
};

const PasswordConfirm = ({
  isOpen,
  onClose,
  onConfirm,
}: PasswordConfirmProps) => {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const { t } = useUiTranslate();

  useEffect(() => {
    if (isOpen) {
      setPassword("");
      setError(""); // 팝업 열릴 때 입력 초기화
    }
  }, [isOpen]);

  const handleSubmit = async () => {
    if (!password.trim()) return;

    const isValid = await onConfirm(password);
    if (!isValid) {
      setError(
        t(
          "mypage.passwordConfirm.error",
          "비밀번호가 일치하지 않습니다.",
        ),
      );
    }
  };

  const handleKeyDown = (
    e: React.KeyboardEvent<HTMLInputElement>,
  ) => {
    if (e.key === "Enter") {
      handleSubmit();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-xl p-6 w-90 text-center shadow-xl">
        <div className="text-purple-600 mb-2">
          <LockKeyhole className="w-8 h-8 mx-auto" />
        </div>
        <UIText
          id="mypage.passwordConfirm.title"
          as="h2"
          className="text-base font-semibold mb-1"
        >
          현재 비밀번호 확인
        </UIText>
        <p className="text-sm text-gray-500 mb-4">
          <UIText id="mypage.passwordConfirm.description">
            프로필 수정을 위해 비밀번호를 입력해주세요.
          </UIText>
        </p>

        <input
          type="password"
          placeholder={t(
            "mypage.passwordConfirm.placeholder",
            "현재 비밀번호를 입력하세요",
          )}
          className="w-full border border-gray-300 rounded px-3 py-2 mb-4 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          onKeyDown={handleKeyDown}
        />

        {/* 비밀번호 잘못 입력했을 시 메시지 출력 */}
        {error && (
          <p className="text-sm text-red-500 mb-2">{error}</p>
        )}

        <div className="flex justify-between gap-2">
          <button
            className="w-1/2 py-2 text-sm border border-gray-300 rounded hover:bg-gray-100"
            onClick={onClose}
          >
            <UIText id="common.cancel">취소</UIText>
          </button>
          <button
            className={`w-1/2 py-2 text-sm rounded text-white ${
              password.trim()
                ? "bg-purple-500 hover:bg-purple-600"
                : "bg-purple-300 cursor-not-allowed"
            }`}
            onClick={handleSubmit}
            disabled={!password.trim()}
          >
            <UIText id="common.ok">확인</UIText>
          </button>
        </div>
      </div>
    </div>
  );
};

export default PasswordConfirm;
