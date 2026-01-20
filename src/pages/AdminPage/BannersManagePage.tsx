import React, { useState } from 'react';
import { Plus, Edit2, Trash2, Image as ImageIcon, Eye, EyeOff, GripVertical } from 'lucide-react';

interface Banner {
  id: number;
  title: string;
  imageUrl: string;
  link: string;
  order: number;
  isActive: boolean;
  startDate: string;
  endDate: string;
}

const BannersManagePage: React.FC = () => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [banners, setBanners] = useState<Banner[]>([
    {
      id: 1,
      title: '신규 아티스트 특집',
      imageUrl: '/api/placeholder/1200/400',
      link: '/artists/new',
      order: 1,
      isActive: true,
      startDate: '2024-01-01',
      endDate: '2024-01-31',
    },
    {
      id: 2,
      title: '겨울 특별 전시',
      imageUrl: '/api/placeholder/1200/400',
      link: '/exhibitions/winter',
      order: 2,
      isActive: true,
      startDate: '2024-01-15',
      endDate: '2024-02-15',
    },
    {
      id: 3,
      title: '커뮤니티 이벤트',
      imageUrl: '/api/placeholder/1200/400',
      link: '/events/community',
      order: 3,
      isActive: false,
      startDate: '2024-02-01',
      endDate: '2024-02-28',
    },
  ]);

  const handleToggleActive = (bannerId: number) => {
    setBanners((prev) =>
      prev.map((banner) =>
        banner.id === bannerId
          ? { ...banner, isActive: !banner.isActive }
          : banner
      )
    );
  };

  const handleDelete = (bannerId: number) => {
    if (window.confirm('정말 이 배너를 삭제하시겠습니까?')) {
      setBanners((prev) => prev.filter((banner) => banner.id !== bannerId));
    }
  };

  const handleSaveOrder = () => {
    console.log('Save banner order:', banners);
    // API 호출
    alert('배너 순서가 저장되었습니다');
  };

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">배너 관리</h1>
          <p className="text-gray-600">메인 페이지 배너를 관리하고 수정할 수 있습니다</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={handleSaveOrder}
            className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition font-medium"
          >
            순서 저장
          </button>
          <button
            onClick={() => setShowAddModal(true)}
            className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700 transition flex items-center gap-2 font-medium shadow-lg"
          >
            <Plus size={20} />새 배너 추가
          </button>
        </div>
      </div>

      {/* Banners List */}
      <div className="space-y-4">
        {banners.map((banner) => (
          <div
            key={banner.id}
            className="bg-white rounded-xl shadow-sm hover:shadow-md transition overflow-hidden"
          >
            <div className="flex items-center">
              {/* Drag Handle */}
              <div className="px-4 cursor-move hover:bg-gray-50 flex items-center">
                <GripVertical size={20} className="text-gray-400" />
              </div>

              {/* Banner Preview */}
              <div className="w-48 h-24 bg-gradient-to-br from-purple-100 to-pink-100 flex items-center justify-center flex-shrink-0">
                <ImageIcon size={32} className="text-gray-400" />
              </div>

              {/* Banner Info */}
              <div className="flex-1 p-6">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h3 className="text-lg font-bold text-gray-900 mb-1">
                      {banner.title}
                    </h3>
                    <p className="text-sm text-gray-600">순서: {banner.order}</p>
                  </div>
                  <button
                    onClick={() => handleToggleActive(banner.id)}
                    className={`px-3 py-1.5 rounded-lg flex items-center gap-2 transition ${
                      banner.isActive
                        ? 'bg-green-100 text-green-700'
                        : 'bg-gray-100 text-gray-600'
                    }`}
                  >
                    {banner.isActive ? (
                      <>
                        <Eye size={16} />
                        <span className="text-sm font-medium">활성</span>
                      </>
                    ) : (
                      <>
                        <EyeOff size={16} />
                        <span className="text-sm font-medium">비활성</span>
                      </>
                    )}
                  </button>
                </div>

                <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
                  <span>링크: {banner.link}</span>
                  <span>•</span>
                  <span>
                    기간: {banner.startDate} ~ {banner.endDate}
                  </span>
                </div>
              </div>

              {/* Actions */}
              <div className="px-6 flex gap-2">
                <button
                  onClick={() => console.log('Edit banner:', banner.id)}
                  className="p-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
                >
                  <Edit2 size={18} />
                </button>
                <button
                  onClick={() => handleDelete(banner.id)}
                  className="p-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {banners.length === 0 && (
        <div className="text-center py-12 bg-white rounded-xl">
          <ImageIcon size={48} className="mx-auto text-gray-400 mb-4" />
          <p className="text-gray-500 mb-4">등록된 배너가 없습니다</p>
          <button
            onClick={() => setShowAddModal(true)}
            className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700 transition inline-flex items-center gap-2"
          >
            <Plus size={20} />새 배너 추가
          </button>
        </div>
      )}

      {/* Add Banner Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-2xl font-bold text-gray-900">새 배너 추가</h2>
            </div>
            <form className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  배너 제목
                </label>
                <input
                  type="text"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="배너 제목 입력"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  배너 이미지
                </label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-purple-500 transition">
                  <ImageIcon size={48} className="mx-auto text-gray-400 mb-4" />
                  <p className="text-sm text-gray-600 mb-2">
                    이미지를 드래그하거나 클릭하여 업로드
                  </p>
                  <p className="text-xs text-gray-500">권장 크기: 1200x400px</p>
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    id="banner-upload"
                  />
                  <label
                    htmlFor="banner-upload"
                    className="inline-block mt-4 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition cursor-pointer"
                  >
                    파일 선택
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  링크 URL
                </label>
                <input
                  type="text"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="/exhibitions/winter"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    시작 날짜
                  </label>
                  <input
                    type="date"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    종료 날짜
                  </label>
                  <input
                    type="date"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="is-active"
                  className="w-4 h-4 text-purple-600 rounded focus:ring-purple-500"
                />
                <label htmlFor="is-active" className="text-sm text-gray-700">
                  즉시 활성화
                </label>
              </div>

              <div className="flex gap-3 pt-4 border-t">
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

export default BannersManagePage;