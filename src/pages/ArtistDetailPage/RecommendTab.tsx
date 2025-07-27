const recommendations = [
  { name: "케이팝러버", time: "지금" },
  { name: "뮤직매니아", time: "5분 전" },
  { name: "댄스퀸", time: "1시간 전" },
  { name: "음악덕후", time: "방금" },
  { name: "콘서트매니아", time: "30분 전" },
];

const RecommendTab = () => {
  return (
    <div className="space-y-3">
      {recommendations.map((user, i) => (
        <div
          key={i}
          className="flex justify-between items-center text-sm bg-gray-50 px-3 py-2 rounded-lg"
        >
          <div>
            <div className="font-semibold">{user.name}</div>
            <div className="text-xs text-gray-500">{user.time}</div>
          </div>
          <button className="bg-purple-500 text-white px-3 py-1 rounded-full text-xs">
            팔로우
          </button>
        </div>
      ))}
    </div>
  );
};

export default RecommendTab;
