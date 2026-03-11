import React, { useState } from 'react';
import { useNavigate, Outlet, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  Palette,
  Flag,
  Search,
  Settings,
  ChevronLeft,
  LogOut,
  Menu,
  FileEdit,
  ShieldBan
} from 'lucide-react';

const AdminPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const menuItems = [
    { path: '/admin', icon: LayoutDashboard, label: '대시보드', exact: true },
    { path: '/admin/users', icon: Users, label: '사용자 관리' },
    { path: '/admin/artists', icon: Palette, label: '아티스트 관리' },
    { path: '/admin/artists-requests', icon: FileEdit, label: '아티스트 정보 변경 요청' },
    { path: '/admin/reports', icon: Flag, label: '신고 관리' },
    { path: '/admin/penalties', icon: ShieldBan, label: '패널티 관리' },
    { path: '/admin/search-placeholder', icon: Search, label: '검색어 추천 관리' },
    { path: '/admin/settings', icon: Settings, label: '설정' },
  ];

  const isActive = (path: string, exact?: boolean) => {
    if (exact) {
      return location.pathname === path;
    }
    return location.pathname === path || location.pathname.startsWith(path + '/')
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <aside
        className={`${
          sidebarCollapsed ? 'w-20' : 'w-64'
        } bg-gradient-to-b from-slate-900 to-slate-800 text-white transition-all duration-300 flex flex-col shadow-xl`}
      >
        {/* Header */}
        <div className="p-6 flex items-center justify-between border-b border-slate-700">
          {!sidebarCollapsed && (
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                관리자 페이지
              </h1>
            </div>
          )}
          <button
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            className="p-2 hover:bg-slate-700 rounded-lg transition"
          >
            {sidebarCollapsed ? <Menu size={20} /> : <ChevronLeft size={20} />}
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.path, item.exact);

            return (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                  active
                    ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg'
                    : 'text-gray-300 hover:bg-slate-700 hover:text-white'
                }`}
              >
                <Icon size={20} />
                {!sidebarCollapsed && (
                  <span className="font-medium">{item.label}</span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-slate-700">
          <button
            onClick={() => navigate('/')}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-gray-300 hover:bg-slate-700 hover:text-white transition"
          >
            <LogOut size={20} />
            {!sidebarCollapsed && <span className="font-medium">메인으로</span>}
          </button>
        </div>
      </aside>

      {/* Main Content - Outlet으로 자식 라우트 렌더링 */}
      <main className="flex-1 overflow-auto">
        <Outlet />
      </main>
    </div>
  );
};

export default AdminPage;