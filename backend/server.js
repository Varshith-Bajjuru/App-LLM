const app = require("./app");
const http = require("http");
const WebSocket = require("ws");
const jwt = require("jsonwebtoken");
const cookie = require("cookie");
const cors = require("cors");

const PORT = process.env.PORT || 5000;
const server = http.createServer(app);

// WebSocket Server Setup
const wss = new WebSocket.Server({
  server,
  path: "/ws", // Specific WebSocket endpoint
  clientTracking: true, // Enable built-in client tracking
});

// Connection Management
const activeConnections = new Set();
const connectionInterval = 30000; // 30 seconds for ping/pong

// Ping/Pong Interval to check alive connections
const interval = setInterval(() => {
  wss.clients.forEach((ws) => {
    if (!ws.isAlive) {
      console.log("Terminating inactive connection");
      return ws.terminate();
    }
    ws.isAlive = false;
    ws.ping();
  });
}, connectionInterval);

// WebSocket Connection Handler
wss.on("connection", (ws, req) => {
  console.log("New WebSocket connection attempt");

  // 1. Authentication
  try {
    const cookies = cookie.parse(req.headers.cookie || "");
    const token = cookies.accessToken;

    if (!token) {
      throw new Error("No access token provided");
    }

    const decoded = jwt.verify(token, process.env.JWT_ACCESS_TOKEN);
    ws.userId = decoded.id; // Attach user ID to connection
    console.log(`Authenticated connection for user ${decoded.id}`);
  } catch (error) {
    console.log("WebSocket auth failed:", error.message);
    return ws.close(1008, "Unauthorized");
  }

  // 2. Connection Setup
  ws.isAlive = true;
  activeConnections.add(ws);

  // 3. Event Handlers
  ws.on("pong", () => {
    ws.isAlive = true;
    console.log("Received pong from client");
  });

  ws.on("message", (message) => {
    console.log(`Received message from ${ws.userId}:`, message);
    // Add your message handling logic here
  });

  ws.on("error", (error) => {
    console.error(`WebSocket error for user ${ws.userId}:`, error);
  });

  ws.on("close", () => {
    console.log(`Connection closed for user ${ws.userId}`);
    activeConnections.delete(ws);
  });
});

// Cleanup on server close
wss.on("close", () => {
  clearInterval(interval);
  console.log("WebSocket server closed");
});

// Broadcast function for application use
app.locals.broadcastUpdate = (data) => {
  console.log(`Broadcasting to ${wss.clients.size} clients`);

  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      try {
        client.send(
          JSON.stringify({
            type: "CHAT_UPDATE",
            data,
            timestamp: new Date().toISOString(),
          })
        );
      } catch (error) {
        console.error("Broadcast error:", error);
      }
    }
  });
};

// Server Startup
server.listen(PORT, () => {
  console.log(`HTTP server running on port ${PORT}`);
  console.log(`WebSocket server running on ws://localhost:${PORT}/ws`);
});

// Graceful shutdown
process.on("SIGTERM", () => {
  console.log("SIGTERM received - shutting down gracefully");

  // Close all WebSocket connections
  wss.clients.forEach((client) => {
    client.close(1001, "Server shutting down");
  });

  // Close the WebSocket server
  wss.close(() => {
    server.close(() => {
      console.log("Server closed");
      process.exit(0);
    });
  });
});

app.use(
  cors({
    origin: process.env.FRONTEND_URL,
    credentials: true,
  })
);

module.exports = server;
