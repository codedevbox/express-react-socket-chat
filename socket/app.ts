import { Server } from "socket.io";

interface User {
  userId: string;
  socketId: string;
}

const io = new Server({
  cors: {
    origin: "http://localhost:5173",
  },
});

let onlineUser: User[] = [];

const addUser = (userId: string, socketId: string) => {
  const existUser = onlineUser.find((user) => user.userId === userId);
  if (!existUser) {
    onlineUser.push({ userId, socketId });
  }
};

const removeUser = (socketId: string) => {
  onlineUser = onlineUser.filter((user) => user.socketId !== socketId);
};

const getUser = (userId: string) => {
  return onlineUser.find((user) => user.userId === userId);
};

io.on("connection", (socket) => {
  socket.on("newUser", (userId) => {
    addUser(userId, socket.id);
  });

  socket.on("sendMessage", ({ receiverId, data }) => {
    const receiver = getUser(receiverId);
    if (receiver) {
      io.to(receiver?.socketId).emit("getMessage", data);
      io.to(receiver.socketId).emit("updateLastMessage", {
        chatId: data.chatId,
        text: data.text,
      });
    }
    const sender = getUser(data.userId);
    if (sender) {
      io.to(sender.socketId).emit("updateLastSendMessage", {
        chatId: data.chatId,
        text: data.text,
      });
    }
  });

  socket.on("disconnect", () => {
    removeUser(socket.id);
  });
});

io.listen(4000);
