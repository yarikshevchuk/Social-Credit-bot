const eng = require("./eng.json");
const ua = require("./ua.json");
const chinese = require("./chi.json");
const ChatSchema = require("../models/chatModel");

class Language {
  static async select(ctx) {
    const message = ctx.message;
    let language = await this._getLanguage(ctx);

    if (language === "ua") {
      return ua;
    } else if (language === "chi") {
      return chinese;
    } else {
      return eng;
    }
  }
  static async _getLanguage(ctx) {
    try {
      const message = ctx.message;

      const chats = await ChatSchema.where("_id").equals(message.chat.id);
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
