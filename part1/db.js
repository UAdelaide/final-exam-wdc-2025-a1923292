const mysql = require('mysql2');

const db = mysql.createPool({
  host: 'localhost',
	user: 'root',
	password: 'password',
	database: 'my_database'
});

module.exports = db;