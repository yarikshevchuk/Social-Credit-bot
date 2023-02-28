const mongoose = require("mongoose");

const environmentSchema = new mongoose.Schema({
  user: { type: Number, ref: "users" },
  users: [{ type: Number, ref: "users" }],
});

module.exports = mongoose.model("environments", environmentSchema);
