// src/pages/ChildSafetyPage.tsx

import React from "react";

const ChildSafetyPage: React.FC = () => {
  return (
    <main className="min-h-screen bg-black text-white">
      <div className="max-w-3xl mx-auto px-4 py-12">

        {/* Header */}
        <header className="mb-10 border-b border-gray-700 pb-6">
          <h1 className="text-3xl font-bold">DuckOn 아동 안전 표준 안내</h1>
          <p className="mt-4 text-sm leading-relaxed text-gray-300">
            DuckOn은 모든 이용자의 안전을 최우선으로 생각하며,
            <strong className="text-white">
              {" "}아동·청소년 대상의 성적 학대 및 착취(CSAE)를 엄격히 금지
            </strong>
            합니다.
            본 페이지는 DuckOn의 아동 안전 정책 및 신고 방법을 안내하기 위해 제공합니다.
          </p>
        </header>

        {/* Section 1 */}
        <section className="mb-10">
          <h2 className="text-xl font-semibold mb-3">1. DuckOn 서비스 소개</h2>
          <p className="text-sm leading-relaxed text-gray-300">
            DuckOn은 K-POP 및 다양한 콘텐츠의 팬들이  
            <strong className="text-white"> 유튜브 영상을 함께 시청하며 채팅으로 소통하는 팬 커뮤니티 서비스 </strong>
            입니다.
          </p>
        </section>

        {/* Section 2 */}
        <section className="mb-10">
          <h2 className="text-xl font-semibold mb-3">2. 금지되는 콘텐츠 및 행위</h2>
          <p className="text-sm leading-relaxed text-gray-300 mb-3">
            DuckOn에서는 아동 성적 학대 및 착취(CSAE)와 관련된 모든 콘텐츠 및 행동을 금지합니다.
          </p>

          <ul className="list-disc pl-5 space-y-2 text-sm text-gray-300">
            <li>아동·청소년의 나체, 성적 행위, 성적 부위 묘사</li>
            <li>아동·청소년을 성적 대상 또는 도구로 이용, 미화, 소비하는 표현</li>
            <li>아동 성 착취물(CSAM)의 제작, 보관, 공유, 배포, 링크 제공</li>
            <li>미성년자에게 성적 접촉 또는 온라인 grooming 시도</li>
            <li>현지 법규 또는 플랫폼 정책상 금지된 모든 아동 유해 콘텐츠</li>
          </ul>
        </section>

        {/* Section 3 */}
        <section className="mb-10">
          <h2 className="text-xl font-semibold mb-3">3. 신고 및 차단 방법</h2>
          <p className="text-sm leading-relaxed text-gray-300 mb-2">
            DuckOn 이용 중 아동 안전을 침해하는 행동을 발견한 경우 다음 방법으로 신고할 수 있습니다.
          </p>

          <ul className="list-disc pl-5 space-y-2 text-sm text-gray-300">
            <li>앱 내 신고 기능 사용</li>
            <li>문제가 된 내용의 스크린샷과 함께 운영팀 이메일로 신고</li>
          </ul>
        </section>

        {/* Section 4 */}
        <section className="mb-10">
          <h2 className="text-xl font-semibold mb-3">4. DuckOn 운영팀의 대응</h2>
          <p className="text-sm text-gray-300 mb-2">
            신고가 접수되면 DuckOn 운영팀은 다음과 같이 조치합니다.
          </p>

          <ol className="list-decimal pl-5 space-y-2 text-sm text-gray-300">
            <li>신고된 콘텐츠 및 로그 조사</li>
            <li>정책 위반 시 콘텐츠 삭제, 채팅 제한, 계정 정지 등 조치</li>
            <li>심각한 CSAM 관련 사항은 관련 기관에 법적으로 보고</li>
          </ol>
        </section>

        {/* Section 5 */}
        <section className="mb-10">
          <h2 className="text-xl font-semibold mb-3">5. 법 및 정책 준수</h2>
          <p className="text-sm text-gray-300">
            DuckOn은 서비스 제공 국가의 아동 보호 법규 및 Google Play의
            <strong className="text-white"> 아동 안전 표준 </strong>
            을 준수합니다.
          </p>
        </section>

        {/* Section 6 */}
        <section className="mb-12">
          <h2 className="text-xl font-semibold mb-3">6. 문의 및 연락처</h2>
          <p className="text-sm text-gray-300 mb-3">
            아동 안전 관련 문의는 아래 이메일로 연락 부탁드립니다.
          </p>

          <div className="rounded-md border border-gray-700 bg-gray-900 p-4 text-sm text-gray-200">
            <p className="font-semibold">DuckOn 아동 안전 담당</p>
            <p>
              이메일:{" "}
              <a
                href="mailto:qja086351@naver.com"
                className="text-blue-400 underline underline-offset-2"
              >
                qja086351@naver.com
              </a>
            </p>
          </div>
        </section>

        {/* Footer */}
        <footer className="border-t border-gray-700 pt-4 text-xs text-gray-500">
          <p>본 페이지는 DuckOn의 아동 안전 표준을 안내하기 위한 정보 페이지입니다.</p>
          <p className="mt-1">최종 업데이트: 2025-11-18</p>
        </footer>
      </div>
    </main>
  );
};

export default ChildSafetyPage;
