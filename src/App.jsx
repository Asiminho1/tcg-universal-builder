import React, { useState, useMemo } from 'react';
import rawCards from './data/cards.json';
import Card from './components/Card';

const uniqueCards = Array.from(new Map(rawCards.map(c => [c.imageUrl, c])).values());
const ALL_COLORS = ["Red", "Green", "Blue", "Purple", "Black", "Yellow"];

export default function App() {
  const [activeGame, setActiveGame] = useState(null); 
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedColors, setSelectedColors] = useState([]);
  const [deck, setDeck] = useState([]);
  const [selectedCard, setSelectedCard] = useState(null);
  
  const [exportData, setExportData] = useState(null);
  const [exportBtnText, setExportBtnText] = useState("Copy to Clipboard");
  const [alertMsg, setAlertMsg] = useState(null);

  const showWarning = (msg) => {
    setAlertMsg(msg);
    setTimeout(() => setAlertMsg(null), 3000);
  };

  const toggleColor = (color) => {
    if (selectedColors.includes(color)) {
      setSelectedColors(selectedColors.filter(c => c !== color));
    } else if (selectedColors.length < 2) {
      setSelectedColors([...selectedColors, color]);
    }
  };

  const filteredCards = useMemo(() => {
    return uniqueCards.filter(card => {
      const query = searchQuery.toLowerCase();
      const matchesSearch = 
        (card.name && card.name.toLowerCase().includes(query)) || 
        (card.id && card.id.toLowerCase().includes(query)) || 
        (card.type && card.type.toLowerCase().includes(query));

      const matchesColor = selectedColors.length === 0 || 
        selectedColors.every(sc => card.color && card.color.some(c => c.toLowerCase().includes(sc.toLowerCase())));

      return matchesSearch && matchesColor;
    });
  }, [searchQuery, selectedColors]);

  const addToDeck = (card) => {
    const isLeader = card.type && card.type.toLowerCase().includes('leader');
    const isDon = card.type && card.type.toLowerCase().includes('don');

    if (isDon) {
      showWarning("DON!! cards belong in the DON!! deck, not the main deck.");
      return;
    }

    if (isLeader) {
      if (deck.some(c => c.type.toLowerCase().includes('leader'))) {
        showWarning("Rule Violation: Your deck can only contain ONE Leader!");
        return;
      }
      setDeck([card, ...deck]);
      return;
    }

    const mainDeckCards = deck.filter(c => !c.type.toLowerCase().includes('leader'));
    if (mainDeckCards.length >= 50) {
      showWarning("Rule Violation: Main deck is full (Max 50 cards allowed).");
      return;
    }

    const copies = deck.filter(c => c.id === card.id).length;
    const allowsUnlimited = card.effect && (
      card.effect.toLowerCase().includes("up to 50 copies") || 
      card.effect.toLowerCase().includes("any number of")
    );

    if (copies >= 4 && !allowsUnlimited) {
      showWarning(`Rule Violation: Max 4 copies of "${card.name}" allowed.`);
      return;
    }

    setDeck([...deck, card]);
  };

  const removeCardById = (id) => {
    const index = deck.findIndex(c => c.id === id);
    if (index !== -1) {
      const newDeck = [...deck];
      newDeck.splice(index, 1);
      setDeck(newDeck);
    }
  };

  const clearDeck = () => {
    if (window.confirm("Are you sure you want to clear your entire deck?")) {
      setDeck([]);
    }
  };

  const handleExportClick = () => {
    if (deck.length === 0) return;
    const counts = {};
    deck.forEach(c => { counts[c.id] = (counts[c.id] || 0) + 1; });
    const uniqueDeck = Array.from(new Set(deck.map(c => c.id))).map(id => deck.find(c => c.id === id));
    uniqueDeck.sort((a, b) => {
      if (a.type.includes('Leader') && !b.type.includes('Leader')) return -1;
      if (b.type.includes('Leader') && !a.type.includes('Leader')) return 1;
      return (a.cost || 0) - (b.cost || 0);
    });
    const listString = uniqueDeck.map(c => `${counts[c.id]}x ${c.id} ${c.name}`).join('\n');
    setExportData(listString);
  };

  const executeCopy = () => {
    navigator.clipboard.writeText(exportData).then(() => {
      setExportBtnText("Copied! ✓");
      setTimeout(() => setExportBtnText("Copy to Clipboard"), 2000);
    });
  };

  const deckCounts = {};
  deck.forEach(c => { deckCounts[c.id] = (deckCounts[c.id] || 0) + 1; });
  const groupedDeck = Array.from(new Set(deck.map(c => c.id)))
    .map(id => deck.find(c => c.id === id))
    .sort((a, b) => {
      if (a.type.includes('Leader') && !b.type.includes('Leader')) return -1;
      if (b.type.includes('Leader') && !a.type.includes('Leader')) return 1;
      return (a.cost || 0) - (b.cost || 0);
    });

  if (!activeGame) {
    return (
      <div className="min-h-screen bg-[#050505] text-white flex flex-col items-center justify-center p-6 relative overflow-hidden font-sans">
        <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] bg-gradient-to-br from-blue-700/20 to-purple-700/20 rounded-full blur-[120px] pointer-events-none animate-pulse"></div>
        <div className="absolute bottom-[-20%] right-[-10%] w-[600px] h-[600px] bg-gradient-to-br from-red-700/20 to-orange-700/20 rounded-full blur-[120px] pointer-events-none animate-pulse" style={{ animationDelay: '1s' }}></div>
        
        <div className="z-10 max-w-5xl w-full text-center mb-16">
          <h1 className="text-5xl md:text-7xl font-black mb-4 tracking-tight">
            Universal <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-emerald-400">TCG</span> Hub
          </h1>
          <p className="text-gray-400 text-lg md:text-xl max-w-2xl mx-auto font-medium">
            Select your game. Build your ultimate deck.
          </p>
        </div>

        <div className="z-10 grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-5xl">
          <div 
            onClick={() => setActiveGame('OP')}
            className="group relative bg-[#121212] rounded-2xl border border-gray-800 hover:border-red-500 overflow-hidden cursor-pointer transition-all duration-300 hover:-translate-y-2 shadow-xl hover:shadow-[0_0_40px_rgba(239,68,68,0.3)]"
          >
            <div className="h-48 bg-gradient-to-br from-red-900/90 via-[#121212] to-black relative overflow-hidden flex items-center justify-center">
              <span className="text-8xl opacity-30 transform group-hover:scale-110 transition-transform duration-500">🏴‍☠️</span>
              <div className="absolute inset-0 bg-gradient-to-t from-[#121212] to-transparent"></div>
            </div>
            <div className="p-6 relative">
              <h2 className="text-2xl font-bold mb-2 text-gray-100 flex items-center gap-2">
                One Piece TCG <span className="w-2 h-2 rounded-full bg-green-500 animate-ping"></span>
              </h2>
              <p className="text-gray-400 text-sm">Full card database and strict deckbuilding rules engine. Live now.</p>
              <div className="mt-5 text-red-400 font-bold text-sm tracking-wide group-hover:translate-x-2 transition-transform flex items-center gap-2">
                ENTER BUILDER <span className="text-lg">→</span>
              </div>
            </div>
          </div>

          <div className="relative bg-[#121212] rounded-2xl border border-gray-800 overflow-hidden cursor-not-allowed grayscale-[0.8] opacity-60">
            <div className="h-48 bg-gradient-to-br from-orange-900/90 via-[#121212] to-black relative overflow-hidden flex items-center justify-center">
              <span className="text-8xl opacity-30">🦊</span>
            </div>
            <div className="absolute top-4 right-4 bg-gray-900/90 text-gray-300 border border-gray-700 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider backdrop-blur-md">
              Coming Soon
            </div>
            <div className="p-6 relative">
              <h2 className="text-2xl font-bold mb-2 text-gray-300">Naruto TCG</h2>
              <p className="text-gray-500 text-sm">Database indexing in progress.</p>
            </div>
          </div>

          <div className="relative bg-[#121212] rounded-2xl border border-gray-800 overflow-hidden cursor-not-allowed grayscale-[0.8] opacity-60">
            <div className="h-48 bg-gradient-to-br from-pink-900/90 via-[#121212] to-blue-900/40 relative overflow-hidden flex items-center justify-center">
              <span className="text-8xl opacity-30">🦾</span>
            </div>
            <div className="absolute top-4 right-4 bg-gray-900/90 text-gray-300 border border-gray-700 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider backdrop-blur-md">
              Coming Soon
            </div>
            <div className="p-6 relative">
              <h2 className="text-2xl font-bold mb-2 text-gray-300">Cyberpunk TCG</h2>
              <p className="text-gray-500 text-sm">Syncing with the mainframe.</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col font-sans bg-[#09090b] text-gray-100">
      
      <style>{`
        .animate-card-enter {
          animation: cardEnter 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards;
          opacity: 0;
          transform: translateY(20px) scale(0.97);
        }
        @keyframes cardEnter {
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: #121214; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #3f3f46; border-radius: 10px; }
      `}</style>

      {alertMsg && (
        <div className="fixed top-20 left-1/2 transform -translate-x-1/2 z-[100] bg-red-600 border-2 border-red-400 text-white font-bold px-6 py-3 rounded-xl shadow-[0_0_30px_rgba(220,38,38,0.6)] animate-bounce">
          {alertMsg}
        </div>
      )}

      {selectedCard && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/95 backdrop-blur-md p-4 cursor-pointer" onClick={() => setSelectedCard(null)}>
          <div className="relative max-w-sm md:max-w-md w-full" onClick={e => e.stopPropagation()}>
            <img src={selectedCard.imageUrl} alt={selectedCard.name} className="w-full rounded-2xl shadow-[0_0_80px_rgba(255,255,255,0.15)] border border-gray-700" />
          </div>
        </div>
      )}

      {exportData && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/80 backdrop-blur-md p-4" onClick={() => setExportData(null)}>
          <div className="bg-[#18181b] border border-gray-700 rounded-2xl p-6 w-full max-w-lg shadow-2xl flex flex-col" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-white tracking-wide">Deck Export</h3>
              <button onClick={() => setExportData(null)} className="text-gray-400 hover:text-red-500 text-xl font-bold">✕</button>
            </div>
            <textarea readOnly value={exportData} className="w-full h-64 bg-[#121214] border border-gray-800 rounded-xl p-4 text-sm text-gray-300 font-mono focus:outline-none custom-scrollbar mb-4 resize-none" />
            <button onClick={executeCopy} className="w-full bg-red-600 hover:bg-red-500 text-white font-bold py-3.5 rounded-xl shadow-lg transition-all uppercase tracking-wider text-sm">
              {exportBtnText}
            </button>
          </div>
        </div>
      )}

      <header className="relative z-10 bg-[#09090b] border-b border-gray-800 flex justify-between items-center px-6 py-3">
        <h1 className="text-lg font-black text-gray-200 tracking-wider flex items-center gap-3 cursor-pointer hover:text-white transition-colors" onClick={() => setActiveGame(null)}>
          <span className="bg-gradient-to-r from-red-600 to-red-400 text-white px-2.5 py-1 rounded-md text-xs shadow-md">HUB</span> 
          ONE PIECE BUILDER
        </h1>
      </header>

      <div className="relative z-10 flex-1 flex flex-col md:flex-row p-4 gap-4 h-[calc(100vh-80px)] overflow-hidden">
        <div className="flex-1 flex flex-col bg-[#121214] rounded-xl border border-gray-800 p-4 shadow-xl overflow-hidden">
          <div className="flex flex-col xl:flex-row gap-4 mb-4 pb-4 border-b border-gray-800 shrink-0">
            <input 
              type="text" 
              placeholder="Search by Name, ID (OP17) or Type..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1 bg-[#18181b] border border-gray-700 rounded-lg p-3 text-white focus:border-red-500 outline-none transition-all placeholder-gray-600 shadow-inner"
            />
            <div className="flex flex-wrap items-center gap-2">
              {ALL_COLORS.map(col => (
                <button
                  key={col}
                  onClick={() => toggleColor(col)}
                  className={`px-4 py-2 rounded-lg text-sm font-bold border transition-all ${
                    selectedColors.includes(col) 
                      ? 'bg-gray-200 text-gray-900 border-white shadow-[0_0_15px_rgba(255,255,255,0.2)]' 
                      : 'bg-[#18181b] text-gray-400 border-gray-700 hover:border-gray-500 hover:text-white'
                  }`}
                >
                  {col}
                </button>
              ))}
              {selectedColors.length > 0 && (
                <button onClick={() => setSelectedColors([])} className="text-xs font-bold text-gray-500 hover:text-white ml-2 uppercase">
                  Clear
                </button>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-4 overflow-y-auto pr-2 pb-10 custom-scrollbar scroll-smooth">
            {filteredCards.map((card, index) => (
              <div key={card.id} className="animate-card-enter" style={{ animationDelay: `${(index % 15) * 0.03}s` }}>
                <Card card={card} onAdd={addToDeck} onClickImage={setSelectedCard} />
              </div>
            ))}
          </div>
        </div>

        <div className="w-full md:w-[340px] bg-[#121214] rounded-xl border border-gray-800 flex flex-col h-full shadow-2xl shrink-0 overflow-hidden">
          <div className="p-4 border-b border-gray-800 bg-[#18181b] flex justify-between items-center">
            <div>
              <h2 className="font-bold text-lg text-white tracking-wide">DECKLIST</h2>
              <p className="text-sm text-gray-400 font-bold">{deck.filter(c => !c.type.includes('Leader')).length} / 50 Cards</p>
            </div>
            {deck.length > 0 && (
              <button 
                onClick={clearDeck}
                className="text-xs font-bold text-red-400 hover:text-red-300 bg-red-950/40 border border-red-900 px-2.5 py-1 rounded-lg transition-colors"
              >
                Clear Deck
              </button>
            )}
          </div>
          
          <div className="flex-1 overflow-y-auto p-3 space-y-2 custom-scrollbar">
            {groupedDeck.map((card) => {
              const isLeader = card.type.includes('Leader');
              return (
                <div key={card.id} className={`flex justify-between items-center p-2.5 rounded-lg border transition-colors group ${
                  isLeader ? 'bg-red-900/20 border-red-900/50 hover:border-red-700' : 'bg-[#18181b] border-gray-800 hover:border-gray-600'
                }`}>
                  <div className="flex items-center gap-3 overflow-hidden">
                    <div className={`w-6 h-6 flex items-center justify-center font-black text-xs rounded ${
                      isLeader ? 'bg-red-600 text-white' : 'bg-gray-700 text-gray-300'
                    }`}>
                      {isLeader ? 'L' : card.cost}
                    </div>
                    <div className="flex flex-col">
                      <div className="text-sm font-semibold truncate text-gray-200" title={card.name}>{card.name}</div>
                      <div className={`text-xs font-bold ${isLeader ? 'text-red-400' : 'text-blue-400'}`}>
                        {isLeader ? 'LEADER' : `${deckCounts[card.id]}x`}
                      </div>
                    </div>
                  </div>
                  <button onClick={() => removeCardById(card.id)} className="text-gray-600 hover:text-red-500 font-bold px-3 py-1 text-lg transition-colors">
                    −
                  </button>
                </div>
              );
            })}
            {deck.length === 0 && (
              <div className="text-center text-gray-500 text-sm mt-10 p-4 border border-dashed border-gray-800 rounded-xl">
                Deck is empty.<br/>Click "+ Add" to start building.
              </div>
            )}
          </div>
          
          <div className="p-4 border-t border-gray-800 bg-[#18181b] mt-auto flex flex-col gap-2">
            <button 
              onClick={handleExportClick}
              disabled={deck.length === 0}
              className={`w-full font-bold py-3 rounded-lg shadow-lg transition-all border uppercase tracking-wider text-sm ${
                deck.length > 0 
                  ? 'bg-red-600 hover:bg-red-500 text-white border-red-500 cursor-pointer hover:-translate-y-0.5' 
                  : 'bg-gray-800 text-gray-500 border-gray-700 cursor-not-allowed'
              }`}
            >
              Export Deck
            </button>
            
            {/* Dezenter Support / Ko-fi Link (Nervt niemanden, sieht professionell aus) */}
            <a 
              href="https://ko-fi.com/asiminho" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-center text-[11px] text-gray-500 hover:text-gray-300 transition-colors py-1"
            >
              ☕ Support this project
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}