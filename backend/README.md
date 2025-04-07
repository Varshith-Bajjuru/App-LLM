# React-App-LLM Backend

A Node.js/Express.js backend for a Large Language Model (LLM) application with medical query capabilities.

## Features

- RESTful API endpoints
- WebSocket integration for real-time updates
- MongoDB integration for data persistence
- JWT authentication
- Medical API integration(Hugging face finetunning model)
- Chat history management
- Real-time chat updates

## Tech Stack

- Node.js
- Express.js
- MongoDB
- WebSocket
- JWT
- PubMed API integration

## Project Structure

```
backend/
├── controllers/
│   ├── chatController.js
│   ├── medicalController.js
│   └── authController.js
├── models/
│   ├── chatModel.js
│   └── userModel.js
├── routes/
│   ├── chatRoute.js
│   ├── medicalRoute.js
│   └── authRoute.js
├── middleware/
│   ├── authToken.js
│   └── errorHandler.js
├── config/
│   └── db.js
├── app.js
└── server.js
```

## Setup Instructions

1. Install dependencies:

```bash
npm install
```

2. Create a `.env` file in the root directory with:

```env
MONGODB_URI=your_mongodb_uri
JWT_SECRET=your_jwt_secret
PORT=5000
```

3. Start the development server:

```bash
npm run dev
```

## API Endpoints

### Authentication

- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/refresh` - Refresh token

### Chat

- `GET /api/history` - Get chat history
- `POST /api/save` - Save chat message
- `DELETE /api/delete` - Delete chat session

### Medical

- `POST /api/medical` - Process medical queries
- Returns medical information with references
- Falls back to Gemini API when needed

## WebSocket Events

### Chat Updates

- `CHAT_UPDATE` - Real-time chat updates
- `CHAT_DELETE` - Chat deletion notifications
- `CHAT_NEW` - New chat notifications

## Database Schema

### Chat Model

```javascript
{
  sessionId: String,
  userId: ObjectId,
  messages: [{
    prompt: String,
    response: String,
    timestamp: Date,
    isMedical: Boolean,
    references: Array
  }],
  title: String,
  isMedical: Boolean,
  createdAt: Date,
  updatedAt: Date
}
```

### User Model

```javascript
{
  username: String,
  email: String,
  password: String,
  createdAt: Date
}
```

## Error Handling

- Custom error middleware
- HTTP status codes
- Error logging
- Client-friendly error messages

## Security

- JWT authentication
- Password hashing
- CORS configuration
- Rate limiting
- Input validation

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

MIT License
