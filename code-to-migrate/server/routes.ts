import type { Express } from 'express';
import { createServer, type Server } from 'http';
import { storage } from './storage';
import { insertBattleSchema } from '@shared/schema';
import { z } from 'zod';

export async function registerRoutes(app: Express): Promise<Server> {
  // User routes
  app.get('/api/user/:id', async (req, res) => {
    try {
      const userId = parseInt(req.params.id);
      const user = await storage.getUser(userId);

      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      res.json(user);
    } catch (error) {
      res.status(500).json({ message: 'Failed to get user' });
    }
  });

  app.put('/api/user/:id', async (req, res) => {
    try {
      const userId = parseInt(req.params.id);
      const updates = req.body;

      const updatedUser = await storage.updateUser(userId, updates);

      if (!updatedUser) {
        return res.status(404).json({ message: 'User not found' });
      }

      res.json(updatedUser);
    } catch (error) {
      res.status(500).json({ message: 'Failed to update user' });
    }
  });

  // Cat routes
  app.get('/api/cats', async (req, res) => {
    try {
      const cats = await storage.getAllCats();
      res.json(cats);
    } catch (error) {
      res.status(500).json({ message: 'Failed to get cats' });
    }
  });

  app.get('/api/user/:userId/cats', async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      const userCats = await storage.getUserCats(userId);
      res.json(userCats);
    } catch (error) {
      res.status(500).json({ message: 'Failed to get user cats' });
    }
  });

  app.get('/api/user/:userId/cats/active', async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      const activeCat = await storage.getUserActiveCat(userId);

      if (!activeCat) {
        return res.status(404).json({ message: 'No active cat found' });
      }

      res.json(activeCat);
    } catch (error) {
      res.status(500).json({ message: 'Failed to get active cat' });
    }
  });

  app.put('/api/user-cat/:id/activate', async (req, res) => {
    try {
      const userCatId = parseInt(req.params.id);
      const userCat = await storage.getUserCat(userCatId);

      if (!userCat) {
        return res.status(404).json({ message: 'Cat not found' });
      }

      // Deactivate all other cats for this user
      const userCats = await storage.getUserCats(userCat.userId);
      for (const cat of userCats) {
        if (cat.id !== userCatId) {
          await storage.updateUserCat(cat.id, { isActive: false });
        }
      }

      // Activate the selected cat
      const updatedCat = await storage.updateUserCat(userCatId, {
        isActive: true,
      });
      res.json(updatedCat);
    } catch (error) {
      res.status(500).json({ message: 'Failed to activate cat' });
    }
  });

  // Battle routes
  app.post('/api/battle/start', async (req, res) => {
    try {
      const { userId, playerCatId, opponentCatId } = req.body;

      const playerCat = await storage.getUserCat(playerCatId);
      const opponentCat = await storage.getCat(opponentCatId);

      if (!playerCat || !opponentCat) {
        return res.status(400).json({ message: 'Invalid cats specified' });
      }

      // Check if user already has an active battle
      const existingBattle = await storage.getUserActiveBattle(userId);
      if (existingBattle) {
        return res.status(400).json({ message: 'Battle already in progress' });
      }

      const battle = await storage.createBattle({
        userId,
        playerCatId,
        opponentCatId,
        status: 'active',
        turn: 1,
        round: 1,
        playerHealth: playerCat.maxHealth,
        opponentHealth: opponentCat.baseHealth,
        battleLog: [],
        coinsReward: null,
        experienceReward: null,
      });

      const battleWithDetails = await storage.getBattle(battle.id);
      res.json(battleWithDetails);
    } catch (error) {
      res.status(500).json({ message: 'Failed to start battle' });
    }
  });

  app.get('/api/user/:userId/battle/active', async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      const activeBattle = await storage.getUserActiveBattle(userId);

      if (!activeBattle) {
        return res.status(404).json({ message: 'No active battle found' });
      }

      res.json(activeBattle);
    } catch (error) {
      res.status(500).json({ message: 'Failed to get active battle' });
    }
  });

  app.post('/api/battle/:id/action', async (req, res) => {
    try {
      const battleId = parseInt(req.params.id);
      const { action, itemId } = req.body;

      const battle = await storage.getBattle(battleId);
      if (!battle || battle.status !== 'active') {
        return res.status(400).json({ message: 'No active battle found' });
      }

      let playerDamage = 0;
      let opponentDamage = 0;
      let logEntry = '';

      // Calculate battle action results
      switch (action) {
        case 'attack':
          const attackDamage = Math.max(
            1,
            battle.playerCat.attack -
              Math.floor(battle.opponentCat.baseDefense * 0.5)
          );
          opponentDamage = Math.floor(
            attackDamage * (0.8 + Math.random() * 0.4)
          ); // 80-120% damage variance
          logEntry = `${battle.playerCat.cat.name} attacks for ${opponentDamage} damage!`;
          break;

        case 'defend':
          // Reduce incoming damage for next turn (implement in opponent turn)
          logEntry = `${battle.playerCat.cat.name} takes a defensive stance!`;
          break;

        case 'special':
          const specialDamage = Math.floor(battle.playerCat.attack * 1.5);
          opponentDamage = Math.max(
            1,
            specialDamage - Math.floor(battle.opponentCat.baseDefense * 0.3)
          );
          logEntry = `${battle.playerCat.cat.name} uses ${battle.playerCat.cat.specialAbility} for ${opponentDamage} damage!`;
          break;

        case 'item':
          // Handle item usage (heal, boost, etc.)
          if (itemId) {
            logEntry = `${battle.playerCat.cat.name} uses an item!`;
          }
          break;
      }

      // Opponent turn (simple AI)
      if (battle.opponentHealth - opponentDamage > 0) {
        const opponentAttack = Math.max(
          1,
          battle.opponentCat.baseAttack -
            Math.floor(battle.playerCat.defense * 0.5)
        );
        playerDamage = Math.floor(opponentAttack * (0.8 + Math.random() * 0.4));
        logEntry += ` | ${battle.opponentCat.name} counterattacks for ${playerDamage} damage!`;
      }

      const newPlayerHealth = Math.max(0, battle.playerHealth - playerDamage);
      const newOpponentHealth = Math.max(
        0,
        battle.opponentHealth - opponentDamage
      );

      const newBattleLog = [...(battle.battleLog as string[]), logEntry];

      let status = battle.status;
      let coinsReward = battle.coinsReward;
      let experienceReward = battle.experienceReward;

      // Check for battle end
      if (newPlayerHealth <= 0) {
        status = 'lost';
      } else if (newOpponentHealth <= 0) {
        status = 'won';
        coinsReward = 50 + Math.floor(Math.random() * 100);
        experienceReward = 25 + Math.floor(Math.random() * 50);

        // Update user stats
        const user = await storage.getUser(battle.userId);
        if (user) {
          await storage.updateUser(battle.userId, {
            coins: user.coins + coinsReward,
            battlesWon: user.battlesWon + 1,
            winStreak: user.winStreak + 1,
            experience: user.experience + experienceReward,
          });
        }
      }

      const updatedBattle = await storage.updateBattle(battleId, {
        playerHealth: newPlayerHealth,
        opponentHealth: newOpponentHealth,
        turn: battle.turn + 1,
        battleLog: newBattleLog,
        status,
        coinsReward,
        experienceReward,
      });

      const battleWithDetails = await storage.getBattle(battleId);
      res.json(battleWithDetails);
    } catch (error) {
      res.status(500).json({ message: 'Failed to process battle action' });
    }
  });

  // Items routes
  app.get('/api/items', async (req, res) => {
    try {
      const items = await storage.getAllItems();
      res.json(items);
    } catch (error) {
      res.status(500).json({ message: 'Failed to get items' });
    }
  });

  app.get('/api/user/:userId/items', async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      const userItems = await storage.getUserItems(userId);
      res.json(userItems);
    } catch (error) {
      res.status(500).json({ message: 'Failed to get user items' });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
