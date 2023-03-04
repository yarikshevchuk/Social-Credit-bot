const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");
const promocodeModel = require("./models/promocodeModel");
const PromocodeMethods = require("./methods/promocode");
const DataCheck = require("./dataProcessing/dataCheck");
const Gifts = require("./gifts/gifts");
const Language = require("./languages/language");
const User = require("./methods/user");
const Methods = require("./methods/methods");
const Chat = require("./methods/chat");
const DataProcessing = require("./dataProcessing/dataSampling");
const usersTree = require("./dataProcessing/chatsTree.js");

const stickersLink = "https://t.me/addstickers/SocialCreditCounterStickers";

dotenv.config();

module.exports = class Functions {
  async start(ctx) {
    try {
      const message = ctx.message;
      const senderData = await DataProcessing.extractSenderData(message);

      const language = await Language.select(message.chat.id);

      let response = `${language.start.response.userExists}`;

      // if user doesn't exist, we start tracking him
      const user = await User.get(senderData._id);
      if (!user) {
        await User.add(senderData, message.chat.id);
        await User.addChat(ctx, message.from.id, message.chat.id);

        response = `${language.start.response.userAdded}`;
      }

      // Creating a chat, if it doesn't exist. Connecting user to the chat.
      if (message.chat.type !== "private") {
        await Chat.add(message.chat.id, senderData._id);
        await Chat.addUser(message.chat.id, senderData._id);
        await User.addChat(senderData._id, message.chat.id);
      }

      ctx.telegram.sendMessage(message.chat.id, response);
    } catch (error) {
      console.log(error);
    }
  }

  async help(ctx) {
    try {
      const message = ctx.message;
      const senderData = await DataProcessing.extractSenderData(message);
      const language = await Language.select(message.chat.id);

      // if user doesn't exist, we start tracking him
      let user = await User.get(senderData._id);
      if (!user) {
        await User.add(senderData, message.chat.id);
        user = await User.get(senderData._id);
      }

      let response = `${language.help.response.start} ${stickersLink} \n${language.help.response.end}`;

      // Creating a chat, if it doesn't exist. Connecting user to the chat.
      if (message.chat.type !== "private") {
        await Chat.add(message.chat.id, senderData._id);
        await Chat.addUser(message.chat.id, senderData._id);
        await User.addChat(senderData._id, message.chat.id);
      }

      return await ctx.telegram.sendMessage(message.chat.id, response);
    } catch (error) {
      console.log(error);
    }
  }

  async mySocialCredit(ctx) {
    try {
      const message = ctx.message;
      const senderData = await DataProcessing.extractSenderData(message);
      const language = await Language.select(message.chat.id);

      // if user doesn't exist, we start tracking him
      let user = await User.get(senderData._id);
      if (!user) {
        await User.add(senderData, message.chat.id);
        user = await User.get(senderData._id);
      }

      // Creating a chat, if it doesn't exist. Connecting user to the chat.
      if (message.chat.type !== "private") {
        await Chat.add(message.chat.id, senderData._id);
        await Chat.addUser(message.chat.id, senderData._id);
        await User.addChat(senderData._id, message.chat.id);
      }

      return ctx.telegram.sendMessage(
        message.chat.id,
        `${language.mySocialCredit.response} ${user.rating.currentRating}`,
        {
          reply_to_message_id: message.message_id,
        }
      );
    } catch (error) {
      console.log(error);
    }
  }

  async membersSocialCredit(ctx) {
    try {
      const start = Date.now();

      const message = ctx.message;
      const senderData = await DataProcessing.extractSenderData(message);
      const language = await Language.select(message.chat.id);

      if (message.chat.type === "private") {
        return ctx.reply(`${language.error.commandForGroupChats.response}`);
      }

      // if user doesn't exist, we start tracking him
      let user = await User.get(senderData._id);
      if (!user) {
        await User.add(senderData, message.chat.id);
        user = await User.get(senderData._id);
      }

      // Creating a chat, if it doesn't exist. Connecting user to the chat.
      if (message.chat.type !== "private") {
        await Chat.add(message.chat.id, senderData._id);
        await Chat.addUser(message.chat.id, senderData._id);
        await User.addChat(senderData._id, message.chat.id);
      }

      // await Methods.sortUsers();
      const users = await Chat.getUsers(message.chat.id);
      const output = await Chat.printUsers(ctx, users);

      const end = Date.now() - start;
      console.log("Time spent to get all users " + end);

      return ctx.reply(`${output}`);
    } catch (error) {
      console.log(error);
    }
  }

  async chooseLanguage(ctx) {
    try {
      const message = ctx.message;
      const senderData = await DataProcessing.extractSenderData(message);
      const language = await Language.select(message.chat.id);

      // if user doesn't exist, we start tracking him
      let user = await User.get(senderData._id);
      if (!user) {
        await User.add(senderData, message.chat.id);
        user = await User.get(senderData._id);
      }

      if (message.chat.type === "private") {
        return ctx.telegram.sendMessage(
          message.chat.id,
          `${language.error.commandForGroupChats.response}`
        );
      }

      const languageOptions = {
        reply_markup: JSON.stringify({
          inline_keyboard: [
            [
              { text: "English", callback_data: "eng" },
              { text: "Українська", callback_data: "ua" },
              { text: "中国人", callback_data: "chi" },
            ],
          ],
        }),
      };

      return ctx.telegram.sendMessage(
        message.chat.id,
        `${language.language.response}`,
        languageOptions
      );
    } catch (error) {
      console.log(error);
    }
  }

  async changeLanguage(ctx) {
    try {
      const message = ctx.update.callback_query.message;
      const selectedLanguage = ctx.update.callback_query.data;

      await Methods.changeLanguage(ctx, selectedLanguage);
      const language = await Language.select(message.chat.id);

      await ctx.telegram.editMessageReplyMarkup(
        message.chat.id,
        message.message_id
      );

      return await ctx.telegram.editMessageText(
        message.chat.id,
        message.message_id,
        undefined,
        `${language.changeLanguage.response}`
      );
    } catch (error) {
      console.log(error);
    }
  }

  async login(ctx) {
    try {
      const message = ctx.message;
      const senderData = await DataProcessing.extractSenderData(message);
      const language = await Language.select(message.chat.id);

      if (!(message.chat.type === "private")) {
        return ctx.telegram.sendMessage(
          message.chat.id,
          `${language.login.wrongChat.response}`
        );
      }

      // if user doesn't exist, we start tracking him
      let user = await User.get(senderData._id);
      if (!user) {
        await User.add(senderData, message.chat.id);
        user = await User.get(senderData._id);
      }

      const roles = user.roles;

      const loginToken = jwt.sign(
        { _id: user._id, roles: roles },
        process.env.JWTSECRETKEY,
        { expiresIn: "15m" }
      );

      await ctx.telegram.sendMessage(
        message.chat.id,
        `${language.login.success.response}`
      );

      return ctx.telegram.sendMessage(message.chat.id, `${loginToken}`);
    } catch (error) {
      console.log(error);
    }
  }

  async enterPromocode(ctx) {
    try {
      const message = ctx.message;
      const senderData = await DataProcessing.extractSenderData(message);
      const language = await Language.select(message.chat.id);

      // if user doesn't exist, we start tracking him
      let user = await User.get(senderData._id);
      if (!user) {
        await User.add(senderData, message.chat.id);
        user = await User.get(senderData._id);
      }

      // Creating a chat, if it doesn't exist. Connecting user to the chat.
      if (message.chat.type !== "private") {
        await Chat.add(message.chat.id, senderData._id);
        await Chat.addUser(message.chat.id, senderData._id);
        await User.addChat(senderData._id, message.chat.id);
      }

      return ctx.telegram.sendMessage(
        message.chat.id,
        `${language.promocode.ask.response}`
      );
    } catch (error) {
      console.log(error);
    }
  }

  async handlePromocode(ctx) {
    try {
      const message = ctx.message;
      const senderData = await DataProcessing.extractSenderData(message);

      const language = await Language.select(message.chat.id);

      ctx.session.promocode = ctx.message.text;
      const promocodeId = ctx.message.text;

      // checking if the length is correct
      if (!(ctx.message.text.length == 12)) {
        return ctx.reply(`${language.promocode.wrongPromocode.response}`);
      }

      const promocode = await promocodeModel.findOne({
        promocode: promocodeId,
      });
      const user = await User.get(senderData._id);
      const time = Date.now();

      // checking all the conditions
      if (!user) return ctx.reply("User doesn't exists");
      if (!promocode) return ctx.reply("Promocode dosn't exists");
      if (user.usedPromocodes.includes(promocodeId)) {
        return ctx.reply("Promocode has been already used");
      }
      if (promocode.count <= 0) return ctx.reply("No such promocodes left");
      if (time > promocode.exp) {
        return ctx.reply(
          `${language.promocode.promocodeExpired.response.start} ${promocode.value} ${language.promocode.promocodeExpired.response.end}`
        );
      }

      await PromocodeMethods.updateRating(message, promocode.value);

      // fair changes(I forgot how to say it properly)
      promocode.count -= 1;
      user.usedPromocodes.push(promocodeId);

      user.save();
      promocode.save();
      return ctx.reply(
        `${language.promocode.success.response.start} ${promocode.value} ${language.promocode.success.response.end}`
      );
    } catch (error) {
      console.log(error);
    }
  }

  async messageResponse(ctx) {
    try {
      const message = ctx.message;

      if (message.left_chat_member) {
        await Chat.removeUser(message.chat.id, message.left_chat_member.id);
      }

      if (message.new_chat_members) {
        for (const member of message.new_chat_members) {
          const user = await User.get(member.id);
          if (!user) continue;

          // Creating a chat, if it doesn't exist. Connecting user to the chat.
          if (message.chat.type !== "private") {
            await Chat.add(message.chat.id, user._id);
            await Chat.addUser(message.chat.id, user._id);
            await User.addChat(user._id, message.chat.id);
          }
          console.log(`Member with id ${user._id} was added to the group`);
        }
        console.log(message.new_chat_members);
      }
    } catch (error) {
      console.log(error);
    }
  }

  async stickerResponse(ctx) {
    try {
      const message = ctx.message;

      const stickerId = message.sticker.file_unique_id;
      if (!DataCheck.validateRatingUpdate(message)) return;

      const receiverData = await DataProcessing.extractReceiverData(message);

      // if chat isn't private, doesn't exist, create a chat. Link chat to the user
      let chat;
      if (message.chat.type !== "private") {
        chat = await Chat.add(message.chat.id, receiverData._id);
        chat = await Chat.addUser(message.chat.id, receiverData._id);
        await User.addChat(receiverData._id, message.chat.id);
      }

      console.log(chat);
      if (chat.removedUsers.includes(receiverData._id))
        return console.log("User was removed from chat");

      let hexEmoji = message.sticker.emoji.codePointAt(0).toString(16);

      if (stickerId === "AgADCR4AAmyzMUo") {
        await User.updateRating(ctx, 20); // +20 social credit
      } else if (stickerId === "AgADwRwAArziMUo") {
        await User.updateRating(ctx, -20); // -20 social credit
      } else if (hexEmoji == "1f44d") {
        await User.updateRating(ctx, +15); // +15 social credit, response on thumb up sticker
      } else if (hexEmoji == "1f44e") {
        await User.updateRating(ctx, -15); // -15 social credit, response on thumb down sticker
      } else if (stickerId === "AgAD4hcAAjgHOUo") {
        await User.updateRating(ctx, 15); // +15 social credit
      } else if (stickerId === "AgADzxYAAh5YOEo") {
        await User.updateRating(ctx, -15); // -15 social credit
      } else if (stickerId === "AgAD7BgAAs2SOUo") {
        await User.updateRating(ctx, -30); // -30 social credit
      }

      const user = await User.get(receiverData._id);
      if (!user) return;

      const gifts = new Gifts(ctx, message, user);
      await gifts.gift();
    } catch (error) {
      console.log(error);
    }
  }

  // development functions

  async aboba(ctx) {
    try {
      const message = ctx.message;

      const language = await Language.select(message.chat.id);

      if (!(message.from.id === 1027937405)) {
        return await ctx.telegram.sendMessage(
          message.chat.id,
          `${language.error.accessDenied.response}`
        );
      }
      await Methods.aboba(ctx);
    } catch (error) {
      console.log(error);
    }
  }

  async deleteOtherMe(ctx) {
    try {
      const message = ctx.message;

      const language = await Language.select(message.chat.id);

      if (!(message.from.id === 1027937405)) {
        return await ctx.telegram.sendMessage(
          message.chat.id,
          `${language.error.accessDenied.response}`
        );
      }

      await User.delete(5959901100);
      return await ctx.reply("done");
    } catch (error) {
      console.log(error);
    }
  }

  async shareMyData(ctx) {
    try {
      const message = ctx.message;
      const senderData = await DataProcessing.extractSenderData(message);

      const user = await User.get(senderData._id);
      if (!user) return ctx.reply("I'm gay.");

      return ctx.reply(user);
    } catch (error) {
      console.log(error);
    }
  }

  async adjustRating(ctx) {
    try {
      const message = ctx.message;
      const language = await Language.select(message.chat.id);

      if (!(message.from.id === 1027937405)) {
        return await ctx.telegram.sendMessage(
          message.chat.id,
          `${language.error.accessDenied.response}`
        );
      }

      const start = Date.now();

      const users = await User.getAllUsers();
      await usersTree.set(users);

      for (let i = 0; i < users.length; i++) {
        await User.updateEnvironment(users[i]);
        await User.adjustToEnvironment(users[i]);
      }

      const end = Date.now() - start;
      console.log("time:", end);

      return await ctx.reply(
        `Yay, it took ${(end / 1000).toFixed(2)} seconds to update ${
          users.length
        } users`
      );
    } catch (error) {
      console.log(error);
    }
  }
};
