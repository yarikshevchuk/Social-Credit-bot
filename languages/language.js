const eng = require("./eng.json");
const ua = require("./ua.json");
const chinese = require("./chi.json");
const ChatSchema = require("../models/chatModel");

class Language {
  constructor(message) {
    this.message = message;
  }
  async select() {
    let language = await this._getLanguage();

    if (language === "ua") {
      return ua;
    } else if (language === "chi") {
      return chinese;
    } else {
      return eng;
    }
  }
  async _getLanguage() {
    try {
      const chats = await ChatSchema.where("_id").equals(this.message.chat.id);
      const chat = chats[0];

      let language = "eng";
      if (chat) language = chat.language;

      return language;
    } catch (error) {
      console.log(error);
    }
  }
}

module.exports = Language;
