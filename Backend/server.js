const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const dotenv = require("dotenv");
const path = require("path");
const helmet = require("helmet");
const morgan = require("morgan");
const http = require("http");
const WebSocket = require("ws");
const rateLimit = require("express-rate-limit");

dotenv.config();
// Route imports
const userRoutes = require("./routes/userRoutes");
const productRoutes = require("./routes/productRoutes");
const cartRoutes = require("./routes/cartRoutes");
const orderRoutes = require("./routes/orderRoutes");
const paymentRoutes = require("./routes/paymentRoutes");

const app = express();

const server = http.createServer(app);

// WebSocket Server
const wss = new WebSocket.Server({ server });

// Store client connections with user mapping
const clients = new Map();
// Security middleware
app.use(helmet());
app.use(
  cors({
    origin: process.env.FRONTEND_URL,
    credentials: true,
  })
);

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
});
app.use("/api/", limiter);

// Logging
app.use(morgan("combined"));

// Body parsing middleware
app.use(
  "/api/payment/stripe/webhook",
  express.raw({ type: "application/json" })
);

// Middleware
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    credentials: true,
  })
);
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// WebSocket connection handler
wss.on("connection", (ws, req) => {
  console.log("New WebSocket client connected");

  ws.isAlive = true;
  ws.on("pong", () => {
    ws.isAlive = true;
  });

  // Handle client authentication and messages
  ws.on("message", (message) => {
    try {
      const data = JSON.parse(message);

      if (data.type === "authenticate" && data.userId) {
        // Map user ID to WebSocket connection
        clients.set(data.userId, ws);
        ws.userId = data.userId;
        console.log(`User ${data.userId} authenticated for real-time updates`);

        ws.send(
          JSON.stringify({
            type: "authenticated",
            message: "Connected to real-time payment updates",
          })
        );
      }
    } catch (error) {
      console.error("WebSocket message error:", error);
    }
  });

  ws.on("close", () => {
    // Remove client from map when disconnected
    if (ws.userId) {
      clients.delete(ws.userId);
      console.log(`User ${ws.userId} disconnected from real-time updates`);
    }
  });

  ws.on("error", (error) => {
    console.error("WebSocket connection error:", error);
  });
});

// Heartbeat to keep connections alive
const interval = setInterval(() => {
  wss.clients.forEach((ws) => {
    if (ws.isAlive === false) return ws.terminate();

    ws.isAlive = false;
    ws.ping();
  });
}, 30000);

wss.on("close", () => {
  clearInterval(interval);
});

// Function to broadcast payment updates to specific user
const broadcastPaymentUpdate = (userId, paymentData) => {
  const client = clients.get(userId);
  if (client && client.readyState === WebSocket.OPEN) {
    client.send(
      JSON.stringify({
        type: "payment_update",
        data: paymentData,
      })
    );
    console.log(`Payment update sent to user ${userId}:`, paymentData.status);
  }
};

// Make broadcast function available globally
global.broadcastPaymentUpdate = broadcastPaymentUpdate;

// Routes
app.use("/api/users", userRoutes);
app.use("/api/products", productRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/payment", paymentRoutes);

// MongoDB connection
mongoose
  .connect(
    process.env.MONGODB_URI || "mongodb://localhost:27017/ecommerce-clothing"
  )
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.log("MongoDB connection error:", err));

// Error handling middleware
app.use((error, req, res, next) => {
  const status = error.statusCode || 500;
  const message = error.message;
  const data = error.data;
  res.status(status).json({ message: message, data: data });
});

// Health check endpoint
app.get("/api/health", (req, res) => {
  res.json({
    success: true,
    message: "Server is running with WebSocket support",
    connectedClients: clients.size,
    timestamp: new Date().toISOString(),
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(
    `Server running on port ${PORT} with real-time WebSocket support`
  );
  console.log(`WebSocket server ready for real-time payment updates`);
});

module.exports = { app, server, wss };
