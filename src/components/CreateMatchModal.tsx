import React, { useState } from 'react';
import { X } from 'lucide-react';

interface CreateMatchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateMatch: (side: 'heads' | 'tails', selectedItems: number[]) => void;
  availableItems: Array<{
    id: number;
    name: string;
    value: number;
    rarity: string;
    image: string;
  }>;
}

export const CreateMatchModal: React.FC<CreateMatchModalProps> = ({
  isOpen,
  onClose,
  onCreateMatch,
  availableItems
}) => {
  const [selectedSide, setSelectedSide] = useState<'heads' | 'tails'>('heads');
  const [selectedItems, setSelectedItems] = useState<number[]>([]);

  const totalValue = availableItems
    .filter(item => selectedItems.includes(item.id))
    .reduce((sum, item) => sum + item.value, 0);

  const handleCreateMatch = () => {
    onCreateMatch(selectedSide, selectedItems);
    onClose();
    setSelectedItems([]);
    setSelectedSide('heads');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-gray-800 rounded-lg w-full max-w-2xl p-6">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-bold">Create Match</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-white">
            <X size={24} />
          </button>
        </div>

        <div className="mb-6">
          <label className="block text-sm text-gray-400 mb-2">Select Side</label>
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => setSelectedSide('heads')}
              className={`py-3 rounded-lg ${
                selectedSide === 'heads'
                  ? 'bg-indigo-600 text-white'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              Heads
            </button>
            <button
              onClick={() => setSelectedSide('tails')}
              className={`py-3 rounded-lg ${
                selectedSide === 'tails'
                  ? 'bg-indigo-600 text-white'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              Tails
            </button>
          </div>
        </div>

        <div className="mb-6">
          <div className="flex justify-between items-center mb-2">
            <label className="text-sm text-gray-400">Select Items</label>
            <span className="text-sm text-gray-400">Total: {totalValue} coins</span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 max-h-64 overflow-y-auto">
            {availableItems.map(item => (
              <div
                key={item.id}
                onClick={() => {
                  setSelectedItems(prev =>
                    prev.includes(item.id)
                      ? prev.filter(id => id !== item.id)
                      : [...prev, item.id]
                  );
                }}
                className={`
                  bg-gray-700 rounded-lg p-3 cursor-pointer transition-colors
                  ${selectedItems.includes(item.id) ? 'ring-2 ring-indigo-500' : ''}
                `}
              >
                <div className="h-24 rounded overflow-hidden mb-2">
                  <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                </div>
                <div className="flex justify-between items-start">
                  <span className="text-sm font-medium">{item.name}</span>
                  <span className={`text-xs px-2 py-1 rounded ${
                    item.rarity === 'rare' ? 'bg-blue-900/30 text-blue-400' :
                    item.rarity === 'epic' ? 'bg-purple-900/30 text-purple-400' :
                    'bg-green-900/30 text-green-400'
                  }`}>
                    {item.rarity}
                  </span>
                </div>
                <div className="mt-1 text-yellow-400 text-sm">{item.value} coins</div>
              </div>
            ))}
          </div>
        </div>

        <button
          onClick={handleCreateMatch}
          disabled={selectedItems.length === 0}
          className={`
            w-full py-4 rounded-lg font-medium
            ${selectedItems.length === 0
              ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
              : 'bg-indigo-600 hover:bg-indigo-700 text-white'
            }
          `}
        >
          Create Match
        </button>
      </div>
    </div>
  );
};