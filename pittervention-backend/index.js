// index.js 
const express = require('express'); 
const cors = require('cors'); 
require('dotenv').config(); 
 
const authRoutes = require('./routes/auth'); 
const entryRoutes = require('./routes/entries'); 
const badgeRoutes = require('./routes/badges'); 
 
const app = express(); 
 
// Middleware 
app.use(cors()); 
app.use(express.json()); 
 
// Routes 
app.use('/api/auth', authRoutes); 
app.use('/api/entries', entryRoutes); 
app.use('/api/badges', badgeRoutes); 
 
// Start the server 
const PORT = process.env.PORT || 5000; 
app.listen(PORT, () => { 
  console.log(`Server running on port ${PORT}`); 
}); 
  