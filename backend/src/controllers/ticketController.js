const { dbAll, dbGet, dbRun } = require('../config/database');
const { calculateSLADueDate } = require('../utils/slaCalculator');

/**
 * Get all tickets
 */
async function getAllTickets(req, res) {
    try {
        const tickets = await dbAll('SELECT * FROM tickets ORDER BY created_at DESC');
        res.json(tickets);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

/**
 * Get single ticket by ID
 */
async function getTicketById(req, res) {
    try {
        const ticket = await dbGet('SELECT * FROM tickets WHERE id = ?', [req.params.id]);
        
        if (!ticket) {
            return res.status(404).json({ error: 'Ticket not found' });
        }
        
        res.json(ticket);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

/**
 * Create new ticket
 */
async function createTicket(req, res) {
    try {
        const { title, description, category, priority } = req.body;
        
        if (!title || !description || !category || !priority) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        const slaDueDate = calculateSLADueDate(priority);
        
        const result = await dbRun(
            'INSERT INTO tickets (title, description, category, priority, sla_due_date) VALUES (?, ?, ?, ?, ?)',
            [title, description, category, priority, slaDueDate.toISOString()]
        );
        
        // Add initial system comment
        await dbRun(
            'INSERT INTO comments (ticket_id, comment, user_type) VALUES (?, ?, ?)',
            [result.lastID, 'Ticket created', 'system']
        );
        
        res.json({
            id: result.lastID,
            message: 'Ticket created successfully',
            sla_due_date: slaDueDate
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

/**
 * Update ticket status
 */
async function updateTicketStatus(req, res) {
    try {
        const { status } = req.body;
        
        if (!status) {
            return res.status(400).json({ error: 'Status is required' });
        }

        const result = await dbRun(
            'UPDATE tickets SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
            [status, req.params.id]
        );
        
        if (result.changes === 0) {
            return res.status(404).json({ error: 'Ticket not found' });
        }
        
        // Add status change comment
        await dbRun(
            'INSERT INTO comments (ticket_id, comment, user_type) VALUES (?, ?, ?)',
            [req.params.id, `Status changed to: ${status}`, 'system']
        );
        
        res.json({ message: 'Ticket updated successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

/**
 * Delete ticket
 */
async function deleteTicket(req, res) {
    try {
        // Delete comments first
        await dbRun('DELETE FROM comments WHERE ticket_id = ?', [req.params.id]);
        
        // Delete ticket
        const result = await dbRun('DELETE FROM tickets WHERE id = ?', [req.params.id]);
        
        if (result.changes === 0) {
            return res.status(404).json({ error: 'Ticket not found' });
        }
        
        res.json({ message: 'Ticket deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

module.exports = {
    getAllTickets,
    getTicketById,
    createTicket,
    updateTicketStatus,
    deleteTicket
};