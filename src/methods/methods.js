const DataProcessing = require("../dataProcessing/dataSampling");
const UserModel = require("../models/userModel");
const ChatModel = require("../models/chatModel");

module.exports = class Methods {
  static async changeLanguage(ctx, selectedLanguage) {
    try {
      const message = ctx.update.callback_query.message;
      const chat = await ChatModel.findOne({ _id: message.chat.id });

      if (chat) {
        chat.language = selectedLanguage;
        await chat.save();
      } else {
        if (message.chat.type === "private") return;

        const chat = await ChatModel.create({
          _id: message.chat.id,
        });
        chat.language = selectedLanguage;
        await chat.save();
      }
    } catch (error) {
      console.log(error);
    }
  }

  static async aboba(ctx) {
    try {
      const today = new Date().setHours(0, 0, 0, 0);
      const tomorrow = today + 24 * 60 * 60 * 1000;

      // await UserModel.updateMany(
      //   {},
      //   {
      //     $set: {
      //       ratingChangeLimit: {
      //         limit: 3000,
      //         todayLimit: 3000,
      //         updateAfter: tomorrow,
      //       },
      //     },
      //   }
      // );

      ctx.reply("nice");
    } catch (error) {
      console.log(error);
    }
  }
};
