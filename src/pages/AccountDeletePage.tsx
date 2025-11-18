import React from "react";
import { useNavigate } from "react-router-dom";

const AccountDeletePage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <main className="min-h-screen bg-black text-white flex items-center justify-center">
      <div className="max-w-xl mx-auto text-center px-6 py-12">
        <h1 className="text-3xl font-bold mb-6">DuckOn 계정 삭제 안내</h1>

        <p className="text-gray-300 leading-relaxed mb-6">
          계정 삭제 요청을 위해서는 본인 확인을 위해
          <br/>
          DuckOn 계정으로 먼저 로그인하셔야 합니다.
          <br />
          로그인 후 마이페이지에서 계정 삭제 관련 도움을 받으실 수 있습니다.
        </p>

        <button
          onClick={() => navigate("/login")}
          className="mt-4 bg-yellow-400 text-black px-6 py-3 rounded-lg font-semibold hover:opacity-90"
        >
          로그인하러 가기
        </button>

        <p className="text-gray-500 text-sm mt-8 leading-relaxed">
          로그인 후, &quot;마이페이지&quot;에서 계정 삭제(탈퇴)가 가능합니다.
        </p>
      </div>
    </main>
  );
};

export default AccountDeletePage;
