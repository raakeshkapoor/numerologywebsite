
require('dotenv').config();

const express = require('express');
const session = require('express-session');
const bodyParser = require('body-parser');
const path = require('path');
const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcrypt');
const fs = require('fs');

const app = express();

app.use(session({
  secret: process.env.SESSION_SECRET || 'fallback_secret_key',
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false }
}));

const PORT = process.env.PORT || 3000;

// Create /data folder and DB path
const DB_DIR = path.join(__dirname, 'data');
const DB_PATH = path.join(DB_DIR, 'users.db');

if (!fs.existsSync(DB_DIR)) {
    fs.mkdirSync(DB_DIR);
}

const db = new sqlite3.Database(DB_PATH);

// Middleware
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));
app.use(session({
    secret: 'S!cR3tK3y#2025*MyApp!@#', // Use environment variable in prod
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false } // Set to true if using HTTPS
}));

app.set('view engine', 'ejs');

// Middleware to protect routes
function isAuthenticated(req, res, next) {
    if (req.session.loggedIn) {
        next();
    } else {
        res.redirect('/login');
    }
}

// Routes
app.get('/', (req, res) => {
    res.redirect('/home');
});

app.get('/login', (req, res) => {
    res.render('login', { error: null });
});

app.post('/login', (req, res) => {
    const { username, password } = req.body;

    db.get('SELECT * FROM users WHERE username = ?', [username], (err, user) => {
        if (err) {
            console.error('DB error:', err.message);
            return res.render('login', { error: 'Database error' });
        }

        if (!user) {
            return res.render('login', { error: 'User not found' });
        }

        bcrypt.compare(password, user.password, (err, result) => {
            if (result) {
                req.session.loggedIn = true;
                req.session.username = user.username;
                res.redirect('/home');
            } else {
                res.render('login', { error: 'Incorrect password' });
            }
        });
    });
});

app.get('/logout', (req, res) => {
    req.session.destroy(() => {
        res.redirect('/login');
    });
});

// Protected pages
app.get('/home', isAuthenticated, (req, res) => res.render('home'));
app.get('/page1', isAuthenticated, (req, res) => res.render('page1'));
app.get('/page2', isAuthenticated, (req, res) => res.render('page2'));
app.get('/page3', isAuthenticated, (req, res) => res.render('page3'));
app.get('/page4', isAuthenticated, (req, res) => res.render('page4'));
app.get('/page5', isAuthenticated, (req, res) => res.render('page5'));
app.get('/page6', isAuthenticated, (req, res) => res.render('page6'));
app.get('/page7', isAuthenticated, (req, res) => res.render('page7'));

app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});
