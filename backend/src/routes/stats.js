const express = require('express');
const router = express.Router();
const { pool, dbAll, dbGet } = require('../config/database');

const isProduction = process.env.NODE_ENV === 'production' && process.env.DATABASE_URL;

// Get statistics
router.get('/stats', async (req, res) => {
    try {
        if (isProduction) {
            const [total, open, inProgress, resolved, closed] = await Promise.all([
                pool.query("SELECT COUNT(*) as count FROM tickets"),
                pool.query("SELECT COUNT(*) as count FROM tickets WHERE status = 'Open'"),
                pool.query("SELECT COUNT(*) as count FROM tickets WHERE status = 'In Progress'"),
                pool.query("SELECT COUNT(*) as count FROM tickets WHERE status = 'Resolved'"),
                pool.query("SELECT COUNT(*) as count FROM tickets WHERE status = 'Closed'")
            ]);

            res.json({
                total: parseInt(total.rows[0].count),
                open: parseInt(open.rows[0].count),
                inProgress: parseInt(inProgress.rows[0].count),
                resolved: parseInt(resolved.rows[0].count),
                closed: parseInt(closed.rows[0].count)
            });
        } else {
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
        }
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Debug endpoint - view all tables
router.get('/debug/tables', async (req, res) => {
    try {
        let tickets, comments;
        
        if (isProduction) {
            const ticketsResult = await pool.query('SELECT * FROM tickets');
            const commentsResult = await pool.query('SELECT * FROM comments');
            tickets = ticketsResult.rows;
            comments = commentsResult.rows;
        } else {
            tickets = await dbAll('SELECT * FROM tickets');
            comments = await dbAll('SELECT * FROM comments');
        }

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