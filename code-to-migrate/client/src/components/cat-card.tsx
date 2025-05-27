import { motion } from "framer-motion";
import { rarityColors, rarityBorders, rarityIcons, rarityIconColors } from "@/lib/game-data";
import type { UserCatWithDetails } from "@shared/schema";
import { useActivateCat } from "@/hooks/use-game";
import { useToast } from "@/hooks/use-toast";

interface CatCardProps {
  userCat: UserCatWithDetails;
  onClick?: () => void;
  isSelectable?: boolean;
}

export default function CatCard({ userCat, onClick, isSelectable = false }: CatCardProps) {
  const { cat, level, currentHealth, maxHealth, attack, defense, isActive } = userCat;
  const activateCat = useActivateCat();
  const { toast } = useToast();

  const handleActivate = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isSelectable) return;

    try {
      await activateCat.mutateAsync(userCat.id);
      toast({
        title: "Cat Activated",
        description: `${cat.name} is now your active battle cat!`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to activate cat",
        variant: "destructive",
      });
    }
  };

  const healthPercentage = (currentHealth / maxHealth) * 100;

  return (
    <motion.div
      whileHover={{ scale: 1.05, rotate: 1 }}
      whileTap={{ scale: 0.95 }}
      className={`bg-gradient-to-br ${rarityColors[cat.rarity as keyof typeof rarityColors]} 
                  rounded-xl p-4 cursor-pointer group shadow-lg border-2 
                  ${rarityBorders[cat.rarity as keyof typeof rarityBorders]}
                  ${isActive ? 'ring-2 ring-yellow-400 ring-offset-2 ring-offset-transparent' : ''}
                  transition-all duration-300`}
      onClick={onClick || handleActivate}
    >
      <div className="text-center">
        <div className="relative mb-3">
          <img 
            src={cat.imageUrl} 
            alt={cat.name}
            className="w-16 h-16 rounded-full mx-auto object-cover border-3 border-white/30"
          />
          <div className={`absolute -top-1 -right-1 w-6 h-6 
                          ${cat.rarity === 'legendary' ? 'bg-purple-400' : 
                            cat.rarity === 'epic' ? 'bg-orange-400' :
                            cat.rarity === 'rare' ? 'bg-blue-400' : 'bg-gray-400'}
                          rounded-full flex items-center justify-center`}>
            <i className={`${rarityIcons[cat.rarity as keyof typeof rarityIcons]} text-xs 
                          ${rarityIconColors[cat.rarity as keyof typeof rarityIconColors]}`}></i>
          </div>
          {isActive && (
            <div className="absolute -top-2 -left-2 w-6 h-6 bg-yellow-400 rounded-full flex items-center justify-center">
              <i className="fas fa-star text-xs text-yellow-900"></i>
            </div>
          )}
        </div>

        <h3 className="font-semibold text-sm mb-1 text-white">{cat.name}</h3>
        <div className="flex justify-center mb-2">
          <span className="text-xs bg-black/20 px-2 py-1 rounded-full capitalize text-white">
            {cat.rarity} • Lv.{level}
          </span>
        </div>

        {/* Health Bar */}
        <div className="mb-2">
          <div className="bg-gray-700/50 rounded-full h-2 mb-1">
            <div 
              className="bg-green-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${healthPercentage}%` }}
            ></div>
          </div>
          <div className="text-xs text-white/80">
            {currentHealth} / {maxHealth} HP
          </div>
        </div>

        <div className="text-xs space-y-1 text-white/90">
          <div className="flex justify-between">
            <span>⚔️ ATK:</span>
            <span className="font-semibold">{attack}</span>
          </div>
          <div className="flex justify-between">
            <span>🛡️ DEF:</span>
            <span className="font-semibold">{defense}</span>
          </div>
          <div className="flex justify-between">
            <span>⚡ SPD:</span>
            <span className="font-semibold">{userCat.speed}</span>
          </div>
        </div>

        {isSelectable && (
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="mt-3 w-full bg-white/20 hover:bg-white/30 text-white rounded-lg py-2 text-xs font-semibold transition-colors"
            onClick={handleActivate}
            disabled={activateCat.isPending || isActive}
          >
            {isActive ? 'Active' : activateCat.isPending ? 'Activating...' : 'Select'}
          </motion.button>
        )}
      </div>
    </motion.div>
  );
}
