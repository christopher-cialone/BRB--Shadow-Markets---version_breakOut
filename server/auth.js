const crypto = require('crypto');
const { userDb } = require('./db');

// Password hashing and verification functions
function hashPassword(password) {
  // Generate a random salt
  const salt = crypto.randomBytes(16).toString('hex');
  
  // Hash the password with the salt using scrypt
  const hash = crypto.scryptSync(password, salt, 64).toString('hex');
  
  // Return the hash and salt, joined by a period
  return `${hash}.${salt}`;
}

function verifyPassword(password, hashedPassword) {
  // Split the stored hash and salt
  const [hash, salt] = hashedPassword.split('.');
  
  // Hash the provided password with the stored salt
  const verifyHash = crypto.scryptSync(password, salt, 64).toString('hex');
  
  // Compare the hashes using a constant-time comparison function
  return hash === verifyHash;
}

// User authentication functions
async function registerUser(username, password, characterType) {
  try {
    // Check if username already exists
    const existingUser = await userDb.findUserByUsername(username);
    if (existingUser) {
      return { success: false, message: 'Username already exists' };
    }
    
    // Hash the password before storing it
    const hashedPassword = hashPassword(password);
    
    // Create the user in the database
    const user = await userDb.createUser(username, hashedPassword, characterType);
    
    // Remove password from the returned user object
    const { password: _, ...userWithoutPassword } = user;
    
    return { success: true, user: userWithoutPassword };
  } catch (error) {
    console.error('Error registering user:', error);
    return { success: false, message: 'Error registering user' };
  }
}

async function loginUser(username, password) {
  try {
    // Find the user by username
    const user = await userDb.findUserByUsername(username);
    if (!user) {
      return { success: false, message: 'Invalid username or password' };
    }
    
    // Verify the password
    const isPasswordValid = verifyPassword(password, user.password);
    if (!isPasswordValid) {
      return { success: false, message: 'Invalid username or password' };
    }
    
    // Update last login time
    await userDb.updateLastLogin(user.id);
    
    // Remove password from the returned user object
    const { password: _, ...userWithoutPassword } = user;
    
    return { success: true, user: userWithoutPassword };
  } catch (error) {
    console.error('Error logging in user:', error);
    return { success: false, message: 'Error logging in' };
  }
}

module.exports = {
  hashPassword,
  verifyPassword,
  registerUser,
  loginUser
};