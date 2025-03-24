import { TextEncoder, TextDecoder } from "util";
import dotenv from "dotenv";
import "@testing-library/jest-dom"; // 🛠 Jest DOM matchers add karega

global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder;

dotenv.config();
process.env.VITE_API_BASE_URL = "http://localhost:5000/api";
