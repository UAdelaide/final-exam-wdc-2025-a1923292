var express = require('express');
var router = express.Router();
const db = require('../db')

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});


router.get('/api/dogs', async (req,res) => {
  try {
    const [result] = await db.query(`SELECT d.name AS dog_name, d.size AS size, u.username AS owner_username FROM Dogs AS d
    INNER JOIN Users AS u ON d.owner_id=u.user_id;`);
    return res.status(200).json(result);
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
