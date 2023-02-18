const DataProcessing = require("../dataProcessing/dataSampling");
const UserModel = require("../models/userModel");
const ChatModel = require("../models/chatModel");
const RoleModel = require("../models/roleModel");
const Language = require("../languages/language");
const Methods = require("./methods");
const UserMethods = require("./userMethods");

module.exports = class ChatMethods {
  static async update(ctx, target) {
    try {
      const message = ctx.message;
      let userData;

      if (target === "receiver") {
        userData = DataProcessing.extractReceiverData(message);
      } else if (target === "sender") {
        userData = DataProcessing.extractSenderData(message);
      } else {
        return;
      }

      const chats = await ChatModel.where("_id").equals(message.chat.id);
      const chat = chats[0];

      if (chat) {
        if (chat.users.includes(userData._id)) return;
        chat.users.push(userData._id);
        return await chat.save();
      }

      if (message.chat.type === "private") return;

      const createdChat = await ChatModel.create({
        _id: message.chat.id,
      });
      createdChat.users.push(userData._id);
      await createdChat.save();
    } catch (error) {
      console.log(error);
    }
  }

  static async getUsers(ctx) {
    try {
      const message = ctx.message;
      const chats = await ChatModel.where("_id")
        .equals(message.chat.id)
        .populate("users");

      const usersList = chats[0].users;
      const sortedArray = usersList.sort(ChatMethods._sortArr);
      return sortedArray;
    } catch (error) {
      console.log(error);
    }
  }

  static async printUsers(ctx, usersList) {
    try {
      const message = ctx.message;

      let language = await Language.select(ctx);

      let response = `${language.printUsers.response}`;

      if (!usersList) return;

      await usersList.forEach((user, index) => {
        response =
          response +
          `\n${index + 1}) ${
            user.username || user.first_name || user.last_name
          }: ${user.rating.currentRating}`;
      });

      return response;
    } catch (error) {
      console.log(error);
    }
  }

  static _sortArr(a, b) {
    if (a.rating.currentRating > b.rating.currentRating) {
      return -1;
    } else if (a.rating.currentRating < b.rating.currentRating) {
      return 1;
    } else {
      return 0;
    }
  }
};
