const mongoose = require("mongoose");
mongoose.connect(
  "mongodb+srv://shev:O8iN0WiRrFmaABqJ@cluster0.9rwd1.mongodb.net/?retryWrites=true&w=majority"
);

const chatSchema = new mongoose.Schema({
  _id: Number,
  users: [{ type: Number }],
  language: {
    type: String,
    default: "eng",
  },
});
