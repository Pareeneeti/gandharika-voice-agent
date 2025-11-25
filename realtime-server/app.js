import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import http from "http";
import { WebSocketServer } from "ws";
import { generateReply } from "./modules/gpt.js";
import { logEvent } from "./utils/helpers.js";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// HEALTH CHECK
app.get("/", (req, res) => {
  res.send("🧠 Gandharika AI WebSocket Server Running");
});

// -----------------------------
//  1) CREATE HTTP + WS SERVER
// -----------------------------
const server = http.createServer(app);
const wss = new WebSocketServer({ server });

// -----------------------------
//  2) HANDLE EXOTEL WEBSOCKET
// -----------------------------
wss.on("connection", (ws) => {
  console.log("⚡ Exotel: WebSocket connected");

  ws.on("message", async (message) => {
    try {
      const data = JSON.parse(message);

      switch (data.event) {
        case "connected":
          console.log("🔌 Exotel connected event");
          ws.send(JSON.stringify({ event: "connected" }));
          break;

        case "start":
          console.log("🎙️ Stream start", data);
          break;

        case "media":
          // The actual audio chunk (base64 PCM16)
          const base64Audio = data.media.payload;

          // TODO: decode PCM → run Whisper → get transcript
          const transcript = "hello";

          console.log("📝 Customer:", transcript);

          // Generate AI reply
          const aiReply = await generateReply(transcript);

          console.log("🤖 AI:", aiReply);

          // TODO: Convert TTS audio → PCM16 → base64

          ws.send(
            JSON.stringify({
              event: "media",
              payload: {
                text: aiReply, // placeholder until TTS converted
              },
            })
          );

          break;

        case "dtmf":
          console.log("🔢 DTMF pressed:", data.dtmf);
          break;

        case "stop":
          console.log("🛑 Stream stopped");
          ws.close();
          break;

        default:
          console.log("⚠️ Unknown event:", data);
      }
    } catch (err) {
      console.error("❌ WS ERROR:", err);
    }
  });

  ws.on("close", () => console.log("🔌 Exotel WS closed"));
});

// -----------------------------
//  START SERVER
// -----------------------------
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`⚡ Gandharika AI WebSocket server running on port ${PORT}`);
});
