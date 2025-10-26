# 🎫 Helpdesk System

A modern, easy-to-use helpdesk ticketing system for managing customer support requests with SLA tracking.

![Status](https://img.shields.io/badge/status-active-success.svg)
![License](https://img.shields.io/badge/license-MIT-blue.svg)

---

## ✨ Features

- 📝 **Create & Track Tickets** - Submit support requests with priority levels
- ⏱️ **SLA Monitoring** - Automatic deadline tracking based on ticket priority
- 💬 **Comment System** - Real-time communication between users and support team
- 👨‍💼 **Admin Panel** - Manage and resolve tickets efficiently
- 📊 **Database Viewer** - View all tickets and comments in one place
- 🎨 **Beautiful UI** - Modern, responsive design with smooth animations
- 🔄 **Status Tracking** - Open → In Progress → Resolved → Closed

---

## 🌐 Live Demo

**🎉 Try it now!**

- **User Portal**: https://helpdesk-frontend-s846.onrender.com
- **Admin Panel**: https://helpdesk-frontend-s846.onrender.com/admin.html

> ⚠️ First load may take 30-60 seconds (free tier server wakes up)

---

## 🚀 Run Locally

```bash
# Navigate to backend
cd backend

# Install dependencies
npm install

# Start the server
npm start
```

Open your browser: **http://localhost:3000**

---

## 📱 Pages

- **User Portal** - Submit and track tickets
- **Admin Panel** - Manage all support tickets
- **Database Viewer** - View system data

---

## 🎯 SLA Response Times

| Priority | Response Time |
|----------|--------------|
| 🔴 High | 4 hours |
| 🟡 Medium | 12 hours |
| 🟢 Low | 24 hours |

---

## 🛠️ Usage

### For Users:
1. Open the portal
2. Click "Create New Ticket"
3. Fill in title, description, category, and priority
4. Submit and track your ticket
5. Add comments to communicate with support

### For Admins:
1. Access the admin panel
2. View all tickets with filters
3. Update ticket status
4. Add responses via comments
5. Monitor SLA breaches

---

## 📂 Project Structure

```
helpdesk-system/
│
├── backend/                    # Backend API Server
│   ├── src/
│   │   ├── config/
│   │   │   └── database.js     # Database configuration
│   │   ├── controllers/
│   │   │   ├── ticketController.js
│   │   │   └── commentController.js
│   │   ├── routes/
│   │   │   ├── tickets.js      # Ticket endpoints
│   │   │   └── stats.js        # Statistics endpoints
│   │   └── utils/
│   │       └── slaCalculator.js
│   ├── server.js               # Main server file
│   ├── package.json
│   └── .env
│
└── frontend/                   # Frontend Application
    └── public/
        ├── assets/
        │   ├── css/
        │   │   └── common.css  # Shared styles
        │   └── js/
        │       ├── api.js      # API service
        │       └── utils.js    # Helper functions
        ├── index.html          # User portal
        ├── admin.html          # Admin panel
        └── database.html       # Database viewer
```

---

## 🌐 Deployment

**Live on Render.com** ✨

- Backend API: https://helpdesk-backend-cysl.onrender.com
- Frontend: https://helpdesk-frontend-s846.onrender.com

This application can be deployed to any cloud platform. The system automatically adapts to your environment.

**Recommended Platform:** Render.com (Free tier available)

---

## 📸 Screenshots

### User Portal
Modern interface for creating and tracking support tickets.

### Admin Dashboard
Comprehensive view of all tickets with filtering and management tools.

### Database Viewer
Real-time view of all system data and statistics.

---

## 🎨 Ticket Categories

- 💻 **Technical** - Software bugs and technical issues
- 💰 **Billing** - Payment and subscription questions
- ℹ️ **General** - General inquiries
- ⭐ **Feature Request** - Suggestions for new features

---

## 📊 Status Types

- 🆕 **Open** - New ticket awaiting response
- ⏳ **In Progress** - Currently being worked on
- ✅ **Resolved** - Issue resolved, awaiting confirmation
- 🔒 **Closed** - Ticket completed and closed

---

## 🤝 Contributing

Contributions are welcome! Feel free to:
- Report bugs
- Suggest features
- Submit pull requests

---

## 📝 License

This project is open source and available under the MIT License.

---

## 💡 Support

Need help? Create a ticket in the system or reach out via GitHub issues.

---

## 🎉 Acknowledgments

Built with passion to make customer support easier and more efficient.

---

**Made with ❤️ for better customer support**