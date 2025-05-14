const { Pool } = require('pg');

// Initialize PostgreSQL connection pool
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

// Function to initialize database with required tables
async function initializeDatabase() {
  try {
    // Users table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        username VARCHAR(50) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        character_type VARCHAR(20) NOT NULL DEFAULT 'the-kid',
        level INTEGER NOT NULL DEFAULT 1,
        xp INTEGER NOT NULL DEFAULT 0,
        xp_to_next_level INTEGER NOT NULL DEFAULT 100,
        bt_balance INTEGER NOT NULL DEFAULT 100,
        bc_balance INTEGER NOT NULL DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        last_login TIMESTAMP
      )
    `);

    // Cattle table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS cattle (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        type VARCHAR(20) NOT NULL,
        name VARCHAR(50) NOT NULL,
        level INTEGER NOT NULL DEFAULT 1,
        milk_rate INTEGER,
        breeding_rate INTEGER,
        last_milked TIMESTAMP,
        last_fed TIMESTAMP NOT NULL,
        health_status VARCHAR(20) NOT NULL DEFAULT 'healthy'
      )
    `);

    // Inventory table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS inventory (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        item_type VARCHAR(50) NOT NULL,
        quantity INTEGER NOT NULL DEFAULT 0
      )
    `);

    // Ranch tiles table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS ranch_tiles (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        position INTEGER NOT NULL,
        type VARCHAR(20) NOT NULL DEFAULT 'empty',
        status VARCHAR(20) NOT NULL DEFAULT 'active',
        cattle_id INTEGER REFERENCES cattle(id) ON DELETE SET NULL,
        growth_stage INTEGER,
        planted_at TIMESTAMP,
        last_harvested TIMESTAMP
      )
    `);

    // Shadow market tiles table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS shadow_market_tiles (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        position INTEGER NOT NULL,
        type VARCHAR(20) NOT NULL DEFAULT 'empty',
        status VARCHAR(20) NOT NULL DEFAULT 'active',
        potion_type VARCHAR(20),
        production_started TIMESTAMP,
        production_completed TIMESTAMP
      )
    `);

    console.log('Database tables initialized successfully');
  } catch (error) {
    console.error('Error initializing database:', error);
  }
}

// User management functions
const userDb = {
  // Create a new user
  async createUser(username, password, characterType) {
    try {
      const result = await pool.query(
        `INSERT INTO users (username, password, character_type)
         VALUES ($1, $2, $3)
         RETURNING id, username, character_type, level, xp, xp_to_next_level, bt_balance, bc_balance`,
        [username, password, characterType]
      );
      
      // Initialize ranch tiles for the user (5x5 grid = 25 tiles)
      const userId = result.rows[0].id;
      for (let i = 0; i < 25; i++) {
        await pool.query(
          `INSERT INTO ranch_tiles (user_id, position, type, status)
           VALUES ($1, $2, $3, $4)`,
          [userId, i, 'empty', i < 15 ? 'active' : 'locked']
        );
      }
      
      // Initialize shadow market tiles for the user (5x5 grid = 25 tiles)
      for (let i = 0; i < 25; i++) {
        await pool.query(
          `INSERT INTO shadow_market_tiles (user_id, position, type, status)
           VALUES ($1, $2, $3, $4)`,
          [userId, i, 'empty', i < 12 ? 'active' : 'locked']
        );
      }
      
      // Initialize default inventory items
      const defaultItems = ['hay', 'water', 'medicine'];
      for (const item of defaultItems) {
        await pool.query(
          `INSERT INTO inventory (user_id, item_type, quantity)
           VALUES ($1, $2, $3)`,
          [userId, item, item === 'hay' || item === 'water' ? 100 : 10]
        );
      }
      
      return result.rows[0];
    } catch (error) {
      console.error('Error creating user:', error);
      throw error;
    }
  },
  
  // Find user by username
  async findUserByUsername(username) {
    try {
      const result = await pool.query(
        `SELECT id, username, password, character_type, level, xp, xp_to_next_level, bt_balance, bc_balance
         FROM users
         WHERE username = $1`,
        [username]
      );
      return result.rows[0];
    } catch (error) {
      console.error('Error finding user:', error);
      throw error;
    }
  },
  
  // Find user by id
  async findUserById(id) {
    try {
      const result = await pool.query(
        `SELECT id, username, character_type, level, xp, xp_to_next_level, bt_balance, bc_balance
         FROM users
         WHERE id = $1`,
        [id]
      );
      return result.rows[0];
    } catch (error) {
      console.error('Error finding user by ID:', error);
      throw error;
    }
  },
  
  // Update user's last login time
  async updateLastLogin(userId) {
    try {
      await pool.query(
        `UPDATE users
         SET last_login = CURRENT_TIMESTAMP
         WHERE id = $1`,
        [userId]
      );
    } catch (error) {
      console.error('Error updating last login:', error);
      throw error;
    }
  }
};

module.exports = {
  pool,
  initializeDatabase,
  userDb
};