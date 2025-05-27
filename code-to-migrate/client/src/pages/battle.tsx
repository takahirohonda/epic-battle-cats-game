import { useState, useEffect } from "react";
import { Link } from "wouter";
import { useActiveBattle } from "@/hooks/use-game";
import BattleArena from "@/components/battle-arena";
import RewardModal from "@/components/reward-modal";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

const DEMO_USER_ID = 1;

export default function Battle() {
  const { data: activeBattle, isLoading } = useActiveBattle(DEMO_USER_ID);
  const [showRewardModal, setShowRewardModal] = useState(false);
  const [battleResult, setBattleResult] = useState<'won' | 'lost' | null>(null);

  useEffect(() => {
    if (activeBattle && (activeBattle.status === 'won' || activeBattle.status === 'lost')) {
      setBattleResult(activeBattle.status);
      setShowRewardModal(true);
    }
  }, [activeBattle]);

  // Redirect to home if no active battle
  useEffect(() => {
    if (!isLoading && !activeBattle) {
      window.location.href = '/';
    }
  }, [isLoading, activeBattle]);

  const handleBattleEnd = (result: 'won' | 'lost') => {
    setBattleResult(result);
    setShowRewardModal(true);
  };

  const handleCloseRewardModal = () => {
    setShowRewardModal(false);
    setBattleResult(null);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center">
        <div className="text-white text-xl">Loading battle...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white">
      {/* Header */}
      <header className="bg-gray-800/80 backdrop-blur-sm border-b border-orange-400/30 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <Link href="/">
              <Button variant="ghost" size="sm" className="text-orange-400 hover:text-orange-300">
                <i className="fas fa-arrow-left mr-2"></i>
                Back to Collection
              </Button>
            </Link>
            <h1 className="text-2xl font-game text-orange-400">⚔️ Battle Arena</h1>
            <div></div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-6">
        {activeBattle ? (
          <BattleArena 
            battle={activeBattle} 
            onBattleEnd={handleBattleEnd}
          />
        ) : (
          <Card className="bg-gray-800/60 border-orange-400/30">
            <CardContent className="p-8 text-center">
              <div className="mb-6">
                <i className="fas fa-sword text-6xl text-gray-500 mb-4"></i>
                <h2 className="text-2xl font-game text-orange-400 mb-2">No Active Battle</h2>
                <p className="text-gray-400">Start a battle from your collection to begin fighting!</p>
              </div>
              
              <Link href="/">
                <Button className="bg-gradient-to-r from-orange-600 to-red-600 hover:from-red-600 hover:to-orange-600">
                  <i className="fas fa-cat mr-2"></i>
                  Go to Collection
                </Button>
              </Link>
            </CardContent>
          </Card>
        )}
      </main>

      {/* Reward Modal */}
      <RewardModal
        isOpen={showRewardModal}
        onClose={handleCloseRewardModal}
        battle={activeBattle || null}
        result={battleResult || 'lost'}
      />
    </div>
  );
}
