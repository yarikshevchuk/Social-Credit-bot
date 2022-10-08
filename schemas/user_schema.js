const mongoose = require("mongoose");
mongoose.connect(
  "mongodb+srv://shev:O8iN0WiRrFmaABqJ@cluster0.9rwd1.mongodb.net/?retryWrites=true&w=majority"
);

const userSchema = new mongoose.Schema({
  username: String,
  first_name: String,
  second_name: String,
  rating: {
    currentRating: {
      type: Number,
      default: 0,
    },
    prevRating: {
      type: Number,
      default: 0,
    },
  },
  giftsCountdown: {
    bowlOfRice: {
      type: Number,
      default: 300,
    },
    catWife: {
      type: Number,
      default: 1000,
    },
    respectFromXi: {
      type: Number,
      default: 5000,
    },
  },
});

module.exports = mongoose.model("users", userSchema);
