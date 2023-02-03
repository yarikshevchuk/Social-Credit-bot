const DataProcessing = require("../dataProcessing/dataSampling");
const UserModel = require("../models/userModel");
const ChatModel = require("../models/chatModel");
const RoleModel = require("../models/roleModel");
const Language = require("../languages/language");
const { betterConsoleLog } = require("telegram/Helpers");

module.exports = class UserMethods {
  constructor(message) {
    this.message = message;
  }

  async addUser(currentRating, data = null) {
    try {
      let userData;
      if (data) {
        userData = data;
      } else {
        userData = DataProcessing.extractSenderData(this.message);
      }

      let users = await UserModel.where("_id").equals(userData._id);
      let user = users[0];
      if (user) return;

      const userRoles = await RoleModel.where("value").equals("PARTYWORKER");
      const userRole = userRoles[0];

      await UserModel.create({
        _id: userData._id,
        username: userData.username,
        first_name: userData.first_name,
        roles: [userRole.value],
        rating: {
          currentRating: currentRating,
          prevRating: 0,
        },
        giftsCountdown: {
          bowlOfRice: 300,
          catWife: 1000,
          respectFromXi: 5000,
        },
        usedPromocodes: [],
        bannedUntil: 0,
        ratingChangeLimit: 5000,
      });
      console.log("user added");
    } catch (error) {
      console.log(error);
    }
  }

  async getUser(target) {
    let userData;

    if (target === "receiver") {
      userData = DataProcessing.extractReceiverData(this.message);
    } else if (target === "sender") {
      userData = DataProcessing.extractSenderData(this.message);
    } else {
      return;
    }

    let users = await UserModel.where("_id").equals(userData._id);
    let user = users[0];

    if (!user) {
      return console.log("user wasn't found");
    }

    // console.log(user);

    return user;
  }

  async updateSomebodysRating(message, rating) {
    try {
      // extracting data from message
      let senderData = DataProcessing.extractSenderData(message);
      let receiverData = DataProcessing.extractReceiverData(message);

      const today = new Date().setHours(0, 0, 0, 0);
      const tomorrow = today + 24 * 60 * 60 * 1000;

      // Looking for sender, if user dosn't exist, we add sender data to db
      let sender = await UserModel.findOne({ _id: senderData._id });
      if (!sender) {
        await this.addUser(0, senderData);
        await this.updateChat("sender");
        sender = await UserModel.findOne({ _id: senderData._id });
      }
      if (await this._isBanned(sender)) {
        console.log(`${sender.username || sender.first_name} is banned`);
        return;
      }

      // update sender's today limit if the time has passed
      if (sender.ratingChangeLimit.updateAfter < Date.now()) {
        sender.ratingChangeLimit.todayLimit = sender.ratingChangeLimit.limit;
        sender.ratingChangeLimit.updateAfter = tomorrow;
      }
      //  checking if user's daily limit to change rating hasn't expired
      if (sender.ratingChangeLimit.todayLimit <= 0) {
        console.log("Daily limit expired");
        sender.ratingChangeLimit.updateAfter = tomorrow;
        return await sender.save();
      }
      sender.ratingChangeLimit.todayLimit -= Math.abs(rating); // decreasing today limit

      // looking for receiver, if user doesn't exist, we add receiver data to db
      let receiver = await UserModel.findOne({ _id: receiverData._id });
      if (!receiver) {
        await this.addUser(rating, receiverData);
        await this.updateChat("receiver");
        receiver = await UserModel.findOne({ _id: receiverData._id });
      }
      if (await this._isBanned(receiver)) {
        console.log(`${receiver.username || receiver.first_name} is banned`);
        return;
      }

      receiver.rating.prevRating = receiver.rating.currentRating;
      receiver.rating.currentRating += rating;

      // якщо рейтинг користувача нижче нуля, тоді не можна змінювати відлік подарунку
      // if (receiver.rating.currentRating < 0) {
      //   await receiver.save();
      //   return await this.updateChat("receiver");
      // }

      receiver.giftsCountdown.smallGift -= rating;
      receiver.giftsCountdown.averageGift -= rating;
      receiver.giftsCountdown.bigGift -= rating;

      await receiver.save();
      await this.updateChat("receiver");
      await sender.save();
      console.log("data updated");
    } catch (error) {
      console.log(error);
    }
  }

  async updateChat(target) {
    try {
      let userData;

      if (target === "receiver") {
        userData = DataProcessing.extractReceiverData(this.message);
      } else if (target === "sender") {
        userData = DataProcessing.extractSenderData(this.message);
      } else {
        return;
      }

      const chats = await ChatModel.where("_id").equals(this.message.chat.id);
      const chat = chats[0];

      if (chat) {
        if (chat.users.includes(userData._id)) return;
        chat.users.push(userData._id);
        return await chat.save();
      }

      if (this.message.chat.type === "private") return;

      const createdChat = await ChatModel.create({
        _id: this.message.chat.id,
      });
      createdChat.users.push(userData._id);
      await createdChat.save();
    } catch (error) {
      console.log(error);
    }
  }

  async changeLanguage(data) {
    try {
      const chats = await ChatModel.where("_id").equals(this.message.chat.id);
      const chat = chats[0];

      if (chat) {
        chat.language = data;
        await chat.save();
      } else {
        if (this.message.chat.type === "private") return;

        const chat = await ChatModel.create({
          _id: this.message.chat.id,
        });
        chat.language = data;
        await chat.save();
      }
    } catch (error) {
      console.log(error);
    }
  }

  async getUsers() {
    try {
      const chats = await ChatModel.where("_id")
        .equals(this.message.chat.id)
        .populate("users");

      const usersList = chats[0].users;
      const sortedArray = usersList.sort(this._sortArr);
      return sortedArray;
    } catch (error) {
      console.log(error);
    }
  }

  async printUsers(usersList) {
    try {
      const lang = new Language(this.message);
      let language = await lang.select();

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

  // async sortUsers() {
  //   await UserSchema.aggregate([
  //     { $group: { _id: "$username" } },
  //     { $limit: 50 },
  //     { $sort: { currentRating: -1 } },
  //   ]);
  // }

  _sortArr(a, b) {
    if (a.rating.currentRating > b.rating.currentRating) {
      return -1;
    } else if (a.rating.currentRating < b.rating.currentRating) {
      return 1;
    } else {
      return 0;
    }
  }

  async _isBanned(user) {
    console.log(user.bannedUntil, Date.now());

    if (!(user.bannedUntil > Date.now())) return false;

    if (user.rating) user.rating.currentRating = 0;
    await user.save();
    return true;
  }

  async aboba(ctx) {
    try {
      const today = new Date().setHours(0, 0, 0, 0);
      const tomorrow = today + 24 * 60 * 60 * 1000;

      // await UserModel.updateMany(
      //   { ratingChangeLimit: { $exists: true } },
      //   {
      //     $set: {
      //       ratingChangeLimit: {
      //         limit: 5000,
      //         todayLimit: 5000,
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
