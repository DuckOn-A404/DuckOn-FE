import { Wrench } from "lucide-react"; // 기능 준비 중을 나타내는 아이콘

/*
  name: RecommendTab
  summary: 추천 탭. 현재는 개발 예정 안내를 표시합니다.
*/
const RecommendTab = () => {
  return (
    <div className="flex flex-col items-center justify-center h-full text-center p-4 text-gray-500">
      <Wrench className="w-12 h-12 text-gray-300 mb-4" />

      <h3 className="font-semibold text-gray-600">기능 준비 중</h3>
      <p className="text-sm text-gray-400 mt-1">
        나와 비슷한 취향을 가진
        <br />
        다른 팬들을 추천해드릴 예정이에요!
      </p>
    </div>
  );
};

export default RecommendTab;
