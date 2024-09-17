const app = require("./app");
const dotenv = require("dotenv");
const path = require("path");
const mongoose = require("mongoose");
const dayjs = require("dayjs");
const relativeTime = require("dayjs/plugin/relativeTime");
const utc = require("dayjs/plugin/utc");
const timezone = require("dayjs/plugin/timezone");
dayjs.extend(relativeTime);
dayjs.extend(utc);
dayjs.extend(timezone);
dotenv.config({ path: "./config.env" });

const { Server } = require("socket.io");


process.on("uncaughtException", (err) => {
  console.log(err);
  process.exit(1);
});

process.on("unhandledRejection", (err) => {
  console.log(err);
  server.close();
});

const http = require("http");
const User = require("./models/user");
const FriendRequest = require("./models/friendRequest");
const OneToOneMessage = require("./models/OneToOneMessage");

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ["GET", "POST"],
  },
});
const DB = process.env.DBURI.replace("<PASSWORD>",process.env.DBPASSWORD);
mongoose
.connect(DB, { 
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then((conn) => {
  console.log("DB connection is succesfull");
})
.catch((err) => {
  console.log(err);
});

const port = process.env.PORT || 8000;
server.listen(port, () => {
  console.log(DB);
  console.log(`App is running on port ${port}`);
});

io.on("connection", async (socket) => {
  console.log(JSON.stringify(socket.handshake.query));
  console.log(socket);
  const user_id = socket.handshake.query["user_id"]; 
  const socket_id = socket.id;
  console.log(`User connected ${socket_id}`);
 
  if (Boolean(user_id)) {
    await User.findByIdAndUpdate(user_id, { socket_id, status: "Online" });
  }

  // We can write socket event listeners here...

  socket.on("friend_request", async (data) => {
    console.log(data);

    const to_user = await User.findById(data.to).select("socket_id");
    const from_user = await User.findById(data.from).select("socket_id");

    // TODO --> Create friend request
    await FriendRequest.create({
      sender: data.from,
      recipient: data.to,
    });

    io.to(to_user.socket_id).emit("new_friend_request", {
      message: "New friend request received",
    });

    io.to(from_user.socket_id).emit("request_sent", {
      message: "Request sent successfully!",
    });
  });

  socket.on("accept_request", async (data) => {
    console.log(data);

    const request_doc = await FriendRequest.findById(data.request_id);

    console.log(request_doc);
    const sender = await User.findById(request_doc.sender);
    const receiver = await User.findById(request_doc.recipient);

    sender.friends.push(request_doc.recipient);
    receiver.friends.push(request_doc.sender);

    await receiver.save({ new: true, validateModifiedOnly: true });
    await sender.save({ new: true, validateModifiedOnly: true });

    await FriendRequest.findByIdAndDelete(data.request_id);

    io.to(sender.socket_id).emit("request_accepted", {
      message: "Friend Request Accepted",
    });

    io.to(receiver.socket_id).emit("request_accepted", {
      message: "Friend Request Accepted",
    });
  });

  socket.on("get_direct_conversations", async ({ user_id }, callback) => {
    const existing_conversations = await OneToOneMessage.find({
      participants: { $all: [user_id] },
    }).populate("participants", "firstName lastName _id email status");
    console.log(existing_conversations);
    callback(existing_conversations);
  });
  socket.on("start_conversation", async (data) => {
    // data:{to,from};
    const { to, from } = data;
    console.log(data);
    // Check if there is any existing conversation between these users
    const existing_conversation = await OneToOneMessage.find({
      participants: { $size: 2, $all: [to, from] },
    }).populate("participants", "firstName lastName _id email status");

    console.log(existing_conversation[0], "Existing Conversation");
    // if no existing conversation
    if (existing_conversation.length === 0) {
      let new_chat = await OneToOneMessage.create({
        participants: [to, from],
      });
      new_chat = await OneToOneMessage.findById(new_chat._id).populate(
        "participants",
        "firstName lastName _id email status"
      );
      console.log(new_chat);
      socket.emit("start_chat", new_chat);
    }
    // else
    else {
      socket.emit("start_chat", existing_conversation[0]);
    }
  });

  socket.on("get_messages", async (data, callback) => {
    const { messages } = await OneToOneMessage.findById(
      data.conversation_id
    ).select("messages");
    callback(messages);
  });

  socket.on("text_message", async (data) => {
    console.log("Received Message", data);
    const { to, from, message, conversation_id, type } = data;
    const to_user = await User.findById(to);
    const from_user = await User.findById(from);
    console.log(to_user);
    console.log(from_user);
    const new_message = {
      to,
      from,
      type,
      text: message,
      created_at: dayjs().tz("Asia/Kolkata").format("h:mm a").toString(),
    };
    // console.log(dayjs(new Date()).format('LT'));
    const chat = await OneToOneMessage.findById(conversation_id);
    const dividers = chat.messages.filter((el) => el.type === "divider");
    if (dividers.length != 0) {
      const date = dayjs().format("D-MMM-YY").toString();
      if (date !== dividers[dividers.length - 1].text) {
        chat.messages.push({
          type: "divider",
          text: date,
        });
      }
    } else {
      const date = dayjs().format("D-MMM-YY").toString();
      chat.messages.push({
        type: "divider",
        text: date,
      });
    }
    chat.messages.push(new_message);
    chat.lastMessage = message;
    (chat.lastMessageTime = dayjs()
      .tz("Asia/Kolkata")
      .format("h:mm a")
      .toString()),
      await chat.save({});

    io.to(to_user.socket_id).emit("new_message", {
      conversation_id,
      message: new_message,
    });
    io.to(from_user.socket_id).emit("new_message", {
      conversation_id,
      message: new_message,
    });
  });

  socket.on("file_message", (data) => {
    console.log("Received Message", data);
    const fileExtension = path.extname(data.file.name);
    // generate unique file name
    const fileName = `${Date.now()}_${Math.floor(
      Math.random * 1000
    )}${fileExtension}`;
  });

  socket.on("end", async (data) => {
    if (data.user_id) {
      await User.findByIdAndUpdate(data.user_id, { status: "Offline" });
    }
    // TODO --> broadcast user disconnected
    console.log("Closing Connection");
    socket.disconnect(0);
  });

  socket.on("set_status", async (data, callback) => {
    if (data.user_id) {
      await User.findByIdAndUpdate(data.user_id, {
        status: data.isVisible ? "Online" : "Offline",
      });
      console.log("status", data.user_id);
      socket.broadcast.emit("change_status", {
        status: data.isVisible ? "Online" : "Offline",
        id: data.user_id,
      });
    }
  });
});
