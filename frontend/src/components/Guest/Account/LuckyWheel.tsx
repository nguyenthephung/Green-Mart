import React, { useState } from 'react';
import { useVoucherStore } from '../../../stores/useVoucherStore';
import { useUserStore } from '../../../stores/useUserStore';
import { updateUserVouchers } from '../../../services/userService';
import { X, Gift } from 'lucide-react';


// Sử dụng voucher động từ store, thêm 1 ô "Chúc bạn may mắn lần sau"


const LuckyWheel: React.FC<{ userId: string | number; isOpen: boolean; onClose: () => void }> = ({ 
  userId,
  isOpen, 
  onClose 
}) => {
  const vouchers = useVoucherStore(state => state.vouchers);
  const voucherLoading = useVoucherStore(state => state.loading || false);
  const { user, setUser, setVoucher } = useUserStore();
  const [userVouchers, setUserVouchers] = useState<{[key: string]: number}>(() => {
    // Handle both old array format and new object format
    if (user?.vouchers) {
      if (Array.isArray(user.vouchers)) {
        // Convert old array format to new object format
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
        // Already in new object format
        return user.vouchers as {[key: string]: number};
      }
    }
    return {};
  });
  // Đã fetch voucher ở App.tsx, không cần fetch lại ở đây
  // Chỉ lấy các voucher còn hiệu lực và chưa hết hạn
  const validVouchers = vouchers.filter(v => {
    const isActive = v.isActive === true;
    const notFullyUsed = !v.maxUsage || v.currentUsage < v.maxUsage;
    const notExpired = new Date(v.expired) >= new Date();
    
    console.log(`LuckyWheel - Voucher ${v.code}:`, {
      isActive,
      notFullyUsed,
      notExpired,
      currentUsage: v.currentUsage,
      maxUsage: v.maxUsage,
      expired: v.expired
    });
    
    return isActive && notFullyUsed && notExpired;
  });
  
  // Debug log
  console.log('LuckyWheel - All vouchers:', vouchers);
  console.log('LuckyWheel - Valid vouchers:', validVouchers);
  
  const prizes = [
    ...validVouchers.map(v => ({ ...v, id: String(v.id || v._id) })),
    { code: 'LUCKY', label: 'Chúc bạn may mắn lần sau', description: '', minOrder: 0, discountType: 'amount', discountValue: 0, expired: '', usedPercent: 0, isActive: false, id: '-1', note: '', currentUsage: 0, maxUsage: 0, onlyOn: '', disabled: false },
  ];
  
  console.log('Prizes array:', prizes);
  const [spinning, setSpinning] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [rotation, setRotation] = useState(0);
  const [showFireworks, setShowFireworks] = useState(false);
  const [showVoucherModal, setShowVoucherModal] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  // Thay thế logic spin trong component LuckyWheel

const spin = async () => {
  if (spinning || isUpdating) return;
  setSpinning(true);
  setResult(null);
  setShowFireworks(false);
  setShowVoucherModal(false);
  
  // Random prize index
  let prizeIndex = Math.floor(Math.random() * prizes.length);
  
  // Only skip voucher if user already owns it and there is at least one other voucher to win
  let tries = 0;
  const availableVoucherCount = prizes.filter(p => p.id !== '-1' && !(String(p.id) in userVouchers)).length;
  while (
    prizes[prizeIndex].id !== '-1' &&
    String(prizes[prizeIndex].id) in userVouchers &&
    tries < 10 &&
    availableVoucherCount > 0
  ) {
    prizeIndex = Math.floor(Math.random() * prizes.length);
    tries++;
  }
  
  // LOGIC SỬA LẠI:
  // Kim chỉ ở vị trí 12h (0 độ)
  // Các ô được vẽ theo thứ tự: ô 0 từ 0° đến segmentAngle°, ô 1 từ segmentAngle° đến 2*segmentAngle°, v.v.
  // Để kim chỉ vào ô prizeIndex, ta cần quay wheel sao cho giữa ô đó về vị trí 12h
  
  const segmentAngle = 360 / prizes.length;  // Góc mỗi ô
  
  // Góc giữa của ô prizeIndex (tính từ 0°)
  const prizeMiddleAngle = prizeIndex * segmentAngle + segmentAngle / 2;
  
  // Để đưa giữa ô về vị trí 12h (0°), ta cần quay wheel THUẬN CHIỀU KIM ĐỒNG HỒ
  // một góc = prizeMiddleAngle
  // Nhưng vì CSS transform rotate() quay ngược chiều kim đồng hồ khi giá trị dương
  // nên ta cần dùng giá trị âm để quay thuận chiều kim đồng hồ
  const targetAngle = -prizeMiddleAngle;
  
  // Thêm số vòng quay để tạo hiệu ứng
  const spins = 8 + Math.floor(Math.random() * 5); // 8-12 vòng quay
  const finalRotation = 360 * spins + targetAngle;
  
  console.log('Lucky Wheel spin (FIXED):', {
    prizeIndex,
    selectedPrize: prizes[prizeIndex],
    segmentAngle,
    prizeMiddleAngle,
    targetAngle,
    finalRotation,
    totalRotation: rotation + finalRotation
  });
  
  setRotation(prev => prev + finalRotation);
  
  // Save the selected prize for use in the async block
  const selectedPrize = prizes[prizeIndex];
  
  setTimeout(async () => {
    setSpinning(false);
    setResult(selectedPrize);
    
    // Nếu trúng voucher thật
    if (String(selectedPrize.id) !== '-1') {
      setShowFireworks(true);
      setIsUpdating(true);
      try {
        const voucherId = String(selectedPrize.id);
        
        // Gọi API cập nhật voucher cho user
        await updateUserVouchers(userId, voucherId);
        
        // Cập nhật lại user local
        if (setUser && user) {
          const updatedVouchers = { ...userVouchers };
          updatedVouchers[voucherId] = (updatedVouchers[voucherId] || 0) + 1;
          
          setUser({
            ...user,
            vouchers: updatedVouchers
          });
          setUserVouchers(updatedVouchers);
        }
        
        // Set voucher vừa trúng là voucher đang chọn
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
      
      // Hiện pháo hoa 2s, sau đó show modal trúng thưởng
      setTimeout(() => {
        setShowFireworks(false);
        setShowVoucherModal(true);
      }, 2000);
    }
  }, 4100);
};

  if (!isOpen && !showVoucherModal) return null;

  // Component hiệu ứng pháo hoa
  const Fireworks = () => (
    <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-2xl">
      {/* Tăng số lượng hạt pháo hoa và độ sáng */}
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
      {/* Thêm hiệu ứng tia sáng */}
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
      {/* Ngôi sao sáng hơn */}
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
      {/* Hiệu ứng flash */}
      <div 
        className="absolute inset-0 bg-gradient-radial from-yellow-300 via-transparent to-transparent animate-ping opacity-30"
        style={{
          animationDuration: '0.8s'
        }}
      />
    </div>
  );

  // Hiển thị danh sách voucher hiện có
  // (Có thể bỏ qua nếu không muốn show ngoài vòng quay, nhưng theo yêu cầu sẽ show)
  // Chỉ show các voucher hợp lệ
  // Nếu muốn show tất cả, thay validVouchers thành vouchers
  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
      {/* Overlay loading spinner */}
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
        {/* Hiệu ứng pháo hoa */}
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

          {/* Wheel */}
          <div className="relative mx-auto w-80 h-80 mb-4">
            <div className="absolute inset-0 rounded-full bg-gradient-to-br from-yellow-400 via-red-500 to-purple-600 p-1">
              <div 
                className="w-full h-full rounded-full relative transition-transform duration-[4000ms] ease-in-out"
                style={{
                  transform: `rotate(${rotation}deg)`,
                  background: (() => {
                    const colors = [
                      '#ef4444', '#f97316', '#eab308', '#22c55e', '#06b6d4', '#3b82f6', '#8b5cf6', '#ec4899',
                      '#f59e42', '#10b981', '#6366f1', '#f43f5e', '#fbbf24', '#14b8a6', '#a21caf', '#facc15'
                    ];
                    const n = prizes.length;
                    let stops = [];
                    for (let i = 0; i < n; i++) {
                      const start = (360 / n) * i;
                      const end = (360 / n) * (i + 1);
                      const color = colors[i % colors.length];
                      stops.push(`${color} ${start}deg ${end}deg`);
                    }
                    return `conic-gradient(${stops.join(',')})`;
                  })(),
                  border: '2px solid white'
                }}
              >
                {/* Thêm các đường viền phân chia rõ ràng hơn */}
                {prizes.map((_, index) => (
                  <div
                    key={`divider-${index}`}
                    className="absolute bg-white origin-center"
                    style={{
                      top: '50%',
                      left: '50%',
                      width: '4px',
                      height: '50%',
                      transform: `translate(-50%, -100%) rotate(${(360 / prizes.length) * index}deg)`,
                      transformOrigin: 'center bottom',
                      zIndex: 10
                    }}
                  />
                ))}
                
                {prizes.map((prize, index) => {
                  const angle = (360 / prizes.length) * index;
                  let label = '';
                  if (String(prize.id) === '-1') label = 'Chúc bạn may mắn lần sau';
                  else if (prize.label) label = prize.label;
                  else if (prize.code) label = prize.code;
                  else if (prize.discountType === 'percent') label = `Voucher ${prize.discountValue}%`;
                  else label = `Voucher ${(prize.discountValue/1000).toFixed(0)}K`;
                  const isLongText = label.length > 15;
                  return (
                    <div
                      key={index}
                      className="absolute flex items-center justify-center"
                      style={{
                        top: '50%',
                        left: '50%',
                        width: '50%',
                        height: '50%',
                        transform: `translate(-50%, -50%) rotate(${angle + 360/prizes.length/2}deg)`,
                        transformOrigin: 'center'
                      }}
                    >
                      <div
                        className="text-white font-bold text-center"
                        style={{
                          textShadow: '2px 2px 4px rgba(0,0,0,0.9)',
                          transform: `translateY(-75px)`,
                          fontSize: isLongText ? '12px' : '15px',
                          lineHeight: isLongText ? '1.1' : '1.2',
                          maxWidth: '80px',
                          fontWeight: '900'
                        }}
                      >
                        {label}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
            
            {/* Pointer - Mũi tên chính xác hơn */}
            <div 
              className="absolute w-0 h-0 z-20"
              style={{
                top: '6px',
                left: '50%',
                transform: 'translateX(-50%)',
                borderLeft: '20px solid transparent',
                borderRight: '20px solid transparent',
                borderTop: '35px solid #1f2937',
                filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))'
              }}
            />
            
            {/* Vòng tròn trung tâm */}
            <div 
              className="absolute bg-white rounded-full border-4 border-gray-800 z-20"
              style={{
                width: '28px',
                height: '28px',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)'
              }}
            />
          </div>

          {/* Result */}
          {result && !spinning && (
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
            onClick={spin}
            disabled={spinning}
            className={`w-full py-2 px-4 rounded-full font-semibold text-white transition-all text-sm ${
              spinning
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 transform hover:scale-105'
            }`}
          >
            {spinning ? 'Đang quay...' : 'Quay ngay!'}
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
              {/* Background decoration sáng hơn */}
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
              {/* Hiệu ứng sáng chớp nền */}
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
                  {/* Hiệu ứng sáng chạy */}
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
