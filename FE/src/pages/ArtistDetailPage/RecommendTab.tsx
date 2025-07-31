const recommendations = [
  { name: "케이팝러버" },
  { name: "뮤직매니아" },
  { name: "댄스퀸" },
  { name: "음악덕후" },
  { name: "콘서트매니아" },
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
