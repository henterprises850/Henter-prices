import { useEffect, useRef, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { toast } from "react-toastify";

const usePaymentUpdates = () => {
  const { user } = useAuth();
  const ws = useRef(null);
  const [connectionStatus, setConnectionStatus] = useState("Disconnected");
  const [lastPaymentUpdate, setLastPaymentUpdate] = useState(null);
  const reconnectTimeout = useRef(null);

  useEffect(() => {
    if (!user?.id) return;

    const connectWebSocket = () => {
      try {
        const wsUrl =
          process.env.REACT_APP_WS_URL ||
          `ws://localhost:${process.env.REACT_APP_WS_PORT || 5000}`;
        ws.current = new WebSocket(wsUrl);

        ws.current.onopen = () => {
          console.log("WebSocket connected for real-time payment updates");
          setConnectionStatus("Connected");

          // Authenticate with user ID
          ws.current.send(
            JSON.stringify({
              type: "authenticate",
              userId: user.id,
            })
          );

          // Clear any reconnection timeout
          if (reconnectTimeout.current) {
            clearTimeout(reconnectTimeout.current);
            reconnectTimeout.current = null;
          }
        };

        ws.current.onmessage = (event) => {
          try {
            const message = JSON.parse(event.data);
            console.log("Real-time message received:", message);

            switch (message.type) {
              case "authenticated":
                toast.success("🔗 Connected to real-time payment updates!", {
                  position: "top-right",
                  autoClose: 3000,
                });
                break;

              case "payment_update":
                handlePaymentUpdate(message.data);
                break;

              default:
                console.log("Unknown WebSocket message type:", message.type);
            }
          } catch (error) {
            console.error("Error parsing WebSocket message:", error);
          }
        };

        ws.current.onclose = (event) => {
          console.log("WebSocket disconnected:", event.code, event.reason);
          setConnectionStatus("Disconnected");

          // Attempt to reconnect after 3 seconds
          if (!reconnectTimeout.current) {
            reconnectTimeout.current = setTimeout(() => {
              console.log("Attempting to reconnect WebSocket...");
              connectWebSocket();
            }, 3000);
          }
        };

        ws.current.onerror = (error) => {
          console.error("WebSocket error:", error);
          setConnectionStatus("Error");
        };
      } catch (error) {
        console.error("Failed to create WebSocket connection:", error);
        setConnectionStatus("Error");
      }
    };

    connectWebSocket();

    // Cleanup on unmount
    return () => {
      if (reconnectTimeout.current) {
        clearTimeout(reconnectTimeout.current);
      }
      if (ws.current) {
        ws.current.close();
      }
    };
  }, [user?.id]);

  const handlePaymentUpdate = (paymentData) => {
    setLastPaymentUpdate(paymentData);

    // Show different toast notifications based on payment status
    const { status, message, orderId } = paymentData;

    switch (status) {
      case "completed":
        toast.success(`✅ ${message}`, {
          position: "top-center",
          autoClose: 5000,
        });
        break;
      case "failed":
        toast.error(`❌ ${message}`, {
          position: "top-center",
          autoClose: 5000,
        });
        break;
      case "timeout":
        toast.warning(`⏰ ${message}`, {
          position: "top-center",
          autoClose: 7000,
        });
        break;
      case "error":
        toast.error(`⚠️ ${message}`, {
          position: "top-center",
          autoClose: 5000,
        });
        break;
      case "pending":
        toast.info(`🔄 ${message}`, {
          position: "top-right",
          autoClose: 3000,
        });
        break;
      default:
        toast.info(`📡 ${message}`, {
          position: "top-right",
          autoClose: 3000,
        });
    }
  };

  return {
    connectionStatus,
    lastPaymentUpdate,
    isConnected: connectionStatus === "Connected",
    isError: connectionStatus === "Error",
  };
};

export default usePaymentUpdates;
