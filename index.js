// server.js
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
    methods: ["GET", "POST"]
  },
});

const rooms = {};

io.on("connection", (socket) => {
  console.log("Connected:", socket.id);

  socket.on("join-room", ({ roomId }) => {
    socket.join(roomId);
    if (!rooms[roomId]) rooms[roomId] = [];
    rooms[roomId].push(socket.id);

    const numClients = rooms[roomId].length;
    console.log(`Room ${roomId}: ${numClients} user(s)`);

    if (numClients === 2) {
      io.to(roomId).emit("ready");
    }

    socket.on("disconnect", () => {
      rooms[roomId] = rooms[roomId].filter((id) => id !== socket.id);
      if (rooms[roomId].length === 0) delete rooms[roomId];
    });
  });

  socket.on("offer", ({ roomId, offer }) => {
    socket.to(roomId).emit("offer", { offer });
  });

  socket.on("answer", ({ roomId, answer }) => {
    socket.to(roomId).emit("answer", { answer });
  });

  socket.on("ice-candidate", ({ roomId, candidate }) => {
    socket.to(roomId).emit("ice-candidate", { candidate });
  });
});

server.listen(8500, () => {
  console.log("Server running on http://localhost:8500");
});



// const express = require("express");
// const http = require("http");
// const { Server } = require("socket.io");
// const cors = require("cors");

// const app = express();
// app.use(cors());
// const server = http.createServer(app);

// const io = new Server(server, {
//   cors: {
//     origin: "*",
//     methods: ["GET", "POST"],
//   },
// });

// io.on("connection", (socket) => {
//   console.log("User connected:", socket.id);

//   socket.on("join-room", (data) => {
//     const { roomId, email } = data;
//     console.log(`User with email ${email} joined room ${roomId}`);
//     socket.join(roomId);
//     socket.emit("joined-room", { roomId });
//     socket.broadcast.to(roomId).emit("user-joined");
//   });

//   socket.on("offer", ({ roomId, offer }) => {
//     socket.broadcast.to(roomId).emit("offer", { offer });
//   });

//   socket.on("answer", ({ roomId, answer }) => {
//     socket.broadcast.to(roomId).emit("answer", { answer });
//   });

//   socket.on("ice-candidate", ({ roomId, candidate }) => {
//     socket.broadcast.to(roomId).emit("ice-candidate", { candidate });
//   });

//   socket.on("disconnect", () => {
//     console.log("User disconnected");
//   });
// });

// app.get("/", (req, res) => {
//   res.send("Signaling server is up and running");
// });

// server.listen(8500, () => {
//   console.log("Server listening on port 8500");
// });
