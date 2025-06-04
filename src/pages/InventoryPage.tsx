import React from 'react';
import { CoinsIcon, PackageIcon } from 'lucide-react';

interface InventoryItem {
  id: number;
  name: string;
  value: number;
  rarity: string;
  image: string;
}

export const InventoryPage: React.FC = () => {
  const depositedItems: InventoryItem[] = [
    {
      id: 1,
      name: 'Golden Coin',
      value: 100,
      rarity: 'rare',
      image: 'https://images.pexels.com/photos/106152/euro-coins-currency-money-106152.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1'
    },
    {
      id: 2,
      name: 'Mystery Box',
      value: 200,
      rarity: 'epic',
      image: 'https://images.pexels.com/photos/821718/pexels-photo-821718.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1'
    },
    {
      id: 3,
      name: 'Lucky Charm',
      value: 50,
      rarity: 'uncommon',
      image: 'https://images.pexels.com/photos/4588036/pexels-photo-4588036.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1'
    }
  ];

  const totalValue = depositedItems.reduce((sum, item) => sum + item.value, 0);

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-gray-800 rounded-lg p-6 mb-8">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-2xl font-bold">Your Inventory</h2>
            <p className="text-gray-400 mt-1">Manage your deposited items</p>
          </div>
          <div className="flex items-center bg-gray-700 px-6 py-3 rounded-lg">
            <CoinsIcon size={20} className="text-yellow-400 mr-2" />
            <div>
              <p className="text-sm text-gray-400">Estimated Value</p>
              <p className="font-medium">{totalValue} coins</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {depositedItems.map(item => (
            <div key={item.id} className="bg-gray-700 rounded-lg overflow-hidden">
              <div className="h-40 overflow-hidden">
                <img 
                  src={item.image} 
                  alt={item.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="p-4">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-medium">{item.name}</h3>
                  <span className={`text-xs px-2 py-1 rounded ${
                    item.rarity === 'rare' ? 'bg-blue-900/30 text-blue-400' :
                    item.rarity === 'epic' ? 'bg-purple-900/30 text-purple-400' :
                    'bg-green-900/30 text-green-400'
                  }`}>
                    {item.rarity}
                  </span>
                </div>
                <div className="flex items-center text-yellow-400">
                  <CoinsIcon size={16} className="mr-1" />
                  <span>{item.value}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-gray-800 rounded-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center">
            <PackageIcon size={24} className="text-indigo-400 mr-2" />
            <h3 className="text-xl font-semibold">Deposit Items</h3>
          </div>
          <button className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium transition-colors">
            Connect Wallet
          </button>
        </div>
        <p className="text-gray-400">
          Connect your wallet to deposit items and start playing.
        </p>
      </div>
    </div>
  );
};