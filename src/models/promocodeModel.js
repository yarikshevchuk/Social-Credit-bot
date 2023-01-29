const mongoose = require("mongoose");

const nextWeek = new Date().getTime() + 1000 * 60 * 60 * 24 * 7;
console.log(nextWeek);

const promocodeSchema = new mongoose.Schema({
  value: { type: Number, default: 500 },
  count: { type: Number, default: 7 },
  exp: { type: Number, default: tomorrow },
});

module.exports = mongoose.model("promocodes", promocodeSchema);
