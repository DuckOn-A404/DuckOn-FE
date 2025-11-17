// frontend/src/pages/PrivacyPage.tsx
import React from "react";

const PrivacyPage: React.FC = () => {
  return (
    <main className="min-h-screen bg-slate-950 text-slate-50">
      <div className="max-w-3xl mx-auto px-4 py-12">
        <h1 className="text-3xl md:text-4xl font-bold mb-6">
          DuckOn 개인정보처리방침
        </h1>
        <p className="text-sm text-slate-300 mb-10">
          본 개인정보처리방침은 DuckOn(이하 &quot;서비스&quot;)이 제공하는
          웹/모바일 서비스 전반에 적용되며, Google Play 스토어 및 기타
          플랫폼에서 제공되는 DuckOn 앱에 동일하게 적용됩니다.
        </p>

        <section className="space-y-8 text-sm md:text-base leading-relaxed">
          <div>
            <h2 className="font-semibold text-lg mb-2">
              1. 수집하는 개인정보 항목
            </h2>
            <p className="mb-1">
              서비스는 회원가입 및 이용 과정에서 다음과 같은 정보를 수집할 수
              있습니다.
            </p>
            <ul className="list-disc list-inside space-y-1">
              <li>
                <span className="font-semibold">회원가입 및 로그인</span> :
                이메일 주소(또는 소셜 로그인 ID), 닉네임, 프로필 이미지
              </li>
              <li>
                <span className="font-semibold">
                  서비스 이용 과정에서 자동 수집
                </span>{" "}
                : 접속 로그, IP 주소, 단말기 정보(기기 모델, OS 버전 등), 이용
                기록(참여한 방, 채팅·GIF 사용 기록 등)
              </li>
              <li>
                사용자가 자발적으로 입력한 기타 정보
              </li>
            </ul>
          </div>

          <div>
            <h2 className="font-semibold text-lg mb-2">
              2. 개인정보의 수집 및 이용 목적
            </h2>
            <ul className="list-disc list-inside space-y-1">
              <li>회원 식별, 로그인 및 계정 관리</li>
              <li>라이브 방 생성·참여, 채팅, GIF 전송 등 서비스 핵심 기능 제공</li>
              <li>서비스 품질 개선, 오류 분석 및 고객 문의 대응</li>
              <li>부정 이용 방지 및 보안, 서비스 안정성 확보</li>
              <li>관련 법령 준수 및 분쟁 대비를 위한 기록 보관</li>
            </ul>
          </div>

          <div>
            <h2 className="font-semibold text-lg mb-2">
              3. 개인정보의 보관 기간 및 파기
            </h2>
            <ul className="list-disc list-inside space-y-1">
              <li>
                서비스는 이용자가 회원 탈퇴를 요청하는 경우 지체 없이 개인정보를
                파기합니다.
              </li>
              <li>
                단, 관련 법령에 따라 일정 기간 보관이 필요한 정보는 해당 법령에서
                정한 기간 동안 별도 저장 후 파기합니다.
              </li>
            </ul>
          </div>

          <div>
            <h2 className="font-semibold text-lg mb-2">
              4. 개인정보의 제3자 제공
            </h2>
            <p>
              서비스는 이용자의 개인정보를 원칙적으로 외부에 제공하지 않습니다.
              다만, 법령에 특별한 규정이 있거나 수사기관이 법적 절차에 따라
              요청하는 경우 등 관계 법령이 허용하는 범위 내에서 제공될 수
              있습니다.
            </p>
          </div>

          <div>
            <h2 className="font-semibold text-lg mb-2">
              5. 개인정보 처리 위탁
            </h2>
            <p className="mb-1">
              서비스 운영을 위해 일부 업무를 외부 업체에 위탁할 수 있습니다. 이
              경우 개인정보가 안전하게 처리되도록 관련 법령에 따라 관리·감독을
              수행합니다.
            </p>
            <p className="text-xs text-slate-400">
              (현재 시점 기준 구체적인 위탁 업체가 있는 경우, 위탁 업무와 업체
              명칭을 여기에 추가 기재해 주세요.)
            </p>
          </div>

          <div>
            <h2 className="font-semibold text-lg mb-2">
              6. 이용자의 권리와 행사 방법
            </h2>
            <ul className="list-disc list-inside space-y-1">
              <li>
                이용자는 서비스 내 &quot;프로필&quot; 또는 &quot;계정&quot; 화면에서
                자신의 개인정보를 조회·수정할 수 있습니다.
              </li>
              <li>
                회원 탈퇴를 통해 개인정보 삭제를 요청할 수 있으며, 관련 법령에서
                정한 범위를 제외하고 지체 없이 파기됩니다.
              </li>
            </ul>
          </div>

          <div>
            <h2 className="font-semibold text-lg mb-2">
              7. 만 14세 미만 아동의 개인정보
            </h2>
            <p>
              본 서비스는 만 14세 미만 아동을 대상으로 하지 않으며, 만 14세 미만
              아동의 개인정보를 고의로 수집하지 않습니다. 만 14세 미만 사용자의
              가입 사실이 확인되는 경우 지체 없이 계정을 삭제하고 관련 정보를
              파기합니다.
            </p>
          </div>

          <div>
            <h2 className="font-semibold text-lg mb-2">8. 쿠키(Cookie)의 사용</h2>
            <p>
              서비스는 로그인 유지, 이용 패턴 분석 등 사용자 경험 향상을 위해
              쿠키를 사용할 수 있습니다. 이용자는 브라우저 설정을 통해 쿠키
              저장을 거부하거나 삭제할 수 있으나, 이 경우 일부 기능 사용에 제한이
              있을 수 있습니다.
            </p>
          </div>

          <div>
            <h2 className="font-semibold text-lg mb-2">
              9. 개인정보 보호를 위한 노력
            </h2>
            <p>
              서비스는 개인정보의 분실, 도난, 유출, 위조, 변조 또는 훼손을
              방지하고자 합리적인 보호 조치를 취하고 있으며, 개인정보 접근 권한을
              최소한의 인원으로 제한하고 있습니다.
            </p>
          </div>

          <div>
            <h2 className="font-semibold text-lg mb-2">
              10. 개인정보 관련 문의
            </h2>
            <p className="mb-1">
              개인정보 관련 문의, 의견 제출, 권리 행사는 아래 이메일로 연락해
              주세요.
            </p>
            <p className="font-mono text-sm">📧 duckonssafy@gmail.com</p>
          </div>

          <div className="text-xs text-slate-400 pt-6 border-t border-slate-800 mt-8">
            <p>본 개인정보처리방침은 2025-11-17 기준으로 적용됩니다.</p>
          </div>
        </section>
      </div>
    </main>
  );
};

export default PrivacyPage;
