var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
const mysql = require('mysql2/promise');
const fs = require('fs');
const startingSql = fs.readFileSync('./dogwalks.sql','utf-8');

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');

var app = express();

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

(async () => {

  const connection = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    multipleStatements: true
  });

  try {
    await connection.query(startingSql);
    await connection.query(`INSERT INTO Users (username, email, password_hash, role)
VALUES
('alice123', 'alice@example.com', 'hashed123', 'owner'),
('bobwalker', 'bob@example.com', 'hashed456', 'walker'),
('carol123', 'carol@example.com', 'hashed789', 'owner'),
('donaldtrump', 'djt@whitehouse.us', 'orangeman47', 'owner'),
('elonmusk', 'musky@richboi.com', 'electriccarz', 'walker');


INSERT INTO Dogs (owner_id, name, size) VALUES
((SELECT user_id FROM Users WHERE username = 'alice123'), 'Max', 'medium'),
((SELECT user_id FROM Users WHERE username = 'carol123'), 'Bella', 'small'),
((SELECT user_id FROM Users WHERE username = 'alice123'), 'Rocky', 'large'),
((SELECT user_id FROM Users WHERE username = 'donaldtrump'), 'Booboo', 'small'),
((SELECT user_id FROM Users WHERE username = 'carol123'), 'Luna', 'small');


INSERT INTO WalkRequests (dog_id, requested_time, duration_minutes, location, status) VALUES
((SELECT dog_id FROM Dogs WHERE name = 'Max' AND owner_id = (SELECT user_id FROM Users WHERE username = 'alice123')),
'2025-06-10 08:00:00', 30, 'Parklands', 'open'),


((SELECT dog_id FROM Dogs WHERE name = 'Bella' AND owner_id = (SELECT user_id FROM Users WHERE username = 'carol123')),
'2025-06-10 09:30:00', 45, 'Beachside Ave', 'accepted'),


((SELECT dog_id FROM Dogs WHERE name = 'Rocky' AND owner_id = (SELECT user_id FROM Users WHERE username = 'alice123')),
'2025-06-11 10:00:00', 60, 'Himalanyan Mountains', 'open'),


((SELECT dog_id FROM Dogs WHERE name = 'Booboo' AND owner_id = (SELECT user_id FROM Users WHERE username = 'donaldtrump')),
'2025-06-12 07:45:00', 30, 'White House', 'open'),


((SELECT dog_id FROM Dogs WHERE name = 'Luna' AND owner_id = (SELECT user_id FROM Users WHERE username = 'carol123')),
'2025-06-13 14:15:00', 20, 'River Murray', 'cancelled');`);
    await connection.end();
  } catch (e) {
    console.error("Unable to initialise tables: ", e);
  }

})();

app.use('/', indexRouter);
app.use('/users', usersRouter);

module.exports = app;

