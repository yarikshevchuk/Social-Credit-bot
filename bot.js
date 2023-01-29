const { Telegraf, Scenes, session } = require("telegraf");
const Functions = require("./functions");
const dotenv = require("dotenv").config();
const mongoose = require("mongoose");

const token = dotenv.parsed.TOKEN;
const bot = new Telegraf(token); //сюда помещается токен, который дал botFather
const functions = new Functions();
const promocode = new Scenes.BaseScene("promocode");
const stage = new Scenes.Stage([promocode]);

bot.use(session());
bot.use(stage.middleware());

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO); // connecting to the database
    console.log("Connection completed");
  } catch (error) {
    console.log("Failed to connect to MongoDB", error);
  }
};

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
bot.command("aboba", async (ctx) => {
  await functions.aboba(ctx);
});

// members rating command
bot.command("members_social_credit", async (ctx) => {
  await functions.membersSocialCredit(ctx);
});

// command sending language
bot.command("language", async (ctx) => {
  await functions.chooseLanguage(ctx);
});

// login command
bot.command("login", async (ctx) => {
  await functions.login(ctx);
});

// asking user to enter promocode: 1st part
promocode.enter(async (ctx) => {
  await functions.enterPromocode(ctx);
});

// handling entered data: 2nd part
promocode.on("text", async (ctx) => {
  // validate
  await functions.handlePromocode(ctx);

  return ctx.scene.leave();
});

// declaring the command to enter a promocode: 3rd part
bot.command("enter_promocode", (ctx) => ctx.scene.enter("promocode"));

// reacting to a user chosing one of the buttons
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

bot.catch((err) => {
  console.log("Ooops", err);
});

connectDB();
bot.launch();
