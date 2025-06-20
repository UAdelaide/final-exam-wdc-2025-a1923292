var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
const mysql = require('mysql2');
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

let db;

(async () => {

  const connection = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    multipleStatements: true
  });

  try {
    await connection.query(startingSql);
    await connection.end();
  } catch (e) {
    console.error("Unable to initialise tables: ", e);
  }

  db = await mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: '',
    database: ''
  });

})();

app.use('/', indexRouter);
app.use('/users', usersRouter);

const router = express.Router();

router.get('/api/dogs', async (req,res) => {
  try {
    await db.query(`SELECT d.name AS dog_name, d.size AS size, u.username AS owner_username FROM Dogs AS d
    INNER JOIN Users AS u ON d.owner_id=u.user_id;`);
  } catch (e) {
    return res.status(500).json({
        message: `failed to query /api/dogs: ${e}`
    });
  }
});

router.get('/api/walkrequests/open', async (req,res) => {

});

router.get('/api/walkers/summary', async (req,res) => {

});

module.exports = app;
