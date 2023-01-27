const mongoose = require("mongoose");

const chatSchema = new mongoose.Schema({
  _id: Number,
  users: [{ type: Number, ref: "users" }],
  language: {
    type: String,
    default: "eng",
  },
});

module.exports = mongoose.model("chats", chatSchema);
