import { useEffect, useState } from 'react';
import { Trophy, Crown, Medal, TrendingUp } from 'lucide-react';
import { getUserLeaderboard, type LeaderboardUser } from '../api/userService';
import RankBadge from '../components/common/RankBadge';

const LeaderboardPage = () => {
  const [leaderboard, setLeaderboard] = useState<LeaderboardUser[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadLeaderboard = async () => {
      try {
        const response = await getUserLeaderboard(0, 50);
        setLeaderboard(response.data || []);
      } catch (error) {
        console.error('리더보드 로드 실패:', error);
      } finally {
        setLoading(false);
      }
    };

    loadLeaderboard();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-8">
          <p className="text-center">로딩 중...</p>
        </div>
      </div>
    );
  }

  const top3 = leaderboard.slice(0, 3);
  const rest = leaderboard.slice(3);

  // 순위별 색상 및 아이콘
  const getRankStyle = (rank: number) => {
    switch (rank) {
      case 1:
        return {
          gradient: 'linear-gradient(135deg, #FFD700 0%, #FFA500 100%)',
          icon: <Crown size={32} color="#FFD700" />,
          shadow: '0 8px 32px rgba(255, 215, 0, 0.4)',
          scale: 1.1,
        };
      case 2:
        return {
          gradient: 'linear-gradient(135deg, #C0C0C0 0%, #A8A8A8 100%)',
          icon: <Medal size={28} color="#C0C0C0" />,
          shadow: '0 6px 24px rgba(192, 192, 192, 0.4)',
          scale: 1.05,
        };
      case 3:
        return {
          gradient: 'linear-gradient(135deg, #CD7F32 0%, #B87333 100%)',
          icon: <Trophy size={28} color="#CD7F32" />,
          shadow: '0 6px 24px rgba(205, 127, 50, 0.4)',
          scale: 1.05,
        };
      default:
        return {
          gradient: 'linear-gradient(135deg, #9333EA 0%, #7C3AED 100%)',
          icon: <TrendingUp size={20} color="#9333EA" />,
          shadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
          scale: 1,
        };
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-12 max-w-6xl">
        {/* 헤더 */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-4 mb-4">
            <Trophy size={40} color="#9333EA" />
            <h1 className="text-5xl font-extrabold text-gray-900">Ranking</h1>
          </div>
          <p className="text-lg text-gray-600">자신의 덕력을 증명하라 👑</p>
        </div>

        {/* TOP 3 - 시상대 스타일 */}
        {top3.length > 0 && (
          <div className="mb-12">
            <h2 className="text-3xl font-bold text-center mb-6">🏆 TOP 3</h2>
            <div className="flex justify-center items-end gap-6 flex-wrap">
              {/* 2위 */}
              {top3[1] && (
                <div
                  className="w-60 rounded-2xl transition-all duration-300 hover:scale-110"
                  style={{
                    background: getRankStyle(2).gradient,
                    boxShadow: getRankStyle(2).shadow,
                    transform: `scale(${getRankStyle(2).scale})`,
                  }}
                >
                  <div className="text-center py-6">
                    <div className="relative inline-block mb-4">
                      <img
                        src={top3[1].profileImgUrl || '/default_image.png'}
                        alt={top3[1].nickname}
                        className="w-20 h-20 rounded-full border-4 border-white mx-auto object-cover"
                      />
                      <div className="absolute -top-2 -right-2 bg-white rounded-full p-1">
                        {getRankStyle(2).icon}
                      </div>
                    </div>
                    <h3 className="text-xl font-bold text-white mb-1">{top3[1].nickname}</h3>
                    <span className="inline-block bg-white/90 text-gray-600 font-bold text-sm px-3 py-1 rounded-full mb-2">
                      2위
                    </span>
                    <div className="flex justify-center items-center gap-2">
                      <RankBadge rankLevel={top3[1].userRank.rankLevel} size={24} />
                      <span className="text-sm text-white font-semibold">
                        {top3[1].userRank.roomCreateCount} DP
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* 1위 - 가장 크게 */}
              {top3[0] && (
                <div
                  className="w-64 rounded-2xl transition-all duration-300 hover:scale-115"
                  style={{
                    background: getRankStyle(1).gradient,
                    boxShadow: getRankStyle(1).shadow,
                    transform: `scale(${getRankStyle(1).scale})`,
                  }}
                >
                  <div className="text-center py-8">
                    <div className="relative inline-block mb-4">
                      <img
                        src={top3[0].profileImgUrl || '/default_image.png'}
                        alt={top3[0].nickname}
                        className="w-24 h-24 rounded-full border-4 border-white mx-auto object-cover"
                      />
                      <div className="absolute -top-3 -right-3 bg-white rounded-full p-2">
                        {getRankStyle(1).icon}
                      </div>
                    </div>
                    <h3 className="text-2xl font-extrabold text-white mb-1">{top3[0].nickname}</h3>
                    <span className="inline-block bg-white/95 text-yellow-500 font-extrabold text-base px-4 py-1 rounded-full mb-3">
                      👑 1위
                    </span>
                    <div className="flex justify-center items-center gap-2">
                      <RankBadge rankLevel={top3[0].userRank.rankLevel} size={28} />
                      <span className="text-base text-white font-bold">
                        {top3[0].userRank.roomCreateCount} DP
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* 3위 */}
              {top3[2] && (
                <div
                  className="w-60 rounded-2xl transition-all duration-300 hover:scale-110"
                  style={{
                    background: getRankStyle(3).gradient,
                    boxShadow: getRankStyle(3).shadow,
                    transform: `scale(${getRankStyle(3).scale})`,
                  }}
                >
                  <div className="text-center py-6">
                    <div className="relative inline-block mb-4">
                      <img
                        src={top3[2].profileImgUrl || '/default_image.png'}
                        alt={top3[2].nickname}
                        className="w-20 h-20 rounded-full border-4 border-white mx-auto object-cover"
                      />
                      <div className="absolute -top-2 -right-2 bg-white rounded-full p-1">
                        {getRankStyle(3).icon}
                      </div>
                    </div>
                    <h3 className="text-xl font-bold text-white mb-1">{top3[2].nickname}</h3>
                    <span className="inline-block bg-white/90 text-gray-600 font-bold text-sm px-3 py-1 rounded-full mb-2">
                      3위
                    </span>
                    <div className="flex justify-center items-center gap-2">
                      <RankBadge rankLevel={top3[2].userRank.rankLevel} size={24} />
                      <span className="text-sm text-white font-semibold">
                        {top3[2].userRank.roomCreateCount} DP
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* 4-50위 - 리스트 스타일 */}
        {rest.length > 0 && (
          <div>
            <h2 className="text-3xl font-bold mb-6">📊 4위 ~ 50위</h2>
            <div className="flex flex-col gap-4">
              {rest.map((user, index) => {
                const rank = index + 4;
                return (
                  <div
                    key={user.userId}
                    className="bg-white rounded-xl shadow-sm transition-all duration-300 hover:shadow-lg hover:-translate-y-1"
                  >
                    <div className="p-4 flex items-center gap-6">
                      {/* 순위 */}
                      <div
                        className="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0"
                        style={{
                          background: 'linear-gradient(135deg, #9333EA 0%, #7C3AED 100%)',
                        }}
                      >
                        <span className="text-xl font-extrabold text-white">{rank}</span>
                      </div>

                      {/* 프로필 */}
                      <img
                        src={user.profileImgUrl || '/default_image.png'}
                        alt={user.nickname}
                        className="w-14 h-14 rounded-full border-3 border-gray-100 object-cover"
                      />

                      {/* 정보 */}
                      <div className="flex-1">
                        <h3 className="text-xl font-bold mb-1">{user.nickname}</h3>
                        <div className="flex items-center gap-2">
                          <RankBadge rankLevel={user.userRank.rankLevel} size={20} />
                          <span className="text-sm text-gray-600">
                            {user.userRank.roomCreateCount} DP
                          </span>
                        </div>
                      </div>

                      {/* 랭크 레벨 배지 */}
                      <span className="bg-purple-100 text-purple-600 font-bold text-sm px-3 py-1 rounded-full">
                        {user.userRank.rankLevel}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* 빈 상태 */}
        {leaderboard.length === 0 && (
          <div className="text-center py-16">
            <Trophy size={64} color="#D1D5DB" className="mx-auto mb-4" />
            <p className="text-xl text-gray-500">아직 리더보드 데이터가 없습니다</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default LeaderboardPage;
