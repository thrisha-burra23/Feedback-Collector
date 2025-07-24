// connecting to database

const mysql = require('mysql');

const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root', // replace with your MySQL username
  password: 'your Password', // replace with your actual password
  database: 'feedback_db'
});

connection.connect((err) => {
  if (err) {
    console.error('❌ MySQL connection failed:', err.stack);
    return;
  }
  console.log('✅ MySQL Connected!');
});

module.exports = connection;