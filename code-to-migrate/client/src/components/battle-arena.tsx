import { useState } from "react";
import { motion } from "framer-motion";
import { battleActions } from "@/lib/game-data";
import { useBattleAction } from "@/hooks/use-game";
import { useToast } from "@/hooks/use-toast";
import type { BattleWithDetails } from "@shared/schema";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import BattleAnimationModal from "./battle-animation-modal";

interface BattleArenaProps {
  battle: BattleWithDetails;
  onBattleEnd?: (result: 'won' | 'lost') => void;
}

export default function BattleArena({ battle, onBattleEnd }: BattleArenaProps) {
  const [showBattleAnimation, setShowBattleAnimation] = useState(false);
  const [currentAction, setCurrentAction] = useState<string>('');
  const battleAction = useBattleAction();
  const { toast } = useToast();

  const handleAction = async (action: string) => {
    if (battleAction.isPending || battle.status !== 'active') return;

    setCurrentAction(action);
    setShowBattleAnimation(true);

    try {
      const result = await battleAction.mutateAsync({
        battleId: battle.id,
        action,
      });

      if (result.status === 'won') {
        onBattleEnd?.('won');
        toast({
          title: "Victory!",
          description: `You defeated ${battle.opponentCat.name}!`,
        });
      } else if (result.status === 'lost') {
        onBattleEnd?.('lost');
        toast({
          title: "Defeat",
          description: `${battle.opponentCat.name} defeated you!`,
          variant: "destructive",
        });
      }
    } catch (error) {
      setShowBattleAnimation(false);
      toast({
        title: "Error",
        description: "Failed to perform battle action",
        variant: "destructive",
      });
    }
  };

  const playerHealthPercent = (battle.playerHealth / battle.playerCat.maxHealth) * 100;
  const opponentHealthPercent = (battle.opponentHealth / battle.opponentCat.baseHealth) * 100;

  return (
    <div className="space-y-6">
      {/* Battle Status */}
      <Card className="bg-game-surface/60 border-orange-400/30">
        <CardContent className="p-6">
          <div className="text-center mb-6">
            <h2 className="text-2xl font-game text-orange-400 mb-2">Battle Arena</h2>
            <div className="text-gray-300">
              Turn <span className="text-white font-semibold">{battle.turn}</span> • 
              Round <span className="text-white font-semibold">{battle.round}</span>
            </div>
          </div>

          {/* Battle Field */}
          <div className="grid md:grid-cols-2 gap-8 mb-6">
            {/* Opponent Cat */}
            <div className="text-center">
              <div className="bg-red-600/20 rounded-xl p-4 mb-4 border border-red-500/30">
                <h3 className="text-lg font-semibold mb-2 text-red-400">Opponent</h3>
                <div className="relative inline-block mb-3">
                  <motion.img 
                    src={battle.opponentCat.imageUrl} 
                    alt={battle.opponentCat.name}
                    className="w-24 h-24 rounded-full mx-auto object-cover border-4 border-red-400"
                    animate={battleAction.isPending ? { x: [-5, 5, -5, 5, 0] } : {}}
                    transition={{ duration: 0.5 }}
                  />
                  <div className="absolute -top-2 -right-2 bg-red-500 rounded-full px-2 py-1 text-xs font-bold">
                    LV {Math.floor(battle.opponentCat.baseAttack / 10)}
                  </div>
                </div>
                <h4 className="font-semibold mb-2 text-white">{battle.opponentCat.name}</h4>
                
                {/* Health Bar */}
                <div className="bg-gray-700 rounded-full h-3 mb-2">
                  <motion.div 
                    className="bg-red-500 h-3 rounded-full transition-all duration-500"
                    style={{ width: `${opponentHealthPercent}%` }}
                    initial={{ width: "100%" }}
                    animate={{ width: `${opponentHealthPercent}%` }}
                  />
                </div>
                <div className="text-sm text-gray-300">
                  {battle.opponentHealth} / {battle.opponentCat.baseHealth} HP
                </div>
              </div>
            </div>

            {/* Player Cat */}
            <div className="text-center">
              <div className="bg-blue-600/20 rounded-xl p-4 mb-4 border border-blue-500/30">
                <h3 className="text-lg font-semibold mb-2 text-blue-400">Your Cat</h3>
                <div className="relative inline-block mb-3">
                  <motion.img 
                    src={battle.playerCat.cat.imageUrl} 
                    alt={battle.playerCat.cat.name}
                    className="w-24 h-24 rounded-full mx-auto object-cover border-4 border-blue-400"
                    animate={battleAction.isPending ? { x: [0, 10, 0] } : {}}
                    transition={{ duration: 0.6 }}
                  />
                  <div className="absolute -top-2 -right-2 bg-blue-500 rounded-full px-2 py-1 text-xs font-bold">
                    LV {battle.playerCat.level}
                  </div>
                </div>
                <h4 className="font-semibold mb-2 text-white">{battle.playerCat.cat.name}</h4>
                
                {/* Health Bar */}
                <div className="bg-gray-700 rounded-full h-3 mb-2">
                  <motion.div 
                    className="bg-green-500 h-3 rounded-full transition-all duration-500"
                    style={{ width: `${playerHealthPercent}%` }}
                    initial={{ width: "100%" }}
                    animate={{ width: `${playerHealthPercent}%` }}
                  />
                </div>
                <div className="text-sm text-gray-300">
                  {battle.playerHealth} / {battle.playerCat.maxHealth} HP
                </div>
              </div>
            </div>
          </div>

          {/* Battle Actions */}
          {battle.status === 'active' && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {battleActions.map((action) => (
                <motion.div key={action.id} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button
                    className={`${action.color} w-full h-auto p-4 flex flex-col items-center transition-all group`}
                    onClick={() => handleAction(action.id)}
                    disabled={battleAction.isPending}
                  >
                    <i className={`${action.icon} text-2xl mb-2 ${
                      action.id === 'attack' ? 'group-hover:animate-wiggle' :
                      action.id === 'defend' ? 'group-hover:animate-pulse' :
                      action.id === 'special' ? 'group-hover:animate-bounce' :
                      'group-hover:animate-pulse'
                    }`}></i>
                    <div className="font-semibold">{action.name}</div>
                    <div className="text-xs opacity-80">{action.description}</div>
                  </Button>
                </motion.div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Battle Log */}
      <Card className="bg-game-surface/40 border-gray-600/30">
        <CardContent className="p-4">
          <h3 className="font-semibold mb-3 text-orange-400">Battle Log</h3>
          <div className="space-y-2 text-sm max-h-32 overflow-y-auto">
            {Array.isArray(battle.battleLog) && (battle.battleLog as string[]).slice(-4).map((entry, index) => (
              <motion.div 
                key={index}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-gray-300"
              >
                {entry}
              </motion.div>
            ))}
            {(!battle.battleLog || (Array.isArray(battle.battleLog) && battle.battleLog.length === 0)) && (
              <div className="text-gray-500 italic">Battle is starting...</div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Battle Animation Modal */}
      <BattleAnimationModal
        isOpen={showBattleAnimation}
        onClose={() => setShowBattleAnimation(false)}
        battle={battle}
        action={currentAction}
      />
    </div>
  );
}
