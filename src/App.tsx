import React, { useState, useEffect } from 'react';
import { Layout } from './components/Layout';
import { CoinflipPage } from './pages/CoinflipPage';
import { InventoryPage } from './pages/InventoryPage';
import { LeaderboardPage } from './pages/LeaderboardPage';
import { FaqPage } from './pages/FaqPage';
import { AuthModal } from './components/AuthModal';
import { supabase } from './lib/supabase';

function App() {
  const [activePage, setActivePage] = useState('coinflip');
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    // Check current session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user || null);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user || null);
    });

    return () => subscription.unsubscribe();
  }, []);

  return (
    <>
      <Layout 
        activePage={activePage} 
        setActivePage={setActivePage}
        user={user}
        onAuthClick={() => setIsAuthModalOpen(true)}
      >
        {activePage === 'coinflip' && <CoinflipPage />}
        {activePage === 'inventory' && <InventoryPage />}
        {activePage === 'leaderboard' && <LeaderboardPage />}
        {activePage === 'faq' && <FaqPage />}
      </Layout>
      
      <AuthModal 
        isOpen={isAuthModalOpen} 
        onClose={() => setIsAuthModalOpen(false)} 
      />
    </>
  );
}

export default App;