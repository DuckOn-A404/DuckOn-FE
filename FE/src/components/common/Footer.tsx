/*
  name: Footer
  summary: 모든 페이지에 필요한 footer.
  props:
    없습니다.
*/
const Footer = () => {
  return (
    <footer className="bg-gray-100 border-t border-gray-200 text-gray-600">
      <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-xl font-bold text-gray-800">DuckON</h2>
            <p className="text-xs text-gray-500 mt-1">
              © 2025 DuckOn. All rights reserved.
            </p>
          </div>

          {/* 메뉴 링크 및 문의 정보 */}
          <div className="flex items-center gap-x-6 gap-y-2 flex-wrap justify-center text-sm">
            <div className="flex items-center gap-2">
              <span className="font-bold text-gray-500">문의:</span>
              <span className="font-medium text-gray-800">
                duckonssafy@gmail.com
              </span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
