import { motion, AnimatePresence } from "framer-motion";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useQueryClient } from "@tanstack/react-query";
import type { BattleWithDetails } from "@shared/schema";

interface RewardModalProps {
  isOpen: boolean;
  onClose: () => void;
  battle: BattleWithDetails | null;
  result: 'won' | 'lost';
}

export default function RewardModal({ isOpen, onClose, battle, result }: RewardModalProps) {
  const queryClient = useQueryClient();
  
  if (!battle) return null;

  const isVictory = result === 'won';

  const handleClose = () => {
    // Clear battle cache when closing reward modal
    queryClient.invalidateQueries({ predicate: (query) => 
      query.queryKey[0]?.toString().includes('/battle') || false 
    });
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-game-surface border-2 border-orange-400/50 text-white max-w-sm">
        <DialogHeader>
          <DialogTitle className="text-center">
            <div className={`w-20 h-20 ${isVictory ? 'bg-gradient-to-r from-orange-400 to-yellow-400' : 'bg-gradient-to-r from-red-500 to-red-700'} rounded-full mx-auto mb-4 flex items-center justify-center`}>
              <i className={`${isVictory ? 'fas fa-trophy' : 'fas fa-times'} text-3xl ${isVictory ? 'text-orange-900' : 'text-white'}`}></i>
            </div>
            <h3 className="text-xl font-game text-orange-400 mb-2">
              {isVictory ? 'Victory!' : 'Defeat!'}
            </h3>
          </DialogTitle>
        </DialogHeader>

        <div className="text-center">
          <p className="text-gray-300 mb-6">
            {isVictory 
              ? `You defeated ${battle.opponentCat.name} and earned rewards!`
              : `${battle.opponentCat.name} defeated you. Better luck next time!`
            }
          </p>
          
          {isVictory && battle.coinsReward && battle.experienceReward && (
            <div className="space-y-3 mb-6">
              <motion.div 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
                className="flex items-center justify-between bg-black/20 rounded-lg p-3"
              >
                <div className="flex items-center">
                  <i className="fas fa-coins text-orange-400 mr-2"></i>
                  <span>Coins</span>
                </div>
                <span className="font-semibold text-orange-400">+{battle.coinsReward}</span>
              </motion.div>
              
              <motion.div 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 }}
                className="flex items-center justify-between bg-black/20 rounded-lg p-3"
              >
                <div className="flex items-center">
                  <i className="fas fa-star text-yellow-400 mr-2"></i>
                  <span>XP</span>
                </div>
                <span className="font-semibold text-yellow-400">+{battle.experienceReward}</span>
              </motion.div>
              
              <motion.div 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.6 }}
                className="flex items-center justify-between bg-black/20 rounded-lg p-3"
              >
                <div className="flex items-center">
                  <i className="fas fa-gift text-cyan-400 mr-2"></i>
                  <span>Item</span>
                </div>
                <span className="font-semibold text-cyan-400">Health Potion</span>
              </motion.div>
            </div>
          )}
          
          <Button 
            className="w-full bg-gradient-to-r from-orange-600 to-red-600 hover:from-red-600 hover:to-orange-600 text-white font-semibold py-3 transition-all"
            onClick={handleClose}
          >
            {isVictory ? 'Collect Rewards' : 'Continue'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
