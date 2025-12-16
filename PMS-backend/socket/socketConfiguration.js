const socketIo = require("socket.io");
const socketConfig = (server) => {
  const io = socketIo(server, {
    cors: {
      origin: "*", // the URL of  React frontend
      methods: ["GET", "POST"],
      allowedHeaders: ["Content-Type"],
      credentials: true, // enable CORS credentials
    },
  });
  io.on("connection", (socket) => {
    console.log("New client connected");

    socket.on("disconnect", () => {
      console.log("Client disconnected");
    });
  });

  return io;
};
module.exports = socketConfig;
