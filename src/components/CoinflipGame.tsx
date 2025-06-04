import React, { useState, useEffect } from 'react';
import { Coin } from './Coin';
import { useGameStore } from '../store/gameStore';

interface CoinflipGameProps {
  matchId: string;
  playerSide: 'heads' | 'tails';
  onGameComplete: (won: boolean) => void;
}

export const CoinflipGame: React.FC<CoinflipGameProps> = ({
  matchId,
  playerSide,
  onGameComplete
}) => {
  const { isFlipping, currentResult, flipCoin } = useGameStore();
  const [showResult, setShowResult] = useState(false);

  useEffect(() => {
    const startGame = async () => {
      const result = await flipCoin(matchId);
      setShowResult(true);
      onGameComplete(result === playerSide);
    };

    startGame();
  }, [matchId, playerSide, flipCoin, onGameComplete]);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-gray-800 rounded-lg p-8 text-center">
        <Coin isFlipping={isFlipping} result={currentResult} />
        
        {showResult && (
          <div className="mt-6">
            <h3 className="text-xl font-bold mb-2">
              {currentResult === playerSide ? 'You Won!' : 'You Lost!'}
            </h3>
            <p className="text-gray-400">
              The coin landed on {currentResult}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}