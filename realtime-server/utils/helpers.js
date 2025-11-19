import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

// These two lines help Node find folder paths correctly
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Format reply (for AI responses)
export function formatResponse(msg) {
  return `[GANDHARIKA]: ${msg}`;
}

// 🪵 Log events safely
export function logEvent(message) {
  const logsDir = path.join(__dirname, "..", "logs"); // goes one level up
  const filePath = path.join(logsDir, "events.log");

  try {
    if (!fs.existsSync(logsDir)) {
      fs.mkdirSync(logsDir, { recursive: true });
    }

    const time = new Date().toISOString();
    const line = `${time}  ${message}\n`;
    fs.appendFileSync(filePath, line, "utf8");
    console.log("🪵 Log wrote:", line.trim());
  } catch (err) {
    console.error("❌ Log write failed:", err);
  }
}
