
const mongoose = require("mongoose");

const oneToOneMessageChema = new mongoose.Schema({
  participants: [
    {
      type: mongoose.Schema.ObjectId,
      ref: "User",
    },
  ],
  messages: [
    {
      to: {
        type: mongoose.Schema.ObjectId,
        ref: "User",
      },
      from: {
        type: mongoose.Schema.ObjectId,
        ref: "User",
      },
      type: {
        type: String,
        enum: ["Text", "Media", "Document", "Link","divider"],
      },
      created_at: {
        type: String,
      },
      text: {
        type: String,
      },
      file: {
        type: String,
      },
    },
  ],
  lastMessage:{
    type:"String",
  },
  lastMessageTime:{
    type:"String",
    default:"",
  }
});

const OneToOneMessage = new mongoose.model(
  "OneToOneMessage",
  oneToOneMessageChema
);

module.exports = OneToOneMessage;
