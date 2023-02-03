const mongoose = require("mongoose");

const nextWeek = new Date().getTime() + 1000 * 60 * 60 * 24 * 7;
const promocodeSchema = new mongoose.Schema({
  promocode: { type: String, unique: true },
  value: { type: Number, default: 500 },
  count: { type: Number, default: 6 },
  exp: { type: Number, default: nextWeek },
});

module.exports = mongoose.model("promocodes", promocodeSchema);
