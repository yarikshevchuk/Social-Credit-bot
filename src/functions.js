const stickersLink = "https://t.me/addstickers/SocialCreditCounterStickers";
const Methods = require("./methods/methods");
const PromocodeMethods = require("./methods/promocodeMethods");
const DataCheck = require("./dataProcessing/dataCheck");
const Gifts = require("./gifts/gifts");
const Language = require("./languages/language");
const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");
const promocodeModel = require("./models/promocodeModel");
dotenv.config();

module.exports = class Functions {
  async start(ctx) {
    try {
      const message = ctx.message;

      const user = await Methods.getUser(ctx, "sender");

      let language = await Language.select(ctx);

      let response = `${language.start.response.userExists}`;

      if (!user) {
        await Methods.addUser(ctx, 0, "sender");

        await Methods.updateChat(ctx, "sender");
        response = `${language.start.response.userAdded}`;
      }

      ctx.telegram.sendMessage(message.chat.id, response);
    } catch (error) {
      console.log(error);
    }
  }

  async help(ctx) {
    try {
      const message = ctx.message;

      let language = await Language.select(ctx);

      let response = `${language.help.response.start} ${stickersLink} \n${language.help.response.end}`;

      ctx.telegram.sendMessage(message.chat.id, response);
    } catch (error) {
      console.log(error);
    }
  }

  async mySocialCredit(ctx) {
    try {
      const start = Date.now();
      const message = ctx.message;

      let language = await Language.select(ctx);

      let user = await Methods.getUser(ctx, "sender");

      if (!user) {
        await Methods.addUser(ctx, 0, "sender");
        user = await Methods.getUser(ctx, "sender");
      }

      ctx.telegram.sendMessage(
        message.chat.id,
        `${language.mySocialCredit.response} ${user.rating.currentRating}`,
        {
          reply_to_message_id: message.message_id,
        }
      );
      const end = Date.now() - start;
      console.log(end);
    } catch (error) {
      console.log(error);
    }
  }

  async membersSocialCredit(ctx) {
    try {
      const message = ctx.message;

      let language = await Language.select(ctx);

      if (message.chat.type === "private") {
        return ctx.telegram.sendMessage(
          message.chat.id,
          `${language.error.commandForGroupChats.response}`
        );
      }

      // await Methods.sortUsers();
      const usersList = await Methods.getUsers(ctx);
      const output = await Methods.printUsers(ctx, usersList);

      ctx.telegram.sendMessage(message.chat.id, `${output}`);
    } catch (error) {
      console.log(error);
    }
  }

  async chooseLanguage(ctx) {
    try {
      const message = ctx.message;

      let language = await Language.select(ctx);

      if (message.chat.type === "private") {
        ctx.telegram.sendMessage(
          message.chat.id,
          `${language.error.commandForGroupChats.response}`
        );
        return;
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

      let language = await Language.select(ctx);

      await ctx.telegram.editMessageReplyMarkup(
        message.chat.id,
        message.message_id
      );

      await ctx.telegram.editMessageText(
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

      let language = await Language.select(ctx);

      if (!(message.chat.type === "private")) {
        return ctx.telegram.sendMessage(
          message.chat.id,
          `${language.login.wrongChat.response}`
        );
      }

      const userData = await Methods.getUser(ctx, "sender");

      if (!userData) {
        return ctx.telegram.sendMessage(
          message.chat.id,
          `${language.login.notTracked.response}`
        );
      }

      const roles = userData.roles;

      const loginToken = jwt.sign(
        { _id: userData._id, roles: roles },
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

      let language = await Language.select(ctx);

      ctx.telegram.sendMessage(
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

      let language = await Language.select(ctx);

      ctx.session.promocode = ctx.message.text;
      const promocodeId = ctx.message.text;

      if (!(ctx.message.text.length == 12)) {
        return ctx.reply(`${language.promocode.wrongPromocode.response}`);
      }

      const promocode = await promocodeModel.findOne({
        promocode: promocodeId,
      });
      const user = await Methods.getUser(ctx, "sender");
      const time = Date.now();

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

  async textResponse(ctx) {
    try {
      const message = ctx.message;
      // ctx.telegram.sendPhoto(message.chat.id, gifts.bowlOfRice);
      // ctx.telegram.sendMessage(message.chat.id, message.text);
      // console.log(message);
    } catch (error) {
      console.log(error);
    }
  }

  async stickerResponse(ctx) {
    try {
      const message = ctx.message;
      const stickerId = message.sticker.file_unique_id;

      if (!DataCheck.validateRatingUpdate(message)) return;

      let hexEmoji = message.sticker.emoji.codePointAt(0).toString(16);

      if (stickerId === "AgADCR4AAmyzMUo") {
        await Methods.updateSomebodysRating(ctx, 20); // +20 social credit
      } else if (stickerId === "AgADwRwAArziMUo") {
        await Methods.updateSomebodysRating(ctx, -20); // -20 social credit
      } else if (hexEmoji == "1f44d") {
        await Methods.updateSomebodysRating(ctx, +15); // +15 social credit, response on thumb up sticker
      } else if (hexEmoji == "1f44e") {
        await Methods.updateSomebodysRating(ctx, -15); // -15 social credit, response on thumb down sticker
      } else if (stickerId === "AgAD4hcAAjgHOUo") {
        await Methods.updateSomebodysRating(ctx, 15); // +15 social credit
      } else if (stickerId === "AgADzxYAAh5YOEo") {
        await Methods.updateSomebodysRating(ctx, -15); // -15 social credit
      } else if (stickerId === "AgAD7BgAAs2SOUo") {
        await Methods.updateSomebodysRating(ctx, -30); // -30 social credit
      }
      // ctx.telegram.sendSticker(
      //   message.chat.id,
      //   "https://tlgrm.eu/_/stickers/c6c/262/c6c262f6-4406-3396-87a6-25b50e3f89a3/192/5.webp"
      // );

      const userData = await Methods.getUser(ctx, "receiver");
      if (!userData) return;

      const gifts = new Gifts(ctx, message, userData);
      await gifts.gift();
    } catch (error) {
      console.log(error);
    }
  }

  async aboba(ctx) {
    try {
      const message = ctx.message;

      let language = await Language.select(ctx);

      if (!(message.from.id == 1027937405)) {
        ctx.telegram.sendMessage(
          message.chat.id,
          `${language.error.response.accessDenied}`
        );
        return;
      }
      Methods.aboba(ctx);
    } catch (error) {
      console.log(error);
    }
  }
};
