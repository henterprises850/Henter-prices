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

// CORS Configuration - Handle multiple origins
const allowedOrigins = [
  "http://localhost:3000",
  "http://localhost:3001",
  "https://clothselling.netlify.app",
  process.env.FRONTEND_URL,
].filter(Boolean); // Remove any undefined values

const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);

    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
};

// Security middleware
app.use(
  helmet({
    crossOriginEmbedderPolicy: false,
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        scriptSrc: ["'self'"],
        imgSrc: ["'self'", "data:", "https:"],
      },
    },
  })
);

// CORS middleware (single instance)
app.use(cors(corsOptions));

// Preflight handler for all routes
app.options("*", cors(corsOptions));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: {
    error: "Too many requests from this IP, please try again later.",
  },
});
app.use("/api/", limiter);

// Logging
if (process.env.NODE_ENV !== "production") {
  app.use(morgan("dev"));
} else {
  app.use(morgan("combined"));
}

// Body parsing middleware - Special handling for webhook
app.use(
  "/api/payment/stripe/webhook",
  express.raw({ type: "application/json" })
);

// Regular body parsing middleware
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));

// Static files
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

// Health check endpoint (before other routes)
app.get("/api/health", (req, res) => {
  res.json({
    success: true,
    message: "Server is running with WebSocket support",
    connectedClients: clients.size,
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || "development",
  });
});

// API Routes
app.use("/api/users", userRoutes);
app.use("/api/products", productRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/payment", paymentRoutes);

// Catch-all route for undefined endpoints
app.use("/api/*", (req, res) => {
  res.status(404).json({
    success: false,
    message: `API endpoint ${req.originalUrl} not found`,
  });
});

// MongoDB connection
mongoose
  .connect(
    process.env.MONGODB_URI || "mongodb://localhost:27017/ecommerce-clothing",
    {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    }
  )
  .then(() => console.log("MongoDB connected successfully"))
  .catch((err) => {
    console.error("MongoDB connection error:", err);
    process.exit(1);
  });

// Global error handling middleware
app.use((error, req, res, next) => {
  console.error("Global error handler:", error);

  const status = error.statusCode || 500;
  const message = error.message || "Internal server error";
  const data = error.data;

  res.status(status).json({
    success: false,
    message: message,
    data: data,
    ...(process.env.NODE_ENV === "development" && { stack: error.stack }),
  });
});

// Handle unhandled promise rejections
process.on("unhandledRejection", (err) => {
  console.error("Unhandled Promise Rejection:", err);
  server.close(() => {
    process.exit(1);
  });
});

// Handle uncaught exceptions
process.on("uncaughtException", (err) => {
  console.error("Uncaught Exception:", err);
  process.exit(1);
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📡 WebSocket server ready for real-time updates`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || "development"}`);
  console.log(`✅ CORS enabled for origins: ${allowedOrigins.join(", ")}`);
});

module.exports = { app, server, wss };
