import React, { useState, useEffect } from "react";
import { Plus, Trash2, Save, MoveUp, MoveDown, Search } from "lucide-react";
import { api } from "../../api/axiosInstance";
import { useToast } from "../../hooks/useToast";

const PlaceholderManagePage: React.FC = () => {
  const [items, setItems] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const { showToast } = useToast();

  useEffect(() => {
    fetchPlaceholders();
  }, []);

  const fetchPlaceholders = async () => {
    setLoading(true);
    try {
      const res = await api.get("/home/search-placeholder");
      setItems(res.data?.data?.items || []);
    } catch (e) {
      console.error("플레이스홀더 조회 실패:", e);
      showToast("플레이스홀더 목록을 불러오는데 실패했습니다.", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    const validItems = items.map((i) => i.trim()).filter((i) => i !== "");
    
    if (validItems.length === 0) {
      showToast("최소 1개 이상의 검색어를 입력해주세요.", "error");
      return;
    }

    setSaving(true);
    try {
      await api.put("/admin/home/search-placeholder", {
        items: validItems,
      });
      showToast("검색어 목록이 저장되었습니다.", "success");
      setItems(validItems); // 정리된 값으로 업데이트
    } catch (e) {
      console.error("플레이스홀더 저장 실패:", e);
      showToast("검색어 저장에 실패했습니다.", "error");
    } finally {
      setSaving(false);
    }
  };

  const handleAddItem = () => {
    setItems([...items, ""]);
  };

  const handleRemoveItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const handleChangeItem = (index: number, value: string) => {
    const newItems = [...items];
    newItems[index] = value;
    setItems(newItems);
  };

  const handleMoveUp = (index: number) => {
    if (index === 0) return;
    const newItems = [...items];
    const temp = newItems[index - 1];
    newItems[index - 1] = newItems[index];
    newItems[index] = temp;
    setItems(newItems);
  };

  const handleMoveDown = (index: number) => {
    if (index === items.length - 1) return;
    const newItems = [...items];
    const temp = newItems[index + 1];
    newItems[index + 1] = newItems[index];
    newItems[index] = temp;
    setItems(newItems);
  };

  return (
    <div className="p-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">검색창 추천어 관리</h1>
          <p className="text-gray-500 mt-2">
            홈 화면 검색창에 롤링되어 표시될 추천 검색어를 관리합니다.
          </p>
        </div>
        <button
          onClick={handleSave}
          disabled={saving || loading}
          className="flex items-center gap-2 px-6 py-2.5 bg-gray-900 text-white rounded-xl hover:bg-gray-800 transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Save size={18} />
          <span className="font-semibold">{saving ? "저장 중..." : "변경사항 저장"}</span>
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
          <div className="flex items-center gap-2 text-gray-700 font-semibold">
            <Search size={18} />
            <h2>추천 검색어 목록</h2>
          </div>
          <button
            onClick={handleAddItem}
            className="flex items-center gap-1.5 px-4 py-2 bg-purple-50 text-purple-700 rounded-lg hover:bg-purple-100 transition font-medium text-sm"
          >
            <Plus size={16} />
            <span>추가하기</span>
          </button>
        </div>

        <div className="p-6">
          {loading ? (
            <div className="text-center py-12 text-gray-500">
              데이터를 불러오는 중입니다...
            </div>
          ) : items.length === 0 ? (
            <div className="text-center py-12 text-gray-400 border-2 border-dashed border-gray-200 rounded-xl">
              등록된 검색어가 없습니다. 추가하기 버튼을 눌러 시작하세요.
            </div>
          ) : (
            <div className="space-y-3">
              {items.map((item, index) => (
                <div
                  key={index}
                  className="flex items-center gap-3 p-3 bg-white border border-gray-200 rounded-xl group hover:border-purple-300 transition-colors shadow-sm"
                >
                  <div className="flex flex-col gap-1 text-gray-400">
                    <button
                      onClick={() => handleMoveUp(index)}
                      disabled={index === 0}
                      className="p-1 hover:text-gray-900 hover:bg-gray-100 rounded disabled:opacity-30 disabled:hover:bg-transparent"
                    >
                      <MoveUp size={14} />
                    </button>
                    <button
                      onClick={() => handleMoveDown(index)}
                      disabled={index === items.length - 1}
                      className="p-1 hover:text-gray-900 hover:bg-gray-100 rounded disabled:opacity-30 disabled:hover:bg-transparent"
                    >
                      <MoveDown size={14} />
                    </button>
                  </div>
                  
                  <div className="flex-1 relative">
                    <input
                      type="text"
                      value={item}
                      onChange={(e) => handleChangeItem(index, e.target.value)}
                      placeholder="예: 아이유 콘서트"
                      className="w-full pl-4 pr-10 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:bg-white transition text-gray-900 font-medium"
                    />
                  </div>

                  <button
                    onClick={() => handleRemoveItem(index)}
                    className="p-3 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                    title="삭제"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PlaceholderManagePage;
