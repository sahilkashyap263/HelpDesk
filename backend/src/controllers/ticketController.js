const { pool, dbAll, dbGet, dbRun } = require('../config/database');
const { calculateSLADueDate } = require('../utils/slaCalculator');

const isProduction = process.env.NODE_ENV === 'production' && process.env.DATABASE_URL;

/**
 * Get all tickets
 */
async function getAllTickets(req, res) {
    try {
        let tickets;
        if (isProduction) {
            const result = await pool.query('SELECT * FROM tickets ORDER BY created_at DESC');
            tickets = result.rows;
        } else {
            tickets = await dbAll('SELECT * FROM tickets ORDER BY created_at DESC');
        }
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
        let ticket;
        if (isProduction) {
            const result = await pool.query('SELECT * FROM tickets WHERE id = $1', [req.params.id]);
            ticket = result.rows[0];
        } else {
            ticket = await dbGet('SELECT * FROM tickets WHERE id = ?', [req.params.id]);
        }
        
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
        
        let ticketId;
        if (isProduction) {
            const result = await pool.query(
                'INSERT INTO tickets (title, description, category, priority, sla_due_date) VALUES ($1, $2, $3, $4, $5) RETURNING id',
                [title, description, category, priority, slaDueDate.toISOString()]
            );
            ticketId = result.rows[0].id;
        } else {
            const result = await dbRun(
                'INSERT INTO tickets (title, description, category, priority, sla_due_date) VALUES (?, ?, ?, ?, ?)',
                [title, description, category, priority, slaDueDate.toISOString()]
            );
            ticketId = result.lastID;
        }
        
        // Add initial comment
        if (isProduction) {
            await pool.query(
                'INSERT INTO comments (ticket_id, comment, user_type) VALUES ($1, $2, $3)',
                [ticketId, 'Ticket created', 'system']
            );
        } else {
            await dbRun(
                'INSERT INTO comments (ticket_id, comment, user_type) VALUES (?, ?, ?)',
                [ticketId, 'Ticket created', 'system']
            );
        }
        
        res.json({
            id: ticketId,
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

        let changes;
        if (isProduction) {
            const result = await pool.query(
                'UPDATE tickets SET status = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2',
                [status, req.params.id]
            );
            changes = result.rowCount;
        } else {
            const result = await dbRun(
                'UPDATE tickets SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
                [status, req.params.id]
            );
            changes = result.changes;
        }
        
        if (changes === 0) {
            return res.status(404).json({ error: 'Ticket not found' });
        }
        
        // Add status change comment
        if (isProduction) {
            await pool.query(
                'INSERT INTO comments (ticket_id, comment, user_type) VALUES ($1, $2, $3)',
                [req.params.id, `Status changed to: ${status}`, 'system']
            );
        } else {
            await dbRun(
                'INSERT INTO comments (ticket_id, comment, user_type) VALUES (?, ?, ?)',
                [req.params.id, `Status changed to: ${status}`, 'system']
            );
        }
        
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
        if (isProduction) {
            await pool.query('DELETE FROM comments WHERE ticket_id = $1', [req.params.id]);
            const result = await pool.query('DELETE FROM tickets WHERE id = $1', [req.params.id]);
            
            if (result.rowCount === 0) {
                return res.status(404).json({ error: 'Ticket not found' });
            }
        } else {
            await dbRun('DELETE FROM comments WHERE ticket_id = ?', [req.params.id]);
            const result = await dbRun('DELETE FROM tickets WHERE id = ?', [req.params.id]);
            
            if (result.changes === 0) {
                return res.status(404).json({ error: 'Ticket not found' });
            }
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