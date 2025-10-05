const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');
const path = require('path');

const app = express();

// Use Render’s port in production or 3000 locally
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(__dirname));

// Initialize SQLite Database
const db = new sqlite3.Database('./helpdesk.db', (err) => {
    if (err) {
        console.error('Error opening database:', err.message);
    } else {
        console.log('✅ Connected to SQLite database');
        initializeDatabase();
    }
});

// Create tables
function initializeDatabase() {
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
    `, (err) => {
        if (err) console.error('Error creating tickets table:', err);
        else console.log('📋 Tickets table ready');
    });

    db.run(`
        CREATE TABLE IF NOT EXISTS comments (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            ticket_id INTEGER NOT NULL,
            comment TEXT NOT NULL,
            user_type TEXT NOT NULL,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (ticket_id) REFERENCES tickets(id)
        )
    `, (err) => {
        if (err) console.error('Error creating comments table:', err);
        else console.log('💬 Comments table ready');
    });
}

// Calculate SLA due date
function calculateSLADueDate(priority) {
    const now = new Date();
    let hours = 24;
    switch (priority) {
        case 'High': hours = 4; break;
        case 'Medium': hours = 12; break;
        case 'Low': hours = 24; break;
    }
    return new Date(now.getTime() + hours * 60 * 60 * 1000);
}

// Serve frontend pages (optional)
app.get('/', (req, res) => res.sendFile(path.join(__dirname, 'index.html')));
app.get('/admin', (req, res) => res.sendFile(path.join(__dirname, 'admin.html')));
app.get('/database', (req, res) => res.sendFile(path.join(__dirname, 'database.html')));

// API: Get all tickets
app.get('/api/tickets', (req, res) => {
    db.all('SELECT * FROM tickets ORDER BY created_at DESC', [], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
});

// API: Get single ticket
app.get('/api/tickets/:id', (req, res) => {
    db.get('SELECT * FROM tickets WHERE id = ?', [req.params.id], (err, row) => {
        if (err) return res.status(500).json({ error: err.message });
        if (!row) return res.status(404).json({ error: 'Ticket not found' });
        res.json(row);
    });
});

// API: Create new ticket
app.post('/api/tickets', (req, res) => {
    const { title, description, category, priority } = req.body;
    if (!title || !description || !category || !priority)
        return res.status(400).json({ error: 'Missing required fields' });

    const slaDueDate = calculateSLADueDate(priority);
    const query = `
        INSERT INTO tickets (title, description, category, priority, sla_due_date)
        VALUES (?, ?, ?, ?, ?)
    `;

    db.run(query, [title, description, category, priority, slaDueDate.toISOString()], function(err) {
        if (err) return res.status(500).json({ error: err.message });

        db.run('INSERT INTO comments (ticket_id, comment, user_type) VALUES (?, ?, ?)',
            [this.lastID, 'Ticket created', 'system']
        );

        res.json({
            id: this.lastID,
            message: 'Ticket created successfully',
            sla_due_date: slaDueDate
        });
    });
});

// API: Update ticket status
app.put('/api/tickets/:id', (req, res) => {
    const { status } = req.body;
    if (!status) return res.status(400).json({ error: 'Status is required' });

    db.run('UPDATE tickets SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
        [status, req.params.id],
        function(err) {
            if (err) return res.status(500).json({ error: err.message });
            if (this.changes === 0) return res.status(404).json({ error: 'Ticket not found' });

            db.run('INSERT INTO comments (ticket_id, comment, user_type) VALUES (?, ?, ?)',
                [req.params.id, `Status changed to: ${status}`, 'system']
            );

            res.json({ message: 'Ticket updated successfully' });
        }
    );
});

// API: Get comments for a ticket
app.get('/api/tickets/:id/comments', (req, res) => {
    db.all('SELECT * FROM comments WHERE ticket_id = ? ORDER BY created_at ASC',
        [req.params.id],
        (err, rows) => {
            if (err) return res.status(500).json({ error: err.message });
            res.json(rows);
        }
    );
});

// API: Add comment
app.post('/api/tickets/:id/comments', (req, res) => {
    const { comment, user_type } = req.body;
    if (!comment || !user_type)
        return res.status(400).json({ error: 'Comment and user_type are required' });

    db.run('INSERT INTO comments (ticket_id, comment, user_type) VALUES (?, ?, ?)',
        [req.params.id, comment, user_type],
        function(err) {
            if (err) return res.status(500).json({ error: err.message });
            db.run('UPDATE tickets SET updated_at = CURRENT_TIMESTAMP WHERE id = ?', [req.params.id]);
            res.json({ id: this.lastID, message: 'Comment added successfully' });
        }
    );
});

// API: Delete ticket
app.delete('/api/tickets/:id', (req, res) => {
    db.run('DELETE FROM comments WHERE ticket_id = ?', [req.params.id], (err) => {
        if (err) return res.status(500).json({ error: err.message });

        db.run('DELETE FROM tickets WHERE id = ?', [req.params.id], function(err) {
            if (err) return res.status(500).json({ error: err.message });
            if (this.changes === 0) return res.status(404).json({ error: 'Ticket not found' });
            res.json({ message: 'Ticket deleted successfully' });
        });
    });
});

// API: Stats
app.get('/api/stats', (req, res) => {
    const queries = {
        total: 'SELECT COUNT(*) as count FROM tickets',
        open: "SELECT COUNT(*) as count FROM tickets WHERE status = 'Open'",
        inProgress: "SELECT COUNT(*) as count FROM tickets WHERE status = 'In Progress'",
        resolved: "SELECT COUNT(*) as count FROM tickets WHERE status = 'Resolved'",
        closed: "SELECT COUNT(*) as count FROM tickets WHERE status = 'Closed'"
    };

    const stats = {};
    let completed = 0;

    Object.keys(queries).forEach(key => {
        db.get(queries[key], [], (err, row) => {
            if (!err) stats[key] = row.count;
            completed++;
            if (completed === Object.keys(queries).length) res.json(stats);
        });
    });
});

// API: Debug data dump
app.get('/api/debug/tables', (req, res) => {
    db.all('SELECT * FROM tickets', [], (err, tickets) => {
        if (err) return res.status(500).json({ error: err.message });
        db.all('SELECT * FROM comments', [], (err2, comments) => {
            if (err2) return res.status(500).json({ error: err2.message });
            res.json({
                tickets,
                comments,
                total_tickets: tickets.length,
                total_comments: comments.length
            });
        });
    });
});

// Start server
app.listen(PORT, () => {
    console.log(`\n🚀 HelpDesk server running`);
    console.log(`🌍 Live URL: https://helpdesk-qn01.onrender.com`);
    console.log(`📊 API root: /api`);
});

// Graceful shutdown
process.on('SIGINT', () => {
    db.close((err) => {
        if (err) console.error('Error closing database:', err.message);
        console.log('\n✅ Database connection closed');
        console.log('👋 Server shut down gracefully\n');
        process.exit(0);
    });
});
