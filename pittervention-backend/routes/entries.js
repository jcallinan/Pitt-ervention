// routes/entries.js 
const express = require('express'); 
const { sql, poolPromise } = require('../db'); 
const authenticateToken = require('../middleware/auth'); 
 
const router = express.Router(); 
 
// Create a new survey entry 
router.post('/', authenticateToken, async (req, res) => { 
  const { 
    ACTC, tutoring, writing, math, trio, officeHours, studyGroup, 
    meditation, tao, togetherAll, therapy, meds, exercise, sleepHours 
  } = req.body; 
  const LID = req.user.lid; 
 
  try { 
    const pool = await poolPromise; 
    await pool.request() 

      .input('ACTC', sql.NVarChar, ACTC ? 'Y' : 'N') 
      .input('tutoring', sql.NVarChar, tutoring ? 'Y' : 'N') 
      .input('writing', sql.NVarChar, writing ? 'Y' : 'N') 
      .input('math', sql.NVarChar, math ? 'Y' : 'N') 
      .input('trio', sql.NVarChar, trio ? 'Y' : 'N') 
      .input('officeHours', sql.NVarChar, officeHours ? 'Y' : 'N') 
      .input('studyGroup', sql.NVarChar, studyGroup ? 'Y' : 'N') 
      .input('meditation', sql.NVarChar, meditation ? 'Y' : 'N') 
      .input('tao', sql.NVarChar, tao ? 'Y' : 'N') 
      .input('togetherAll', sql.NVarChar, togetherAll ? 'Y' : 'N') 
      .input('therapy', sql.NVarChar, therapy ? 'Y' : 'N') 
      .input('medication', sql.NVarChar, meds) 
      .input('exercise', sql.NVarChar, exercise) 
      .input('sleep', sql.Decimal(4, 2), parseFloat(sleepHours)) 
      .input('LID', sql.Int, LID) 
      .query(` 
        INSERT INTO Entry ( 
          ACTC, tutoring, writing, math, trio, officeHours, studyGroup, 
          meditation, tao, togetherAll, therapy, medication, exercise, sleep, LID 
        ) VALUES ( 
          @ACTC, @tutoring, @writing, @math, @trio, @officeHours, @studyGroup, 
          @meditation, @tao, @togetherAll, @therapy, @medication, @exercise, @sleep, @LID 
        ) 
      `); 
 
    res.status(201).json({ message: 'Survey entry created successfully' }); 
  } catch (error) { 
    res.status(500).json({ message: 'Error creating survey entry', error: error.message }); 
  } 
}); 
 
// Get all entries for a user 
router.get('/', authenticateToken, async (req, res) => { 
  const LID = req.user.lid; 
 
  try { 
    const pool = await poolPromise; 
    const result = await pool.request() 
      .input('LID', sql.Int, LID) 
      .query('SELECT * FROM Entry WHERE LID = @LID'); 
 
    res.json(result.recordset); 
  } catch (error) { 
    res.status(500).json({ message: 'Error fetching entries', error: error.message }); 
  } 
}); 
 
// Delete all entries for a user 
router.delete('/', authenticateToken, async (req, res) => { 
  const LID = req.user.lid; 
 
  try { 
    const pool = await poolPromise; 
    await pool.request() 
      .input('LID', sql.Int, LID) 
      .query('DELETE FROM Entry WHERE LID = @LID'); 
 
    res.json({ message: 'All entries deleted successfully' }); 
  } catch (error) { 
    res.status(500).json({ message: 'Error deleting entries', error: error.message }); 
  } 
}); 
 
module.exports = router; 
  