  const io = require("socket.io")(8800, {
      cors: {
        origin: "http://localhost:3000",
      },
    });
    
    let activeUsers = [];
    
    io.on("connection", (socket) => {
      // add new User
      socket.on("new-user-add", (newUserId) => {
        // if user is not added previously
        if (!activeUsers.some((user) => user.userId === newUserId)) {
          activeUsers.push({ userId: newUserId, socketId: socket.id });
          console.log("New User Connected", activeUsers);
        }
        // send all active users to new user
        io.emit("get-users", activeUsers);
      });


      //send message

      socket.on("send-message", (data)=>{
          const {recieverId} = data;
          const duplicates = activeUsers.filter(function(val) {
            return recieverId.indexOf(val.userId) != -1;
          });
          console.log("dupli",duplicates);
          duplicates.forEach(element => {
            console.log(element.socketId);
            io.to(element.socketId).emit("recieve-message", data)
            console.log(data);
          });
      })

    


      socket.on("disconnect", () => {
          // remove user from active users
          activeUsers = activeUsers.filter((user) => user.socketId !== socket.id);
          console.log("User Disconnected", activeUsers);
          // send all active users to all users
          io.emit("get-users", activeUsers);
        });
  })