const { Telegraf } = require("telegraf");
const { MongoClient } = require("mongodb");
const User = require("./user");
const checkData = require("./data-check");
const gifts = require("./gifts");
const dotenv = require("dotenv").config({
  path: `${__dirname}/.env`,
});

const client = new MongoClient(dotenv.parsed.MONGO);
const token = dotenv.parsed.TOKEN;
const bot = new Telegraf(token); //сюда помещается токен, который дал botFather
const stickersLink = "https://t.me/addstickers/SocialCreditCounterStickers";

const start = async () => {
  try {
    await client.connect(); // Here we connect to the database and to the tables
    const users = client.db().collection("users");
    const chats = client.db().collection("chats");
    console.log("Connection completed");

    bot.command("start", async (ctx) => {
      // Bot start command
      const message = ctx.message;
      const user = new User(chats, users, message);
      const userData = await user.get();

      let response = "User already exists";
      console.log(userData);
      if (!userData) {
        await user.add(0);
        response = "User added";
      }

      ctx.telegram.sendMessage(message.chat.id, response);
    });

    bot.command("help", async (ctx) => {
      // Help command
      const message = ctx.message;

      let response = ` To use this bot you have to install the stickers by the link: \n${stickersLink} \nThen just reply to the message of a person, whose social rating you want to change, using an appropriate sticker `;

      ctx.telegram.sendMessage(message.chat.id, response);
    });

    bot.command("my_social_credit", async (ctx) => {
      const message = ctx.message;

      const user = new User(chats, users, message);
      const userData = await user.get();

      ctx.telegram.sendMessage(
        message.chat.id,
        `Your rating is ${userData.rating}`,
        {
          reply_to_message_id: message.message_id,
        }
      );
    });

    bot.command("members_social_credit", async (ctx) => {
      const message = ctx.message;

      if (message.chat.type === "private") {
        ctx.telegram.sendMessage(
          message.chat.id,
          "This command has been created for group chats."
        );
        return;
      }
      const user = new User(chats, users, message);
      await user.sortUsers();
      const usersList = await user.getUsers();
      const output = await user.printUsers(usersList);

      ctx.telegram.sendMessage(message.chat.id, `${output}`);
    });

    bot.command("release", async (ctx) => {
      const message = ctx.message;

      if (message.chat.type === "private") return;

      await ctx.telegram.sendMessage(
        message.chat.id,
        "Thank you for your kindness"
      );
      ctx.telegram.leaveChat(message.chat.id);
    });

    bot.on("text", async (ctx) => {
      const message = ctx.message;
      // ctx.telegram.sendPhoto(message.chat.id, gifts.bowlOfRice);
      ctx.telegram.sendMessage(message.chat.id, message.text);
      console.log(message.text, message.from);
    });

    bot.on("sticker", async (ctx) => {
      const message = ctx.message;
      const stickerId = message.sticker.file_unique_id;
      // console.log(stickerId);

      if (!checkData.check(message)) return;

      const user = new User(chats, users, message);

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
    });
  } catch (error) {
    console.log(error);
  }
};

start();
bot.launch();
