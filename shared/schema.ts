import { pgTable, serial, text, timestamp, integer, boolean } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

// Users Table
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  characterType: text("character_type").notNull().default("the-kid"),
  level: integer("level").notNull().default(1),
  xp: integer("xp").notNull().default(0),
  xpToNextLevel: integer("xp_to_next_level").notNull().default(100),
  btBalance: integer("bt_balance").notNull().default(100),
  bcBalance: integer("bc_balance").notNull().default(0),
  createdAt: timestamp("created_at").defaultNow(),
  lastLogin: timestamp("last_login"),
});

// Define types for use in the application
export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

// Cattle Table
export const cattle = pgTable("cattle", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  type: text("type").notNull(),
  name: text("name").notNull(),
  level: integer("level").notNull().default(1),
  milkRate: integer("milk_rate"),
  breedingRate: integer("breeding_rate"),
  lastMilked: timestamp("last_milked"),
  lastFed: timestamp("last_fed").notNull(),
  healthStatus: text("health_status").notNull().default("healthy"),
});

export type Cattle = typeof cattle.$inferSelect;
export type InsertCattle = typeof cattle.$inferInsert;

// Inventory Table
export const inventory = pgTable("inventory", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  itemType: text("item_type").notNull(),
  quantity: integer("quantity").notNull().default(0),
});

export type Inventory = typeof inventory.$inferSelect;
export type InsertInventory = typeof inventory.$inferInsert;

// Ranch Tiles Table
export const ranchTiles = pgTable("ranch_tiles", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  position: integer("position").notNull(),
  type: text("type").notNull().default("empty"),
  status: text("status").notNull().default("active"),
  cattleId: integer("cattle_id").references(() => cattle.id),
  growthStage: integer("growth_stage"),
  plantedAt: timestamp("planted_at"),
  lastHarvested: timestamp("last_harvested"),
});

export type RanchTile = typeof ranchTiles.$inferSelect;
export type InsertRanchTile = typeof ranchTiles.$inferInsert;

// Shadow Market Tiles Table
export const shadowMarketTiles = pgTable("shadow_market_tiles", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  position: integer("position").notNull(),
  type: text("type").notNull().default("empty"),
  status: text("status").notNull().default("active"),
  potionType: text("potion_type"),
  productionStarted: timestamp("production_started"),
  productionCompleted: timestamp("production_completed"),
});

export type ShadowMarketTile = typeof shadowMarketTiles.$inferSelect;
export type InsertShadowMarketTile = typeof shadowMarketTiles.$inferInsert;

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  cattle: many(cattle),
  inventory: many(inventory),
  ranchTiles: many(ranchTiles),
  shadowMarketTiles: many(shadowMarketTiles),
}));

export const cattleRelations = relations(cattle, ({ one }) => ({
  user: one(users, {
    fields: [cattle.userId],
    references: [users.id],
  }),
}));

export const inventoryRelations = relations(inventory, ({ one }) => ({
  user: one(users, {
    fields: [inventory.userId],
    references: [users.id],
  }),
}));

export const ranchTilesRelations = relations(ranchTiles, ({ one }) => ({
  user: one(users, {
    fields: [ranchTiles.userId],
    references: [users.id],
  }),
  cattle: one(cattle, {
    fields: [ranchTiles.cattleId],
    references: [cattle.id],
  }),
}));

export const shadowMarketTilesRelations = relations(shadowMarketTiles, ({ one }) => ({
  user: one(users, {
    fields: [shadowMarketTiles.userId],
    references: [users.id],
  }),
}));