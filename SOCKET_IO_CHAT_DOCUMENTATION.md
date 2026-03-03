# Socket.IO Chat System Documentation

## Table of Contents
1. [Overview](#overview)
2. [Architecture](#architecture)
3. [Setup & Installation](#setup--installation)
4. [Authentication & Authorization](#authentication--authorization)
5. [Socket Events](#socket-events)
6. [REST API Endpoints](#rest-api-endpoints)
7. [Database Schema](#database-schema)
8. [Message Flow](#message-flow)
9. [Error Handling](#error-handling)
10. [Security Considerations](#security-considerations)
11. [Troubleshooting](#troubleshooting)
12. [Performance Optimization](#performance-optimization)

---

## Overview

The DigitalDepot webshop implements a real-time bidirectional chat system using Socket.IO (v4.8.3) for communication between regular users and admin staff. The system enables instant messaging, message persistence, and read status tracking.

### Key Features
- **Real-time messaging** between users and admins
- **JWT-based authentication** for secure socket connections
- **Role-based room assignments** (admin room vs individual user rooms)
- **Message persistence** in MySQL database
- **Unread message tracking** with badges and notifications
- **Message history** retrieval from database

### Technology Stack
- **Backend**: Node.js + Express + Socket.IO 4.8.3
- **Frontend**: React + Socket.IO Client 4.8.3
- **Database**: MySQL
- **Authentication**: JWT (JSON Web Tokens)

---

## Architecture

### System Components

```
┌─────────────────────────────────────────────────────────────┐
│                     Frontend (React)                         │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────┐  │
│  │ ChatPanel    │  │AdminChatPanel│  │  Socket Client   │  │
│  │ (User)       │  │ (Admin)      │  │  (socket.io-     │  │
│  │              │  │              │  │   client 4.8.3)  │  │
│  └──────┬───────┘  └──────┬───────┘  └────────┬─────────┘  │
│         │                 │                    │            │
│         └─────────────────┼────────────────────┘            │
│                           │ WebSocket                       │
│         ┌─────────────────▼────────────────────┐            │
│         │   http://localhost:3000              │            │
└─────────┼────────────────────────────────────┬─┘
          │                                    │
          │ Socket Events                      │ REST API
          │                                    │
┌─────────▼────────────────────────────────────▼─┐
│         Backend (Node.js + Express)            │
│  ┌─────────────────────────────────────────┐  │
│  │  Socket.IO Server (v4.8.3)              │  │
│  │  ┌─────────────────────────────────┐    │  │
│  │  │ JWT Authentication Middleware   │    │  │
│  │  │ ┌──────────┐  ┌──────────────┐  │    │  │
│  │  │ │room_admin│  │room_{user_id}│  │    │  │
│  │  │ └──────────┘  └──────────────┘  │    │  │
│  │  └─────────────────────────────────┘    │  │
│  │  ┌─────────────────────────────────┐    │  │
│  │  │ Event Handlers                  │    │  │
│  │  │ • send_message                  │    │  │
│  │  │ • receive_message               │    │  │
│  │  │ • connection                    │    │  │
│  │  │ • disconnect                    │    │  │
│  │  └─────────────────────────────────┘    │  │
│  └─────────────────────────────────────────┘  │
│  ┌─────────────────────────────────────────┐  │
│  │  Express Routes (Admin/User)            │  │
│  │ • POST /user/readmessages               │  │
│  │ • GET /user/messages                    │  │
│  │ • GET /adminRoute/messages              │  │
│  │ • PATCH /adminRoute/readmessages/{id}   │  │
│  │ • DELETE /adminRoute/messages/{id}      │  │
│  └─────────────────────────────────────────┘  │
└──────────────────────┬───────────────────────┘
                       │
                       ▼
┌──────────────────────────────────────────────┐
│      MySQL Database (messages table)         │
│  ┌──────────────────────────────────────┐   │
│  │ • id (PK)                            │   │
│  │ • sender (user_id)                   │   │
│  │ • message (text)                     │   │
│  │ • sentAt (timestamp)                 │   │
│  │ • recipientId (nullable)             │   │
│  │ • unread (boolean)                   │   │
│  └──────────────────────────────────────┘   │
└──────────────────────────────────────────────┘
```

### Room Structure

- **room_admin**: All admin users join this room to receive user messages
- **room_{user_id}**: Each user joins their personal room to receive admin responses

---

## Setup & Installation

### Backend Setup

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Dependencies Required**
   ```json
   {
     "socket.io": "^4.8.3",
     "jsonwebtoken": "^9.0.2",
     "express": "^5.1.0",
     "mysql2": "^3.15.3"
   }
   ```

3. **Initialize Socket.IO in server.js**
   ```javascript
   const express = require('express');
   const http = require('http');
   const socket = require('./util/socket');
   
   const app = express();
   const server = http.createServer(app);
   const io = socket.init(server);
   
   server.listen(3000, () => {
     console.log('Server listening on port 3000');
   });
   ```

4. **Backend Socket Configuration** (`backend/util/socket.js`)
   - Location: `backend/util/socket.js`
   - Handles JWT verification
   - Manages room assignments
   - Processes send_message events
   - Saves messages to database

### Frontend Setup

1. **Install dependencies**
   ```bash
   npm install socket.io-client
   ```

2. **Socket Client Initialization** (`frontend/src/assets/util/socket.js`)
   ```javascript
   import { io } from 'socket.io-client';
   
   const URL = 'http://localhost:3000';
   export const socket = io(URL, {
     withCredentials: true,
     autoConnect: false,
   });
   ```
   - `withCredentials: true` allows JWT token passing via cookies
   - `autoConnect: false` enables manual connection control

3. **Connection with Auth Token**
   ```javascript
   socket.auth = {
     token: localStorage.getItem('token'),
   };
   socket.connect();
   ```

---

## Authentication & Authorization

### JWT Authentication Flow

1. **User logs in** → JWT token is generated and stored in localStorage
2. **User/Admin connects to socket** → Token passed via `socket.auth`
3. **Server middleware validates token** → Decodes JWT using `process.env.SECRET`
4. **Role check** → Determines room assignment
5. **Socket is authenticated** → User can send/receive messages

### Token Structure

```javascript
// JWT Payload
{
  id: 123,           // User ID
  role: 'user',      // 'user' or 'admin'
  email: 'user@example.com',
  iat: 1234567890,   // Issued at
  exp: 1234654290    // Expiration time
}
```

### Room Assignment

```javascript
// In backend/util/socket.js middleware
if (socket.user.role === 'admin') {
  socket.join('room_admin');
} else {
  socket.join(`room_${socket.user.id}`);
}
```

### Error Cases

- **No token**: Returns "Nincs token" error
- **Expired token**: Returns "Lejárt a token!" error
- **Invalid token**: JWT verification fails, connection rejected

---

## Socket Events

### Event: send_message

**Emitted by**: Client (User or Admin)

**Payload for Users**:
```javascript
{
  text: "Help message from user"
}
```

**Payload for Admins**:
```javascript
{
  text: "Response message",
  recipientId: 123  // Target user ID (required)
}
```

**Server Processing**:
1. Validates user role
2. Creates message object with timestamp
3. Broadcasts to appropriate room(s)
4. Saves to database

**Example - User Sending Message**:
```javascript
socket.emit('send_message', 'I need help with my order');
```

**Example - Admin Sending Message**:
```javascript
socket.emit('send_message', {
  text: 'Your order is processing',
  recipientId: 42
});
```

### Event: receive_message

**Emitted by**: Server  
**Received by**: Client

**Message Object**:
```javascript
{
  text: "Message content",
  sender: 123,        // User ID of sender
  date: 1678900000,   // Timestamp in milliseconds
  recipientId: 456    // Only present for admin-to-user messages (optional)
}
```

**Frontend Handler**:
```javascript
socket.on('receive_message', (message) => {
  setMessages(prevMessages => [...prevMessages, message]);
});
```

### Event: connection

**Emitted by**: Server  
**Triggered**: When socket connects successfully

**Use Case**: Logging, analytics, initial state setup

### Event: disconnect

**Emitted by**: Server  
**Triggered**: When socket disconnects

**Cleanup**: Remove socket from rooms, update UI state

---

## REST API Endpoints

### User Endpoints

#### GET /user/messages
**Description**: Retrieve all messages for the authenticated user

**Headers**:
```
Authorization: Bearer {JWT_TOKEN}
```

**Response**:
```json
{
  "result": "success",
  "data": [
    {
      "id": 1,
      "sender": 123,
      "message": "Help needed",
      "sentAt": "2024-01-15T10:30:00Z",
      "recipientId": null,
      "unread": true
    },
    {
      "id": 2,
      "sender": 1,
      "message": "How can we help?",
      "sentAt": "2024-01-15T10:31:00Z",
      "recipientId": 123,
      "unread": false
    }
  ]
}
```

#### POST /user/readmessages
**Description**: Mark all unread messages as read for the authenticated user

**Headers**:
```
Authorization: Bearer {JWT_TOKEN}
```

**Response**:
```json
{
  "result": "success",
  "affectedRows": 3
}
```

---

### Admin Endpoints

#### GET /adminRoute/messages
**Description**: Retrieve all messages grouped by user

**Headers**:
```
Authorization: Bearer {ADMIN_JWT_TOKEN}
```

**Response**:
```json
{
  "result": "success",
  "data": [
    {
      "id": 123,
      "unread": true,
      "messages": [
        {
          "text": "Help please",
          "sender": 123,
          "recipientId": null,
          "date": "2024-01-15T10:30:00Z"
        },
        {
          "text": "We're here to help",
          "sender": 1,
          "recipientId": 123,
          "date": "2024-01-15T10:31:00Z"
        }
      ]
    }
  ]
}
```

#### PATCH /adminRoute/readmessages/{userId}
**Description**: Mark all unread messages from a specific user as read

**Headers**:
```
Authorization: Bearer {ADMIN_JWT_TOKEN}
```

**URL Parameters**:
- `userId` (integer): User ID to mark as read

**Response**:
```json
{
  "result": "success",
  "affectedRows": 2
}
```

#### DELETE /adminRoute/messages/{userId}
**Description**: Delete all messages for a specific user

**Headers**:
```
Authorization: Bearer {ADMIN_JWT_TOKEN}
```

**URL Parameters**:
- `userId` (integer): User ID whose messages to delete

**Response**:
```json
{
  "result": "success"
}
```

---

## Database Schema

### messages Table

```sql
CREATE TABLE messages (
  id INT PRIMARY KEY AUTO_INCREMENT,
  sender INT NOT NULL,
  message TEXT NOT NULL,
  sentAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  recipientId INT,
  unread BOOLEAN DEFAULT TRUE,
  
  FOREIGN KEY (sender) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (recipientId) REFERENCES users(id) ON DELETE CASCADE,
  INDEX (sender),
  INDEX (recipientId),
  INDEX (sentAt),
  INDEX (unread)
);
```

### Query Examples

**Get all messages for a user**:
```sql
SELECT * FROM messages 
WHERE sender = ? OR recipientId = ?
ORDER BY sentAt DESC;
```

**Get unread messages**:
```sql
SELECT * FROM messages 
WHERE recipientId = ? AND unread = 1
ORDER BY sentAt DESC;
```

**Mark messages as read**:
```sql
UPDATE messages 
SET unread = 0 
WHERE recipientId = ? AND unread = 1;
```

**Get conversation between user and admin**:
```sql
SELECT * FROM messages 
WHERE (sender = ? AND recipientId IS NOT NULL) 
   OR (sender != ? AND recipientId = ?)
ORDER BY sentAt ASC;
```

---

## Message Flow

### User → Admin Message Flow

```
1. User types message in ChatPanel
   ↓
2. User clicks "Send" button
   ↓
3. Frontend emits 'send_message' event with text only
   {text: "Help message"}
   ↓
4. Backend receives event in send_message handler
   ↓
5. Backend checks role == 'user'
   ↓
6. Backend creates message object with sender ID and timestamp
   ↓
7. Backend broadcasts to 'room_admin' (all admins receive)
   ↓
8. Backend emits back to sender (user sees their own message)
   ↓
9. Backend saves message to database with recipientId = NULL
   ↓
10. Message appears in user's ChatPanel and all admin's AdminChatPanel
```

### Admin → User Message Flow

```
1. Admin types message in AdminChatPanel
   ↓
2. Admin selects target user
   ↓
3. Admin clicks "Send" button
   ↓
4. Frontend emits 'send_message' event with text and recipientId
   {text: "Response", recipientId: 123}
   ↓
5. Backend receives event in send_message handler
   ↓
6. Backend checks role == 'admin'
   ↓
7. Backend checks recipientId exists
   ↓
8. Backend creates message object with sender ID, recipient ID, and timestamp
   ↓
9. Backend broadcasts to specific user room 'room_123'
   ↓
10. Backend emits back to admin (confirms message sent)
    ↓
11. Backend saves message to database with recipientId = user ID
    ↓
12. Message appears in target user's ChatPanel
    ↓
13. User unread badge increases (if ChatPanel not open)
```

---

## Error Handling

### Connection Errors

**Error: "Nincs token"**
- **Cause**: No JWT token provided during socket connection
- **Solution**: Ensure token is in localStorage and passed via socket.auth
- **Code**:
```javascript
socket.auth = { token: localStorage.getItem('token') };
socket.connect();
```

**Error: "Lejárt a token!"**
- **Cause**: JWT token has expired
- **Solution**: User must login again to get new token
- **Code**:
```javascript
socket.on('connect_error', (error) => {
  if (error.message === 'Lejárt a token!') {
    // Redirect to login
    localStorage.removeItem('token');
    window.location.href = '/login';
  }
});
```

**Error: Message not saved to database**
- **Cause**: Database connection issue or SQL error
- **Log**: "Nem sikerült menteni egy üzenetet" in backend console
- **Solution**: Check database connection, verify table structure, check disk space

---

## Security Considerations

### 1. JWT Token Management
- **Never expose token** in logs or error messages
- **Store token securely** in httpOnly cookies (if possible) instead of localStorage
- **Implement token refresh** mechanism for long sessions
- **Validate token expiration** on both backend and frontend

### 2. Input Validation
- **Sanitize message text** before saving to database
- **Validate recipientId** exists and belongs to valid user
- **Limit message length** to prevent abuse

```javascript
// Example: Validate message length
const MAX_MESSAGE_LENGTH = 1000;
if (data.text.length > MAX_MESSAGE_LENGTH) {
  return socket.emit('error', 'Message too long');
}
```

### 3. SQL Injection Prevention
- **Use parameterized queries** (already implemented with ?)
- **Never concatenate user input** directly into SQL

### 4. Cross-Site Scripting (XSS) Prevention
- **Escape HTML** when displaying messages in React
- **React automatically escapes** by default, but verify in custom rendering

### 5. Rate Limiting
- **Implement per-user rate limiting** on send_message
- **Prevent spam** by limiting messages per minute

```javascript
// Example rate limiter
const userMessageCounts = {};
const LIMIT = 10; // messages per minute

socket.on('send_message', (data) => {
  const userId = socket.user.id;
  const now = Date.now();
  
  if (!userMessageCounts[userId]) {
    userMessageCounts[userId] = [];
  }
  
  // Remove old timestamps
  userMessageCounts[userId] = userMessageCounts[userId]
    .filter(time => now - time < 60000);
  
  if (userMessageCounts[userId].length >= LIMIT) {
    return socket.emit('error', 'Rate limit exceeded');
  }
  
  userMessageCounts[userId].push(now);
  // Process message...
});
```

### 6. CORS Configuration
- **Restrict origin** to trusted domain only
- **Review credentials** setting carefully

```javascript
// Current configuration allows localhost:5173
cors: {
  origin: 'http://localhost:5173',  // Update for production!
  methods: ['GET', 'POST'],
  credentials: true,
}
```

### 7. Data Privacy
- **Implement message encryption** for sensitive conversations
- **Log access** to admin messages
- **Implement data retention policies** (delete old messages)

---

## Troubleshooting

### Socket Connection Issues

**Problem**: WebSocket connection hangs or fails

**Diagnosis**:
```javascript
socket.on('connect', () => console.log('Connected!'));
socket.on('connect_error', (error) => console.log('Error:', error));
socket.on('disconnect', () => console.log('Disconnected')); 
```

**Solutions**:
- Check server is running on port 3000
- Verify firewall allows WebSocket connections
- Check browser console for CORS errors
- Ensure JWT token is valid

### Messages Not Persisting

**Problem**: Messages sent but not saved to database

**Diagnosis**:
1. Check database connection in backend
2. Verify messages table exists
3. Check database user has INSERT privileges

**Solution**:
```javascript
// Verify connection
const db = require('./util/database');
db.execute('SELECT 1').then(() => console.log('DB OK'));
```

### Unread Badge Not Updating

**Problem**: New message count doesn't increase

**Diagnosis**:
1. Check `unread` field is being set to 1 on new messages
2. Verify frontend is listening to 'receive_message' event
3. Check localStorage has valid token

**Solution**:
```javascript
// Verify backend is setting unread
const [result] = await db.execute(
  'SELECT unread FROM messages WHERE id = ? LIMIT 1',
  [messageId]
);
console.log('Unread status:', result[0].unread);
```

### Admin Not Receiving User Messages

**Problem**: Admin's AdminChatPanel doesn't show user messages

**Diagnosis**:
1. Verify admin joined 'room_admin' successfully
2. Check admin JWT has role='admin'
3. Verify send_message handler checks role correctly

**Solution**:
```javascript
// Debug: Check room membership
io.on('connection', (socket) => {
  console.log('User role:', socket.user.role);
  console.log('Rooms:', socket.rooms);
  // Should show: ['room_admin'] or ['room_123', ...]
});
```

### Message Timestamps Incorrect

**Problem**: Messages show wrong timestamp

**Diagnosis**:
- Check server timezone
- Verify database timezone settings
- Check frontend timezone conversion

**Solution**:
```javascript
// Use ISO strings for consistency
const message = {
  ...data,
  date: new Date().toISOString()
};
```

---

## Performance Optimization

### 1. Message Pagination
Implement pagination for large message histories:

```javascript
// GET /user/messages?page=1&limit=50
const page = req.query.page || 1;
const limit = req.query.limit || 50;
const offset = (page - 1) * limit;

const [rows] = await db.execute(
  'SELECT * FROM messages WHERE sender = ? OR recipientId = ? ORDER BY sentAt DESC LIMIT ? OFFSET ?',
  [userId, userId, limit, offset]
);
```

### 2. Database Indexing
Indexes improve query performance:

```sql
CREATE INDEX idx_sender ON messages(sender);
CREATE INDEX idx_recipient ON messages(recipientId);
CREATE INDEX idx_unread ON messages(unread);
CREATE INDEX idx_sentat ON messages(sentAt);
```

### 3. Connection Pooling
Use database connection pooling:

```javascript
const pool = mysql.createPool({
  connectionLimit: 10,
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME
});
```

### 4. Message Caching
Cache frequently accessed data:

```javascript
// Simple in-memory cache
const messageCache = new Map();

socket.on('send_message', async (data) => {
  const cacheKey = `user_${socket.user.id}`;
  messageCache.delete(cacheKey); // Invalidate cache
  // Process message...
});
```

### 5. Lazy Loading
Load messages only when needed:

```javascript
// Load only recent 20 messages, load more on scroll
const [rows] = await db.execute(
  'SELECT * FROM messages WHERE sender = ? OR recipientId = ? ORDER BY sentAt DESC LIMIT 20',
  [userId, userId]
);
```

### 6. Batch Operations
Send multiple messages in one database call:

```javascript
// For admin broadcast to multiple users
const messageIds = [1, 2, 3, 4, 5];
await db.execute(
  'INSERT INTO message_read (message_id, admin_id) VALUES ' +
  messageIds.map(() => '(?, ?)').join(','),
  messageIds.flatMap(id => [id, adminId])
);
```

---

## Configuration Reference

### Environment Variables (.env)

```env
# Server
PORT=3000
IP=localhost

# Database
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=password
DB_NAME=digitaldepot

# JWT
SECRET=your_jwt_secret_key_here

# Frontend URL (CORS)
FRONTEND_URL=http://localhost:5173
```

### Socket.IO Config

**Current Configuration**:
```javascript
{
  cors: {
    origin: 'http://localhost:5173',
    methods: ['GET', 'POST'],
    credentials: true,
  }
}
```

**Production Configuration** (recommended):
```javascript
{
  cors: {
    origin: process.env.FRONTEND_URL,
    methods: ['GET', 'POST'],
    credentials: true,
  },
  transports: ['websocket'],  // Use WebSocket only
  maxHttpBufferSize: 1e6,      // 1MB max message size
  pingInterval: 25000,
  pingTimeout: 60000,
}
```

---

## Related Files

- **Backend Socket**: `backend/util/socket.js`
- **Frontend Socket Client**: `frontend/src/assets/util/socket.js`
- **User Chat Component**: `frontend/src/components/ChatPanel.jsx`
- **Admin Chat Component**: `frontend/src/components/AdminChatPanel.jsx`
- **User Routes**: `backend/routes/userRouter.js` (messages endpoints)
- **Admin Routes**: `backend/routes/adminRouter.js` (admin messages endpoints)
- **Server**: `backend/server.js` (Socket.IO initialization)

---

## Version History

- **v1.0** (Current): Initial Socket.IO chat system implementation
  - User-to-admin messaging
  - Message persistence
  - Unread tracking
  - Real-time notifications

---

## Support & Contributions

For questions or issues with the chat system, please refer to the troubleshooting section or create an issue in the repository.