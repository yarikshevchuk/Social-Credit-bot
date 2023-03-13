const DataProcessing = require("../dataProcessing/dataSampling");
const UserModel = require("../models/userModel");
const RoleModel = require("../models/roleModel");
const Language = require("../languages/language");
const Chat = require("./chat");
const Environment = require("./environment");
const usersTree = require("../dataProcessing/usersTree.js");

module.exports = class User {
  // basic user methods
  static async add(userData, chatId) {
    try {
      let user = await UserModel.findOne({ _id: userData._id });
      if (user) return user;

      const userRole = await RoleModel.findOne({ value: "PARTYWORKER" });

      const newUser = await UserModel.create({
        _id: userData._id,
        username: userData.username,
        first_name: userData.first_name,
        roles: [userRole.value],
        usedPromocodes: [],
        bannedUntil: 0,
        chats: [chatId],
      });
      console.log("user added");

      return newUser;
    } catch (error) {
      console.log(error);
    }
  }

  static async findInTreeById(userId) {
    try {
      const tree = await usersTree.get();
      const root = tree.getRoot();

      return await tree.find(parseInt(userId), root);
    } catch (error) {
      console.log(error);
    }
  }

  static async get(userId) {
    try {
      let user = await UserModel.findOne({ _id: userId });

      if (!user) {
        return console.log("user wasn't found");
      }

      return user;
    } catch (error) {
      console.log(error);
    }
  }

  static async delete(userId) {
    try {
      let user = await UserModel.findOne({ _id: userId });
      if (!user) return undefined;

      for (let i = 0; i < user.chats.length; i++) {
        await Chat.removeUser(user.chats[i], userId);
        await User.removeChat(userId, user.chats[i]);
      }

      user = await UserModel.deleteOne({ _id: userId });
      console.log(`Deleted user`);
      return user;
    } catch (error) {
      console.log(error);
    }
  }

  static async updateRating(ctx, rating) {
    try {
      const message = ctx.message;
      // extracting data from message
      let senderData = await DataProcessing.extractSenderData(message);
      let receiverData = await DataProcessing.extractReceiverData(message);

      const today = new Date().setHours(0, 0, 0, 0);
      const tomorrow = today + 24 * 60 * 60 * 1000;

      // Looking for sender, if user dosn't exist, we add sender data to db
      let sender = await UserModel.findOne({ _id: senderData._id });
      if (!sender) {
        await User.add(senderData, message.chat.id);
        sender = await UserModel.findOne({ _id: senderData._id });
      }
      // if sender is banned, we return
      if (await User._isBanned(ctx, sender)) {
        console.log(`${sender.username || sender.first_name} is banned`);
        return;
      }

      // refresh sender's today limit if the time has passed
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

      // rating change value can't exceed user's todayLimit
      if (Math.abs(rating) > sender.ratingChangeLimit.todayLimit)
        rating = Math.sign(rating) * sender.ratingChangeLimit.limit;
      // decreasing sender's today limit
      sender.ratingChangeLimit.todayLimit -= Math.abs(rating);

      // looking for receiver, if user doesn't exist, we add receiver data to db
      let receiver = await UserModel.findOne({ _id: receiverData._id });
      if (!receiver) {
        await User.add(receiverData, message.chat.id);
        receiver = await UserModel.findOne({ _id: receiverData._id });
      }
      // if receiver is banned, we return
      if (await User._isBanned(ctx, receiver)) {
        console.log(`${receiver.username || receiver.first_name} is banned`);
        return;
      }

      // changing rating
      receiver.rating.prevRating = receiver.rating.currentRating;
      receiver.rating.currentRating += rating;

      // changing gifts countdown
      receiver.giftsCountdown.smallGift -= rating;
      receiver.giftsCountdown.averageGift -= rating;
      receiver.giftsCountdown.bigGift -= rating;

      await receiver.save();
      await sender.save();
      console.log("data updated");
    } catch (error) {
      console.log(error);
    }
  }

  // methods that work with chats
  static async addChat(userId, chatId) {
    try {
      let user = await UserModel.findOne({ _id: userId });

      // quit conditions
      if (!user) return; //console.log("User wasn't found during attempt to add a chat");
      if (user.chats.includes(chatId)) return; //console.log("The chat was already added");

      user.chats.push(chatId);
      await user.save();

      return user;
    } catch (error) {
      console.log(error);
    }
  }

  static async removeChat(userId, chatId) {
    try {
      const user = await UserModel.findOne({ _id: userId });
      if (!user) return; //console.log("User doesn't exist");

      const chatPosition = user.chats.indexOf(chatId);
      if (chatPosition < 0) return;

      user.chats.splice(chatPosition, 1);
      await user.save();
      return user;
    } catch (error) {
      console.log(error);
    }
  }

  // methods that work with environment
  static async createEnvironment(user) {
    try {
      if (!user) return;

      const env = Environment.create(user);
      return env;
    } catch (error) {
      console.log(error);
    }
  }

  static async updateEnvironment(user) {
    try {
      if (!user) return;

      const env = Environment.update(user);
      return env;
    } catch (error) {
      console.log(error);
    }
  }

  static async adjustToEnvironment(user) {
    try {
      if (!user) return;

      // const env = await Environment.findById(user.env);
      if (!user.env) await User.createEnvironment(user);

      console.log(
        `${user.username || user.first_name}: ${user.rating.currentRating}`
      );

      const averageRating = await Environment.getAverageRating(user);

      // return if user is by his own
      if (averageRating === user.rating.currentRating) return user;

      const k = 0;
      let change = (averageRating - user.rating.currentRating) * k;

      const newRating = user.rating.currentRating + change;
      // const newRating = user.rating.currentRating * (1 - k) + averageRating * k;
      user.rating.currentRating = newRating.toFixed(8);
      await user.save();
      console.log("The rating was adjusted");

      return user;
    } catch (error) {
      console.log(error);
    }
  }

  // inner methods, and other...

  static async getAllUsers() {
    try {
      const users = await UserModel.find({});

      return users;
    } catch (error) {
      console.log(error);
    }
  }

  static async _isBanned(ctx, user) {
    const message = ctx.message;
    const language = await Language.select(message.chat.id);

    if (!(user.bannedUntil > Date.now())) return false;

    if (user.rating) user.rating.currentRating = 0;
    await ctx.reply(
      `${user.username || user.first_name} ${language.banned.response}`
    );
    await user.save();
    return true;
  }
};
