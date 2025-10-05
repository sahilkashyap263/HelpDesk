const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(__dirname));

// Initialize SQLite Database
const db = new sqlite3.Database('./helpdesk.db', (err) => {
    if (err) {
        console.error('Error opening database:', err.message);
    } else {
        console.log('Connected to SQLite database');
        initializeDatabase();
    }
});

// Create tables
function initializeDatabase() {
    // Tickets table
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
        else console.log('Tickets table ready');
    });

    // Comments table
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
        else console.log('Comments table ready');
    });
}

// Calculate SLA due date based on priority
function calculateSLADueDate(priority) {
    const now = new Date();
    let hours = 24; // Default

    switch (priority) {
        case 'High':
            hours = 4;
            break;
        case 'Medium':
            hours = 12;
            break;
        case 'Low':
            hours = 24;
            break;
    }

    return new Date(now.getTime() + hours * 60 * 60 * 1000);
}

// API Routes

// Serve HTML pages
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.get('/admin', (req, res) => {
    res.sendFile(path.join(__dirname, 'admin.html'));
});

app.get('/database', (req, res) => {
    res.sendFile(path.join(__dirname, 'database.html'));
});

// Get all tickets
app.get('/api/tickets', (req, res) => {
    const query = 'SELECT * FROM tickets ORDER BY created_at DESC';
    
    db.all(query, [], (err, rows) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.json(rows);
    });
});

// Get single ticket
app.get('/api/tickets/:id', (req, res) => {
    const query = 'SELECT * FROM tickets WHERE id = ?';
    
    db.get(query, [req.params.id], (err, row) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        if (!row) {
            res.status(404).json({ error: 'Ticket not found' });
            return;
        }
        res.json(row);
    });
});

// Create new ticket
app.post('/api/tickets', (req, res) => {
    const { title, description, category, priority } = req.body;
    
    if (!title || !description || !category || !priority) {
        res.status(400).json({ error: 'Missing required fields' });
        return;
    }

    const slaDueDate = calculateSLADueDate(priority);
    
    const query = `
        INSERT INTO tickets (title, description, category, priority, sla_due_date)
        VALUES (?, ?, ?, ?, ?)
    `;
    
    db.run(query, [title, description, category, priority, slaDueDate.toISOString()], function(err) {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        
        // Add initial comment
        const commentQuery = 'INSERT INTO comments (ticket_id, comment, user_type) VALUES (?, ?, ?)';
        db.run(commentQuery, [this.lastID, 'Ticket created', 'system']);
        
        res.json({
            id: this.lastID,
            message: 'Ticket created successfully',
            sla_due_date: slaDueDate
        });
    });
});

// Update ticket status
app.put('/api/tickets/:id', (req, res) => {
    const { status } = req.body;
    
    if (!status) {
        res.status(400).json({ error: 'Status is required' });
        return;
    }

    const query = 'UPDATE tickets SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?';
    
    db.run(query, [status, req.params.id], function(err) {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        
        if (this.changes === 0) {
            res.status(404).json({ error: 'Ticket not found' });
            return;
        }
        
        // Add comment for status change
        const commentQuery = 'INSERT INTO comments (ticket_id, comment, user_type) VALUES (?, ?, ?)';
        db.run(commentQuery, [req.params.id, `Status changed to: ${status}`, 'system']);
        
        res.json({ message: 'Ticket updated successfully' });
    });
});

// Get comments for a ticket
app.get('/api/tickets/:id/comments', (req, res) => {
    const query = 'SELECT * FROM comments WHERE ticket_id = ? ORDER BY created_at ASC';
    
    db.all(query, [req.params.id], (err, rows) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.json(rows);
    });
});

// Add comment to ticket
app.post('/api/tickets/:id/comments', (req, res) => {
    const { comment, user_type } = req.body;
    
    if (!comment || !user_type) {
        res.status(400).json({ error: 'Comment and user_type are required' });
        return;
    }

    const query = 'INSERT INTO comments (ticket_id, comment, user_type) VALUES (?, ?, ?)';
    
    db.run(query, [req.params.id, comment, user_type], function(err) {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        
        // Update ticket's updated_at timestamp
        db.run('UPDATE tickets SET updated_at = CURRENT_TIMESTAMP WHERE id = ?', [req.params.id]);
        
        res.json({
            id: this.lastID,
            message: 'Comment added successfully'
        });
    });
});

// Delete ticket (optional - for cleanup)
app.delete('/api/tickets/:id', (req, res) => {
    // First delete all comments
    db.run('DELETE FROM comments WHERE ticket_id = ?', [req.params.id], (err) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        
        // Then delete the ticket
        db.run('DELETE FROM tickets WHERE id = ?', [req.params.id], function(err) {
            if (err) {
                res.status(500).json({ error: err.message });
                return;
            }
            
            if (this.changes === 0) {
                res.status(404).json({ error: 'Ticket not found' });
                return;
            }
            
            res.json({ message: 'Ticket deleted successfully' });
        });
    });
});

// Get statistics
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
            if (!err) {
                stats[key] = row.count;
            }
            completed++;
            
            if (completed === Object.keys(queries).length) {
                res.json(stats);
            }
        });
    });
});

// Debug endpoint to view database tables
app.get('/api/debug/tables', (req, res) => {
    db.all('SELECT * FROM tickets', [], (err, tickets) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        db.all('SELECT * FROM comments', [], (err2, comments) => {
            if (err2) {
                res.status(500).json({ error: err2.message });
                return;
            }
            res.json({
                tickets: tickets,
                comments: comments,
                total_tickets: tickets.length,
                total_comments: comments.length
            });
        });
    });
});

// Start server
app.listen(PORT, () => {
    console.log(`\n🚀 Helpdesk Server Running`);
    console.log(`📍 Server: http://localhost:${PORT}`);
    console.log(`📊 API: http://localhost:${PORT}/api`);
    console.log(`\n👤 User Portal: Open index.html in browser`);
    console.log(`🔧 Admin Panel: Open admin.html in browser\n`);
});

// Graceful shutdown
process.on('SIGINT', () => {
    db.close((err) => {
        if (err) {
            console.error('Error closing database:', err.message);
        }
        console.log('\n✅ Database connection closed');
        console.log('👋 Server shut down gracefully\n');
        process.exit(0);
    });
});