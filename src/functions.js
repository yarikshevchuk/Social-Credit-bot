const stickersLink = "https://t.me/addstickers/SocialCreditCounterStickers";
const Methods = require("./methods/methods");
const checkData = require("./dataProcessing/dataCheck");
const Gifts = require("./gifts/gifts");
const Language = require("./languages/language");
const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");
dotenv.config();

module.exports = class Functions {
  async start(ctx) {
    try {
      const message = ctx.message;
      const methods = new Methods(message);
      const userData = await methods.getUser();

      const lang = new Language(message);
      let language = await lang.select();

      let response = `${language.start.response.userExists}`;
      if (!userData) {
        await methods.addUser(0);
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

      const lang = new Language(message);
      let language = await lang.select();

      let response = `${language.help.response.start} ${stickersLink} \n${language.help.response.end}`;

      ctx.telegram.sendMessage(message.chat.id, response);
    } catch (error) {
      console.log(error);
    }
  }

  async mySocialCredit(ctx) {
    try {
      const message = ctx.message;

      const lang = new Language(message);
      let language = await lang.select();

      const methods = new Methods(message);
      let userData = await methods.getUser("sender");

      if (!userData) {
        await methods.addUser(0);
        userData = await methods.getUser("sender");
      }

      ctx.telegram.sendMessage(
        message.chat.id,
        `${language.mySocialCredit.response} ${userData.rating.currentRating}`,
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
      const message = ctx.message;

      const lang = new Language(message);
      let language = await lang.select();

      if (message.chat.type === "private") {
        return ctx.telegram.sendMessage(
          message.chat.id,
          `${language.other.commandForGroupChats}`
        );
      }
      const methods = new Methods(message);
      // await methods.sortUsers();
      const usersList = await methods.getUsers();
      const output = await methods.printUsers(usersList);

      ctx.telegram.sendMessage(message.chat.id, `${output}`);
    } catch (error) {
      console.log(error);
    }
  }

  async chooseLanguage(ctx) {
    try {
      const message = ctx.message;

      const lang = new Language(message);
      let language = await lang.select();

      if (message.chat.type === "private") {
        ctx.telegram.sendMessage(
          message.chat.id,
          `${language.other.commandForGroupChats}`
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

      ctx.telegram.sendMessage(
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
      const data = ctx.update.callback_query.data;

      const methods = new Methods(message);
      await methods.changeLanguage(data);

      const lang = new Language(message);
      let language = await lang.select();

      ctx.telegram.sendMessage(
        message.chat.id,
        `${language.changeLanguage.response}`
      );
    } catch (error) {
      console.log(error);
    }
  }

  async login(ctx) {
    try {
      const message = ctx.message;
      const methods = new Methods(message);

      const lang = new Language(message);
      let language = await lang.select();

      if (!(message.chat.type === "private")) {
        return ctx.telegram.sendMessage(
          message.chat.id,
          `${language.login.wrongChat.response}`
        );
      }

      const userData = await methods.getUser("sender");

      if (!userData) {
        return ctx.telegram.sendMessage(
          message.chat.id,
          `${language.login.notTracked.response}`
        );
      }

      const roles = userData.roles;

      const loginToken = jwt.sign(
        { _id: userData._id, role: roles },
        process.env.JWTSECRETKEY,
        { expiresIn: "15m" }
      );

      ctx.telegram.sendMessage(
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
      const methods = new Methods(message);

      const lang = new Language(message);
      let language = await lang.select();

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
      const methods = new Methods(message);

      const lang = new Language(message);
      let language = await lang.select();

      ctx.session.promocode = ctx.message.text;
      await ctx.reply(`Accepted ${message.text}`);
    } catch (error) {
      console.log(error);
    }
  }

  async textResponse(ctx) {
    try {
      const message = ctx.message;
      // ctx.telegram.sendPhoto(message.chat.id, gifts.bowlOfRice);
      // ctx.telegram.sendMessage(message.chat.id, message.text);
      console.log(message);
    } catch (error) {
      console.log(error);
    }
  }

  async stickerResponse(ctx) {
    try {
      const message = ctx.message;
      const stickerId = message.sticker.file_unique_id;

      if (!checkData.check(message)) return;

      let hexEmoji = message.sticker.emoji.codePointAt(0).toString(16);

      const methods = new Methods(message);

      if (stickerId === "AgADCR4AAmyzMUo") {
        await methods.updateUser(20, "receiver"); // +20 social credit
      } else if (stickerId === "AgADwRwAArziMUo") {
        await methods.updateUser(-20, "receiver"); // -20 social credit
      } else if (hexEmoji == "1f44d") {
        await methods.updateUser(+15, "receiver"); // +15 social credit, response on thumb up sticker
      } else if (hexEmoji == "1f44e") {
        await methods.updateUser(-15, "receiver"); // -15 social credit, response on thumb down sticker
      } else if (stickerId === "AgAD4hcAAjgHOUo") {
        await methods.updateUser(15, "receiver"); // +15 social credit
      } else if (stickerId === "AgADzxYAAh5YOEo") {
        await methods.updateUser(-15, "receiver"); // -15 social credit
      } else if (stickerId === "AgAD7BgAAs2SOUo") {
        await methods.updateUser(-30, "receiver"); // -30 social credit
      }
      // ctx.telegram.sendSticker(
      //   message.chat.id,
      //   "https://tlgrm.eu/_/stickers/c6c/262/c6c262f6-4406-3396-87a6-25b50e3f89a3/192/5.webp"
      // );

      const userData = await methods.getUser("receiver");
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
      const methods = new Methods(message);

      const lang = new Language(this.message);
      let language = await lang.select();

      if (!(this.message.from.id == 1027937405)) {
        ctx.telegram.sendMessage(
          this.message.chat.id,
          `${language.other.accessDenied}`
        );
        return;
      }
      methods.aboba(ctx);
    } catch (error) {
      console.log(error);
    }
  }
};
