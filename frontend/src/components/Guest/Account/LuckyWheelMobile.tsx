import React, { useState, useMemo } from 'react';
import { Wheel } from 'react-custom-roulette';
import { useVoucherStore } from '../../../stores/useVoucherStore';
import { useUserStore } from '../../../stores/useUserStore';
import { updateUserVouchers } from '../../../services/userService';
import { X, Gift } from 'lucide-react';

const LuckyWheelMobile: React.FC<{ userId: string | number; isOpen: boolean; onClose: () => void }> = ({
  userId,
  isOpen,
  onClose,
}) => {
  const vouchers = useVoucherStore(state => state.vouchers);
  const voucherLoading = useVoucherStore(state => state.loading || false);
  const { user, setUser, setVoucher } = useUserStore();
  const [userVouchers, setUserVouchers] = useState<{ [key: string]: number }>(() => {
    if (user?.vouchers) {
      if (Array.isArray(user.vouchers)) {
        const voucherObj: { [key: string]: number } = {};
        user.vouchers.forEach((v: any) => {
          if (typeof v === 'string') {
            voucherObj[v] = (voucherObj[v] || 0) + 1;
          } else if (v.voucherId) {
            voucherObj[v.voucherId] = v.quantity || 1;
          }
        });
        return voucherObj;
      } else {
        return user.vouchers as { [key: string]: number };
      }
    }
    return {};
  });

  const validVouchers = vouchers.filter(v => {
    const isActive = v.isActive === true;
    const notFullyUsed = !v.maxUsage || v.currentUsage < v.maxUsage;
    const notExpired = new Date(v.expired) >= new Date();
    return isActive && notFullyUsed && notExpired;
  });

  // Tạo data cho react-custom-roulette
  const wheelData = useMemo(() => {
    const prizes = [
      ...validVouchers.map(v => ({ ...v, id: String(v.id || v._id) })),
      {
        code: 'LUCKY',
        label: 'Chúc bạn may mắn lần sau',
        description: '',
        minOrder: 0,
        discountType: 'amount',
        discountValue: 0,
        expired: '',
        usedPercent: 0,
        isActive: false,
        id: '-1',
        note: '',
        currentUsage: 0,
        maxUsage: 0,
        onlyOn: '',
        disabled: false,
      },
    ];

    return prizes.map((prize, index) => {
      let option = '';
      if (String(prize.id) === '-1') {
        option = 'May mắn lần sau';
      } else if (prize.label) {
        option = prize.label;
      } else if (prize.code) {
        option = prize.code;
      } else if (prize.discountType === 'percent') {
        option = `${prize.discountValue}%`;
      } else {
        option = `${(prize.discountValue / 1000).toFixed(0)}K`;
      }

      // Màu sắc cho từng ô
      const colors = [
        '#ef4444',
        '#f97316',
        '#eab308',
        '#22c55e',
        '#06b6d4',
        '#3b82f6',
        '#8b5cf6',
        '#ec4899',
      ];

      return {
        option,
        style: {
          backgroundColor: colors[index % colors.length],
          textColor: '#ffffff',
          fontSize: option.length > 10 ? 10 : 12,
        },
        optionSize: 1,
        prize: prize,
      };
    });
  }, [validVouchers]);

  const [mustSpin, setMustSpin] = useState(false);
  const [prizeNumber, setPrizeNumber] = useState(0);
  const [result, setResult] = useState<any>(null);
  const [showFireworks, setShowFireworks] = useState(false);
  const [showVoucherModal, setShowVoucherModal] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  const handleSpinClick = () => {
    if (mustSpin || isUpdating) return;

    setResult(null);
    setShowFireworks(false);
    setShowVoucherModal(false);

    // Logic chọn giải thưởng
    let selectedIndex = Math.floor(Math.random() * wheelData.length);

    // Skip logic for already owned vouchers
    let tries = 0;
    const availableVoucherCount = wheelData.filter(
      item => item.prize.id !== '-1' && !(String(item.prize.id) in userVouchers)
    ).length;

    while (
      wheelData[selectedIndex].prize.id !== '-1' &&
      String(wheelData[selectedIndex].prize.id) in userVouchers &&
      tries < 10 &&
      availableVoucherCount > 0
    ) {
      selectedIndex = Math.floor(Math.random() * wheelData.length);
      tries++;
    }

    setPrizeNumber(selectedIndex);
    setMustSpin(true);
  };

  const handleStopSpinning = async () => {
    setMustSpin(false);
    const selectedPrize = wheelData[prizeNumber].prize;
    setResult(selectedPrize);

    if (String(selectedPrize.id) !== '-1') {
      setShowFireworks(true);
      setIsUpdating(true);

      try {
        const voucherId = String(selectedPrize.id);
        await updateUserVouchers(userId, voucherId);

        if (setUser && user) {
          const updatedVouchers = { ...userVouchers };
          updatedVouchers[voucherId] = (updatedVouchers[voucherId] || 0) + 1;

          setUser({
            ...user,
            vouchers: updatedVouchers,
          });
          setUserVouchers(updatedVouchers);
        }

        if (setVoucher && selectedPrize.code) {
          const v = vouchers.find(vv => String(vv.id || vv._id) === String(selectedPrize.id));
          if (v) {
            setVoucher({
              ...v,
              createdAt: (v as any).createdAt || '',
              updatedAt: (v as any).updatedAt || '',
              currentUsage: (v as any).currentUsage || 0,
              isActive: (v as any).isActive ?? true,
            });
          }
        }
      } catch (err) {
        alert('Có lỗi khi cập nhật voucher cho tài khoản!');
      }

      setIsUpdating(false);

      setTimeout(() => {
        setShowFireworks(false);
        setShowVoucherModal(true);
      }, 2000);
    }
  };

  if (!isOpen && !showVoucherModal) return null;

  // Component hiệu ứng pháo hoa (mobile optimized)
  const Fireworks = () => (
    <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-2xl">
      {[...Array(15)].map((_, i) => (
        <div
          key={i}
          className="absolute w-2 h-2 rounded-full animate-ping"
          style={{
            backgroundColor: ['#ff0080', '#00ff80', '#8000ff', '#ff8000', '#0080ff'][i % 5],
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            animationDelay: `${Math.random() * 2}s`,
            animationDuration: `${0.5 + Math.random() * 0.8}s`,
            boxShadow: `0 0 10px ${['#ff0080', '#00ff80', '#8000ff', '#ff8000', '#0080ff'][i % 5]}`,
          }}
        />
      ))}
      {[...Array(8)].map((_, i) => (
        <div
          key={`star-${i}`}
          className="absolute animate-bounce"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            animationDelay: `${Math.random() * 1.5}s`,
            fontSize: `${12 + Math.random() * 8}px`,
            filter: 'drop-shadow(0 0 5px gold)',
            color: '#ffd700',
          }}
        >
          ⭐
        </div>
      ))}
    </div>
  );

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-60 z-50" 
        onClick={onClose}
      />
      
      {/* Modal Container - Mobile Optimized - Fixed at top */}
      <div className="fixed inset-0 z-[51] flex justify-center pointer-events-none overflow-y-auto" style={{ marginTop: '10vh' }}>
        {(isUpdating || voucherLoading) && (
          <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-[60] pointer-events-none">
            <div className="flex flex-col items-center gap-2">
              <svg
                className="animate-spin h-8 w-8 text-green-400"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path>
              </svg>
              <span className="text-green-200 font-semibold text-sm">Đang tải...</span>
            </div>
          </div>
        )}
        <div className="bg-white rounded-2xl p-4 max-w-sm w-full max-h-[85vh] overflow-y-auto relative pointer-events-auto my-auto">
          {/* Voucher hiện có - Compact */}
          <div className="mb-3">
            <h3 className="font-bold text-sm mb-1.5 text-gray-700">Voucher hiện có:</h3>
            <div className="flex flex-wrap gap-1.5">
              {Object.keys(userVouchers).length === 0 && (
                <span className="text-gray-400 text-xs">Không có voucher nào</span>
              )}
              {Object.entries(userVouchers).map(([voucherId, quantity]) => {
                const v = vouchers.find(vv => String(vv.id || vv._id) === voucherId);
                if (!v || quantity <= 0) return null;
                return (
                  <div
                    key={voucherId}
                    className="px-2 py-0.5 rounded-lg bg-gradient-to-r from-green-400 to-blue-400 text-white text-xs font-semibold shadow"
                  >
                    {v.discountType === 'percent'
                      ? `${v.discountValue}%`
                      : `${(v.discountValue / 1000).toFixed(0)}K`}{' '}
                    - {v.code} x{quantity}
                  </div>
                );
              })}
            </div>
          </div>

          {showFireworks && <Fireworks />}

          <button
            onClick={onClose}
            className="absolute top-2 right-2 p-1 rounded-full hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-all duration-200 z-20"
            type="button"
            aria-label="Đóng"
          >
            <X size={18} />
          </button>

          <div className="text-center">
            <div className="mb-3">
              <Gift className="mx-auto mb-2 text-yellow-500" size={28} />
              <h2 className="text-base font-bold text-gray-800 mb-0.5">Vòng quay may mắn</h2>
              <p className="text-gray-600 text-xs">Hãy thử vận may của bạn!</p>
            </div>

            {/* Wheel - Mobile Size */}
            <div className="relative flex justify-center mb-3">
              <div
                className="absolute inset-0 rounded-full pointer-events-none animate-pulse"
                style={{
                  boxShadow: '0 0 40px 8px #facc15, 0 0 80px 20px #f472b6',
                }}
              />
              <Wheel
                mustStartSpinning={mustSpin}
                prizeNumber={prizeNumber}
                data={wheelData}
                onStopSpinning={handleStopSpinning}
                backgroundColors={['#3e3e3e']}
                textColors={['#ffffff']}
                outerBorderColor="#f2f2f2"
                outerBorderWidth={6}
                innerBorderColor="#f2f2f2"
                innerBorderWidth={1}
                innerRadius={20}
                radiusLineColor="#f2f2f2"
                radiusLineWidth={1}
                fontSize={11}
                textDistance={50}
                spinDuration={0.8}
              />
            </div>

            {/* Result */}
            {result && !mustSpin && (
              <div className="mb-3 p-2.5 bg-green-50 rounded-lg border border-green-200">
                <p className="text-green-800 font-semibold text-xs">
                  {result.id === '-1' ? (
                    <>😢 Chúc bạn may mắn lần sau!</>
                  ) : (
                    <>
                      🎉 Chúc mừng! Bạn đã nhận được:{' '}
                      <span className="font-bold">
                        {result.discountType === 'percent'
                          ? `Voucher ${result.discountValue}%`
                          : `Voucher ${(result.discountValue / 1000).toFixed(0)}K`}
                      </span>
                    </>
                  )}
                </p>
              </div>
            )}

            {/* Spin Button */}
            <button
              onClick={handleSpinClick}
              disabled={mustSpin}
              className={`w-full py-2.5 px-4 rounded-full font-bold text-base shadow-lg transition-all duration-200
                ${
                  mustSpin
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-gradient-to-r from-pink-500 via-yellow-400 to-green-400 hover:from-pink-600 hover:to-green-500'
                }
              `}
            >
              {mustSpin ? 'Đang quay...' : '🎯 Quay ngay!'}
            </button>

            <p className="text-xs text-gray-500 mt-2">Mỗi người chỉ được quay 1 lần mỗi ngày</p>
          </div>
        </div>
      </div>

      {/* Modal Voucher - Mobile Optimized */}
      {showVoucherModal && result && result.id !== '-1' && (
        <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-[60] p-3 pointer-events-auto">
          <div
            className="bg-gradient-to-br from-yellow-300 via-orange-400 to-red-400 rounded-2xl p-1.5 max-w-xs w-full relative shadow-2xl"
            style={{
              boxShadow: '0 0 40px rgba(255, 215, 0, 0.8), 0 0 80px rgba(255, 140, 0, 0.6)',
            }}
          >
            <div className="bg-white rounded-2xl p-4 text-center relative overflow-hidden">
              <div className="absolute inset-0 opacity-20">
                {[...Array(20)].map((_, i) => (
                  <div
                    key={i}
                    className="absolute"
                    style={{
                      left: `${Math.random() * 100}%`,
                      top: `${Math.random() * 100}%`,
                      fontSize: `${8 + Math.random() * 10}px`,
                      transform: `rotate(${Math.random() * 360}deg)`,
                      color: ['#ffd700', '#ff6b35', '#f7931e'][i % 3],
                      filter: 'drop-shadow(0 0 3px currentColor)',
                      animationDelay: `${Math.random() * 2}s`,
                    }}
                  >
                    {['⭐', '✨', '💎'][i % 3]}
                  </div>
                ))}
              </div>
              
              <button
                onClick={() => setShowVoucherModal(false)}
                className="absolute top-2 right-2 p-1 rounded-full hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-all duration-200 z-20"
                type="button"
                aria-label="Đóng"
              >
                <X size={14} />
              </button>
              
              <div className="relative z-10">
                <div
                  className="text-6xl mb-3"
                  style={{
                    filter: 'drop-shadow(0 0 15px gold)',
                  }}
                >
                  🎉
                </div>
                <h3
                  className="text-2xl font-bold mb-2 bg-gradient-to-r from-yellow-600 via-orange-500 to-red-500 bg-clip-text text-transparent"
                  style={{
                    textShadow: '2px 2px 4px rgba(0,0,0,0.3)',
                  }}
                >
                  CHÚC MỪNG!
                </h3>
                <p className="text-gray-700 mb-3 font-semibold text-sm">Bạn đã trúng thưởng lớn!</p>
                <div
                  className="bg-gradient-to-r from-green-400 via-emerald-500 to-teal-500 text-white rounded-xl p-4 mb-3 transform transition-transform"
                  style={{
                    boxShadow: '0 8px 20px rgba(16, 185, 129, 0.4)',
                  }}
                >
                  <div className="relative z-10">
                    <div className="text-lg font-bold mb-1">
                      {result.discountType === 'percent'
                        ? `Voucher ${result.discountValue}%`
                        : `Voucher ${(result.discountValue / 1000).toFixed(0)}K`}
                    </div>
                    <div className="text-xs opacity-90 font-semibold">Mã: {result.code}</div>
                  </div>
                </div>
                <div className="space-y-2">
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(result.code);
                      alert('Đã sao chép mã voucher!');
                    }}
                    className="w-full py-2.5 px-4 bg-gradient-to-r from-blue-500 via-blue-600 to-blue-700 hover:from-blue-600 hover:via-blue-700 hover:to-blue-800 text-white rounded-lg font-bold transition-all transform hover:scale-105 shadow-lg text-sm"
                  >
                    📋 Sao chép mã
                  </button>
                  <button
                    onClick={() => {
                      setShowVoucherModal(false);
                      onClose();
                    }}
                    className="w-full py-2.5 px-4 bg-gradient-to-r from-purple-500 via-pink-500 to-red-500 hover:from-purple-600 hover:via-pink-600 hover:to-red-600 text-white rounded-lg font-bold transition-all transform hover:scale-105 shadow-lg text-sm"
                  >
                    🛒 Mua sắm ngay!
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default LuckyWheelMobile;
