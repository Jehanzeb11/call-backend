const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");

const app = express();
app.use(cors());
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
    allowedHeaders: ["Content-Type"],
  },
});

io.on("connection", (socket) => {
  console.log("A user connected");

  socket.on("join-room", (data) => {
    const { roomId, email } = data;
    console.log(`User with email ${email} joined room ${roomId}`);
    socket.join(roomId);
    socket.emit("joined-room", { roomId });
    socket.broadcast.to(roomId).emit("user-joined", { email });
  });

  socket.on("offer", (data) => {
    const { roomId, offer } = data;
    socket.broadcast.to(roomId).emit("offer", { offer });
  });

  socket.on("answer", (data) => {
    const { roomId, answer } = data;
    socket.broadcast.to(roomId).emit("answer", { answer });
  });

  socket.on("ice-candidate", (data) => {
    const { roomId, candidate } = data;
    socket.broadcast.to(roomId).emit("ice-candidate", { candidate });
  });

  socket.on("disconnect", () => {
    console.log("User disconnected");
  });
});

app.get("/", (req, res) => {
  res.send("Hello World!");
});

server.listen(8500, () => {
  console.log("Server is running on port 8500");
});