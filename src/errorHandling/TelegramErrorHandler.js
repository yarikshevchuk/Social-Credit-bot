module.exports = function (err) {
  if (err instanceof TelegramError) {
    return res.status(err.status).json({ message: err.message });
  }
  return res.status(500).json({ message: "Unexpected error" });
};
