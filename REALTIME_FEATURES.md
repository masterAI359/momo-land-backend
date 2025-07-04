# Real-time Features Documentation

This document describes the real-time features implemented in the blog system using WebSockets.

## Features

### 1. Real-time Post Creation
- New posts appear instantly on the blogs listing page for all connected users
- Toast notifications inform users when new posts are created
- Automatic pagination updates

### 2. Real-time Like/Unlike
- Like counts update instantly across all connected users
- Works on both the blogs listing page and individual post pages
- Visual feedback with heart icon animations

### 3. Real-time Comments
- New comments appear instantly on individual post pages
- Comment counts update on the blogs listing page
- Toast notifications for new comments

### 4. Connection Status Indicators
- Real-time connection status shown with WiFi icons
- Green icon = Connected, Red icon = Disconnected
- Automatic reconnection attempts

## Technical Implementation

### Frontend (Next.js)

#### WebSocket Client Service (`lib/socket.ts`)
- Singleton service for managing WebSocket connections
- Automatic authentication using JWT tokens
- Reconnection logic with exponential backoff
- Event listeners for blog post events

#### Authentication Integration (`lib/auth.tsx`)
- Automatic WebSocket connection on login
- Automatic disconnection on logout
- Token-based authentication

#### Real-time Pages
- `app/blogs/page.tsx` - Blog listing with real-time updates
- `app/blogs/[id]/page.tsx` - Individual post with real-time likes/comments
- `app/post/page.tsx` - Post creation with connection status

#### Components
- `components/comment-form.tsx` - Real-time comment submission

### Backend (Node.js + Express)

#### WebSocket Server (`src/socket/`)
- `handlers.js` - WebSocket event handlers
- `socketService.js` - Service for emitting events from routes

#### Real-time Events
- `join-blog-room` - Join global blog updates room
- `leave-blog-room` - Leave global blog updates room
- `join-post-room` - Join specific post updates room
- `leave-post-room` - Leave specific post updates room

#### Emitted Events
- `new-post` - When a new post is created
- `post-liked` - When a post is liked/unliked
- `new-comment` - When a new comment is added

#### API Routes with Real-time (`src/routes/posts.js`)
- POST `/posts` - Creates post and emits `new-post` event
- POST `/posts/:id/like` - Likes post and emits `post-liked` event
- POST `/posts/:id/comments` - Adds comment and emits `new-comment` event

## Environment Variables

Add these to your `.env` file:

```env
# WebSocket Configuration
NEXT_PUBLIC_API_URL=http://localhost:3001

# Server Configuration
PORT=3001
FRONTEND_URL=http://localhost:3000

# JWT for WebSocket authentication
JWT_SECRET=your-jwt-secret-here
```

## Usage

### For Users
1. **Login** - WebSocket connection is established automatically
2. **Browse blogs** - See real-time updates with connection status indicator
3. **View posts** - Get live updates for likes and comments
4. **Create posts** - Posts appear instantly for all users
5. **Like posts** - See immediate feedback and updates
6. **Add comments** - Comments appear instantly

### For Developers

#### Adding New Real-time Features
1. Add event handlers in `src/socket/handlers.js`
2. Emit events from API routes using `socketService.emitToRoom()`
3. Add event listeners in frontend components
4. Update the WebSocket client service if needed

#### Testing Real-time Features
1. Open multiple browser windows/tabs
2. Login with different users
3. Perform actions (create posts, like, comment)
4. Verify updates appear instantly in all windows

## Architecture

```
Frontend (Next.js)
├── lib/socket.ts (WebSocket client)
├── lib/auth.tsx (Authentication + WebSocket)
├── pages/ (Real-time UI components)
└── components/ (Reusable real-time components)

Backend (Node.js + Express)
├── src/socket/handlers.js (WebSocket handlers)
├── src/socket/socketService.js (Event emission service)
├── src/routes/ (API routes with real-time events)
└── src/server.js (WebSocket server setup)
```

## Benefits

1. **Enhanced User Experience** - Instant updates without page refreshes
2. **Real-time Collaboration** - Multiple users can interact simultaneously
3. **Live Feedback** - Immediate visual feedback for user actions
4. **Connection Awareness** - Users know when they're connected
5. **Automatic Reconnection** - Handles network interruptions gracefully

## Future Enhancements

- Real-time user presence indicators
- Live editing of posts
- Real-time notifications system
- WebSocket-based chat integration
- Real-time analytics dashboard 