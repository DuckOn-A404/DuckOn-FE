import React, { useEffect, useMemo, useState } from "react";
import { Search, Ban, Trash2, Mail, Calendar } from "lucide-react";
import { api } from "../../api/axiosInstance";

type ApiRole = "ADMIN" | "USER" | "BANNED";

interface ApiUser {
  id: number;
  email: string;
  userId: string;
  nickname: string;
  role: ApiRole;
  jointedAt: string;
  lastLoginAt: string | null;
  deleted: boolean;
  deletedAt: string | null;
}

interface ApiPageData {
  page: number; // 0-base
  size: number;
  totalElements: number;
  totalPages: number;
  items: ApiUser[];
}

interface ApiResponse<T> {
  status: number;
  message: string;
  data: T;
}

type UiRole = "전체 역할" | "관리자" | "일반 사용자";

interface UiUser {
  id: number;
  name: string; // nickname 표시
  email: string;
  role: "관리자" | "일반 사용자";
  jointedAt: string; // YYYY-MM-DD
  lastLogin: string; // YYYY-MM-DD HH:mm or "-"
  status: "정상" | "탈퇴";
}

const formatYmd = (iso?: string | null) => {
  if (!iso) return "-";
  return iso.slice(0, 10);
};

const formatLocalYmdHm = (iso?: string | null) => {
  if (!iso) return "-";
  const d = new Date(iso); // Z(UTC) 포함이면 로컬로 변환됨
  if (Number.isNaN(d.getTime())) return "-";

  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(
    d.getHours()
  )}:${pad(d.getMinutes())}`;
};

const mapApiToUiUser = (u: ApiUser): UiUser => ({
  id: u.id,
  name: u.nickname,
  email: u.email,
  role: u.role === "ADMIN" ? "관리자" : "일반 사용자",
  jointedAt: formatYmd(u.jointedAt),
  lastLogin: formatLocalYmdHm(u.lastLoginAt),
  status: u.deleted ? "탈퇴" : "정상",
});

const UserManagePage: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [filterRole, setFilterRole] = useState<UiRole>("전체 역할");
  const [selectedUsers, setSelectedUsers] = useState<number[]>([]);

  // pagination
  const [page, setPage] = useState(0); // 0-base
  const [size] = useState(20);

  // api data
  const [users, setUsers] = useState<UiUser[]>([]);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;

    const fetchUsers = async () => {
      setLoading(true);
      setErrorMsg(null);

      try {
        const res = await api.get<ApiResponse<ApiPageData>>("/admin/users", {
          params: { page: page + 1, size },
        });

        if (!alive) return;

        const data = res.data.data;
        setUsers((data.items ?? []).map(mapApiToUiUser));
        setTotalPages(data.totalPages ?? 0);
        setTotalElements(data.totalElements ?? 0);

        // 페이지 변경 시 선택 초기화
        setSelectedUsers([]);
      } catch (e: any) {
        if (!alive) return;
        setErrorMsg(
          e?.response?.data?.message ||
            "사용자 목록을 불러오지 못했습니다. 잠시 후 다시 시도해주세요."
        );
      } finally {
        if (!alive) return;
        setLoading(false);
      }
    };

    fetchUsers();
    return () => {
      alive = false;
    };
  }, [page, size]);

  // 현재 페이지 내에서만 검색/필터 (서버 검색 파라미터 없으니 FE에서 처리)
  const filteredUsers = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();

    return users.filter((user) => {
      const matchesSearch =
        !q ||
        user.name.toLowerCase().includes(q) ||
        user.email.toLowerCase().includes(q);

      const matchesRole =
        filterRole === "전체 역할" || user.role === filterRole;

      return matchesSearch && matchesRole;
    });
  }, [users, searchQuery, filterRole]);

  const handleSelectAll = (checked: boolean) => {
    if (checked) setSelectedUsers(filteredUsers.map((u) => u.id));
    else setSelectedUsers([]);
  };

  const handleSelectUser = (userId: number, checked: boolean) => {
    if (checked) setSelectedUsers((prev) => [...prev, userId]);
    else setSelectedUsers((prev) => prev.filter((id) => id !== userId));
  };

  // 아직 차단/삭제 API 없으니 버튼은 “disabled”로 두기
  const handleUserAction = (action: string) => {
    console.log(`Action: ${action}`, selectedUsers);
  };

  const canPrev = page > 0;
  const canNext = page + 1 < totalPages;

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">사용자 관리</h1>
        <p className="text-gray-600">전체 사용자 정보를 확인하고 관리할 수 있습니다</p>
      </div>

      {/* Search and Filter Bar */}
      <div className="bg-white rounded-xl p-6 shadow-sm mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              size={20}
            />
            <input
              type="text"
              placeholder="닉네임 또는 이메일로 검색..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>

          <select
            value={filterRole}
            onChange={(e) => setFilterRole(e.target.value as UiRole)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          >
            <option>전체 역할</option>
            <option>관리자</option>
            <option>일반 사용자</option>
          </select>
        </div>

        {/* Bulk Actions (현재는 API 없으니 비활성) */}
        {selectedUsers.length > 0 && (
          <div className="mt-4 flex items-center gap-3 p-3 bg-purple-50 rounded-lg">
            <span className="text-sm font-medium text-purple-900">
              {selectedUsers.length}명 선택됨
            </span>

            <button
              disabled
              onClick={() => handleUserAction("block")}
              className="px-3 py-1.5 bg-yellow-500 text-white text-sm rounded-lg opacity-50 cursor-not-allowed transition flex items-center gap-1"
              title="차단 API 준비 중"
            >
              <Ban size={16} />
              차단
            </button>

            <button
              disabled
              onClick={() => handleUserAction("delete")}
              className="px-3 py-1.5 bg-red-500 text-white text-sm rounded-lg opacity-50 cursor-not-allowed transition flex items-center gap-1"
              title="탈퇴 API 준비 중"
            >
              <Trash2 size={16} />
              탈퇴
            </button>
          </div>
        )}
      </div>

      {/* Error */}
      {errorMsg && (
        <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {errorMsg}
        </div>
      )}

      {/* Users Table */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        {/* top bar: count + pagination */}
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <div className="text-sm text-gray-600">
            총{" "}
            <span className="font-semibold text-gray-900">{totalElements}</span>
            명
            {loading && <span className="ml-2 text-gray-400">불러오는 중...</span>}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage(0)}
              disabled={!canPrev || loading}
              className="px-3 py-1.5 rounded-lg border text-sm disabled:opacity-40"
            >
              처음
            </button>
            <button
              onClick={() => canPrev && setPage((p) => p - 1)}
              disabled={!canPrev || loading}
              className="px-3 py-1.5 rounded-lg border text-sm disabled:opacity-40"
            >
              이전
            </button>

            <div className="px-3 py-1.5 text-sm text-gray-700">
              <span className="font-semibold">{page + 1}</span> /{" "}
              <span>{Math.max(totalPages, 1)}</span>
            </div>

            <button
              onClick={() => canNext && setPage((p) => p + 1)}
              disabled={!canNext || loading}
              className="px-3 py-1.5 rounded-lg border text-sm disabled:opacity-40"
            >
              다음
            </button>
            <button
              onClick={() => totalPages > 0 && setPage(totalPages - 1)}
              disabled={!canNext || loading}
              className="px-3 py-1.5 rounded-lg border text-sm disabled:opacity-40"
            >
              마지막
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-4 text-left w-12">
                  <input
                    type="checkbox"
                    checked={
                      selectedUsers.length === filteredUsers.length &&
                      filteredUsers.length > 0
                    }
                    onChange={(e) => handleSelectAll(e.target.checked)}
                    className="w-4 h-4 text-purple-600 rounded focus:ring-purple-500"
                  />
                </th>

                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 w-20">
                  ID
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 w-32">
                  이름
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 w-48">
                  이메일
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 w-28">
                  역할
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 w-32">
                  가입일
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 w-40">
                  마지막 로그인
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 w-24">
                  상태
                </th>

                {/* 작업 컬럼 완전 제거 */}
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-200">
              {filteredUsers.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50 transition">
                  <td className="px-6 py-4">
                    <input
                      type="checkbox"
                      checked={selectedUsers.includes(user.id)}
                      onChange={(e) => handleSelectUser(user.id, e.target.checked)}
                      className="w-4 h-4 text-purple-600 rounded focus:ring-purple-500"
                    />
                  </td>

                  <td className="px-6 py-4 text-sm font-medium text-gray-900 whitespace-nowrap">
                    #{user.id}
                  </td>

                  <td className="px-6 py-4 text-sm text-gray-900 whitespace-nowrap">
                    <div className="max-w-[120px] truncate" title={user.name}>
                      {user.name}
                    </div>
                  </td>

                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Mail size={14} className="flex-shrink-0" />
                      <span className="max-w-[200px] truncate" title={user.email}>
                        {user.email}
                      </span>
                    </div>
                  </td>

                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`inline-flex px-3 py-1 rounded-full text-xs font-medium ${
                        user.role === "관리자"
                          ? "bg-purple-100 text-purple-700"
                          : "bg-gray-100 text-gray-700"
                      }`}
                    >
                      {user.role}
                    </span>
                  </td>

                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Calendar size={14} />
                      {user.jointedAt}
                    </div>
                  </td>

                  <td className="px-6 py-4 text-sm text-gray-600 whitespace-nowrap">
                    {user.lastLogin}
                  </td>

                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`inline-flex px-3 py-1 rounded-full text-xs font-medium ${
                        user.status === "정상"
                          ? "bg-green-100 text-green-700"
                          : "bg-gray-100 text-gray-700"
                      }`}
                    >
                      {user.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {!loading && filteredUsers.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500">검색 결과가 없습니다</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserManagePage;
