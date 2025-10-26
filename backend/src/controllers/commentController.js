const { pool, dbAll, dbRun } = require('../config/database');

const isProduction = process.env.NODE_ENV === 'production' && process.env.DATABASE_URL;

/**
 * Get all comments for a ticket
 */
async function getTicketComments(req, res) {
    try {
        let comments;
        if (isProduction) {
            const result = await pool.query(
                'SELECT * FROM comments WHERE ticket_id = $1 ORDER BY created_at ASC',
                [req.params.id]
            );
            comments = result.rows;
        } else {
            comments = await dbAll(
                'SELECT * FROM comments WHERE ticket_id = ? ORDER BY created_at ASC',
                [req.params.id]
            );
        }
        res.json(comments);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

/**
 * Add comment to ticket
 */
async function addComment(req, res) {
    try {
        const { comment, user_type } = req.body;
        
        if (!comment || !user_type) {
            return res.status(400).json({ error: 'Comment and user_type are required' });
        }

        let commentId;
        if (isProduction) {
            const result = await pool.query(
                'INSERT INTO comments (ticket_id, comment, user_type) VALUES ($1, $2, $3) RETURNING id',
                [req.params.id, comment, user_type]
            );
            commentId = result.rows[0].id;
            
            // Update ticket's updated_at timestamp
            await pool.query(
                'UPDATE tickets SET updated_at = CURRENT_TIMESTAMP WHERE id = $1',
                [req.params.id]
            );
        } else {
            const result = await dbRun(
                'INSERT INTO comments (ticket_id, comment, user_type) VALUES (?, ?, ?)',
                [req.params.id, comment, user_type]
            );
            commentId = result.lastID;
            
            // Update ticket's updated_at timestamp
            await dbRun(
                'UPDATE tickets SET updated_at = CURRENT_TIMESTAMP WHERE id = ?',
                [req.params.id]
            );
        }
        
        res.json({
            id: commentId,
            message: 'Comment added successfully'
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

module.exports = {
    getTicketComments,
    addComment
};