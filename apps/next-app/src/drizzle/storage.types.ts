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

export interface IStorage {
  // User operations
  getUser(id: string): Promise<User | undefined>
  getUserByUsername(username: string): Promise<User | undefined>
  createUser(user: InsertUser): Promise<User>
  updateUser(id: string, updates: Partial<User>): Promise<User | undefined>
  deleteUser(id: string): Promise<User | undefined>

  // Cat operations
  getAllCats(): Promise<Cat[]>
  getCat(id: string): Promise<Cat | undefined>
  createCat(cat: InsertCat): Promise<Cat>
  deleteCat(id: string): Promise<Cat | undefined>

  // User cat operations
  getUserCats(userId: string): Promise<UserCatWithDetails[]>
  getUserCat(id: string): Promise<UserCatWithDetails | undefined>
  createUserCat(userCat: InsertUserCat): Promise<UserCat>
  updateUserCat(
    id: string,
    updates: Partial<UserCat>
  ): Promise<UserCat | undefined>
  getUserActiveCat(userId: string): Promise<UserCatWithDetails | undefined>

  // Battle operations
  getBattle(id: string): Promise<BattleWithDetails | undefined>
  createBattle(battle: InsertBattle): Promise<Battle>
  updateBattle(
    id: string,
    updates: Partial<Battle>
  ): Promise<Battle | undefined>
  getUserActiveBattle(userId: string): Promise<BattleLog[] | undefined>
  deleteBattle(id: string): Promise<BattleWithDetails | undefined>

  // Battle log operations
  getBattleLogByBattle(battleId: string): Promise<BattleLog[] | undefined>
  createBattleLog(battleId: string, log: string): Promise<BattleLog>

  // Item operations
  getAllItems(): Promise<Item[]>
  deleteItems(id: string): Promise<Item | undefined>
  getUserItems(userId: string): Promise<(UserItem & { item: Item })[]>
  createUserItem(userItem: InsertUserItem): Promise<UserItem>
  updateUserItem(
    id: string,
    updates: Partial<UserItem>
  ): Promise<UserItem | undefined>
}
