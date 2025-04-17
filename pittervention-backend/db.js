// db.js 
const sql = require('mssql'); 
require('dotenv').config(); 
 
const dbConfig = { 
  user: process.env.DB_USER, 
  password: process.env.DB_PASSWORD, 
  server: process.env.DB_SERVER, 
  database: process.env.DB_DATABASE, 
  options: { 

    encrypt: true, // Use this if you're on Azure or need encryption 
    trustServerCertificate: true, // For local dev, set to true; adjust for production 
  }, 
}; 
 
const poolPromise = new sql.ConnectionPool(dbConfig) 
  .connect() 
  .then(pool => { 
    console.log('Connected to SQL Server'); 
    return pool; 
  }) 
  .catch(err => { 
    console.error('Database connection failed:', err); 
    process.exit(1); 
  }); 
 
module.exports = { 
  sql, 
  poolPromise, 
}; 
  