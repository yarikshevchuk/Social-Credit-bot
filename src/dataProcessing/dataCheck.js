module.exports = class DataCheck {
  static validateRatingUpdate(message) {
    if (message.from.is_bot) return false;
    if (!message.reply_to_message) return false;
    if (message.reply_to_message.from.is_bot) return false;
    if (message.chat.type === "private") return false;
    if (message.reply_to_message.from.id === message.from.id) return false;
    return true;
  }
};
