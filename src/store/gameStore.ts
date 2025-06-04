import { create } from 'zustand';
import { supabase } from '../lib/supabase';

interface GameState {
  isFlipping: boolean;
  currentResult: 'heads' | 'tails' | null;
  userItems: any[];
  fetchUserItems: () => Promise<void>;
  flipCoin: (matchId: string) => Promise<'heads' | 'tails'>;
  transferItems: (winnerId: string, itemIds: string[]) => Promise<void>;
}

export const useGameStore = create<GameState>((set) => ({
  isFlipping: false,
  currentResult: null,
  userItems: [],

  fetchUserItems: async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data: items } = await supabase
      .from('items')
      .select('*')
      .eq('user_id', user.id);

    if (items) {
      set({ userItems: items });
    }
  },

  flipCoin: async (matchId: string) => {
    set({ isFlipping: true, currentResult: null });

    // Simulate coin flip animation
    await new Promise(resolve => setTimeout(resolve, 2000));

    const result = Math.random() < 0.5 ? 'heads' : 'tails';
    set({ isFlipping: false, currentResult: result });

    // Update match result in database
    await supabase
      .from('matches')
      .update({ 
        status: 'completed',
        result 
      })
      .eq('id', matchId);

    return result;
  },

  transferItems: async (winnerId: string, itemIds: string[]) => {
    await supabase
      .from('items')
      .update({ user_id: winnerId })
      .in('id', itemIds);
  }
}));