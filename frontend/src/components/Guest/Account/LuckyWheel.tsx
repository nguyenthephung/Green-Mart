import React, { useState, useMemo } from 'react';
import { Wheel } from 'react-custom-roulette';
import { useVoucherStore } from '../../../stores/useVoucherStore';
import { useUserStore } from '../../../stores/useUserStore';
import { updateUserVouchers } from '../../../services/userService';
import { X, Gift } from 'lucide-react';

const LuckyWheel: React.FC<{ userId: string | number; isOpen: boolean; onClose: () => void }> = ({ 
  userId,
  isOpen, 
  onClose 
}) => {
  const vouchers = useVoucherStore(state => state.vouchers);
  const voucherLoading = useVoucherStore(state => state.loading || false);
  const { user, setUser, setVoucher } = useUserStore();
  const [userVouchers, setUserVouchers] = useState<{[key: string]: number}>(() => {
    if (user?.vouchers) {
      if (Array.isArray(user.vouchers)) {
        const voucherObj: {[key: string]: number} = {};
        user.vouchers.forEach((v: any) => {
          if (typeof v === 'string') {
            voucherObj[v] = (voucherObj[v] || 0) + 1;
          } else if (v.voucherId) {
            voucherObj[v.voucherId] = v.quantity || 1;
          }
        });
        return voucherObj;
      } else {
        return user.vouchers as {[key: string]: number};
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
      { code: 'LUCKY', label: 'Chúc bạn may mắn lần sau', description: '', minOrder: 0, discountType: 'amount', discountValue: 0, expired: '', usedPercent: 0, isActive: false, id: '-1', note: '', currentUsage: 0, maxUsage: 0, onlyOn: '', disabled: false },
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
        option = `${(prize.discountValue/1000).toFixed(0)}K`;
      }

      // Màu sắc cho từng ô
      const colors = [
        '#ef4444', '#f97316', '#eab308', '#22c55e', '#06b6d4', '#3b82f6', 
        '#8b5cf6', '#ec4899', '#f59e42', '#10b981', '#6366f1', '#f43f5e', 
        '#fbbf24', '#14b8a6', '#a21caf', '#facc15'
      ];

      return {
        option,
        style: { 
          backgroundColor: colors[index % colors.length],
          textColor: '#ffffff',
          fontSize: option.length > 10 ? 12 : 14
        },
        optionSize: 1,
        prize: prize
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
    const availableVoucherCount = wheelData.filter(item => 
      item.prize.id !== '-1' && !(String(item.prize.id) in userVouchers)
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
            vouchers: updatedVouchers
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

  // Component hiệu ứng pháo hoa
  const Fireworks = () => (
    <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-2xl">
      {[...Array(25)].map((_, i) => (
        <div
          key={i}
          className="absolute w-3 h-3 rounded-full animate-ping"
          style={{
            backgroundColor: ['#ff0080', '#00ff80', '#8000ff', '#ff8000', '#0080ff', '#ff4080', '#80ff00', '#4080ff'][i % 8],
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            animationDelay: `${Math.random() * 2}s`,
            animationDuration: `${0.5 + Math.random() * 0.8}s`,
            boxShadow: `0 0 15px ${['#ff0080', '#00ff80', '#8000ff', '#ff8000', '#0080ff', '#ff4080', '#80ff00', '#4080ff'][i % 8]}`
          }}
        />
      ))}
      {[...Array(8)].map((_, i) => (
        <div
          key={`beam-${i}`}
          className="absolute w-1 bg-gradient-to-t from-transparent via-yellow-300 to-transparent animate-pulse"
          style={{
            height: '100%',
            left: `${10 + i * 12}%`,
            animationDelay: `${i * 0.2}s`,
            animationDuration: '1.5s',
            filter: 'blur(1px)',
            opacity: 0.8
          }}
        />
      ))}
      {[...Array(15)].map((_, i) => (
        <div
          key={`star-${i}`}
          className="absolute animate-bounce"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            animationDelay: `${Math.random() * 1.5}s`,
            fontSize: `${16 + Math.random() * 12}px`,
            filter: 'drop-shadow(0 0 8px gold)',
            color: '#ffd700'
          }}
        >
          ⭐
        </div>
      ))}
      <div 
        className="absolute inset-0 bg-gradient-radial from-yellow-300 via-transparent to-transparent animate-ping opacity-30"
        style={{
          animationDuration: '0.8s'
        }}
      />
    </div>
  );

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
      {(isUpdating || voucherLoading) && (
        <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="flex flex-col items-center gap-2">
            <svg className="animate-spin h-10 w-10 text-green-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path>
            </svg>
            <span className="text-green-200 font-semibold text-base">Đang tải...</span>
          </div>
        </div>
      )}
      <div className="bg-white rounded-2xl p-6 max-w-lg w-full mx-4 relative">
        <div className="mb-4">
          <h3 className="font-bold text-base mb-2 text-gray-700">Voucher hiện có:</h3>
          <div className="flex flex-wrap gap-2">
            {Object.keys(userVouchers).length === 0 && <span className="text-gray-400 text-sm">Không có voucher nào</span>}
            {Object.entries(userVouchers).map(([voucherId, quantity]) => {
              const v = vouchers.find(vv => String(vv.id || vv._id) === voucherId);
              if (!v || quantity <= 0) return null;
              return (
                <div key={voucherId} className="px-3 py-1 rounded-lg bg-gradient-to-r from-green-400 to-blue-400 text-white text-xs font-semibold shadow">
                  {v.discountType === 'percent' ? `${v.discountValue}%` : `${(v.discountValue/1000).toFixed(0)}K`} - {v.code} x{quantity}
                </div>
              );
            })}
          </div>
        </div>
        
        {showFireworks && <Fireworks />}
        
        <button
          onClick={onClose}
          className="absolute top-3 right-3 p-1.5 rounded-full hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-all duration-200 z-20"
          type="button"
          aria-label="Đóng"
        >
          <X size={20} />
        </button>

        <div className="text-center">
          <div className="mb-4">
            <Gift className="mx-auto mb-3 text-yellow-500" size={36} />
            <h2 className="text-lg font-bold text-gray-800 mb-1">Vòng quay may mắn</h2>
            <p className="text-gray-600 text-sm">Hãy thử vận may của bạn!</p>
          </div>

          {/* Wheel using react-custom-roulette + Arrow + Glow */}
          <div className="relative flex justify-center mb-4">
            {/* Hiệu ứng sáng quanh vòng quay */}
            <div className="absolute inset-0 rounded-full pointer-events-none animate-pulse" style={{
              boxShadow: '0 0 60px 10px #facc15, 0 0 120px 30px #f472b6'
            }} />
            {/* Đã loại bỏ kim vàng ở hướng 12 giờ, chỉ dùng kim mặc định của Wheel */}
            <Wheel
              mustStartSpinning={mustSpin}
              prizeNumber={prizeNumber}
              data={wheelData}
              onStopSpinning={handleStopSpinning}
              backgroundColors={['#3e3e3e']}
              textColors={['#ffffff']}
              outerBorderColor="#f2f2f2"
              outerBorderWidth={8}
              innerBorderColor="#f2f2f2"
              innerBorderWidth={2}
              innerRadius={30}
              radiusLineColor="#f2f2f2"
              radiusLineWidth={2}
              fontSize={14}
              textDistance={65}
              spinDuration={0.8}
            />
          </div>

          {/* Result */}
          {result && !mustSpin && (
            <div className="mb-4 p-3 bg-green-50 rounded-lg border border-green-200">
              <p className="text-green-800 font-semibold text-sm">
                {result.id === '-1' ? (
                  <>😢 Chúc bạn may mắn lần sau!</>
                ) : (
                  <>
                    🎉 Chúc mừng! Bạn đã nhận được: <span className="font-bold">{result.discountType === 'percent' ? `Voucher ${result.discountValue}%` : `Voucher ${(result.discountValue/1000).toFixed(0)}K`}</span>
                  </>
                )}
              </p>
            </div>
          )}

          {/* Spin Button */}
          <button
            onClick={handleSpinClick}
            disabled={mustSpin}
            className={`w-full py-3 px-4 rounded-full font-bold text-lg shadow-lg transition-all duration-200
              ${mustSpin
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-gradient-to-r from-pink-500 via-yellow-400 to-green-400 hover:from-pink-600 hover:to-green-500 animate-pulse'}
            `}
          >
            {mustSpin ? 'Đang quay...' : '🎯 Quay ngay!'}
          </button>

          <p className="text-xs text-gray-500 mt-3">
            Mỗi người chỉ được quay 1 lần mỗi ngày
          </p>
        </div>
      </div>
      
      {/* Modal Voucher */}
      {showVoucherModal && result && result.id !== '-1' && (
        <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-[60] p-4">
          <div 
            className="bg-gradient-to-br from-yellow-300 via-orange-400 to-red-400 rounded-3xl p-2 max-w-sm w-full mx-4 relative animate-pulse shadow-2xl"
            style={{
              boxShadow: '0 0 50px rgba(255, 215, 0, 0.8), 0 0 100px rgba(255, 140, 0, 0.6)'
            }}
          >
            <div className="bg-white rounded-3xl p-6 text-center relative overflow-hidden">
              <div className="absolute inset-0 opacity-20">
                {[...Array(30)].map((_, i) => (
                  <div
                    key={i}
                    className="absolute animate-pulse"
                    style={{
                      left: `${Math.random() * 100}%`,
                      top: `${Math.random() * 100}%`,
                      fontSize: `${10 + Math.random() * 15}px`,
                      transform: `rotate(${Math.random() * 360}deg)`,
                      color: ['#ffd700', '#ff6b35', '#f7931e', '#ffb347', '#ff69b4'][i % 5],
                      filter: 'drop-shadow(0 0 5px currentColor)',
                      animationDelay: `${Math.random() * 2}s`
                    }}
                  >
                    {['⭐', '✨', '💎', '🎊', '🌟'][i % 5]}
                  </div>
                ))}
              </div>
              <div 
                className="absolute inset-0 bg-gradient-radial from-yellow-200 via-transparent to-transparent animate-ping opacity-40"
                style={{
                  animationDuration: '1.5s'
                }}
              />
              <button
                onClick={() => setShowVoucherModal(false)}
                className="absolute top-3 right-3 p-1.5 rounded-full hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-all duration-200 z-20"
                type="button"
                aria-label="Đóng"
              >
                <X size={16} />
              </button>
              <div className="relative z-10">
                <div 
                  className="text-8xl mb-4 animate-bounce"
                  style={{
                    filter: 'drop-shadow(0 0 20px gold)',
                    animationDuration: '0.6s'
                  }}
                >
                  🎉
                </div>
                <h3 
                  className="text-3xl font-bold mb-2 bg-gradient-to-r from-yellow-600 via-orange-500 to-red-500 bg-clip-text text-transparent"
                  style={{
                    textShadow: '2px 2px 4px rgba(0,0,0,0.3)'
                  }}
                >
                  CHÚC MỪNG!
                </h3>
                <p className="text-gray-700 mb-4 font-semibold">Bạn đã trúng thưởng lớn!</p>
                <div 
                  className="bg-gradient-to-r from-green-400 via-emerald-500 to-teal-500 text-white rounded-2xl p-5 mb-4 transform hover:scale-105 transition-transform relative overflow-hidden"
                  style={{
                    boxShadow: '0 10px 25px rgba(16, 185, 129, 0.4)',
                    animation: 'glow 2s ease-in-out infinite alternate'
                  }}
                >
                  <div 
                    className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-30 animate-pulse"
                    style={{
                      animation: 'shimmer 2s ease-in-out infinite'
                    }}
                  />
                  <div className="relative z-10">
                    <div className="text-xl font-bold mb-1">{result.discountType === 'percent' ? `Voucher ${result.discountValue}%` : `Voucher ${(result.discountValue/1000).toFixed(0)}K`}</div>
                    <div className="text-sm opacity-90 font-semibold">Mã: {result.code}</div>
                  </div>
                </div>
                <div className="space-y-3">
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(result.code);
                      alert('Đã sao chép mã voucher!');
                    }}
                    className="w-full py-3 px-4 bg-gradient-to-r from-blue-500 via-blue-600 to-blue-700 hover:from-blue-600 hover:via-blue-700 hover:to-blue-800 text-white rounded-xl font-bold transition-all transform hover:scale-105 shadow-lg hover:shadow-xl"
                    style={{
                      boxShadow: '0 8px 25px rgba(59, 130, 246, 0.4)'
                    }}
                  >
                    📋 Sao chép mã voucher
                  </button>
                  <button
                    onClick={() => {
                      setShowVoucherModal(false);
                      onClose();
                    }}
                    className="w-full py-3 px-4 bg-gradient-to-r from-purple-500 via-pink-500 to-red-500 hover:from-purple-600 hover:via-pink-600 hover:to-red-600 text-white rounded-xl font-bold transition-all transform hover:scale-105 shadow-lg hover:shadow-xl animate-pulse"
                    style={{
                      boxShadow: '0 8px 25px rgba(168, 85, 247, 0.4)'
                    }}
                  >
                    🛒 Đi mua sắm ngay!
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LuckyWheel;