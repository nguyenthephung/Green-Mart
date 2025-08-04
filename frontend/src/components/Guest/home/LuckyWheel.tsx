import React, { useState, useRef } from 'react';

interface LuckyWheelProps {
  onClose: () => void;
}

const prizes = [
  { id: 1, text: 'Giảm 10%', color: '#FF6B6B', angle: 0 },
  { id: 2, text: 'Freeship', color: '#4ECDC4', angle: 45 },
  { id: 3, text: 'Giảm 20%', color: '#45B7D1', angle: 90 },
  { id: 4, text: 'Voucher 50K', color: '#96CEB4', angle: 135 },
  { id: 5, text: 'Giảm 5%', color: '#FECA57', angle: 180 },
  { id: 6, text: 'Chúc may mắn', color: '#FF9FF3', angle: 225 },
  { id: 7, text: 'Voucher 100K', color: '#54A0FF', angle: 270 },
  { id: 8, text: 'Giảm 15%', color: '#5F27CD', angle: 315 },
];

const LuckyWheel: React.FC<LuckyWheelProps> = ({ onClose }) => {
  const [isSpinning, setIsSpinning] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [rotation, setRotation] = useState(0);
  const wheelRef = useRef<HTMLDivElement>(null);

  const spinWheel = () => {
    if (isSpinning) return;

    setIsSpinning(true);
    setResult(null);

    // Chọn ngẫu nhiên giải thưởng trước
    const selectedPrizeIndex = Math.floor(Math.random() * prizes.length);
    const selectedPrize = prizes[selectedPrizeIndex];
    
    // Tính góc để kim chỉ vào giữa của ô được chọn
    const segmentAngle = 360 / prizes.length;
    const targetAngle = selectedPrizeIndex * segmentAngle + segmentAngle / 2;
    
    // Số vòng quay (4-6 vòng)
    const spins = 4 + Math.floor(Math.random() * 3);
    // Quay ngược lại để ô mục tiêu về vị trí kim chỉ
    const finalRotation = rotation + 360 * spins - targetAngle;
    
    setRotation(finalRotation);
    
    setTimeout(() => {
      setIsSpinning(false);
      setResult(selectedPrize.text);
    }, 3000);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl p-8 max-w-md w-full relative">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center hover:bg-gray-300 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Header */}
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">🎰 Vòng quay may mắn</h2>
          <p className="text-gray-600">Quay để nhận ngay ưu đãi hấp dẫn!</p>
        </div>

        {/* Wheel Container */}
        <div className="relative mx-auto w-64 h-64 mb-6">
          {/* Wheel */}
          <div
            ref={wheelRef}
            className="w-full h-full rounded-full border-8 border-gray-300 relative overflow-hidden shadow-2xl"
            style={{
              transform: `rotate(${rotation}deg)`,
              transition: isSpinning ? 'transform 3s cubic-bezier(0.25, 0.1, 0.25, 1)' : 'none',
              background: `conic-gradient(${prizes.map((prize, index) => 
                `${prize.color} ${(360 / prizes.length) * index}deg ${(360 / prizes.length) * (index + 1)}deg`
              ).join(', ')})`,
            }}
          >
            {prizes.map((prize, index) => {
              const angle = (360 / prizes.length) * index + (360 / prizes.length) / 2;
              const radius = 80; // Distance from center
              
              return (
                <div
                  key={prize.id}
                  className="absolute text-white font-bold text-xs"
                  style={{
                    left: '50%',
                    top: '50%',
                    transform: `translate(-50%, -50%) rotate(${angle}deg) translateY(-${radius}px) rotate(-${angle}deg)`,
                  }}
                >
                  {prize.text}
                </div>
              );
            })}
          </div>

          {/* Center Pin */}
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-8 h-8 bg-gray-800 rounded-full z-10 border-4 border-white shadow-lg"></div>

          {/* Pointer */}
          <div className="absolute top-2 left-1/2 transform -translate-x-1/2">
            <div className="w-0 h-0 border-l-6 border-r-6 border-b-12 border-l-transparent border-r-transparent border-b-red-500 drop-shadow-lg"></div>
          </div>
        </div>

        {/* Spin Button */}
        <div className="text-center">
          <button
            onClick={spinWheel}
            disabled={isSpinning}
            className={`px-8 py-3 rounded-xl font-semibold text-white transition-all duration-200 ${
              isSpinning
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 shadow-lg hover:shadow-xl'
            }`}
          >
            {isSpinning ? (
              <span className="flex items-center gap-2">
                <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="m4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Đang quay...
              </span>
            ) : (
              'Quay ngay!'
            )}
          </button>
        </div>

        {/* Result */}
        {result && (
          <div className="mt-6 p-4 bg-gradient-to-r from-green-100 to-emerald-100 rounded-xl border border-green-200 text-center">
            <h3 className="text-lg font-bold text-green-800 mb-2">🎉 Chúc mừng!</h3>
            <p className="text-green-700 font-semibold">Bạn đã nhận được: {result}</p>
            <button
              onClick={onClose}
              className="mt-3 px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              Sử dụng ngay
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default LuckyWheel;
