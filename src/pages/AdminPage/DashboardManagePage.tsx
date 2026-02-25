import React, { useState } from 'react';
import {
  Users,
  UserCheck,
  Flag,
  UserPlus,
  TrendingUp,
  TrendingDown,
  Download,
} from 'lucide-react';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

interface StatCardProps {
  title: string;
  value: string | number;
  change: number;
  icon: React.ReactNode;
  iconBg: string;
}

const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  change,
  icon,
  iconBg,
}) => {
  const isPositive = change >= 0;

  return (
    <div className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-gray-600 mb-1">{title}</p>
          <h3 className="text-3xl font-bold text-gray-900 mb-2">{value.toLocaleString()}</h3>
          <div className="flex items-center gap-1">
            {isPositive ? (
              <TrendingUp size={16} className="text-green-500" />
            ) : (
              <TrendingDown size={16} className="text-red-500" />
            )}
            <span
              className={`text-sm font-semibold ${
                isPositive ? 'text-green-500' : 'text-red-500'
              }`}
            >
              {isPositive ? '+' : ''}
              {change}%
            </span>
          </div>
        </div>
        <div className={`${iconBg} p-3 rounded-lg`}>{icon}</div>
      </div>
    </div>
  );
};

const DashboardManagePage: React.FC = () => {
  const [timeRange, setTimeRange] = useState<'7' | '30' | '90'>('7');

  // Mock data - 실제로는 API에서 가져와야 합니다
  const stats = {
    totalUsers: 15847,
    totalUsersChange: 12.5,
    dailyActiveUsers: 1234,
    dailyActiveUsersChange: 8.2,
    totalReports: 45,
    totalReportsChange: -3.1,
    newSignups: 328,
    newSignupsChange: 15.8,
  };

  // 일일 활성 사용자 추이 (라인 차트)
  const activeUsersData = [
    { date: '1월 2일', users: 450 },
    { date: '1월 4일', users: 520 },
    { date: '1월 6일', users: 480 },
    { date: '1월 8일', users: 590 },
    { date: '1월 10일', users: 710 },
    { date: '1월 12일', users: 850 },
    { date: '1월 14일', users: 1050 },
    { date: '1월 16일', users: 1180 },
    { date: '1월 18일', users: 1280 },
    { date: '1월 20일', users: 1234 },
  ];

  // 신규 가입자 추이 (막대 차트)
  const newSignupsData = [
    { date: '1월 2일', signups: 12 },
    { date: '1월 4일', signups: 15 },
    { date: '1월 6일', signups: 18 },
    { date: '1월 8일', signups: 20 },
    { date: '1월 10일', signups: 25 },
    { date: '1월 12일', signups: 32 },
    { date: '1월 14일', signups: 38 },
    { date: '1월 16일', signups: 45 },
    { date: '1월 18일', signups: 52 },
    { date: '1월 20일', signups: 48 },
  ];

  const handleExport = () => {
    // 리포트 다운로드 로직
    console.log('Exporting report...');
  };

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">대시보드</h1>
          <p className="text-gray-600">전체 시스템 현황을 한눈에 확인하세요</p>
        </div>
        <div className="flex items-center gap-3">
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value as '7' | '30' | '90')}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          >
            <option value="7">최근 7일</option>
            <option value="30">최근 30일</option>
            <option value="90">최근 90일</option>
          </select>
          <button
            onClick={handleExport}
            className="px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700 transition flex items-center gap-2"
          >
            <Download size={18} />
            리포트 다운로드
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          title="전체 사용자 수"
          value={stats.totalUsers}
          change={stats.totalUsersChange}
          icon={<Users className="text-blue-600" size={24} />}
          iconBg="bg-blue-100"
        />
        <StatCard
          title="일일 사용자 수"
          value={stats.dailyActiveUsers}
          change={stats.dailyActiveUsersChange}
          icon={<UserCheck className="text-green-600" size={24} />}
          iconBg="bg-green-100"
        />
        <StatCard
          title="접수된 신고 수"
          value={stats.totalReports}
          change={stats.totalReportsChange}
          icon={<Flag className="text-red-600" size={24} />}
          iconBg="bg-red-100"
        />
        <StatCard
          title="신규 가입자 수"
          value={stats.newSignups}
          change={stats.newSignupsChange}
          icon={<UserPlus className="text-yellow-600" size={24} />}
          iconBg="bg-yellow-100"
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Active Users Chart */}
        <div className="bg-white rounded-xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-bold text-gray-900">일일 사용자 추이</h2>
              <p className="text-sm text-gray-600 mt-1">활성 사용자</p>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-gradient-to-r from-purple-600 to-pink-600"></div>
              <span className="text-sm text-gray-600">활성 사용자</span>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={activeUsersData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis
                dataKey="date"
                tick={{ fontSize: 12 }}
                stroke="#9ca3af"
              />
              <YAxis tick={{ fontSize: 12 }} stroke="#9ca3af" />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#fff',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                }}
              />
              <Line
                type="monotone"
                dataKey="users"
                stroke="url(#colorGradient)"
                strokeWidth={3}
                dot={{ fill: '#9333ea', r: 4 }}
                activeDot={{ r: 6 }}
              />
              <defs>
                <linearGradient id="colorGradient" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="#9333ea" />
                  <stop offset="100%" stopColor="#ec4899" />
                </linearGradient>
              </defs>
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* New Signups Chart */}
        <div className="bg-white rounded-xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-bold text-gray-900">신규 가입자 추이</h2>
              <p className="text-sm text-gray-600 mt-1">신규 가입</p>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-blue-500"></div>
              <span className="text-sm text-gray-600">신규 가입</span>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={newSignupsData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis
                dataKey="date"
                tick={{ fontSize: 12 }}
                stroke="#9ca3af"
              />
              <YAxis tick={{ fontSize: 12 }} stroke="#9ca3af" />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#fff',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                }}
              />
              <Bar dataKey="signups" fill="#3b82f6" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default DashboardManagePage;