const DataProcessing = require("../dataProcessing/dataSampling");
const UserModel = require("../models/userModel");
const ChatModel = require("../models/chatModel");
const RoleModel = require("../models/roleModel");
const Language = require("../languages/language");
const Methods = require("./methods");
const ChatMethods = require("./chatMethods");

module.exports = class UserMethods {
  static async add(ctx, rating, target = "sender") {
    try {
      const message = ctx.message;

      let userData;

      if (target == "receiver") {
        userData = DataProcessing.extractReceiverData(message);
      } else {
        userData = DataProcessing.extractSenderData(message);
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
          currentRating: rating,
          prevRating: 0,
        },
        giftsCountdown: {
          bowlOfRice: 300,
          catWife: 1000,
          respectFromXi: 5000,
        },
        usedPromocodes: [],
        bannedUntil: 0,
      });
      console.log("user added");
    } catch (error) {
      console.log(error);
    }
  }

  static async get(ctx, target) {
    const message = ctx.message;

    let userData;

    if (target === "receiver") {
      userData = DataProcessing.extractReceiverData(message);
    } else if (target === "sender") {
      userData = DataProcessing.extractSenderData(message);
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

  static async updateRating(ctx, rating) {
    try {
      const message = ctx.message;
      // extracting data from message
      let senderData = DataProcessing.extractSenderData(message);
      let receiverData = DataProcessing.extractReceiverData(message);

      const today = new Date().setHours(0, 0, 0, 0);
      const tomorrow = today + 24 * 60 * 60 * 1000;

      // Looking for sender, if user dosn't exist, we add sender data to db
      let sender = await UserModel.findOne({ _id: senderData._id });
      if (!sender) {
        await UserMethods.add(ctx, 0, "sender");
        await ChatMethods.update(ctx, "sender");
        sender = await UserModel.findOne({ _id: senderData._id });
      }
      // if sender is banned, we return
      if (await UserMethods._isBanned(ctx, sender)) {
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
        await UserMethods.add(ctx, rating, "receiver");
        await ChatMethods.update(ctx, "receiver");
        receiver = await UserModel.findOne({ _id: receiverData._id });
      }
      // if receiver is banned, we return
      if (await UserMethods._isBanned(ctx, receiver)) {
        console.log(`${receiver.username || receiver.first_name} is banned`);
        return;
      }

      receiver.rating.prevRating = receiver.rating.currentRating;
      receiver.rating.currentRating += rating;

      // якщо рейтинг користувача нижче нуля, тоді не можна змінювати відлік подарунку
      // if (receiver.rating.currentRating < 0) {
      //   await receiver.save();
      //   return await ChatMethods.update(ctx, "receiver");
      // }

      receiver.giftsCountdown.smallGift -= rating;
      receiver.giftsCountdown.averageGift -= rating;
      receiver.giftsCountdown.bigGift -= rating;

      await receiver.save();
      await CharMethods.update(ctx, "receiver");
      await sender.save();
      console.log("data updated");
    } catch (error) {
      console.log(error);
    }
  }

  static async _isBanned(ctx, user) {
    const message = ctx.message;

    let language = await Language.select(ctx);

    if (!(user.bannedUntil > Date.now())) return false;

    if (user.rating) user.rating.currentRating = 0;
    await ctx.reply(
      `${user.username || user.first_name} ${language.banned.response}`
    );
    await user.save();
    return true;
  }
};
