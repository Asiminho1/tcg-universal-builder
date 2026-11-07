import React, { useState } from 'react';
import { X, Minus, Upload, Download, Check } from 'lucide-react';
import ManaCurve from './ManaCurve';

export default function DeckDrawer({ isOpen, onClose, deck, onRemove, onImport }) {
  const [showImportInput, setShowImportInput] = useState(false);
  const [importCode, setImportCode] = useState('');

  const deckCounts = deck.reduce((acc, card) => {
    acc[card.id] = (acc[card.id] || 0) + 1;
    return acc;
  }, {});

  const uniqueCards = Array.from(new Set(deck.map(c => c.id)))
    .map(id => deck.find(c => c.id === id))
    .sort((a, b) => {
      if (a.type === 'Leader' && b.type !== 'Leader') return -1;
      if (a.type !== 'Leader' && b.type === 'Leader') return 1;
      return a.cost - b.cost;
    });

  const handleExport = () => {
    if (deck.length === 0) {
      alert("Your deck is empty!");
      return;
    }
    const deckIds = deck.map(c => c.id);
    const deckCode = btoa(JSON.stringify(deckIds));
    navigator.clipboard.writeText(deckCode);
    alert("Deck code copied to clipboard!");
  };

  const submitImport = () => {
    if (!importCode.trim()) return;
    onImport(importCode.trim());
    setImportCode('');
    setShowImportInput(false);
  };

  // Hilfsfunktion für echte TCG-Farben an den Kartenrändern
  const getColorBorder = (color) => {
    switch (color) {
      case 'Red': return 'border-l-red-500';
      case 'Green': return 'border-l-green-500';
      case 'Blue': return 'border-l-blue-500';
      case 'Purple': return 'border-l-purple-500';
      case 'Black': return 'border-l-gray-400';
      case 'Yellow': return 'border-l-yellow-400';
      default: return 'border-l-gray-700';
    }
  };

  return (
    <>
      {/* Overlay: Nur auf Mobile sichtbar, wenn der Drawer offen ist */}
      {isOpen && (
        <div 
          className="xl:hidden fixed inset-0 bg-black/60 z-40 backdrop-blur-sm"
          onClick={onClose}
        />
      )}

      {/* 
        Responsive Container: 
        Mobile: Fixed, fährt von rechts rein (z-50)
        Desktop (xl): Sticky sidebar, immer sichtbar (z-30)
      */}
      <aside 
        className={`
          fixed top-0 right-0 h-full w-full sm:w-[400px] bg-surface border-l border-gray-800 z-50 flex flex-col shadow-2xl transition-transform duration-300
          xl:sticky xl:top-14 xl:h-[calc(100vh-3.5rem)] xl:translate-x-0 xl:shadow-none xl:z-30
          ${isOpen ? 'translate-x-0' : 'translate-x-full'}
        `}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-800 bg-[#0f141d]">
          <div>
            <h2 className="text-sm font-bold text-gray-100 uppercase tracking-widest">Decklist</h2>
            <p className="text-xs text-gray-400 font-mono mt-0.5">{deck.length} / 50 Cards</p>
          </div>
          {/* Close-Button nur auf Mobile anzeigen */}
          <button 
            onClick={onClose}
            className="xl:hidden p-2 hover:bg-gray-800 rounded-lg text-gray-400 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-2 custom-scrollbar bg-surface">
          {deck.length > 0 && <ManaCurve deck={deck} />}

          {uniqueCards.length === 0 ? (
            <div className="text-center text-gray-500 mt-10 text-sm">
              Deck is empty. <br/> Click cards to add them.
            </div>
          ) : (
            <div className="space-y-1.5 mt-2">
              {uniqueCards.map(card => (
                <div 
                  key={card.id} 
                  // Hier kommt die dynamische TCG-Farbmarkierung zum Einsatz
                  className={`flex items-center justify-between bg-[#141a23] border border-gray-800 border-l-4 ${getColorBorder(card.color)} p-2 rounded hover:bg-gray-800 transition-colors`}
                >
                  <div className="flex-1 min-w-0 flex items-center gap-3">
                    <span className="text-xs font-bold w-5 text-center text-gray-300">
                      {deckCounts[card.id]}
                    </span>
                    <div className="flex flex-col min-w-0">
                      <h4 className="font-semibold text-[13px] text-gray-100 truncate" title={card.name}>
                        {card.name}
                      </h4>
                      <div className="text-[10px] text-gray-500 flex gap-2 font-mono mt-0.5">
                        <span className={card.type === 'Leader' ? 'text-yellow-500 font-bold' : ''}>
                          Cost: {card.cost}
                        </span>
                        <span>•</span>
                        <span>{card.type}</span>
                      </div>
                    </div>
                  </div>
                  
                  <button 
                    onClick={() => onRemove(card)}
                    className="ml-2 p-1.5 hover:bg-red-900/40 hover:text-red-400 text-gray-500 rounded transition-colors"
                  >
                    <Minus size={14} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Export/Import Footer */}
        {showImportInput ? (
          <div className="p-4 border-t border-gray-800 bg-[#0f141d] flex flex-col gap-2">
            <input 
              type="text" 
              placeholder="Paste code..." 
              value={importCode}
              onChange={(e) => setImportCode(e.target.value)}
              className="w-full bg-gray-900 border border-gray-700 text-white rounded px-3 py-2 text-sm focus:outline-none focus:border-primary"
              autoFocus
            />
            <div className="flex gap-2">
              <button 
                onClick={() => setShowImportInput(false)}
                className="flex-1 bg-gray-800 hover:bg-gray-700 text-gray-300 py-2 rounded text-xs font-bold transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={submitImport}
                className="flex-1 bg-primary hover:bg-blue-600 text-white py-2 rounded text-xs font-bold transition-all flex items-center justify-center gap-1"
              >
                <Check size={14} /> Load
              </button>
            </div>
          </div>
        ) : (
          <div className="p-4 border-t border-gray-800 bg-[#0f141d] flex gap-2">
            <button 
              onClick={() => setShowImportInput(true)}
              className="flex-1 bg-gray-800 hover:bg-gray-700 text-gray-300 py-2 rounded text-xs font-bold transition-colors flex items-center justify-center gap-1.5"
            >
              <Download size={14} /> Import
            </button>
            <button 
              onClick={handleExport}
              className="flex-1 bg-gray-200 hover:bg-white text-gray-900 py-2 rounded text-xs font-bold transition-all flex items-center justify-center gap-1.5"
            >
              <Upload size={14} /> Export
            </button>
          </div>
        )}
      </aside>
    </>
  );
}