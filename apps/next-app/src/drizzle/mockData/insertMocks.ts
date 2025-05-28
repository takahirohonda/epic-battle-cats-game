import { db } from '../db'
import { randomUUID } from 'crypto'
import {
  users,
  cats,
  userCats,
  userProfile,
  battles,
  battleLogs,
  items,
  userItems,
} from '../schema'

// Helper to generate a UUID string (optional if you rely on default)
const genId = () => randomUUID()

export async function insertMockUsers() {
  const mockUsers = [
    {
      id: genId(),
      username: 'catlover123',
      level: 5,
      coins: 1500,
      gems: 100,
      battlesWon: 10,
      winStreak: 3,
      experience: 2500,
      email: 'catlover123@example.com',
    },
    {
      id: genId(),
      username: 'meowster',
      level: 8,
      coins: 2300,
      gems: 200,
      battlesWon: 25,
      winStreak: 5,
      experience: 5000,
      email: 'meowster@example.com',
    },
  ]

  for (const user of mockUsers) {
    await db.insert(users).values(user)
  }
}

export async function insertMockCats() {
  const mockCats = [
    {
      id: genId(),
      name: 'Fluffy',
      rarity: 'common',
      baseAttack: 10,
      baseHealth: 50,
      baseDefense: 5,
      baseSpeed: 8,
      imageUrl: 'https://example.com/cats/fluffy.png',
      description: 'A cute and fluffy cat.',
      specialAbility: 'Quick pounce',
    },
    {
      id: genId(),
      name: 'Shadow',
      rarity: 'epic',
      baseAttack: 25,
      baseHealth: 70,
      baseDefense: 10,
      baseSpeed: 15,
      imageUrl: 'https://example.com/cats/shadow.png',
      description: 'A stealthy and powerful cat.',
      specialAbility: 'Invisibility',
    },
  ]

  for (const cat of mockCats) {
    await db.insert(cats).values(cat)
  }
}

export async function insertMockUserCats() {
  // Need to fetch existing user and cat IDs for foreign keys
  const user = await db.select().from(users).limit(1).get()
  const cat = await db.select().from(cats).limit(1).get()

  if (!user || !cat) throw new Error('No users or cats found')

  const mockUserCats = [
    {
      id: genId(),
      userId: user.id,
      catId: cat.id,
      level: 3,
      experience: 500,
      currentHealth: 45,
      isActive: true,
    },
  ]

  for (const uc of mockUserCats) {
    await db.insert(userCats).values(uc)
  }
}

export async function insertMockUserProfiles() {
  const user = await db.select().from(users).limit(1).get()
  if (!user) throw new Error('No users found')

  const profile = {
    id: genId(),
    userId: user.id,
    bio: 'I love cats and battles!',
    avatarUrl: 'https://example.com/avatars/user1.png',
  }

  await db.insert(userProfile).values(profile)
}

export async function insertMockBattles() {
  const user = await db.select().from(users).limit(1).get()
  const userCat = await db.select().from(userCats).limit(1).get()
  const opponentCat = await db.select().from(cats).limit(1).offset(1).get()

  if (!user || !userCat || !opponentCat) throw new Error('Missing user or cats')

  const battle = {
    id: genId(),
    userId: user.id,
    playerCatId: userCat.catId,
    opponentCatId: opponentCat.id,
    status: 'active',
    turn: 1,
    round: 1,
    playerHealth: 40,
    opponentHealth: 60,
    coinsReward: null,
    experienceReward: null,
  }

  await db.insert(battles).values(battle)
}

export async function insertMockBattleLogs() {
  const battle = await db.select().from(battles).limit(1).get()
  if (!battle) throw new Error('No battles found')

  const logs = [
    {
      battleId: battle.id,
      log: 'Player cat attacks for 10 damage.',
    },
    {
      battleId: battle.id,
      log: 'Opponent cat counterattacks for 12 damage.',
    },
  ]

  for (const log of logs) {
    await db.insert(battleLogs).values(log)
  }
}

export async function insertMockItems() {
  const itemsData = [
    {
      id: genId(),
      name: 'Health Potion',
      type: 'potion',
      effect: 'Restores 20 health',
      value: 20,
      cost: 50,
      description: 'A potion that restores health during battle.',
    },
    {
      id: genId(),
      name: 'Attack Boost',
      type: 'boost',
      effect: 'Increases attack by 5 for 3 rounds',
      value: 5,
      cost: 100,
      description: 'Boosts your cat’s attack temporarily.',
    },
  ]

  for (const item of itemsData) {
    await db.insert(items).values(item)
  }
}

export async function insertMockUserItems() {
  const user = await db.select().from(users).limit(1).get()
  const item = await db.select().from(items).limit(1).get()
  if (!user || !item) throw new Error('No user or item found')

  const userItem = {
    id: genId(),
    userId: user.id,
    itemId: item.id,
    quantity: 3,
  }

  await db.insert(userItems).values(userItem)
}

async function insertAllMocks() {
  await insertMockUsers()
  await insertMockCats()
  await insertMockUserCats()
  await insertMockUserProfiles()
  await insertMockBattles()
  await insertMockBattleLogs()
  await insertMockItems()
  await insertMockUserItems()
}
insertAllMocks().catch(console.error)
