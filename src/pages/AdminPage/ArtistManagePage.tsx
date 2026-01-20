import React, { useState } from 'react';
import { Search, Plus, Edit2, Trash2, Users, Music } from 'lucide-react';

interface Artist {
  id: number;
  name: string;
  category: string;
  imageUrl: string;
  followers: number;
  tracksCount: number;
  status: '활성' | '비활성';
}

const ArtistManagePage: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);

  // Mock data
  const artists: Artist[] = [
    {
      id: 1,
      name: '김민준',
      category: '화가',
      imageUrl: '/api/placeholder/300/300',
      followers: 12500,
      tracksCount: 45,
      status: '활성',
    },
    {
      id: 2,
      name: '이서연',
      category: '조각가',
      imageUrl: '/api/placeholder/300/300',
      followers: 8900,
      tracksCount: 32,
      status: '활성',
    },
    {
      id: 3,
      name: '박지훈',
      category: '사진작가',
      imageUrl: '/api/placeholder/300/300',
      followers: 15600,
      tracksCount: 128,
      status: '활성',
    },
  ];

  const filteredArtists = artists.filter((artist) =>
    artist.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

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

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">아티스트 관리</h1>
          <p className="text-gray-600">아티스트 정보를 관리하고 수정할 수 있습니다</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700 transition flex items-center gap-2 font-medium shadow-lg"
        >
          <Plus size={20} />새 아티스트 추가
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
            placeholder="아티스트 이름 또는 카테고리로 검색..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Artists Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredArtists.map((artist) => (
          <div
            key={artist.id}
            className="bg-white rounded-xl shadow-sm hover:shadow-lg transition overflow-hidden"
          >
            {/* Artist Image */}
            <div className="relative h-48 bg-gradient-to-br from-purple-100 to-pink-100">
              <div className="absolute inset-0 flex items-center justify-center text-6xl">
                🎨
              </div>
              <div className="absolute top-4 right-4">
                <span
                  className={`px-3 py-1 rounded-full text-xs font-medium ${
                    artist.status === '활성'
                      ? 'bg-green-100 text-green-700'
                      : 'bg-gray-100 text-gray-700'
                  }`}
                >
                  {artist.status}
                </span>
              </div>
            </div>

            {/* Artist Info */}
            <div className="p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-1">
                {artist.name}
              </h3>
              <p className="text-sm text-gray-600 mb-4">{artist.category}</p>

              {/* Stats */}
              <div className="flex items-center gap-4 mb-4">
                <div className="flex items-center gap-1 text-sm text-gray-600">
                  <Users size={16} />
                  <span className="font-medium">{artist.followers.toLocaleString()}</span>
                  <span className="text-gray-400">팔로워</span>
                </div>
                <div className="flex items-center gap-1 text-sm text-gray-600">
                  <Music size={16} />
                  <span className="font-medium">{artist.tracksCount}</span>
                  <span className="text-gray-400">작품 수</span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-2">
                <button
                  onClick={() => handleEditArtist(artist.id)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition flex items-center justify-center gap-2"
                >
                  <Edit2 size={16} />
                  수정
                </button>
                <button
                  onClick={() => handleDeleteArtist(artist.id)}
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

      {/* Add Artist Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              새 아티스트 추가
            </h2>
            <form className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  이름
                </label>
                <input
                  type="text"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="아티스트 이름"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  카테고리
                </label>
                <select className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent">
                  <option>화가</option>
                  <option>조각가</option>
                  <option>사진작가</option>
                  <option>디지털 아티스트</option>
                </select>
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