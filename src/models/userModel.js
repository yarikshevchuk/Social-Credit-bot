const mongoose = require("mongoose");
// const Double = require("@mongoosejs/double");
const today = new Date().setHours(0, 0, 0, 0);
const tomorrow = today + 24 * 60 * 60 * 1000;

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
  usedPromocodes: [{ type: String, ref: "promocodes" }],
  bannedUntil: { type: Number, default: 0 },
  ratingChangeLimit: {
    limit: { type: Number, default: 5000 },
    todayLimit: { type: Number, default: 5000 },
    updateAfter: { type: Number, default: tomorrow },
  },
});

module.exports = mongoose.model("users", userSchema);
