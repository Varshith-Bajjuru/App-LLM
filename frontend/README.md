# React-App-LLM Frontend

A modern React-based frontend for a Large Language Model (LLM) application with medical query capabilities.

## Features

- Real-time chat interface with LLM
- Medical query detection and specialized responses
- Chat history management
- WebSocket integration for real-time updates
- Responsive design
- Authentication integration
- Medical reference handling

## Tech Stack

- React.js
- Vite
- WebSocket
- Tailwind CSS
- React Icons

## Project Structure

```
frontend/
├── src/
│   ├── components/
│   │   ├── Chat.jsx
│   │   ├── Sidebar.jsx
│   │   └── Message.jsx
│   ├── utils/
│   │   └── medicalDetector.js
│   ├── App.jsx
│   └── main.jsx
├── public/
└── package.json
```

## Setup Instructions

1. Install dependencies:

```bash
npm install
```

2. Create a `.env` file in the root directory with:

```env
VITE_API_KEY=your_gemini_api_key
```

3. Start the development server:

```bash
npm run dev
```

## Key Components

### App.jsx

- Main application component
- Handles chat state management
- Manages WebSocket connections
- Processes medical queries
- Handles chat history

### Sidebar.jsx

- Displays chat history
- Manages chat sessions
- Handles chat deletion
- Groups chats by date

### Chat.jsx

- Renders chat interface
- Handles message input
- Displays chat messages
- Manages message formatting

### Message.jsx

- Renders individual messages
- Handles medical references
- Formats message content
- Manages message styling

## API Integration

### Medical API

- Detects medical queries
- Provides specialized medical responses
- Handles medical references
- Falls back to Gemini API when needed

### Gemini API

- Handles general queries
- Provides LLM responses
- Manages conversation context
- Handles error cases

## State Management

- Uses React hooks for state management
- Maintains chat history
- Manages active sessions
- Handles real-time updates

## Error Handling

- Graceful fallback to Gemini API
- User-friendly error messages
- WebSocket reconnection
- Session management

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

MIT License
