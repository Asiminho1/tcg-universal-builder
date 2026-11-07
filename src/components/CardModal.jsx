import React from 'react';
import { X, Plus } from 'lucide-react';

export default function CardModal({ card, isOpen, onClose, onAdd }) {
  if (!isOpen || !card) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
      {/* Unscharfer Hintergrund (Glassmorphism) */}
      <div 
        className="absolute inset-0 bg-black/80 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Modal Content */}
      <div className="relative w-full max-w-3xl bg-surface border border-gray-700 rounded-2xl shadow-2xl overflow-hidden flex flex-col md:flex-row max-h-[90vh] md:max-h-[80vh] z-10 animate-in fade-in zoom-in-95 duration-200">
        
        {/* Close Button */}
        <button 
          onClick={onClose}
          className="absolute top-3 right-3 p-2 bg-black/50 hover:bg-gray-700 text-white rounded-full transition-colors z-20"
        >
          <X size={20} />
        </button>

        {/* Linke Seite: Großes Bild */}
        <div className="w-full md:w-1/2 bg-gray-900 p-4 md:p-6 flex items-center justify-center border-b md:border-b-0 md:border-r border-gray-800">
          <img 
            src={card.imageUrl} 
            alt={card.name} 
            className="w-full max-w-[280px] md:max-w-md h-auto object-contain rounded-lg shadow-xl"
          />
        </div>

        {/* Rechte Seite: Details & Effekt */}
        <div className="w-full md:w-1/2 p-6 flex flex-col overflow-y-auto">
          <div className="mb-6">
            <div className="flex justify-between items-start mb-2">
              <h2 className="text-2xl font-bold text-gray-100">{card.name}</h2>
              <span className="text-xs text-gray-400 bg-gray-800 px-2 py-1 rounded border border-gray-700 mt-1">
                {card.id}
              </span>
            </div>
            
            <div className="flex flex-wrap gap-2 text-sm text-gray-300 font-medium mb-4">
              <span className="bg-gray-800 px-2 py-1 rounded">{card.type}</span>
              <span className={`px-2 py-1 rounded bg-gray-800 ${card.color === 'Red' ? 'text-red-400' : card.color === 'Green' ? 'text-green-400' : 'text-gray-400'}`}>
                {card.color}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="bg-gray-900 p-3 rounded-lg border border-gray-800">
                <p className="text-xs text-gray-500 uppercase font-bold mb-1">Cost</p>
                <p className="text-xl font-mono text-blue-400">{card.cost}</p>
              </div>
              <div className="bg-gray-900 p-3 rounded-lg border border-gray-800">
                <p className="text-xs text-gray-500 uppercase font-bold mb-1">Power</p>
                <p className="text-xl font-mono text-yellow-400">{card.power !== null ? card.power : '-'}</p>
              </div>
            </div>

            <div className="mb-6">
              <p className="text-xs text-gray-500 uppercase font-bold mb-2">Effect</p>
              <div className="bg-gray-900/50 p-4 rounded-lg border border-gray-800 text-sm text-gray-300 leading-relaxed whitespace-pre-wrap">
                {card.effect || "No effect."}
              </div>
            </div>
          </div>

          <div className="mt-auto pt-4">
            <button 
              onClick={() => {
                onAdd(card);
                // Optional: onClose() einkommentieren, wenn sich das Fenster nach dem Hinzufügen schließen soll
              }}
              className="w-full bg-primary hover:bg-blue-600 text-white py-3.5 rounded-xl text-sm font-bold transition-all shadow-lg hover:shadow-blue-500/25 flex items-center justify-center gap-2"
            >
              <Plus size={18} />
              Add to Deck
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}