import React, { useEffect, useState } from 'react';
import { CoinsIcon, UserIcon } from 'lucide-react';
import { CreateMatchModal } from '../components/CreateMatchModal';
import { useMatchStore } from '../store/matchStore';
import { supabase } from '../lib/supabase';

export const CoinflipPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'all' | 'my'>('all');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [availableItems, setAvailableItems] = useState<any[]>([]);
  const { matches, loading, fetchMatches, createMatch, joinMatch } = useMatchStore();
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    const fetchItems = async () => {
      const { data: items } = await supabase.from('items').select('*');
      if (items) setAvailableItems(items);
    };

    const fetchUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) setUserId(user.id);
    };

    fetchItems();
    fetchUser();
    fetchMatches();

    // Subscribe to changes
    const channel = supabase
      .channel('matches')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'matches' }, () => {
        fetchMatches();
      })
      .subscribe();

    return () => {
      channel.unsubscribe();
    };
  }, [fetchMatches]);

  const handleCreateMatch = async (side: 'heads' | 'tails', selectedItemIds: string[]) => {
    try {
      await createMatch(side, selectedItemIds);
      setIsCreateModalOpen(false);
    } catch (error) {
      console.error('Error creating match:', error);
    }
  };

  const handleJoinMatch = async (matchId: string) => {
    try {
      const match = matches.find(m => m.id === matchId);
      if (!match) return;

      const matchValue = match.items.reduce((sum, item) => sum + item.value, 0);
      const targetValue = matchValue; // You want to match this value approximately

      // Find a combination of items that matches the target value within 10%
      const validItems = availableItems.filter(item => {
        const totalValue = item.value;
        return totalValue >= matchValue * 0.9 && totalValue <= matchValue * 1.1;
      });

      if (validItems.length === 0) {
        alert('No valid items found to join this match');
        return;
      }

      await joinMatch(matchId, [validItems[0].id]);
    } catch (error) {
      console.error('Error joining match:', error);
      alert(error instanceof Error ? error.message : 'Error joining match');
    }
  };

  const displayedMatches = activeTab === 'my' 
    ? matches.filter(match => match.items.some(item => item.user_id === userId))
    : matches;

  if (loading) {
    return <div className="text-center py-8">Loading...</div>;
  }

  return (
    <div className="max-w-5xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <div className="flex space-x-4">
          <button
            onClick={() => setActiveTab('all')}
            className={`px-6 py-3 rounded-lg font-medium transition-colors ${
              activeTab === 'all'
                ? 'bg-indigo-600 text-white'
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            All Matches
          </button>
          <button
            onClick={() => setActiveTab('my')}
            className={`px-6 py-3 rounded-lg font-medium transition-colors ${
              activeTab === 'my'
                ? 'bg-indigo-600 text-white'
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            My Matches
          </button>
        </div>
        <button 
          onClick={() => setIsCreateModalOpen(true)}
          className="px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors"
        >
          Create Match
        </button>
      </div>

      <div className="grid gap-6">
        {displayedMatches.map(match => (
          <div key={match.id} className="bg-gray-800 rounded-lg p-6">
            <div className="flex justify-between items-start mb-6">
              <div className="flex items-center">
                <div className="w-10 h-10 bg-gray-700 rounded-full flex items-center justify-center mr-3">
                  <UserIcon size={20} className="text-gray-400" />
                </div>
                <div>
                  <h3 className="font-medium">Player</h3>
                  <p className="text-sm text-gray-400">{new Date(match.created_at).toLocaleString()}</p>
                </div>
              </div>
              <div className="flex items-center">
                <div className={`px-4 py-2 rounded-lg mr-4 ${
                  match.selected_side === 'heads' ? 'bg-yellow-900/20 text-yellow-400' : 'bg-gray-900/40 text-gray-300'
                }`}>
                  {match.selected_side.charAt(0).toUpperCase() + match.selected_side.slice(1)}
                </div>
                <div className="flex items-center bg-gray-700 px-4 py-2 rounded-lg">
                  <CoinsIcon size={16} className="text-yellow-400 mr-2" />
                  <span>{match.items.reduce((sum, item) => sum + item.value, 0)}</span>
                </div>
              </div>
            </div>

            <div className="border-t border-gray-700 pt-4">
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 mb-4">
                {match.items.map(item => (
                  <div key={item.id} className="bg-gray-700 rounded-lg p-3">
                    <div className="flex justify-between items-start mb-2">
                      <span className="text-sm font-medium">{item.name}</span>
                      <span className={`text-xs px-2 py-1 rounded ${
                        item.rarity === 'rare' ? 'bg-blue-900/30 text-blue-400' :
                        item.rarity === 'epic' ? 'bg-purple-900/30 text-purple-400' :
                        'bg-green-900/30 text-green-400'
                      }`}>
                        {item.rarity}
                      </span>
                    </div>
                    <div className="flex items-center text-yellow-400">
                      <CoinsIcon size={14} className="mr-1" />
                      <span className="text-sm">{item.value}</span>
                    </div>
                  </div>
                ))}
              </div>
              {match.items.every(item => item.user_id !== userId) && (
                <button 
                  onClick={() => handleJoinMatch(match.id)}
                  className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium transition-colors"
                >
                  Join Match
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      <CreateMatchModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onCreateMatch={handleCreateMatch}
        availableItems={availableItems}
      />
    </div>
  );
};