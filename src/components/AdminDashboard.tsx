import React, { useCallback, useEffect, useState } from 'react';
import { Activity, AlertTriangle, FileText, Loader2, RefreshCw, Search, Users } from 'lucide-react';

interface AdminOverview {
  users: number;
  interactions: number;
  pageViews: number;
  consultations: number;
  violations: number;
}

interface AdminUser {
  id: number;
  full_name: string;
  email: string;
  role: 'citizen' | 'admin';
  created_at: string;
}

interface UserInteraction {
  activity_type: string;
  id: number;
  user_id: number | null;
  full_name: string | null;
  email: string | null;
  summary: string;
  detail: string | null;
  created_at: string;
}

interface Props {
  currentUserId: number;
}

const CARDS: Array<{ key: keyof AdminOverview; label: string; icon: React.ElementType; color: string }> = [
  { key: 'users', label: 'Tài khoản người dùng', icon: Users, color: 'text-blue-600 bg-blue-50' },
  { key: 'interactions', label: 'Tương tác đã ghi nhận', icon: Activity, color: 'text-violet-600 bg-violet-50' },
  { key: 'pageViews', label: 'Lượt mở khu vực', icon: Activity, color: 'text-indigo-600 bg-indigo-50' },
  { key: 'consultations', label: 'Câu hỏi tư vấn', icon: FileText, color: 'text-emerald-600 bg-emerald-50' },
  { key: 'violations', label: 'Hồ sơ đã lưu', icon: AlertTriangle, color: 'text-amber-600 bg-amber-50' },
];

export const AdminDashboard: React.FC<Props> = ({ currentUserId }) => {
  const [overview, setOverview] = useState<AdminOverview | null>(null);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [interactions, setInteractions] = useState<UserInteraction[]>([]);
  const [activeSection, setActiveSection] = useState<'users' | 'interactions'>('users');
  const [search, setSearch] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updatingUserId, setUpdatingUserId] = useState<number | null>(null);

  const loadData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [overviewResponse, usersResponse, interactionsResponse] = await Promise.all([
        fetch('/api/admin/overview', { credentials: 'include' }),
        fetch(`/api/admin/users?search=${encodeURIComponent(search)}`, { credentials: 'include' }),
        fetch('/api/admin/interactions', { credentials: 'include' }),
      ]);
      const [overviewData, usersData, interactionsData] = await Promise.all([
        overviewResponse.json(), usersResponse.json(), interactionsResponse.json(),
      ]);
      const failed = [overviewResponse, usersResponse, interactionsResponse].find((response) => !response.ok);
      if (failed) {
        const errorData = [overviewData, usersData, interactionsData][[overviewResponse, usersResponse, interactionsResponse].indexOf(failed)];
        throw new Error(errorData?.error || 'Không thể tải dữ liệu quản trị');
      }
      setOverview(overviewData);
      setUsers(Array.isArray(usersData) ? usersData : []);
      setInteractions(Array.isArray(interactionsData) ? interactionsData : []);
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Không thể kết nối máy chủ');
    } finally {
      setIsLoading(false);
    }
  }, [search]);

  useEffect(() => { void loadData(); }, [loadData]);

  const changeRole = async (user: AdminUser, role: AdminUser['role']) => {
    if (role === user.role) return;
    setUpdatingUserId(user.id);
    setError(null);
    try {
      const response = await fetch(`/api/admin/users/${user.id}/role`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ role }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Không thể đổi vai trò');
      setUsers((current) => current.map((item) => item.id === user.id ? { ...item, role } : item));
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Không thể cập nhật vai trò');
      void loadData();
    } finally {
      setUpdatingUserId(null);
    }
  };

  return (
    <div className="space-y-6">
      <section className="glass rounded-2xl border border-blue-100 dark:border-slate-800 bg-gradient-to-r from-blue-50 via-white to-indigo-50 dark:from-slate-900 dark:to-slate-900 p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-100 px-3 py-1 text-[11px] font-bold text-blue-800">
              <Activity className="h-3.5 w-3.5" /> KHU VỰC QUẢN TRỊ
            </span>
            <h2 className="mt-3 text-2xl font-extrabold text-slate-900 dark:text-white">Người dùng và hoạt động</h2>
            <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">Quản lý tài khoản và xem các tương tác đã được lưu trên website.</p>
          </div>
          <button onClick={() => void loadData()} disabled={isLoading} className="btn border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 disabled:opacity-60">
            {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
            <span>Làm mới</span>
          </button>
        </div>
      </section>

      {error && <div role="alert" className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">{error}</div>}

      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-5">
        {CARDS.map(({ key, label, icon: Icon, color }) => (
          <article key={key} className="glass flex items-center gap-4 rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
            <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${color}`}><Icon className="h-5 w-5" /></div>
            <div>
              <p className="text-xs font-semibold text-slate-500">{label}</p>
              <p className="mt-1 text-2xl font-extrabold text-slate-900 dark:text-white">
                {isLoading ? '—' : (overview?.[key] ?? 0).toLocaleString('vi-VN')}
              </p>
            </div>
          </article>
        ))}
      </section>

      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 p-4 dark:border-slate-800">
          <div className="flex gap-2">
            <button onClick={() => setActiveSection('users')} className={`rounded-lg px-3 py-2 text-xs font-bold ${activeSection === 'users' ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300'}`}>Người dùng</button>
            <button onClick={() => setActiveSection('interactions')} className={`rounded-lg px-3 py-2 text-xs font-bold ${activeSection === 'interactions' ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300'}`}>Tương tác website</button>
          </div>
          {activeSection === 'users' && (
            <label className="relative block w-full sm:w-72">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Tìm tên hoặc email" className="input-field py-2 pl-9 text-xs" />
            </label>
          )}
        </div>

        {activeSection === 'users' ? (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[680px] text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 dark:bg-slate-950/50"><tr><th className="px-4 py-3">Người dùng</th><th className="px-4 py-3">Ngày tạo</th><th className="px-4 py-3">Vai trò</th><th className="px-4 py-3">Quyền</th></tr></thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {users.map((user) => (
                  <tr key={user.id}>
                    <td className="px-4 py-3"><span className="block font-bold text-slate-800 dark:text-slate-200">{user.full_name}</span><span className="mt-0.5 block text-slate-500">{user.email}</span></td>
                    <td className="px-4 py-3 text-slate-600 dark:text-slate-300">{new Date(user.created_at).toLocaleDateString('vi-VN')}</td>
                    <td className="px-4 py-3"><span className={`rounded-full px-2 py-1 text-[10px] font-bold ${user.role === 'admin' ? 'bg-violet-100 text-violet-700' : 'bg-slate-100 text-slate-600'}`}>{user.role === 'admin' ? 'Quản trị' : 'Người dân'}</span></td>
                    <td className="px-4 py-3">
                      <select value={user.role} disabled={user.id === currentUserId || updatingUserId === user.id} onChange={(event) => void changeRole(user, event.target.value as AdminUser['role'])} className="input-field w-36 py-1.5 text-xs disabled:opacity-50" aria-label={`Vai trò của ${user.full_name}`}>
                        <option value="citizen">Người dân</option><option value="admin">Quản trị</option>
                      </select>
                    </td>
                  </tr>
                ))}
                {!isLoading && users.length === 0 && <tr><td colSpan={4} className="px-4 py-10 text-center text-slate-500">Không tìm thấy tài khoản.</td></tr>}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 dark:bg-slate-950/50"><tr><th className="px-4 py-3">Hoạt động</th><th className="px-4 py-3">Tài khoản</th><th className="px-4 py-3">Nội dung</th><th className="px-4 py-3">Thời gian</th></tr></thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {interactions.map((item) => (
                  <tr key={`${item.activity_type}-${item.id}`}>
                    <td className="px-4 py-3"><span className="rounded-full bg-blue-50 px-2 py-1 text-[10px] font-bold text-blue-700">{item.activity_type}</span></td>
                    <td className="px-4 py-3"><span className="block font-semibold text-slate-800 dark:text-slate-200">{item.full_name || 'Khách chưa đăng nhập'}</span><span className="mt-0.5 block text-slate-500">{item.email || 'Không có tài khoản'}</span></td>
                    <td className="max-w-md px-4 py-3 text-slate-600 dark:text-slate-300"><span className="line-clamp-2">{item.summary}</span>{item.detail && <span className="mt-1 block text-[10px] text-slate-400">{item.detail}</span>}</td>
                    <td className="whitespace-nowrap px-4 py-3 text-slate-500">{new Date(item.created_at).toLocaleString('vi-VN')}</td>
                  </tr>
                ))}
                {!isLoading && interactions.length === 0 && <tr><td colSpan={4} className="px-4 py-10 text-center text-slate-500">Chưa có tương tác được lưu.</td></tr>}
              </tbody>
            </table>
          </div>
        )}
        <p className="border-t border-slate-100 px-4 py-3 text-[11px] text-slate-500 dark:border-slate-800">
          Hiển thị tối đa 250 tài khoản và 250 tương tác gần nhất. Nhật ký gồm lượt mở khu vực, câu hỏi tư vấn và hồ sơ vi phạm đã lưu.
        </p>
      </section>
    </div>
  );
};
