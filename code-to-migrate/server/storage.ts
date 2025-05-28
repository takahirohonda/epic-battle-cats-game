import {
  users,
  cats,
  userCats,
  battles,
  items,
  userItems,
  type User,
  type InsertUser,
  type Cat,
  type InsertCat,
  type UserCat,
  type InsertUserCat,
  type UserCatWithDetails,
  type Battle,
  type InsertBattle,
  type BattleWithDetails,
  type Item,
  type InsertItem,
  type UserItem,
  type InsertUserItem,
} from '@shared/schema'
import { db } from './db'
import { eq, and } from 'drizzle-orm'

export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>
  getUserByUsername(username: string): Promise<User | undefined>
  createUser(user: InsertUser): Promise<User>
  updateUser(id: number, updates: Partial<User>): Promise<User | undefined>

  // Cat operations
  getAllCats(): Promise<Cat[]>
  getCat(id: number): Promise<Cat | undefined>
  createCat(cat: InsertCat): Promise<Cat>

  // User cats operations
  getUserCats(userId: number): Promise<UserCatWithDetails[]>
  getUserCat(id: number): Promise<UserCatWithDetails | undefined>
  createUserCat(userCat: InsertUserCat): Promise<UserCat>
  updateUserCat(
    id: number,
    updates: Partial<UserCat>
  ): Promise<UserCat | undefined>
  getUserActiveCat(userId: number): Promise<UserCatWithDetails | undefined>

  // Battle operations
  getBattle(id: number): Promise<BattleWithDetails | undefined>
  createBattle(battle: InsertBattle): Promise<Battle>
  updateBattle(
    id: number,
    updates: Partial<Battle>
  ): Promise<Battle | undefined>
  getUserActiveBattle(userId: number): Promise<BattleWithDetails | undefined>

  // Item operations
  getAllItems(): Promise<Item[]>
  getUserItems(userId: number): Promise<(UserItem & { item: Item })[]>
  createUserItem(userItem: InsertUserItem): Promise<UserItem>
  updateUserItem(
    id: number,
    updates: Partial<UserItem>
  ): Promise<UserItem | undefined>
}

export class DatabaseStorage implements IStorage {
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id))
    return user || undefined
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.username, username))
    return user || undefined
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning()
    return user
  }

  async updateUser(
    id: number,
    updates: Partial<User>
  ): Promise<User | undefined> {
    const [user] = await db
      .update(users)
      .set(updates)
      .where(eq(users.id, id))
      .returning()
    return user || undefined
  }

  async getAllCats(): Promise<Cat[]> {
    return await db.select().from(cats)
  }

  async getCat(id: number): Promise<Cat | undefined> {
    const [cat] = await db.select().from(cats).where(eq(cats.id, id))
    return cat || undefined
  }

  async createCat(insertCat: InsertCat): Promise<Cat> {
    const [cat] = await db.insert(cats).values(insertCat).returning()
    return cat
  }

  async getUserCats(userId: number): Promise<UserCatWithDetails[]> {
    const result = await db
      .select()
      .from(userCats)
      .leftJoin(cats, eq(userCats.catId, cats.id))
      .where(eq(userCats.userId, userId))

    return result.map((row) => {
      const userCat = row.user_cats
      const cat = row.cats!
      const levelMultiplier = 1 + (userCat.level - 1) * 0.1

      return {
        ...userCat,
        cat,
        maxHealth: Math.floor(cat.baseHealth * levelMultiplier),
        attack: Math.floor(cat.baseAttack * levelMultiplier),
        defense: Math.floor(cat.baseDefense * levelMultiplier),
        speed: Math.floor(cat.baseSpeed * levelMultiplier),
      }
    })
  }

  async getUserCat(id: number): Promise<UserCatWithDetails | undefined> {
    const result = await db
      .select()
      .from(userCats)
      .leftJoin(cats, eq(userCats.catId, cats.id))
      .where(eq(userCats.id, id))

    if (result.length === 0) return undefined

    const userCat = result[0].user_cats
    const cat = result[0].cats!
    const levelMultiplier = 1 + (userCat.level - 1) * 0.1

    return {
      ...userCat,
      cat,
      maxHealth: Math.floor(cat.baseHealth * levelMultiplier),
      attack: Math.floor(cat.baseAttack * levelMultiplier),
      defense: Math.floor(cat.baseDefense * levelMultiplier),
      speed: Math.floor(cat.baseSpeed * levelMultiplier),
    }
  }

  async createUserCat(insertUserCat: InsertUserCat): Promise<UserCat> {
    const [userCat] = await db
      .insert(userCats)
      .values(insertUserCat)
      .returning()
    return userCat
  }

  async updateUserCat(
    id: number,
    updates: Partial<UserCat>
  ): Promise<UserCat | undefined> {
    const [userCat] = await db
      .update(userCats)
      .set(updates)
      .where(eq(userCats.id, id))
      .returning()
    return userCat || undefined
  }

  async getUserActiveCat(
    userId: number
  ): Promise<UserCatWithDetails | undefined> {
    const result = await db
      .select()
      .from(userCats)
      .leftJoin(cats, eq(userCats.catId, cats.id))
      .where(and(eq(userCats.userId, userId), eq(userCats.isActive, true)))

    if (result.length === 0) return undefined

    const userCat = result[0].user_cats
    const cat = result[0].cats!
    const levelMultiplier = 1 + (userCat.level - 1) * 0.1

    return {
      ...userCat,
      cat,
      maxHealth: Math.floor(cat.baseHealth * levelMultiplier),
      attack: Math.floor(cat.baseAttack * levelMultiplier),
      defense: Math.floor(cat.baseDefense * levelMultiplier),
      speed: Math.floor(cat.baseSpeed * levelMultiplier),
    }
  }

  async getBattle(id: number): Promise<BattleWithDetails | undefined> {
    const [battle] = await db.select().from(battles).where(eq(battles.id, id))
    if (!battle) return undefined

    const playerCat = await this.getUserCat(battle.playerCatId)
    const opponentCat = await this.getCat(battle.opponentCatId)

    if (!playerCat || !opponentCat) return undefined

    return {
      ...battle,
      playerCat,
      opponentCat,
    }
  }

  async createBattle(insertBattle: InsertBattle): Promise<Battle> {
    const [battle] = await db.insert(battles).values(insertBattle).returning()
    return battle
  }

  async updateBattle(
    id: number,
    updates: Partial<Battle>
  ): Promise<Battle | undefined> {
    const [battle] = await db
      .update(battles)
      .set(updates)
      .where(eq(battles.id, id))
      .returning()
    return battle || undefined
  }

  async getUserActiveBattle(
    userId: number
  ): Promise<BattleWithDetails | undefined> {
    const [battle] = await db
      .select()
      .from(battles)
      .where(and(eq(battles.userId, userId), eq(battles.status, 'active')))

    if (!battle) return undefined
    return this.getBattle(battle.id)
  }

  async getAllItems(): Promise<Item[]> {
    return await db.select().from(items)
  }

  async getUserItems(userId: number): Promise<(UserItem & { item: Item })[]> {
    const result = await db
      .select()
      .from(userItems)
      .leftJoin(items, eq(userItems.itemId, items.id))
      .where(eq(userItems.userId, userId))

    return result.map((row) => ({
      ...row.user_items,
      item: row.items!,
    }))
  }

  async createUserItem(insertUserItem: InsertUserItem): Promise<UserItem> {
    const [userItem] = await db
      .insert(userItems)
      .values(insertUserItem)
      .returning()
    return userItem
  }

  async updateUserItem(
    id: number,
    updates: Partial<UserItem>
  ): Promise<UserItem | undefined> {
    const [userItem] = await db
      .update(userItems)
      .set(updates)
      .where(eq(userItems.id, id))
      .returning()
    return userItem || undefined
  }
}

export class MemStorage implements IStorage {
  private users: Map<number, User>
  private cats: Map<number, Cat>
  private userCats: Map<number, UserCat>
  private battles: Map<number, Battle>
  private items: Map<number, Item>
  private userItems: Map<number, UserItem>
  private currentUserId: number
  private currentCatId: number
  private currentUserCatId: number
  private currentBattleId: number
  private currentItemId: number
  private currentUserItemId: number

  constructor() {
    this.users = new Map()
    this.cats = new Map()
    this.userCats = new Map()
    this.battles = new Map()
    this.items = new Map()
    this.userItems = new Map()
    this.currentUserId = 1
    this.currentCatId = 1
    this.currentUserCatId = 1
    this.currentBattleId = 1
    this.currentItemId = 1
    this.currentUserItemId = 1

    this.initializeData()
  }

  private initializeData() {
    // Initialize base cats
    const baseCats: InsertCat[] = [
      {
        name: 'Thunder King',
        rarity: 'legendary',
        baseAttack: 95,
        baseHealth: 180,
        baseDefense: 75,
        baseSpeed: 80,
        imageUrl:
          'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=400',
        description: 'A majestic cat with lightning powers',
        specialAbility: 'Lightning Strike',
      },
      {
        name: 'Shadow Ninja',
        rarity: 'epic',
        baseAttack: 88,
        baseHealth: 145,
        baseDefense: 65,
        baseSpeed: 95,
        imageUrl:
          'https://images.unsplash.com/photo-1518791841217-8f162f1e1131?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=400',
        description: 'A stealthy cat that strikes from the shadows',
        specialAbility: 'Shadow Strike',
      },
      {
        name: 'Frost Guardian',
        rarity: 'rare',
        baseAttack: 70,
        baseHealth: 130,
        baseDefense: 85,
        baseSpeed: 65,
        imageUrl:
          'https://images.unsplash.com/photo-1574158622682-e40e69881006?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=400',
        description: 'A defensive cat with ice powers',
        specialAbility: 'Frost Shield',
      },
      {
        name: 'Street Fighter',
        rarity: 'common',
        baseAttack: 55,
        baseHealth: 100,
        baseDefense: 45,
        baseSpeed: 70,
        imageUrl:
          'https://images.unsplash.com/photo-1592194996308-7b43878e84a6?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=400',
        description: 'A scrappy street cat with fighting spirit',
        specialAbility: 'Street Combo',
      },
      {
        name: 'Forest Sage',
        rarity: 'epic',
        baseAttack: 78,
        baseHealth: 160,
        baseDefense: 70,
        baseSpeed: 75,
        imageUrl:
          'https://images.unsplash.com/photo-1513360371669-4adf3dd7dff8?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=400',
        description: 'A wise cat with nature magic',
        specialAbility: "Nature's Blessing",
      },
      {
        name: 'Dark Warrior',
        rarity: 'epic',
        baseAttack: 85,
        baseHealth: 200,
        baseDefense: 60,
        baseSpeed: 70,
        imageUrl:
          'https://images.unsplash.com/photo-1571566882372-1598d88abd90?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=400',
        description: 'A fierce dark cat warrior',
        specialAbility: 'Dark Rage',
      },
    ]

    baseCats.forEach((cat) => this.createCat(cat))

    // Initialize items
    const baseItems: InsertItem[] = [
      {
        name: 'Health Potion',
        type: 'potion',
        effect: 'heal',
        value: 50,
        cost: 25,
        description: 'Restores 50 HP to your cat',
      },
      {
        name: 'Attack Boost',
        type: 'boost',
        effect: 'attack',
        value: 10,
        cost: 50,
        description: 'Increases attack by 10 for the battle',
      },
    ]

    baseItems.forEach((item) => this.createItem(item))

    // Create demo user
    this.createUser({
      username: 'player1',
      level: 12,
      coins: 2450,
      gems: 127,
      battlesWon: 156,
      winStreak: 12,
      experience: 2400,
    })
  }

  // User operations
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id)
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username
    )
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentUserId++
    const user: User = { ...insertUser, id }
    this.users.set(id, user)

    // Give starter cats to new user
    if (insertUser.username === 'player1') {
      this.createUserCat({
        userId: id,
        catId: 1, // Thunder King
        level: 12,
        experience: 1200,
        currentHealth: 180,
        isActive: true,
      })
      this.createUserCat({
        userId: id,
        catId: 2, // Shadow Ninja
        level: 10,
        experience: 800,
        currentHealth: 145,
        isActive: false,
      })
      this.createUserCat({
        userId: id,
        catId: 3, // Frost Guardian
        level: 8,
        experience: 600,
        currentHealth: 130,
        isActive: false,
      })
    }

    return user
  }

  async updateUser(
    id: number,
    updates: Partial<User>
  ): Promise<User | undefined> {
    const user = this.users.get(id)
    if (!user) return undefined

    const updatedUser = { ...user, ...updates }
    this.users.set(id, updatedUser)
    return updatedUser
  }

  // Cat operations
  async getAllCats(): Promise<Cat[]> {
    return Array.from(this.cats.values())
  }

  async getCat(id: number): Promise<Cat | undefined> {
    return this.cats.get(id)
  }

  async createCat(insertCat: InsertCat): Promise<Cat> {
    const id = this.currentCatId++
    const cat: Cat = { ...insertCat, id }
    this.cats.set(id, cat)
    return cat
  }

  // User cats operations
  async getUserCats(userId: number): Promise<UserCatWithDetails[]> {
    const userCatsList = Array.from(this.userCats.values()).filter(
      (uc) => uc.userId === userId
    )

    return userCatsList.map((userCat) => {
      const cat = this.cats.get(userCat.catId)!
      const levelMultiplier = 1 + (userCat.level - 1) * 0.1

      return {
        ...userCat,
        cat,
        maxHealth: Math.floor(cat.baseHealth * levelMultiplier),
        attack: Math.floor(cat.baseAttack * levelMultiplier),
        defense: Math.floor(cat.baseDefense * levelMultiplier),
        speed: Math.floor(cat.baseSpeed * levelMultiplier),
      }
    })
  }

  async getUserCat(id: number): Promise<UserCatWithDetails | undefined> {
    const userCat = this.userCats.get(id)
    if (!userCat) return undefined

    const cat = this.cats.get(userCat.catId)!
    const levelMultiplier = 1 + (userCat.level - 1) * 0.1

    return {
      ...userCat,
      cat,
      maxHealth: Math.floor(cat.baseHealth * levelMultiplier),
      attack: Math.floor(cat.baseAttack * levelMultiplier),
      defense: Math.floor(cat.baseDefense * levelMultiplier),
      speed: Math.floor(cat.baseSpeed * levelMultiplier),
    }
  }

  async createUserCat(insertUserCat: InsertUserCat): Promise<UserCat> {
    const id = this.currentUserCatId++
    const userCat: UserCat = { ...insertUserCat, id }
    this.userCats.set(id, userCat)
    return userCat
  }

  async updateUserCat(
    id: number,
    updates: Partial<UserCat>
  ): Promise<UserCat | undefined> {
    const userCat = this.userCats.get(id)
    if (!userCat) return undefined

    const updatedUserCat = { ...userCat, ...updates }
    this.userCats.set(id, updatedUserCat)
    return updatedUserCat
  }

  async getUserActiveCat(
    userId: number
  ): Promise<UserCatWithDetails | undefined> {
    const userCatsList = Array.from(this.userCats.values()).filter(
      (uc) => uc.userId === userId && uc.isActive
    )
    const userCat = userCatsList[0]

    if (!userCat) return undefined

    const cat = this.cats.get(userCat.catId)!
    const levelMultiplier = 1 + (userCat.level - 1) * 0.1

    return {
      ...userCat,
      cat,
      maxHealth: Math.floor(cat.baseHealth * levelMultiplier),
      attack: Math.floor(cat.baseAttack * levelMultiplier),
      defense: Math.floor(cat.baseDefense * levelMultiplier),
      speed: Math.floor(cat.baseSpeed * levelMultiplier),
    }
  }

  // Battle operations
  async getBattle(id: number): Promise<BattleWithDetails | undefined> {
    const battle = this.battles.get(id)
    if (!battle) return undefined

    const playerCat = await this.getUserCat(battle.playerCatId)
    const opponentCat = this.cats.get(battle.opponentCatId)

    if (!playerCat || !opponentCat) return undefined

    return {
      ...battle,
      playerCat,
      opponentCat,
    }
  }

  async createBattle(insertBattle: InsertBattle): Promise<Battle> {
    const id = this.currentBattleId++
    const battle: Battle = { ...insertBattle, id }
    this.battles.set(id, battle)
    return battle
  }

  async updateBattle(
    id: number,
    updates: Partial<Battle>
  ): Promise<Battle | undefined> {
    const battle = this.battles.get(id)
    if (!battle) return undefined

    const updatedBattle = { ...battle, ...updates }
    this.battles.set(id, updatedBattle)
    return updatedBattle
  }

  async getUserActiveBattle(
    userId: number
  ): Promise<BattleWithDetails | undefined> {
    const battle = Array.from(this.battles.values()).find(
      (b) => b.userId === userId && b.status === 'active'
    )
    if (!battle) return undefined

    return this.getBattle(battle.id)
  }

  // Item operations
  async getAllItems(): Promise<Item[]> {
    return Array.from(this.items.values())
  }

  private async createItem(insertItem: InsertItem): Promise<Item> {
    const id = this.currentItemId++
    const item: Item = { ...insertItem, id }
    this.items.set(id, item)
    return item
  }

  async getUserItems(userId: number): Promise<(UserItem & { item: Item })[]> {
    const userItemsList = Array.from(this.userItems.values()).filter(
      (ui) => ui.userId === userId
    )

    return userItemsList.map((userItem) => ({
      ...userItem,
      item: this.items.get(userItem.itemId)!,
    }))
  }

  async createUserItem(insertUserItem: InsertUserItem): Promise<UserItem> {
    const id = this.currentUserItemId++
    const userItem: UserItem = { ...insertUserItem, id }
    this.userItems.set(id, userItem)
    return userItem
  }

  async updateUserItem(
    id: number,
    updates: Partial<UserItem>
  ): Promise<UserItem | undefined> {
    const userItem = this.userItems.get(id)
    if (!userItem) return undefined

    const updatedUserItem = { ...userItem, ...updates }
    this.userItems.set(id, updatedUserItem)
    return updatedUserItem
  }
}

export const storage = new MemStorage()
