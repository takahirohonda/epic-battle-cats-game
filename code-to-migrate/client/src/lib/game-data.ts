export const rarityColors = {
  common: "from-gray-600 to-gray-800",
  rare: "from-blue-600 to-blue-800",
  epic: "from-orange-600 to-orange-800",
  legendary: "from-purple-600 to-purple-800"
};

export const rarityBorders = {
  common: "border-gray-400/50",
  rare: "border-blue-400/50",
  epic: "border-orange-400/50",
  legendary: "border-purple-400/50"
};

export const rarityIcons = {
  common: "fas fa-paw",
  rare: "fas fa-gem",
  epic: "fas fa-star",
  legendary: "fas fa-crown"
};

export const rarityIconColors = {
  common: "text-white",
  rare: "text-cyan-300",
  epic: "text-yellow-300",
  legendary: "text-yellow-300"
};

export const battleActions = [
  {
    id: "attack",
    name: "Attack",
    icon: "fas fa-sword",
    color: "bg-orange-600 hover:bg-orange-500",
    description: "Deal damage"
  },
  {
    id: "defend",
    name: "Defend",
    icon: "fas fa-shield",
    color: "bg-blue-600 hover:bg-blue-500",
    description: "Reduce damage"
  },
  {
    id: "special",
    name: "Special",
    icon: "fas fa-magic",
    color: "bg-green-600 hover:bg-green-500",
    description: "Power move"
  },
  {
    id: "item",
    name: "Item",
    icon: "fas fa-heart",
    color: "bg-purple-600 hover:bg-purple-500",
    description: "Use potion"
  }
];
