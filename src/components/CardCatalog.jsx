import React, { useState, useMemo, useEffect } from 'react';
import Card from './Card';
import CardModal from './CardModal';
import { Search } from 'lucide-react';

export default function CardCatalog({ cards, onAdd }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState('All');
  const [selectedColor, setSelectedColor] = useState('All');
  const [selectedCard, setSelectedCard] = useState(null);
  
  // NEU: Performance-State. Wir starten immer mit 30 sichtbaren Karten.
  const [visibleCount, setVisibleCount] = useState(30);

  const types = ['All', ...new Set(cards.map(c => c.type))];
  const colors = ['All', ...new Set(cards.map(c => c.color))];

  // Setzt die sichtbaren Karten wieder auf 30 zurück, sobald ein Filter geändert wird
  useEffect(() => {
    setVisibleCount(30);
  }, [searchTerm, selectedType, selectedColor]);

  const filteredCards = useMemo(() => {
    return cards.filter(card => {
      const matchesSearch = card.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                            (card.effect && card.effect.toLowerCase().includes(searchTerm.toLowerCase())) ||
                            card.id.toLowerCase().includes(searchTerm.toLowerCase()); // Jetzt auch nach Set-IDs (z.B. "OP01") suchbar
                            
      const matchesType = selectedType === 'All' || card.type === selectedType;
      const matchesColor = selectedColor === 'All' || card.color === selectedColor;
      
      return matchesSearch && matchesType && matchesColor;
    });
  }, [cards, searchTerm, selectedType, selectedColor]);

  // NEU: Wir schneiden das Array ab, damit nur "visibleCount" viele Karten gerendert werden
  const displayedCards = filteredCards.slice(0, visibleCount);

  return (
    <div className="space-y-6">
      <div className="bg-surface/80 backdrop-blur-md p-3 md:p-4 rounded-2xl border border-gray-800 shadow-lg space-y-3 md:space-y-0 md:flex md:gap-4 md:items-center sticky top-20 z-10">
        
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input 
            type="text" 
            placeholder="Search characters, sets (e.g., ST01), or effects..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-gray-900/50 border border-gray-700 text-white rounded-xl pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:border-primary transition-all focus:bg-gray-900"
          />
        </div>

        <div className="flex gap-2">
          <div className="relative flex-1 md:w-40 bg-gray-900/50 border border-gray-700 rounded-xl hover:border-gray-500 transition-colors">
            <select 
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="w-full bg-transparent text-white appearance-none px-3 py-2.5 text-sm focus:outline-none cursor-pointer"
            >
              {types.map(type => (
                <option key={type} value={type} className="bg-gray-900">{type === 'All' ? 'All Types' : type}</option>
              ))}
            </select>
          </div>

          <div className="relative flex-1 md:w-40 bg-gray-900/50 border border-gray-700 rounded-xl hover:border-gray-500 transition-colors">
            <select 
              value={selectedColor}
              onChange={(e) => setSelectedColor(e.target.value)}
              className="w-full bg-transparent text-white appearance-none px-3 py-2.5 text-sm focus:outline-none cursor-pointer"
            >
              {colors.map(color => (
                <option key={color} value={color} className="bg-gray-900">{color === 'All' ? 'All Colors' : color}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 md:gap-5">
        {displayedCards.map(card => (
          <Card 
            key={card.id} 
            card={card} 
            onAdd={onAdd} 
            onClickImage={(card) => setSelectedCard(card)} 
          />
        ))}
      </div>
      
      {/* NEU: Load More Button */}
      {visibleCount < filteredCards.length && (
        <div className="flex justify-center pt-8 pb-4">
          <button 
            onClick={() => setVisibleCount(prev => prev + 30)}
            className="bg-gray-800 hover:bg-gray-700 text-white px-8 py-3 rounded-xl font-bold transition-all border border-gray-600 shadow-lg"
          >
            Load More Cards ({filteredCards.length - visibleCount} remaining)
          </button>
        </div>
      )}

      {filteredCards.length === 0 && (
        <div className="text-center py-16 border border-dashed border-gray-700 rounded-2xl bg-surface/50">
          <p className="text-gray-400 text-sm">No cards found matching your criteria.</p>
        </div>
      )}

      <CardModal 
        card={selectedCard} 
        isOpen={selectedCard !== null} 
        onClose={() => setSelectedCard(null)} 
        onAdd={onAdd}
      />
    </div>
  );
}