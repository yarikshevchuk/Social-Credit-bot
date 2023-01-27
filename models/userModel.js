const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  _id: Number,
  username: { type: String, default: null },
  first_name: { type: String, default: null },
  roles: [{ type: String, ref: "roles" }],
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
    smallGift: {
      type: Number,
      default: 300,
    },
    averageGift: {
      type: Number,
      default: 1000,
    },
    bigGift: {
      type: Number,
      default: 5000,
    },
  },
});

module.exports = mongoose.model("users", userSchema);
