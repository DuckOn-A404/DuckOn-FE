import { useState } from "react";
import { Dialog } from "@headlessui/react";
import { changePassword } from "../../../api/userService";

type ChangePasswordModalProps = {
  isOpen: boolean;
  onClose: () => void;
};

// 영문/숫자/특수문자 각 1개 이상 + 공백 불가 + 8자 이상
const PASSWORD_REGEX = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[^A-Za-z0-9])\S{8,}$/;

const ChangePasswordModal = ({ isOpen, onClose }: ChangePasswordModalProps) => {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const [currentPasswordError, setCurrentPasswordError] = useState("");
  const [newPasswordError, setNewPasswordError] = useState("");
  const [confirmPasswordError, setConfirmPasswordError] = useState("");

  const handleClose = () => {
    if (loading) return;
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
    setError("");
    setSuccess(false);
    setCurrentPasswordError("");
    setNewPasswordError("");
    setConfirmPasswordError("");
    onClose();
  };

  const validateForm = (): boolean => {
    let isValid = true;

    // 현재 비밀번호 검증
    if (!currentPassword.trim()) {
      setCurrentPasswordError("현재 비밀번호를 입력해주세요.");
      isValid = false;
    } else {
      setCurrentPasswordError("");
    }

    // 새 비밀번호 검증
    if (!newPassword.trim()) {
      setNewPasswordError("새 비밀번호를 입력해주세요.");
      isValid = false;
    } else if (!PASSWORD_REGEX.test(newPassword)) {
      setNewPasswordError("영문, 숫자, 특수문자를 각각 1자 이상 포함하고 최소 8자여야 합니다.");
      isValid = false;
    } else {
      setNewPasswordError("");
    }

    // 비밀번호 확인 검증
    if (!confirmPassword.trim()) {
      setConfirmPasswordError("비밀번호 확인을 입력해주세요.");
      isValid = false;
    } else if (newPassword !== confirmPassword) {
      setConfirmPasswordError("새 비밀번호와 일치하지 않습니다.");
      isValid = false;
    } else {
      setConfirmPasswordError("");
    }

    return isValid;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setLoading(true);
    setError("");

    try {
      const response = await changePassword(currentPassword, newPassword);
      
      if (response.status === 200) {
        setSuccess(true);
        setTimeout(() => {
          handleClose();
        }, 1500);
      }
    } catch (err: any) {
      const status = err?.response?.status;
      const message = err?.response?.data?.message;

      if (status === 401) {
        setError("현재 비밀번호가 올바르지 않습니다.");
        setCurrentPasswordError("현재 비밀번호가 올바르지 않습니다.");
      } else if (status === 400) {
        if (message?.includes("동일한 비밀번호")) {
          setError("이전과 동일한 비밀번호로는 변경할 수 없습니다.");
        } else if (message?.includes("보안 정책")) {
          setError("새로운 비밀번호가 보안 정책에 맞지 않습니다.");
          setNewPasswordError("보안 정책에 맞지 않습니다.");
        } else {
          setError(message || "비밀번호 변경에 실패했습니다.");
        }
      } else {
        setError("비밀번호 변경 중 오류가 발생했습니다.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleNewPasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setNewPassword(val);

    if (val && !PASSWORD_REGEX.test(val)) {
      setNewPasswordError("영문, 숫자, 특수문자를 각각 1자 이상 포함하고 최소 8자여야 합니다.");
    } else {
      setNewPasswordError("");
    }

    if (confirmPassword && val !== confirmPassword) {
      setConfirmPasswordError("비밀번호가 일치하지 않습니다.");
    } else {
      setConfirmPasswordError("");
    }
  };

  const handleConfirmPasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setConfirmPassword(val);

    if (newPassword && newPassword !== val) {
      setConfirmPasswordError("비밀번호가 일치하지 않습니다.");
    } else {
      setConfirmPasswordError("");
    }
  };

  return (
    <Dialog open={isOpen} onClose={handleClose} className="relative z-50">
      <div className="fixed inset-0 bg-black/30" aria-hidden="true" />

      <div className="fixed inset-0 flex items-center justify-center p-4">
        <Dialog.Panel className="mx-auto max-w-md w-full bg-white rounded-2xl shadow-xl">
          <div className="p-6">
            <Dialog.Title className="text-xl font-bold text-center mb-6">
              비밀번호 변경
            </Dialog.Title>

            {success ? (
              <div className="text-center py-8">
                <p className="text-green-600 font-medium text-lg">
                  비밀번호가 성공적으로 변경되었습니다!
                </p>
              </div>
            ) : (
              <>
                <div className="space-y-4">
                  {/* 현재 비밀번호 */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      현재 비밀번호
                    </label>
                    <input
                      type="password"
                      value={currentPassword}
                      onChange={(e) => {
                        setCurrentPassword(e.target.value);
                        setCurrentPasswordError("");
                        setError("");
                      }}
                      className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                        currentPasswordError ? "border-red-500" : "border-gray-300"
                      }`}
                      placeholder="현재 비밀번호를 입력하세요"
                      disabled={loading}
                    />
                    {currentPasswordError && (
                      <p className="text-red-500 text-xs mt-1">{currentPasswordError}</p>
                    )}
                  </div>

                  {/* 새 비밀번호 */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      새 비밀번호
                    </label>
                    <input
                      type="password"
                      value={newPassword}
                      onChange={handleNewPasswordChange}
                      className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                        newPasswordError ? "border-red-500" : "border-gray-300"
                      }`}
                      placeholder="영문/숫자/특수문자 포함, 8자 이상"
                      disabled={loading}
                    />
                    {newPasswordError && (
                      <p className="text-red-500 text-xs mt-1">{newPasswordError}</p>
                    )}
                  </div>

                  {/* 새 비밀번호 확인 */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      새 비밀번호 확인
                    </label>
                    <input
                      type="password"
                      value={confirmPassword}
                      onChange={handleConfirmPasswordChange}
                      className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                        confirmPasswordError ? "border-red-500" : "border-gray-300"
                      }`}
                      placeholder="새 비밀번호를 다시 입력하세요"
                      disabled={loading}
                    />
                    {confirmPasswordError && (
                      <p className="text-red-500 text-xs mt-1">{confirmPasswordError}</p>
                    )}
                  </div>

                  {/* 에러 메시지 */}
                  {error && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                      <p className="text-red-600 text-sm text-center">{error}</p>
                    </div>
                  )}
                </div>

                {/* 버튼 */}
                <div className="flex gap-3 mt-6">
                  <button
                    onClick={handleClose}
                    disabled={loading}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-50 transition disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    취소
                  </button>
                  <button
                    onClick={handleSubmit}
                    disabled={loading}
                    className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? "변경 중..." : "변경하기"}
                  </button>
                </div>
              </>
            )}
          </div>
        </Dialog.Panel>
      </div>
    </Dialog>
  );
};

export default ChangePasswordModal;
