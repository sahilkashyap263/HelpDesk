/**
 * API Service for Helpdesk System
 * Centralized API calls with error handling
 */

// const API_URL = 'http://localhost:3000/api';
// const API_URL = import.meta.env.VITE_API_URL || 'https://helpdesk-backend-cysl.onrender.com/api';
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

class ApiService {
    /**
     * Generic fetch wrapper with error handling
     */
    async request(endpoint, options = {}) {
        try {
            const response = await fetch(`${API_URL}${endpoint}`, {
                headers: {
                    'Content-Type': 'application/json',
                    ...options.headers
                },
                ...options
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || 'Request failed');
            }

            return await response.json();
        } catch (error) {
            console.error('API Error:', error);
            throw error;
        }
    }

    // Ticket methods
    async getAllTickets() {
        return this.request('/tickets');
    }

    async getTicket(id) {
        return this.request(`/tickets/${id}`);
    }

    async createTicket(ticketData) {
        return this.request('/tickets', {
            method: 'POST',
            body: JSON.stringify(ticketData)
        });
    }

    async updateTicketStatus(id, status) {
        return this.request(`/tickets/${id}`, {
            method: 'PUT',
            body: JSON.stringify({ status })
        });
    }

    async deleteTicket(id) {
        return this.request(`/tickets/${id}`, {
            method: 'DELETE'
        });
    }

    // Comment methods
    async getTicketComments(ticketId) {
        return this.request(`/tickets/${ticketId}/comments`);
    }

    async addComment(ticketId, comment, userType) {
        return this.request(`/tickets/${ticketId}/comments`, {
            method: 'POST',
            body: JSON.stringify({ comment, user_type: userType })
        });
    }

    // Stats methods
    async getStats() {
        return this.request('/stats');
    }

    async getDebugTables() {
        return this.request('/debug/tables');
    }
}

// Export singleton instance
const api = new ApiService();