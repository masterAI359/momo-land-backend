# momoLand Backend API

Backend API for momoLand - Live Chat Experience Sharing Platform

## Features

- 🔐 JWT Authentication
- 📝 Blog Posts Management
- 💬 Real-time Chat Rooms
- 👥 User Management
- 🚨 Reporting System
- 📊 Popular Rankings
- 🔒 Rate Limiting & Security

## Tech Stack

- **Framework**: Express.js
- **Database**: PostgreSQL with Prisma ORM
- **Real-time**: Socket.IO
- **Authentication**: JWT
- **Validation**: express-validator
- **Security**: Helmet, CORS, Rate Limiting

## Setup Instructions

### Prerequisites

- Node.js 18+ 
- PostgreSQL 14+
- npm or yarn

### Installation

1. **Clone and install dependencies**
\`\`\`bash
git clone <repository-url>
cd momo-land-backend
npm install
\`\`\`

2. **Environment Setup**
\`\`\`bash
cp .env.example .env
# Edit .env with your database credentials and JWT secret
\`\`\`

3. **Database Setup**
\`\`\`bash
# Generate Prisma client
npm run db:generate

# Push schema to database
npm run db:push

# Seed database with sample data
npm run db:seed
\`\`\`

4. **Start Development Server**
\`\`\`bash
npm run dev
\`\`\`

The server will start on `http://localhost:3001`

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user
- `POST /api/auth/logout` - Logout user

### Posts
- `GET /api/posts` - Get all posts (with pagination)
- `GET /api/posts/ranking` - Get popular posts ranking
- `GET /api/posts/:id` - Get single post
- `POST /api/posts` - Create new post (auth required)
- `POST /api/posts/:id/like` - Like/unlike post (auth required)
- `POST /api/posts/:id/comments` - Add comment (auth required)

### Chat
- `GET /api/chat/rooms` - Get all chat rooms (auth required)
- `POST /api/chat/rooms` - Create chat room (auth required)
- `GET /api/chat/rooms/:id` - Get room details (auth required)
- `POST /api/chat/rooms/:id/join` - Join room (auth required)
- `POST /api/chat/rooms/:id/leave` - Leave room (auth required)

### Users
- `GET /api/users/profile` - Get user profile (auth required)
- `GET /api/users/posts` - Get user's posts (auth required)

### Reports
- `POST /api/reports` - Submit report (auth required)
- `GET /api/reports/my-reports` - Get user's reports (auth required)

## Socket.IO Events

### Client to Server
- `join-room` - Join a chat room
- `send-message` - Send message to room
- `leave-room` - Leave chat room

### Server to Client
- `room-joined` - Successfully joined room
- `new-message` - New message in room
- `user-joined` - User joined room
- `user-left` - User left room
- `error` - Error occurred

## Database Schema

### Users
- Unique nicknames and emails
- Optional password (for guest users)
- Profile information and stats

### Posts
- Blog posts with categories
- Like and comment system
- View tracking
- Full-text search support

### Chat System
- Rooms with different atmospheres
- Real-time messaging
- Member management
- Online status tracking

### Reports
- User reporting system
- Multiple report types
- Status tracking

## Sample Data

The seed script creates:
- 5 sample users
- 5 blog posts with various categories
- 4 chat rooms with different atmospheres
- Sample messages, comments, and likes
- Realistic engagement data

## Development

### Database Commands
\`\`\`bash
npm run db:generate    # Generate Prisma client
npm run db:push        # Push schema changes
npm run db:seed        # Seed with sample data
npm run db:reset       # Reset and reseed database
npm run db:studio      # Open Prisma Studio
\`\`\`

### Environment Variables
\`\`\`env
DATABASE_URL="postgresql://username:password@localhost:5432/momo_land_db"
JWT_SECRET="your-super-secret-jwt-key-here"
JWT_EXPIRES_IN="7d"
PORT=3001
NODE_ENV="development"
FRONTEND_URL="http://localhost:3000"
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
\`\`\`

## Security Features

- JWT token authentication
- Password hashing with bcrypt
- Rate limiting on API endpoints
- CORS protection
- Helmet security headers
- Input validation and sanitization
- SQL injection prevention via Prisma

## Production Deployment

1. Set `NODE_ENV=production`
2. Use strong JWT secret
3. Configure PostgreSQL connection
4. Set up SSL/TLS
5. Configure reverse proxy (nginx)
6. Set up monitoring and logging

## API Response Format

### Success Response
\`\`\`json
{
  "message": "Success message",
  "data": { ... },
  "pagination": { ... } // for paginated endpoints
}
\`\`\`

### Error Response
\`\`\`json
{
  "error": "Error type",
  "message": "Error description",
  "details": [ ... ] // validation errors
}
\`\`\`

## Contributing

1. Fork the repository
2. Create feature branch
3. Make changes with tests
4. Submit pull request

## License

MIT License - see LICENSE file for details
