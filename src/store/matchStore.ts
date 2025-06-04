import { create } from 'zustand';
import { supabase } from '../lib/supabase';

interface Match {
  id: string;
  creator_id: string;
  selected_side: 'heads' | 'tails';
  status: 'active' | 'completed';
  result?: 'heads' | 'tails';
  created_at: string;
  items: Array<{
    id: string;
    name: string;
    value: number;
    rarity: string;
    side: 'heads' | 'tails';
    user_id: string;
  }>;
}

interface MatchStore {
  matches: Match[];
  loading: boolean;
  fetchMatches: () => Promise<void>;
  createMatch: (side: 'heads' | 'tails', itemIds: string[]) => Promise<void>;
  joinMatch: (matchId: string, itemIds: string[]) => Promise<void>;
}

export const useMatchStore = create<MatchStore>((set, get) => ({
  matches: [],
  loading: false,

  fetchMatches: async () => {
    set({ loading: true });
    
    const { data: matches } = await supabase
      .from('matches')
      .select(`
        *,
        match_items (
          id,
          side,
          user_id,
          items (
            id,
            name,
            value,
            rarity
          )
        )
      `)
      .eq('status', 'active')
      .order('created_at', { ascending: false });

    if (matches) {
      const formattedMatches = matches.map(match => ({
        ...match,
        items: match.match_items.map((mi: any) => ({
          ...mi.items,
          side: mi.side,
          user_id: mi.user_id
        }))
      }));
      set({ matches: formattedMatches });
    }

    set({ loading: false });
  },

  createMatch: async (side: 'heads' | 'tails', itemIds: string[]) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data: match } = await supabase
      .from('matches')
      .insert({ creator_id: user.id, selected_side: side })
      .select()
      .single();

    if (match) {
      const matchItems = itemIds.map(itemId => ({
        match_id: match.id,
        item_id: itemId,
        user_id: user.id,
        side
      }));

      await supabase.from('match_items').insert(matchItems);
      await get().fetchMatches();
    }
  },

  joinMatch: async (matchId: string, itemIds: string[]) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const match = get().matches.find(m => m.id === matchId);
    if (!match) return;

    const oppositeSide = match.selected_side === 'heads' ? 'tails' : 'heads';
    
    // Calculate total values
    const matchValue = match.items.reduce((sum, item) => sum + item.value, 0);
    const { data: selectedItems } = await supabase
      .from('items')
      .select('value')
      .in('id', itemIds);

    if (!selectedItems) return;

    const joinValue = selectedItems.reduce((sum, item) => sum + item.value, 0);
    
    // Check if join value is within acceptable range
    if (joinValue < matchValue * 0.9 || joinValue > matchValue * 1.1) {
      throw new Error('Total value must be between 90% and 110% of the match value');
    }

    const matchItems = itemIds.map(itemId => ({
      match_id: matchId,
      item_id: itemId,
      user_id: user.id,
      side: oppositeSide
    }));

    await supabase.from('match_items').insert(matchItems);
    
    // Generate random result and complete the match
    const result = Math.random() < 0.5 ? 'heads' : 'tails';
    await supabase
      .from('matches')
      .update({ status: 'completed', result })
      .eq('id', matchId);

    await get().fetchMatches();
  }
}));