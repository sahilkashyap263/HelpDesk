const express = require('express');
const router = express.Router();
const { dbAll, dbGet } = require('../config/database');

// Get statistics
router.get('/', async (req, res) => {
    try {
        const [total, open, inProgress, resolved, closed] = await Promise.all([
            dbGet("SELECT COUNT(*) as count FROM tickets"),
            dbGet("SELECT COUNT(*) as count FROM tickets WHERE status = 'Open'"),
            dbGet("SELECT COUNT(*) as count FROM tickets WHERE status = 'In Progress'"),
            dbGet("SELECT COUNT(*) as count FROM tickets WHERE status = 'Resolved'"),
            dbGet("SELECT COUNT(*) as count FROM tickets WHERE status = 'Closed'")
        ]);

        res.json({
            total: total.count,
            open: open.count,
            inProgress: inProgress.count,
            resolved: resolved.count,
            closed: closed.count
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Debug endpoint - view all tables
router.get('/debug/tables', async (req, res) => {
    try {
        const [tickets, comments] = await Promise.all([
            dbAll('SELECT * FROM tickets'),
            dbAll('SELECT * FROM comments')
        ]);

        res.json({
            tickets,
            comments,
            total_tickets: tickets.length,
            total_comments: comments.length
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;