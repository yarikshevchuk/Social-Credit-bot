const { Telegraf } = require("telegraf");
const { MongoClient } = require("mongodb");
const Functions = require("./functions");
const dotenv = require("dotenv").config({
  path: `${__dirname}/.env`,
});

const client = new MongoClient(dotenv.parsed.MONGO);
const token = dotenv.parsed.TOKEN;
const bot = new Telegraf(token); //сюда помещается токен, который дал botFather

const start = async () => {
  try {
    await client.connect(); // Here we connect to the database and to the tables
    const users = client.db().collection("users");
    const chats = client.db().collection("chats");
    const functions = new Functions(chats, users);
    console.log("Connection completed");

    // Bot start command
    bot.command("start", async (ctx) => {
      await functions.start(ctx);
    });

    // Help command
    bot.command("help", async (ctx) => {
      await functions.help(ctx);
    });

    // Your rating command
    bot.command("my_social_credit", async (ctx) => {
      await functions.mySocialCredit(ctx);
    });

    // members rating command
    bot.command("members_social_credit", async (ctx) => {
      await functions.membersSocialCredit(ctx);
    });

    // test command
    bot.command("aboba", async (ctx) => {
      await functions.aboba(ctx);
    });

    // reacting to a message
    bot.on("text", async (ctx) => {
      await functions.textResponse(ctx);
    });

    // reacting to a sticker
    bot.on("sticker", async (ctx) => {
      functions.stickerResponse(ctx);
    });
  } catch (error) {
    console.log(error);
  }
};

start();
bot.launch();
