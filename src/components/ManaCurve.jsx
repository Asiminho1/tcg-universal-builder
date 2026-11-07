import React from 'react';

export default function ManaCurve({ deck }) {
  // Erweitert auf alle Kosten bis 10 (alles darüber landet in 10+)
  const curve = { 0: 0, 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0, 7: 0, 8: 0, 9: 0, '10+': 0 };
  let maxCount = 0; 

  deck.forEach(card => {
    if (card.type === 'Leader') return; 

    const cost = card.cost;
    if (cost >= 10) {
      curve['10+']++;
      if (curve['10+'] > maxCount) maxCount = curve['10+'];
    } else {
      curve[cost]++;
      if (curve[cost] > maxCount) maxCount = curve[cost];
    }
  });

  const labels = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10'];

  return (
    <div className="bg-gray-900/80 border border-gray-800 rounded-xl p-4 mb-4">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest">Cost Curve</h3>
        <span className="text-xs text-gray-500">(Leaders excluded)</span>
      </div>
      
      {/* gap-1 statt gap-1.5, damit 11 Balken sauber nebeneinander passen */}
      <div className="flex items-end justify-between h-24 gap-1">
        {labels.map(label => {
          const count = curve[label];
          const heightPercent = maxCount > 0 ? (count / maxCount) * 100 : 0;

          return (
            <div key={label} className="flex flex-col items-center flex-1 group relative h-full">
              
              {/* Tooltip on Hover */}
              <div className="absolute -top-8 opacity-0 group-hover:opacity-100 transition-opacity bg-gray-700 text-white text-[10px] px-2 py-1 rounded shadow-lg pointer-events-none z-10">
                {count}
              </div>

              {/* Bar Container */}
              <div className="w-full flex-1 relative flex items-end bg-gray-800/30 rounded-t-md overflow-hidden">
                <div
                  className={`w-full bg-primary rounded-t-md transition-all duration-300 ease-out ${count === 0 ? 'bg-transparent' : ''}`}
                  style={{ height: `${heightPercent}%` }}
                />
              </div>
              
              {/* Cost Label - responsive Schriftgröße (text-[9px] auf Mobile, text-[10px] auf Desktop) */}
              <span className={`text-[9px] sm:text-[10px] mt-2 font-mono ${count > 0 ? 'text-gray-200' : 'text-gray-600'}`}>
                {label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}