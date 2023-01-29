const mongoose = require("mongoose");

const roleSchema = new mongoose.Schema({
  value: { type: String, unique: true, default: "PARTYWORKER" },
});

module.exports = mongoose.model("roles", roleSchema);
