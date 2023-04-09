const UserModel = require("../models/userModel");
const ChatModel = require("../models/chatModel");
const Language = require("../languages/language");
const chatModel = require("../models/chatModel");

module.exports = class Chat {
  static async findById(chatId) {
    return await chatModel.findOne({ _id: chatId });
  }
  static async add(chatId, userId) {
    try {
      // if chat exsits, we add userId to the array
      const chat = await ChatModel.findOne({ _id: chatId });
      if (chat) return chat;

      const createdChat = await ChatModel.create({
        _id: chatId,
      });
      createdChat.users.push(userId);
      await createdChat.save();

      console.log("The chat was created");
      return createdChat;
    } catch (error) {
      console.log(error);
    }
  }

  static async addUser(chatId, userId) {
    try {
      let chat = await ChatModel.findOne({ _id: chatId });

      // quit if chat doesn't exist
      if (!chat) return;

      // removing user from removedUsers
      const removedUserPosition = chat.removedUsers.indexOf(userId);
      if (removedUserPosition >= 0) {
        chat.removedUsers.splice(removedUserPosition, 1);
        await chat.save();
      }

      // quit if user is in chat
      if (chat.users.includes(userId)) return chat;

      // adding user to chat and saving
      chat.users.push(userId);
      await chat.save();

      return chat;
    } catch (error) {
      console.log(error);
    }
  }

  static async removeUser(chatId, userId) {
    try {
      const chat = await chatModel.findOne({ _id: chatId });
      if (!chat) return; //console.log("Chat doesn't exist");

      const userPosition = chat.users.indexOf(userId);
      if (userPosition < 0) return;
      chat.users.splice(userPosition, 1);

      if (!chat.removedUsers.includes(userId)) chat.removedUsers.push(userId);

      return await chat.save();
    } catch (error) {
      console.log(error);
    }
  }

  static async getUsers(chatId) {
    try {
      const chat = await ChatModel.findOne({ _id: chatId });

      let users = [];
      for (let i = 0; i < chat.users.length; i++) {
        const user = await UserModel.findOne({ _id: chat.users[i] });
        users.push(user);
      }

      const sortedUsers = users.sort(Chat._sortArr);

      return sortedUsers;
    } catch (error) {
      console.log(error);
    }
  }

  static async printUsers(ctx, usersList) {
    try {
      const message = ctx.message;
      let language = await Language.select(message.chat.id);

      let response = `${language.printUsers.response}`;

      if (!usersList) return;
      for (let i = 0; i < usersList.length; i++) {
        const user = usersList[i];
        if (!user) continue;

        response =
          response +
          `\n${i + 1}) ${user.username || user.first_name}: ${Math.floor(
            user.rating.currentRating
          )}`;
      }

      return response;
    } catch (error) {
      console.log(error);
    }
  }

  static _sortArr(a, b) {
    try {
      if (a.rating.currentRating > b.rating.currentRating) {
        return -1;
      } else if (a.rating.currentRating < b.rating.currentRating) {
        return 1;
      } else {
        return 0;
      }
    } catch (error) {
      return 1;
    }
  }
};
