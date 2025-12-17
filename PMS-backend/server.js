require("dotenv").config();
const client = require("prom-client");
const express = require("express");
const http = require("http");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const path = require("path");
const connection = require("./config/connect");
const corsOptionsDelegate = require("./config/cors");
const verifyJWT = require("./middlewares/verifyJWT");
const socketConfig = require("./socket/socketConfiguration");

const app = express();
const server = http.createServer(app);

connection;

// Middleware
app.use(cors(corsOptionsDelegate));
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.json());

app.use(express.static(path.join(__dirname, "public")));
app.use("/api/settings", require("./routes/api/settings"));
app.use("/api/ums", require("./routes/api/ums"));
app.use("/api/organization", require("./routes/api/organization"));
app.use("/api/project", require("./routes/api/projectroute")(socketConfig(server))); // Pass server to socketConfig
app.use(verifyJWT);
app.use("/api/trash", require("./routes/api/trash"));

// Serve frontend build
app.use(express.static(path.join(__dirname, "build")));
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "build", "index.html"));
});
const collectDefaultMetrics = client.collectDefaultMetrics;
collectDefaultMetrics();

app.get("/metrics", async (req, res) => {
  res.set("Content-Type", client.register.contentType);
  res.end(await client.register.metrics());
});
// Start the main server
const PORT = process.env.PORT || 3500;
app.listen(PORT, "0.0.0.0", () => {
  console.log("Server running on port " + PORT);
});

// Start the Socket.IO server
const socketPort = process.env.socketPort || 5001;
server.listen(socketPort, "0.0.0.0", () => {
  console.log(`Socket Server running on port ${socketPort}`);
});
