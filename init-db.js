const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcrypt');
const fs = require('fs');
const path = require('path');

const DB_DIR = path.join(__dirname, 'data');
const DB_PATH = path.join(DB_DIR, 'users.db');

if (!fs.existsSync(DB_DIR)) {
    fs.mkdirSync(DB_DIR);
}

const db = new sqlite3.Database(DB_PATH);

db.serialize(() => {
    // Create users table if not exists
    db.run(`CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE,
        password TEXT
    )`, (err) => {
        if (err) {
            console.error('Error creating table:', err.message);
            process.exit(1);
        }
    });

    // Check if user exists already
    db.get('SELECT * FROM users WHERE username = ?', ['raakeshkapoor'], (err, row) => {
        if (err) {
            console.error('DB error:', err.message);
            process.exit(1);
        }
        if (row) {
            console.log('User "raakeshkapoor" already exists, skipping creation.');
            db.close();
        } else {
            // Hash password and insert user
            const password = 'not my fault uncle ji';
            bcrypt.hash(password, 10, (err, hash) => {
                if (err) {
                    console.error('Error hashing password:', err.message);
                    process.exit(1);
                }

                db.run(`INSERT INTO users (username, password) VALUES (?, ?)`, ['raakeshkapoor', hash], function(err) {
                    if (err) {
                        console.error('Error inserting user:', err.message);
                        process.exit(1);
                    }
                    console.log('User "raakeshkapoor" created successfully.');
                    db.close();
                });
            });
        }
    });
});
