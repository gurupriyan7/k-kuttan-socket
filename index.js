const express = require("express");
const http = require("http");
const socketIo = require("socket.io");
const cors = require("cors");

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: ["http://localhost:3000", "https://kambikuttapan.in", "https://www.kambikuttapan.in"]
  }
});

app.use(cors());

let activeUsers = [];

io.on("connection", (socket) => {
  // Add new User
  socket.on("new-user-add", (newUserId) => {
    // If user is not added previously
    if (!activeUsers.some((user) => user.userId === newUserId)) {
      activeUsers.push({ userId: newUserId, socketId: socket.id });
      console.log("New User Connected", activeUsers);
    }
    console.log("no active users");
    // Send all active users to new user
    io.emit("get-users", activeUsers);
  });

  // Send message
  // socket.on("send-message", (data) => {
  //   const { receiverId } = data;
  //   console.log(data,"sendMessage",activeUsers);
  //   const duplicates = activeUsers?.filter((user) => String(user?.userId)  === String(receiverId));
  //   console.log(duplicates,"duplicates");
  //   duplicates.forEach((user) => {
  //     console.log(user,"usersssuuyytt");
  //     io.to(user?.socketId).emit("receive-message", data);
  //   });
  // });
  socket.on("send-message", (data) => {
    const { recieverId, isRoom = false, senderId } = data;
    console.log(data, "data,data,data", activeUsers);

    // Ensure activeUsers is defined and not null
    if (Array.isArray(activeUsers)) {
      let duplicates = [];
      if (isRoom) {
        duplicates = activeUsers?.filter(
          (user) => String(user?.userId) !== String(senderId)
        );
      } else {
        duplicates = activeUsers?.filter(
          (user) => String(user?.userId) === String(recieverId)
        );
      }
      console.log(duplicates, "dupllicatesss");

      // Ensure duplicates is an array before using forEach
      if (Array.isArray(duplicates)) {
        duplicates.forEach((user) => {
          console.log(user, "usersssuuyytt");
          io.to(user?.socketId).emit("receive-message", data);
        });
      }
    }
  });

  // Handle disconnect
  socket.on("disconnect", () => {
    // Remove user from active users
    activeUsers = activeUsers.filter((user) => user.socketId !== socket.id);
    console.log("User Disconnected", activeUsers);
    // Send all active users to all users
    io.emit("get-users", activeUsers);
  });
});

// Define a simple route
app.get("/", (req, res) => {
  res.status(200).json("Server is running");
});

// Start the server
const PORT = process.env.PORT || 6000;
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
