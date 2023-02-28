const eng = require("./eng.json");
const ua = require("./ua.json");
const chi = require("./chi.json");
const ChatModel = require("../models/chatModel");

class Language {
  static async select(chatId) {
    let language = await this._getLanguage(chatId);

    if (language === "ua") {
      return ua;
    } else if (language === "chi") {
      return chi;
    } else {
      return eng;
    }
  }
  static async _getLanguage(chatId) {
    try {
      const chat = await ChatModel.findOne({ _id: chatId });

      let language = "eng";
      if (chat) language = chat.language;

      return language;
    } catch (error) {
      console.log(error);
    }
  }
}

module.exports = Language;
