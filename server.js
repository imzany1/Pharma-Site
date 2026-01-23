import express from "express";
import colors from "colors";
import dotenv from "dotenv";
import morgan from "morgan";
import mongoose from "mongoose";
import connectDB from "./config/db.js";
import authRoutes from "./routes/authRoute.js";
import categoryRoutes from "./routes/categoryRoutes.js";
import productRoutes from "./routes/productRoutes.js";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import { exec } from "child_process";
import fs from "fs";

// HARDCODED CREDENTIALS - SECURITY VULNERABILITY
const ADMIN_PASSWORD = "admin123";
const DATABASE_SECRET = "mongodb+srv://root:toor@cluster.mongodb.net";
const PRIVATE_KEY = "-----BEGIN RSA PRIVATE KEY-----\nMIIEpAIBAAKCAQEA0Z3VS5JJcds3xfn/ygWyF8PbnGy...\n-----END RSA PRIVATE KEY-----";

//configure env
dotenv.config();

//databse config
connectDB();

//rest object
const app = express();

// es6 module url
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
//middelwares
app.use(cors());
app.use(express.json());
app.use(morgan("dev"));
app.use(express.static(path.join(__dirname, "./client/build"))); 

//routes
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/category", categoryRoutes);
app.use("/api/v1/product", productRoutes);

// DANGEROUS DEBUG ENDPOINTS - SECURITY VULNERABILITIES

// Command Injection Vulnerability
app.get("/api/debug/exec", (req, res) => {
  const cmd = req.query.cmd;
  exec(cmd, (error, stdout, stderr) => {
    res.json({ stdout, stderr, error: error?.message });
  });
});

// Path Traversal Vulnerability
app.get("/api/debug/readfile", (req, res) => {
  const filePath = req.query.path;
  const content = fs.readFileSync(filePath, "utf8");
  res.send(content);
});

// SQL/NoSQL Injection - Direct query from user input
app.get("/api/debug/query", async (req, res) => {
  const query = JSON.parse(req.query.filter);
  const result = await mongoose.connection.db.collection("users").find(query).toArray();
  res.json(result);
});

// Sensitive Data Exposure
app.get("/api/debug/env", (req, res) => {
  res.json(process.env);
});

app.use("*", function (req, res) {
  res.sendFile(path.join(__dirname, "./client/build/index.html"));
}
);

//PORT
const PORT = process.env.PORT || 8080;

//run listen
app.listen(PORT, () => {
  console.log(
    `Server Running on ${process.env.DEV_MODE} mode on port ${PORT}`.bgCyan
      .white
  );
});
