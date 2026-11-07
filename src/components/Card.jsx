import React from 'react';
import { Plus } from 'lucide-react';

export default function Card({ card, onAdd, onClickImage }) {
  // Verarbeitet sowohl einzelne Farben als auch Arrays mit zwei Farben (Multi-Color)
  const colors = Array.isArray(card.color) ? card.color : [card.color];

  return (
    <div className="bg-surface rounded-xl overflow-hidden shadow-md border border-gray-800 hover:border-gray-600 hover:-translate-y-1 hover:shadow-xl transition-all duration-200 flex flex-col h-full group">
      
      {/* Card Image Wrapper */}
      <div 
        className="relative pt-[140%] w-full bg-gray-900 cursor-pointer overflow-hidden"
        onClick={() => onClickImage(card)}
      >
        <img 
          src={card.imageUrl} 
          alt={card.name} 
          className="absolute top-0 left-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-surface via-transparent to-transparent opacity-80" />
      </div>
      
      {/* Card Info */}
      <div className="p-3 flex flex-col flex-grow relative z-10 -mt-6 bg-surface rounded-t-xl">
        <div className="flex justify-between items-start mb-1 pt-1">
          <h3 className="font-bold text-sm text-gray-100 line-clamp-1" title={card.name}>{card.name}</h3>
        </div>
        
        <div className="text-[11px] text-gray-400 mb-3 flex items-center gap-1.5 font-medium flex-wrap">
          <span>{card.type}</span>
          <span>•</span>
          <div className="flex gap-1">
            {colors.map((col, idx) => (
              <span key={idx} className={
                col === 'Red' ? 'text-red-400' : 
                col === 'Green' ? 'text-green-400' : 
                col === 'Blue' ? 'text-blue-400' : 
                col === 'Purple' ? 'text-purple-400' : 
                col === 'Black' ? 'text-gray-300' : 
                col === 'Yellow' ? 'text-yellow-400' : 'text-gray-400'
              }>
                {col}{idx < colors.length - 1 ? '/' : ''}
              </span>
            ))}
          </div>
        </div>

        {/* Add Button */}
        <div className="mt-auto">
          <button 
            onClick={() => onAdd(card)}
            className="w-full bg-gray-800 hover:bg-primary text-white py-2 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2 border border-gray-700 hover:border-primary"
          >
            <Plus size={16} />
            Add
          </button>
        </div>
      </div>
    </div>
  );
}