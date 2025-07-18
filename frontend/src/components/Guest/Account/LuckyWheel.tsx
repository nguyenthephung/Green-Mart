import React, { useState, useEffect } from 'react';
import { luckyVouchers, addUserVoucher } from '../../../data/Guest/vouchers';

const prizes = [
  { label: 'Voucher 10K', value: 'voucher10k' },
  { label: 'Voucher 20K', value: 'voucher20k' },
  { label: 'Voucher 50K', value: 'voucher50k' },
  { label: 'Voucher 100K', value: 'voucher100k' },
  { label: 'Chúc bạn may mắn lần sau', value: 'none' },
  { label: 'Voucher 5%', value: 'voucher5p' },
  { label: 'Voucher 10%', value: 'voucher10p' },
  { label: 'Voucher 20%', value: 'voucher20p' },
];

function getTodayKey(userId: string | number) {
  const today = new Date().toISOString().slice(0, 10);
  return `spin_${userId}_${today}`;
}

const prizeMap = {
  'Voucher 10K': 'LUCKY10K',
  'Voucher 20K': 'LUCKY20K',
  'Voucher 50K': 'LUCKY50K',
  'Voucher 100K': 'LUCKY100K',
  'Voucher 5%': 'LUCKY5P',
  'Voucher 10%': 'LUCKY10P',
  'Voucher 20%': 'LUCKY20P',
};

const LuckyWheel: React.FC<{ userId: string | number }> = ({ userId }) => {
  const [spun, setSpun] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [spinning, setSpinning] = useState(false);
  const [angle, setAngle] = useState(0);

  useEffect(() => {
    const key = getTodayKey(userId);
    const saved = localStorage.getItem(key);
    if (saved) {
      setSpun(true);
      setResult(saved);
    }
  }, [userId]);

  const handleSpin = () => {
    if (spun || spinning) return;
    setSpinning(true);
    const prizeIndex = Math.floor(Math.random() * prizes.length);
    const spinAngle = 360 * 5 + (prizeIndex * (360 / prizes.length));
    setAngle(spinAngle);
    setTimeout(() => {
      setSpinning(false);
      setSpun(true);
      setResult(prizes[prizeIndex].label);
      localStorage.setItem(getTodayKey(userId), prizes[prizeIndex].label);
      // Nếu quay được voucher thì lưu vào voucher của user
      const code = prizeMap[prizes[prizeIndex].label as keyof typeof prizeMap];
      if (code) {
        const voucher = luckyVouchers.find(v => v.code === code);
        if (voucher) addUserVoucher(userId, voucher);
      }
    }, 3500);
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 flex flex-col items-center mt-6">
      <h3 className="text-lg font-bold text-green-700 mb-4">Vòng quay may mắn</h3>
      <div className="relative flex flex-col items-center">
        <div className="w-48 h-48 rounded-full border-8 border-green-300 flex items-center justify-center shadow-lg mb-4 relative overflow-hidden">
          <div
            className="absolute w-full h-full left-0 top-0 transition-transform duration-[3400ms] ease-out"
            style={{ transform: `rotate(${angle}deg)` }}
          >
            {prizes.map((p, i) => (
              <div
                key={i}
                className="absolute left-1/2 top-1/2 origin-left -translate-y-1/2 text-xs font-semibold text-green-800"
                style={{
                  transform: `rotate(${i * (360 / prizes.length)}deg) translateX(20px)`
                }}
              >
                {p.label}
              </div>
            ))}
          </div>
          <div className="absolute left-1/2 top-0 -translate-x-1/2 w-0 h-0 border-l-8 border-r-8 border-b-16 border-l-transparent border-r-transparent border-b-green-600"></div>
        </div>
        <button
          className={`mt-2 px-6 py-2 rounded-lg font-bold text-white bg-gradient-to-br from-green-400 to-green-600 shadow-lg transition-all duration-200 ${spun ? 'opacity-60 cursor-not-allowed' : 'hover:from-green-500 hover:to-green-700'}`}
          onClick={handleSpin}
          disabled={spun || spinning}
        >
          {spun ? 'Bạn đã quay hôm nay' : spinning ? 'Đang quay...' : 'Quay ngay'}
        </button>
        {result && (
          <div className="mt-4 text-green-700 font-semibold text-base">Kết quả: {result}</div>
        )}
      </div>
      <div className="mt-3 text-xs text-gray-400">Mỗi tài khoản chỉ được quay 1 lần/ngày</div>
    </div>
  );
};

export default LuckyWheel;
