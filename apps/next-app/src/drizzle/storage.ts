import { db } from './db'
import {
  users,
  cats,
  userCats,
  battles,
  battleLogs,
  items,
  userItems,
} from './schema'
import {
  InsertUser,
  User,
  InsertCat,
  Cat,
  InsertUserCat,
  UserCat,
  InsertBattle,
  Battle,
  BattleLog,
  Item,
  InsertUserItem,
  UserItem,
  UserCatWithDetails,
  BattleWithDetails,
} from './schema'
import { eq, and } from 'drizzle-orm'
import { IStorage } from './storage.types'

export class Storage implements IStorage {
  // User operations
  async getUser(id: string): Promise<User | undefined> {
    return db.select().from(users).where(eq(users.id, id)).get()
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return db.select().from(users).where(eq(users.username, username)).get()
  }

  async createUser(user: InsertUser): Promise<User> {
    return db.insert(users).values(user).returning().get()
  }

  async updateUser(
    id: string,
    updates: Partial<User>
  ): Promise<User | undefined> {
    return db
      .update(users)
      .set(updates)
      .where(eq(users.id, id))
      .returning()
      .get()
  }

  async deleteUser(id: string): Promise<User | undefined> {
    return db.delete(users).where(eq(users.id, id)).returning().get()
  }

  // Cat operations
  async getAllCats(): Promise<Cat[]> {
    return db.select().from(cats).all()
  }

  async getCat(id: string): Promise<Cat | undefined> {
    return db.select().from(cats).where(eq(cats.id, id)).get()
  }

  async createCat(cat: InsertCat): Promise<Cat> {
    return db.insert(cats).values(cat).returning().get()
  }

  async deleteCat(id: string): Promise<Cat | undefined> {
    return db.delete(cats).where(eq(cats.id, id)).returning().get()
  }

  // User cats operations
  async getUserCats(userId: string): Promise<UserCatWithDetails[]> {
    const rows = await db
      .select({
        userCat: userCats,
        cat: cats,
      })
      .from(userCats)
      .innerJoin(cats, eq(userCats.catId, cats.id))
      .where(eq(userCats.userId, userId))
      .all()

    return rows.map(({ userCat, cat }) => ({
      ...userCat,
      cat,
      maxHealth: cat.baseHealth,
      attack: cat.baseAttack,
      defense: cat.baseDefense,
      speed: cat.baseSpeed,
    }))
  }

  async getUserCat(id: string): Promise<UserCatWithDetails | undefined> {
    const row = await db
      .select({
        userCat: userCats,
        cat: cats,
      })
      .from(userCats)
      .innerJoin(cats, eq(userCats.catId, cats.id))
      .where(eq(userCats.id, id))
      .get()

    if (!row) return undefined

    const { userCat, cat } = row
    return {
      ...userCat,
      cat,
      maxHealth: cat.baseHealth,
      attack: cat.baseAttack,
      defense: cat.baseDefense,
      speed: cat.baseSpeed,
    }
  }

  async createUserCat(userCat: InsertUserCat): Promise<UserCat> {
    return db.insert(userCats).values(userCat).returning().get()
  }

  async updateUserCat(
    id: string,
    updates: Partial<UserCat>
  ): Promise<UserCat | undefined> {
    return db
      .update(userCats)
      .set(updates)
      .where(eq(userCats.id, id))
      .returning()
      .get()
  }

  async getUserActiveCat(
    userId: string
  ): Promise<UserCatWithDetails | undefined> {
    const row = await db
      .select({
        userCat: userCats,
        cat: cats,
      })
      .from(userCats)
      .innerJoin(cats, eq(userCats.catId, cats.id))
      .where(and(eq(userCats.userId, userId), eq(userCats.isActive, true)))
      .get()

    if (!row) return undefined

    const { userCat, cat } = row
    return {
      ...userCat,
      cat,
      maxHealth: cat.baseHealth,
      attack: cat.baseAttack,
      defense: cat.baseDefense,
      speed: cat.baseSpeed,
    }
  }

  // Battle operations
  async getBattle(id: string): Promise<BattleWithDetails | undefined> {
    const battle = await db
      .select()
      .from(battles)
      .where(eq(battles.id, id))
      .get()
    if (!battle) return undefined

    const playerCatRow = await db
      .select({
        userCat: userCats,
        cat: cats,
      })
      .from(userCats)
      .innerJoin(cats, eq(userCats.catId, cats.id))
      .where(eq(userCats.id, battle.playerCatId))
      .get()

    if (!playerCatRow) return undefined

    const { userCat: playerCat, cat } = playerCatRow

    return {
      ...battle,
      playerCat: {
        ...playerCat,
        cat,
        maxHealth: cat.baseHealth,
        attack: cat.baseAttack,
        defense: cat.baseDefense,
        speed: cat.baseSpeed,
      },
      opponentCat: cat,
    }
  }

  async createBattle(battle: InsertBattle): Promise<Battle> {
    return db.insert(battles).values(battle).returning().get()
  }

  async updateBattle(
    id: string,
    updates: Partial<Battle>
  ): Promise<Battle | undefined> {
    return db
      .update(battles)
      .set(updates)
      .where(eq(battles.id, id))
      .returning()
      .get()
  }

  async getUserActiveBattle(userId: string): Promise<BattleLog[] | undefined> {
    const battle = await db
      .select()
      .from(battles)
      .where(and(eq(battles.userId, userId), eq(battles.status, 'active')))
      .get()

    if (!battle) return undefined

    return db
      .select()
      .from(battleLogs)
      .where(eq(battleLogs.battleId, battle.id))
      .all()
  }

  async deleteBattle(id: string): Promise<BattleWithDetails | undefined> {
    const battle = await this.getBattle(id)
    if (!battle) return undefined

    await db.delete(battles).where(eq(battles.id, id))
    return battle
  }

  // Battle log operations
  async getBattleLogByBattle(
    battleId: string
  ): Promise<BattleLog[] | undefined> {
    return db
      .select()
      .from(battleLogs)
      .where(eq(battleLogs.battleId, battleId))
      .all()
  }

  async createBattleLog(battleId: string, log: string): Promise<BattleLog> {
    return db.insert(battleLogs).values({ battleId, log }).returning().get()
  }

  // Item operations
  async getAllItems(): Promise<Item[]> {
    return db.select().from(items).all()
  }

  async deleteItems(id: string): Promise<Item | undefined> {
    return db.delete(items).where(eq(items.id, id)).returning().get()
  }

  async getUserItems(userId: string): Promise<(UserItem & { item: Item })[]> {
    const rows = await db
      .select({
        userItem: userItems,
        item: items,
      })
      .from(userItems)
      .innerJoin(items, eq(userItems.itemId, items.id))
      .where(eq(userItems.userId, userId))
      .all()

    return rows.map(({ userItem, item }) => ({
      ...userItem,
      item,
    }))
  }

  async createUserItem(userItem: InsertUserItem): Promise<UserItem> {
    return db.insert(userItems).values(userItem).returning().get()
  }

  async updateUserItem(
    id: string,
    updates: Partial<UserItem>
  ): Promise<UserItem | undefined> {
    return db
      .update(userItems)
      .set(updates)
      .where(eq(userItems.id, id))
      .returning()
      .get()
  }
}
