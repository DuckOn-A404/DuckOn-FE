import React, { useEffect, useMemo, useState } from 'react';
import { Search, Plus, Edit2, Trash2, Users, Music } from 'lucide-react';
import { api } from '../../api/axiosInstance';

interface Artist {
  artistId: number;
  nameKr: string;
  nameEn: string;
  debutDate: string;
  imgUrl: string;
}

interface ApiPageData<T> {
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  items: T[];
}

interface ApiResponse<T> {
  status: number;
  message: string;
  data: T;
}

const PAGE_SIZE = 20;

const ArtistManagePage: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);

  // 조회용 상태
  const [artists, setArtists] = useState<Artist[]>([])
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);

  const fetchArtists = async () => {
    setLoading(true);
    try {
      const res = await api.get<ApiResponse<ApiPageData<Artist>>>(
        "/admin/artists",
        {
          params: {
            page,
            size: PAGE_SIZE,
          },
        }
      );

      const pageData = res.data.data;
      setArtists(pageData.items ?? []);
      setTotalPages(pageData.totalPages ?? 0);
    } catch (e) {
      console.error("아티스트 조회 실패:", e);
      setArtists([]);
      setTotalPages(0);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchArtists();
  }, [page]);

  const filteredArtists = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return artists;

    return artists.filter((artist) => {
      const kr = (artist.nameKr ?? "").toLowerCase();
      const en = (artist.nameEn ?? "").toLowerCase();
      return kr.includes(q) || en.includes(q);
    })
  }, [artists, searchQuery]);

  const handleDeleteArtist = (artistId: number) => {
    if (window.confirm('정말 이 아티스트를 삭제하시겠습니까?')) {
      console.log('Delete artist:', artistId);
      // API 호출
    }
  };

  const handleEditArtist = (artistId: number) => {
    console.log('Edit artist:', artistId);
    // 수정 모달 열기
  };

  const handlePrev = () => setPage((p) => Math.max(1, p - 1));
  const handleNext = () =>
    setPage((p) => (totalPages ? Math.min(totalPages, p + 1) : p + 1));

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            아티스트 관리
          </h1>
          <p className="text-gray-600">
            아티스트 정보를 관리하고 수정할 수 있습니다
          </p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700 transition flex items-center gap-2 font-medium shadow-lg"
        >
          <Plus size={20} />
          새 아티스트 추가
        </button>
      </div>

      {/* Search Bar */}
      <div className="bg-white rounded-xl p-6 shadow-sm mb-6">
        <div className="relative">
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            size={20}
          />
          <input
            type="text"
            placeholder="아티스트 이름(한/영)으로 검색..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Loading */}
      {loading && (
        <div className="text-center py-12">
          <p className="text-gray-500">아티스트 목록을 불러오는 중입니다...</p>
        </div>
      )}

      {/* Artists Grid */}
      {!loading && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredArtists.map((artist) => (
              <div
                key={artist.artistId}
                className="bg-white rounded-xl shadow-sm hover:shadow-lg transition overflow-hidden"
              >
                {/* Artist Image */}
                <div className="relative h-48 bg-gradient-to-br from-purple-100 to-pink-100">
                  {/* 실제 이미지 */}
                  {artist.imgUrl ? (
                    <div
                      className="absolute inset-0 bg-cover bg-center"
                      style={{ backgroundImage: `url(${artist.imgUrl})` }}
                    />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center text-6xl">
                      🎵
                    </div>
                  )}
                </div>

                {/* Artist Info */}
                <div className="p-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-1">
                    {artist.nameKr}
                  </h3>
                  <p className="text-sm text-gray-600 mb-2">{artist.nameEn}</p>
                  <p className="text-xs text-gray-400 mb-4">
                    데뷔일 · {artist.debutDate}
                  </p>

                  {/* Stats (현재 API에 없어서 자리만 유지 / 다음 단계에서 연결) */}
                  <div className="flex items-center gap-4 mb-4 opacity-60">
                    <div className="flex items-center gap-1 text-sm text-gray-600">
                      <Users size={16} />
                      <span className="font-medium">-</span>
                      <span className="text-gray-400">팔로워</span>
                    </div>
                    <div className="flex items-center gap-1 text-sm text-gray-600">
                      <Music size={16} />
                      <span className="font-medium">-</span>
                      <span className="text-gray-400">작품 수</span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEditArtist(artist.artistId)}
                      className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition flex items-center justify-center gap-2"
                    >
                      <Edit2 size={16} />
                      수정
                    </button>
                    <button
                      onClick={() => handleDeleteArtist(artist.artistId)}
                      className="flex-1 px-4 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition flex items-center justify-center gap-2"
                    >
                      <Trash2 size={16} />
                      삭제
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Empty State */}
          {filteredArtists.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500">검색 결과가 없습니다</p>
            </div>
          )}

          {/* Pagination (최소 버전) */}
          <div className="flex items-center justify-center gap-3 mt-8">
            <button
              onClick={handlePrev}
              disabled={page <= 1}
              className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-40 hover:bg-gray-50 transition"
            >
              이전
            </button>

            <div className="text-sm text-gray-700">
              <span className="font-semibold">{page}</span>
              <span className="text-gray-400"> / </span>
              <span>{totalPages || "-"}</span>
            </div>

            <button
              onClick={handleNext}
              disabled={totalPages !== 0 && page >= totalPages}
              className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-40 hover:bg-gray-50 transition"
            >
              다음
            </button>
          </div>
        </>
      )}

      {/* Add Artist Modal (아직 API 연결 전, UI만 유지) */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              새 아티스트 추가
            </h2>
            <form className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  이름(한글)
                </label>
                <input
                  type="text"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="예) 아이들"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  이름(영문)
                </label>
                <input
                  type="text"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="예) IDLE"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  데뷔일
                </label>
                <input
                  type="date"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  프로필 이미지
                </label>
                <input
                  type="file"
                  accept="image/*"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
                >
                  취소
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700 transition"
                >
                  추가
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ArtistManagePage;