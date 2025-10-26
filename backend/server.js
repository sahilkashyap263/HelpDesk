require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const { db } = require('./src/config/database');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Serve static files from frontend
const frontendPath = path.join(__dirname, '../frontend/public');
app.use(express.static(frontendPath));

// API Routes
const ticketRoutes = require('./src/routes/tickets');
const statsRoutes = require('./src/routes/stats');

app.use('/api/tickets', ticketRoutes);
app.use('/api', statsRoutes);

// Serve HTML pages
app.get('/', (req, res) => {
    res.sendFile(path.join(frontendPath, 'index.html'));
});

app.get('/admin', (req, res) => {
    res.sendFile(path.join(frontendPath, 'admin.html'));
});

app.get('/database', (req, res) => {
    res.sendFile(path.join(frontendPath, 'database.html'));
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ 
        error: 'Something went wrong!',
        message: err.message 
    });
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({ error: 'Route not found' });
});

// Start server
app.listen(PORT, () => {
    console.log(`\n🚀 Helpdesk Server Running`);
    console.log(`📍 Server: http://localhost:${PORT}`);
    console.log(`📊 API: http://localhost:${PORT}/api`);
    console.log(`\n👤 User Portal: http://localhost:${PORT}`);
    console.log(`🔧 Admin Panel: http://localhost:${PORT}/admin`);
    console.log(`🗄️  Database: http://localhost:${PORT}/database\n`);
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