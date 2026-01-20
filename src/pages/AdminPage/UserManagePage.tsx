import React, { useState } from 'react';
import { Search, Ban, Trash2, Mail, Calendar } from 'lucide-react';

interface User {
  id: number;
  name: string;
  email: string;
  role: '일반 사용자' | '아티스트';
  joinedAt: string;
  lastLogin: string;
  status: '활성' | '비활성';
}

const UserManagePage: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterRole, setFilterRole] = useState<'전체 역할' | '일반 사용자' | '아티스트'>('전체 역할');
  const [selectedUsers, setSelectedUsers] = useState<number[]>([]);

  // Mock data
  const users: User[] = [
    {
      id: 1,
      name: '김민수',
      email: 'minsu.kim@example.com',
      role: '일반 사용자',
      joinedAt: '2023-08-15',
      lastLogin: '2024-01-15 14:30',
      status: '활성',
    },
    {
      id: 2,
      name: '이영희',
      email: 'younghee.lee@example.com',
      role: '아티스트',
      joinedAt: '2023-07-20',
      lastLogin: '2024-01-14 10:15',
      status: '활성',
    },
    {
      id: 3,
      name: '박철수',
      email: 'chulsoo.park@example.com',
      role: '일반 사용자',
      joinedAt: '2023-09-10',
      lastLogin: '2023-12-20 16:45',
      status: '비활성',
    },
    {
      id: 4,
      name: '정수진',
      email: 'sujin.jung@example.com',
      role: '아티스트',
      joinedAt: '2023-06-05',
      lastLogin: '2024-01-15 09:20',
      status: '활성',
    },
  ];

  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRole = filterRole === '전체 역할' || user.role === filterRole;
    return matchesSearch && matchesRole;
  });

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedUsers(filteredUsers.map((u) => u.id));
    } else {
      setSelectedUsers([]);
    }
  };

  const handleSelectUser = (userId: number, checked: boolean) => {
    if (checked) {
      setSelectedUsers([...selectedUsers, userId]);
    } else {
      setSelectedUsers(selectedUsers.filter((id) => id !== userId));
    }
  };

  const handleUserAction = (action: string, userId?: number) => {
    console.log(`Action: ${action}`, userId || selectedUsers);
    // 실제 API 호출 로직
  };

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
              placeholder="이름 또는 이메일로 검색..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>
          <select
            value={filterRole}
            onChange={(e) => setFilterRole(e.target.value as any)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          >
            <option>전체 역할</option>
            <option>일반 사용자</option>
            <option>아티스트</option>
          </select>
        </div>

        {/* Bulk Actions */}
        {selectedUsers.length > 0 && (
          <div className="mt-4 flex items-center gap-3 p-3 bg-purple-50 rounded-lg">
            <span className="text-sm font-medium text-purple-900">
              {selectedUsers.length}명 선택됨
            </span>
            <button
              onClick={() => handleUserAction('block')}
              className="px-3 py-1.5 bg-yellow-500 text-white text-sm rounded-lg hover:bg-yellow-600 transition flex items-center gap-1"
            >
              <Ban size={16} />
              차단
            </button>
            <button
              onClick={() => handleUserAction('delete')}
              className="px-3 py-1.5 bg-red-500 text-white text-sm rounded-lg hover:bg-red-600 transition flex items-center gap-1"
            >
              <Trash2 size={16} />
              삭제
            </button>
          </div>
        )}
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-4 text-left">
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
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                  ID
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                  이름
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                  이메일
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                  역할
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                  가입일
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                  마지막 로그인
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                  상태
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                  작업
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredUsers.map((user) => (
                <tr
                  key={user.id}
                  className="hover:bg-gray-50 transition"
                >
                  <td className="px-6 py-4">
                    <input
                      type="checkbox"
                      checked={selectedUsers.includes(user.id)}
                      onChange={(e) => handleSelectUser(user.id, e.target.checked)}
                      className="w-4 h-4 text-purple-600 rounded focus:ring-purple-500"
                    />
                  </td>
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">
                    #{user.id}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">{user.name}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Mail size={14} />
                      {user.email}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`inline-flex px-3 py-1 rounded-full text-xs font-medium ${
                        user.role === '아티스트'
                          ? 'bg-purple-100 text-purple-700'
                          : 'bg-gray-100 text-gray-700'
                      }`}
                    >
                      {user.role}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Calendar size={14} />
                      {user.joinedAt}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {user.lastLogin}
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`inline-flex px-3 py-1 rounded-full text-xs font-medium ${
                        user.status === '활성'
                          ? 'bg-green-100 text-green-700'
                          : 'bg-gray-100 text-gray-700'
                      }`}
                    >
                      {user.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <button
                      onClick={() => handleUserAction('detail', user.id)}
                      className="text-purple-600 hover:text-purple-700 text-sm font-medium"
                    >
                      상세보기
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Empty State */}
        {filteredUsers.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500">검색 결과가 없습니다</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserManagePage;