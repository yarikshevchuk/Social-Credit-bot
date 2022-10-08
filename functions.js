const stickersLink = "https://t.me/addstickers/SocialCreditCounterStickers";
const User = require("./user");
const checkData = require("./data_check");
const gifts = require("./gifts");

module.exports = class Functions {
  constructor(chats, users) {
    this.chats = chats;
    this.users = users;
  }

  async start(ctx) {
    const message = ctx.message;
    const user = new User(this.chats, this.users, message);
    const userData = await user.get();

    let response = "User already exists";
    if (!userData) {
      await user.add(0);
      response = "User added";
    }

    ctx.telegram.sendMessage(message.chat.id, response);
  }

  async help(ctx) {
    const message = ctx.message;

    let response = ` To use this bot you have to install the stickers by the link: \n${stickersLink} \nThen just reply to the message of a person, whose social rating you want to change, using an appropriate sticker `;

    ctx.telegram.sendMessage(message.chat.id, response);
  }

  async mySocialCredit(ctx) {
    const message = ctx.message;

    const user = new User(this.chats, this.users, message);
    let userData = await user.get();

    if (!userData) {
      await user.add(0);
      userData = await user.get();
    }

    ctx.telegram.sendMessage(
      message.chat.id,
      `Your rating is ${userData.currentRating || 0}`,
      {
        reply_to_message_id: message.message_id,
      }
    );
  }

  async membersSocialCredit(ctx) {
    const message = ctx.message;

    if (message.chat.type === "private") {
      ctx.telegram.sendMessage(
        message.chat.id,
        "This command has been created for group chats."
      );
      return;
    }
    const user = new User(this.chats, this.users, message);
    await user.sortUsers();
    const usersList = await user.getUsers();
    const output = await user.printUsers(usersList);

    ctx.telegram.sendMessage(message.chat.id, `${output}`);
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

    const user = new User(this.chats, this.users, message);

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
  }

  async aboba(ctx) {
    const message = ctx.message;
    const user = new User(this.chats, this.users, message);
    // user.addViaSchema();
    user.searchViaSchema();
  }
};
