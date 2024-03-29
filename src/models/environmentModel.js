const mongoose = require("mongoose");

const environmentSchema = new mongoose.Schema({
  user: { type: Number, ref: "users", unique: true, dropDups: true },
  users: [{ type: Number, ref: "users" }],
});

module.exports = mongoose.model("environments", environmentSchema);
