const { Telegraf } = require("telegraf");
const { MongoClient } = require("mongodb");
const {
  addUser,
  updateUser,
  getUser,
  getUsers,
  printUsers,
  checkData,
} = require("./data-processing");
const gifts = require("./gifts");

const client = new MongoClient(
  "mongodb+srv://shev:O8iN0WiRrFmaABqJ@cluster0.9rwd1.mongodb.net/?retryWrites=true&w=majority"
);
const token = "5316252619:AAE1xCBgF8z4Ra-0DTvZY-QhcIdAZP3Xy_k";
const bot = new Telegraf(token); //сюда помещается токен, который дал botFather
const stickersLink = "";

const start = async () => {
  try {
    await client.connect();
    const users = client.db().collection("users");
    const chats = client.db().collection("chats");
    console.log("Connection completed");

    bot.command("start", async (ctx) => {
      const message = ctx.message;

      const user = await getUser(users, message);
      let response = "User already exists";

      if (!user) {
        await addUser(chats, users, message, 0);
        response = "User added";
      }

      ctx.telegram.sendMessage(message.chat.id, response);
    });

    bot.command("help", async (ctx) => {
      const message = ctx.message;

      let response =
        " To use this bot you have to install the stickers by the link: \nhttps://t.me/addstickers/SocialCreditCounterStickers \nThen just reply to the message of a person, whose social rating you want to change, using an appropriate sticker ";

      ctx.telegram.sendMessage(message.chat.id, response);
    });

    bot.command("n", async (ctx) => {
      const message = ctx.message;

      ctx.telegram.sendMessage(message.chat.id, "nigga");
    });

    bot.command("my_social_credit", async (ctx) => {
      const message = ctx.message;

      let user = await getUser(users, message);

      ctx.telegram.sendMessage(
        message.chat.id,
        `Your rating is ${user.rating}`,
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

      const usersList = await getUsers(chats, users, message);
      const output = await printUsers(usersList);

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
      ctx.telegram.sendPhoto(message.chat.id, gifts.bowlOfRice);
      console.log(message.text, message.from);
      // console.log(message);
    });

    bot.on("sticker", async (ctx) => {
      const message = ctx.message;
      const stickerId = message.sticker.file_unique_id;
      console.log(stickerId);

      if (!checkData(message)) return;

      if (stickerId === "AgADCR4AAmyzMUo") {
        await updateUser(chats, users, message, 20); // +20 social credit
      } else if (stickerId === "AgADwRwAArziMUo") {
        await updateUser(chats, users, message, -20); // -20 social credit
      } else if (stickerId === "AgAD4hcAAjgHOUo") {
        await updateUser(chats, users, message, 15); // +15 social credit
      } else if (stickerId === "AgADzxYAAh5YOEo") {
        await updateUser(chats, users, message, -15); // -15 social credit
      } else if (stickerId === "AgAD7BgAAs2SOUo") {
        await updateUser(chats, users, message, -30); // -30 social credit
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

