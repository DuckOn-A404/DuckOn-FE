type FooterProps = {};

/*
  name: Footer
  summary: 모든 페이지에 필요한 footer. 나중에 좀 더 구체화 시킬 예정. 문의하기 클릭하면 문의 부분으로 넘어가게도 만들 계획. 다른 사이트 참고 필요!
  props:
    없습니다.
*/

const Footer = ({}: FooterProps) => {
  return (
    <footer className="bg-gradient-to-r from-purple-600 to-pink-500 text-white py-10 px-4 md:px-10">
      <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8">
        {/* 서비스명 */}
        <div>
          <h2 className="text-2xl font-bold">DuckON</h2>
          <p className="text-sm">팬들을 위한 실시간 플랫폼</p>
        </div>

        {/* 문의하기 링크 */}
        <div className="mt-4">
          <ul className="text-sm space-y-1">
            <li><a href="/contact" className="hover:underline">문의하기</a></li>
          </ul>
        </div>

      </div>
      {/* 저작권 문구 */}
      <div className="mt-10 border-t border-white/30 pt-4 text-center text-sm text-white/80">
        © 2025 DuckON. All rights reserved.
      </div>
    </footer>
  );
};

export default Footer;
