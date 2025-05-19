import { Pool } from "pg";
import dotenv from "dotenv";
dotenv.config();
const username = process.env.DB_USERNAME;
const password = process.env.DB_PASSWORD;
const host = process.env.DB_HOST;
const port = process.env.DB_PORT;
const database = process.env.DB_NAME;
const pool = new Pool({
  user: username || "your_username",
  password: password || "your_password",
  host: host || "localhost",
  port: Number(port) || 5432,
  database: database || "your_database",
});

export const query = (text, params) => pool.query(text, params);
