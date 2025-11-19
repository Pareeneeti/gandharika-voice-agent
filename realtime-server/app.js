import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import { generateReply } from "./modules/gpt.js";
import { logEvent } from "./utils/helpers.js";
import http from "http";
import { WebSocketServer } from "ws";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true })); // Exotel sends form-urlencoded

// 🧠 Test route for AI
app.get("/test-ai", async (req, res) => {
  const reply = await generateReply("How are you?");
  res.send(reply);
});

// 🧠 Default health-check route
app.get("/", (req, res) => {
  logEvent("Root route hit");
  res.send("🧠 Gandharika AI Server is alive!");
});

// 📞 EXOTEL — Incoming Call Webhook (customer calls your Exotel number)
app.post("/exotel/incoming", (req, res) => {
  console.log("📞 Incoming call from Exotel:", req.body);

  // Initial greeting (Exotel XML response)
  const responseXML = `
    <Response>
        <Say>Hello, this is Gandharika from Aranyam. How may I help you today?</Say>
    </Response>
  `;

  res.type("text/xml");
  res.send(responseXML);
});

// 📞 EXOTEL — Answer URL (used during AI call loop)
app.post("/exotel/answer", async (req, res) => {
  console.log("🤖 Exotel AI Answer Webhook hit:", req.body);

  const customerSpeech = req.body.SpeechResult || "hello";

  // AI generates reply
  const aiReply = await generateReply(customerSpeech);

  // Exotel XML to speak AI reply
  const responseXML = `
    <Response>
        <Say>${aiReply}</Say>
    </Response>
  `;

  res.type("text/xml");
  res.send(responseXML);
});

// 🔗 Extra AI endpoints
import aiRoutes from "./routes/ai.js";
app.use("/api", aiRoutes);

// 🚀 Start server
const PORT = process.env.PORT || 3000;

// Create HTTP server (for Express + WebSocket)
const server = http.createServer(app);

// Start HTTP + WebSocket server (WebSocket part will be added next step)
// 📡 WebSocket Server for Exotel Media Stream (skeleton)
const wss = new WebSocketServer({
  server,
  path: "/exotel-stream",
});

// When Exotel connects to WebSocket
wss.on("connection", (ws) => {
  console.log("📡 Exotel connected via WebSocket");

  // When we receive any message from Exotel (audio, events, etc.)
  ws.on("message", (msg) => {
    console.log("🎧 Received WS message:", msg.toString());
  });

  // On disconnect
  ws.on("close", () => {
    console.log("🔌 WebSocket closed by Exotel");
  });

  ws.on("error", (err) => {
    console.error("⚠️ WebSocket error:", err);
  });
});
server.listen(PORT, () => {
  console.log(`⚡ Gandharika AI Server running on port ${PORT}`);
});

