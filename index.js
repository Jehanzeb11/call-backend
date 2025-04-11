const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");

const app = express();
app.use(cors());

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*", // Replace with your frontend domain in production
    methods: ["GET", "POST"],
  },
});

// Room tracking
const rooms = {};

io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  socket.on("join-room", ({ roomId, email }) => {
    console.log(`User ${email || socket.id} joining room ${roomId}`);
    socket.join(roomId);

    // Initialize room if it doesn't exist
    if (!rooms[roomId]) rooms[roomId] = [];
    rooms[roomId].push(socket.id);

    const numClients = rooms[roomId].length;
    console.log(`Room ${roomId} now has ${numClients} client(s)`);

    if (numClients === 1) {
      socket.emit("created-room"); // First user
    } else if (numClients === 2) {
      io.to(roomId).emit("ready"); // Both users can start signaling
    } else {
      socket.emit("room-full"); // Optional: limit room size
    }

    // Handle disconnection
    socket.on("disconnect", () => {
      console.log("User disconnected:", socket.id);
      if (rooms[roomId]) {
        rooms[roomId] = rooms[roomId].filter((id) => id !== socket.id);
        if (rooms[roomId].length === 0) {
          delete rooms[roomId];
        }
      }
    });
  });

  // Handle signaling events
  socket.on("offer", ({ roomId, offer }) => {
    socket.broadcast.to(roomId).emit("offer", { offer });
  });

  socket.on("answer", ({ roomId, answer }) => {
    socket.broadcast.to(roomId).emit("answer", { answer });
  });

  socket.on("ice-candidate", ({ roomId, candidate }) => {
    socket.broadcast.to(roomId).emit("ice-candidate", { candidate });
  });
});

// Health check
app.get("/", (req, res) => {
  res.send("WebRTC Signaling Server is running 🚀");
});

server.listen(8500, () => {
  console.log("Signaling server listening on http://localhost:8500");
});
