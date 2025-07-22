import React, { useState } from 'react';
import { X, Gift } from 'lucide-react';

const prizes = [
  'Voucher 10K',
  'Voucher 20K', 
  'Voucher 50K',
  'Chúc bạn may mắn lần sau',
  'Voucher 100K',
  'Voucher 5%',
  'Voucher 10%',
  'Voucher 20%'
];

const LuckyWheel: React.FC<{ userId: string | number; isOpen: boolean; onClose: () => void }> = ({ 

  isOpen, 
  onClose 
}) => {
  const [spinning, setSpinning] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [rotation, setRotation] = useState(0);
  const [showFireworks, setShowFireworks] = useState(false);
  const [showVoucherModal, setShowVoucherModal] = useState(false);

  const spin = () => {
    if (spinning) return;
    
    setSpinning(true);
    setResult(null);
    setShowFireworks(false);
    setShowVoucherModal(false);
    
    // Random prize
    const prizeIndex = Math.floor(Math.random() * prizes.length);
    const prizeAngle = (360 / prizes.length) * prizeIndex;
    const spins = 8 + Math.floor(Math.random() * 5); // 8-12 vòng quay
    const extraRotation = Math.random() * 360; // Thêm góc ngẫu nhiên
    const finalRotation = 360 * spins + prizeAngle + extraRotation;
    
    setRotation(prev => prev + finalRotation);
    
    // Stop spinning after animation
    setTimeout(() => {
      setSpinning(false);
      setResult(prizes[prizeIndex]);
      
      // Kích hoạt hiệu ứng pháo hoa nếu trúng thưởng (không phải "Chúc bạn may mắn lần sau")
      if (prizes[prizeIndex] !== 'Chúc bạn may mắn lần sau') {
        setShowFireworks(true);
        setTimeout(() => {
          setShowFireworks(false);
          setShowVoucherModal(true);
        }, 2000);
      }
    }, 4000);
  };

  if (!isOpen) return null;

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

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl p-6 max-w-lg w-full mx-4 relative">
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
                  background: `conic-gradient(
                    #ef4444 0deg 45deg,
                    #f97316 45deg 90deg,
                    #eab308 90deg 135deg,
                    #22c55e 135deg 180deg,
                    #06b6d4 180deg 225deg,
                    #3b82f6 225deg 270deg,
                    #8b5cf6 270deg 315deg,
                    #ec4899 315deg 360deg
                  )`,
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
                  const isLongText = prize.length > 15;
                  
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
                        {isLongText ? (
                          prize.split(' ').map((word, wordIndex) => (
                            <div key={wordIndex} className="leading-none mb-0.5">
                              {word}
                            </div>
                          ))
                        ) : (
                          prize
                        )}
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
                🎉 Chúc mừng! Bạn đã nhận được: <span className="font-bold">{result}</span>
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
      {showVoucherModal && result && result !== 'Chúc bạn may mắn lần sau' && (
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
                    <div className="text-xl font-bold mb-1">{result}</div>
                    <div className="text-sm opacity-90 font-semibold">Mã: LUCKY{Date.now().toString().slice(-6)}</div>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <button
                    onClick={() => {
                      // Logic sao chép mã voucher
                      navigator.clipboard.writeText(`LUCKY${Date.now().toString().slice(-6)}`);
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
