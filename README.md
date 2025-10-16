# 🎫 Helpdesk Ticketing System

A full-featured helpdesk system with ticket management, SLA tracking, and real-time comments. Built with HTML, CSS, JavaScript, Node.js, Express, and SQLite.

## ✨ Features

### User Portal
- **Animated Welcome Screen** - Smooth welcome animation on page load
- **Full-Screen Animated Popup** - Beautiful 3D animated popup for ticket creation
- **Ticket Creation** - Submit support tickets with title, description, category, and priority
- **Ticket Tracking** - View all your submitted tickets with status updates
- **Real-time SLA Status** - Visual indicators for SLA compliance (On Track, At Risk, Breached)
- **Comments System** - Add and view comments on tickets

### Admin Panel
- **Dashboard Statistics** - Overview of total tickets, status breakdown, and SLA breaches
- **Advanced Filtering** - Filter tickets by status, priority, category, and SLA status
- **Ticket Management** - Update ticket status and resolve issues
- **Comments & Responses** - Add admin responses and internal notes
- **Real-time Updates** - Live ticket information with refresh capability

### Backend Features
- **RESTful API** - Complete API for ticket and comment management
- **SQLite Database** - Lightweight, file-based database (no installation required)
- **Automatic SLA Calculation** - Priority-based SLA due dates:
  - High Priority: 4 hours
  - Medium Priority: 12 hours
  - Low Priority: 24 hours
- **Activity Logging** - Automatic system comments for status changes

## 📁 Project Structure

```
helpdesk-system/
├── server.js           # Node.js/Express backend server
├── package.json        # Dependencies configuration
├── index.html          # User portal (frontend)
├── admin.html          # Admin panel (frontend)
├── helpdesk.db         # SQLite database (auto-created)
└── README.md           # This file
```

## 🚀 Installation & Setup

### Prerequisites
- Node.js (v14 or higher)
- npm (comes with Node.js)

### Step 1: Install Dependencies

```bash
npm install
```

This will install:
- express (Web framework)
- sqlite3 (Database)
- cors (Cross-origin resource sharing)

### Step 2: Start the Server

```bash
npm start
```

Or for development with auto-restart:

```bash
npm run dev
```

You should see:
```
🚀 Helpdesk Server Running
📍 Server: http://localhost:3000

👤 User Portal: Open index.html in browser
🔧 Admin Panel: Open admin.html in browser
```

### Step 3: Open the Application

1. **User Portal**: Open `index.html` in your web browser
2. **Admin Panel**: Open `admin.html` in your web browser

⚠️ **Important**: Make sure the server is running before opening the HTML files!

## 🎨 User Interface Guide

### User Portal (index.html)

1. **Welcome Animation**: Enjoy the animated welcome screen on page load
2. **Create Ticket**: Click "📝 Create New Ticket" button
   - Fill in ticket details (title, description, category, priority)
   - Submit to create the ticket
   - Experience the smooth full-screen popup animation
3. **View Tickets**: All your tickets are displayed as cards
4. **Click on Ticket**: View details and add comments
5. **SLA Indicators**:
   - 🟢 Green: On track
   - 🟡 Yellow: At risk (< 4 hours remaining)
   - 🔴 Red: SLA breached

### Admin Panel (admin.html)

1. **Dashboard**: View statistics at the top
   - Total tickets
   - Open tickets
   - In Progress
   - Resolved
   - SLA Breaches
2. **Filters**: Use dropdowns to filter tickets
3. **Manage Tickets**: Click on any ticket to:
   - View full details
   - Update status (Open → In Progress → Resolved → Closed)
   - Add admin comments/responses
4. **Refresh**: Click 🔄 to reload ticket data

## 🔌 API Endpoints

### Tickets

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/tickets` | Get all tickets |
| GET | `/api/tickets/:id` | Get single ticket |
| POST | `/api/tickets` | Create new ticket |
| PUT | `/api/tickets/:id` | Update ticket status |
| DELETE | `/api/tickets/:id` | Delete ticket |

### Comments

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/tickets/:id/comments` | Get ticket comments |
| POST | `/api/tickets/:id/comments` | Add comment |

### Statistics

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/stats` | Get dashboard statistics |

## 📊 Database Schema

### Tickets Table
```sql
- id (INTEGER, PRIMARY KEY)
- title (TEXT)
- description (TEXT)
- category (TEXT)
- priority (TEXT)
- status (TEXT)
- created_at (DATETIME)
- updated_at (DATETIME)
- sla_due_date (DATETIME)
```

### Comments Table
```sql
- id (INTEGER, PRIMARY KEY)
- ticket_id (INTEGER, FOREIGN KEY)
- comment (TEXT)
- user_type (TEXT) -- 'user', 'admin', or 'system'
- created_at (DATETIME)
```

## 🎯 SLA Rules

The system automatically calculates SLA due dates based on ticket priority:

- **High Priority**: 4 hours from creation
- **Medium Priority**: 12 hours from creation
- **Low Priority**: 24 hours from creation

SLA status indicators:
- **On Track** (Green): More than 4 hours remaining
- **At Risk** (Yellow): Less than 4 hours remaining
- **Breached** (Red): Past due date

## 🎭 Animation Features

### Welcome Animation
- Fade-in effect with scale transformation
- Automatically dismisses after 2.5 seconds
- Smooth gradient background

### Popup Animations
- 3D rotate transformation on open
- Scale animation from 0.7 to 1.0
- Smooth fade-in overlay
- Rotate animation on close button hover

### Card Interactions
- Hover effects with translate and shadow
- Smooth transitions on all interactive elements

## 🛠️ Troubleshooting

### Server won't start
- Ensure Node.js is installed: `node --version`
- Check if port 3000 is available
- Run `npm install` to ensure dependencies are installed

### HTML files show "Error loading tickets"
- Make sure the server is running (`npm start`)
- Check browser console for errors

### Database issues
- Delete `helpdesk.db` file and restart server (will create fresh database)
- Check file permissions in the project directory

### CORS errors
- Ensure you're opening HTML files directly in the browser
- Check that the server is running on localhost:3000

## 🔧 Customization

### Change Port
Edit `server.js`:
```javascript
const PORT = 3000; // Change to your desired port
```

### Modify SLA Times
Edit the `calculateSLADueDate` function in `server.js`:
```javascript
case 'High':
    hours = 4; // Change to desired hours
    break;
```

### Add Categories
Edit both `index.html` and `admin.html`:
```html
<option value="YourCategory">Your Category</option>
```

### Customize Colors
Edit the CSS gradient in HTML files:
```css
background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
```

## 📝 Example Usage

### Create a Ticket (API)
```bash
curl -X POST http://localhost:3000/api/tickets \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Cannot login to account",
    "description": "Getting error message when trying to login",
    "category": "Technical",
    "priority": "High"
  }'
```

### Get All Tickets (API)
```bash
curl http://localhost:3000/api/tickets
```

### Add Comment (API)
```bash
curl -X POST http://localhost:3000/api/tickets/1/comments \
  -H "Content-Type: application/json" \
  -d '{
    "comment": "We are looking into this issue",
    "user_type": "admin"
  }'
```

## 🔒 Security Notes

This is a basic implementation for demonstration purposes. For production use, consider:

- Add user authentication (JWT, sessions)
- Implement role-based access control
- Add input validation and sanitization
- Use HTTPS
- Implement rate limiting
- Add CSRF protection
- Sanitize user inputs to prevent XSS

## 📈 Future Enhancements

- Email notifications for ticket updates
- File attachment support
- Advanced search functionality
- Ticket assignment to specific agents
- Custom SLA rules per category
- Dashboard analytics and reports
- Export tickets to CSV/PDF
- Multi-language support

## 🤝 Contributing

Feel free to fork this project and submit pull requests for improvements!

## 📄 License

MIT License - Free to use and modify

## 💡 Support

If you encounter any issues:
1. Check the troubleshooting section
2. Review the browser console for errors
3. Ensure all dependencies are installed
4. Verify the server is running

