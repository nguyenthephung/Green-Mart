import React, { useMemo } from 'react';
import DashboardLayout from '../../layouts/DashboardLayout';
import { useUserStore } from '../../stores/useUserStore';
import { useVoucherStore } from '../../stores/useVoucherStore';
import type { Voucher } from '../../types/User';
import { useEffect } from 'react';

const MyVoucherPage: React.FC = () => {
  // Use voucher store for all vouchers
  // Map store vouchers to User.Voucher type for type safety
  const rawVouchers = useVoucherStore(state => state.vouchers);
  // Chỉ lấy voucher thuộc tài khoản này
  const user = useUserStore(state => state.user);
  const vouchers: Voucher[] = useMemo(() => {
    // Nếu user không có vouchers, trả về []
    if (!user || !user.vouchers || !Array.isArray(user.vouchers)) return [];
    // Lọc rawVouchers theo user.vouchers (giả sử là mảng id)
    const userVoucherIds = user.vouchers.map((v: any) => (typeof v === 'string' ? v : v._id));
    return rawVouchers
      .filter(v => userVoucherIds.includes(v._id))
      .map(v => ({
        ...v,
        createdAt: (v as any).createdAt || '',
        updatedAt: (v as any).updatedAt || '',
        currentUsage: (v as any).currentUsage || 0,
        isActive: (v as any).isActive ?? true,
      }));
  }, [rawVouchers, user]);
  const loading = useVoucherStore(state => state.loading);
  const error = useVoucherStore(state => state.error);
  const fetchAllVouchers = useVoucherStore(state => state.fetchAllVouchers);

  // Use user store for current selected voucher
  const voucher: Voucher | null = useUserStore(state => state.voucher);
  const setVoucher = useUserStore(state => state.setVoucher);
  // ...existing code...

  useEffect(() => {
    if (!user || !user.id) return;
    fetchAllVouchers();
  }, [fetchAllVouchers, user]);

  const getVoucherIcon = (discountType: string) => {
    if (discountType === 'percent') {
      return (
        <div className="w-12 h-12 bg-orange-500 rounded-full flex items-center justify-center">
          <span className="text-white font-bold text-lg">%</span>
        </div>
      );
    } else {
      return (
        <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center">
          <span className="text-white font-bold text-xs">VND</span>
        </div>
      );
    }
  };

  if (loading) {
    return <div className="text-center py-16">Đang tải voucher...</div>;
  }
  if (error) {
    return <div className="text-center py-16 text-red-500">{error}</div>;
  }

  return (
    <DashboardLayout>
      <div className="bg-app-secondary p-8 rounded-3xl shadow-xl border-app-default">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-app-primary mb-2 flex items-center justify-center gap-3">
            <div className="w-10 h-10 bg-brand-green rounded-full flex items-center justify-center">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
              </svg>
            </div>
            Voucher của tôi
          </h1>
          <p className="text-app-secondary">Quản lý và sử dụng các voucher ưu đãi</p>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-app-card rounded-2xl p-6 shadow-lg border-app-default">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                </svg>
              </div>
              <div>
                <div className="text-2xl font-bold text-app-primary">{vouchers.length}</div>
                <div className="text-app-secondary">Tổng voucher</div>
              </div>
            </div>
          </div>
          <div className="bg-app-card rounded-2xl p-6 shadow-lg border-app-default">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <div>
                <div className="text-2xl font-bold text-app-primary">{vouchers.filter(v => v.usedPercent < 100).length}</div>
                <div className="text-app-secondary">Còn hiệu lực</div>
              </div>
            </div>
          </div>
          <div className="bg-app-card rounded-2xl p-6 shadow-lg border-app-default">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-orange-500 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                </svg>
              </div>
              <div>
                <div className="text-2xl font-bold text-app-primary">{voucher ? 1 : 0}</div>
                <div className="text-app-secondary">Đang áp dụng</div>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-app-card rounded-2xl shadow-lg border-app-default p-6">
          {vouchers.length === 0 ? (
            <div className="text-center py-16">
              <div className="w-24 h-24 bg-app-secondary rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-12 h-12 text-app-muted" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-app-primary mb-2">Chưa có voucher nào</h3>
              <p className="text-app-secondary">Hãy mua sắm để nhận thêm voucher ưu đãi!</p>
            </div>
          ) : (
            <div className="space-y-6">
              {vouchers.map(v => {
                const active = voucher && voucher._id === v._id;
                return (
                  <div key={v._id} className={`relative overflow-hidden rounded-2xl border-2 transition-all duration-300 ${active ? 'border-brand-green bg-brand-green/5 shadow-lg shadow-green-200/50' : 'border-app-border bg-app-card hover:border-brand-green/50 hover:shadow-lg'}`}>
                    <div className="flex">
                      {/* Left side - Discount */}
                      <div className={`flex items-center justify-center w-32 ${active ? 'bg-green-600' : 'bg-gradient-to-br from-orange-500 to-red-500'}`}>
                        <div className="text-center text-white">
                          <div className="text-2xl font-bold">
                            {v.discountType === 'percent' ? `${v.discountValue}%` : `${(v.discountValue / 1000).toFixed(0)}K`}
                          </div>
                          <div className="text-xs">GIẢM</div>
                        </div>
                      </div>

                      {/* Right side - Details */}
                      <div className="flex-1 p-6">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              {getVoucherIcon(v.discountType)}
                              <div>
                                <div className="font-bold text-lg text-gray-900">{v.code}</div>
                                <div className="text-gray-600">{v.label}</div>
                              </div>
                            </div>
                            <div className="text-app-primary mb-2">{v.description}</div>
                            <div className="text-sm text-app-secondary mb-2">
                              Đơn tối thiểu: <span className="font-semibold text-brand-green">{v.minOrder.toLocaleString()}₫</span>
                            </div>
                            <div className="flex items-center gap-4 text-xs text-app-muted">
                              <span>HSD: {v.expired}</span>
                              <span>Đã dùng {v.usedPercent}%</span>
                            </div>
                            {v.onlyOn && (
                              <div className="text-xs text-blue-600 bg-blue-50 rounded px-2 py-1 inline-block mt-1">
                                * Chỉ dùng cho các sản phẩm hoặc danh mục: <b>{v.onlyOn}</b>
                              </div>
                            )}
                            {v.note && (
                              <div className="mt-2 text-xs text-red-500 bg-red-50/50 px-3 py-1 rounded-full inline-block">
                                {v.note}
                              </div>
                            )}
                          </div>
                          <button
                            className={`px-6 py-3 rounded-xl font-semibold transition-all duration-200 ${
                              active 
                                ? 'bg-gray-400 text-white cursor-not-allowed' 
                                : 'btn-primary'
                            }`}
                            onClick={() => setVoucher(active ? null : (v as Voucher))}
                            disabled={!!active}
                          >
                            {active ? 'Đang áp dụng' : 'Áp dụng'}
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Active voucher indicator */}
                    {active && (
                      <div className="absolute top-4 right-4">
                        <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                          <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                          </svg>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {/* Active Voucher Summary */}
          {voucher && (
            <div className="mt-8 p-6 bg-gradient-to-r from-green-100 to-emerald-100 rounded-2xl border border-green-200">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-green-600 rounded-full flex items-center justify-center">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <div>
                  <div className="font-bold text-green-900">Voucher đang áp dụng</div>
                  <div className="text-green-700">
                    <span className="font-semibold">{voucher.code}</span> - {voucher.description}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default MyVoucherPage;
