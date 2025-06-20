const express = require('express');
const path = require('path');
const session = require('express-session');
require('dotenv').config();

const app = express();

// Middleware
app.use(express.json());
app.use(express.static(path.join(__dirname, '/public')));

// Routes
const walkRoutes = require('./routes/walkRoutes');
const userRoutes = require('./routes/userRoutes');

// added express session middleware
app.use(session({
    secret: "very_secret_secret_2025_WDC_Exam:/",
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: false,
        maxAge: 1000 * 60 * 60
    }
}));


app.use('/api/walks', walkRoutes);
app.use('/api/users', userRoutes);

(() => {
    try {
        const [result] = await db.query(`SELECT d.name AS dog_name, d.size AS size, u.username AS owner_username FROM Dogs AS d
        INNER JOIN Users AS u ON d.owner_id=u.user_id;`);
        return res.status(200).json(result);
    } catch (e) {
        return res.status(500).json({
            message: `failed to query /api/dogs: ${e}`
        });
    }
})();


// Export the app instead of listening here
module.exports = app;
