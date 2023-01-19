const { Telegraf } = require("telegraf");
const Functions = require("./functions");
const dotenv = require("dotenv").config({
  path: `${__dirname}/.env`,
});

const token = dotenv.parsed.TOKEN;
const bot = new Telegraf(token); //сюда помещается токен, который дал botFather

bot.catch((err) => {
  console.log("Ooops", err);
});

const start = async () => {
  try {
    const functions = new Functions();
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

    // command for testing
    // bot.command("aboba", async (ctx) => {
    //   await functions.aboba(ctx);
    // });

    // members rating command
    bot.command("members_social_credit", async (ctx) => {
      await functions.membersSocialCredit(ctx);
    });

    bot.command("language", async (ctx) => {
      await functions.language(ctx);
    });

    bot.command("login", async (ctx) => {
      await functions.login(ctx);
    });

    bot.on("callback_query", async (ctx) => {
      await functions.changeLanguage(ctx);
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
