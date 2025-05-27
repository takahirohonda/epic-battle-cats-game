import { useState } from "react";
import { motion } from "framer-motion";
import { Link } from "wouter";
import { useUser, useUserCats, useActiveCat, useAllCats, useStartBattle, useActiveBattle } from "@/hooks/use-game";
import CatCard from "@/components/cat-card";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import type { Cat } from "@shared/schema";

const DEMO_USER_ID = 1;

export default function Home() {
  const [showOpponentSelection, setShowOpponentSelection] = useState(false);
  const [selectedOpponent, setSelectedOpponent] = useState<Cat | null>(null);
  
  const { data: user } = useUser(DEMO_USER_ID);
  const { data: userCats, isLoading: catsLoading } = useUserCats(DEMO_USER_ID);
  const { data: activeCat } = useActiveCat(DEMO_USER_ID);
  const { data: allCats } = useAllCats();
  const { data: activeBattle } = useActiveBattle(DEMO_USER_ID);
  const startBattle = useStartBattle();
  const { toast } = useToast();

  const handleQuickBattle = () => {
    if (!activeCat) {
      toast({
        title: "No Active Cat",
        description: "Please select an active cat first!",
        variant: "destructive",
      });
      return;
    }
    
    if (activeBattle) {
      toast({
        title: "Battle in Progress",
        description: "You already have an active battle! Go to the battle arena to continue.",
      });
      return;
    }
    
    setShowOpponentSelection(true);
  };

  const handleStartBattle = async (opponentCat: Cat) => {
    if (!activeCat) return;

    try {
      await startBattle.mutateAsync({
        userId: DEMO_USER_ID,
        playerCatId: activeCat.id,
        opponentCatId: opponentCat.id,
      });
      
      setShowOpponentSelection(false);
      setSelectedOpponent(null);
      
      toast({
        title: "Battle Started!",
        description: `Facing ${opponentCat.name} in battle!`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to start battle",
        variant: "destructive",
      });
    }
  };

  if (catsLoading) {
    return (
      <div className="min-h-screen game-bg flex items-center justify-center">
        <div className="text-white text-xl">Loading your cats...</div>
      </div>
    );
  }

  const availableOpponents = allCats?.filter(cat => 
    !userCats?.some(userCat => userCat.catId === cat.id)
  ) || [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white">
      {/* Header */}
      <header className="bg-gray-800/80 backdrop-blur-sm border-b border-orange-400/30 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <h1 className="text-2xl font-game text-orange-400">⚔️ Battle Cats</h1>
              {user && (
                <span className="bg-orange-600 px-2 py-1 rounded-full text-xs font-semibold">
                  LVL {user.level}
                </span>
              )}
            </div>
            {user && (
              <div className="flex items-center space-x-4">
                {activeBattle && (
                  <Link href="/battle">
                    <Button size="sm" className="bg-red-600 hover:bg-red-500 text-white">
                      <i className="fas fa-sword mr-2"></i>
                      Go to Battle
                    </Button>
                  </Link>
                )}
                <div className="flex items-center space-x-2 bg-orange-400/20 px-3 py-1 rounded-full">
                  <i className="fas fa-coins text-orange-400"></i>
                  <span className="font-semibold">{user.coins.toLocaleString()}</span>
                </div>
                <div className="flex items-center space-x-2 bg-cyan-400/20 px-3 py-1 rounded-full">
                  <i className="fas fa-gem text-cyan-400"></i>
                  <span className="font-semibold">{user.gems}</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-6">
        {user && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <Card className="bg-gray-800/60 border-cyan-400/30">
              <CardContent className="p-4 text-center">
                <i className="fas fa-cat text-2xl text-cyan-400 mb-2"></i>
                <div className="text-2xl font-bold text-cyan-400">{userCats?.length || 0}</div>
                <div className="text-gray-400 text-sm">Total Cats</div>
              </CardContent>
            </Card>
            <Card className="bg-gray-800/60 border-orange-400/30">
              <CardContent className="p-4 text-center">
                <i className="fas fa-trophy text-2xl text-orange-400 mb-2"></i>
                <div className="text-2xl font-bold text-orange-400">{user.battlesWon}</div>
                <div className="text-gray-400 text-sm">Battles Won</div>
              </CardContent>
            </Card>
            <Card className="bg-gray-800/60 border-purple-400/30">
              <CardContent className="p-4 text-center">
                <i className="fas fa-star text-2xl text-purple-400 mb-2"></i>
                <div className="text-2xl font-bold text-purple-400">
                  {userCats?.filter(cat => cat.cat.rarity === 'rare' || cat.cat.rarity === 'epic' || cat.cat.rarity === 'legendary').length || 0}
                </div>
                <div className="text-gray-400 text-sm">Rare Cats</div>
              </CardContent>
            </Card>
            <Card className="bg-gray-800/60 border-red-400/30">
              <CardContent className="p-4 text-center">
                <i className="fas fa-fire text-2xl text-red-400 mb-2"></i>
                <div className="text-2xl font-bold text-red-400">{user.winStreak}</div>
                <div className="text-gray-400 text-sm">Win Streak</div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Cat Collection */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-game text-orange-400">Your Battle Cats</h2>
            <div className="flex space-x-2">
              <Button variant="outline" size="sm" className="border-orange-400/50 text-orange-400 hover:bg-orange-400/10 hover:text-orange-300">
                <i className="fas fa-filter mr-1"></i>Filter
              </Button>
              <Button variant="outline" size="sm" className="border-orange-400/50 text-orange-400 hover:bg-orange-400/10 hover:text-orange-300">
                <i className="fas fa-sort mr-1"></i>Sort
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {userCats?.map((userCat) => (
              <CatCard 
                key={userCat.id} 
                userCat={userCat} 
                isSelectable={true}
              />
            ))}
            
            {/* Add Cat Placeholder */}
            <Card className="bg-gray-800/40 border-2 border-dashed border-gray-600/50 hover:border-orange-400/50 transition-colors cursor-pointer">
              <CardContent className="p-4 flex items-center justify-center h-full min-h-[280px]">
                <div className="text-center">
                  <i className="fas fa-plus text-3xl text-gray-500 mb-2"></i>
                  <div className="text-sm text-gray-500">Get New Cat</div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Opponent Selection Modal */}
        {showOpponentSelection && (
          <div 
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={() => setShowOpponentSelection(false)}
          >
            <motion.div 
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="bg-gray-800 rounded-2xl p-6 w-full max-w-4xl max-h-[80vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-game text-orange-400">Choose Your Opponent</h3>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => setShowOpponentSelection(false)}
                  className="text-gray-400 hover:text-white"
                >
                  <i className="fas fa-times text-lg"></i>
                </Button>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {availableOpponents.map((cat) => (
                  <motion.div
                    key={cat.id}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className={`bg-gradient-to-br from-red-600 to-red-800 rounded-xl p-4 cursor-pointer border-2 border-red-400/50 hover:border-red-300 transition-all`}
                    onClick={() => handleStartBattle(cat)}
                  >
                    <div className="text-center">
                      <img 
                        src={cat.imageUrl} 
                        alt={cat.name}
                        className="w-16 h-16 rounded-full mx-auto object-cover border-3 border-white/30 mb-3"
                      />
                      <h4 className="font-semibold text-sm mb-2 text-white">{cat.name}</h4>
                      <div className="text-xs space-y-1 text-white/90">
                        <div className="flex justify-between">
                          <span>⚔️ ATK:</span>
                          <span className="font-semibold">{cat.baseAttack}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>❤️ HP:</span>
                          <span className="font-semibold">{cat.baseHealth}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>🛡️ DEF:</span>
                          <span className="font-semibold">{cat.baseDefense}</span>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>
        )}
      </main>

      {/* Quick Battle Button */}
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        className="fixed bottom-6 right-6 w-14 h-14 bg-gradient-to-r from-orange-600 to-red-600 rounded-full shadow-lg flex items-center justify-center group z-40"
        onClick={handleQuickBattle}
        disabled={startBattle.isPending}
      >
        <i className="fas fa-bolt text-xl text-white group-hover:animate-bounce"></i>
      </motion.button>
    </div>
  );
}
