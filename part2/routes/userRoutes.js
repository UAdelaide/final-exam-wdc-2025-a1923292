const express = require('express');
const router = express.Router();
const db = require('../models/db');

// GET all users (for admin/testing)
router.get('/', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT user_id, username, email, role FROM Users');
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

// POST a new user (simple signup)
router.post('/register', async (req, res) => {
  const { username, email, password, role } = req.body;

  try {
    const [result] = await db.query(`
      INSERT INTO Users (username, email, password_hash, role)
      VALUES (?, ?, ?, ?)
    `, [username, email, password, role]);

    res.status(201).json({ message: 'User registered', user_id: result.insertId });
  } catch (error) {
    res.status(500).json({ error: 'Registration failed' });
  }
});

router.get('/me', (req, res) => {
  if (!req.session.user) {
    return res.status(401).json({ error: 'Not logged in' });
  }
  res.json(req.session.user);
});

// POST login (dummy version)
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    const [rows] = await db.query(`
      SELECT user_id, username, role FROM Users
      WHERE email = ? AND password_hash = ?
    `, [email, password]);

    if (rows.length === 0) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    res.json({ message: 'Login successful', user: rows[0] });
  } catch (error) {
    res.status(500).json({ error: 'Login failed' });
  }
});

router.post('/actuallogin', async (req,res) => {
  const { username, password } = req.body;

  try {
    // get all users with matching username and password in users table
    const [rows] = await db.query(`
      SELECT role FROM Users
      WHERE username = ?
      AND password_hash = ?
      `, [username, password]);
    if (rows.length === 0){
      // no user found from query
      res.status(401).json({
        message: "Invalid credentials, user not found in /api/users/actuallogin"
      });
    } else if (rows.length === 1){
      // set session cookie
      req.session.user = {
        id: rows[0].user_id,
        username: username,
        role: rows[0].role
      };
      // return success with role
      res.status(200).json({
        message: "SUCCESS",
        role: rows[0].role
      });
    } else {
      // multiple users found from query
      res.status(401).json({
        message: "Invalid credentials, multiple users found in /api/users/actuallogin"
      });
    }
  } catch (e) {
    // server failed for what
    res.status(500).json({
      message: `Server Error in /api/users/actuallogin: ${e}`
    });
  }
});

router.post('/logout', async (req,res) => {
  try {
    if (!req.session){
      res.status(401).json({
        message: "session cooked is not defined, cannot log out"
      });
    } else {
      req.session.destroy((e) => {
        if (e){
          res.status(500).json({
            message: `Logout failed: ${e}`
          });
        }
        res.clearCookie('connect.sid');
        res.status(200).json({
          message: "SUCCESS"
        });
      });
    }
  } catch (e) {
    res.status(500).json({
      message: `Server Error: ${e}`
    });
  }
});

router.get('/dogs', async (req,res) => {
  if (!req.session.user){
    res.status(401).json({
      message: "user session expired"
    });
  }
  const id = req.session.user.id;
  try {
    const [result] = await db.query(
      `SELECT name, dog_id AS id FROM Dogs
      WHERE owner_id = ?`,
      [id]
    );
    console.log(result);
    res.status(200).json({
      message: "SUCCESS",
      dogs: result
    });
  } catch (e) {
    res.status(500).json({
      message: `Server Error: ${e}`
    });
  }
});

module.exports = router;
