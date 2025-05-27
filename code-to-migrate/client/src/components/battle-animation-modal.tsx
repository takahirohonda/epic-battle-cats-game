import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import type { BattleWithDetails } from "@shared/schema";

interface BattleAnimationModalProps {
  isOpen: boolean;
  onClose: () => void;
  battle: BattleWithDetails | null;
  action: string;
}

export default function BattleAnimationModal({ 
  isOpen, 
  onClose, 
  battle, 
  action 
}: BattleAnimationModalProps) {
  const [animationPhase, setAnimationPhase] = useState<'attack' | 'damage' | 'result'>('attack');
  const [showResult, setShowResult] = useState(false);

  useEffect(() => {
    if (!isOpen || !battle) return;

    const sequence = async () => {
      // Attack phase
      setAnimationPhase('attack');
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Damage phase
      setAnimationPhase('damage');
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Result phase
      setAnimationPhase('result');
      setShowResult(true);
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      onClose();
    };

    sequence();
  }, [isOpen, battle, onClose]);

  if (!battle) return null;

  const getActionAnimation = () => {
    switch (action) {
      case 'attack':
        return {
          icon: 'fas fa-sword',
          color: 'text-orange-400',
          name: 'Attack',
          effect: 'Slashing Strike!'
        };
      case 'special':
        return {
          icon: 'fas fa-magic',
          color: 'text-purple-400',
          name: 'Special Move',
          effect: battle.playerCat.cat.specialAbility || 'Power Attack!'
        };
      case 'defend':
        return {
          icon: 'fas fa-shield',
          color: 'text-blue-400',
          name: 'Defend',
          effect: 'Defensive Stance!'
        };
      default:
        return {
          icon: 'fas fa-heart',
          color: 'text-green-400',
          name: 'Item Used',
          effect: 'Recovery!'
        };
    }
  };

  const actionData = getActionAnimation();

  return (
    <Dialog open={isOpen} onOpenChange={() => {}}>
      <DialogContent className="bg-gray-900/95 border-2 border-orange-400/50 text-white max-w-md backdrop-blur-lg">
        <DialogTitle className="sr-only">Battle Animation</DialogTitle>
        <DialogDescription className="sr-only">Watching battle unfold between cats</DialogDescription>
        <div className="text-center py-8">
          <AnimatePresence mode="wait">
            {animationPhase === 'attack' && (
              <motion.div
                key="attack"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 1.2 }}
                className="space-y-6"
              >
                <motion.div 
                  className="relative"
                  animate={{ 
                    rotate: [0, -10, 10, -5, 5, 0],
                    scale: [1, 1.1, 1, 1.05, 1]
                  }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                >
                  <img 
                    src={battle.playerCat.cat.imageUrl} 
                    alt={battle.playerCat.cat.name}
                    className="w-24 h-24 rounded-full mx-auto object-cover border-4 border-blue-400"
                  />
                  <motion.div
                    className="absolute -top-2 -right-2"
                    animate={{ 
                      scale: [1, 1.3, 1],
                      rotate: [0, 180, 360]
                    }}
                    transition={{ duration: 0.8, repeat: Infinity }}
                  >
                    <i className={`${actionData.icon} text-2xl ${actionData.color}`}></i>
                  </motion.div>
                </motion.div>

                <motion.h3 
                  className="text-xl font-game text-orange-400"
                  animate={{ opacity: [0.7, 1, 0.7] }}
                  transition={{ duration: 1, repeat: Infinity }}
                >
                  {battle.playerCat.cat.name} uses {actionData.name}!
                </motion.h3>

                <motion.div
                  className="flex justify-center space-x-2"
                  animate={{ y: [0, -5, 0] }}
                  transition={{ duration: 0.6, repeat: Infinity }}
                >
                  {[...Array(3)].map((_, i) => (
                    <motion.div
                      key={i}
                      className="w-2 h-2 bg-orange-400 rounded-full"
                      animate={{ 
                        scale: [1, 1.5, 1],
                        opacity: [0.5, 1, 0.5]
                      }}
                      transition={{ 
                        duration: 0.8, 
                        repeat: Infinity,
                        delay: i * 0.2
                      }}
                    />
                  ))}
                </motion.div>
              </motion.div>
            )}

            {animationPhase === 'damage' && (
              <motion.div
                key="damage"
                initial={{ opacity: 0, x: -50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 50 }}
                className="space-y-6"
              >
                <div className="flex justify-center space-x-8">
                  <motion.img 
                    src={battle.playerCat.cat.imageUrl} 
                    alt={battle.playerCat.cat.name}
                    className="w-20 h-20 rounded-full object-cover border-3 border-blue-400"
                    animate={{ x: [0, 20, 0] }}
                    transition={{ duration: 0.6 }}
                  />
                  
                  <motion.div
                    className="flex items-center"
                    initial={{ scale: 0 }}
                    animate={{ scale: [0, 1.5, 1] }}
                    transition={{ duration: 0.8 }}
                  >
                    <div className="text-4xl">⚡</div>
                  </motion.div>
                  
                  <motion.img 
                    src={battle.opponentCat.imageUrl} 
                    alt={battle.opponentCat.name}
                    className="w-20 h-20 rounded-full object-cover border-3 border-red-400"
                    animate={{ 
                      x: [-20, 0],
                      rotate: [0, -5, 5, 0]
                    }}
                    transition={{ duration: 0.6 }}
                  />
                </div>

                <motion.h3 
                  className="text-lg text-yellow-400"
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.3 }}
                >
                  {actionData.effect}
                </motion.h3>

                <motion.div
                  className="text-center"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.6, type: "spring" }}
                >
                  <div className="text-2xl font-bold text-orange-400">
                    IMPACT!
                  </div>
                </motion.div>
              </motion.div>
            )}

            {animationPhase === 'result' && showResult && (
              <motion.div
                key="result"
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                className="space-y-4"
              >
                <motion.div
                  animate={{ 
                    scale: [1, 1.1, 1],
                    rotate: [0, 2, -2, 0]
                  }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  <div className="text-6xl mb-4">
                    {battle.status === 'won' ? '🏆' : battle.status === 'lost' ? '💀' : '⚔️'}
                  </div>
                </motion.div>

                <motion.h2 
                  className="text-2xl font-game text-orange-400"
                  initial={{ y: 20 }}
                  animate={{ y: 0 }}
                >
                  {battle.status === 'won' ? 'Victory!' : 
                   battle.status === 'lost' ? 'Defeat!' : 
                   'Battle Continues...'}
                </motion.h2>

                <motion.p 
                  className="text-gray-300"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5 }}
                >
                  {battle.status === 'won' ? 'You emerged victorious!' :
                   battle.status === 'lost' ? 'Better luck next time!' :
                   'The battle rages on!'}
                </motion.p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </DialogContent>
    </Dialog>
  );
}