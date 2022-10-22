const stickersLink = "https://t.me/addstickers/SocialCreditCounterStickers";
const User = require("./user");
const checkData = require("./data_check");
const Gifts = require("./gifts/gifts");
const Language = require("./languages/language");

module.exports = class Functions {
  async start(ctx) {
    const message = ctx.message;
    const user = new User(message);
    const userData = await user.get();

    const lang = new Language(message);
    let language = await lang.select();

    let response = `${language.start.response.userExists}`;
    if (!userData) {
      await user.add(0);
      response = `${language.start.response.userAdded}`;
    }

    ctx.telegram.sendMessage(message.chat.id, response);
  }

  async help(ctx) {
    const message = ctx.message;

    const lang = new Language(message);
    let language = await lang.select();

    let response = `${language.help.response.start} \n${stickersLink}\n${language.help.response.end}`;

    ctx.telegram.sendMessage(message.chat.id, response);
  }

  async mySocialCredit(ctx) {
    try {
      const message = ctx.message;

      const lang = new Language(message);
      let language = await lang.select();

      const user = new User(message);
      let userData = await user.get("sender");

      if (!userData) {
        await user.add(0);
        userData = await user.get("sender");
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
    const user = new User(message);
    // await user.sortUsers();
    const usersList = await user.getUsers();
    const output = await user.printUsers(usersList);

    ctx.telegram.sendMessage(message.chat.id, `${output}`);
  }

  async language(ctx) {
    const message = ctx.message;

    const lang = new Language(message);
    let language = await lang.select();

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
  }

  async changeLanguage(ctx) {
    const message = ctx.update.callback_query.message;
    const data = ctx.update.callback_query.data;

    const user = new User(message);
    await user.changeLanguage(data);

    const lang = new Language(message);
    let language = await lang.select();

    ctx.telegram.sendMessage(
      message.chat.id,
      `${language.changeLanguage.response}`
    );
  }

  async textResponse(ctx) {
    const message = ctx.message;
    // ctx.telegram.sendPhoto(message.chat.id, gifts.bowlOfRice);
    // ctx.telegram.sendMessage(message.chat.id, message.text);
    console.log(message);
  }

  async stickerResponse(ctx) {
    const message = ctx.message;
    const stickerId = message.sticker.file_unique_id;

    if (!checkData.check(message)) return;

    const user = new User(message);

    if (stickerId === "AgADCR4AAmyzMUo") {
      await user.update(20, "receiver"); // +20 social credit
    } else if (stickerId === "AgADwRwAArziMUo") {
      await user.update(-20, "receiver"); // -20 social credit
    } else if (stickerId === "AgAD4hcAAjgHOUo") {
      await user.update(15, "receiver"); // +15 social credit
    } else if (stickerId === "AgADzxYAAh5YOEo") {
      await user.update(-15, "receiver"); // -15 social credit
    } else if (stickerId === "AgAD7BgAAs2SOUo") {
      await user.update(-30, "receiver"); // -30 social credit
    }
    // ctx.telegram.sendSticker(
    //   message.chat.id,
    //   "https://tlgrm.eu/_/stickers/c6c/262/c6c262f6-4406-3396-87a6-25b50e3f89a3/192/5.webp"
    // );

    const userData = await user.get("receiver");
    if (!userData) return;

    const gifts = new Gifts(ctx, message, userData);
    await gifts.gift();
  }

  async aboba(ctx) {
    const message = ctx.message;
    const user = new User(message);
    user.aboba();
  }
};
