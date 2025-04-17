// routes/badges.js 
const express = require('express'); 
const { sql, poolPromise } = require('../db'); 
const authenticateToken = require('../middleware/auth'); 
 
const router = express.Router(); 
 
// Get all badges for a user 
router.get('/', authenticateToken, async (req, res) => { 
  const LID = req.user.lid; 
 
  try { 
    const pool = await poolPromise; 

    const result = await pool.request() 
      .input('LID', sql.Int, LID) 
      .query(` 
        SELECT b.BID, b.badgeName, b.path 
        FROM Badge b 
        JOIN LoginBadges lb ON b.BID = lb.BID 
        WHERE lb.LID = @LID 
      `); 
 
    res.json(result.recordset); 
  } catch (error) { 
    res.status(500).json({ message: 'Error fetching badges', error: error.message }); 
  } 
}); 
 
// Add a badge to a user (for demo purposes; in practice, this might be triggered by some logic) 
router.post('/assign', authenticateToken, async (req, res) => { 
  const { BID } = req.body; 
  const LID = req.user.lid; 
 
  try { 
    const pool = await poolPromise; 
    await pool.request() 
      .input('LID', sql.Int, LID) 
      .input('BID', sql.Int, BID) 
      .query('INSERT INTO LoginBadges (LID, BID) VALUES (@LID, @BID)'); 
 
    res.status(201).json({ message: 'Badge assigned successfully' }); 
  } catch (error) { 
    res.status(500).json({ message: 'Error assigning badge', error: error.message }); 
  } 
}); 
 
module.exports = router; 
  