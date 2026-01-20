import React, { useState } from 'react';
import { AlertCircle, Clock, CheckCircle, X, Trash2 } from 'lucide-react';

interface Report {
  id: number;
  type: string;
  target: string;
  reporter: string;
  reportedAt: string;
  status: '대기중' | '해결됨' | '조사중' | '반려됨';
  priority: '높음' | '보통' | '낮음';
  content: string;
  targetUserId: string;
}

const ReportManagePage: React.FC = () => {
  const [filterStatus, setFilterStatus] = useState<'전체' | '대기중' | '해결됨' | '조사중' | '반려됨'>('전체');
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);

  // Mock data
  const reports: Report[] = [
    {
      id: 1,
      type: '부적절한 콘텐츠',
      target: '작품 ID: 1234',
      reporter: 'user_5678',
      reportedAt: '2024-01-15 14:30',
      status: '대기중',
      priority: '높음',
      content: '작품에 부적절한 이미지가 포함되어 있습니다.',
      targetUserId: 'user_1234',
    },
    {
      id: 2,
      type: '스팸',
      target: '아티스트: 홍길동',
      reporter: 'user_9012',
      reportedAt: '2024-01-14 10:15',
      status: '대기중',
      priority: '보통',
      content: '반복적으로 스팸 메시지를 보내고 있습니다.',
      targetUserId: 'user_2345',
    },
    {
      id: 3,
      type: '저작권 침해',
      target: '작품 ID: 5678',
      reporter: 'user_3456',
      reportedAt: '2024-01-13 16:45',
      status: '해결됨',
      priority: '높음',
      content: '타인의 작품을 무단으로 사용하고 있습니다.',
      targetUserId: 'user_3456',
    },
    {
      id: 4,
      type: '욕설/비방',
      target: '댓글 ID: 7890',
      reporter: 'user_2345',
      reportedAt: '2024-01-12 09:20',
      status: '해결됨',
      priority: '보통',
      content: '댓글에서 다른 사용자를 비방하고 있습니다.',
      targetUserId: 'user_4567',
    },
    {
      id: 5,
      type: '사기',
      target: '아티스트: 김철수',
      reporter: 'user_6789',
      reportedAt: '2024-01-11 13:50',
      status: '조사중',
      priority: '높음',
      content: '허위 작품을 판매하려고 시도하고 있습니다.',
      targetUserId: 'user_5678',
    },
  ];

  const filteredReports = reports.filter(
    (report) => filterStatus === '전체' || report.status === filterStatus
  );

  const getStatusBadge = (status: Report['status']) => {
    const styles = {
      대기중: 'bg-yellow-100 text-yellow-700',
      해결됨: 'bg-green-100 text-green-700',
      조사중: 'bg-blue-100 text-blue-700',
      반려됨: 'bg-gray-100 text-gray-700',
    };

    const icons = {
      대기중: Clock,
      해결됨: CheckCircle,
      조사중: AlertCircle,
      반려됨: X,
    };

    const Icon = icons[status];

    return (
      <span
        className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${styles[status]}`}
      >
        <Icon size={14} />
        {status}
      </span>
    );
  };

  const getPriorityBadge = (priority: Report['priority']) => {
    const styles = {
      높음: 'bg-red-100 text-red-700',
      보통: 'bg-yellow-100 text-yellow-700',
      낮음: 'bg-gray-100 text-gray-700',
    };

    return (
      <span
        className={`inline-flex px-2 py-1 rounded text-xs font-medium ${styles[priority]}`}
      >
        {priority}
      </span>
    );
  };

  const handleStatusChange = (reportId: number, newStatus: Report['status']) => {
    console.log('Change status:', reportId, newStatus);
    // API 호출
    setSelectedReport(null);
  };

  const handleDeleteUser = (userId: string) => {
    if (window.confirm('정말 이 사용자를 영구 삭제하시겠습니까?')) {
      console.log('Delete user:', userId);
      // API 호출
      setSelectedReport(null);
    }
  };

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">신고 관리</h1>
        <p className="text-gray-600">접수된 신고를 확인하고 처리할 수 있습니다</p>
      </div>

      {/* Filter Bar */}
      <div className="bg-white rounded-xl p-6 shadow-sm mb-6">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-gray-700">상태:</span>
          <div className="flex gap-2">
            {['전체', '대기중', '조사중', '해결됨', '반려됨'].map((status) => (
              <button
                key={status}
                onClick={() => setFilterStatus(status as any)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                  filterStatus === status
                    ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {status}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Reports Table */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                  ID
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                  신고 유형
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                  신고 대상
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                  신고자
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                  신고 일시
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                  상태
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                  우선순위
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                  작업
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredReports.map((report) => (
                <tr key={report.id} className="hover:bg-gray-50 transition">
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">
                    #{report.id}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    {report.type}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {report.target}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {report.reporter}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {report.reportedAt}
                  </td>
                  <td className="px-6 py-4">{getStatusBadge(report.status)}</td>
                  <td className="px-6 py-4">{getPriorityBadge(report.priority)}</td>
                  <td className="px-6 py-4">
                    <button
                      onClick={() => setSelectedReport(report)}
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
        {filteredReports.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500">신고 내역이 없습니다</p>
          </div>
        )}
      </div>

      {/* Detail Modal */}
      {selectedReport && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900">신고 상세 정보</h2>
              <button
                onClick={() => setSelectedReport(null)}
                className="p-2 hover:bg-gray-100 rounded-lg transition"
              >
                <X size={24} />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 space-y-6">
              {/* Basic Info */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600 mb-1">신고 ID</p>
                  <p className="text-lg font-bold text-gray-900">
                    #{selectedReport.id}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">신고 유형</p>
                  <p className="text-lg font-bold text-gray-900">
                    {selectedReport.type}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600 mb-1">신고 대상</p>
                  <p className="text-base text-gray-900">{selectedReport.target}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">신고자</p>
                  <p className="text-base text-gray-900">{selectedReport.reporter}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600 mb-1">신고 일시</p>
                  <p className="text-base text-gray-900">
                    {selectedReport.reportedAt}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">대상 사용자 ID</p>
                  <p className="text-base text-gray-900">
                    {selectedReport.targetUserId}
                  </p>
                </div>
              </div>

              {/* Content */}
              <div>
                <p className="text-sm text-gray-600 mb-2">신고 내용</p>
                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="text-gray-900">{selectedReport.content}</p>
                </div>
              </div>

              {/* Status and Priority */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600 mb-2">현재 상태</p>
                  {getStatusBadge(selectedReport.status)}
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-2">우선순위</p>
                  {getPriorityBadge(selectedReport.priority)}
                </div>
              </div>

              {/* Status Change Buttons */}
              <div>
                <p className="text-sm font-medium text-gray-700 mb-3">상태 변경</p>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleStatusChange(selectedReport.id, '조사중')}
                    className="px-4 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition"
                  >
                    조사중으로 변경
                  </button>
                  <button
                    onClick={() => handleStatusChange(selectedReport.id, '해결됨')}
                    className="px-4 py-2 bg-green-50 text-green-600 rounded-lg hover:bg-green-100 transition"
                  >
                    해결됨으로 변경
                  </button>
                </div>
              </div>

              {/* User Actions */}
              <div className="border-t pt-6">
                <p className="text-sm font-medium text-gray-700 mb-3">계정 관리</p>
                <button
                  onClick={() => handleDeleteUser(selectedReport.targetUserId)}
                  className="w-full px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition flex items-center justify-center gap-2 font-medium"
                >
                  <Trash2 size={20} />
                  신고된 사용자 계정 삭제
                </button>
              </div>

              {/* History */}
              <div>
                <p className="text-sm font-medium text-gray-700 mb-3">신고 내역 삭제</p>
                <button className="w-full px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition flex items-center justify-center gap-2">
                  <X size={20} />
                  신고 내역 삭제
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReportManagePage;