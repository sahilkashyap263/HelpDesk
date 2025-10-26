const { dbAll, dbRun } = require('../config/database');

/**
 * Get all comments for a ticket
 */
async function getTicketComments(req, res) {
    try {
        const comments = await dbAll(
            'SELECT * FROM comments WHERE ticket_id = ? ORDER BY created_at ASC',
            [req.params.id]
        );
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

        const result = await dbRun(
            'INSERT INTO comments (ticket_id, comment, user_type) VALUES (?, ?, ?)',
            [req.params.id, comment, user_type]
        );
        
        // Update ticket's updated_at timestamp
        await dbRun(
            'UPDATE tickets SET updated_at = CURRENT_TIMESTAMP WHERE id = ?',
            [req.params.id]
        );
        
        res.json({
            id: result.lastID,
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