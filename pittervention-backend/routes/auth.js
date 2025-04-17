// routes/auth.js 
const express = require('express'); 
const bcrypt = require('bcrypt'); 
const jwt = require('jsonwebtoken'); 
const { sql, poolPromise } = require('../db'); 
 
const router = express.Router(); 
 
// Register a new user 
router.post('/register', async (req, res) => { 
  const { username, password } = req.body; 
 
  if (!username || !password) { 
    return res.status(400).json({ message: 'Username and password are required' }); 
  } 
 
  try { 
    const pool = await poolPromise; 
    const hashedPassword = await bcrypt.hash(password, 10); 
 
    // Insert new user into Login table 
    await pool.request() 
      .input('username', sql.NVarChar, username) 
      .input('password', sql.NVarChar, hashedPassword) 
      .query('INSERT INTO Login (username, password) VALUES (@username, @password)'); 

 
    res.status(201).json({ message: 'User registered successfully' }); 
  } catch (error) { 
    if (error.number === 2627) { // Unique constraint violation 
      res.status(400).json({ message: 'Username already exists' }); 
    } else { 
      res.status(500).json({ message: 'Error registering user', error: error.message }); 
    } 
  } 
}); 
 
// Login 
router.post('/login', async (req, res) => { 
  const { username, password } = req.body; 
 
  if (!username || !password) { 
    return res.status(400).json({ message: 'Username and password are required' }); 
  } 
 
  try { 
    const pool = await poolPromise; 
    const result = await pool.request() 
      .input('username', sql.NVarChar, username) 
      .query('SELECT * FROM Login WHERE username = @username'); 
 
    const user = result.recordset[0]; 
    if (!user) { 
      return res.status(401).json({ message: 'Invalid credentials' }); 
    } 
 
    const isMatch = await bcrypt.compare(password, user.password); 
    if (!isMatch) { 
      return res.status(401).json({ message: 'Invalid credentials' }); 
    } 
 
    const token = jwt.sign({ lid: user.LID }, process.env.JWT_SECRET, { expiresIn: '1h' }); 
    res.json({ token, lid: user.LID }); 
  } catch (error) { 
    res.status(500).json({ message: 'Error logging in', error: error.message }); 
  } 
}); 
 
module.exports = router; 
