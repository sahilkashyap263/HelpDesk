const { Pool } = require('pg');

// Use environment variable or fallback to SQLite for local development
const isProduction = process.env.NODE_ENV === 'production';

let pool;

if (isProduction && process.env.DATABASE_URL) {
    // PostgreSQL for production (Render)
    pool = new Pool({
        connectionString: process.env.DATABASE_URL,
        ssl: {
            rejectUnauthorized: false
        }
    });
    console.log('Using PostgreSQL database');
} else {
    // Fallback to SQLite for local development
    const sqlite3 = require('sqlite3').verbose();
    const path = require('path');
    const dbPath = path.join(__dirname, '../../helpdesk.db');
    
    const db = new sqlite3.Database(dbPath, (err) => {
        if (err) {
            console.error('Error opening database:', err.message);
        } else {
            console.log('Connected to SQLite database (development)');
        }
    });
    
    // SQLite helper functions
    const dbAll = (sql, params = []) => {
        return new Promise((resolve, reject) => {
            db.all(sql, params, (err, rows) => {
                if (err) reject(err);
                else resolve(rows);
            });
        });
    };
    
    const dbGet = (sql, params = []) => {
        return new Promise((resolve, reject) => {
            db.get(sql, params, (err, row) => {
                if (err) reject(err);
                else resolve(row);
            });
        });
    };
    
    const dbRun = (sql, params = []) => {
        return new Promise((resolve, reject) => {
            db.run(sql, params, function(err) {
                if (err) reject(err);
                else resolve({ lastID: this.lastID, changes: this.changes });
            });
        });
    };
    
    // Initialize SQLite tables
    db.run(`
        CREATE TABLE IF NOT EXISTS tickets (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            title TEXT NOT NULL,
            description TEXT NOT NULL,
            category TEXT NOT NULL,
            priority TEXT NOT NULL,
            status TEXT DEFAULT 'Open',
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            sla_due_date DATETIME NOT NULL
        )
    `);
    
    db.run(`
        CREATE TABLE IF NOT EXISTS comments (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            ticket_id INTEGER NOT NULL,
            comment TEXT NOT NULL,
            user_type TEXT NOT NULL,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (ticket_id) REFERENCES tickets(id)
        )
    `);
    
    module.exports = { dbAll, dbGet, dbRun, db };
    return;
}

// PostgreSQL helper functions (same interface as SQLite)
const dbAll = async (sql, params = []) => {
    const result = await pool.query(sql, params);
    return result.rows;
};

const dbGet = async (sql, params = []) => {
    const result = await pool.query(sql, params);
    return result.rows[0] || null;
};

const dbRun = async (sql, params = []) => {
    const result = await pool.query(sql, params);
    return {
        lastID: result.rows[0]?.id || result.rowCount,
        changes: result.rowCount
    };
};

// Initialize PostgreSQL tables
async function initializeDatabase() {
    try {
        // Tickets table (PostgreSQL syntax)
        await pool.query(`
            CREATE TABLE IF NOT EXISTS tickets (
                id SERIAL PRIMARY KEY,
                title TEXT NOT NULL,
                description TEXT NOT NULL,
                category TEXT NOT NULL,
                priority TEXT NOT NULL,
                status TEXT DEFAULT 'Open',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                sla_due_date TIMESTAMP NOT NULL
            )
        `);
        console.log('✓ Tickets table ready');

        // Comments table (PostgreSQL syntax)
        await pool.query(`
            CREATE TABLE IF NOT EXISTS comments (
                id SERIAL PRIMARY KEY,
                ticket_id INTEGER NOT NULL,
                comment TEXT NOT NULL,
                user_type TEXT NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (ticket_id) REFERENCES tickets(id) ON DELETE CASCADE
            )
        `);
        console.log('✓ Comments table ready');
    } catch (error) {
        console.error('Error creating tables:', error);
    }
}

// Initialize on startup
if (isProduction) {
    initializeDatabase();
}

module.exports = { pool, dbAll, dbGet, dbRun, initializeDatabase };