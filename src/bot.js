const { Telegraf, Scenes, session, TelegramError } = require("telegraf");
const Functions = require("./functions");
const dotenv = require("dotenv").config();
const mongoose = require("mongoose");
require("./automatedTasks/index");

const token = dotenv.parsed.TOKEN;
const bot = new Telegraf(token); // there we place a token from bot father
const functions = new Functions();
const promocode = new Scenes.BaseScene("promocode");
const stage = new Scenes.Stage([promocode]);

bot.use(session());
bot.use(stage.middleware());

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO); // connecting to the database
    console.log("Connected to DB");
  } catch (error) {
    console.log("Failed to connect to MongoDB", error);
  }
};

// Bot start command
bot.command("start", async (ctx) => {
  try {
    await functions.start(ctx);
  } catch (error) {
    console.log(error);
  }
});

// Help command
bot.command("help", async (ctx) => {
  try {
    await functions.help(ctx);
  } catch (error) {
    console.log(error);
  }
});

// Your rating command
bot.command("my_social_credit", async (ctx) => {
  try {
    await functions.mySocialCredit(ctx);
  } catch (error) {
    console.log(error);
  }
});

// admin commands
bot.command("aboba", async (ctx) => {
  try {
    await functions.aboba(ctx);
  } catch (error) {
    console.log(error);
  }
});

bot.command("delete_other_me", async (ctx) => {
  try {
    await functions.deleteOtherMe(ctx);
  } catch (error) {
    console.log(error);
  }
});

bot.command("share_my_data", async (ctx) => {
  try {
    await functions.shareMyData(ctx);
  } catch (error) {
    console.log(error);
  }
});

// members rating command
bot.command("members_social_credit", async (ctx) => {
  try {
    await functions.membersSocialCredit(ctx);
  } catch (error) {
    console.log(error);
  }
});

// command sending language
bot.command("language", async (ctx) => {
  try {
    await functions.chooseLanguage(ctx);
  } catch (error) {
    console.log(error);
  }
});

// reacting to a user chosing one of the buttons
bot.on("callback_query", async (ctx) => {
  try {
    await functions.changeLanguage(ctx);
  } catch (error) {
    console.log(error);
  }
});

// login command
bot.command("login", async (ctx) => {
  try {
    await functions.login(ctx);
  } catch (error) {
    console.log(error);
  }
});

// asking user to enter promocode: 1st part
promocode.enter(async (ctx) => {
  try {
    await functions.enterPromocode(ctx);
  } catch (error) {
    console.log(error);
  }
});

// handling entered data: 2nd part
promocode.on("text", async (ctx) => {
  try {
    await functions.handlePromocode(ctx);
    return ctx.scene.leave();
  } catch (error) {
    console.log(error);
  }
});

// declaring the command to enter a promocode: 3rd part
bot.command("enter_promocode", async (ctx) => {
  try {
    await ctx.scene.enter("promocode");
  } catch (error) {
    console.log(error);
  }
});

// reacting to a sticker
bot.on("sticker", async (ctx) => {
  try {
    functions.stickerResponse(ctx);
  } catch (error) {
    console.log(error);
  }
});

// reacting to a message
bot.on("message", async (ctx) => {
  try {
    await functions.messageResponse(ctx);
  } catch (error) {
    console.log(error);
  }
});

bot.catch((err, ctx) => {
  console.error(`Ooops, encountered an error for ${ctx.updateType}`, err);
});
bot.launch();
connectDB();
