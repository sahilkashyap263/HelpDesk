const express = require('express');
const router = express.Router();
const ticketController = require('../controllers/ticketController');
const commentController = require('../controllers/commentController');

// Ticket routes
router.get('/', ticketController.getAllTickets);
router.get('/:id', ticketController.getTicketById);
router.post('/', ticketController.createTicket);
router.put('/:id', ticketController.updateTicketStatus);
router.delete('/:id', ticketController.deleteTicket);

// Comment routes
router.get('/:id/comments', commentController.getTicketComments);
router.post('/:id/comments', commentController.addComment);

module.exports = router;