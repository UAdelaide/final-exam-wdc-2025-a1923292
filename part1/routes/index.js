var express = require('express');
var router = express.Router();
const db = require('../db.js');

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
  try {
    const [result] = await db.query(`SELECT wr.request_id, d.name AS dog_name, wr.requested_time, wr.duration_minutes, wr.location, u.username AS owner_username FROM WalkRequests AS wr
    INNER JOIN Dogs AS d ON wr.dog_id=d.dog_id
    INNER JOIN Users AS u ON d.owner_id=u.user_id
    WHERE wr.status='open'
    ORDER BY wr.requested_time DESC;`);
    return res.status(200).json(result);
  } catch (e) {
    return res.status(500).json({
      message: `request to /api/walkrequests/open failed: ${e}`
    });
  }
});

router.get('/api/walkers/summary', async (req,res) => {
  try {
    const [result] = await db.query(`SELECT u.username AS walker_username, COUNT(r.rating_id) AS total_ratings, ROUND(AVG(r.rating), 1) AS average_rating,
        (
          SELECT COUNT(*)
          FROM WalkRequests wr
          INNER JOIN WalkApplications wa ON wr.request_id = wa.request_id AND wa.status = 'accepted'
          WHERE wr.status = 'completed' AND wa.walker_id = u.user_id
        ) AS completed_walks
      FROM Users u
      LEFT JOIN WalkRatings r ON r.walker_id = u.user_id
      WHERE u.role = 'walker'
      GROUP BY u.user_id;`);
    res.status(200).json(result);
  } catch (e) {
    res.status(500).json({
      message: `request to /api/walkers/summary failed: ${e}`
    });
  }
});

module.exports = router;
