import React, { useState } from 'react';
import {
  Bell,
  Shield,
  Database,
  Globe,
  Save,
} from 'lucide-react';

const SettingsManagePage: React.FC = () => {
  const [settings, setSettings] = useState({
    // 알림 설정
    emailNotifications: true,
    reportNotifications: true,
    systemNotifications: false,

    // 보안 설정
    twoFactorAuth: true,
    sessionTimeout: 30,
    passwordExpiry: 90,

    // 시스템 설정
    maintenanceMode: false,
    backupFrequency: 'daily',
    maxUploadSize: 10,

    // 이메일 설정
    smtpHost: 'smtp.duckon.site',
    smtpPort: 587,
    senderEmail: 'noreply@duckon.site',

    // 사이트 설정
    siteName: 'DuckOn',
    siteDescription: 'K-POP 팬들을 위한 글로벌 커뮤니티',
    defaultLanguage: 'ko',
  });

  const handleSave = () => {
    console.log('Save settings:', settings);
    alert('설정이 저장되었습니다');
  };

  const handleChange = (key: string, value: any) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  };

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">설정</h1>
          <p className="text-gray-600">시스템 전체 설정을 관리합니다</p>
        </div>
        <button
          onClick={handleSave}
          className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700 transition flex items-center gap-2 font-medium shadow-lg"
        >
          <Save size={20} />
          설정 저장
        </button>
      </div>

      <div className="space-y-6">
        {/* Notification Settings */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Bell className="text-purple-600" size={24} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">알림 설정</h2>
              <p className="text-sm text-gray-600">
                시스템 알림 및 이메일 설정을 관리합니다
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium text-gray-900">이메일 알림</h3>
                <p className="text-sm text-gray-600">
                  중요한 업데이트를 이메일로 받습니다
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.emailNotifications}
                  onChange={(e) =>
                    handleChange('emailNotifications', e.target.checked)
                  }
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
              </label>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium text-gray-900">신고 알림</h3>
                <p className="text-sm text-gray-600">
                  새로운 신고가 접수되면 알림을 받습니다
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.reportNotifications}
                  onChange={(e) =>
                    handleChange('reportNotifications', e.target.checked)
                  }
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
              </label>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium text-gray-900">시스템 알림</h3>
                <p className="text-sm text-gray-600">
                  시스템 업데이트 및 유지보수 알림
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.systemNotifications}
                  onChange={(e) =>
                    handleChange('systemNotifications', e.target.checked)
                  }
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
              </label>
            </div>
          </div>
        </div>

        {/* Security Settings */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-red-100 rounded-lg">
              <Shield className="text-red-600" size={24} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">보안 설정</h2>
              <p className="text-sm text-gray-600">
                계정 보안 및 인증 설정을 관리합니다
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium text-gray-900">2단계 인증</h3>
                <p className="text-sm text-gray-600">
                  추가 보안을 위한 2단계 인증 활성화
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.twoFactorAuth}
                  onChange={(e) => handleChange('twoFactorAuth', e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
              </label>
            </div>

            <div>
              <label className="block font-medium text-gray-900 mb-2">
                세션 타임아웃 (분)
              </label>
              <input
                type="number"
                value={settings.sessionTimeout}
                onChange={(e) =>
                  handleChange('sessionTimeout', parseInt(e.target.value))
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block font-medium text-gray-900 mb-2">
                비밀번호 만료 기간 (일)
              </label>
              <input
                type="number"
                value={settings.passwordExpiry}
                onChange={(e) =>
                  handleChange('passwordExpiry', parseInt(e.target.value))
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>

        {/* System Settings */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Database className="text-blue-600" size={24} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">시스템 설정</h2>
              <p className="text-sm text-gray-600">
                시스템 동작 및 유지보수 설정
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium text-gray-900">유지보수 모드</h3>
                <p className="text-sm text-gray-600">
                  활성화 시 일반 사용자 접근이 차단됩니다
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.maintenanceMode}
                  onChange={(e) =>
                    handleChange('maintenanceMode', e.target.checked)
                  }
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
              </label>
            </div>

            <div>
              <label className="block font-medium text-gray-900 mb-2">
                백업 주기
              </label>
              <select
                value={settings.backupFrequency}
                onChange={(e) => handleChange('backupFrequency', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              >
                <option value="hourly">매시간</option>
                <option value="daily">매일</option>
                <option value="weekly">매주</option>
                <option value="monthly">매월</option>
              </select>
            </div>

            <div>
              <label className="block font-medium text-gray-900 mb-2">
                최대 업로드 크기 (MB)
              </label>
              <input
                type="number"
                value={settings.maxUploadSize}
                onChange={(e) =>
                  handleChange('maxUploadSize', parseInt(e.target.value))
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>

        {/* Site Settings */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-green-100 rounded-lg">
              <Globe className="text-green-600" size={24} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">사이트 설정</h2>
              <p className="text-sm text-gray-600">
                기본 사이트 정보 및 언어 설정
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block font-medium text-gray-900 mb-2">
                사이트 이름
              </label>
              <input
                type="text"
                value={settings.siteName}
                onChange={(e) => handleChange('siteName', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block font-medium text-gray-900 mb-2">
                사이트 설명
              </label>
              <textarea
                value={settings.siteDescription}
                onChange={(e) => handleChange('siteDescription', e.target.value)}
                rows={3}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block font-medium text-gray-900 mb-2">
                기본 언어
              </label>
              <select
                value={settings.defaultLanguage}
                onChange={(e) => handleChange('defaultLanguage', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              >
                <option value="ko">한국어</option>
                <option value="en">English</option>
                <option value="ja">日本語</option>
              </select>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsManagePage;