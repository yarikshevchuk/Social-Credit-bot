const dotenv = require("dotenv").config({ path: `${__dirname}/../.env` });
const mongoose = require("mongoose");
mongoose.connect(dotenv.parsed.MONGO);

const chatSchema = new mongoose.Schema({
  _id: Number,
  users: [{ type: Number, ref: "users" }],
  language: {
    type: String,
    default: "eng",
  },
});

module.exports = mongoose.model("chats", chatSchema);
