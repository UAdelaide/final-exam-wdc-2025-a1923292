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

app.use('/api/walks', walkRoutes);
app.use('/api/users', userRoutes);
app.use(session({
    secret: "very_secret_secret_2025_WDC_Exam:/",
    resave: false,
    cookie: {
        secure: false,
        maxAge: 1000 * 60 * 60
    }
}));

// Export the app instead of listening here
module.exports = app;